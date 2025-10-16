import { useEffect } from 'react';
import { useEntityStoreSimple } from './useEntityStoreSimple';

/**
 * Hook qui synchronise l'état de l'application avec l'URL
 * Permet la navigation via URL et le bouton retour du navigateur
 */
export function useUrlSync() {
  const { store, actions } = useEntityStoreSimple();

  // Synchroniser l'URL avec l'état actuel
  useEffect(() => {
    const currentPath = buildPathFromState(store.activeTab, store.selectedIdeaId, store.selectedPostId, store.selectedUserId);
    const browserPath = window.location.pathname;

    // Ne mettre à jour l'URL que si elle est différente
    if (currentPath !== browserPath) {
      window.history.pushState({}, '', currentPath);
    }
  }, [store.activeTab, store.selectedIdeaId, store.selectedPostId, store.selectedUserId]);

  // Écouter les changements d'URL (bouton retour/avant du navigateur)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      updateStateFromPath(path, actions);
    };

    window.addEventListener('popstate', handlePopState);
    
    // Initialiser l'état depuis l'URL au chargement
    const initialPath = window.location.pathname;
    if (initialPath !== '/') {
      updateStateFromPath(initialPath, actions);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [actions]);
}

/**
 * Construit le chemin URL depuis l'état de l'application
 */
function buildPathFromState(
  activeTab: string,
  selectedIdeaId: string | null,
  selectedPostId: string | null,
  selectedUserId: string | null
): string {
  switch (activeTab) {
    case 'welcome':
      return '/';
    case 'discovery':
      return '/feed';
    case 'my-ideas':
      return '/mes-contributions';
    case 'create-idea':
      return '/creer-idee';
    case 'communities':
      return '/communautes';
    case 'community-detail':
      return '/communautes/detail';
    case 'idea-detail':
      return selectedIdeaId ? `/idees/${selectedIdeaId}` : '/feed';
    case 'post-detail':
      return selectedPostId ? `/posts/${selectedPostId}` : '/feed';
    case 'profile':
      if (selectedUserId) {
        return `/profil/${selectedUserId}`;
      }
      return '/mon-profil';
    case 'signup':
      return '/inscription';
    case 'about':
      return '/a-propos';
    case 'how-it-works':
      return '/comment-ca-marche';
    case 'faq':
      return '/faq';
    case 'privacy':
      return '/confidentialite';
    case 'terms':
      return '/conditions';
    default:
      return '/';
  }
}

/**
 * Met à jour l'état de l'application depuis le chemin URL
 */
function updateStateFromPath(path: string, actions: any) {
  // Retirer le slash de fin si présent
  const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;

  // Page d'accueil
  if (cleanPath === '/' || cleanPath === '') {
    actions.goToTab('welcome');
    return;
  }

  // Feed / Discovery
  if (cleanPath === '/feed') {
    actions.fetchFeed();
    return;
  }

  // Mes contributions
  if (cleanPath === '/mes-contributions') {
    actions.fetchMyContributions();
    return;
  }

  // Créer une idée
  if (cleanPath === '/creer-idee') {
    actions.goToTab('create-idea');
    return;
  }

  // Communautés
  if (cleanPath === '/communautes') {
    actions.goToTab('communities');
    return;
  }

  if (cleanPath.startsWith('/communautes/')) {
    actions.goToTab('community-detail');
    return;
  }

  // Détail d'une idée
  if (cleanPath.startsWith('/idees/')) {
    const ideaId = cleanPath.replace('/idees/', '');
    actions.setSelectedIdeaId(ideaId);
    actions.setActiveTab('idea-detail');
    return;
  }

  // Détail d'un post
  if (cleanPath.startsWith('/posts/')) {
    const postId = cleanPath.replace('/posts/', '');
    actions.setSelectedPostId(postId);
    actions.setActiveTab('post-detail');
    return;
  }

  // Profil utilisateur
  if (cleanPath === '/mon-profil') {
    actions.fetchMyProfile();
    return;
  }

  if (cleanPath.startsWith('/profil/')) {
    const userId = cleanPath.replace('/profil/', '');
    actions.setSelectedUserId(userId);
    actions.setActiveTab('profile');
    return;
  }

  // Inscription
  if (cleanPath === '/inscription') {
    actions.goToTab('signup');
    return;
  }

  // Pages footer
  if (cleanPath === '/a-propos') {
    actions.goToTab('about');
    return;
  }

  if (cleanPath === '/comment-ca-marche') {
    actions.goToTab('how-it-works');
    return;
  }

  if (cleanPath === '/faq') {
    actions.goToTab('faq');
    return;
  }

  if (cleanPath === '/confidentialite') {
    actions.goToTab('privacy');
    return;
  }

  if (cleanPath === '/conditions') {
    actions.goToTab('terms');
    return;
  }

  // Par défaut, retourner à l'accueil
  console.warn('⚠️ Chemin non reconnu:', cleanPath);
  actions.goToTab('welcome');
}
