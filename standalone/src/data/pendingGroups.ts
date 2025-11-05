/**
 * Données mockées pour les groupes en attente de création (Phase 2)
 * 
 * Utilisées pour tester le flux de création collaborative
 */

import { PendingGroupCreation } from '../types';

export const pendingGroups: PendingGroupCreation[] = [
  {
    id: 'pg1',
    name: 'GT Mobilité Douce',
    description: 'Groupe de travail temporaire pour développer des solutions de mobilité douce dans notre territoire : vélos, trottinettes, piétons.',
    shortDescription: 'Développer la mobilité douce sur le territoire',
    type: 'project',
    tags: ['mobilité', 'vélo', 'environnement', 'transport'],
    location: 'Le Blanc',
    founders: ['1', '2', '3'], // Marie, Pierre, Sophie - 3 fondateurs
    confirmations: ['1', '2'], // Marie et Pierre ont confirmé, Sophie en attente
    createdAt: new Date('2025-10-28'),
    expiresAt: new Date('2025-11-04'), // 7 jours après création
    initiatorId: '1', // Marie Dubois
  },
  {
    id: 'pg2',
    name: 'Quartier Sud',
    description: 'Antenne locale pour les habitants du quartier Sud. Espace de discussion et d\'organisation pour les projets et événements du quartier.',
    shortDescription: 'Antenne locale du quartier Sud',
    type: 'local',
    tags: ['quartier', 'local', 'voisinage'],
    location: 'Le Blanc - Quartier Sud',
    founders: ['4', '5', '12'], // Thomas, Emma, Jean-Claude - 3 fondateurs
    confirmations: ['4'], // Thomas seul a confirmé
    createdAt: new Date('2025-10-30'),
    expiresAt: new Date('2025-11-06'),
    initiatorId: '4', // Thomas Chen
  },
  {
    id: 'pg3',
    name: 'Numérique Responsable',
    description: 'Communauté d\'intérêt autour du numérique responsable et de la sobriété numérique. Partage de bonnes pratiques et initiatives locales.',
    shortDescription: 'Pour un numérique plus responsable',
    type: 'community',
    tags: ['numérique', 'environnement', 'sobriété', 'tech'],
    founders: ['5', '12', '13', '1'], // Emma, Jean-Claude, Léa, Marie - 4 fondateurs
    confirmations: ['5', '12', '13', '1'], // Tous ont confirmé - sera activé automatiquement
    createdAt: new Date('2025-10-29'),
    expiresAt: new Date('2025-11-05'),
    initiatorId: '5', // Emma Rodriguez
  },
];
