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
 * - alpha.ideosphere.social → default
 * - liste.ideosphere.social → listeCitoyenne
 * - demo-liste.ideosphere.social → listeCitoyenne
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
 * - Sur "alpha.ideosphere.social" → config par défaut
 * - Sur "liste.ideosphere.social" → config liste citoyenne
 * - Sur "demo-liste.ideosphere.social" → config liste citoyenne
 */
export const getClientConfig = (): ClientConfig => {
  // Vérifier si on est côté serveur (lors du build)
  if (typeof window === 'undefined') {
    return configs['default'];
  }

  // Récupère le hostname (ex: "alpha.ideosphere.social" ou "localhost")
  const hostname = window.location.hostname;

  // Extrait le sous-domaine (la partie avant le premier point)
  // Pour "alpha.ideosphere.social" → "alpha"
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
// 4. HELPERS
// ============================================================================

/**
 * Terme désignant les membres (ex: "membres", "habitants", "collaborateurs")
 */
export function getMemberTerm(options: { plural?: boolean } = {}) {
  const { member } = getClientConfig().terminology;
  return options.plural ? member.plural : member.singular;
}

/**
 * Types de groupes disponibles pour ce client
 */
export function getGroupTypes() {
  return getClientConfig().groupTypes;
}

/**
 * Informations d'un type de groupe
 */
export function getGroupTypeInfo(typeId: string) {
  return getClientConfig().groupTypes.find(type => type.id === typeId);
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
