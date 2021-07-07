export interface IWinner extends INewWinner {
  id: number;
  created_at: Date;
}

export interface INewWinner {
  submissionId: number;
}
