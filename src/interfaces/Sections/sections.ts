import { Rumbles } from '..';
import { Grades, Subjects } from '../Enum';

export interface ISectionWithRumbles extends ISection {
  rumbles: Rumbles.IRumbleWithSectionInfo[];
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
  subjectId: keyof Subjects.SubjectType;
  gradeId: keyof Grades.GradeType;
}
