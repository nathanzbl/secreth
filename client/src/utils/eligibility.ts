import type { GameState } from '../../../shared/src/types/game';

/**
 * Returns the IDs of players eligible to be nominated as Chancellor.
 *
 * A player is ineligible if:
 * - They are dead
 * - They are the current President
 * - They were the President or Chancellor in the last elected government
 *   (term limits), except in games with 5 or fewer alive players where
 *   only the last Chancellor is term-limited
 */
export function getEligibleChancellors(gameState: GameState): string[] {
  const { players, currentPresidentId, lastElectedGovernment } = gameState;

  const alivePlayers = players.filter((p) => p.status === 'alive');
  const aliveCount = alivePlayers.length;

  const ineligibleIds = new Set<string>();

  // Current president cannot be chancellor
  if (currentPresidentId) {
    ineligibleIds.add(currentPresidentId);
  }

  if (lastElectedGovernment) {
    // Last chancellor is always term-limited
    ineligibleIds.add(lastElectedGovernment.chancellorId);

    // Last president is term-limited only if more than 5 alive players
    if (aliveCount > 5) {
      ineligibleIds.add(lastElectedGovernment.presidentId);
    }
  }

  return alivePlayers
    .filter((p) => !ineligibleIds.has(p.id))
    .map((p) => p.id);
}
