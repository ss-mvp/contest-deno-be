exports.up = function (knex) {
  return knex.schema.createTable('clever_sections', (t) => {
    t.increments('id');
    t.string('name');
    t.boolean('active').defaultTo(true);
    t.string('joinCode').notNullable().unique().index();
    t.string('subjectId')
      .notNullable()
      .references('enum_subjects.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    t.string('gradeId')
      .references('enum_grades.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('clever_sections');
};
