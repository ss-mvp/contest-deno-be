exports.up = function (knex) {
  return knex.schema.createTable('votes', (t) => {
    t.increments('id');
    t.integer('userId')
      .nullable()
      .unsigned()
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.integer('firstPlaceId')
      .notNullable()
      .unsigned()
      .references('submissions.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.integer('secondPlaceId')
      .notNullable()
      .unsigned()
      .references('submissions.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.integer('thirdPlaceId')
      .notNullable()
      .unsigned()
      .references('submissions.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.datetime('created_at').defaultTo(knex.raw("(now() at time zone 'utc')"));
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('votes');
};
