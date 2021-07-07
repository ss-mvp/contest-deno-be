const teachers = [
  { userId: 4, sectionId: 1, primary: true },
  { userId: 4, sectionId: 2, primary: true },
];

async function seed_clever_teachers(knex) {
  await knex('clever_teachers').insert(teachers);
}

module.exports = { seed_clever_teachers };
