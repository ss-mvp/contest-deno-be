exports.up = function (knex) {
  return knex.schema.createTable('waiting_room', (t) => {
    t.increments('id');
    t.boolean('active').defaultTo(false);
    t.integer('studentId')
      .unsigned()
      .notNullable()
      .references('clever_students.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.integer('rumbleId')
      .unsigned()
      .notNullable()
      .references('rumbles.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('waiting_room');
};
