const { seed_rumble_feedback } = require('../seedFiles/18_rumble_feedback');

exports.seed = async function (knex) {
  await seed_rumble_feedback(knex);
};
