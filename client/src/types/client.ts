export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: number;
}

export type Screen = 'home' | 'lobby' | 'game' | 'admin';
