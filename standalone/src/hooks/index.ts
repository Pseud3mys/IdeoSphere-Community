/**
 * Index des hooks pour l'Entity Store
 */

// Hook principal - Point d'entrée unique pour les composants
export { useEntityStoreSimple } from './useEntityStoreSimple';

// Hooks d'authentification
export { useAuthHandlers } from './useAuthHandlers';

// Hooks de navigation
export { useNavigationActions } from './useNavigationActions';

// Hooks spécialisés pour les entités
export { useGroupActions } from './useGroupActions';
export { useGroupLinkActions } from './useGroupLinkActions';