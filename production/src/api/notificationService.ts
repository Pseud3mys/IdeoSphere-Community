// src/api/notificationService.ts
// Notifications de l'utilisateur connecté (regroupées par contenu côté serveur).
// GET /api/notifications, GET /api/notifications/unread-count, POST /api/notifications/read
import apiClient from './apiClient';

export type NotificationKind =
  | 'support'      // soutiens sur mon contenu
  | 'rating'       // évaluations de mon projet
  | 'comment'      // commentaires sur mon post
  | 'thread'       // commentaires sur un post où j'ai commenté
  | 'reply'        // réponse à mon commentaire
  | 'inspiration'  // contenu créé à partir du mien
  | 'discussion'   // discussion ouverte sur mon projet
  | 'popular';     // contenu que je soutiens / où je participe qui suscite de l'intérêt

export interface NotificationActor {
  id: string;
  name: string;
  avatar: string | null;
}

export interface NotificationContentRef {
  id: string; // posts/123, ideas/456
  type: 'posts' | 'ideas';
  title: string;
}

export interface AppNotification {
  key: string;
  kind: NotificationKind;
  isRead: boolean;
  date: string;
  count: number;          // personnes (soutiens, notes, populaire) ou actions (commentaires…)
  people: number;         // personnes différentes
  actors: NotificationActor[]; // les 3 plus récentes
  preview: string | null; // extrait du dernier commentaire / titre du contenu créé
  content: NotificationContentRef;
  link: NotificationContentRef | null; // contenu créé (inspiration, discussion)
  relation?: 'supporter' | 'participant' | null; // populaire
  popular?: boolean;      // populaire : « devient populaire » plutôt que « suscite de l'intérêt »
}

export interface NotificationPage {
  data: AppNotification[];
  unread: number;
}

export async function fetchNotifications(limit = 20, offset = 0): Promise<NotificationPage | null> {
  try {
    const response = await apiClient.get('/notifications', { params: { limit, offset } });
    return response.data;
  } catch (error) {
    console.error('❌ [Notifications] Chargement impossible :', error);
    return null;
  }
}

export async function fetchUnreadCount(): Promise<number | null> {
  try {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.unread;
  } catch {
    return null;
  }
}

/** Marque comme lues les notifications données, ou toutes. */
export async function markNotificationsRead(keys: string[] | 'all'): Promise<boolean> {
  try {
    await apiClient.post('/notifications/read', keys === 'all' ? { all: true } : { keys });
    return true;
  } catch (error) {
    console.error('❌ [Notifications] Impossible de marquer comme lu :', error);
    return false;
  }
}
