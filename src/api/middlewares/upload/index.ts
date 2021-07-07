import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { HTTPError } from '../../../utils';
import { parseForm, uploadFile } from './helpers';

interface IUploadMiddlewareGeneratorOptions {
  fileLimit?: number;
}

/**
 * Adds fields to the request body for the different files uploaded
 * @param fileNames a list of string keys to search the form data for
 * @returns Express middleware that handles file uploads to S3
 */
export default function fileUploadMiddleware__generator<
  Param = Record<string, unknown>,
  Res = Record<string, unknown>,
  Req = Record<string, unknown>,
  Query = Record<string, unknown>
>(...options: (IUploadMiddlewareGeneratorOptions | string)[]) {
  return async function fileUploadMiddleware(
    req: Request<Param, Res, Req, Query>,
    res: Response<Res>,
    next: NextFunction
  ) {
    let optionObj: IUploadMiddlewareGeneratorOptions = {};
    const fileNames: string[] = [];

    options.forEach((op) => {
      // Strings will restrict field names
      if (typeof op === 'string') fileNames.push(op);
      // Objects will set various options
      else optionObj = Object.assign(optionObj, op);
    });

    // Get services from our Container layer
    const logger: Logger = Container.get('logger');

    try {
      // Use our promisified wrapper around the form parser for linting and readability
      const { fields, files } = await parseForm(req);

      // Get an array of filenames and filter to keep only the ones specified in generator params
      const fileKeys = Object.keys(files).filter((fname) =>
        fileNames.includes(fname)
      );

      // Check each field, and upload however many files were in each input
      for await (const fname of fileKeys) {
        // Get the list of files to allow optional muiltiple upload
        const fileArray = files[fname];

        // Check if there's a file limit
        if (optionObj.fileLimit && fileArray.length > optionObj.fileLimit) {
          // If we exceed the limit, throw an error
          throw HTTPError.create(400, {
            message: 'File limit exceeded',
            field: fname,
            limit: optionObj.fileLimit,
          });
        }
        logger.debug(
          `Attempting to upload ${fileArray.length} files for field: ${fname}`
        );

        if (!fileArray)
          throw HTTPError.create(400, `Could not find files in field ${fname}`);

        // Generate and resolve list of fileUpload promises for every file in the given fileArray
        const promiseList = fileArray.map(uploadFile);
        const resolved = await Promise.all(promiseList); // These have checksums already!

        // Add the upload responses (with checksums) back into the body
        req.body = Object.assign(req.body, { [fname]: resolved });

        logger.debug(
          `Successfully uploaded ${fileArray.length} files for field: ${fname}`,
          resolved
        );
      }

      // If the upload succeeds, add the other input fields to the request
      req.body = Object.assign(req.body, fields);

      next();
    } catch (err) {
      logger.error(err);
      next(err);
    }
  };
}
