exports.up = function (knex) {
  return knex.schema.createTable('prompt_queue', (t) => {
    t.increments('id');
    t.integer('promptId')
      .notNullable()
      .unsigned()
      .references('prompts.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.date('starts_at').notNullable().unique();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('prompt_queue');
};
