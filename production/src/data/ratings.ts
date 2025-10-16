import { RatingCriterion } from '../types';

export const defaultRatingCriteria: RatingCriterion[] = [
  {
    id: 'potential',
    name: 'Potentiel d\'impact',
    description: "L'impact potentiel de cette idée sur la communauté",
    scale: [
      { value: 1, label: 'Limité', description: 'Impact local ou niche' },
      { value: 2, label: 'Modéré', description: 'Bénéfices pour quelques membres' },
      { value: 3, label: 'Significatif', description: 'Impact notable sur la communauté' },
      { value: 4, label: 'Important', description: 'Fort potentiel de transformation' },
      { value: 5, label: 'Révolutionnaire', description: 'Changement majeur possible' }
    ]
  },
  {
    id: 'feasibility',
    name: 'Faisabilité',
    description: 'La facilité de mise en œuvre de cette idée',
    scale: [
      { value: 1, label: 'Très difficile', description: 'Nombreux obstacles majeurs' },
      { value: 2, label: 'Difficile', description: 'Défis importants à surmonter' },
      { value: 3, label: 'Modéré', description: 'Réalisable avec des efforts' },
      { value: 4, label: 'Facile', description: 'Peu d\'obstacles identifiés' },
      { value: 5, label: 'Très facile', description: 'Mise en œuvre simple et directe' }
    ]
  },
  {
    id: 'completion',
    name: 'Aboutissement',
    description: 'Le niveau de détail et de préparation pour la réalisation',
    scale: [
      { value: 1, label: 'Ébauche', description: 'Idée générale, manque de détails' },
      { value: 2, label: 'Esquisse', description: 'Quelques éléments précisés' },
      { value: 3, label: 'Structurée', description: 'Bien détaillée, étapes claires' },
      { value: 4, label: 'Aboutie', description: 'Prête à être mise en œuvre' },
      { value: 5, label: 'Complète', description: 'Tous les détails finalisés' }
    ]
  }
];