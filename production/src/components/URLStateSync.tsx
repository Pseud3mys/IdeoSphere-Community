import { useEffect, useRef } from 'react';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { TabType } from '../types';

/**
 * Composant de synchronisation entre l'URL (query params) et l'état de l'application
 * Utilise les paramètres de requête (ex: ?tab=discovery&ideaId=123)
 * Ne rend rien visuellement, gère uniquement la logique de synchronisation URL
 */
export function URLStateSync() {
  const { store, actions } = useEntityStoreSimple();
  const { activeTab, selectedIdeaId, selectedPostId, selectedUserId } = store;
  
  // Flags pour éviter les boucles infinies
  const isUpdatingUrl = useRef(false);
  const isUpdatingState = useRef(false);

  // --- 1. Synchronisation de l'état de l'app VERS l'URL ---
  useEffect(() => {
    // Ignorer si on est en train de mettre à jour l'état depuis l'URL
    if (isUpdatingState.current) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    let hasChanges = false;

    // Synchroniser activeTab
    const currentTab = searchParams.get('tab');
    if (activeTab !== 'welcome' && currentTab !== activeTab) {
      searchParams.set('tab', activeTab);
      hasChanges = true;
    } else if (activeTab === 'welcome' && currentTab) {
      searchParams.delete('tab');
      hasChanges = true;
    }

    // Synchroniser selectedIdeaId
    const currentIdeaId = searchParams.get('ideaId');
    if (selectedIdeaId && currentIdeaId !== selectedIdeaId) {
      searchParams.set('ideaId', selectedIdeaId);
      hasChanges = true;
    } else if (!selectedIdeaId && currentIdeaId) {
      searchParams.delete('ideaId');
      hasChanges = true;
    }

    // Synchroniser selectedPostId
    const currentPostId = searchParams.get('postId');
    if (selectedPostId && currentPostId !== selectedPostId) {
      searchParams.set('postId', selectedPostId);
      hasChanges = true;
    } else if (!selectedPostId && currentPostId) {
      searchParams.delete('postId');
      hasChanges = true;
    }

    // Synchroniser selectedUserId
    const currentUserId = searchParams.get('userId');
    if (selectedUserId && currentUserId !== selectedUserId) {
      searchParams.set('userId', selectedUserId);
      hasChanges = true;
    } else if (!selectedUserId && currentUserId) {
      searchParams.delete('userId');
      hasChanges = true;
    }

    // Mettre à jour l'URL seulement si quelque chose a changé
    if (hasChanges) {
      isUpdatingUrl.current = true;
      const newUrl = searchParams.toString() 
        ? `${window.location.pathname}?${searchParams.toString()}`
        : window.location.pathname;
      window.history.pushState({}, '', newUrl);
      
      // Réinitialiser le flag
      requestAnimationFrame(() => {
        isUpdatingUrl.current = false;
      });
    }
  }, [activeTab, selectedIdeaId, selectedPostId, selectedUserId]);

  // --- 2. Synchronisation de l'URL VERS l'état de l'app ---
  useEffect(() => {
    const syncUrlToState = () => {
      // Ignorer si on est en train de mettre à jour l'URL
      if (isUpdatingUrl.current) {
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const tab = searchParams.get('tab') as TabType | null;
      const ideaId = searchParams.get('ideaId');
      const postId = searchParams.get('postId');
      const userId = searchParams.get('userId');

      // Activer le flag pour éviter la boucle
      isUpdatingState.current = true;

      // Priorité aux pages de détail
      if (ideaId && store.selectedIdeaId !== ideaId) {
        // Charger l'idée en détail
        actions.goToIdea(ideaId);
      } else if (postId && store.selectedPostId !== postId) {
        // Charger le post en détail
        actions.goToPost(postId);
      } else if (userId && store.selectedUserId !== userId) {
        // Charger le profil utilisateur
        actions.goToUser(userId);
      } else if (tab && store.activeTab !== tab) {
        // Changer d'onglet
        actions.goToTab(tab);
      } else if (!tab && !ideaId && !postId && !userId && store.activeTab !== 'discovery') {
        // Si aucun paramètre, aller vers discovery par défaut (sauf si on est sur welcome)
        if (store.hasEnteredPlatform) {
          actions.goToTab('discovery');
        }
      }

      // Réinitialiser le flag
      requestAnimationFrame(() => {
        isUpdatingState.current = false;
      });
    };

    // Synchroniser au chargement initial
    syncUrlToState();

    // Écouter les changements d'URL (boutons précédent/suivant)
    const handlePopState = () => {
      syncUrlToState();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [actions, store.selectedIdeaId, store.selectedPostId, store.selectedUserId, store.activeTab, store.hasEnteredPlatform]);

  return null; // Ce composant ne rend rien
}
