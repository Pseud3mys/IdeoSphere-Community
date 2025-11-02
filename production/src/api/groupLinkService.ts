/**
 * groupLinkService.ts
 * 
 * Service API pour la gestion des liens entre groupes (Phase 4)
 * 
 * Fonctionnalités :
 * - Récupération des liens d'un groupe
 * - Création de liens verticaux (parent-enfant)
 * - Création de liens horizontaux (partenaires)
 * - Suppression de liens
 * 
 * Note : Version simplifiée pour Phase 4
 * Les liens sont bidirectionnels simples sans options complexes
 */

import { GroupLink, VerticalGroupLink, HorizontalGroupLink, Group } from '../types';
import { groupLinks } from '../data/groupLinks';
import { groups } from '../data/groups';

const SIMULATED_DELAY = 300;

function simulateNetworkDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
}

/**
 * Récupère tous les liens d'un groupe donné
 */
export async function fetchGroupLinks(groupId: string): Promise<{
  parentLinks: VerticalGroupLink[];
  childLinks: VerticalGroupLink[];
  partnerLinks: HorizontalGroupLink[];
  linkedGroups: Group[];
}> {
  await simulateNetworkDelay();
  
  const parentLinks: VerticalGroupLink[] = [];
  const childLinks: VerticalGroupLink[] = [];
  const partnerLinks: HorizontalGroupLink[] = [];
  const linkedGroupIds = new Set<string>();
  
  groupLinks.forEach((link) => {
    if (link.type === 'vertical') {
      if (link.parentGroupId === groupId) {
        childLinks.push(link);
        linkedGroupIds.add(link.childGroupId);
      } else if (link.childGroupId === groupId) {
        parentLinks.push(link);
        linkedGroupIds.add(link.parentGroupId);
      }
    } else if (link.type === 'horizontal') {
      if (link.groupId1 === groupId) {
        partnerLinks.push(link);
        linkedGroupIds.add(link.groupId2);
      } else if (link.groupId2 === groupId) {
        partnerLinks.push(link);
        linkedGroupIds.add(link.groupId1);
      }
    }
  });
  
  const linkedGroups = groups.filter((g) => linkedGroupIds.has(g.id));
  
  console.log(
    `📦 [groupLinkService.fetchGroupLinks] Group ${groupId}: ${parentLinks.length} parents, ${childLinks.length} enfants, ${partnerLinks.length} partenaires`
  );
  
  return { parentLinks, childLinks, partnerLinks, linkedGroups };
}

/**
 * Récupère tous les liens du système (pour chargement initial)
 */
export async function fetchAllGroupLinks(): Promise<GroupLink[]> {
  await simulateNetworkDelay();
  
  console.log(`📦 [groupLinkService.fetchAllGroupLinks] ${groupLinks.length} liens chargés`);
  return [...groupLinks];
}

/**
 * Crée un lien vertical (parent → enfant)
 */
export async function createVerticalLink(
  parentGroupId: string,
  childGroupId: string,
  createdBy: string
): Promise<VerticalGroupLink> {
  await simulateNetworkDelay();
  
  // Vérifier que les groupes existent
  const parentExists = groups.some((g) => g.id === parentGroupId);
  const childExists = groups.some((g) => g.id === childGroupId);
  
  if (!parentExists || !childExists) {
    throw new Error('Groupe parent ou enfant introuvable');
  }
  
  // Vérifier qu'il n'y a pas déjà un lien entre ces groupes
  const existingLink = groupLinks.find(
    (l) =>
      (l.type === 'vertical' && l.parentGroupId === parentGroupId && l.childGroupId === childGroupId) ||
      (l.type === 'vertical' && l.parentGroupId === childGroupId && l.childGroupId === parentGroupId)
  );
  
  if (existingLink) {
    throw new Error('Un lien existe déjà entre ces groupes');
  }
  
  const newLink: VerticalGroupLink = {
    id: `gl${Date.now()}`,
    type: 'vertical',
    parentGroupId,
    childGroupId,
    createdAt: new Date(),
    createdBy,
  };
  
  groupLinks.push(newLink);
  
  console.log(
    `✅ [groupLinkService.createVerticalLink] Lien vertical créé: ${parentGroupId} → ${childGroupId}`
  );
  
  return newLink;
}

/**
 * Crée un lien horizontal (partenaires)
 */
export async function createHorizontalLink(
  groupId1: string,
  groupId2: string,
  createdBy: string
): Promise<HorizontalGroupLink> {
  await simulateNetworkDelay();
  
  // Vérifier que les groupes existent
  const group1Exists = groups.some((g) => g.id === groupId1);
  const group2Exists = groups.some((g) => g.id === groupId2);
  
  if (!group1Exists || !group2Exists) {
    throw new Error('Un ou plusieurs groupes introuvables');
  }
  
  // Vérifier qu'il n'y a pas déjà un lien entre ces groupes
  const existingLink = groupLinks.find(
    (l) =>
      (l.type === 'horizontal' && 
       ((l.groupId1 === groupId1 && l.groupId2 === groupId2) ||
        (l.groupId1 === groupId2 && l.groupId2 === groupId1)))
  );
  
  if (existingLink) {
    throw new Error('Un lien existe déjà entre ces groupes');
  }
  
  const newLink: HorizontalGroupLink = {
    id: `gl${Date.now()}`,
    type: 'horizontal',
    groupId1,
    groupId2,
    createdAt: new Date(),
    createdBy,
  };
  
  groupLinks.push(newLink);
  
  console.log(
    `✅ [groupLinkService.createHorizontalLink] Lien horizontal créé: ${groupId1} ↔ ${groupId2}`
  );
  
  return newLink;
}

/**
 * Supprime un lien entre groupes
 */
export async function deleteGroupLink(linkId: string, userId: string): Promise<boolean> {
  await simulateNetworkDelay();
  
  const linkIndex = groupLinks.findIndex((l) => l.id === linkId);
  
  if (linkIndex === -1) {
    throw new Error('Lien introuvable');
  }
  
  groupLinks.splice(linkIndex, 1);
  
  console.log(`✅ [groupLinkService.deleteGroupLink] Lien ${linkId} supprimé par user ${userId}`);
  
  return true;
}
