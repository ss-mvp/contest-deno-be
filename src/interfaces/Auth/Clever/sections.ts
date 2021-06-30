import { Grades, Subjects } from '../../Enum';
import { IRumbleWithSectionInfo } from '../../rumbles';

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
  subjectId: keyof Subjects.SubjectType;
  gradeId: keyof Grades.GradeType;
}
