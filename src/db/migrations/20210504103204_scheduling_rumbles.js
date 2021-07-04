exports.up = function (knex) {
  return knex.schema.table('rumble_sections', (t) => {
    t.dateTime('start_time');
  });
};

exports.down = function (knex) {
  return knex.schema.table('rumble_sections', (t) => {
    t.dropColumn('start_time');
  });
};
