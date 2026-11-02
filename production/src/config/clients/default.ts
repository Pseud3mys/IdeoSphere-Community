/**
 * Configuration par défaut - IdeoSphere
 *
 * Utilisée telle quelle pour les sous-domaines non mappés (localhost, beta...),
 * et comme base de tous les clients : un client ne déclare que ce qui diffère
 * (voir `defineClient()` et `_template.ts.example`).
 */

import { ClientConfig } from '../types';

export const defaultConfig: ClientConfig = {
  // ============================================================================
  // 1. IDENTITÉ
  // ============================================================================
  identity: {
    appName: 'IdeoSphere',
    appTagline: 'Plateforme collaborative d\'intelligence collective',
    appDescriptionShort: 'Une plateforme open source pour l\'intelligence collective. Nous facilitons l\'émergence d\'idées, la collaboration et la transformation d\'initiatives en projets concrets.',
    appMission: 'IdeoSphere est une plateforme collaborative open source conçue pour faciliter l\'émergence d\'idées et leur transformation en projets concrets. Notre mission est de créer un espace d\'intelligence collective où les communautés peuvent partager, débattre et co-construire des solutions innovantes ensemble.',
    // logoUrl : import d'un fichier de src/assets ou URL absolue
  },

  // ============================================================================
  // 2. FONCTIONNALITÉS ACTIVABLES
  // ============================================================================
  features: {
    showBetaBanner: true,
    enableNewsletters: true,
  },

  // ============================================================================
  // 3. PAGE D'ACCUEIL
  // ============================================================================
  welcome: {
    title: 'Partagez, explorez et co-construisez des idées ensemble',
    descriptionParagraphs: [
      'Innovation, projets collaboratifs, amélioration continue, initiatives communautaires... Que vous ayez une grande vision ou une petite amélioration à proposer, cette plateforme recueille toutes vos contributions pour faire avancer votre communauté.',
      'Rejoignez le mouvement dès aujourd\'hui et participez activement aux décisions qui vous concernent.',
    ],
    quickIdeaPlaceholder: 'Ex: Créer un espace de co-working collaboratif pour favoriser les échanges et l\'entraide...',
  },

  // ============================================================================
  // 4. VOCABULAIRE
  // Selon le cas d'usage :
  //   territoire → habitant / habitants, community: 'commune'
  //   équipes    → collaborateur / collaborateurs, community: 'structure'
  //   projet     → participant / participants, community: 'projet'
  // ============================================================================
  terminology: {
    member: {
      singular: 'membre',
      plural: 'membres',
    },
    community: 'communauté',
  },

  // ============================================================================
  // 5. LOCALISATION
  // Territoire → quartiers en suggestions + recherche d'adresses.
  // Projet     → bâtiments / espaces du site.
  // Interne    → grands services, sous-services (via `context`) et sites,
  //              addressSearch: false. lon/lat = coordonnées du site.
  // ============================================================================
  locations: {
    // suggestions: [{ label: 'Quartier ...', context: '75018, Paris', lon: 2.34, lat: 48.88 }],
    addressSearch: true,
  },

  // ============================================================================
  // 6. PLACEHOLDERS DES FORMULAIRES
  // Ils donnent le ton et des exemples concrets : à adapter au contexte
  // (une idée de quartier, un irritant interne, un usage d'un futur bâtiment...).
  // ============================================================================
  placeholders: {
    postContent: 'Partagez votre réflexion, observation, question ou idée avec la communauté...',
    idea: {
      title: 'Ex: Plateforme de partage de ressources',
      summary: 'Décrivez votre idée en une phrase percutante qui donne envie d\'en savoir plus...',
      location: 'Ex: Espace principal, Votre lieu',
    },
    group: {
      name: 'Ex: Groupe Innovation',
      location: 'Ex: Votre lieu',
      tags: 'Ex: innovation, créativité, projets',
    },
  },

  // ============================================================================
  // 7. TYPES DE GROUPES
  // Selon le cas d'usage :
  //   territoire → quartier, collectif / association, thématique (cadre de vie...)
  //   équipes    → service / métier, projet, chantier transversal, petit cercle
  //   projet     → thème, espace du bâtiment, usage
  // ============================================================================
  groupTypes: [
    {
      id: 'community',
      label: 'Communauté',
      labelPlural: 'Communautés',
      description: 'Un espace pour rassembler des personnes autour d\'un intérêt commun',
      icon: '👥',
    },
    {
      id: 'project',
      label: 'Projet',
      labelPlural: 'Projets',
      description: 'Un groupe dédié à la réalisation d\'un projet spécifique',
      icon: '🎯',
    },
    {
      id: 'local',
      label: 'Groupe local',
      labelPlural: 'Groupes locaux',
      description: 'Un groupe lié à un lieu ou territoire spécifique',
      icon: '📍',
    },
    {
      id: 'challenge',
      label: 'Défi',
      labelPlural: 'Défis',
      description: 'Un espace pour trouver des solutions ensemble à un problème commun',
      icon: '💡',
    },
  ],

  // ============================================================================
  // 8. LIENS EXTERNES
  // Affichés dans le footer. Le lien 'email' sert aussi de contact (profil),
  // le lien 'github' est repris sur la page À propos.
  // ============================================================================
  socialLinks: [
    { url: 'https://discord.gg/WuUY5dtB', label: 'Discord', network: 'discord' },
    { url: 'mailto:contact@holonsystems.org', label: 'Email', network: 'email' },
    { url: 'https://github.com/Pseud3mys/IdeoSphere-Community', label: 'Github', network: 'github' },
  ],

  // ============================================================================
  // 9. CARTOGRAPHIE (Kumu)
  // ============================================================================
  cartography: {
    enabled: true,
    embedUrl: 'https://embed.kumu.io/24fc024151324e9b98b75dc36df8f22f',
    projectUrl: 'https://embed.kumu.io/4b1560a7d6213293340bf979098d9db3#beta-export',
  },

  // ============================================================================
  // 10. AUTHENTIFICATION
  // ============================================================================
  auth: {
    mode: 'keycloak',
  },
};
