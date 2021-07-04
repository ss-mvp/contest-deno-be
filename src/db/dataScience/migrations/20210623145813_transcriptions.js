exports.up = function (knex) {
  return knex.schema.createTable('transcriptions', (t) => {
    t.increments('id');
    t.string('transcription', 3000);
    t.integer('sourceId')
      .unsigned()
      .notNullable()
      .references('enum_transcription_sources.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.integer('submissionId')
      .unsigned()
      .notNullable()
      .references('submissions.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('transcriptions');
};
