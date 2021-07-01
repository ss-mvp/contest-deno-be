export interface ISource extends INewSource {
  id: number;
}

export interface INewSource {
  source: SourceEnum & string;
}

export enum SourceEnum {
  DS = 1,
  iOS = 2,
}
