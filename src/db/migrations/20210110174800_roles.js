exports.up = function (knex) {
  return knex.schema.createTable('roles', (t) => {
    t.increments('id');
    t.string('role', 15).notNullable().unique().index();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('roles');
};
