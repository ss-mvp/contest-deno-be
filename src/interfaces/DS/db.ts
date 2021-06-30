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
