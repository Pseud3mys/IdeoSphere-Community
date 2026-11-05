// src/components/NotificationBell.tsx
// Cloche de l'en-tête : pastille des non lues, et les dernières notifications au clic.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useNotifications } from '../context/NotificationContext';
import { AppNotification } from '../api/notificationService';
import { notificationTarget } from '../utils/notificationText';
import { NotificationItem } from './NotificationItem';

const SHOWN = 8;

export function NotificationBell() {
  const { enabled, notifications, unread, isLoading, refresh, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  if (!enabled) return null;

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) refresh();
  };

  const openNotification = (n: AppNotification) => {
    setOpen(false);
    markRead([n.key]);
    navigate(notificationTarget(n));
  };

  const seeAll = () => {
    setOpen(false);
    navigate('/my-contributions?tab=notifications');
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
          title="Notifications"
          aria-label={unread > 0 ? `Notifications : ${unread} non lue${unread > 1 ? 's' : ''}` : 'Notifications'}
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span
              className="absolute flex items-center justify-center rounded-full text-white font-semibold"
              style={{ top: 0, right: 0, minWidth: 18, height: 18, padding: '0 4px', fontSize: 11, lineHeight: 1, backgroundColor: '#ef4444' }}
            >
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        collisionPadding={16}
        className="p-0"
        style={{ width: 'min(24rem, calc(100vw - 2rem))' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-gray-900">Notifications</span>
          {unread > 0 && (
            <button type="button" onClick={markAllRead} className="text-sm text-primary hover:underline">
              Tout marquer comme lu
            </button>
          )}
        </div>

        <div className="overflow-y-auto p-1" style={{ maxHeight: '24rem' }}>
          {isLoading && notifications.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8 px-4">
              Rien de neuf pour le moment. Vous serez prévenu ici quand on réagira à vos contenus.
            </p>
          ) : (
            notifications.slice(0, SHOWN).map((n) => (
              <NotificationItem key={n.key} notification={n} onClick={openNotification} compact />
            ))
          )}
        </div>

        <div className="border-t">
          <button type="button" onClick={seeAll} className="w-full text-sm text-primary hover:bg-gray-50 py-3">
            Voir toutes les notifications
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
