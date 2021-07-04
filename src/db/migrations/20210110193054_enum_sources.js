exports.up = function (knex) {
  return knex.schema.createTable('enum_sources', (t) => {
    t.increments('id');
    t.string('source').unique();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('enum_sources');
};
