export interface ITop3 extends INewTop3 {
  id: number;
  created_at: Date;
}

export interface INewTop3 {
  submissionId: number;
}
