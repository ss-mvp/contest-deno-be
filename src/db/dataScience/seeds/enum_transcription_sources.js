exports.seed = function (knex) {
  return knex('enum_transcription_sources').insert([
    { source: 'DS' },
    { source: 'iOS' },
  ]);
};
