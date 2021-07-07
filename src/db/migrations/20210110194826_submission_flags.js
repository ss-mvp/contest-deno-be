exports.up = function (knex) {
  return knex.schema.createTable('submission_flags', (t) => {
    t.increments('id');
    t.integer('submissionId')
      .notNullable()
      .unsigned()
      .references('submissions.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.integer('flagId')
      .notNullable()
      .unsigned()
      .references('enum_flags.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.integer('creatorId')
      .unsigned()
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.unique(['submissionId', 'flagId']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('submission_flags');
};
