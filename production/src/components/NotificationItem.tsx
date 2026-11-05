// src/components/NotificationItem.tsx
// Une notification (cloche de l'en-tête et onglet « Notifications » de Mes contributions).
import { CornerDownRight, Flame, Heart, Lightbulb, MessageCircle, MessagesSquare, TrendingUp } from 'lucide-react';
import { AppNotification, NotificationKind } from '../api/notificationService';
import { notificationText, timeAgo } from '../utils/notificationText';

// Le CSS Tailwind est pré-compilé (src/index.css) : les couleurs passent par `style`.
const KIND_ICON: Record<NotificationKind, { icon: typeof Heart; color: string }> = {
  support: { icon: Heart, color: '#ef4444' },
  rating: { icon: TrendingUp, color: '#16a34a' },
  comment: { icon: MessageCircle, color: '#3b82f6' },
  thread: { icon: MessageCircle, color: '#3b82f6' },
  reply: { icon: CornerDownRight, color: '#3b82f6' },
  inspiration: { icon: Lightbulb, color: '#eab308' },
  discussion: { icon: MessagesSquare, color: '#8b5cf6' },
  popular: { icon: Flame, color: '#f97316' },
};

const UNREAD_BG = '#eff6ff';

function Avatar({ n }: { n: AppNotification }) {
  const { icon: Icon, color } = KIND_ICON[n.kind] ?? KIND_ICON.comment;
  const actor = n.actors[0];

  return (
    <div className="relative flex-shrink-0" style={{ width: 40, height: 40 }}>
      {n.kind === 'popular' || !actor ? (
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}1a` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      ) : (
        <>
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-600 font-medium">
            {actor.avatar
              ? <img src={actor.avatar} alt="" className="w-full h-full" style={{ objectFit: 'cover' }} />
              : (actor.name || '?').charAt(0).toUpperCase()}
          </div>
          <div
            className="absolute rounded-full flex items-center justify-center border-2 border-white"
            style={{ width: 20, height: 20, right: -4, bottom: -4, backgroundColor: color }}
          >
            <Icon className="text-white" style={{ width: 11, height: 11 }} />
          </div>
        </>
      )}
    </div>
  );
}

interface NotificationItemProps {
  notification: AppNotification;
  onClick: (n: AppNotification) => void;
  compact?: boolean; // cloche : extrait sur une ligne
}

export function NotificationItem({ notification: n, onClick, compact = false }: NotificationItemProps) {
  const { actors, action } = notificationText(n);
  // Extrait : le commentaire pour un commentaire ou une réponse, le nouveau contenu pour une inspiration ou une discussion
  const excerpt = n.kind === 'inspiration' || n.kind === 'discussion' ? n.link?.title : n.preview;

  return (
    <button
      type="button"
      onClick={() => onClick(n)}
      className="w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
      style={n.isRead ? undefined : { backgroundColor: UNREAD_BG }}
    >
      <Avatar n={n} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800">
          {actors && <span className="font-semibold">{actors} </span>}
          {action}
        </p>
        <p className={`text-sm text-gray-600 ${compact ? 'truncate' : ''}`} style={{ overflowWrap: 'anywhere' }}>
          « {n.content.title || 'Sans titre'} »
        </p>
        {excerpt && (
          <p className={`text-sm text-gray-500 italic ${compact ? 'truncate' : ''}`} style={{ overflowWrap: 'anywhere' }}>
            {excerpt}
          </p>
        )}
        <p className="text-xs mt-1" style={{ color: n.isRead ? '#6b7280' : '#2563eb' }}>{timeAgo(n.date)}</p>
      </div>
      {!n.isRead && (
        <span
          className="flex-shrink-0 rounded-full mt-2"
          style={{ width: 8, height: 8, backgroundColor: '#3b82f6' }}
          aria-label="Non lue"
        />
      )}
    </button>
  );
}
