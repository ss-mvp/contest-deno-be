const students = [
  { userId: 6, sectionId: 1 },
  { userId: 7, sectionId: 1 },
  { userId: 8, sectionId: 1 },
  { userId: 9, sectionId: 1 },
  { userId: 10, sectionId: 1 },
];

async function seed_clever_students(knex) {
  await knex('clever_students').insert(students);
}

module.exports = { seed_clever_students };
