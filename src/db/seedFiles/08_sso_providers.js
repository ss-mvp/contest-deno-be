const sso = [{ provider: 'Clever' }];

async function seed_sso_providers(knex) {
  await knex('sso_providers').insert(sso);
}

module.exports = { seed_sso_providers };
