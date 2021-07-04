exports.up = function (knex) {
  return knex.schema.createTable('sso_lookup', (t) => {
    t.increments('id');
    t.string('accessToken').notNullable();
    t.integer('providerId')
      .unsigned()
      .notNullable()
      .references('sso_providers.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.integer('userId')
      .unsigned()
      .notNullable()
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.unique(['accessToken', 'providerId']);
    t.unique(['userId', 'providerId']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('sso_lookup');
};
