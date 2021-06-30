export interface ITeacher extends INewTeacher {
  id: number;
}

export interface INewTeacher {
  userId: number;
  sectionId: number;
  primary: boolean;
}
