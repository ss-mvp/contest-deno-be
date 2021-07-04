const { seed_top3 } = require('../seedFiles/06_top3');
const { seed_winners } = require('../seedFiles/07_winners');

exports.seed = async function (knex) {
  await seed_top3(knex);
  await seed_winners(knex);
};
