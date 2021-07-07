import { Submissions, Users } from '..';

export interface IStudent extends INewStudent {
  id: number;
}

export interface INewStudent {
  userId: number;
  sectionId: number;
}

export interface IStudentWithSubmissions extends Users.IUser {
  submissions: Submissions.ISubItem[];
}
