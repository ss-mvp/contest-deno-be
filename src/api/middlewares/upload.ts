import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { BucketService } from '../../services';

export default function uploadGenerator(...fileNames: string[]) {
  return async function uploadMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const logger: Logger = Container.get('logger');
    try {
      const bucketServiceInstance = Container.get(BucketService);
      console.log('upload handler', req.body);

      // Loop over each FormData field with file data, one file name at a time
      // for await (const fname of fileNames) {
      // Get the list of files to allow optional muiltiple upload
      // const fileArray = req.body[fname] as File[];
      //   logger.debug(
      //     `Attempting to upload ${fileArray.length} files for field: ${fname}`
      //   );

      //   // Check to ensure that the body was formatted correctly, if there was multipart file data in the
      //   // request body, it should have been converted into an array of files. If the field for the file
      //   // name we're searching for was not set, or if it's set to anything other than an array, there was
      //   // an issue with upload formatting and we throw an error early
      //   if (!fileArray || !Array.isArray(fileArray))
      //     throw HTTPError.create(400, `Could not find files in field ${fname}`);

      //   // Generate a list of fileUpload promises for every file in the given fileArray
      //   const promiseList = fileArray.map(async (fileData) => {
      //     const content = await fileData.stream().getReader().read();
      //     return bucketServiceInstance.upload(
      //       content.value,
      //       extension(fileData.contentType)
      //     );
      //   });
      //   // Generate checksums for eac h file in the given fileArray
      //   const checksumList = fileArray.map(({ content, name }) => ({
      //     Checksum: generateChecksum(content),
      //     filekey: name,
      //   }));
      //   console.log(
      //     checksumList.reduce(
      //       (prev, { Checksum }, i) => `${prev} [${i}] cksm: ${Checksum} :::::`,
      //       ':::::'
      //     )
      //   );

      //   // Resolve those promises together and replace the form data in the body with the file names
      //   const resolved = await Promise.all(promiseList);
      //   console.log(
      //     resolved.reduce(
      //       (prev, { s3Label, etag }, i) =>
      //         `${prev} [${i}] label: ${s3Label}, etag: ${etag} :::::`,
      //       ':::::'
      //     )
      //   );

      //   // Overwrite the previous fields in the body
      //   const newReqBodyEntry = resolved.map<IDSAPIPageSubmission>((r, i) => ({
      //     // Add the processed request
      //     ...r,
      //     // And then add the checksum info for DS
      //     ...checksumList[i],
      //   }));
      //   req.body[fname] = newReqBodyEntry;
      //   console.log('updated body field', newReqBodyEntry);

      //   logger.debug(
      //     `Successfully uploaded ${fileArray.length} files for field: ${fname}`,
      //     req.body[fname]
      //   );
      // }

      next();
    } catch (err) {
      logger.error(err);
      throw err;
    }
  };

  // const generateChecksum = (
  //   file: Uint8Array | string,
  //   encoding?: {
  //     input?: 'utf8' | 'hex' | 'base64';
  //     output?: 'utf8' | 'hex' | 'base64';
  //   }
  // ): string => {
  //   // Default to utf8 input and hex output
  //   const hash = sha512(
  //     file,
  //     encoding?.input ?? 'utf8',
  //     encoding?.output ?? 'hex'
  //   ).toString();
  //   return hash;
  // };
}
