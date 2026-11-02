/**
 * Configuration client - Vivons Nîmes
 * Seul ce qui diffère de la configuration par défaut (default.ts) est déclaré ici.
 */

import { defineClient } from '../defineClient';

export const vivonsnimesConfig = defineClient({
  identity: { appName: 'Vivons Nîmes', appTagline: 'Plateforme d\'intelligence collective IdeoSphere' },

  features: { showBetaBanner: false },

  welcome: {
    descriptionParagraphs: [
      'Vous avez une idée pour améliorer le quotidien, créer du lien ou imaginer de nouveaux usages ensemble ? Partagez-la ici, même si elle est encore floue. Cet espace permet de proposer, d\'échanger et de faire évoluer les idées collectivement, jusqu\'à les transformer en projets concrets.',
    ],
  },

  socialLinks: [
    { url: 'https://www.saintcyrencommun.fr/', label: 'Saint-Cyr-l\'École en commun', network: 'website' },
    { url: 'mailto:contact@holonsystems.org', label: 'Email', network: 'email' },
    { url: 'https://github.com/Pseud3mys/IdeoSphere-Community', label: 'Github', network: 'github' },
  ],

  cartography: {
    embedUrl: 'https://embed.kumu.io/c8bfc0943be71f56ea8b07e4619122a6',
    projectUrl: 'https://embed.kumu.io/c8bfc0943be71f56ea8b07e4619122a6',
  },
});
