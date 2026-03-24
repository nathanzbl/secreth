import { describe, it, expect } from 'vitest';
import { generateRoomCode, shuffle, generateId } from './helpers';

describe('generateRoomCode', () => {
  it('returns a string of length 4', () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(4);
  });

  it('only contains valid characters (no 0, O, 1, I)', () => {
    const validChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let i = 0; i < 100; i++) {
      const code = generateRoomCode();
      for (const char of code) {
        expect(validChars).toContain(char);
      }
    }
  });

  it('does not contain ambiguous characters 0, O, 1, or I', () => {
    const forbidden = ['0', 'O', '1', 'I'];
    for (let i = 0; i < 100; i++) {
      const code = generateRoomCode();
      for (const char of forbidden) {
        expect(code).not.toContain(char);
      }
    }
  });

  it('generates different codes across multiple calls', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 50; i++) {
      codes.add(generateRoomCode());
    }
    // With 30^4 = 810,000 possible codes, 50 calls should produce multiple unique codes
    expect(codes.size).toBeGreaterThan(1);
  });
});

describe('shuffle', () => {
  it('returns an array with the same elements', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffle(original);
    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it('does not mutate the original array', () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffle(original);
    expect(original).toEqual(copy);
  });

  it('produces a different order at least once over many runs', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let foundDifferentOrder = false;
    for (let i = 0; i < 50; i++) {
      const shuffled = shuffle(original);
      if (JSON.stringify(shuffled) !== JSON.stringify(original)) {
        foundDifferentOrder = true;
        break;
      }
    }
    expect(foundDifferentOrder).toBe(true);
  });

  it('handles an empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('handles a single-element array', () => {
    expect(shuffle([42])).toEqual([42]);
  });
});

describe('generateId', () => {
  it('returns a string', () => {
    expect(typeof generateId()).toBe('string');
  });

  it('returns a string of length 8', () => {
    const id = generateId();
    expect(id).toHaveLength(8);
  });

  it('only contains base-36 characters (a-z, 0-9)', () => {
    for (let i = 0; i < 50; i++) {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]+$/);
    }
  });

  it('generates unique IDs across multiple calls', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBeGreaterThan(1);
  });
});
