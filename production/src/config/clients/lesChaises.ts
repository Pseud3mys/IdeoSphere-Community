/**
 * Configuration par défaut - IdeoSphere
 * 
 * Cette configuration neutre est utilisée par défaut pour toutes les instances
 * qui ne correspondent pas à un sous-domaine spécifique.
 * Elle est conçue pour être générique et adaptable à tout type d'organisation.
 */

import { ClientConfig } from '../types';
import logo_leschaises from '../../assets/logo_leschaises.png';

export const lesChaisesConfig: ClientConfig = {
  // ============================================================================
  // 1. IDENTITÉ ET BRANDING
  // ============================================================================
  
  identity: {
    // Nom de l'application
    appName: 'IdeoSphere',
    
    // Tagline / Sous-titre
    appTagline: 'Plateforme d\'intelligence collective',
    
    // Description courte (utilisée dans le footer)
    appDescriptionShort: 'Une plateforme open source pour l\'intelligence collective. Nous facilitons l\'émergence d\'idées, la collaboration et la transformation d\'initiatives en projets concrets.',
    
    // Mission principale (utilisée dans la page À propos)
    appMission: 'IdeoSphere est une plateforme collaborative open source conçue pour faciliter l\'émergence d\'idées et leur transformation en projets concrets. Notre mission est de créer un espace d\'intelligence collective où les communautés peuvent partager, débattre et co-construire des solutions innovantes ensemble.',
    
    // Statut du projet
    projectStatus: 'Projet open source',
    
    // Copyright
    copyright: '© 2025 IdeoSphere. Tous droits réservés.',

    logoUrl: logo_leschaises,
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
      cityName: 'Paris 18',
      enabled: true,
      // AJOUT DES 8 CONSEILS DE QUARTIER DU 18EME
      suggestedLocations: [
        {
          label: "Quartier Montmartre",
          context: "75018, Paris",
          lon: 2.3430,
          lat: 48.8864,
          postcode: "75018",
          city: "Paris"
        },
        {
          label: "Quartier Grandes-Carrières – Clichy",
          context: "75018, Paris",
          lon: 2.3308,
          lat: 48.8885,
          postcode: "75018",
          city: "Paris"
        },
        {
          label: "Quartier Clignancourt – Jules Joffrin",
          context: "75018, Paris",
          lon: 2.3443,
          lat: 48.8924,
          postcode: "75018",
          city: "Paris"
        },
        {
          label: "Quartier Goutte d'Or – Château Rouge",
          context: "75018, Paris",
          lon: 2.3541,
          lat: 48.8858,
          postcode: "75018",
          city: "Paris"
        },
        {
          label: "Quartier Amiraux – Simplon – Poissonniers",
          context: "75018, Paris",
          lon: 2.3524,
          lat: 48.8951,
          postcode: "75018",
          city: "Paris"
        },
        {
          label: "Quartier La Chapelle – Marx Dormoy",
          context: "75018, Paris",
          lon: 2.3614,
          lat: 48.8889,
          postcode: "75018",
          city: "Paris"
        },
        {
          label: "Quartier Moskova – Porte de Montmartre",
          context: "75018, Paris",
          lon: 2.3355,
          lat: 48.8953,
          postcode: "75018",
          city: "Paris"
        },
        {
          label: "Quartier Charles Hermite – Évangile",
          context: "75018, Paris",
          lon: 2.3636,
          lat: 48.8974,
          postcode: "75018",
          city: "Paris"
        }
      ]
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
      title: "La mairie du 18e, c'est notre maison commune",
      descriptionParagraphs: [
        "les chaises, liste citoyenne et participative du 18e arrondissement, vous invite à co-contruire le programme de la prochaine mandature.",
        "Vous avez une simple idée à proposer, une problématique à exposer ?",
        "Partagez la ici même si elle est encore floue ou inaboutie. Cet espace est un laboratoire de collaboration et de mutualisation pour faire d'une idée un projet commun.",
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
      title: '',
    },
    
    // Statistiques
    stats: {
      totalContributions: 'Contributions',
      totalIdeas: 'Projets partagées',
      totalSupports: 'Soutiens reçus',
    },
    
    // Section propositions mises en avant
    recentPropositions: {
      title: 'Propositions les plus soutenues',
      loadingText: 'Chargement des propositions les plus soutenues...',
      emptyText: 'Aucune proposition soutenue pour le moment.',
    },
    
    // Call-to-Action principal
    cta: {
      buttonText: 'Voir plus de propositions',
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
    
    socialLinks: [
      {
        url: 'https://discord.gg/WuUY5dtB',
        label: 'Discord',
        network: 'discord'
      },
      {
        url: 'mailto:contact@holonsystems.org',
        label: 'Email',
        network: 'email'
      },
      {
        url: 'https://github.com/Pseud3mys/IdeoSphere-Community',
        label: 'Github',
        network: 'github'
      },
      // Exemples supplémentaires :
      // { url: 'https://instagram.com/ideosphere', label: 'Instagram' },
      // { url: 'https://ma-liste-citoyenne.fr', label: 'Notre Site Web' },
    ],
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
      embedUrl: 'https://embed.kumu.io/f9a1bd50e97942f6bbb04d82681fb7a5',
      
      // URL directe vers le projet Kumu
      projectUrl: 'https://embed.kumu.io/f9a1bd50e97942f6bbb04d82681fb7a5',
      
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
    showBetaBanner: false,
    
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
    },
  },
};