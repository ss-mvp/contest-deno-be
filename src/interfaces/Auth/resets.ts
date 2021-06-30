export interface IReset extends INewReset {
  id: number;
  completed: boolean;
  created_at: Date;
  expires_at: Date;
}

export interface INewReset {
  code: string;
  userId: number;
}
