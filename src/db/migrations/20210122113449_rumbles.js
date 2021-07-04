exports.up = function (knex) {
  return knex.schema.createTable('rumbles', (t) => {
    t.increments('id');
    t.boolean('canJoin').defaultTo(false);
    t.string('joinCode').unique();
    t.integer('numMinutes').notNullable();
    t.integer('maxSections').notNullable().defaultTo(1);
    t.integer('promptId')
      .unsigned()
      .notNullable()
      .references('prompts.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.datetime('created_at').defaultTo(knex.raw("(now() at time zone 'utc')"));
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('rumbles');
};
