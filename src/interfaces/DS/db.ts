import { Sources } from '../Enum';

export interface IDSSubmissionTableRow {
  Confidence?: number;
  SquadScore?: number;
  Rodation?: number;
  ModerationFlag?: boolean;
}

export interface IDSTranscriptionTableRow {
  transcription?: string;
  transcriptionSourceId?: number & Sources.DsTrscSrcEnum;
}
