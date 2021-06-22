// deno-lint-ignore-file
const moment = require('moment');

const testSubs = [
  // Rumble 1 seeds
  {
    s3Label: 'seedItem1.jpeg',
    etag: 'f347ca3d17e47e1164e626cdef38b259',
    userId: 6,
    promptId: 1,
    sourceId: 2,
    transcription: 'Student 1',
    confidence: 100,
    score: 50,
    rotation: 0,
    created_at: moment.utc().subtract(1, 'd'),
    rumbleId: 1,
  },
  {
    s3Label: 'seedItem2.jpeg',
    etag: 'cae51387506eb37c5802ae7e11ab5ed7',
    userId: 7,
    promptId: 1,
    sourceId: 2,
    transcription: 'Student 2',
    confidence: 100,
    score: 50,
    rotation: 0,
    created_at: moment.utc().subtract(1, 'd'),
    rumbleId: 1,
  },
  {
    s3Label: 'seedItem3.png',
    etag: 'b61854a2df8d86d5de0dc6ca68da2328',
    userId: 8,
    promptId: 1,
    sourceId: 2,
    transcription: 'Student 13423',
    confidence: 100,
    score: 50,
    rotation: 0,
    created_at: moment.utc().subtract(1, 'd'),
    rumbleId: 1,
  },
  {
    s3Label: 'seedItem4.jpeg',
    etag: 'f790e2a24d1cd89fea54a3c63b096391',
    userId: 9,
    promptId: 1,
    sourceId: 2,
    transcription: 'Student 134233422543543432',
    confidence: 100,
    score: 50,
    rotation: 0,
    created_at: moment.utc().subtract(1, 'd'),
    rumbleId: 1,
  },

  // Rumble 2 seeds
  {
    s3Label: 'seedItem1.jpeg',
    etag: 'f347ca3d17e47e1164e626cdef38b259',
    userId: 6,
    promptId: 2,
    sourceId: 2,
    transcription: 'Student 1',
    confidence: 100,
    score: 50,
    rotation: 0,
    created_at: moment.utc(),
    rumbleId: 2,
  },
  {
    s3Label: 'seedItem2.jpeg',
    etag: 'cae51387506eb37c5802ae7e11ab5ed7',
    userId: 7,
    promptId: 2,
    sourceId: 2,
    transcription: 'Student 2',
    confidence: 100,
    score: 50,
    rotation: 0,
    created_at: moment.utc(),
    rumbleId: 2,
  },
  {
    s3Label: 'seedItem3.png',
    etag: 'b61854a2df8d86d5de0dc6ca68da2328',
    userId: 8,
    promptId: 2,
    sourceId: 2,
    transcription: 'Student 13423',
    confidence: 100,
    score: 50,
    rotation: 0,
    created_at: moment.utc(),
    rumbleId: 2,
  },
  {
    s3Label: 'seedItem4.jpeg',
    etag: 'f790e2a24d1cd89fea54a3c63b096391',
    userId: 9,
    promptId: 2,
    sourceId: 2,
    transcription: 'Student 134233422543543432',
    confidence: 100,
    score: 50,
    rotation: 0,
    created_at: moment.utc(),
    rumbleId: 2,
  },
];

async function seed_rumble_submissions(knex) {
  await knex('submissions').insert(testSubs);
}

module.exports = { seed_rumble_submissions };
