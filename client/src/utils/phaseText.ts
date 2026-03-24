import type { GamePhase } from '../../../shared/src/types/game';

interface PhaseInfo {
  title: string;
  description: string;
}

const phaseTextMap: Record<GamePhase, PhaseInfo> = {
  'lobby': {
    title: 'Waiting Room',
    description: 'Waiting for players to join and the host to start the game.',
  },
  'role-reveal': {
    title: 'Role Assignment',
    description: 'Your secret identity has been assigned. Memorize your role.',
  },
  'election-nominate': {
    title: 'Nomination',
    description: 'The President must nominate a Chancellor candidate.',
  },
  'election-vote': {
    title: 'Election',
    description: 'All players vote Ja or Nein on the proposed government.',
  },
  'election-result': {
    title: 'Election Result',
    description: 'The votes have been tallied. The results are in.',
  },
  'legislative-president': {
    title: 'Legislative Session',
    description: 'The President is reviewing three policies and must discard one.',
  },
  'legislative-chancellor': {
    title: 'Legislative Session',
    description: 'The Chancellor is choosing which policy to enact.',
  },
  'executive-action': {
    title: 'Executive Action',
    description: 'The President must exercise a presidential power.',
  },
  'game-over': {
    title: 'Game Over',
    description: 'The game has concluded. All roles are revealed.',
  },
};

export function getPhaseText(phase: GamePhase): PhaseInfo {
  return phaseTextMap[phase];
}
