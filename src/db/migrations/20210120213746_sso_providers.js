exports.up = function (knex) {
  return knex.schema.createTable('sso_providers', (t) => {
    t.increments('id');
    t.string('provider', 20);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('sso_providers');
};
