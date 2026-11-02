/**
 * Configuration client - IdeoSphere
 * Seul ce qui diffère de la configuration par défaut (default.ts) est déclaré ici.
 */

import { defineClient } from '../defineClient';
import logo_leschaises from '../../assets/logo_leschaises.png';

export const lesChaisesConfig = defineClient({
  identity: {
    appTagline: 'Plateforme d\'intelligence collective',
    logoUrl: logo_leschaises,
  },

  features: { showBetaBanner: false, enableNewsletters: false },

  welcome: {
    title: 'La mairie du 18e, c\'est notre maison commune',
    descriptionParagraphs: [
      'les chaises, liste citoyenne et participative du 18e arrondissement, vous invite à co-contruire le programme de la prochaine mandature.',
      'Vous avez une simple idée à proposer, une problématique à exposer ?',
      'Partagez la ici même si elle est encore floue ou inaboutie. Cet espace est un laboratoire de collaboration et de mutualisation pour faire d\'une idée un projet commun.',
    ],
  },

  locations: {
    suggestions: [
      {
        label: 'Quartier Montmartre',
        context: '75018, Paris',
        lon: 2.343,
        lat: 48.8864,
        postcode: '75018',
        city: 'Paris',
      },
      {
        label: 'Quartier Grandes-Carrières – Clichy',
        context: '75018, Paris',
        lon: 2.3308,
        lat: 48.8885,
        postcode: '75018',
        city: 'Paris',
      },
      {
        label: 'Quartier Clignancourt – Jules Joffrin',
        context: '75018, Paris',
        lon: 2.3443,
        lat: 48.8924,
        postcode: '75018',
        city: 'Paris',
      },
      {
        label: 'Quartier Goutte d\'Or – Château Rouge',
        context: '75018, Paris',
        lon: 2.3541,
        lat: 48.8858,
        postcode: '75018',
        city: 'Paris',
      },
      {
        label: 'Quartier Amiraux – Simplon – Poissonniers',
        context: '75018, Paris',
        lon: 2.3524,
        lat: 48.8951,
        postcode: '75018',
        city: 'Paris',
      },
      {
        label: 'Quartier La Chapelle – Marx Dormoy',
        context: '75018, Paris',
        lon: 2.3614,
        lat: 48.8889,
        postcode: '75018',
        city: 'Paris',
      },
      {
        label: 'Quartier Moskova – Porte de Montmartre',
        context: '75018, Paris',
        lon: 2.3355,
        lat: 48.8953,
        postcode: '75018',
        city: 'Paris',
      },
      {
        label: 'Quartier Charles Hermite – Évangile',
        context: '75018, Paris',
        lon: 2.3636,
        lat: 48.8974,
        postcode: '75018',
        city: 'Paris',
      },
    ],
  },

  cartography: {
    embedUrl: 'https://embed.kumu.io/f9a1bd50e97942f6bbb04d82681fb7a5',
    projectUrl: 'https://embed.kumu.io/f9a1bd50e97942f6bbb04d82681fb7a5',
  },
});
