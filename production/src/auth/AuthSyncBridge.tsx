// src/auth/AuthSyncBridge.tsx
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/authContext';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';

/**
 * Pose l'utilisateur courant dans le store au démarrage :
 * - session Keycloak : le membre synchronisé par AuthProvider (+ ses groupes) ;
 * - sinon : l'invité mémorisé dans ce navigateur, s'il y en a un.
 * Ne crée jamais de compte invité : c'est fait à la première action (voir hooks/guestSession.ts).
 */
export function AuthSyncBridge() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { actions, apiActions, store, getUserById } = useEntityStoreSimple();
  const groupsLoadedFor = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      if (store.currentUserId !== user.id) {
        console.log('🔄 [AuthSync] Synchro User -> Store:', user.name);
        actions.addUser({ ...user, isRegistered: true }); // Force l'état enregistré pour l'UI
        actions.setCurrentUserId(user.id);
      }

      // Charger les groupes une seule fois par membre (même si une action l'a déjà posé dans le store)
      if (groupsLoadedFor.current !== user.id) {
        groupsLoadedFor.current = user.id;
        apiActions.loadUserGroups(user.id).then(result => {
          if (result) {
            console.log(`✅ [AuthSync] Groupes chargés pour ${user.name}:`, {
              actifs: result.groupsWithMemberships.length,
              pending: result.pendingGroups.length
            });
          }
        });
      }
    } else if (!isAuthenticated) {
      // Pas de session Keycloak : retrouver l'invité mémorisé (aucune création ici)
      const current = store.currentUserId ? getUserById(store.currentUserId) : null;
      if (!current?.id.startsWith('users/')) {
        apiActions.resolveSession();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, isLoading, store.currentUserId]);

  return null;
}
