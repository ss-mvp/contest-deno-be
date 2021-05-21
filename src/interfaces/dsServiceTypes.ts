import { PutObjectResponse } from '../../deps.ts';

export interface IDSPageSubmission extends IUploadResponse {
  filekey: string;
  Checksum: string;
}

export interface IUploadResponse extends PutObjectResponse {
  s3Label: string;
}

export type DSChecksumMap = Record<number, IDSPageSubmission>;

export interface IDSTextSubmissionPostBody {
  SubmissionID: number;
  StoryId: number;
  Pages: DSChecksumMap;
}

export interface IDSTextSubmissionResponse {
  transcription: string;
  confidence: number;
  score: number;
  rotation: number;
}
