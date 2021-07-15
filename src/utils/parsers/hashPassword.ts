import bcrypt from 'bcrypt';

export default async function hashPassword(password: string) {
  console.log('Hashing password');
  const salt = await bcrypt.genSalt(8);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log('Password hashed');
  return hashedPassword;
}
