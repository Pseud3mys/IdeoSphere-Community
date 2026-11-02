import { SimpleEntityStore } from '../store/SimpleEntityStore';
import * as selectors from '../store/simpleSelectors';
import { User } from '../types';

/**
 * Identité de l'utilisateur courant : membre Keycloak ou compte invité.
 *
 * - resolveSession : retrouve l'identité EXISTANTE (membre connecté, ou invité
 *   mémorisé dans ce navigateur). Ne crée jamais de compte. À utiliser au
 *   démarrage et pour les lectures (feed...).
 * - ensureCurrentUser : idem, puis crée un compte invité s'il n'y a vraiment
 *   personne. À appeler uniquement au moment d'une action (soutenir, commenter,
 *   publier...), pas pour afficher une page.
 *
 * Les deux attendent la fin de l'initialisation Keycloak (un membre connecté ne
 * reçoit donc jamais d'invité) et partagent une promesse en cours : des appels
 * simultanés ne créent qu'un seul compte.
 */

/** Actions brutes du store utilisées ici */
interface SessionStoreActions {
  addUser: (user: User) => void;
  setCurrentUserId: (id: string | null) => void;
  setHasEnteredPlatform: (entered: boolean) => void;
}

const isBackendUser = (user: User | null | undefined): user is User =>
  !!user?.id?.startsWith('users/');

let resolvePromise: Promise<User | null> | null = null;
let ensurePromise: Promise<User | null> | null = null;

function adoptUser(user: User, actions: SessionStoreActions) {
  actions.addUser(user);
  actions.setCurrentUserId(user.id);
}

export function resolveSession(
  getStore: () => SimpleEntityStore,
  actions: SessionStoreActions
): Promise<User | null> {
  const current = selectors.getCurrentUser(getStore());
  if (isBackendUser(current)) return Promise.resolve(current);

  if (!resolvePromise) {
    resolvePromise = (async () => {
      const { initAuth, syncUserSession, restoreStoredGuest } = await import('../api/authService');

      if (await initAuth()) {
        // Membre Keycloak : même synchro que AuthProvider (promesse partagée, un seul appel API)
        const member = await syncUserSession();
        if (!member) return null;
        const registered = { ...member, isRegistered: true };
        adoptUser(registered, actions);
        return registered;
      }

      const guest = await restoreStoredGuest();
      if (guest) adoptUser(guest, actions);
      return guest;
    })()
      .catch(error => {
        console.error('❌ [guestSession] resolveSession:', error);
        return null;
      })
      .finally(() => {
        resolvePromise = null;
      });
  }
  return resolvePromise;
}

export function ensureCurrentUser(
  getStore: () => SimpleEntityStore,
  actions: SessionStoreActions
): Promise<User | null> {
  const current = selectors.getCurrentUser(getStore());
  if (isBackendUser(current)) return Promise.resolve(current);

  if (!ensurePromise) {
    ensurePromise = (async () => {
      const existing = await resolveSession(getStore, actions);
      if (existing) return existing;

      // Session Keycloak active mais synchro en échec : ne pas lui substituer un invité
      const { initAuth, createUnfinalizedAccountOnApi } = await import('../api/authService');
      if (await initAuth()) return null;

      const guest = await createUnfinalizedAccountOnApi();
      if (!isBackendUser(guest)) return null;
      adoptUser(guest, actions);
      actions.setHasEnteredPlatform(true);
      return guest;
    })()
      .catch(error => {
        console.error('❌ [guestSession] ensureCurrentUser:', error);
        return null;
      })
      .finally(() => {
        ensurePromise = null;
      });
  }
  return ensurePromise;
}
