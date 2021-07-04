exports.up = function (knex) {
  return knex.schema.createTable('enum_grades', (t) => {
    t.string('id').unique().index().primary();
    t.string('grade', 30).notNullable().unique().index();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('enum_grades');
};
