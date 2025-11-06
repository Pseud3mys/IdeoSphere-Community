/**
 * Configuration Client - IdeoSphere
 * 
 * Ce fichier centralise tous les textes et paramètres qui dépendent du contexte client.
 * Modifier ce fichier pour adapter l'application à différents types d'organisations :
 * - Mairies et collectivités
 * - Entreprises
 * - Associations
 * - ONG
 */

// Types de clients supportés
export type ClientType = 'mairie' | 'entreprise' | 'association' | 'ong';

// Configuration principale
export const clientConfig = {
  // ============================================================================
  // 1. IDENTITÉ ET BRANDING
  // ============================================================================
  
  identity: {
    // Nom de l'application
    appName: 'IdeoSphere',
    
    // Tagline / Sous-titre
    appTagline: 'Votre communauté d\'idées',
    
    // Description courte (utilisée dans le footer)
    appDescriptionShort: 'Un système nerveux pour l\'intelligence collective. Nous connectons les énergies militantes et facilitons l\'émergence d\'actions concrètes pour le changement social et écologique.',
    
    // Mission principale (utilisée dans la page À propos)
    appMission: 'IdeoSphere est une plateforme collaborative open source conçue pour faciliter l\'émergence d\'idées et d\'actions concrètes au service du changement social et écologique. Notre mission est de créer un "système nerveux" pour l\'intelligence collective, permettant aux communautés de rassembler leurs énergies militantes et de transformer les bonnes idées en projets réalisables.',
    
    // Statut du projet
    projectStatus: 'Projet open source',
    
    // Copyright
    copyright: '© 2025 IdeoSphere. Tous droits réservés.',
  },

  // ============================================================================
  // 2. TERMINOLOGIE CONTEXTUELLE
  // ============================================================================
  
  // Type de client (détermine la terminologie par défaut)
  clientType: 'mairie' as ClientType,
  
  terminology: {
    // Membre (varie selon le contexte : citoyen, collaborateur, membre, bénévole...)
    member: {
      singular: 'citoyen',
      singularFeminine: 'citoyenne',
      plural: 'citoyens',
    },
    
    // Organisation (varie selon le contexte : commune, entreprise, association...)
    organization: {
      singular: 'commune',
      plural: 'communes',
    },
    
    // Territoire local (varie selon le contexte : village, quartier, site, département...)
    territory: {
      local: 'village',
    },
    
    // Type de participation (varie selon le contexte : citoyenne, collaborative, militante...)
    participation: {
      adjective: 'citoyenne', // Ex: "idée citoyenne", "vie citoyenne", "post citoyen"
    },
    
    // Localisation géographique
    location: {
      cityName: 'Le Blanc',
      enabled: true, // Afficher ou non les champs de localisation (false pour entreprises)
    },
  },

  // ============================================================================
  // 3. PAGE D'ACCUEIL (CITIZENWELCOME)
  // ============================================================================
  
  welcome: {
    // Bannière version Bêta (affichage contrôlé par features.showBetaBanner)
    betaBanner: {
      title: 'Version Bêta d\'ideoSphere !',
      description: 'Cette plateforme est en <strong>version bêta ouverte</strong> : son objectif principal est de vous permettre de découvrir et tester IdeoSphere. Certaines fonctionnalités (comme les communautés) ne sont pas encore actives et des bugs peuvent survenir. Vous pouvez déjà l\'utiliser pour tester la plateforme et partager vos idées.',
      feedbackInstructions: '💡 <strong>Signaler un bug ou suggérer une amélioration :</strong> ajoutez simplement <code>#bug</code> ou <code>#suggestion</code> dans vos posts pour me les faire remonter !',
    },
    
    // Section Hero (titre principal)
    hero: {
      title: 'Partagez, explorez ou discutez d\'idées locales',
      description: 'Aménagement urbain, services publics, initiatives citoyennes, environnement, mobilité, culture, solidarité... Des grandes transformations aux petites améliorations du quotidien, votre liste municipale recueille toutes vos propositions pour améliorer votre territoire.',
      
      // Thématiques suggérées (utilisées dans la description)
      themes: [
        'Aménagement urbain',
        'Services publics',
        'Initiatives citoyennes',
        'Environnement',
        'Mobilité',
        'Culture',
        'Solidarité',
      ],
    },
    
    // Section "Partagez votre idée"
    quickIdea: {
      sectionTitle: 'Partagez votre idée en quelques mots',
      placeholder: 'Ex: Des bancs supplémentaires place de la République pour que les personnes âgées puissent se reposer...',
      buttonText: 'Continuer',
      
      // Étape de finalisation
      finalizationTitle: 'Finalisation de votre idée',
      locationSectionTitle: 'Localisation de l\'idée (optionnelle)',
      locationPlaceholder: 'Ex: Place de la République, Le Blanc',
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
      fallbackCategoryIdea: 'Idée citoyenne',
      fallbackCategoryPost: 'Discussion citoyenne',
      loadingText: 'Chargement des propositions récentes...',
      emptyText: 'Aucune proposition récente trouvée.',
    },
    
    // Call-to-Action principal
    cta: {
      buttonText: 'Explorer toutes les propositions',
      
      // Badges de valeurs
      values: [
        'Participation citoyenne',
        'Projets concrets',
        'Budget municipal dédié',
      ],
    },
    
    // Section "Envie de découvrir"
    discover: {
      title: 'Envie de découvrir la plateforme ?',
      description: 'Explorez les propositions déjà partagées par les citoyens et découvrez comment participer à l\'amélioration de notre commune.',
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
      ideaShareText: (title: string) => `Découvrez cette idée citoyenne : ${title}`,
      
      // Texte pour partager un post
      postShareText: (preview: string) => `Découvrez ce post citoyen : ${preview}`,
      
      // Titres de dialogue
      ideaDialogTitle: 'Partager cette idée',
      postDialogTitle: 'Partager ce post',
    },
    
    // SignupPage
    signupPage: {
      // Titre de la page
      title: 'Créer un compte',
      
      // Description avec nom de ville
      description: (cityName: string) => `Créez votre compte pour participer pleinement à la vie citoyenne de ${cityName}`,
      
      // Helper text pour la bio
      bioHelperText: 'Cela aide les autres citoyens à mieux comprendre vos motivations',
      
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
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        password: '••••••••',
        location: 'Quartier, Ville',
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
      titlePlaceholder: 'Ex: Réflexion sur les réunions virtuelles...',
      contentPlaceholder: 'Partagez votre réflexion, observation, question ou idée avec la communauté...',
      locationPlaceholder: 'Ex: Place de la République, Quartier Centre-ville',
    },
    
    // Idées (projets structurés)
    idea: {
      titlePlaceholder: 'Ex: Plateforme d\'innovation collaborative',
      summaryPlaceholder: 'Décrivez votre idée en une phrase percutante qui donne envie d\'en savoir plus...',
      locationPlaceholder: 'Ex: Place de la République, Quartier Centre-ville',
      
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

Quels bénéfices concrets pour les membres de la communauté ?`,
        
        withoutSourcePost: `## Contexte et enjeu

Décrivez le problème ou l'opportunité que vous avez identifié...

## Solution proposée

Expliquez en détail votre idée et comment elle répond au besoin...

## Mise en œuvre

- Étape 1 : ...
- Étape 2 : ...

## Impact attendu

Quels bénéfices concrets pour les membres de la communauté ?`,
      },
    },
    
    // Groupes
    group: {
      namePlaceholder: 'Ex: Commission Culture',
      locationPlaceholder: 'Ex: Toulouse',
      tagsPlaceholder: 'Ex: culture, événements, art',
    },
    
    // Discussions
    discussion: {
      topicTitlePlaceholder: 'Ex: Question sur la mise en œuvre...',
    },
    
    // Profil utilisateur
    profile: {
      birthYearPlaceholder: 'Ex: 1985',
      bioPlaceholder: 'Ex: Passionné(e) d\'urbanisme et d\'écologie, je souhaite contribuer à l\'amélioration de notre ville...',
    },
    
    // Collaboration
    collaboration: {
      searchPlaceholder: 'Rechercher un membre à inviter comme co-créateur...',
    },
  },

  // ============================================================================
  // 10. INTÉGRATIONS EXTERNES
  // ============================================================================
  
  integrations: {
    // Kumu.io - Visualisation de réseaux
    kumu: {
      // URL de l'iframe d'embed Kumu (si disponible)
      embedUrl: 'https://embed.kumu.io/8db7dfc9c4f40c4d22a5996a02dc13ff',
      
      // URL directe vers le projet Kumu
      projectUrl: 'https://embed.kumu.io/8db7dfc9c4f40c4d22a5996a02dc13ff',
      
      // Activer l'affichage de l'iframe
      enabled: true,
      
      // Dimensions par défaut de l'iframe
      width: '100%',
      height: '600px',
    },
  },

  // ============================================================================
  // 11. CONFIGURATION AVANCÉE
  // ============================================================================
  
  features: {
    // Afficher ou non la bannière bêta
    showBetaBanner: true,
    
    // Activer les newsletters
    enableNewsletters: false,
  },
};

// ============================================================================
// HELPERS - Fonctions utilitaires pour accéder à la configuration
// ============================================================================

/**
 * Obtient le terme pour "membre" selon le genre et le nombre
 */
export function getMemberTerm(options: { plural?: boolean; feminine?: boolean } = {}) {
  const { plural = false, feminine = false } = options;
  
  if (plural) {
    return clientConfig.terminology.member.plural;
  }
  
  if (feminine) {
    return clientConfig.terminology.member.singularFeminine;
  }
  
  return clientConfig.terminology.member.singular;
}

/**
 * Obtient le terme pour "organisation"
 */
export function getOrganizationTerm(plural = false) {
  return plural 
    ? clientConfig.terminology.organization.plural 
    : clientConfig.terminology.organization.singular;
}

/**
 * Obtient le nom de la ville/localisation
 */
export function getCityName() {
  return clientConfig.terminology.location.cityName;
}

/**
 * Vérifie si la localisation est activée
 */
export function isLocationEnabled() {
  return clientConfig.terminology.location.enabled;
}

/**
 * Obtient l'URL de contact
 */
export function getContactEmail() {
  return clientConfig.footer.contact.email.address;
}

/**
 * Obtient le texte de partage pour une idée
 */
export function getIdeaShareText(title: string) {
  return clientConfig.systemMessages.shareDialog.ideaShareText(title);
}

/**
 * Obtient le texte de partage pour un post
 */
export function getPostShareText(preview: string) {
  return clientConfig.systemMessages.shareDialog.postShareText(preview);
}

/**
 * Obtient la description de la page d'inscription
 */
export function getSignupDescription() {
  return clientConfig.systemMessages.signupPage.description(getCityName());
}

// Export par défaut
export default clientConfig;