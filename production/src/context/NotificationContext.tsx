// src/context/NotificationContext.tsx
// Notifications partagées entre la cloche de l'en-tête et l'onglet « Notifications » de Mes contributions.
// Le nombre de non lues est interrogé toutes les minutes (et au retour sur l'onglet du navigateur) ;
// la liste est chargée à l'ouverture de la cloche ou de l'onglet.
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './authContext';
import {
  AppNotification,
  fetchNotifications,
  fetchUnreadCount,
  markNotificationsRead,
} from '../api/notificationService';

const POLL_MS = 60_000;
const PAGE_SIZE = 20;

interface NotificationContextValue {
  enabled: boolean;          // utilisateur connecté : les notifications existent
  notifications: AppNotification[];
  unread: number;
  isLoading: boolean;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (keys: string[]) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const noop = async () => {};
const NotificationContext = createContext<NotificationContextValue>({
  enabled: false,
  notifications: [],
  unread: 0,
  isLoading: false,
  hasMore: false,
  refresh: noop,
  loadMore: noop,
  markRead: noop,
  markAllRead: noop,
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const enabled = isAuthenticated && !authLoading;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const loaded = useRef(false);   // la liste a déjà été chargée : la tenir à jour
  const unreadRef = useRef(0);
  const request = useRef(0);      // ignorer les réponses dépassées

  const applyUnread = (count: number) => {
    unreadRef.current = count;
    setUnread(count);
  };

  const refresh = useCallback(async () => {
    if (!enabled) return;
    const id = ++request.current;
    setIsLoading(true);
    const page = await fetchNotifications(PAGE_SIZE, 0);
    if (id !== request.current) return;
    if (page) {
      setNotifications(page.data);
      setHasMore(page.data.length === PAGE_SIZE);
      applyUnread(page.unread);
      loaded.current = true;
    }
    setIsLoading(false);
  }, [enabled]);

  const loadMore = useCallback(async () => {
    if (!enabled) return;
    const page = await fetchNotifications(PAGE_SIZE, notifications.length);
    if (!page) return;
    setNotifications((prev) => [...prev, ...page.data.filter((n) => !prev.some((p) => p.key === n.key))]);
    setHasMore(page.data.length === PAGE_SIZE);
    applyUnread(page.unread);
  }, [enabled, notifications.length]);

  const markRead = useCallback(async (keys: string[]) => {
    const unreadKeys = notifications.filter((n) => keys.includes(n.key) && !n.isRead).map((n) => n.key);
    if (unreadKeys.length === 0) return;
    setNotifications((prev) => prev.map((n) => (unreadKeys.includes(n.key) ? { ...n, isRead: true } : n)));
    applyUnread(Math.max(0, unreadRef.current - unreadKeys.length));
    if (!(await markNotificationsRead(unreadKeys))) await refresh();
  }, [notifications, refresh]);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    applyUnread(0);
    if (!(await markNotificationsRead('all'))) await refresh();
  }, [refresh]);

  // Pastille : interrogée régulièrement ; si elle change et que la liste est affichée, on la recharge
  useEffect(() => {
    if (!enabled) {
      setNotifications([]);
      applyUnread(0);
      loaded.current = false;
      return;
    }
    let cancelled = false;
    const poll = async () => {
      const count = await fetchUnreadCount();
      if (cancelled || count === null) return;
      if (count !== unreadRef.current && loaded.current) await refresh();
      else applyUnread(count);
    };
    poll();
    const timer = window.setInterval(poll, POLL_MS);
    window.addEventListener('focus', poll);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener('focus', poll);
    };
  }, [enabled, refresh]);

  return (
    <NotificationContext.Provider
      value={{ enabled, notifications, unread, isLoading, hasMore, refresh, loadMore, markRead, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

/** Hors du NotificationProvider (pages publiques), renvoie un état vide : rien n'est affiché. */
export const useNotifications = () => useContext(NotificationContext);
