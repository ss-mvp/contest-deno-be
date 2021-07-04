const rumbles = [
  { joinCode: 'somejoinCode', numMinutes: 30, promptId: 1 },
  { joinCode: 'somejoinCode123', numMinutes: 50, promptId: 2 },
  { joinCode: 'somejoinCode123456', numMinutes: 70, promptId: 3 },
];

async function seed_rumbles(knex) {
  await knex('rumbles').insert(rumbles);
}

module.exports = { seed_rumbles };
