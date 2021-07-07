const subjects = [
  { id: 'english/language arts', subject: 'English/Language Arts' },
  { id: 'math', subject: 'Math' },
  { id: 'science', subject: 'Science' },
  { id: 'social studies', subject: 'Social Studies' },
  { id: 'language', subject: 'Language' },
  { id: 'homeroom/advisory', subject: 'Homeroom/Advisory' },
  {
    id: 'interventions/online learning',
    subject: 'Interventions/Online Learning',
  },
  { id: 'technology and engineering', subject: 'Technology/Engineering' },
  { id: 'PE and health', subject: 'PE/Health' },
  { id: 'arts and music', subject: 'Arts/Music' },
  { id: 'other', subject: 'Other' },
  // TODO fix this
  { id: '', subject: 'None' },
];

async function seed_enum_subjects(knex) {
  await knex('enum_subjects').insert(subjects);
}

module.exports = { seed_enum_subjects };
