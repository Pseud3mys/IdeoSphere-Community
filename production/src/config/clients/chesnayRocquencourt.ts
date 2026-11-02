/**
 * Configuration client - IdeoSphere Chesnay Rocquencourt
 * Seul ce qui diffère de la configuration par défaut (default.ts) est déclaré ici.
 */

import { defineClient } from '../defineClient';

export const chesnayRocquencourtConfig = defineClient({
  identity: {
    appName: 'IdeoSphere Chesnay Rocquencourt',
    appMission: 'Notre mission est de fournir un espace numérique où chaque individu peut partager ses idées, collaborer avec d\'autres et contribuer à des projets qui ont un impact positif sur notre communauté. Nous croyons en la puissance de l\'intelligence collective pour résoudre les défis locaux et créer un avenir meilleur ensemble.',
  },

  features: { showBetaBanner: false, enableNewsletters: false },

  welcome: {
    descriptionParagraphs: [
      'Vous avez une idée pour améliorer le quotidien, créer du lien ou imaginer de nouveaux usages ensemble ? Partagez-la ici, même si elle est encore floue. Cet espace permet de proposer, d\'échanger et de faire évoluer les idées collectivement, jusqu\'à les transformer en projets concrets.',
    ],
  },

  cartography: {
    embedUrl: 'https://embed.kumu.io/c383a314a3e14cb07cf4218d2373c6a6',
    projectUrl: 'https://embed.kumu.io/c383a314a3e14cb07cf4218d2373c6a6',
  },
});
