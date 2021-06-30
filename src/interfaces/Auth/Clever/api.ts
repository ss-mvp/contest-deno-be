export interface IProfile {
  data: {
    id: string;
    email?: string;
    name: { first: string; last: string; middle?: string };
    district?: string;
  };
  links: ILink[];
}

export interface ILink {
  rel: string;
  uri: string;
}

export interface IUserInfo<UserType extends roles = roles> {
  type: UserType;
  data: {
    id: string;
    district: string;
    type: UserType;
    authorized_by: string;
  };
  links: ILink[];
}

export type roles = 'teacher' | 'student';

export type subjects =
  | 'english/language arts'
  | 'math'
  | 'science'
  | 'social studies'
  | 'language'
  | 'homeroom/advisory'
  | 'interventions/online learning'
  | 'technology and engineering'
  | 'PE and health'
  | 'arts and music'
  | 'other'
  | '';

export type grades =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | '13'
  | 'PreKindergarten'
  | 'TransitionalKindergarten'
  | 'Kindergarten'
  | 'InfantToddler'
  | 'Preschool'
  | 'PostGraduate'
  | 'Ungraded'
  | 'Other'
  | '';
