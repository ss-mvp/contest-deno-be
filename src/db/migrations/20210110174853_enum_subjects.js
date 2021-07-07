exports.up = function (knex) {
  return knex.schema.createTable('enum_subjects', (t) => {
    t.string('id').unique().index().primary();
    t.string('subject', 30).notNullable().unique().index();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('enum_subjects');
};
