/**
 * Configuration client - IdeoSphere Paris-Saclay (usage interne)
 * Seul ce qui diffère de la configuration par défaut (default.ts) est déclaré ici.
 */

import { defineClient } from '../defineClient';
import logoParisSaclay from '../../assets/logo_paris_saclay.svg';

export const interneParisSaclayConfig = defineClient({
  identity: {
    appName: 'IdeoSphere Paris-Saclay',
    appTagline: 'Espace d\'échange interne',
    appDescriptionShort: 'Un espace interne pour partager des idées, signaler des irritants et s\'appuyer sur l\'expertise de chacun avant de décider ensemble.',
    appMission: 'Cet espace interne permet aux agents et collaborateurs de partager en quelques mots une idée, une difficulté de terrain ou une expertise. Chaque contribution peut être enrichie par les regards techniques, juridiques, financiers ou humains de vos collègues, pour faire émerger ce qui fait consensus et ce qui manque encore, avant l\'arbitrage.',
    logoUrl: logoParisSaclay,
  },

  features: { showBetaBanner: false, enableNewsletters: false },

  welcome: {
    title: 'Partagez vos idées, enrichissez celles de vos collègues',
    descriptionParagraphs: [
      'Un irritant à signaler, une idée pour mieux travailler ensemble, une expertise à partager ? Déposez-la ici en quelques mots, même si elle est encore floue.',
      'Vos collègues peuvent la soutenir et la compléter avant qu\'elle soit portée plus loin.',
    ],
    quickIdeaPlaceholder: 'Ex: un formulaire difficile à remplir, un outil qui manque, une idée pour simplifier une démarche...',
  },

  terminology: {
    member: { singular: 'collègue', plural: 'collègues' },
    community: 'collectivité',
  },

  // À renseigner : grands services, sous-services (via `context`) et sites.
  // locations: {
  //   suggestions: [
  //     { label: 'Ressources humaines', context: 'Siège, Orsay', lon: 2.1869, lat: 48.6975 },
  //   ],
  //   addressSearch: false,
  // },

  placeholders: {
    postContent: 'Un irritant, une observation de terrain, une idée d\'amélioration...',
    idea: {
      title: 'Ex: Simplifier le formulaire de réservation de salle',
      summary: 'Résumez votre proposition en une phrase...',
      location: 'Ex: Service accueil, Tous sites',
    },
    group: {
      name: 'Ex: Chantier simplification',
      location: 'Ex: Siège',
      tags: 'Ex: accueil, outils, process',
    },
  },

  groupTypes: [
    { id: 'community', label: 'Service', labelPlural: 'Services', description: 'Les échanges d\'un service ou d\'un métier', icon: '👥' },
    { id: 'project', label: 'Projet', labelPlural: 'Projets', description: 'Un projet porté par plusieurs services', icon: '🎯' },
    { id: 'challenge', label: 'Chantier', labelPlural: 'Chantiers', description: 'Un chantier transversal (simplification, accueil…)', icon: '💡' },
  ],

  // Désactivée tant que la carte Kumu du client n'existe pas (étape 6 de add_tenant.md) :
  // sinon c'est la carte de démonstration par défaut qui s'afficherait.
  
  cartography: {
    embedUrl: 'https://embed.kumu.io/621d7ff05a2e8c22fed1fe625171a255',
    projectUrl: 'https://embed.kumu.io/621d7ff05a2e8c22fed1fe625171a255',
  },
});
