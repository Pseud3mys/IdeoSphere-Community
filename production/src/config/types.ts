/**
 * Types de configuration - IdeoSphere
 * 
 * Ce fichier définit l'interface TypeScript pour toutes les configurations client.
 */

// Types de clients supportés
export type ClientType = 'mairie' | 'entreprise' | 'association' | 'ong' | 'listeCitoyenne';

// Types d'authentification supportés
export type AuthMode = 'mock' | 'keycloak';

// Configuration Keycloak
export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}

// Type pour un type de groupe
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

// Interface principale de configuration
export interface ClientConfig {
  // ============================================================================
  // 1. IDENTITÉ ET BRANDING
  // ============================================================================
  identity: {
    appName: string;
    appTagline: string;
    appDescriptionShort: string;
    // Mission principale (utilisée dans la page À propos)
    appMission: string;
    projectStatus: string;
    copyright: string;
    // NOUVEAU: Permet de mettre un lien d'image en dur (ex: "https://monsite.com/logo.png")
    logoUrl?: string;
  };

  // ============================================================================
  // 2. TERMINOLOGIE CONTEXTUELLE
  // ============================================================================
  clientType: ClientType;
  
  terminology: {
    member: {
      singular: string;
      singularFeminine: string;
      plural: string;
    };
    organization: {
      singular: string;
      plural: string;
    };
    territory: {
      local: string;
    };
    participation: {
      adjective: string;
    };
    location: {
      cityName: string;
      enabled: boolean;
      // AJOUT : Liste des quartiers/lieux suggérés par défaut
      suggestedLocations?: PredefinedLocation[];
    };
  };

  // ============================================================================
  // 3. PAGE D'ACCUEIL (CITIZENWELCOME)
  // ============================================================================
  welcome: {
    betaBanner: {
      title: string;
      description: string;
      feedbackInstructions: string;
    };
    hero: {
      title: string;
      // CHANGEMENT: Tableau de strings pour gérer plusieurs paragraphes
      descriptionParagraphs: string[];
    };
    quickIdea: {
      sectionTitle: string;
      placeholder: string;
      buttonText: string;
      finalizationTitle: string;
      locationSectionTitle: string;
      locationPlaceholder: string;
      followUpSectionTitle: string;
      followUpDescription: string;
      namePlaceholder: string;
      emailPlaceholder: string;
      submitButtonText: string;
      skipButtonText: string;
    };
    howItWorks: {
      title: string;
    };
    stats: {
      totalContributions: string;
      totalIdeas: string;
      totalSupports: string;
    };
    recentPropositions: {
      title: string;
      loadingText: string;
      emptyText: string;
    };
    cta: {
      buttonText: string;
    };
  };

  // ============================================================================
  // 4. NAVIGATION ET HEADER
  // ============================================================================
  navigation: {
    howItWorksButton: string;
    helpButton: {
      title: string;
      icon: string;
    };
  };

  // ============================================================================
  // 6. FOOTER
  // ============================================================================
  footer: {
    learnMoreTitle: string;
    joinUsTitle: string;
    links: {
      about: string;
      howItWorks: string;
      faq: string;
      privacy: string;
      terms: string;
    };
    socialLinks: Array<{
      url: string;
      label: string;
      // Optionnel : pour forcer une icône si l'URL n'est pas reconnue
      network?: 'discord' | 'email' | 'github' | 'instagram' | 'linkedin' | 'facebook' | 'twitter' | 'website'; 
    }>;
  };

  // ============================================================================
  // 9. MESSAGES SYSTÈME
  // ============================================================================
  systemMessages: {
    shareDialog: {
      ideaShareText: (title: string) => string;
      postShareText: (preview: string) => string;
      ideaDialogTitle: string;
      postDialogTitle: string;
    };
  };

  // ============================================================================
  // 9. EXEMPLES ET PLACEHOLDERS
  // ============================================================================
  examples: {
    post: {
      titlePlaceholder: string;
      contentPlaceholder: string;
      locationPlaceholder: string;
    };
    idea: {
      titlePlaceholder: string;
      summaryPlaceholder: string;
      locationPlaceholder: string;
      descriptionTemplate: {
        withSourcePost: (authorName: string) => string;
        withoutSourcePost: string;
      };
    };
    group: {
      namePlaceholder: string;
      locationPlaceholder: string;
      tagsPlaceholder: string;
    };
    discussion: {
      topicTitlePlaceholder: string;
    };
    profile: {
      birthYearPlaceholder: string;
      bioPlaceholder: string;
    };
    collaboration: {
      searchPlaceholder: string;
    };
  };

  // ============================================================================
  // 10. TYPES DE GROUPES
  // ============================================================================
  groupTypes: {
    types: GroupType[];
  };

  // ============================================================================
  // 11. INTÉGRATIONS EXTERNES
  // ============================================================================
  integrations: {
    kumu: {
      embedUrl: string;
      projectUrl: string;
      enabled: boolean;
      width: string;
      height: string;
    };
  };

  // ============================================================================
  // 12. CONFIGURATION AVANCÉE
  // ============================================================================
  features: {
    showBetaBanner: boolean;
    enableNewsletters: boolean;
  };

  // ============================================================================
  // 13. AUTHENTIFICATION
  // ============================================================================
  auth: {
    mode: AuthMode;
    keycloak?: KeycloakConfig;
    mockUser?: {
      id: string;
      email: string;
      name: string;
    };
  };
}