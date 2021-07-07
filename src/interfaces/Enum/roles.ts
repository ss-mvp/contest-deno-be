export interface IRole extends INewRole {
  id: number;
}

export interface INewRole {
  role: RoleEnum & string;
}

export enum RoleEnum {
  user = 1,
  teacher = 2,
  admin = 3,
}
