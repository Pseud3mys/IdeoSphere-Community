import { Group, GroupMembership } from "../types";

/**
 * Données mockées : 5 groupes de test variés et connectés
 * 
 * Structure :
 * - g1 : Commission Culture (team) - Parent de g2
 * - g2 : Culture Locale (community) - Enfant de g1
 * - g3 : GT Mobilités 2025 (project) - Partenaire de g4
 * - g4 : Commission Environnement (team) - Partenaire de g3
 * - g5 : Quartier Nord (local)
 */

export const groups: Group[] = [
  {
    id: 'g1',
    name: 'Commission Culture',
    description: 'Groupe de travail dédié au développement des activités culturelles sur le territoire. Nous coordonnons les initiatives, organisons des événements et soutenons les acteurs culturels locaux.',
    shortDescription: 'Développement des activités culturelles territoriales',
    type: 'team',
    avatar: '🎭',
    location: 'Territoire',
    tags: ['culture', 'événements', 'coordination'],
    memberCount: 3,
    ideaCount: 5,
    projectCount: 2,
    createdAt: new Date('2024-01-15'),
    createdBy: ['1'], // Alice (Phase 2 - pour l'instant juste un fondateur)
    animators: ['1'], // Alice
    isActive: true,
  },
  {
    id: 'g2',
    name: 'Culture Locale',
    description: 'Communauté ouverte pour partager et développer toutes les initiatives culturelles locales : spectacles, expositions, ateliers, festivals. Un espace d\'échange pour citoyens, artistes et associations.',
    shortDescription: 'Initiatives culturelles citoyennes et associatives',
    type: 'community',
    avatar: '🎨',
    location: 'Territoire',
    tags: ['culture', 'citoyens', 'associations', 'festivals'],
    memberCount: 4,
    ideaCount: 8,
    projectCount: 3,
    createdAt: new Date('2024-02-01'),
    createdBy: ['2'], // Pierre Martin
    animators: ['2', '4', '1'], // Pierre, Thomas, Marie
    isActive: true,
  },
  {
    id: 'g3',
    name: 'GT Mobilités 2025',
    description: 'Groupe de travail transversal pour repenser les mobilités sur le territoire d\'ici 2025. Focus sur les modes doux, les transports collectifs et l\'accessibilité pour tous.',
    shortDescription: 'Mobilités durables et accessibles sur le territoire',
    type: 'project',
    avatar: '🚲',
    location: 'Territoire',
    tags: ['mobilité', 'transport', 'écologie', 'accessibilité'],
    memberCount: 3,
    ideaCount: 3,
    projectCount: 1,
    createdAt: new Date('2024-03-10'),
    createdBy: ['3'], // Sophie Laurent
    animators: ['3'], // Sophie
    isActive: true,
  },
  {
    id: 'g4',
    name: 'Commission Environnement',
    description: 'Groupe de travail pour toutes les questions environnementales : transition écologique, gestion des déchets, biodiversité, énergie. Collaboration avec les autres commissions pour intégrer l\'environnement dans tous les projets.',
    shortDescription: 'Transition écologique et protection de l\'environnement',
    type: 'team',
    avatar: '🌱',
    location: 'Territoire',
    tags: ['environnement', 'écologie', 'transition', 'biodiversité'],
    memberCount: 3,
    ideaCount: 6,
    projectCount: 2,
    createdAt: new Date('2024-01-20'),
    createdBy: ['5'], // Emma Rodriguez
    animators: ['5'], // Emma
    isActive: true,
  },
  {
    id: 'g5',
    name: 'Quartier Nord',
    description: 'Groupe local du Quartier Nord pour les habitants et acteurs du quartier. Échanges sur la vie locale, projets de proximité, événements de quartier et amélioration du cadre de vie.',
    shortDescription: 'Vie locale et projets du Quartier Nord',
    type: 'local',
    avatar: '🏘️',
    location: 'Quartier Nord',
    tags: ['quartier', 'proximité', 'habitants', 'local'],
    memberCount: 3,
    ideaCount: 2,
    projectCount: 1,
    createdAt: new Date('2024-02-15'),
    createdBy: ['12'], // Jean-Claude Perrin
    animators: ['12'], // Jean-Claude
    isActive: true,
  },
];

/**
 * Memberships correspondants
 * 
 * Répartition :
 * - Marie Dubois (1) : g1 (animateur), g2 (membre), g3 (membre), g5 (membre)
 * - Pierre Martin (2) : g1 (membre), g2 (animateur), g4 (membre)
 * - Sophie Laurent (3) : g1 (membre), g3 (animateur), g5 (membre)
 * - Thomas Chen (4) : g2 (animateur), g4 (membre)
 * - Emma Rodriguez (5) : g2 (membre), g4 (animateur)
 * - Jean-Claude Perrin (12) : g3 (membre), g5 (animateur)
 */
export const groupMemberships: GroupMembership[] = [
  // Groupe g1 - Commission Culture
  { userId: '1', groupId: 'g1', role: 'animator', joinedAt: new Date('2024-01-15'), isActive: true },
  { userId: '2', groupId: 'g1', role: 'member', joinedAt: new Date('2024-01-16'), isActive: true },
  { userId: '3', groupId: 'g1', role: 'member', joinedAt: new Date('2024-01-17'), isActive: true },

  // Groupe g2 - Culture Locale
  { userId: '2', groupId: 'g2', role: 'animator', joinedAt: new Date('2024-02-01'), isActive: true },
  { userId: '4', groupId: 'g2', role: 'animator', joinedAt: new Date('2024-02-01'), isActive: true },
  { userId: '1', groupId: 'g2', role: 'member', joinedAt: new Date('2024-02-02'), isActive: true },
  { userId: '5', groupId: 'g2', role: 'member', joinedAt: new Date('2024-02-05'), isActive: true },

  // Groupe g3 - GT Mobilités 2025
  { userId: '3', groupId: 'g3', role: 'animator', joinedAt: new Date('2024-03-10'), isActive: true },
  { userId: '1', groupId: 'g3', role: 'member', joinedAt: new Date('2024-03-11'), isActive: true },
  { userId: '12', groupId: 'g3', role: 'member', joinedAt: new Date('2024-03-12'), isActive: true },

  // Groupe g4 - Commission Environnement
  { userId: '5', groupId: 'g4', role: 'animator', joinedAt: new Date('2024-01-20'), isActive: true },
  { userId: '2', groupId: 'g4', role: 'member', joinedAt: new Date('2024-01-21'), isActive: true },
  { userId: '4', groupId: 'g4', role: 'member', joinedAt: new Date('2024-01-22'), isActive: true },

  // Groupe g5 - Quartier Nord
  { userId: '12', groupId: 'g5', role: 'animator', joinedAt: new Date('2024-02-15'), isActive: true },
  { userId: '1', groupId: 'g5', role: 'member', joinedAt: new Date('2024-02-16'), isActive: true },
  { userId: '3', groupId: 'g5', role: 'member', joinedAt: new Date('2024-02-17'), isActive: true },
];

export default groups;
