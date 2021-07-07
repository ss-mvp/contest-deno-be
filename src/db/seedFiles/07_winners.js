const winner = {
  submissionId: 3,
};

async function seed_winners(knex) {
  return knex('winners').insert(winner);
}

module.exports = { seed_winners };
