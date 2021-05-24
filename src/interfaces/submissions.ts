import { IProcessedDSResponse } from './dsServiceTypes.ts';

export interface ISubItem {
  id: number;
  userId: number;
  codename: string;
  src: string;
  rotation: number;
  prompt: string;
  score: number;
}

export interface ISubmission extends INewSubmission {
  id: number;
  created_at: Date;
}

export interface INewSubmission extends IProcessedDSResponse {
  s3Label: string;
  etag: string;
  userId: number;
  promptId: number;
  sourceId?: number;
}
