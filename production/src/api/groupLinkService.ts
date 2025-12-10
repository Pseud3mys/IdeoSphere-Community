// src/services/groupLinkService.ts

import { GroupLink, VerticalGroupLink, HorizontalGroupLink, Group, User } from '../types';
import apiClient from './apiClient';
import { 
  transformGroup, 
  transformUser,
  transformVerticalLink,
  transformHorizontalLink,
  RawGroup, 
  RawUser, 
  RawVerticalLink, 
  RawHorizontalLink 
} from './transformService';


/*
  NOTE:
  groupLinkService.deleteGroupLink(linkId, userId) à changer de signature
  pour inclure 'userId' pour la vérification d'auth, même si le backend
*/


/**
 * Récupère tous les liens d'un groupe donné et les groupes/utilisateurs liés.
 * GET /api/groups/<key>/links
 */
export async function fetchGroupLinks(groupId: string): Promise<{
  parentLinks: VerticalGroupLink[];
  childLinks: VerticalGroupLink[];
  partnerLinks: HorizontalGroupLink[];
  linkedGroups: Group[];
}> {
  try {
    const groupKey = groupId.split('/')[1];
    const response = await apiClient.get<{
      parentLinks: RawVerticalLink[];
      childLinks: RawVerticalLink[];
      partnerLinks: RawHorizontalLink[];
      linkedGroups: RawGroup[];
      users: RawUser[]; // Les créateurs des liens
    }>(`/groups/${groupKey}/links`);

    const parentLinks = response.data.parentLinks.map(transformVerticalLink);
    const childLinks = response.data.childLinks.map(transformVerticalLink);
    const partnerLinks = response.data.partnerLinks.map(transformHorizontalLink);
    const linkedGroups = response.data.linkedGroups.map(transformGroup);
    // Les 'users' sont aussi retournés, mais le type de retour ne les inclut pas.
    
    console.log(`📦 [API groupLinkService.fetchGroupLinks] Group ${groupId}: ${parentLinks.length} parents, ${childLinks.length} enfants, ${partnerLinks.length} partenaires`);
    return { parentLinks, childLinks, partnerLinks, linkedGroups };
    
  } catch (error) {
    console.error(`❌ [API groupLinkService.fetchGroupLinks] ${groupId}`, error);
    return { parentLinks: [], childLinks: [], partnerLinks: [], linkedGroups: [] };
  }
}

/**
 * Crée un lien vertical (parent → enfant).
 * POST /api/groups/links/vertical
 */
export async function createVerticalLink(
  parentGroupId: string,
  childGroupId: string,
  createdBy: string
): Promise<VerticalGroupLink> {
  try {
    const payload = { parentGroupId, childGroupId, createdBy };
    const response = await apiClient.post<RawVerticalLink>('/groups/links/vertical', payload);
    
    const newLink = transformVerticalLink(response.data);
    console.log(`✅ [API groupLinkService.createVerticalLink] Lien vertical créé: ${parentGroupId} → ${childGroupId}`);
    return newLink;
  } catch (error) {
    console.error(`❌ [API groupLinkService.createVerticalLink]`, error);
    throw error;
  }
}

/**
 * Crée un lien horizontal (partenaires).
 * POST /api/groups/links/horizontal
 */
export async function createHorizontalLink(
  groupId1: string,
  groupId2: string,
  createdBy: string
): Promise<HorizontalGroupLink> {
  try {
    const payload = { groupId1, groupId2, createdBy };
    const response = await apiClient.post<RawHorizontalLink>('/groups/links/horizontal', payload);
    
    const newLink = transformHorizontalLink(response.data);
    console.log(`✅ [API groupLinkService.createHorizontalLink] Lien horizontal créé: ${groupId1} ↔ ${groupId2}`);
    return newLink;
  } catch (error) {
    console.error(`❌ [API groupLinkService.createHorizontalLink]`, error);
    throw error;
  }
}

/**
 * Supprime un lien entre groupes.
 * DELETE /api/groups/links/<collection_name>/<link_key>
 */
export async function deleteGroupLink(
  linkId: string,
  userId: string // userId est pour la vérification d'auth, gérée par token
): Promise<boolean> {
  try {
    // Déterminer le type de lien pour choisir la collection
    const linkType = linkId.startsWith('group_hierarchy') ? 'vertical' : 'horizontal';
    console.log(`🗑️ [API groupLinkService.deleteGroupLink] Suppression du lien ${linkId} de type ${linkType} par utilisateur ${userId}`);

    const linkKey = linkId.split('/')[1]; // Assure qu'on n'envoie que la clé
    const collection_name = linkType === 'vertical' ? 'group_hierarchy' : 'group_partners';
    
    await apiClient.delete(`/groups/links/${collection_name}/${linkKey}`);
    
    console.log(`✅ [API groupLinkService.deleteGroupLink] Lien ${linkId} supprimé`);
    return true;
  } catch (error) {
    console.error(`❌ [API groupLinkService.deleteGroupLink] ${linkId}`, error);
    return false;
  }
}