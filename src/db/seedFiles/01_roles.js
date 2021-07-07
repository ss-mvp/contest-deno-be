async function seed_roles(knex) {
  await knex('roles').insert([
    { role: 'user' },
    { role: 'teacher' },
    { role: 'admin' },
  ]);
}

module.exports = { seed_roles };
