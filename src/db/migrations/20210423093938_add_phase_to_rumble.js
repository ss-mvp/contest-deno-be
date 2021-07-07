exports.up = function (knex) {
  return knex.schema.table('rumble_sections', (t) => {
    t.string('phase', 16).defaultsTo('INACTIVE');
  });
};

exports.down = function (knex) {
  return knex.schema.table('rumble_sections', (t) => {
    t.dropColumn('phase');
  });
};
