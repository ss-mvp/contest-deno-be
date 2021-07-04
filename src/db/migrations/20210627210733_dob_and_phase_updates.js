exports.up = function (knex) {
  return (
    knex.schema
      .table('users', (t) => {
        t.date('dob');
      })
      // Update values to satisfy our new enum constraint
      .raw(
        `UPDATE rumble_sections SET phase = 'WAITING' WHERE phase = 'INACTIVE'`
      )
      .raw(
        `UPDATE rumble_sections SET phase = 'WRITING' WHERE phase = 'ACTIVE'`
      )
      .raw(
        `ALTER TABLE "rumble_sections" ADD CONSTRAINT "rumble_phases_enum"
         CHECK (phase IN ('WAITING', 'WRITING', 'FEEDBACK', 'COMPLETE'))`
      )
      .alterTable('rumble_sections', (t) => {
        t.string('phase', 16).defaultsTo('WAITING').alter();
      })
      .table('submissions', (t) => {
        t.dropColumn('transcription');
      })
  );
};

exports.down = function (knex) {
  return (
    knex.schema
      .table('submissions', (t) => {
        t.string('transcription', 3000);
      })
      .alterTable('rumble_sections', (t) => {
        t.string('phase', 16).defaultsTo('INACTIVE').alter();
      })
      .raw(`ALTER TABLE "rumble_sections" DROP CONSTRAINT "rumble_phases_enum"`)
      // Return phases to their original denominations after removing constraint
      .raw(
        `UPDATE rumble_sections SET phase = 'INACTIVE' WHERE phase = 'WAITING'`
      )
      .raw(
        `UPDATE rumble_sections SET phase = 'ACTIVE' WHERE phase = 'WRITING'`
      )
      .table('users', (t) => {
        t.dropColumn('dob');
      })
  );
};
