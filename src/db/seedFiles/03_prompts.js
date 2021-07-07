const DateTime = require('luxon').DateTime;

const isBeforeEnd = DateTime.utc() < DateTime.utc().set({ hour: 22 });

const seedPrompts = [
  {
    prompt: 'Set your pirate story aboard the fastest ship on the high seas.',
    approved: true,
  },
  {
    prompt: 'Write a story that includes a flying magic carpet.',
    approved: true,
    ...(isBeforeEnd && { active: true }),
  },
  {
    prompt:
      'Your sports team has a rematch against the defending champions that crushed you the last time you played, but this time you have a secret weapon.  What is it and how does it help you win this time around?',
    approved: true,
    ...(!isBeforeEnd && { active: true }),
  },
  {
    prompt:
      "Imagine it's 2120 and when your arrive to school, you find out you have a math test you haven't studied for. What do you do?",
    approved: true,
  },
  {
    prompt:
      "NASA tryouts!  You've been selected to be the first kid to walk on Mars. Write about what happens when your space mission goes horribly wrong.",
    approved: true,
  },
  {
    prompt:
      "You're an undercover park ranger tracking animal poachers in a nature preserve.  How do you protect the animals and deliver justice to the poachers? Write a scene.",
    approved: true,
  },
  {
    prompt:
      "You're part of a crew exploring a new world and venture out to meet leaders from a newly discovered tribe of native inhabitants. Write a scene in which you negotiate peace between the two groups.",
    approved: true,
  },
  {
    prompt: 'A character is lost in a maze and time is running out.',
    approved: true,
  },
  {
    prompt:
      'A prince and/or princess are trapped in a castle dungeon.  How do they escape?',
    approved: true,
  },
  { prompt: 'Two kids build a robot to fight crime.', approved: true },
  {
    prompt:
      'Everyone who ventures into the forbidden enchanted forest is never seen again.',
    approved: true,
  },
  {
    prompt: 'Invent a new super hero who saves their city from destruction.',
    approved: true,
  },
];

async function seed_prompts(knex) {
  await knex('prompts').insert(seedPrompts);
}

module.exports = { seed_prompts };
