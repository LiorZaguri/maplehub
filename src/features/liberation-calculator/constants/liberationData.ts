import { BossInfo, BossDifficulty } from '../types/liberation';

export const LIBERATION_REQUIREMENTS = {
  genesis: {
    totalTraces: 6500,
    quests: [
      'Traces of Von Leon the Lion King',
      'Traces of Arkarium',
      'Traces of Magnus the Dragon',
      'Traces of Hilla the Betrayer',
      'Traces of Pink Bean the Bean',
      'Traces of Cygnus the Empress',
      'Traces of Chosen Seren',
      'Traces of Guardian Angel Slime',
      'Traces of Gollux',
      'Traces of Horntail',
      'Traces of Ranmaru',
      'Traces of Akechi Mitsuhide',
      'Traces of Princess No',
      'Traces of Von Bon',
      'Traces of Kalos the Guardian'
    ]
  },
  destiny: {
    totalTraces: 6500,
    quests: [
      'Traces of Von Leon the Lion King',
      'Traces of Arkarium',
      'Traces of Magnus the Dragon',
      'Traces of Hilla the Betrayer',
      'Traces of Pink Bean the Bean',
      'Traces of Cygnus the Empress',
      'Traces of Chosen Seren',
      'Traces of Guardian Angel Slime',
      'Traces of Gollux',
      'Traces of Horntail',
      'Traces of Ranmaru',
      'Traces of Akechi Mitsuhide',
      'Traces of Princess No',
      'Traces of Von Bon',
      'Traces of Kalos the Guardian'
    ]
  }
} as const;

export const LIBERATION_BOSSES: BossInfo[] = [
  {
    id: 'lotus',
    name: 'Lotus',
    availableDifficulties: ['normal', 'hard'],
    traceRewards: {
      normal: 10,
      hard: 50,
      easy: 0,
      chaos: 0,
      extreme: 0
    },
    partySize: 6
  },
  {
    id: 'damien',
    name: 'Damien',
    availableDifficulties: ['normal', 'hard'],
    traceRewards: {
      normal: 10,
      hard: 50,
      easy: 0,
      chaos: 0,
      extreme: 0
    },
    partySize: 6
  },
  {
    id: 'lucid',
    name: 'Lucid',
    availableDifficulties: ['easy', 'normal', 'hard'],
    traceRewards: {
      easy: 15,
      normal: 20,
      hard: 65,
      chaos: 0,
      extreme: 0
    },
    partySize: 6
  },
  {
    id: 'will',
    name: 'Will',
    availableDifficulties: ['easy', 'normal', 'hard'],
    traceRewards: {
      easy: 15,
      normal: 25,
      hard: 75,
      chaos: 0,
      extreme: 0
    },
    partySize: 6
  },
  {
    id: 'gloom',
    name: 'Gloom',
    availableDifficulties: ['normal', 'chaos'],
    traceRewards: {
      normal: 20,
      chaos: 65,
      easy: 0,
      hard: 0,
      extreme: 0
    },
    partySize: 6
  },
  {
    id: 'verus-hilla',
    name: 'Verus Hilla',
    availableDifficulties: ['normal', 'hard'],
    traceRewards: {
      normal: 45,
      hard: 90,
      easy: 0,
      chaos: 0,
      extreme: 0
    },
    partySize: 6
  },
  {
    id: 'darknell',
    name: 'Darknell',
    availableDifficulties: ['normal', 'hard'],
    traceRewards: {
      normal: 25,
      hard: 75,
      easy: 0,
      chaos: 0,
      extreme: 0
    },
    partySize: 6
  },
  {
    id: 'black-mage',
    name: 'Black Mage',
    availableDifficulties: ['hard', 'extreme'],
    traceRewards: {
      hard: 600,
      extreme: 600,
      easy: 0,
      normal: 0,
      chaos: 0
    },
    partySize: 6,
    monthlyClearLimit: 1
  },
  {
    id: 'chosen-seren',
    name: 'Chosen Seren',
    availableDifficulties: ['normal', 'hard', 'extreme'],
    traceRewards: {
      normal: 10,
      hard: 50,
      extreme: 600,
      easy: 0,
      chaos: 0
    },
    partySize: 6,
    monthlyClearLimit: 1
  },
  {
    id: 'magnus',
    name: 'Magnus',
    availableDifficulties: ['normal', 'hard'],
    traceRewards: {
      normal: 10,
      hard: 50,
      easy: 0,
      chaos: 0,
      extreme: 0
    },
    partySize: 6
  },
  {
    id: 'hilla',
    name: 'Hilla',
    availableDifficulties: ['normal', 'hard'],
    traceRewards: {
      normal: 10,
      hard: 50,
      easy: 0,
      chaos: 0,
      extreme: 0
    },
    partySize: 6
  },
  {
    id: 'pink-bean',
    name: 'Pink Bean',
    availableDifficulties: ['normal', 'chaos'],
    traceRewards: {
      normal: 10,
      chaos: 65,
      easy: 0,
      hard: 0,
      extreme: 0
    },
    partySize: 6
  },
  {
    id: 'cygnus',
    name: 'Cygnus',
    availableDifficulties: ['easy', 'normal'],
    traceRewards: {
      easy: 15,
      normal: 20,
      hard: 0,
      chaos: 0,
      extreme: 0
    },
    partySize: 6
  },
  {
    id: 'guardian-angel-slime',
    name: 'Guardian Angel Slime',
    availableDifficulties: ['normal', 'chaos'],
    traceRewards: {
      normal: 20,
      chaos: 65,
      easy: 0,
      hard: 0,
      extreme: 0
    },
    partySize: 6
  },
  {
    id: 'gollux',
    name: 'Gollux',
    availableDifficulties: ['normal'],
    traceRewards: {
      normal: 10,
      hard: 0,
      easy: 0,
      chaos: 0,
      extreme: 0
    },
    partySize: 6
  },
  {
    id: 'horntail',
    name: 'Horntail',
    availableDifficulties: ['normal'],
    traceRewards: {
      normal: 10,
      hard: 0,
      easy: 0,
      chaos: 0,
      extreme: 0
    },
    partySize: 6
  },
  {
    id: 'von-leon',
    name: 'Von Leon',
    availableDifficulties: ['normal'],
    traceRewards: {
      normal: 10,
      hard: 0,
      easy: 0,
      chaos: 0,
      extreme: 0
    },
    partySize: 6
  },
  {
    id: 'von-bon',
    name: 'Von Bon',
    availableDifficulties: ['normal', 'chaos'],
    traceRewards: {
      normal: 20,
      chaos: 65,
      easy: 0,
      hard: 0,
      extreme: 0
    },
    partySize: 6
  },
  {
    id: 'kalos',
    name: 'Kalos the Guardian',
    availableDifficulties: ['normal', 'hard', 'chaos', 'extreme'],
    traceRewards: {
      normal: 10,
      hard: 50,
      chaos: 65,
      extreme: 600,
      easy: 0
    },
    partySize: 6,
    monthlyClearLimit: 1
  }
];

export const PARTY_SIZE_OPTIONS = [1, 2, 3, 4, 5, 6] as const;
