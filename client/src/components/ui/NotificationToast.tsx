import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';

type NotificationType = 'info' | 'success' | 'error' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

const typeClasses: Record<NotificationType, string> = {
  info: 'bg-stone-900/95 border-stone-600/50 text-parchment-200',
  success: 'bg-stone-900/95 border-green-700/50 text-green-300',
  error: 'bg-stone-900/95 border-red-800/50 text-red-300',
  warning: 'bg-stone-900/95 border-amber-700/50 text-amber-300',
};

export const NotificationToast: React.FC = () => {
  const notifications = useGameStore((state) => state.notifications);
  const removeNotification = useGameStore((state) => state.clearNotification);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification: Notification) => (
          <ToastItem
            key={notification.id}
            notification={notification}
            onDismiss={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastItemProps {
  notification: Notification;
  onDismiss: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        pointer-events-auto max-w-sm rounded-lg border px-4 py-3
        shadow-dramatic flex items-start gap-3 cursor-pointer font-body
        ${typeClasses[notification.type]}
      `}
      onClick={onDismiss}
    >
      <p className="text-sm font-medium leading-snug">{notification.message}</p>
    </motion.div>
  );
};
