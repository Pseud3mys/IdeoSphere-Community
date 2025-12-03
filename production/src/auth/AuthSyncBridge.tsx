// src/auth/AuthSyncBridge.tsx
import { useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';

export function AuthSyncBridge() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { actions, apiActions, store, getCurrentUser } = useEntityStoreSimple();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Si l'user n'est pas encore dans le store ou si c'est un user différent
      if (store.currentUserId !== user.id) {
        console.log('🔄 [AuthSync] Synchro User -> Store:', user.name);
        console.log('📝 [AuthSync] Bio de l\'utilisateur:', user.bio);
        
        const safeUser = {
          ...user,
          isRegistered: true // Force l'état enregistré pour l'UI
        };
        
        // Ajouter l'utilisateur au store s'il n'existe pas
        if (!store.users[user.id]) {
          actions.addUser(safeUser);
        }
        
        // Définir comme utilisateur courant
        actions.setCurrentUserId(user.id);
        
        console.log('✅ [AuthSync] Utilisateur synchronisé:', user.id);
        
        // ✅ Charger les groupes de l'utilisateur
        apiActions.loadUserGroups(user.id).then(result => {
          if (result) {
            console.log(`✅ [AuthSync] Groupes chargés pour ${user.name}:`, {
              actifs: result.groupsWithMemberships.length,
              pending: result.pendingGroups.length
            });
          }
        });
      }
    } else if (!isLoading && !isAuthenticated) {
      // Utilisateur déconnecté - MAIS ne pas clear si c'est un invité
      if (store.currentUserId) {
        const currentUser = getCurrentUser();
        const isGuestUser = currentUser?.id.startsWith('guest-') || currentUser?.isRegistered === false;
        
        if (!isGuestUser) {
          console.log('🚪 [AuthSync] Déconnexion détectée, clear du currentUserId');
          actions.setCurrentUserId(null);
        } else {
          console.log('👤 [AuthSync] Utilisateur invité détecté, conservation du currentUserId');
        }
      }
    }
  }, [isAuthenticated, user, isLoading, actions, apiActions, store.currentUserId, store.users, getCurrentUser]);

  return null;
}