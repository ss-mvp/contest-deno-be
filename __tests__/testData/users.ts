import { Roles } from '../../src/interfaces/roles.ts';
import { INewUser } from '../../src/interfaces/users.ts';
import { v5 } from '../../testDeps.ts';

const valid: Omit<INewUser, 'roleId'>[] = [
  {
    codename: 'TestCodename1',
    email: 'someemail1@email.com',
    firstname: 'Firstname1',
    lastname: 'Lastname1',
    password: 'somepass123A',
    age: 24,
    parentEmail: 'parentEmail1@email.com',
  },
  {
    codename: 'TestCodename2',
    email: 'someemail2@email.com',
    firstname: 'Firstname2',
    lastname: 'Lastname2',
    password: 'somepass123A',
    age: 24,
    parentEmail: 'parentEmail2@email.com',
  },
  {
    codename: 'TestCodename3',
    email: 'someemail3@email.com',
    firstname: 'Firstname3',
    lastname: 'Lastname3',
    password: 'somepass123A',
    age: 12,
    parentEmail: 'parentEmail3@email.com',
  },
];

const incomplete: Partial<INewUser> = {
  email: 'justanemail@email.com',
};

const tooYoung = {
  codename: 'ChildCodename',
  email: 'someEmail@email.com',
  parentEmail: 'someEmail@email.com',
  firstname: 'Firstname1',
  lastname: 'Lastname1',
  password: 'somepass123A',
  age: 10,
};

const newPass = 'newPassword123';
const wrongCode = v5.generate({
  namespace: '6d16c1e3-753f-4909-8d37-d7a84aaba291', // DONT MAKE THE SAME AS ENV NAMESPACE
  value: 'someValue',
});

const admin = {
  codename: 'Admin1',
  email: 'someEmail@admin.com',
  firstname: 'Addy',
  lastname: 'Minston',
  password: 'somepass123A',
  isValidated: true,
  roleId: Roles.admin,
};

export default { valid, incomplete, tooYoung, newPass, wrongCode, admin };
