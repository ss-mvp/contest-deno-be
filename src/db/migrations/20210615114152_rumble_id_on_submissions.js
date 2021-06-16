// deno-lint-ignore-file
exports.up = function (knex) {
  return knex.schema.table('submissions', (t) => {
    t.integer('rumbleId')
      .nullable()
      .unsigned()
      .references('rumbles.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
  });
};

exports.down = function (knex) {
  return knex.schema.table('submissions', (t) => {
    t.dropForeign('rumbleId');
    t.dropColumn('rumbleId');
  });
};
