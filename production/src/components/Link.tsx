import { ReactNode, MouseEvent } from 'react';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';

interface LinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

/**
 * Composant Link personnalisé qui utilise la navigation interne
 * au lieu de recharger la page
 */
export function Link({ href, children, className }: LinkProps) {
  const { actions } = useEntityStoreSimple();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Empêcher le comportement par défaut du lien
    e.preventDefault();

    // Déterminer l'action à effectuer selon l'URL
    if (href === '/' || href === '') {
      actions.goToTab('welcome');
    } else if (href === '/feed') {
      actions.fetchFeed();
    } else if (href === '/mes-contributions') {
      actions.fetchMyContributions();
    } else if (href === '/creer-idee') {
      actions.goToTab('create-idea');
    } else if (href === '/communautes') {
      actions.goToTab('communities');
    } else if (href.startsWith('/idees/')) {
      const ideaId = href.replace('/idees/', '');
      actions.setSelectedIdeaId(ideaId);
      actions.setActiveTab('idea-detail');
    } else if (href.startsWith('/posts/')) {
      const postId = href.replace('/posts/', '');
      actions.setSelectedPostId(postId);
      actions.setActiveTab('post-detail');
    } else if (href === '/mon-profil') {
      actions.fetchMyProfile();
    } else if (href.startsWith('/profil/')) {
      const userId = href.replace('/profil/', '');
      actions.setSelectedUserId(userId);
      actions.setActiveTab('profile');
    } else if (href === '/a-propos') {
      actions.goToTab('about');
    } else if (href === '/comment-ca-marche') {
      actions.goToTab('how-it-works');
    } else if (href === '/faq') {
      actions.goToTab('faq');
    } else if (href === '/confidentialite') {
      actions.goToTab('privacy');
    } else if (href === '/conditions') {
      actions.goToTab('terms');
    } else {
      // Si l'URL n'est pas reconnue, utiliser la navigation normale
      window.location.href = href;
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
