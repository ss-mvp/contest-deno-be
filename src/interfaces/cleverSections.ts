import { CleverGradeType, CleverSubjectType } from '../../deps';
import { Grades } from './enumGrades';
import { Subjects } from './enumSubjects';
import { IRumbleWithSectionInfo } from './rumbles';

export interface ISectionWithRumbles extends ISection {
  rumbles: IRumbleWithSectionInfo[];
}
export interface ISection extends INewSection {
  id: number;
}

export interface INewSection extends ISectionPostBody {
  active: boolean;
  joinCode: string;
}

export interface ISectionPostBody {
  name: string;
  subjectId: Subjects | CleverSubjectType;
  gradeId: Grades | CleverGradeType;
}
