exports.up = function (knex) {
  return knex.schema.createTable('enum_flags', (t) => {
    t.increments('id');
    t.string('flag').unique().index();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('enum_flags');
};
