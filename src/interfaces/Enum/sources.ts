export interface ISource extends INewSource {
  id: number;
}

export interface INewSource {
  source: number;
}

export enum DsTrscSrcEnum {
  DS = 1,
  iOS = 2,
}

export enum SubSrcEnum {
  FDSC = 1,
  Rumble = 2,
  Monster = 3,
}
