exports.up = function (knex) {
  return knex.schema.createTable('submissions', (t) => {
    t.increments('id');
    t.string('email', 255);
    t.string('s3Key');
    t.string('s3Checksum', 128);
    t.float('confidence', 2);
    t.float('squadScore', 2);
    t.float('rotation', 2);
    t.boolean('moderationFlag');
    t.integer('originSubmissionId');
    t.integer('originId')
      .unsigned()
      .notNullable()
      .references('enum_submission_origins.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('submissions');
};
