import { ISubItem } from '../../submissions';
import { IUser } from '../../users';

export interface IStudent extends INewStudent {
  id: number;
}

export interface INewStudent {
  userId: number;
  sectionId: number;
}

export interface IStudentWithSubmissions extends IUser {
  submissions: ISubItem[];
}
