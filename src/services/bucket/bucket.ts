import { S3 } from 'aws-sdk';
import { Inject, Service } from 'typedi';
import { v4 } from 'uuid';
import { Logger } from 'winston';
import { env } from '../../config';
import { HTTPError } from '../../utils';

@Service()
export default class BucketService {
  constructor(
    @Inject('s3') private s3: S3,
    @Inject('logger') private logger: Logger
  ) {}

  public async upload(buffer: Uint8Array, extension?: string) {
    try {
      if (!extension)
        throw HTTPError.create(400, `Could not get file extension`);
      if (!this.isValidFileType(extension))
        throw HTTPError.create(422, 'Unsupported file type');

      // Generate a unique label for the s3 bucket
      const s3Label = new URLSearchParams({
        name: Date.now() + '-' + v4() + '.' + extension,
      }).get('name');
      this.logger.debug(`Bucket tag generated for ${s3Label}`);

      this.logger.debug(`Beginning upload of ${s3Label}`);
      const response = await this.s3
        .upload({
          Bucket: env.S3_BUCKET,
          Key: `${s3Label}`,
          Body: buffer,
        })
        .promise();
      this.logger.debug(
        `Upload file (${s3Label}) successful (ETAG: ${response.ETag})`
      );

      return { ...response, s3Label };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async get(name: string, etag: string) {
    this.logger.debug(`Attempting to retrieve bucket item ${name}`);
    const response = await this.s3
      .getObject({
        Bucket: env.S3_BUCKET,
        Key: name,
        IfMatch: etag,
        ResponseContentType: 'arrayBuffer',
      })
      .promise();

    if (response) {
      this.logger.debug(`Retrieved ${name} from S3 successfully`);
      return response;
    } else {
      throw HTTPError.create(404, `Could not find ${name} in S3 bucket`);
    }
  }

  public async remove(name: string) {
    try {
      this.logger.debug(`Attempting to remove ${name} from the bucket`);

      const response = await this.s3
        .deleteObject({
          Bucket: env.S3_BUCKET,
          Key: name,
        })
        .promise();
      if (!response.DeleteMarker) {
        this.logger.crit(`File with name ${name} is untracked`);
      } else {
        this.logger.debug(`File ${name} successfully deleted`);
      }
    } catch (err) {
      this.logger.crit(err);
      throw err;
    }
  }

  private isValidFileType(extension: string) {
    const allowedExtensions = ['jpg', 'png', 'jpeg'];
    return allowedExtensions.includes(extension);
  }
}
