const feedback = [
  // Rumble 1 seeds
  { voterId: 6, submissionId: 8, score1: 5, score2: 4, score3: 3 },
  { voterId: 6, submissionId: 9, score1: 5, score2: 4, score3: 3 },
  { voterId: 6, submissionId: 10, score1: 5, score2: 4, score3: 3 },
  { voterId: 7, submissionId: 7, score1: 4, score2: 3, score3: 2 },
  { voterId: 7, submissionId: 9, score1: 4, score2: 3, score3: 2 },
  { voterId: 7, submissionId: 10, score1: 4, score2: 3, score3: 2 },
  { voterId: 8, submissionId: 7, score1: 3, score2: 2, score3: 1 },
  { voterId: 8, submissionId: 8, score1: 3, score2: 2, score3: 1 },
  { voterId: 8, submissionId: 10, score1: 3, score2: 2, score3: 1 },
  { voterId: 9, submissionId: 7, score1: 3, score2: 2, score3: 1 },
  { voterId: 9, submissionId: 8, score1: 3, score2: 2, score3: 1 },
  { voterId: 9, submissionId: 9, score1: 3, score2: 2, score3: 1 },

  // Rumble 2 seeds
  { voterId: 6, submissionId: 12 },
  { voterId: 6, submissionId: 13 },
  { voterId: 6, submissionId: 14 },
  { voterId: 7, submissionId: 11 },
  { voterId: 7, submissionId: 13 },
  { voterId: 7, submissionId: 14 },
  { voterId: 8, submissionId: 11 },
  { voterId: 8, submissionId: 12 },
  { voterId: 8, submissionId: 14 },
  { voterId: 9, submissionId: 11 },
  { voterId: 9, submissionId: 12 },
  { voterId: 9, submissionId: 13 },
];

async function seed_rumble_feedback(knex) {
  await knex('rumble_feedback').insert(feedback);
}

module.exports = { seed_rumble_feedback };
