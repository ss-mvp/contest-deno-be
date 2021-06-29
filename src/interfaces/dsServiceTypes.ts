import { PutObjectResponse } from '../../deps';

export interface IUploadResponse extends PutObjectResponse {
  s3Label: string;
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
  Confidence: number; // Is a FLOAT
  SquadScore: number; // IS A FLOAT
  Rotation: number;
  Transcription: string;
}

export interface IDSAPIPageSubmission extends IUploadResponse {
  filekey: string;
  Checksum: string;
}

export interface IDSSubmissionTableRow {
  Confidence?: number;
  SquadScore?: number;
  Rodation?: number;
  ModerationFlag?: boolean;
}

export interface IDSTranscriptionTableRow {
  transcription?: string;
  transcriptionSourceId?: number & DSTranscriptionSources;
}

export enum DSTranscriptionSources {
  DS = 1,
  iOS = 2,
}
