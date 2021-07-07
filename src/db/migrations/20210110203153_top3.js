exports.up = function (knex) {
  return knex.schema.createTable('top3', (t) => {
    t.increments('id');
    t.integer('submissionId')
      .notNullable()
      .unsigned()
      .references('submissions.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.datetime('created_at').defaultTo(knex.raw("(now() at time zone 'utc')"));
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('top3');
};
