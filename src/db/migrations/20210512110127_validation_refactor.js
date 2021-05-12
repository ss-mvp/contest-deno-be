// deno-lint-ignore-file
exports.up = function (knex) {
  return knex.schema
    .createTable('enum_validators', (t) => {
      t.increments('id');
      t.string('validator').unique().notNullable();
    })
    .table('validations', (t) => {
      t.integer('validatorId')
        .unsigned()
        .notNullable()
        .references('enum_validators.id')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT');
    });
};

exports.down = function (knex) {
  return knex.schema
    .table('validations', (t) => {
      t.dropColumn('validatorId');
    })
    .dropTableIfExists('enum_validators');
};
