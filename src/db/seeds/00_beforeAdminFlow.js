const { seed_cleanup } = require('../seedFiles/00_cleanup');
const { seed_roles } = require('../seedFiles/01_roles');
const { seed_users } = require('../seedFiles/02_users');
const { seed_prompts } = require('../seedFiles/03_prompts');
const { seed_prompt_queue } = require('../seedFiles/04_prompt_queue');
const { seed_submissions } = require('../seedFiles/05_submissions');
const { seed_sso_providers } = require('../seedFiles/08_sso_providers');
const { seed_enum_subjects } = require('../seedFiles/09_enum_subjects');
const { seed_enum_grades } = require('../seedFiles/10_enum_grades');
const { seed_clever_tokens } = require('../seedFiles/11_clever_tokens');
const { seed_source_enum } = require('../seedFiles/19_enum_sources');
const { seed_validators_enum } = require('../seedFiles/20_enum_validators');

exports.seed = async function (knex) {
  await seed_cleanup(knex);
  await seed_enum_grades(knex);
  await seed_enum_subjects(knex);
  await seed_source_enum(knex);
  await seed_roles(knex);
  await seed_users(knex);
  await seed_prompts(knex);
  await seed_prompt_queue(knex);
  await seed_submissions(knex);
  await seed_sso_providers(knex);
  await seed_clever_tokens(knex);
  await seed_validators_enum(knex);
};
