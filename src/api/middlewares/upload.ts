import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import fileType from 'file-type';
import fs from 'fs';
import multiparty, { File } from 'multiparty';
import Container from 'typedi';
import { Logger } from 'winston';
import { API } from '../../interfaces';
import { BucketService } from '../../services';
import { HTTPError } from '../../utils';

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
>(...fileNames: string[]) {
  return async function authHandlerMiddleware(
    req: Request<Param, Res, Req, Query>,
    res: Response<Res>,
    next: NextFunction
  ) {
    // Get services from our Container layer
    const logger: Logger = Container.get('logger');

    try {
      // Use our promisified wrapper around the form parser for linting and readability
      const { fields, files } = await parseForm(req);

      // Add the parsed fields into the body
      req.body = Object.assign(req.body, fields);

      // Get an array of filenames and filter to keep only the ones specified in generator params
      const fileKeys = Object.keys(files).filter((fname) =>
        fileNames.includes(fname)
      );

      // Check each field, and upload however many files were in each input
      for await (const fname of fileKeys) {
        // Get the list of files to allow optional muiltiple upload
        const fileArray = files[fname];
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
        console.log('updated body field', resolved);

        logger.debug(
          `Successfully uploaded ${fileArray.length} files for field: ${fname}`,
          resolved
        );
      }

      next();
    } catch (err) {
      logger.error(err);
      throw err;
    }
  };
}

function generateChecksum(
  file: Uint8Array | string,
  algorithm = 'sha512',
  encoding: crypto.BinaryToTextEncoding = 'hex'
): string {
  // Default to utf8 input and hex output
  const hash = crypto.createHash(algorithm).update(file).digest(encoding);
  return hash;
}

/**
 * Promisify the form parser for better code readability
 */
async function parseForm(req: Parameters<multiparty.Form['parse']>[0]) {
  // Create a new promise to wrap the callback
  const [fields, files] = await new Promise<
    [Record<string, string[]>, Record<string, File[]>]
  >((resolve, reject) => {
    // Initialize a new form object
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
      if (err) {
        const logger: Logger = Container.get('logger');
        logger.error('Error parsing form', err);
        reject(err);
      } else {
        resolve([fields, files]);
      }
    });
  });
  return { fields, files };
}

async function uploadFile(
  file: File
): Promise<API.middleware.upload.IResponseWithChecksum> {
  const bucketServiceInstance = Container.get(BucketService);
  const buffer = fs.readFileSync(file.path);
  const ext = await fileType.fromBuffer(buffer);
  const checksum = generateChecksum(buffer);
  const res = await bucketServiceInstance.upload(buffer, ext?.ext);

  if (!res.s3Label) console.log('no s3 label for', res.Key, { etag: res.ETag });

  return {
    Bucket: res.Bucket,
    Checksum: checksum,
    ETag: res.ETag,
    Key: res.Key,
    Location: res.Location,
    filekey: res.Key,
    s3Label: res.s3Label || res.Key,
  };
}
