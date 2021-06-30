export interface IFlag extends INewFlag {
  id: number;
}

export interface INewFlag {
  flag: string;
}

export enum FlagEnum {
  Content = 1,
}
