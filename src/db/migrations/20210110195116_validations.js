exports.up = function (knex) {
  return knex.schema.createTable('validations', (t) => {
    t.increments('id');
    t.string('code').notNullable().index();
    t.string('email').notNullable().index();
    t.integer('userId')
      .notNullable()
      .unsigned()
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    t.datetime('created_at').defaultTo(knex.raw("(now() at time zone 'utc')"));
    t.datetime('completed_at');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('validations');
};
