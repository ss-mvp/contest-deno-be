const DateTime = require('luxon').DateTime;

const rumbleSections = [
  {
    rumbleId: 1,
    sectionId: 1,
    end_time: DateTime.utc().minus({ day: 1 }),
    phase: 'COMPLETE',
  },
  {
    rumbleId: 2,
    sectionId: 1,
    end_time: DateTime.utc().minus({ hour: 1 }),
    phase: 'FEEDBACK',
  },
  { rumbleId: 3, sectionId: 1 },
];

async function seed_rumble_sections(knex) {
  await knex('rumble_sections').insert(rumbleSections);
}

module.exports = { seed_rumble_sections };
