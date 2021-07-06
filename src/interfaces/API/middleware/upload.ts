import AWS from 'aws-sdk';

export interface IFileChecksum {
  filekey: string;
  Checksum: string;
}

export interface IResponse extends AWS.S3.ManagedUpload.SendData {
  s3Label: string;
}

export interface IResponseWithChecksum extends IResponse, IFileChecksum {}
