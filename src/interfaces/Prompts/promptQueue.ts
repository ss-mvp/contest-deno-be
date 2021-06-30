export interface IQueueItem extends INewQueueItem {
  id: number;
}

export interface INewQueueItem {
  promptId: number;
  starts_at: Date;
}
