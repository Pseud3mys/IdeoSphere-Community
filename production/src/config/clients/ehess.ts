/**
 * Configuration client - IdeoSphere Ehess
 * Seul ce qui diffère de la configuration par défaut (default.ts) est déclaré ici.
 */

import { defineClient } from '../defineClient';

export const ehessConfig = defineClient({
  identity: { appName: 'IdeoSphere Ehess' },

  features: { showBetaBanner: false, enableNewsletters: false },

  welcome: {
    title: 'Aidez nous à la conception du futur bâtiment de l\'EHESS-FMSH au campus Condorcet.',
    descriptionParagraphs: [
      'L\'agence Encore Heureux mène une action de concertation afin d\'alimenter la conception du projet architectural. C\'est la "permanence architecturale", à savoir la présence alternée de deux architectes sur les sites de l\'EHESS et de la FMSH au 54 Bd Raspail et au campus Condorcet depuis mars. Elle prend aussi la forme de ce forum en ligne, conçu par des étudiant·es de l\'EHESS, pour que vous puissiez échanger sur vos besoins et vos usages à distance.',
      'N\'hésitez pas à aimer les posts qui vous parlent et à nous décrire les espaces que vous imaginez !',
    ],
    quickIdeaPlaceholder: '“un lieu où rester après un séminaire”, “plus de couleurs”, “une salle de sieste ?”',
  },

  cartography: {
    embedUrl: 'https://embed.kumu.io/2fca4943c753f107bc6f850ab6ca112a',
    projectUrl: 'https://embed.kumu.io/2fca4943c753f107bc6f850ab6ca112a',
  },
});
