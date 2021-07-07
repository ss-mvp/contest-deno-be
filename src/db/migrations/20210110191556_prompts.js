exports.up = (knex) => {
  return knex.schema.createTable('prompts', (t) => {
    t.increments('id');
    t.string('prompt').notNullable().unique();
    t.boolean('active').defaultTo(false);
    t.boolean('approved').defaultTo(false);
    t.integer('creatorId')
      .unsigned()
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('prompts');
};
