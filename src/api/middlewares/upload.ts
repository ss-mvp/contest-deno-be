import {
  createError,
  extension,
  FormFile,
  log,
  NextFunction,
  Request,
  Response,
  serviceCollection,
  sha512,
} from '../../../deps.ts';
import {
  DSChecksumMap,
  IDSPageSubmission,
} from '../../interfaces/dsServiceTypes.ts';
import BucketService from '../../services/bucket.ts';

export default (...fileNames: string[]) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const logger: log.Logger = serviceCollection.get('logger');
  try {
    const bucketServiceInstance = serviceCollection.get(BucketService);
    const checksums: DSChecksumMap = {};

    // Loop over each FormData field with file data, one file name at a time
    for await (const fname of fileNames) {
      // Get the list of files to allow optional muiltiple upload
      const fileArray = req.body[fname] as FormFile[];
      logger.debug(
        `Attempting to upload ${fileArray.length} files for field: ${fname}`
      );

      // Check to ensure that the body was formatted correctly, if there was multipart file data in the
      // request body, it should have been converted into an array of files. If the field for the file
      // name we're searching for was not set, or if it's set to anything other than an array, there was
      // an issue with upload formatting and we throw an error early
      if (!fileArray || !Array.isArray(fileArray))
        throw createError(400, `Could not find files in field ${fname}`);

      // Generate a list of fileUpload promises for every file in the given fileArray
      const promiseList = fileArray.map((fileData) => {
        return bucketServiceInstance.upload(
          fileData.content,
          extension(fileData.contentType)
        );
      });
      // Generate checksums for eac h file in the given fileArray
      const checksumList = fileArray.map(({ content, name }) => ({
        Checksum: generateChecksum(content),
        filekey: name,
      }));

      // Resolve those promises together and replace the form data in the body with the file names
      const resolved = await Promise.all(promiseList);

      // Overwrite the previous fields in the body
      req.body[fname] = resolved.map<IDSPageSubmission>((r, i) => ({
        // Add the processed request
        ...r,
        // And then add the checksum info for DS
        ...checksumList[i],
      }));

      logger.debug(
        `Successfully uploaded ${fileArray.length} files for field: ${fname}`,
        req.body[fname]
      );
    }

    req.body.dsChecksumMap = checksums;
    next();
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

const generateChecksum = (
  file: Uint8Array | string,
  encoding?: {
    input?: 'utf8' | 'hex' | 'base64';
    output?: 'utf8' | 'hex' | 'base64';
  }
): string => {
  // Default to utf8 input and hex output
  const hash = sha512(
    file,
    encoding?.input ?? 'utf8',
    encoding?.output ?? 'hex'
  ).toString();
  console.log({ hash });
  return hash;
};
