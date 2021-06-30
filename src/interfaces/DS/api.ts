import { middleware } from '../API';

export interface IDSAPITextSubmissionPostBody {
  SubmissionID: number;
  StoryId: number;
  Pages: Record<number, middleware.upload.IFileChecksum>;
}

export interface IDSAPITextSubmissionResponse {
  SubmissionID: number;
  ModerationFlag: boolean;
  Confidence: number; // Is a FLOAT
  SquadScore: number; // IS A FLOAT
  Rotation: number;
  Transcription: string;
}
