// deno-lint-ignore-file
const moment = require('moment');

const testSubs = [
  {
    s3Label: 'seedItem1.jpeg',
    etag: 'f347ca3d17e47e1164e626cdef38b259',
    userId: 1,
    promptId: 1,
    sourceId: 1,
    transcription: 'Here is a transcription',
    confidence: 50,
    score: 25,
    rotation: 0,
    created_at: moment.utc().subtract(1, 'd'),
  },
  {
    s3Label: 'seedItem1.jpeg',
    etag: 'f347ca3d17e47e1164e626cdef38b259',
    userId: 2,
    promptId: 1,
    sourceId: 1,
    transcription: 'Here is a different transcription',
    confidence: 70,
    score: 40,
    rotation: 0,
    created_at: moment.utc().subtract(1, 'd'),
  },
  {
    s3Label: 'seedItem1.jpeg',
    etag: 'f347ca3d17e47e1164e626cdef38b259',
    userId: 3,
    promptId: 1,
    sourceId: 1,
    transcription: 'Here is a teacher transcription',
    confidence: 100,
    score: 50,
    rotation: 0,
    created_at: moment.utc().subtract(1, 'd'),
  },
  {
    s3Label: 'seedItem1.jpeg',
    etag: 'f347ca3d17e47e1164e626cdef38b259',
    userId: 1,
    promptId: 2,
    sourceId: 1,
    transcription: 'Here is a third transcription',
    confidence: 80,
    score: 45,
    rotation: 0,
    created_at: moment.utc(),
  },
  {
    s3Label: 'seedItem1.jpeg',
    etag: 'f347ca3d17e47e1164e626cdef38b259',
    userId: 2,
    promptId: 2,
    sourceId: 1,
    transcription: 'Here is a fourth transcription',
    confidence: 60,
    score: 25,
    rotation: 0,
    created_at: moment.utc(),
  },
  {
    s3Label: 'seedItem1.jpeg',
    etag: 'f347ca3d17e47e1164e626cdef38b259',
    userId: 3,
    promptId: 2,
    sourceId: 1,
    transcription: 'Here is another teacher transcription',
    confidence: 100,
    score: 50,
    rotation: 0,
    created_at: moment.utc(),
  },
];

async function seed_submissions(knex) {
  await knex('submissions').insert(testSubs);
}

module.exports = { seed_submissions };
