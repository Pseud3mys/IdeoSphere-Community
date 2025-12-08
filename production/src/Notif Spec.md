
# Spécifications d'Implémentation Frontend : Système de Notification

Ce document structure l'intégration du nouveau système de notification côté client.

## 1. Définitions des Types (`src/types/notifications.ts`)

```
export type NotificationType = 
  | 'NEW_COMMENT' 
  | 'MENTION' 
  | 'GROUP_INVITE' 
  | 'NEW_VERSION' 
  | 'IDEA_INSPIRED_BY'
  | 'BADGE_UNLOCKED';

export interface NotificationData {
  actorId: string;
  resourceId: string;
  actorName?: string; // Peut être résolu côté client ou enrichi par le back
  preview?: string;
  groupName?: string;
  badgeIcon?: string;
}

export interface AppNotification {
  _key: string;
  recipientId: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  data: NotificationData;
}

```

## 2. Helper de Texte et Redirection (`src/utils/notificationUtils.ts`)

Centralisation des textes pour faciliter la maintenance et l'i18n.

```
import { AppNotification } from '../types/notifications';

export const getNotificationText = (n: AppNotification): string => {
  const name = n.data.actorName || "Un utilisateur";
  
  switch (n.type) {
    case 'NEW_COMMENT':
      return `${name} a commenté votre publication : "${n.data.preview}"`;
    case 'NEW_VERSION':
      return `Une nouvelle version a été créée à partir de votre idée.`;
    case 'IDEA_INSPIRED_BY':
      return `${name} a créé une idée inspirée par la vôtre.`;
    case 'GROUP_INVITE':
      return `${name} vous invite à rejoindre le groupe "${n.data.groupName}".`;
    case 'MENTION':
      return `${name} vous a mentionné.`;
    default:
      return "Nouvelle notification.";
  }
};

export const getNotificationLink = (n: AppNotification): string => {
  switch (n.type) {
    case 'NEW_COMMENT':
    case 'NEW_VERSION':
      return `/idea/${n.data.resourceId}`; // Ou /post/ selon le contexte
    case 'GROUP_INVITE':
      return `/groups/${n.data.resourceId}`;
    default:
      return '/dashboard';
  }
};

```

## 3. Le Context (`src/context/NotificationContext.tsx`)

Gère le polling (niveau 1) et prépare le terrain pour les Sockets (niveau 3).

```
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppNotification } from '../types/notifications';
import { apiClient } from '../api/apiClient'; // Votre client Axios existant
import { toast } from 'sonner';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  // Fetch initial
  const fetchNotifications = async () => {
    try {
      const { data } = await apiClient.get('/notifications');
      setNotifications(data);
    } catch (e) { console.error(e); }
  };

  // Polling (Transition vers Socket plus tard)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // 1 min
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    // Optimistic Update
    setNotifications(prev => prev.map(n => n._key === id ? { ...n, isRead: true } : n));
    await apiClient.post('/notifications/mark-read', { ids: [id] });
  };
  
  const markAllAsRead = async () => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await apiClient.post('/notifications/mark-all-read');
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotifications must be used within Provider");
    return context;
};

```

## 4. Composant UI (`src/components/NotificationBell.tsx`)

À insérer dans `src/components/AppHeader.tsx`.

```
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/context/NotificationContext';
import { getNotificationText, getNotificationLink } from '@/utils/notificationUtils';
import { useNavigate } from 'react-router-dom';

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleClick = (n: any) => {
    markAsRead(n._key);
    navigate(getNotificationLink(n));
  };

  return (
    <Popover>
      <PopoverTrigger className="relative">
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-h-96 overflow-y-auto">
        <div className="p-4 border-b font-semibold">Notifications</div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Aucune notification</div>
        ) : (
          notifications.map(n => (
            <div 
                key={n._key} 
                onClick={() => handleClick(n)}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50' : ''}`}
            >
              <p className="text-sm">{getNotificationText(n)}</p>
              <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
};

```