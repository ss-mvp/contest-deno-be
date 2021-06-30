export interface ISource extends INewSource {
  id: number;
}

export interface INewSource {
  source: SourceEnum & string;
}

export enum SourceEnum {
  FDSC = 1,
  Rumble = 2,
  Monster = 3,
}
