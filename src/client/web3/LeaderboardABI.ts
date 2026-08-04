export const LeaderboardABI = [
  {
    type: 'function',
    name: 'submitScore',
    inputs: [
      { name: 'score', type: 'uint256', internalType: 'uint256' },
      { name: 'wave', type: 'uint256', internalType: 'uint256' },
      { name: 'heroId', type: 'string', internalType: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getTopScores',
    inputs: [
      { name: 'count', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct Leaderboard.ScoreEntry[]',
        components: [
          { name: 'player', type: 'address', internalType: 'address' },
          { name: 'score', type: 'uint256', internalType: 'uint256' },
          { name: 'wave', type: 'uint256', internalType: 'uint256' },
          { name: 'heroId', type: 'string', internalType: 'string' },
          { name: 'timestamp', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPlayerBestScore',
    inputs: [
      { name: 'player', type: 'address', internalType: 'address' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Leaderboard.ScoreEntry',
        components: [
          { name: 'player', type: 'address', internalType: 'address' },
          { name: 'score', type: 'uint256', internalType: 'uint256' },
          { name: 'wave', type: 'uint256', internalType: 'uint256' },
          { name: 'heroId', type: 'string', internalType: 'string' },
          { name: 'timestamp', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'ScoreSubmitted',
    inputs: [
      { name: 'player', type: 'address', indexed: true, internalType: 'address' },
      { name: 'score', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'wave', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'heroId', type: 'string', indexed: false, internalType: 'string' },
      { name: 'timestamp', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewTopScore',
    inputs: [
      { name: 'player', type: 'address', indexed: true, internalType: 'address' },
      { name: 'score', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'rank', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
] as const;
