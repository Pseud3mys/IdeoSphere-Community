/**
 * Types de configuration - IdeoSphere
 *
 * Seul ce qui peut réellement changer d'un client à l'autre vit dans la config.
 * Les textes d'interface communs à toutes les instances sont écrits directement
 * dans les composants.
 *
 * - `clients/default.ts` contient une configuration complète (ClientConfig).
 * - Chaque client ne déclare que ce qui diffère du défaut (ClientOverrides),
 *   fusionné avec le défaut via `defineClient()`.
 */

// Types d'authentification supportés
export type AuthMode = 'mock' | 'keycloak';

export interface GroupType {
  id: string;
  label: string;
  labelPlural: string;
  description: string;
  icon: string;
}

export interface PredefinedLocation {
  label: string;
  context?: string;
  lon: number;
  lat: number;
  postcode?: string;
  city?: string;
}

export interface SocialLink {
  url: string;
  label: string;
  // Optionnel : pour forcer une icône si l'URL n'est pas reconnue
  network?: 'discord' | 'email' | 'github' | 'instagram' | 'linkedin' | 'facebook' | 'twitter' | 'website';
}

export interface ClientConfig {
  // 1. IDENTITÉ — header, footer, page À propos, partages
  identity: {
    appName: string;
    appTagline: string;
    appDescriptionShort: string; // footer
    appMission: string;          // page À propos
    logoUrl?: string;            // logo importé ou URL ; logo IdeoSphere sinon
  };

  // 2. FONCTIONNALITÉS ACTIVABLES
  features: {
    showBetaBanner: boolean;     // bandeau bêta sur la page d'accueil
    enableNewsletters: boolean;  // inscription newsletter sur la page d'accueil
  };

  // 3. PAGE D'ACCUEIL
  welcome: {
    title: string;
    descriptionParagraphs: string[];
    quickIdeaPlaceholder: string;
  };

  // 4. VOCABULAIRE
  terminology: {
    member: {
      singular: string;
      plural: string;
    };
    community: string; // "l'espace collaboratif de votre <community>"
  };

  // 5. LOCALISATION des contributions
  // Territoire : quartiers + adresses. Interne : services / sous-services / sites,
  // sans recherche d'adresse. Un sous-service se décrit via `context`
  // (ex: { label: 'R&D – IA', context: 'R&D · Site de Saclay' }).
  locations: {
    suggestions?: PredefinedLocation[]; // proposés au focus et filtrés pendant la saisie
    addressSearch: boolean;             // recherche d'adresses (API de géocodage)
  };

  // 6. PLACEHOLDERS DES FORMULAIRES — donnent le ton des contributions
  placeholders: {
    postContent: string;
    idea: {
      title: string;
      summary: string;
      location: string;
    };
    group: {
      name: string;
      location: string;
      tags: string;
    };
  };

  // 7. TYPES DE GROUPES
  groupTypes: GroupType[];

  // 8. LIENS EXTERNES — footer, contact (email), dépôt GitHub (page À propos)
  socialLinks: SocialLink[];

  // 9. CARTOGRAPHIE (Kumu)
  cartography: {
    enabled: boolean;
    embedUrl: string;
    projectUrl: string;
  };

  // 10. AUTHENTIFICATION — 'mock' pour le dev/démo, 'keycloak' en production
  auth: {
    mode: AuthMode;
  };
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? U[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

// Ce qu'un client déclare : uniquement ce qui diffère du défaut.
// Les tableaux (paragraphes, liens, lieux, types de groupes) remplacent celui du défaut.
export type ClientOverrides = DeepPartial<ClientConfig>;
