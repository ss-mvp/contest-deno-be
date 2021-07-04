exports.up = function (knex) {
  return knex.schema.createTable('rumble_feedback', (t) => {
    t.increments('id');
    t.integer('voterId')
      .unsigned()
      .notNullable()
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.integer('submissionId')
      .unsigned()
      .notNullable()
      .references('submissions.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.integer('score1');
    t.integer('score2');
    t.integer('score3');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('rumble_feedback');
};
