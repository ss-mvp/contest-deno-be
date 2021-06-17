// deno-lint-ignore-file
const { seed_clever_sections } = require('../seedFiles/13_clever_sections');
const { seed_clever_teachers } = require('../seedFiles/14_clever_teachers');
const { seed_clever_students } = require('../seedFiles/15_clever_students');
const { seed_rumbles } = require('../seedFiles/16_rumbles');
const { seed_rumble_sections } = require('../seedFiles/17_rumble_sections');
const {
  seed_rumble_submissions,
} = require('../seedFiles/21_rumble_submissions');

exports.seed = async function (knex) {
  await seed_clever_sections(knex);
  await seed_clever_teachers(knex);
  await seed_clever_students(knex);
  await seed_rumbles(knex);
  await seed_rumble_submissions(knex);
  await seed_rumble_sections(knex);
};
