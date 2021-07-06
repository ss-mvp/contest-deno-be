import crypto from 'crypto';
import fileType from 'file-type';
import fs from 'fs';
import multiparty, { File } from 'multiparty';
import Container from 'typedi';
import { Logger } from 'winston';
import { API } from '../../../interfaces';
import { BucketService } from '../../../services';
import { HTTPError } from '../../../utils';

/** The transactional function that actually does the upload heavy lifting */
export async function uploadFile(
  file: File
): Promise<API.middleware.upload.IResponseWithChecksum> {
  try {
    // First, we get a a connection to our bucket service and logger
    const bucketServiceInstance = Container.get(BucketService);
    const logger: Logger = Container.get('logger');
    // Then, we read the file
    const buffer = fs.readFileSync(file.path);
    // Get the file type
    const type = await fileType.fromBuffer(buffer);
    // Generate a checksum for verification
    const checksum = generateChecksum(buffer);
    // Upload our image to the S3 bucket!
    const res = await bucketServiceInstance.upload(buffer, type?.ext);

    // What is the implication of this? I'm unsure
    if (!res.s3Label)
      logger.warn('no s3 label for', res.Key, { etag: res.ETag });

    return {
      Bucket: res.Bucket,
      Checksum: checksum,
      ETag: res.ETag,
      Key: res.Key,
      Location: res.Location,
      filekey: res.Key,
      s3Label: res.s3Label || res.Key,
    };
  } catch (err) {
    if (typeof err === 'string') {
      err = new Error(err);
    }
    if (err instanceof Error) {
      // Handle specific errors
      if (err.message === 'Could not get file extension') {
        throw HTTPError.create(400, {
          message: 'Unable to process file',
          hint: 'Was a file selected?',
        });
      }
    }
    throw err;
  }
}

/**
 * Promisify the form parser for better code readability
 */
export async function parseForm(req: Parameters<multiparty.Form['parse']>[0]) {
  // Create a new promise to wrap the callback
  const { fields, files } = await new Promise<{
    fields: Record<string, string>;
    files: Record<string, File[]>;
  }>((resolve, reject) => {
    // Initialize a new form object
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
      if (err) {
        const logger: Logger = Container.get('logger');
        logger.error('Error parsing form');
        logger.error(err);
        reject(err);
      } else {
        resolve({ fields: parseFields(fields), files });
      }
    });
  });
  return { fields, files };
}

/** Generates a checksum for a file */
function generateChecksum(
  file: Uint8Array | string,
  algorithm = 'sha512',
  encoding: crypto.BinaryToTextEncoding = 'hex'
): string {
  // Default to utf8 input and hex output
  const hash = crypto.createHash(algorithm).update(file).digest(encoding);
  return hash;
}

/** Parse the non-file fields from multipart data into single strings */
function parseFields(fields: Record<string, string[]>) {
  // Pull the non-file form inputs into a hash table
  const formInputs: Record<string, string> = {};
  Object.keys(fields).forEach((inputName) => {
    formInputs[inputName] = fields[inputName].join('');
  });
  return formInputs;
}
