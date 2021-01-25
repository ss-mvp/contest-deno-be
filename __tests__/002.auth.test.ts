import {
  test,
  TestSuite,
  assertExists,
  assertEquals,
  assertObjectMatch,
  assertArrayIncludes,
  assertStringIncludes,
  DatabaseResult,
} from '../testDeps.ts';
import { MainSuite, IMainSuiteContext } from './000.setup.test.ts';
import users from './testData/users.ts';

const AuthSuite = new TestSuite({
  name: '/auth',
  suite: MainSuite,
});

const RegistrationSuite = new TestSuite({
  name: '/register -> POST',
  suite: AuthSuite,
});

test(RegistrationSuite, 'returns 400 on empty body', async (context) => {
  const res = await context.app.post('/auth/register').send();
  assertEquals(res.status, 400);
  assertStringIncludes(res.body.message, 'Invalid or missing fields');
});

test(RegistrationSuite, 'returns 400 on incomplete body', async (context) => {
  const res = await context.app.post('/auth/register').send(users.incomplete);
  assertEquals(res.status, 400);
  assertStringIncludes(res.body.message, 'Invalid or missing fields');
});

test(
  RegistrationSuite,
  'returns 400 when child is too young and parentEmail is invalid',
  async (context) => {
    const res = await context.app.post('/auth/register').send(users.tooYoung);
    assertEquals(res.status, 400);
    assertStringIncludes(res.body.message, 'Underage users must have');
  }
);

test(RegistrationSuite, 'returns 201 on success', async (context) => {
  const res = await context.app.post('/auth/register').send(users.valid[0]);
  assertEquals(res.status, 201);
  assertObjectMatch(res.body, { message: 'User creation successful.' });
});

test(RegistrationSuite, 'returns 201 on second user', async (context) => {
  const res = await context.app.post('/auth/register').send(users.valid[1]);
  assertEquals(res.status, 201);
  assertObjectMatch(res.body, { message: 'User creation successful.' });
});

const ActivationSuite = new TestSuite<
  IMainSuiteContext & { val: DatabaseResult }
>({
  name: '/activation -> GET',
  suite: AuthSuite,
  beforeAll: async (context) => {
    const [val] = await context.db
      .table('validations')
      .select('*')
      .first()
      .execute();
    context.val = val;
  },
});

test(
  ActivationSuite,
  'returns 400 on missing query params',
  async (context) => {
    const res = await context.app.get(`/auth/activation`);
    assertEquals(res.status, 400);
    assertStringIncludes(res.body.message, 'missing fields: token, email');
  }
);

test(
  ActivationSuite,
  'returns 400 on one missing query param',
  async (context) => {
    const res = await context.app.get(
      `/auth/activation?email=someemail@email.co`
    );
    assertEquals(res.status, 400);
    assertStringIncludes(res.body.message, 'missing fields: token');
  }
);

test(ActivationSuite, 'returns 404 on invalid email', async (context) => {
  const res = await context.app.get(
    `/auth/activation?email=someemail@email.co&token=bananas`
  );
  assertEquals(res.status, 404);
  assertEquals(res.body.message, 'User not found');
});

test(ActivationSuite, 'returns 409 on invalid token', async (context) => {
  const res = await context.app.get(
    `/auth/activation?email=${users.valid[0].parentEmail}&token=bananas`
  );
  assertEquals(res.status, 401);
  assertEquals(res.body.message, 'Invalid activation code');
});

test(ActivationSuite, 'successfully activates account', async (context) => {
  assertArrayIncludes(Object.keys(context.val), ['code', 'email']);
  const { code, email } = context.val;
  const res = await context.app.get(
    `/auth/activation?token=${code}&email=${email}`
  );
  assertEquals(res.status, 302);
  assertStringIncludes(res.headers.location as string, 'authToken');
});

test(
  ActivationSuite,
  'throws 409 error if already validated',
  async (context) => {
    assertArrayIncludes(Object.keys(context.val), ['code', 'email']);
    const { code, email } = context.val;
    const res = await context.app.get(
      `/auth/activation?token=${code}&email=${email}`
    );
    assertEquals(res.status, 409);
    assertObjectMatch(res.body, { message: 'User has already been validated' });
  }
);

const LoginSuite = new TestSuite({
  name: '/login -> POST',
  suite: AuthSuite,
});

test(LoginSuite, 'returns a 400 on missing body', async (context) => {
  const res = await context.app.post('/auth/login');

  assertEquals(res.status, 400);
  assertStringIncludes(res.body.message, 'email, password');
});

test(LoginSuite, 'returns a 404 on invalid email', async (context) => {
  const res = await context.app
    .post('/auth/login')
    .send({ email: 'nope@email.com', password: 'notEvenAPassword' });

  assertEquals(res.status, 404);
  assertEquals(res.body.message, 'User not found');
});

test(LoginSuite, 'returns 403 if not validated', async (context) => {
  const res = await context.app
    .post('/auth/login')
    .send({ email: users.valid[1].email, password: users.valid[1].password });

  assertEquals(res.status, 403);
  assertEquals(res.body.message, 'Account must be validated');
});

test(LoginSuite, 'returns 401 on invalid password', async (context) => {
  const res = await context.app
    .post('/auth/login')
    .send({ email: users.valid[0].email, password: 'thewrongpassword' });

  assertEquals(res.status, 401);
  assertEquals(res.body.message, 'Invalid password');
});

test(LoginSuite, 'returns 201 and token on login', async (context) => {
  const res = await context.app
    .post('/auth/login')
    .send({ email: users.valid[0].email, password: users.valid[0].password });

  assertEquals(res.status, 201);
  assertExists(res.body.user);
  assertExists(res.body.token);
});

const GetResetSuite = new TestSuite({
  name: '/reset -> GET',
  suite: AuthSuite,
});

test(GetResetSuite, 'throws a 400 on missing email param', async (context) => {
  const res = await context.app.get('/auth/reset');
  assertEquals(res.status, 400);
  assertStringIncludes(res.body.message, 'email');
});

test(GetResetSuite, 'throws a 404 on invalid email', async (context) => {
  const res = await context.app.get('/auth/reset?email=bademail@email.com');
  assertEquals(res.status, 404);
  assertEquals(res.body.message, 'Email not found');
});

test(GetResetSuite, 'successfully generates a reset email', async (context) => {
  const res = await context.app.get(
    `/auth/reset?email=${users.valid[0].email}`
  );
  assertEquals(res.status, 200);
  assertEquals(res.body.message, 'Password reset email sent!');
});

test(
  GetResetSuite,
  'restricts a user from creating another reset too soon',
  async (context) => {
    const res = await context.app.get(
      `/auth/reset?email=${users.valid[0].email}`
    );
    assertEquals(res.status, 429);
    assertEquals(res.body.message, 'Cannot get another code so soon');
  }
);

const PostResetSuite = new TestSuite<
  IMainSuiteContext & { reset: DatabaseResult }
>({
  name: '/reset -> POST',
  suite: AuthSuite,
  beforeAll: async (context) => {
    const [reset] = await context.db
      .table('resets')
      .select('*')
      .first()
      .execute();
    context.reset = reset;
  },
});

test(PostResetSuite, 'returns a 400 on no body', async (context) => {
  const res = await context.app.post('/auth/reset');
  assertEquals(res.status, 400);
  assertStringIncludes(res.body.message, 'email, password, code');
});

test(PostResetSuite, 'returns a 400 when code is not UUID', async (context) => {
  const res = await context.app.post('/auth/reset').send({
    email: users.valid[0].email,
    password: users.newPass,
    code: 'somerandomstring',
  });
  assertEquals(res.status, 400);
  assertStringIncludes(res.body.message, 'code');
});

test(PostResetSuite, 'returns 404 when email is not found', async (context) => {
  const res = await context.app.post('/auth/reset').send({
    email: 'validnonexistentemail@email.com',
    password: users.newPass,
    code: context.reset.code,
  });
  assertEquals(res.status, 404);
  assertEquals(res.body.message, 'Email not found');
});

test(
  PostResetSuite,
  'returns 409 when no resets are active',
  async (context) => {
    const res = await context.app.post('/auth/reset').send({
      email: users.valid[1].email,
      password: users.newPass,
      code: context.reset.code,
    });
    assertEquals(res.status, 409);
    assertEquals(res.body.message, 'No password resets are active');
  }
);

test(
  PostResetSuite,
  'returns a 401 when the reset code is invalid',
  async (context) => {
    const res = await context.app.post('/auth/reset').send({
      email: users.valid[0].email,
      password: users.newPass,
      code: users.wrongCode,
    });
    assertEquals(res.status, 401);
    assertEquals(res.body.message, 'Invalid password reset code');
  }
);

test(
  PostResetSuite,
  'returns an empty 204 on successful reset',
  async (context) => {
    const res = await context.app.post('/auth/reset').send({
      email: users.valid[0].email,
      password: users.newPass,
      code: context.reset.code,
    });
    assertEquals(res.status, 204);
    assertEquals(res.body, null);
  }
);