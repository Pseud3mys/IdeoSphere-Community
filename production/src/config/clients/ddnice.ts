/**
 * Configuration client - IdeoSphere Nice
 * Seul ce qui diffère de la configuration par défaut (default.ts) est déclaré ici.
 */

import { defineClient } from '../defineClient';

export const ddniceConfig = defineClient({
  identity: { appName: 'IdeoSphere Nice', appTagline: 'Plateforme d\'intelligence collective' },

  features: { showBetaBanner: false, enableNewsletters: false },

  welcome: {
    descriptionParagraphs: [
      'Vous avez une idée pour améliorer le quotidien, créer du lien ou imaginer de nouveaux usages ensemble ? Partagez-la ici, même si elle est encore floue. Cet espace permet de proposer, d\'échanger et de faire évoluer les idées collectivement, jusqu\'à les transformer en projets concrets.',
    ],
  },

  cartography: {
    embedUrl: 'https://embed.kumu.io/dfe9abd41366e3be06c7aa063eb7282b',
    projectUrl: 'https://embed.kumu.io/dfe9abd41366e3be06c7aa063eb7282b',
  },
});
