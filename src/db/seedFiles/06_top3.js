const top3 = [{ submissionId: 4 }, { submissionId: 5 }, { submissionId: 6 }];

async function seed_top3(knex) {
  await knex('top3').insert(top3);
}

module.exports = { seed_top3 };
