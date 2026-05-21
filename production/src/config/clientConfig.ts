/**
 * Configuration Client - IdeoSphere
 * 
 * Ce fichier gère le chargement de la configuration appropriée en fonction de l'URL.
 * Il centralise tous les textes et paramètres qui dépendent du contexte client.
 */

import { ClientConfig } from './types';
import { defaultConfig } from './clients/default';
import { leblancConfig } from './clients/leblanc';
import { chesnayRocquencourtConfig } from './clients/chesnayRocquencourt';
import { solidarcyConfig } from './clients/solidarcy';
import { saintcyrencommunConfig } from './clients/saintcyrencommun';
import { lesChaisesConfig } from './clients/lesChaises';
import { vivonsnimesConfig } from './clients/VivonsNimes';
import { ddniceConfig } from './clients/ddnice';
import { ehessConfig } from './clients/ehess';

// ============================================================================
// 1. MAPPING DES CONFIGURATIONS PAR SOUS-DOMAINE
// ============================================================================

/**
 * Mapping entre les sous-domaines et leurs configurations
 * 
 * Exemples d'URLs supportées :
 * - localhost → default
 * - alpha.ideosphere.community → default
 * - liste.ideosphere.community → listeCitoyenne
 * - demo-liste.ideosphere.community → listeCitoyenne
 */
const configs: Record<string, ClientConfig> = {
  // Configuration par défaut (utilisée pour localhost et autres sous-domaines non mappés)
  'default': defaultConfig,
  'localhost': defaultConfig,
  
  // Configuration pour liste citoyenne (version beta)
  'beta': defaultConfig, // betaConfig,
  'test-tenant': defaultConfig,

  // PLUS MAINTENUS
  'amdf': defaultConfig,

  'leblanc': leblancConfig,
  'ehess': ehessConfig,

  // chesnayRocquencourtConfig
  'chesnay-rocquencourt': chesnayRocquencourtConfig,

  //autres listes
  'solidarcy': solidarcyConfig,
  'saintcyrencommun': saintcyrencommunConfig,

  'leschaises': lesChaisesConfig,
  'vivons-nimes': vivonsnimesConfig,

  'ddnice': ddniceConfig,
};

// ============================================================================
// 2. FONCTION DE RÉCUPÉRATION DE LA CONFIGURATION ACTIVE
// ============================================================================

/**
 * Récupère la configuration active en fonction de l'URL
 * 
 * @returns La configuration correspondant au sous-domaine actuel
 * 
 * Exemples :
 * - Sur "localhost:3000" → config par défaut
 * - Sur "alpha.ideosphere.community" → config par défaut
 * - Sur "liste.ideosphere.community" → config liste citoyenne
 * - Sur "demo-liste.ideosphere.community" → config liste citoyenne
 */
export const getClientConfig = (): ClientConfig => {
  // Vérifier si on est côté serveur (lors du build)
  if (typeof window === 'undefined') {
    return configs['default'];
  }

  // Récupère le hostname (ex: "alpha.ideosphere.community" ou "localhost")
  const hostname = window.location.hostname;

  // Extrait le sous-domaine (la partie avant le premier point)
  // Pour "alpha.ideosphere.community" → "alpha"
  // Pour "localhost" → "localhost"
  const subdomain = hostname.split('.')[0];

  // Retourne la config du sous-domaine, ou la config par défaut si inconnu
  return configs[subdomain] || configs['default'];
};

// ============================================================================
// 3. INSTANCE DE CONFIGURATION ACTIVE
// ============================================================================

/**
 * Instance "prête à l'emploi" de la configuration active
 * Permet d'accéder à la config sans appeler la fonction partout
 * 
 * Usage :
 * ```ts
 * import { currentConfig } from '@/config/clientConfig';
 * 
 * console.log(currentConfig.identity.appName);
 * ```
 */
export const currentConfig = getClientConfig();

// ============================================================================
// 4. HELPERS - Fonctions utilitaires pour accéder à la configuration
// ============================================================================

/**
 * Obtient le terme pour "membre" selon le genre et le nombre
 */
export function getMemberTerm(options: { plural?: boolean; feminine?: boolean } = {}) {
  const { plural = false, feminine = false } = options;
  const config = getClientConfig();
  
  if (plural) {
    return config.terminology.member.plural;
  }
  
  if (feminine) {
    return config.terminology.member.singularFeminine;
  }
  
  return config.terminology.member.singular;
}

/**
 * Obtient le terme pour "organisation"
 */
export function getOrganizationTerm(plural = false) {
  const config = getClientConfig();
  return plural 
    ? config.terminology.organization.plural 
    : config.terminology.organization.singular;
}

/**
 * Obtient le nom de la ville/localisation
 */
export function getCityName() {
  const config = getClientConfig();
  return config.terminology.location.cityName;
}

/**
 * Vérifie si la localisation est activée
 */
export function isLocationEnabled() {
  const config = getClientConfig();
  return config.terminology.location.enabled;
}

/**
 * Obtient le texte de partage pour une idée
 */
export function getIdeaShareText(title: string) {
  const config = getClientConfig();
  return config.systemMessages.shareDialog.ideaShareText(title);
}

/**
 * Obtient le texte de partage pour un post
 */
export function getPostShareText(preview: string) {
  const config = getClientConfig();
  return config.systemMessages.shareDialog.postShareText(preview);
}

/**
 * Obtient tous les types de groupes disponibles
 */
export function getGroupTypes() {
  const config = getClientConfig();
  return config.groupTypes.types;
}

/**
 * Obtient les informations d'un type de groupe spécifique
 */
export function getGroupTypeInfo(typeId: string) {
  const config = getClientConfig();
  return config.groupTypes.types.find(type => type.id === typeId);
}

/**
 * Obtient le label d'un type de groupe
 */
export function getGroupTypeLabel(typeId: string, plural = false) {
  const typeInfo = getGroupTypeInfo(typeId);
  if (!typeInfo) return typeId;
  return plural ? typeInfo.labelPlural : typeInfo.label;
}

/**
 * Obtient les IDs de tous les types de groupes disponibles
 */
export function getGroupTypeIds(): string[] {
  const config = getClientConfig();
  return config.groupTypes.types.map(type => type.id);
}

/**
 * Obtient le mode d'authentification configuré
 */
export function getAuthMode() {
  const config = getClientConfig();
  return config.auth.mode;
}

/**
 * Obtient la configuration Keycloak (si mode Keycloak)
 */
export function getKeycloakConfig() {
  const config = getClientConfig();
  return config.auth.keycloak;
}

/**
 * Obtient l'utilisateur mock (si mode mock)
 */
export function getMockUser() {
  const config = getClientConfig();
  return config.auth.mockUser;
}

// ============================================================================
// 5. EXPORTS
// ============================================================================

/**
 * Export nommé de la configuration (pour compatibilité avec l'ancien code)
 * @deprecated Utilisez `currentConfig` à la place
 */
export const clientConfig = currentConfig;

// Export par défaut
export default currentConfig;