import type { WinCondition } from '../../../shared/src/types/game';

interface WinMessage {
  headline: string;
  description: string;
}

const winConditionMessages: Record<WinCondition, WinMessage> = {
  'liberals-policies': {
    headline: 'Liberals Win!',
    description: 'Five Liberal policies have been enacted. Democracy prevails!',
  },
  'liberals-hitler-killed': {
    headline: 'Liberals Win!',
    description: 'Hitler has been executed. The threat has been eliminated!',
  },
  'fascists-policies': {
    headline: 'Fascists Win!',
    description: 'Six Fascist policies have been enacted. Darkness descends upon the land.',
  },
  'fascists-hitler-elected': {
    headline: 'Fascists Win!',
    description: 'Hitler was elected Chancellor after three Fascist policies. The conspiracy is complete.',
  },
};

export function getWinConditionText(condition: WinCondition): WinMessage {
  return winConditionMessages[condition];
}
