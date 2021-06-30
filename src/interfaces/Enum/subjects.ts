export interface ISubject {
  id: keyof SubjectType;
  subject: SubjectType[keyof SubjectType];
}

export type SubjectType = {
  'english/language arts': 'English/Language Arts';
  math: 'Math';
  science: 'Science';
  'social studies': 'Social Studies';
  language: 'Language';
  'homeroom/advisory': 'Homeroom/Advisory';
  'interventions/online learning': 'Interventions/Online Learning';
  'technology and engineering': 'Technology/Engineering';
  'PE and health': 'PE/Health';
  'arts and music': 'Arts/Music';
  other: 'Other';
  '': 'None';
};

export enum SubjectEnum {
  'english/language arts' = 'English/Language Arts',
  math = 'Math',
  science = 'Science',
  'social studies' = 'Social Studies',
  language = 'Language',
  'homeroom/advisory' = 'Homeroom/Advisory',
  'interventions/online learning' = 'Interventions/Online Learning',
  'technology and engineering' = 'Technology/Engineering',
  'PE and health' = 'PE/Health',
  'arts and music' = 'Arts/Music',
  other = 'Other',
  '' = 'None',
}
