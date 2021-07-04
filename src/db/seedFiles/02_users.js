const seedUsers = [
  {
    codename: 'A Codename',
    email: 'anemail@email.com',
    firstname: 'Firstname',
    lastname: 'Lastname',
    password: 'thisisastringyoucanteverlogin',
    isValidated: true,
    roleId: 1,
    dob: new Date(2000, 1, 1),
  },
  {
    codename: 'CodenameTwo',
    email: 'anemawwww@email.com',
    firstname: 'Firstname',
    lastname: 'Lastname',
    password: 'thisisastringyoucanteverloginuhoh',
    isValidated: true,
    roleId: 2,
    dob: new Date(2000, 1, 1),
  },
  {
    codename: 'CodenameThree',
    email: 'email@email.com',
    firstname: 'Firstname3',
    lastname: 'Lastname3',
    password: '$2a$10$cZajEDkFrgEsdEbVYed4IeM6RAy75/FV9KRlJDZ63O1Cc0KNp13tG', // somepass123A
    isValidated: true,
    roleId: 3,
    dob: new Date(2000, 1, 1),
  },
  {
    codename: 'TeacherSuccess',
    email: 'conn_reuben@example.net',
    firstname: 'Reuben',
    lastname: 'Conn',
    password: '$2a$10$cZajEDkFrgEsdEbVYed4IeM6RAy75/FV9KRlJDZ63O1Cc0KNp13tG', // somepass123A
    isValidated: true,
    roleId: 2,
    dob: new Date(2000, 1, 1),
  },
  {
    codename: 'TeacherMerge',
    email: 'daniel.casandra@example.net',
    firstname: 'Casandra',
    lastname: 'Daniel',
    password: '$2a$10$cZajEDkFrgEsdEbVYed4IeM6RAy75/FV9KRlJDZ63O1Cc0KNp13tG', // somepass123A
    isValidated: true,
    roleId: 2,
    dob: new Date(2000, 1, 1),
  },
  {
    codename: 'StudentSuccess',
    email: 'f.young@example.net',
    firstname: 'Fahey',
    lastname: 'Young',
    password: '$2a$10$cZajEDkFrgEsdEbVYed4IeM6RAy75/FV9KRlJDZ63O1Cc0KNp13tG', // somepass123A
    isValidated: true,
    roleId: 1,
    dob: new Date(2000, 1, 1),
  },
  {
    codename: 'Student2',
    email: 'j_barbara@example.org',
    firstname: 'Barbara',
    lastname: 'Jacobs',
    password: '$2a$10$cZajEDkFrgEsdEbVYed4IeM6RAy75/FV9KRlJDZ63O1Cc0KNp13tG', // somepass123A
    isValidated: true,
    roleId: 1,
    dob: new Date(2000, 1, 1),
  },
  {
    codename: 'Student3',
    email: 'k.donald@example.com',
    firstname: 'Donald',
    lastname: 'Kovacek',
    password: '$2a$10$cZajEDkFrgEsdEbVYed4IeM6RAy75/FV9KRlJDZ63O1Cc0KNp13tG', // somepass123A
    isValidated: true,
    roleId: 1,
    dob: new Date(2000, 1, 1),
  },
  {
    codename: 'Student4',
    email: 'ruby.k@example.com',
    firstname: 'Ruby',
    lastname: 'Kreiger',
    password: '$2a$10$cZajEDkFrgEsdEbVYed4IeM6RAy75/FV9KRlJDZ63O1Cc0KNp13tG', // somepass123A
    isValidated: true,
    roleId: 1,
    dob: new Date(2000, 1, 1),
  },
  {
    codename: 'Student5',
    email: 's.angelo@example.net',
    firstname: 'Angelo',
    lastname: 'Sawayn',
    password: '$2a$10$cZajEDkFrgEsdEbVYed4IeM6RAy75/FV9KRlJDZ63O1Cc0KNp13tG', // somepass123A
    isValidated: false,
    roleId: 1,
    dob: new Date(2000, 1, 1),
  },
];

async function seed_users(knex) {
  await knex('users').insert(seedUsers);
}

module.exports = { seed_users };
