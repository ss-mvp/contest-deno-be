exports.seed = function (knex) {
  return knex('enum_submission_origins').insert([
    { origin: 'FDSC' },
    { origin: 'Rumble' },
    { origin: 'Monster' },
  ]);
};
