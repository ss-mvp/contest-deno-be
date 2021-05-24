import { PutObjectResponse } from '../../deps.ts';

export interface IUploadResponse extends PutObjectResponse {
  s3Label: string;
}

export interface IProcessedDSResponse {
  transcription: string;
  confidence: number;
  score: number;
  rotation: number;
}

export type DSChecksumMap = Record<
  number,
  Pick<IDSAPIPageSubmission, 'Checksum' | 'filekey'>
>;
export interface IDSAPITextSubmissionPostBody {
  SubmissionID: number;
  StoryId: number;
  Pages: DSChecksumMap;
}

export interface IDSAPITextSubmissionResponse {
  SubmissionID: number;
  ModerationFlag: boolean;
  Confidence: number;
  SquadScore: number;
  Rotation: number;
  Transcription: string;
}

export interface IDSAPIPageSubmission extends IUploadResponse {
  filekey: string;
  Checksum: string;
}
