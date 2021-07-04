const cleaner = require('knex-cleaner');

function cleanTables(knex) {
  return cleaner
    .clean(knex, {
      mod: 'truncate',
      restartIdentity: true,
      ignoreTables: ['knex_migrations', 'knex_migrations_lock'],
    })
    .then(() =>
      console.log(`== All tables truncated and ready to be seeded ==`)
    );
}

async function seed_cleanup(knex) {
  await cleanTables(knex);
}

module.exports = { seed_cleanup };
