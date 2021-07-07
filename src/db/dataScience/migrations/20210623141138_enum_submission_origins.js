exports.up = function (knex) {
  return knex.schema.createTable('enum_submission_origins', (t) => {
    t.increments('id');
    t.string('origin', 10).unique().notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('enum_submission_origins');
};
