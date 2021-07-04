const validators = [{ validator: 'user' }, { validator: 'parent' }];

async function seed_validators_enum(knex) {
  await knex('enum_validators').insert(validators);
}

module.exports = { seed_validators_enum };
