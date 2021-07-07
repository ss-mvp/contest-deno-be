const DateTime = require('luxon').DateTime;

const testSubs = [
  {
    s3Label: 'seedItem1.jpeg',
    etag: 'f347ca3d17e47e1164e626cdef38b259',
    userId: 1,
    promptId: 1,
    sourceId: 1,
    confidence: 50,
    score: 19,
    rotation: 0,
    created_at: DateTime.utc().minus({ day: 1 }),
  },
  {
    s3Label: 'seedItem1.jpeg',
    etag: 'f347ca3d17e47e1164e626cdef38b259',
    userId: 2,
    promptId: 1,
    sourceId: 1,
    confidence: 70,
    score: 40,
    rotation: 0,
    created_at: DateTime.utc().minus({ day: 1 }),
  },
  {
    s3Label: 'seedItem1.jpeg',
    etag: 'f347ca3d17e47e1164e626cdef38b259',
    userId: 3,
    promptId: 1,
    sourceId: 1,
    confidence: 100,
    score: 50,
    rotation: 0,
    created_at: DateTime.utc().minus({ day: 1 }),
  },
  {
    s3Label: 'seedItem1.jpeg',
    etag: 'f347ca3d17e47e1164e626cdef38b259',
    userId: 1,
    promptId: 2,
    sourceId: 1,
    confidence: 80,
    score: 25,
    rotation: 0,
    created_at: DateTime.utc(),
  },
  {
    s3Label: 'seedItem1.jpeg',
    etag: 'f347ca3d17e47e1164e626cdef38b259',
    userId: 2,
    promptId: 2,
    sourceId: 1,
    confidence: 60,
    score: 25,
    rotation: 0,
    created_at: DateTime.utc(),
  },
  {
    s3Label: 'seedItem1.jpeg',
    etag: 'f347ca3d17e47e1164e626cdef38b259',
    userId: 3,
    promptId: 2,
    sourceId: 1,
    confidence: 100,
    score: 50,
    rotation: 0,
    created_at: DateTime.utc(),
  },
];

async function seed_submissions(knex) {
  await knex('submissions').insert(testSubs);
}

module.exports = { seed_submissions };
