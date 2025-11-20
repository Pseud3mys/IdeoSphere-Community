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

// Interface principale de configuration
export interface ClientConfig {
  // ============================================================================
  // 1. IDENTITÉ ET BRANDING
  // ============================================================================
  identity: {
    appName: string;
    appTagline: string;
    appDescriptionShort: string;
    appMission: string;
    projectStatus: string;
    copyright: string;
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
      description: string;
      themes: string[];
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
      steps: string[];
    };
    stats: {
      totalContributions: string;
      totalIdeas: string;
      totalSupports: string;
    };
    recentPropositions: {
      title: string;
      fallbackCategoryIdea: string;
      fallbackCategoryPost: string;
      loadingText: string;
      emptyText: string;
    };
    cta: {
      buttonText: string;
      values: string[];
    };
    discover: {
      title: string;
      description: string;
      buttonText: string;
      features: string[];
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
    contact: {
      discord: {
        url: string;
        label: string;
      };
      email: {
        url: string;
        address: string;
        label: string;
      };
      github: {
        url: string;
        label: string;
      };
    };
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
    signupPage: {
      title: string;
      description: (cityName: string) => string;
      bioHelperText: string;
      labels: {
        name: string;
        email: string;
        password: string;
        confirmPassword: string;
        location: string;
        bio: string;
        interests: string;
      };
      placeholders: {
        name: string;
        email: string;
        password: string;
        location: string;
        bio: string;
      };
      buttons: {
        submit: string;
        login: string;
      };
      messages: {
        alreadyHaveAccount: string;
      };
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