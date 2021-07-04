const DateTime = require('luxon').DateTime;

const testPromptQueue = [
  {
    promptId: 1,
    starts_at: DateTime.utc().minus({ day: 2 }),
  },
  {
    promptId: 2,
    starts_at: DateTime.utc().minus({ day: 1 }),
  },
  {
    promptId: 3,
    starts_at: DateTime.utc(),
  },
  {
    promptId: 4,
    starts_at: DateTime.utc().plus({ day: 1 }),
  },
];

async function seed_prompt_queue(knex) {
  await knex('prompt_queue').insert(testPromptQueue);
}

module.exports = { seed_prompt_queue };
