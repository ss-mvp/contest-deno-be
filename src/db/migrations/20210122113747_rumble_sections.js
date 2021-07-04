exports.up = function (knex) {
  return knex.schema.createTable('rumble_sections', (t) => {
    t.increments('id');
    t.dateTime('end_time');
    t.integer('rumbleId')
      .unsigned()
      .notNullable()
      .references('rumbles.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.integer('sectionId')
      .unsigned()
      .notNullable()
      .references('clever_sections.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.datetime('created_at').defaultTo(knex.raw("(now() at time zone 'utc')"));
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('rumble_sections');
};
