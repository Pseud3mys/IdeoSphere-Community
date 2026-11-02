/**
 * Configuration client - IdeoSphere SolidArcy
 * Seul ce qui diffère de la configuration par défaut (default.ts) est déclaré ici.
 */

import { defineClient } from '../defineClient';
import logo_solidarcy from '../../assets/logo_solidarcy.png';

export const solidarcyConfig = defineClient({
  identity: {
    appName: 'IdeoSphere SolidArcy',
    logoUrl: logo_solidarcy,
  },

  features: { showBetaBanner: false, enableNewsletters: false },

  welcome: {
    descriptionParagraphs: [
      'Vous avez une idée pour améliorer le quotidien, créer du lien ou imaginer de nouveaux usages ensemble ? Partagez-la ici, même si elle est encore floue. Cet espace permet de proposer, d\'échanger et de faire évoluer les idées collectivement, jusqu\'à les transformer en projets concrets.',
    ],
  },

  socialLinks: [
    { url: 'https://www.instagram.com/solid.arcy/', label: 'Instagram Solidarcy' },
    { url: 'mailto:contact@holonsystems.org', label: 'Email', network: 'email' },
    { url: 'https://github.com/Pseud3mys/IdeoSphere-Community', label: 'Github', network: 'github' },
  ],

  cartography: {
    embedUrl: 'https://embed.kumu.io/fea792a4683485e61bf3f692dce16a9f',
    projectUrl: 'https://embed.kumu.io/fea792a4683485e61bf3f692dce16a9f',
  },
});
