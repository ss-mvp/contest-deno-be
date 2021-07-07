const sections = [
  {
    name: 'Reuben - English 1A Per 3',
    joinCode: 'thisisatestjoincode',
    subjectId: 'english/language arts',
    gradeId: '12',
  },
  {
    name: 'Reuben - English 1A Per 5',
    joinCode: 'thisisanothertestjoincode',
    subjectId: 'english/language arts',
    gradeId: '12',
  },
];

async function seed_clever_sections(knex) {
  await knex('clever_sections').insert(sections);
}

module.exports = { seed_clever_sections };
