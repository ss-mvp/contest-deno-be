import {
  createError,
  Inject,
  log,
  S3Bucket,
  Service,
  serviceCollection,
  v4,
} from '../../deps.ts';
import { IUploadResponse } from '../interfaces/dsServiceTypes.ts';

@Service()
export default class BucketService {
  constructor(
    @Inject('s3') private s3: S3Bucket,
    @Inject('logger') private logger: log.Logger
  ) {}

  public async upload(
    buffer: Uint8Array,
    extension?: string
  ): Promise<IUploadResponse> {
    try {
      if (!extension) throw createError(400, `Could not get file extension`);
      if (!this.isValidFileType(extension))
        throw createError(422, 'Unsupported file type');
      const s3Label = new URLSearchParams({
        name: Date.now() + '-' + v4.generate() + '.' + extension,
      }).get('name') as string;
      this.logger.debug(`Bucket tag generated for ${s3Label}`);

      this.logger.debug(`Beginning upload of ${s3Label}`);
      const response = await this.s3.putObject(s3Label, buffer);
      this.logger.debug(
        `Upload file (${s3Label}) successful (ETAG: ${response.etag})`
      );

      return { ...response, s3Label };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async get(name: string, etag: string) {
    this.logger.debug(`Attempting to retrieve bucket item ${name}`);
    const response = await this.s3.getObject(name, {
      ifMatch: etag,
    });

    if (response) {
      this.logger.debug(`Retrieved ${name} from S3 successfully`);
      return response;
    } else {
      throw createError(404, `Could not find ${name} in S3 bucket`);
    }
  }

  public async remove(name: string) {
    try {
      this.logger.debug(`Attempting to remove ${name} from the bucket`);

      const response = await this.s3.deleteObject(name);
      if (!response.deleteMarker) {
        this.logger.critical(`File with name ${name} is untracked`);
      } else {
        this.logger.debug(`File ${name} successfully deleted`);
      }
    } catch (err) {
      this.logger.critical(err);
      throw err;
    }
  }

  private isValidFileType(extension: string) {
    const allowedExtensions = ['jpg', 'png', 'jpeg'];
    return allowedExtensions.includes(extension);
  }
}
serviceCollection.addTransient(BucketService);
