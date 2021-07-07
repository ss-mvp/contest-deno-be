import { RumblePhases } from './rumbles';

export interface IRumbleSections extends INewRumbleSections {
  id: number;
  created_at: Date;
  phase?: RumblePhases;
}

export interface INewRumbleSections {
  rumbleId: number;
  sectionId: number;
  start_time?: Date | string;
  end_time?: Date;
}
