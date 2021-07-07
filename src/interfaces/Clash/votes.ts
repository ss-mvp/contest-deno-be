export interface IVote extends INewVote {
  id: number;
  created_at: Date;
}

export interface INewVote {
  userId?: number;
  firstPlaceId: number;
  secondPlaceId: number;
  thirdPlaceId: number;
}
