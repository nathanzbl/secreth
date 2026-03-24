import { describe, it, expect } from 'vitest';
import {
  ROLE_DISTRIBUTION,
  POLICY_COUNTS,
  WIN_CONDITIONS,
  FASCIST_BOARD_POWERS,
  getFascistBoardKey,
  getPowerForFascistPolicy,
} from './constants';

describe('ROLE_DISTRIBUTION', () => {
  it.each([5, 6, 7, 8, 9, 10])('has an entry for %i players', (count) => {
    expect(ROLE_DISTRIBUTION[count]).toBeDefined();
  });

  it.each([
    [5, 3, 1],
    [6, 4, 1],
    [7, 4, 2],
    [8, 5, 2],
    [9, 5, 3],
    [10, 6, 3],
  ])('for %i players: %i liberals and %i fascists (plus Hitler)', (count, liberals, fascists) => {
    const dist = ROLE_DISTRIBUTION[count];
    expect(dist.liberals).toBe(liberals);
    expect(dist.fascists).toBe(fascists);
  });

  it.each([5, 6, 7, 8, 9, 10])(
    'total roles (liberals + fascists + 1 Hitler) equals %i for %i players',
    (count) => {
      const dist = ROLE_DISTRIBUTION[count];
      const total = dist.liberals + dist.fascists + 1; // +1 for Hitler
      expect(total).toBe(count);
    },
  );
});

describe('getFascistBoardKey', () => {
  it('returns "5-6" for 5 players', () => {
    expect(getFascistBoardKey(5)).toBe('5-6');
  });

  it('returns "5-6" for 6 players', () => {
    expect(getFascistBoardKey(6)).toBe('5-6');
  });

  it('returns "7-8" for 7 players', () => {
    expect(getFascistBoardKey(7)).toBe('7-8');
  });

  it('returns "7-8" for 8 players', () => {
    expect(getFascistBoardKey(8)).toBe('7-8');
  });

  it('returns "9-10" for 9 players', () => {
    expect(getFascistBoardKey(9)).toBe('9-10');
  });

  it('returns "9-10" for 10 players', () => {
    expect(getFascistBoardKey(10)).toBe('9-10');
  });
});

describe('getPowerForFascistPolicy', () => {
  describe('5-6 player games', () => {
    it('returns null for 1st fascist policy', () => {
      expect(getPowerForFascistPolicy(5, 1)).toBeNull();
    });

    it('returns null for 2nd fascist policy', () => {
      expect(getPowerForFascistPolicy(6, 2)).toBeNull();
    });

    it('returns "policy-peek" for 3rd fascist policy', () => {
      expect(getPowerForFascistPolicy(5, 3)).toBe('policy-peek');
    });

    it('returns "execution" for 4th fascist policy', () => {
      expect(getPowerForFascistPolicy(6, 4)).toBe('execution');
    });

    it('returns "execution" for 5th fascist policy', () => {
      expect(getPowerForFascistPolicy(5, 5)).toBe('execution');
    });
  });

  describe('7-8 player games', () => {
    it('returns null for 1st fascist policy', () => {
      expect(getPowerForFascistPolicy(7, 1)).toBeNull();
    });

    it('returns "investigate-loyalty" for 2nd fascist policy', () => {
      expect(getPowerForFascistPolicy(8, 2)).toBe('investigate-loyalty');
    });

    it('returns "special-election" for 3rd fascist policy', () => {
      expect(getPowerForFascistPolicy(7, 3)).toBe('special-election');
    });

    it('returns "execution" for 4th and 5th fascist policies', () => {
      expect(getPowerForFascistPolicy(8, 4)).toBe('execution');
      expect(getPowerForFascistPolicy(7, 5)).toBe('execution');
    });
  });

  describe('9-10 player games', () => {
    it('returns "investigate-loyalty" for 1st fascist policy', () => {
      expect(getPowerForFascistPolicy(9, 1)).toBe('investigate-loyalty');
    });

    it('returns "investigate-loyalty" for 2nd fascist policy', () => {
      expect(getPowerForFascistPolicy(10, 2)).toBe('investigate-loyalty');
    });

    it('returns "special-election" for 3rd fascist policy', () => {
      expect(getPowerForFascistPolicy(9, 3)).toBe('special-election');
    });

    it('returns "execution" for 4th and 5th fascist policies', () => {
      expect(getPowerForFascistPolicy(10, 4)).toBe('execution');
      expect(getPowerForFascistPolicy(9, 5)).toBe('execution');
    });
  });

  it('returns null for 6th fascist policy (all boards)', () => {
    expect(getPowerForFascistPolicy(5, 6)).toBeNull();
    expect(getPowerForFascistPolicy(7, 6)).toBeNull();
    expect(getPowerForFascistPolicy(9, 6)).toBeNull();
  });
});

describe('POLICY_COUNTS', () => {
  it('has 6 liberal policies', () => {
    expect(POLICY_COUNTS.liberal).toBe(6);
  });

  it('has 11 fascist policies', () => {
    expect(POLICY_COUNTS.fascist).toBe(11);
  });

  it('totals 17 policies', () => {
    expect(POLICY_COUNTS.liberal + POLICY_COUNTS.fascist).toBe(17);
  });
});

describe('WIN_CONDITIONS', () => {
  it('liberals win at 5 policies', () => {
    expect(WIN_CONDITIONS.liberal.policies).toBe(5);
  });

  it('fascists win at 6 policies', () => {
    expect(WIN_CONDITIONS.fascist.policies).toBe(6);
  });

  it('fascists can win by electing Hitler after 3 fascist policies', () => {
    expect(WIN_CONDITIONS.fascist.hitlerElectedAfter).toBe(3);
  });
});
