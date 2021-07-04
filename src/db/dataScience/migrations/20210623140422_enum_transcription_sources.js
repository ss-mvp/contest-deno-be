exports.up = function (knex) {
  return knex.schema.createTable('enum_transcription_sources', (t) => {
    t.increments('id');
    t.string('source', 10).unique().notNullable(); // iOS, DS
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('enum_transcription_sources');
};
