import { env } from '../config';
import CleverClient from '../services/clever/client';

export default function clever__loader() {
  console.log('Loading Clever client...');

  const client = new CleverClient(env.CLEVER_CONFIG);

  console.log('Clever client loaded!');

  return client;
}
