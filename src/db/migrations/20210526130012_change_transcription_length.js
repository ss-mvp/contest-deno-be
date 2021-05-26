// deno-lint-ignore-file
exports.up = function (knex) {
  return knex.schema.alterTable('submissions', (t) => {
    t.string('transcription', 3000).alter();
  });
};

exports.down = function (knex) {
  return knex.schema.table('submissions', (t) => {
    t.dropColumn('transcription');
  });
};
