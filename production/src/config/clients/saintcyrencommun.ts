/**
 * Configuration client - Saint-Cyr-l'École en commun
 * Seul ce qui diffère de la configuration par défaut (default.ts) est déclaré ici.
 */

import { defineClient } from '../defineClient';
import logoStCyr from '../../assets/logo_saintcyr.jpeg';

export const saintcyrencommunConfig = defineClient({
  identity: {
    appName: 'Saint-Cyr-l\'École en commun',
    appTagline: 'Plateforme d\'intelligence collective IdeoSphere',
    logoUrl: logoStCyr,
  },

  features: { showBetaBanner: false, enableNewsletters: false },

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
    embedUrl: 'https://embed.kumu.io/1767f6c69cb23145661dfb7e7eeb238a',
    projectUrl: 'https://embed.kumu.io/1767f6c69cb23145661dfb7e7eeb238a',
  },
});
