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
// 3bis. SOUS-DOMAINE INCONNU
// ============================================================================

// Domaines dont le premier label désigne un client (localhost : pour tester en dev)
const PLATFORM_DOMAINS = ['ideosphere.social', 'localhost'];

// Clés de `configs` qui ne sont pas des clients (dev, démo, anciens alias) :
// jamais proposées en suggestion
const NON_CLIENT_KEYS = new Set(['default', 'localhost', 'beta', 'test-tenant']);

// Sous-domaines servis volontairement avec la config par défaut
const DEFAULT_CONFIG_SUBDOMAINS = new Set(['www', 'alpha']);

const squash = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

// Distance de Levenshtein
function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    previous = current;
  }
  return previous[b.length];
}

export interface UnknownTenant {
  subdomain: string;
  /** Sous-domaine d'un client existant, proposé seulement s'il ressemble à celui saisi */
  suggestion?: string;
  platformDomain: string;
}

/**
 * Détecte un sous-domaine de la plateforme qui ne correspond à aucun client
 * (ex: "leblank.ideosphere.social", "teeest-tenant.localhost"). Retourne null pour
 * localhost seul, les IP, les domaines personnalisés et les clients connus.
 *
 * Une suggestion n'est donnée que si le nom est très proche d'un client existant,
 * pour ne pas révéler la liste des clients.
 */
export function detectUnknownTenant(hostname: string): UnknownTenant | null {
  const host = hostname.toLowerCase();
  const platformDomain = PLATFORM_DOMAINS.find(domain => host.endsWith(`.${domain}`));
  if (!platformDomain) return null;

  // Même règle que getClientConfig : le premier label du hostname
  const subdomain = host.split('.')[0];
  if (!subdomain || DEFAULT_CONFIG_SUBDOMAINS.has(subdomain) || configs[subdomain]) return null;

  const typed = squash(subdomain);
  let best: { key: string; distance: number } | undefined;
  for (const key of Object.keys(configs)) {
    if (NON_CLIENT_KEYS.has(key)) continue;
    const candidate = squash(key);
    const distance = editDistance(typed, candidate);
    const maxDistance = candidate.length >= 6 ? 2 : 1;
    if (distance <= maxDistance && (!best || distance < best.distance)) {
      best = { key, distance };
    }
  }

  return { subdomain, suggestion: best?.key, platformDomain };
}

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
