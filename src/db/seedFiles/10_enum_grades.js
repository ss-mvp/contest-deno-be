const grades = [
  { id: '1', grade: '1st' },
  { id: '2', grade: '2nd' },
  { id: '3', grade: '3rd' },
  { id: '4', grade: '4th' },
  { id: '5', grade: '5th' },
  { id: '6', grade: '6th' },
  { id: '7', grade: '7th' },
  { id: '8', grade: '8th' },
  { id: '9', grade: '9th' },
  { id: '10', grade: '10th' },
  { id: '11', grade: '11th' },
  { id: '12', grade: '12th' },
  { id: '13', grade: '13th' },
  { id: 'PreKindergarten', grade: 'Pre-Kindergarten' },
  { id: 'TransitionalKindergarten', grade: 'Transitional Kindergarten' },
  { id: 'Kindergarten', grade: 'Kindergarten' },
  { id: 'InfantToddler', grade: 'Infant/Toddler' },
  { id: 'Preschool', grade: 'Preschool' },
  { id: 'PostGraduate', grade: 'Post-Graduate' },
  { id: 'Ungraded', grade: 'Ungraded' },
  { id: 'Other', grade: 'Other' },
  { id: '', grade: 'None' },
];

async function seed_enum_grades(knex) {
  await knex('enum_grades').insert(grades);
}

module.exports = { seed_enum_grades };
