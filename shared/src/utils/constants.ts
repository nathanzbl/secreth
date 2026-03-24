export const MIN_PLAYERS = 5;
export const MAX_PLAYERS = 10;

export const POLICY_COUNTS = {
  liberal: 6,
  fascist: 11,
} as const;

export const WIN_CONDITIONS = {
  liberal: { policies: 5 },
  fascist: { policies: 6, hitlerElectedAfter: 3 },
} as const;

export const ELECTION_TRACKER_LIMIT = 3;

// Role distribution by player count
// [liberals, fascists (non-Hitler), + always 1 Hitler]
export const ROLE_DISTRIBUTION: Record<number, { liberals: number; fascists: number }> = {
  5:  { liberals: 3, fascists: 1 },
  6:  { liberals: 4, fascists: 1 },
  7:  { liberals: 4, fascists: 2 },
  8:  { liberals: 5, fascists: 2 },
  9:  { liberals: 5, fascists: 3 },
  10: { liberals: 6, fascists: 3 },
};

// Fascist board powers by player count and policy slot (1-indexed)
// null means no power granted
export type FascistBoardPowers = Array<null | 'policy-peek' | 'investigate-loyalty' | 'special-election' | 'execution'>;

export const FASCIST_BOARD_POWERS: Record<'5-6' | '7-8' | '9-10', FascistBoardPowers> = {
  '5-6':  [null,        null,         'policy-peek',          'execution',    'execution',    null],
  '7-8':  [null,        'investigate-loyalty', 'special-election', 'execution', 'execution', null],
  '9-10': ['investigate-loyalty', 'investigate-loyalty', 'special-election', 'execution', 'execution', null],
};

export function getFascistBoardKey(playerCount: number): '5-6' | '7-8' | '9-10' {
  if (playerCount <= 6) return '5-6';
  if (playerCount <= 8) return '7-8';
  return '9-10';
}

export function getPowerForFascistPolicy(playerCount: number, fascistPoliciesEnacted: number): FascistBoardPowers[number] {
  const key = getFascistBoardKey(playerCount);
  const powers = FASCIST_BOARD_POWERS[key];
  // fascistPoliciesEnacted is 1-based when this is called (the policy was just enacted)
  return powers[fascistPoliciesEnacted - 1] ?? null;
}
