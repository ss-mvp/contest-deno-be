const sources = [{ source: 'FDSC' }, { source: 'Rumble' }];

async function seed_source_enum(knex) {
  // Deletes ALL existing entries
  await knex('enum_sources').insert(sources);
}

module.exports = { seed_source_enum };
