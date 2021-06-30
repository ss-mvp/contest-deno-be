export type RumblePhases = 'WAITING' | 'WRITING' | 'FEEDBACK' | 'COMPLETE';

// TODO update this to include full section instead of this, requires a lot of fe/be work
export interface IRumbleWithSectionInfo extends IRumble {
  sectionName: string;
  sectionId: number;
}

export interface IRumble extends INewRumble {
  id: number;
  created_at: Date;
  end_time?: Date;
  phase: RumblePhases;
  start_time?: Date;
}

export interface INewRumble extends Omit<IRumblePostBody, 'start_time'> {
  canJoin: boolean;
  joinCode: string;
  maxSections: number;
}

export interface IRumblePostBody {
  numMinutes: number;
  promptId: number;
  start_time?: Date;
}
