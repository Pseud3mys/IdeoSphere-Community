import { GroupLink } from "../types";

/**
 * Liens entre groupes (Phase 4)
 * 
 * Liens définis :
 * - Vertical : Commission Culture (g1) → Culture Locale (g2)
 * - Horizontal : GT Mobilités 2025 (g3) ↔ Commission Environnement (g4)
 */

export const groupLinks: GroupLink[] = [
  // Lien vertical : Commission Culture est parent de Culture Locale
  {
    id: 'gl1',
    type: 'vertical',
    parentGroupId: 'g1',
    childGroupId: 'g2',
    createdAt: new Date('2024-02-05'),
    createdBy: '1', // Marie Dubois
  },

  // Lien horizontal : GT Mobilités et Commission Environnement sont partenaires
  {
    id: 'gl2',
    type: 'horizontal',
    groupId1: 'g3',
    groupId2: 'g4',
    createdAt: new Date('2024-03-15'),
    createdBy: '3', // Sophie Laurent
  },
];

export default groupLinks;
