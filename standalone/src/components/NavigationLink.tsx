import React from 'react';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { TabType } from '../types';

interface NavigationLinkProps {
  href?: string;
  tab?: TabType;
  ideaId?: string;
  postId?: string;
  userId?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Composant de lien pour la navigation interne
 * Utilise le système de navigation de l'application au lieu de recharger la page
 * 
 * @example
 * <NavigationLink tab="discovery">Fil d'actualité</NavigationLink>
 * <NavigationLink ideaId="idea-123">Voir l'idée</NavigationLink>
 * <NavigationLink href="?tab=discovery&ideaId=idea-123">Lien personnalisé</NavigationLink>
 */
export function NavigationLink({
  href,
  tab,
  ideaId,
  postId,
  userId,
  children,
  className,
  onClick
}: NavigationLinkProps) {
  const { actions } = useEntityStoreSimple();

  // Construire l'URL avec les query params
  const buildUrl = () => {
    if (href) return href;
    
    const params = new URLSearchParams();
    if (tab) params.set('tab', tab);
    if (ideaId) params.set('ideaId', ideaId);
    if (postId) params.set('postId', postId);
    if (userId) params.set('userId', userId);
    
    return params.toString() ? `?${params.toString()}` : '/';
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Si l'utilisateur fait Cmd/Ctrl+Click ou clic du milieu, laisser le comportement par défaut
    if (e.metaKey || e.ctrlKey || e.button === 1) {
      return;
    }

    e.preventDefault();

    // Appeler le onClick custom si fourni
    if (onClick) {
      onClick(e);
    }

    // Naviguer via les actions du store
    if (ideaId) {
      actions.goToIdea(ideaId);
    } else if (postId) {
      actions.goToPost(postId);
    } else if (userId) {
      actions.goToUser(userId);
    } else if (tab) {
      actions.goToTab(tab);
    }
  };

  return (
    <a
      href={buildUrl()}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
