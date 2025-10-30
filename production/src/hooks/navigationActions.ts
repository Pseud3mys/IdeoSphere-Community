import { SimpleEntityStore, StoreUpdater } from '../store/SimpleEntityStore';

/**
 * Actions UI pour l'Entity Store
 * 
 * NOTE MIGRATION REACT ROUTER (Phase 5) :
 * Toutes les actions de navigation (goToTab, goToIdea, goToPost, etc.) ont été supprimées.
 * Utilisez maintenant useNavigationActions() qui utilise React Router.
 * 
 * Ce fichier ne contient plus que les actions UI pures (onboarding, etc.)
 */
export function createNavigationActions(
  store: SimpleEntityStore,
  actions: any,
  boundSelectors: any,
  storeUpdater: StoreUpdater
) {
  return {
    // Actions UI pures (non liées à la navigation)
    showOnboarding: () => {
      actions.setShowOnboarding(true);
    },
    
    hideOnboarding: () => {
      actions.setShowOnboarding(false);
    },
    
    // Actions d'entrée de plateforme (pour compatibilité temporaire)
    // TODO Phase 6: Migrer vers useNavigate() directement
    enterPlatform: () => {
      actions.setHasEnteredPlatform(true);
    },
    
    exitPlatform: () => {
      actions.setHasEnteredPlatform(false);
    }
  };
}
