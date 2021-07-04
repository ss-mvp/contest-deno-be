exports.up = function (knex) {
  return knex.schema.createTable('users', (t) => {
    t.increments('id');
    t.string('codename', 16).unique().index();
    t.string('firstname');
    t.string('lastname');
    t.string('email').unique().index();
    t.string('password');
    t.integer('roleId')
      .notNullable()
      .unsigned()
      .references('roles.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.boolean('isValidated').defaultTo(false);
    t.datetime('created_at').defaultTo(knex.raw("(now() at time zone 'utc')"));
    t.datetime('updated_at').defaultTo(knex.raw("(now() at time zone 'utc')"));
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
