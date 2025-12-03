/**
 * Configuration par défaut - IdeoSphere
 * 
 * Cette configuration neutre est utilisée par défaut pour toutes les instances
 * qui ne correspondent pas à un sous-domaine spécifique.
 * Elle est conçue pour être générique et adaptable à tout type d'organisation.
 */

import { ClientConfig } from '../types';

export const amdfConfig: ClientConfig = {
  // ============================================================================
  // 1. IDENTITÉ ET BRANDING
  // ============================================================================
  
  identity: {
    // Nom de l'application
    appName: 'IdeoSphere AMDF',
    
    // Tagline / Sous-titre
    appTagline: 'Plateforme collaborative d\'intelligence collective (AMDF)',
    
    // Description courte (utilisée dans le footer)
    appDescriptionShort: 'Une plateforme open source pour l\'intelligence collective. Nous facilitons l\'émergence d\'idées, la collaboration et la transformation d\'initiatives en projets concrets.',
    
    // Mission principale (utilisée dans la page À propos)
    appMission: 'IdeoSphere est une plateforme collaborative open source conçue pour faciliter l\'émergence d\'idées et leur transformation en projets concrets. Notre mission est de créer un espace d\'intelligence collective où les communautés peuvent partager, débattre et co-construire des solutions innovantes ensemble.',
    
    // Statut du projet
    projectStatus: 'Projet open source',
    
    // Copyright
    copyright: '© 2025 IdeoSphere. Tous droits réservés.',
  },

  // ============================================================================
  // 2. TERMINOLOGIE CONTEXTUELLE
  // ============================================================================
  
  // Type de client (neutre par défaut)
  clientType: 'association',
  
  terminology: {
    // Membre
    member: {
      singular: 'membre',
      singularFeminine: 'membre',
      plural: 'membres',
    },
    
    // Organisation
    organization: {
      singular: 'organisation',
      plural: 'organisations',
    },
    
    // Territoire local
    territory: {
      local: 'communauté',
    },
    
    // Type de participation
    participation: {
      adjective: 'collaboratif', // Ex: "idée collaborative", "vie collaborative", "post collaboratif"
    },
    
    // Localisation géographique
    location: {
      cityName: 'Votre Communauté',
      enabled: true,
    },
  },

  // ============================================================================
  // 3. PAGE D'ACCUEIL (CITIZENWELCOME)
  // ============================================================================
  
  welcome: {
    // Bannière version Bêta (affichage contrôlé par features.showBetaBanner)
    betaBanner: {
      title: 'Version Bêta d\'IdeoSphere !',
      description: 'Cette plateforme est en <strong>version bêta ouverte</strong> : son objectif principal est de vous permettre de découvrir et tester IdeoSphere. Certaines fonctionnalités (comme les communautés) ne sont pas encore actives et des bugs peuvent survenir. Vous pouvez déjà l\'utiliser pour partager vos idées et collaborer.',
      feedbackInstructions: '💡 <strong>Signaler un bug ou suggérer une amélioration :</strong> ajoutez simplement <code>#bug</code> ou <code>#suggestion</code> dans vos posts pour nous les faire remonter !',
    },
    
    // Section Hero (titre principal)
    hero: {
      title: 'Partagez, explorez et co-construisez des idées ensemble',
      description: 'Innovation, projets collaboratifs, amélioration continue, initiatives communautaires... Que vous ayez une grande vision ou une petite amélioration à proposer, cette plateforme recueille toutes vos contributions pour faire avancer votre communauté.',
      
      // Thématiques suggérées (utilisées dans la description)
      themes: [
        'Innovation',
        'Projets collaboratifs',
        'Amélioration continue',
        'Initiatives communautaires',
        'Créativité',
        'Solutions collectives',
        'Transformation',
      ],
    },
    
    // Section "Partagez votre idée"
    quickIdea: {
      sectionTitle: 'Partagez votre idée en quelques mots',
      placeholder: 'Ex: Créer un espace de co-working collaboratif pour favoriser les échanges et l\'entraide...',
      buttonText: 'Continuer',
      
      // Étape de finalisation
      finalizationTitle: 'Finalisation de votre idée',
      locationSectionTitle: 'Localisation de l\'idée (optionnelle)',
      locationPlaceholder: 'Ex: Espace principal, Votre lieu',
      followUpSectionTitle: 'Souhaitez-vous suivre l\'évolution de votre idée ? (optionnel)',
      followUpDescription: 'Ces informations nous permettront de vous tenir informé des évolutions de votre idée.',
      namePlaceholder: 'Votre nom',
      emailPlaceholder: 'Votre email',
      submitButtonText: 'Partager cette idée',
      skipButtonText: 'Partager sans ces informations',
    },
    
    // Section "Comment ça marche"
    howItWorks: {
      title: 'Comment ça marche ?',
      steps: [
        'Décrivez votre idée ci-dessus',
        'Ajoutez une localisation si nécessaire',
        'Laissez vos coordonnées pour suivre son évolution',
        'Nous la partageons avec votre communauté',
      ],
    },
    
    // Statistiques
    stats: {
      totalContributions: 'contributions totales',
      totalIdeas: 'idées partagées',
      totalSupports: 'soutiens reçus',
    },
    
    // Section propositions récentes
    recentPropositions: {
      title: 'Propositions récemment partagées',
      fallbackCategoryIdea: 'Idée collaborative',
      fallbackCategoryPost: 'Discussion collaborative',
      loadingText: 'Chargement des propositions récentes...',
      emptyText: 'Aucune proposition récente trouvée.',
    },
    
    // Call-to-Action principal
    cta: {
      buttonText: 'Explorer toutes les propositions',
      
      // Badges de valeurs
      values: [
        'Collaboration ouverte',
        'Projets concrets',
        'Intelligence collective',
      ],
    },
    
    // Section "Envie de découvrir"
    discover: {
      title: 'Envie de découvrir la plateforme ?',
      description: 'Explorez les propositions déjà partagées par la communauté et découvrez comment participer à l\'émergence de projets innovants.',
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
      about: 'À propos',
      howItWorks: 'Comment ça marche',
      faq: 'FAQ',
      privacy: 'Confidentialité',
      terms: 'CGU',
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
  // 9. MESSAGES SYSTÈME (ShareDialog et SignupPage uniquement)
  // ============================================================================
  
  systemMessages: {
    // ShareDialog
    shareDialog: {
      // Texte pour partager une idée
      ideaShareText: (title: string) => `Découvrez cette idée : ${title}`,
      
      // Texte pour partager un post
      postShareText: (preview: string) => `Découvrez ce post : ${preview}`,
      
      // Titres de dialogue
      ideaDialogTitle: 'Partager cette idée',
      postDialogTitle: 'Partager ce post',
    },
    
    // SignupPage
    signupPage: {
      // Titre de la page
      title: 'Créer un compte',
      
      // Description avec nom de ville
      description: (cityName: string) => `Créez votre compte pour participer pleinement à la communauté ${cityName}`,
      
      // Helper text pour la bio
      bioHelperText: 'Cela aide les autres membres à mieux comprendre vos motivations',
      
      // Labels de formulaire
      labels: {
        name: 'Nom complet',
        email: 'Email',
        password: 'Mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        location: 'Localisation',
        bio: 'Bio (optionnel)',
        interests: 'Centres d\'intérêt',
      },
      
      // Placeholders
      placeholders: {
        name: 'Votre nom',
        email: 'votre.email@example.com',
        password: '••••••••',
        location: 'Votre lieu, Votre région',
        bio: 'Parlez de vous, vos motivations...',
      },
      
      // Boutons
      buttons: {
        submit: 'Créer mon compte',
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
      titlePlaceholder: 'Ex: Réflexion sur la collaboration à distance...',
      contentPlaceholder: 'Partagez votre réflexion, observation, question ou idée avec la communauté...',
      locationPlaceholder: 'Ex: Espace principal, Votre lieu',
    },
    
    // Idées (projets structurés)
    idea: {
      titlePlaceholder: 'Ex: Plateforme de partage de ressources',
      summaryPlaceholder: 'Décrivez votre idée en une phrase percutante qui donne envie d\'en savoir plus...',
      locationPlaceholder: 'Ex: Espace principal, Votre lieu',
      
      // Template de description détaillée
      descriptionTemplate: {
        withSourcePost: (authorName: string) => `## Contexte et enjeu

Suite au post de ${authorName}, je pense que...

## Solution proposée

Expliquez en détail votre idée et comment elle répond au besoin...

## Mise en œuvre

- Étape 1 : ...
- Étape 2 : ...

## Impact attendu

Quels bénéfices concrets pour la communauté ?`,
        
        withoutSourcePost: `## Contexte et enjeu

Décrivez le problème ou l'opportunité que vous avez identifié...

## Solution proposée

Expliquez en détail votre idée et comment elle répond au besoin...

## Mise en œuvre

- Étape 1 : ...
- Étape 2 : ...

## Impact attendu

Quels bénéfices concrets pour la communauté ?`,
      },
    },
    
    // Groupes
    group: {
      namePlaceholder: 'Ex: Groupe Innovation',
      locationPlaceholder: 'Ex: Votre lieu',
      tagsPlaceholder: 'Ex: innovation, créativité, projets',
    },
    
    // Discussions
    discussion: {
      topicTitlePlaceholder: 'Ex: Question sur la mise en œuvre...',
    },
    
    // Profil utilisateur
    profile: {
      birthYearPlaceholder: 'Ex: 1985',
      bioPlaceholder: 'Ex: Passionné(e) d\'innovation et de collaboration, je souhaite contribuer à l\'émergence de projets impactants...',
    },
    
    // Collaboration
    collaboration: {
      searchPlaceholder: 'Rechercher un membre à inviter comme co-créateur...',
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
      embedUrl: 'https://embed.kumu.io/1ef3aafb7bdc5e106adde3b6bf6abc3c',
      
      // URL directe vers le projet Kumu
      projectUrl: 'https://embed.kumu.io/1ef3aafb7bdc5e106adde3b6bf6abc3c',
      
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
    enableNewsletters: false,
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