// src/utils/notificationText.ts
// Textes des notifications, au même endroit pour pouvoir les retoucher facilement.
import { AppNotification } from '../api/notificationService';

const contentLabel = (n: AppNotification) => (n.content.type === 'ideas' ? 'projet' : 'post');

/** « Alice », « Alice et Bob », « Alice, Bob et 3 autres » */
export function actorsLabel(n: AppNotification): string {
  const names = n.actors.map((a) => a.name || 'Quelqu’un');
  const total = Math.max(n.people || 0, names.length);
  if (names.length === 0) return 'Quelqu’un';
  if (total === 1) return names[0];
  if (total === 2 && names.length >= 2) return `${names[0]} et ${names[1]}`;
  const others = total - 2;
  return `${names[0]}, ${names[1] ?? 'quelqu’un'} et ${others} autre${others > 1 ? 's' : ''}`;
}

/** Phrase complète : « Alice et Bob ont soutenu votre post » */
export function notificationText(n: AppNotification): { actors: string | null; action: string } {
  const plural = Math.max(n.people || 0, n.actors.length) > 1;
  const verb = (singular: string, many: string) => (plural ? many : singular);
  const what = contentLabel(n);
  const comments = n.count > 1 ? ` (${n.count} commentaires)` : '';

  switch (n.kind) {
    case 'support':
      return { actors: actorsLabel(n), action: `${verb('a', 'ont')} soutenu votre ${what}` };
    case 'rating':
      return { actors: actorsLabel(n), action: `${verb('a', 'ont')} évalué votre ${what}` };
    case 'comment':
      return { actors: actorsLabel(n), action: `${verb('a', 'ont')} commenté votre ${what}${comments}` };
    case 'thread':
      return { actors: actorsLabel(n), action: `${verb('a', 'ont')} aussi commenté un ${what} auquel vous participez${comments}` };
    case 'reply':
      return { actors: actorsLabel(n), action: `${verb('a', 'ont')} répondu à votre commentaire` };
    case 'inspiration':
      return {
        actors: actorsLabel(n),
        action: n.count > 1
          ? `${verb('a', 'ont')} créé ${n.count} contenus inspirés de votre ${what}`
          : `a créé un contenu inspiré de votre ${what}`,
      };
    case 'discussion':
      return { actors: actorsLabel(n), action: n.count > 1 ? `${verb('a', 'ont')} ouvert ${n.count} discussions sur votre ${what}` : `${verb('a', 'ont')} ouvert une discussion sur votre ${what}` };
    case 'popular': {
      const relation = n.relation === 'supporter' ? 'que vous soutenez' : n.content.type === 'ideas' ? 'auquel vous participez' : 'auquel vous avez participé';
      const state = n.popular ? 'devient populaire' : 'suscite de l’intérêt';
      return { actors: null, action: `Un ${what} ${relation} ${state} : ${n.count} personnes y ont réagi` };
    }
    default:
      return { actors: actorsLabel(n), action: `${verb('a', 'ont')} interagi avec votre ${what}` };
  }
}

/** Où mène un clic : le contenu créé pour une inspiration ou une discussion, sinon le contenu concerné */
export function notificationTarget(n: AppNotification): string {
  const ref = (n.kind === 'inspiration' || n.kind === 'discussion') && n.link ? n.link : n.content;
  return `/content/${ref.id}`;
}

/** « à l’instant », « il y a 5 min », « il y a 3 h », « hier », « 12 oct. » */
export function timeAgo(iso: string): string {
  const date = new Date(iso);
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'à l’instant';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'hier';
  if (days < 7) return `il y a ${days} jours`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: days > 300 ? 'numeric' : undefined });
}
