/**
 * Configuration Liste Citoyenne - IdeoSphere
 * 
 * Cette configuration est adaptée pour les listes citoyennes et mouvements politiques locaux.
 * Elle met l'accent sur la participation politique, les programmes et la démocratie participative.
 */

import { ClientConfig } from '../types';

export const betaConfig: ClientConfig = {
  // ============================================================================
  // 1. IDENTITÉ ET BRANDING
  // ============================================================================
  
  identity: {
    // Nom de l'application
    appName: 'IdeoSphere',
    
    // Tagline / Sous-titre
    appTagline: 'La plateforme de votre liste citoyenne',
    
    // Description courte (utilisée dans le footer)
    appDescriptionShort: 'Une plateforme collaborative pour co-construire notre programme politique, partager nos idées et organiser nos actions ensemble. Ensemble, réinventons la démocratie locale.',
    
    // Mission principale (utilisée dans la page À propos)
    appMission: 'IdeoSphere est la plateforme collaborative de notre liste citoyenne. Elle permet à tous les membres et sympathisants de contribuer à l\'élaboration de notre programme, de partager leurs idées, de débattre et de s\'organiser collectivement. Notre objectif est de faire vivre une démocratie participative réelle, où chaque voix compte.',
    
    // Statut du projet
    projectStatus: 'Plateforme collaborative citoyenne',
    
    // Copyright
    copyright: '© 2025 IdeoSphere. Plateforme open source pour listes citoyennes.',
  },

  // ============================================================================
  // 2. TERMINOLOGIE CONTEXTUELLE
  // ============================================================================
  
  // Type de client
  clientType: 'listeCitoyenne',
  
  terminology: {
    // Membre
    member: {
      singular: 'membre',
      singularFeminine: 'membre',
      plural: 'membres',
    },
    
    // Organisation
    organization: {
      singular: 'liste citoyenne',
      plural: 'listes citoyennes',
    },
    
    // Territoire local
    territory: {
      local: 'commune',
    },
    
    // Type de participation
    participation: {
      adjective: 'collective', // Ex: "idée collective", "vie collective", "post collectif"
    },
    
    // Localisation géographique
    location: {
      cityName: 'Notre Commune',
      enabled: true,
    },
  },

  // ============================================================================
  // 3. PAGE D'ACCUEIL (CITIZENWELCOME)
  // ============================================================================
  
  welcome: {
    // Bannière version Bêta
    betaBanner: {
      title: 'Bienvenue sur notre plateforme collaborative !',
      description: 'Cette plateforme est en <strong>version bêta</strong> : elle permet déjà de partager vos idées et de contribuer à notre programme collectif. Certaines fonctionnalités sont encore en développement. N\'hésitez pas à l\'explorer et à faire vos premiers pas !',
      feedbackInstructions: '💡 <strong>Signaler un problème ou suggérer une amélioration :</strong> ajoutez <code>#bug</code> ou <code>#suggestion</code> dans vos posts !',
    },
    
    // Section Hero (titre principal)
    hero: {
      title: 'Partagez, explorez ou discutez d\'idées locales',
      description: 'Éducation, environnement, mobilité, culture, social, économie locale, démocratie participative... Partagez vos propositions, débattez et participez à l\'élaboration de vos projets.',
      
      // Thématiques suggérées
      themes: [
        'Éducation',
        'Environnement',
        'Mobilité',
        'Culture',
        'Social',
        'Économie locale',
        'Démocratie participative',
      ],
    },
    
    // Section "Partagez votre idée"
    quickIdea: {
      sectionTitle: 'Partagez votre proposition pour notre programme',
      placeholder: 'Ex: Mettre en place des assemblées citoyennes trimestrielles pour décider ensemble des priorités municipales...',
      buttonText: 'Continuer',
      
      // Étape de finalisation
      finalizationTitle: 'Finalisation de votre proposition',
      locationSectionTitle: 'Localisation (optionnelle)',
      locationPlaceholder: 'Ex: Quartier Centre, Notre Commune',
      followUpSectionTitle: 'Souhaitez-vous participer au développement de cette proposition ? (optionnel)',
      followUpDescription: 'Ces informations nous permettront de vous tenir informé et de vous impliquer dans le développement de cette proposition.',
      namePlaceholder: 'Votre nom',
      emailPlaceholder: 'Votre email',
      submitButtonText: 'Partager ma proposition',
      skipButtonText: 'Partager anonymement',
    },
    
    // Section "Comment ça marche"
    howItWorks: {
      title: 'Comment ça marche ?',
      steps: [
        'Partagez votre proposition ci-dessus',
        'Débattez avec les autres membres',
        'Votez pour les meilleures idées',
        'Intégrez-les à notre programme collectif',
      ],
    },
    
    // Statistiques
    stats: {
      totalContributions: 'contributions au programme',
      totalIdeas: 'propositions partagées',
      totalSupports: 'votes exprimés',
    },
    
    // Section propositions récentes
    recentPropositions: {
      title: 'Propositions récentes de nos membres',
      loadingText: 'Chargement des propositions...',
      emptyText: 'Aucune proposition récente. Soyez le premier à contribuer !',
    },
    
    // Call-to-Action principal
    cta: {
      buttonText: 'Explorer toutes les propositions',
      
      // Badges de valeurs
      values: [
        'Démocratie participative',
        'Co-construction du programme',
        'Décisions collectives',
      ],
    },
    
    // Section "Envie de découvrir"
    discover: {
      title: 'Envie de découvrir notre plateforme ?',
      description: 'Explorez les propositions déjà partagées par nos membres et découvrez comment participer à la construction de notre programme collectif.',
      buttonText: 'Accès démo instantané',
      features: [
        'Aucune inscription requise',
        'Accès immédiat',
        'Toutes les fonctionnalités',
      ],
    },
  },

  // ============================================================================
  // 4. NAVIGATION ET HEADER
  // ============================================================================
  
  navigation: {
    // Bouton "Comment ça marche"
    howItWorksButton: 'Comment ça marche ?',
    
    // Bouton d'aide
    helpButton: {
      title: 'Aide et visite guidée',
      icon: '?',
    },
  },

  // ============================================================================
  // 6. FOOTER
  // ============================================================================
  
  footer: {
    // Titre de la section "En savoir plus"
    learnMoreTitle: 'En savoir plus',
    
    // Titre de la section "Nous rejoindre"
    joinUsTitle: 'Nous rejoindre',
    
    // Liens de navigation
    links: {
      about: 'Notre liste citoyenne',
      howItWorks: 'Comment participer',
      faq: 'Questions fréquentes',
      privacy: 'Confidentialité',
      terms: 'Charte de participation',
    },
    
    // Contact et communauté
    contact: {
      discord: {
        url: 'https://discord.gg/WuUY5dtB',
        label: 'Discord',
      },
      email: {
        url: 'mailto:contact@holonsystems.org',
        address: 'contact@holonsystems.org',
        label: 'Email',
      },
      github: {
        url: 'https://github.com/Pseud3mys/IdeoSphere-Community',
        label: 'GitHub',
      },
    },
  },

  // ============================================================================
  // 9. MESSAGES SYSTÈME
  // ============================================================================
  
  systemMessages: {
    // ShareDialog
    shareDialog: {
      // Texte pour partager une idée
      ideaShareText: (title: string) => `Découvrez cette proposition de notre liste citoyenne : ${title}`,
      
      // Texte pour partager un post
      postShareText: (preview: string) => `Découvrez cette discussion de notre liste citoyenne : ${preview}`,
      
      // Titres de dialogue
      ideaDialogTitle: 'Partager cette proposition',
      postDialogTitle: 'Partager cette discussion',
    },
    
    // SignupPage
    signupPage: {
      // Titre de la page
      title: 'Rejoindre notre liste citoyenne',
      
      // Description avec nom de ville
      description: (cityName: string) => `Créez votre compte pour participer pleinement à la co-construction de notre programme pour ${cityName}`,
      
      // Helper text pour la bio
      bioHelperText: 'Cela aide les autres membres à mieux comprendre vos motivations et vos engagements',
      
      // Labels de formulaire
      labels: {
        name: 'Nom complet',
        email: 'Email',
        password: 'Mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        location: 'Localisation',
        bio: 'Bio (optionnel)',
        interests: 'Thématiques qui vous intéressent',
      },
      
      // Placeholders
      placeholders: {
        name: 'Votre nom',
        email: 'votre.email@example.com',
        password: '••••••••',
        location: 'Votre quartier, votre commune',
        bio: 'Parlez de vous, vos motivations, vos engagements...',
      },
      
      // Boutons
      buttons: {
        submit: 'Rejoindre la liste',
        login: 'Se connecter',
      },
      
      // Messages
      messages: {
        alreadyHaveAccount: 'Vous avez déjà un compte ?',
      },
    },
  },

  // ============================================================================
  // 9. EXEMPLES ET PLACEHOLDERS
  // ============================================================================
  
  examples: {
    // Posts (messages courts)
    post: {
      titlePlaceholder: 'Ex: Réflexion sur la démocratie participative...',
      contentPlaceholder: 'Partagez votre réflexion, observation, question ou proposition avec les autres membres...',
      locationPlaceholder: 'Ex: Quartier Centre, Notre Commune',
    },
    
    // Idées (projets structurés)
    idea: {
      titlePlaceholder: 'Ex: Assemblées citoyennes trimestrielles',
      summaryPlaceholder: 'Résumez votre proposition en une phrase percutante...',
      locationPlaceholder: 'Ex: Salle des fêtes, Notre Commune',
      
      // Template de description détaillée
      descriptionTemplate: {
        withSourcePost: (authorName: string) => `## Contexte et enjeu

Suite à la proposition de ${authorName}, je pense que...

## Solution proposée

Expliquez en détail votre proposition et comment elle s'inscrit dans notre programme...

## Mise en œuvre

- Étape 1 : ...
- Étape 2 : ...

## Impact attendu

Quels bénéfices concrets pour notre commune et ses habitants ?`,
        
        withoutSourcePost: `## Contexte et enjeu

Décrivez le problème ou l'opportunité que vous avez identifié dans notre commune...

## Solution proposée

Expliquez en détail votre proposition et comment elle s'inscrit dans notre programme...

## Mise en œuvre

- Étape 1 : ...
- Étape 2 : ...

## Impact attendu

Quels bénéfices concrets pour notre commune et ses habitants ?`,
      },
    },
    
    // Groupes
    group: {
      namePlaceholder: 'Ex: Commission Écologie',
      locationPlaceholder: 'Ex: Notre Commune',
      tagsPlaceholder: 'Ex: environnement, transition, énergie',
    },
    
    // Discussions
    discussion: {
      topicTitlePlaceholder: 'Ex: Question sur la mise en œuvre du programme...',
    },
    
    // Profil utilisateur
    profile: {
      birthYearPlaceholder: 'Ex: 1985',
      bioPlaceholder: 'Ex: Engagé(e) dans la transition écologique et la démocratie participative, je souhaite contribuer à notre programme collectif...',
    },
    
    // Collaboration
    collaboration: {
      searchPlaceholder: 'Rechercher un membre à inviter comme co-rédacteur...',
    },
  },

  // ============================================================================
  // 10. TYPES DE GROUPES
  // ============================================================================
  
  groupTypes: {
    // Types de groupes disponibles avec leurs labels et descriptions
    types: [
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
  },

  // ============================================================================
  // 11. INTÉGRATIONS EXTERNES
  // ============================================================================
  
  integrations: {
    // Kumu.io - Visualisation de réseaux
    kumu: {
      // URL de l'iframe d'embed Kumu (si disponible)
      embedUrl: 'https://embed.kumu.io/51e016a9a70265594812a1c818dae057',
      
      // URL directe vers le projet Kumu
      projectUrl: 'https://embed.kumu.io/51e016a9a70265594812a1c818dae057',
      
      // Activer l'affichage de l'iframe
      enabled: true,
      
      // Dimensions par défaut de l'iframe
      width: '100%',
      height: '600px',
    },
  },

  // ============================================================================
  // 12. CONFIGURATION AVANCÉE
  // ============================================================================
  
  features: {
    // Afficher ou non la bannière bêta
    showBetaBanner: true,
    
    // Activer les newsletters
    enableNewsletters: true,
  },

  // ============================================================================
  // 13. AUTHENTIFICATION
  // ============================================================================
  
  auth: {
    // Mode d'authentification : 'mock' pour dev/demo, 'keycloak' pour production
    mode: 'keycloak',
    
    // Utilisateur mock pour le développement (utilisé en mode 'mock')
    mockUser: {
      id: 'user-1',
      email: 'marie.dubois@email.com',
      name: 'Marie Dubois',
      location: 'Le Blanc',
      bio: 'Commerçante retraitée passionnée par l\'amélioration du cadre de vie à Le Blanc',
    },
  },
};