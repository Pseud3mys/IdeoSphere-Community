// src/services/groupService.ts

import { 
  Group, 
  GroupMembership, 
  Idea, 
  Post, 
  PendingGroupCreation, 
  User 
} from '../types';
import apiClient from './apiClient';
import { 
  transformGroup, 
  transformPendingGroup, 
  transformUser, 
  transformFeedData,
  transformMembership,
  RawGroup, 
  RawPendingGroup, 
  RawUser, 
  RawFeedData,
  RawMembership
} from './transformService';


/*
  NOTE: Les fonctions 'updateGroup' et 'promoteToAnimator' 
  ont été omises car elles n'ont pas de route correspondante 
  dans le backend 'group_routes.py' fourni.
*/

/**
 * Interface de retour combinée
 */
export interface UserGroupsResult {
  groupsWithMemberships: {
    group: Group;
    membership: GroupMembership;
  }[];
  pendingGroups: Group[];
}

/**
 * Récupère les groupes d'un utilisateur avec leurs memberships
 * Adapte la réponse du backend pour correspondre à la structure UI demandée.
 * * @param userId - ID de l'utilisateur
 * @returns Groupes actifs avec leurs memberships et groupes pending
 */
export async function fetchMyGroups(userId: string): Promise<{
  groupsWithMemberships: Array<{ group: Group; membership: GroupMembership }>;
  pendingGroups: PendingGroupCreation[];
}> {
  try {
    // Extraction de la clé pour l'appel API (ex: "users/123" -> "123")
    const userKey = userId.includes('/') ? userId.split('/')[1] : userId;

    // Appel à la route existante (qui utilise maintenant le nouveau get_user_groups_normalized)
    const response = await apiClient.get<{ 
      activeGroups: Array<{ group: RawGroup, membership: RawMembership }>, 
      pendingGroups: RawPendingGroup[] 
    }>('/groups/my-groups', { params: { userId: userKey } });

    // 1. Transformation des Groupes Actifs + Memberships
    const groupsWithMemberships = response.data.activeGroups.map(item => {
      // Transformation sécurisée via le service dédié
      const group = transformGroup(item.group);
      const membership = transformMembership(item.membership);
      
      return { group, membership };
    });

    // 2. Transformation des Groupes Pending
    const pendingGroups = response.data.pendingGroups.map(transformPendingGroup);

    console.log(`📦 [groupService.fetchMyGroups] ${groupsWithMemberships.length} actifs, ${pendingGroups.length} pending pour ${userId}`);

    return {
      groupsWithMemberships,
      pendingGroups
    };

  } catch (error) {
    console.error(`❌ [groupService.fetchMyGroups] Erreur pour ${userId}`, error);
    // En cas d'erreur, on retourne des tableaux vides pour ne pas bloquer l'UI
    return {
      groupsWithMemberships: [],
      pendingGroups: []
    };
  }
}

/**
 * Récupère tous les groupes actifs et leurs animateurs.
 * GET /api/groups
 */
export async function fetchAllGroups(): Promise<{ groups: Group[], users: User[] }> {
  try {
    const response = await apiClient.get<{ groups: RawGroup[], users: RawUser[] }>('/groups');
    const groups = response.data.groups.map(transformGroup);
    const users = response.data.users.map(transformUser);
    
    // Attribuer les animateurs aux groupes (basé sur la réponse de get_all_groups_normalized)
    const animatorIdsByGroup = new Map<string, string[]>();
    users.forEach(user => {
      // Cette info n'est pas directement dans la réponse, on doit la déduire
      // ... En fait, la réponse 'users' contient TOUS les animateurs de TOUS les groupes.
      // Le frontend devra faire le lien via `group.animators` qui est dans le type Group
      // mais pas rempli par la DB.
      // Simplifions:
    });

    console.log(`📦 [API groupService.fetchAllGroups] ${groups.length} groupes chargés`);
    return { groups, users };
  } catch (error) {
    console.error("❌ [API groupService.fetchAllGroups]", error);
    return { groups: [], users: [] };
  }
}

/**
 * Récupère un groupe par son ID et la liste de ses membres.
 * GET /api/groups/<key>
 */
export async function fetchGroupById(groupId: string): Promise<{ group: Group | null, members: User[] }> {
  try {
    const groupKey = groupId.split('/')[1];
    const response = await apiClient.get<{ group: RawGroup, users: RawUser[] }>(`/groups/${groupKey}`);
    
    const group = transformGroup(response.data.group);
    const members = response.data.users.map(transformUser);
    
    console.log(`📦 [API groupService.fetchGroupById] Groupe ${groupId} avec ${members.length} membres`);
    return { group, members };
  } catch (error) {
    console.error(`❌ [API groupService.fetchGroupById] Groupe ${groupId}`, error);
    return { group: null, members: [] };
  }
}

/**
 * Récupère le feed d'un groupe (idées et posts).
 * GET /api/groups/<key>/feed
 */
export async function fetchGroupFeed(groupId: string, userId: string): Promise<{ ideas: Idea[], posts: Post[] }> {
  try {
    const groupKey = groupId.split('/')[1];
    // AJOUT: Extraire la clé de l'utilisateur
    const userKey = userId.split('/')[1];

    const response = await apiClient.get<RawFeedData>(
      `/groups/${groupKey}/feed`,
      { params: { userId: userKey } }
    );
    
    const { ideas, posts } = transformFeedData(response.data);
    
    console.log(`📦 [API groupService.fetchGroupFeed] Groupe ${groupId} pour User ${userId} : ${ideas.length} idées, ${posts.length} posts`);
    return { ideas, posts };

  } catch (error) {
    // MODIFIÉ: Log d'erreur amélioré pour le débogage
    console.error(`❌ [API groupService.fetchGroupFeed] Erreur pour Groupe ${groupId}, User ${userId}`, error);
    return { ideas: [], posts: [] };
  }
}

/**
 * Permet à un utilisateur de rejoindre un groupe.
 * POST /api/groups/<key>/join
 */
export async function joinGroup(userId: string, groupId: string): Promise<GroupMembership> {
  try {
    const groupKey = groupId.split('/')[1];
    // Le backend attend { userId } dans le corps (simulé, car auth gère)
    const response = await apiClient.post<RawMembership>(`/groups/${groupKey}/join`, { userId });
    
    const membership = transformMembership(response.data);
    
    console.log(`📦 [API groupService.joinGroup] ${userId} a rejoint le groupe ${groupId}`);
    return membership;
  } catch (error) {
    console.error(`❌ [API groupService.joinGroup] ${userId} / ${groupId}`, error);
    throw error;
  }
}

/**
 * Permet à un utilisateur de quitter un groupe.
 * POST /api/groups/<key>/leave
 */
export async function leaveGroup(userId: string, groupId: string): Promise<boolean> {
  try {
    const groupKey = groupId.split('/')[1];
    // Le backend attend { userId } dans le corps (simulé, car auth gère)
    await apiClient.post(`/groups/${groupKey}/leave`, { userId });
    
    console.log(`📦 [API groupService.leaveGroup] ${userId} a quitté le groupe ${groupId}`);
    return true;
  } catch (error) {
    console.error(`❌ [API groupService.leaveGroup] ${userId} / ${groupId}`, error);
    return false;
  }
}

/**
 * Récupère les adhésions (memberships) actives d'un utilisateur.
 * GET /api/users/<key>/memberships

export async function fetchUserGroupMemberships(userId: string): Promise<GroupMembership[]> {
  try {
    // Extrait la clé de l'ID (ex: "users/123" -> "123")
    const userKey = userId.split('/')[1];
    
    // Appelle la nouvelle route backend
    const response = await apiClient.get<RawMembership[]>(`/users/${userKey}/memberships`);
    
    // Transforme les données brutes en objets GroupMembership
    const memberships = response.data.map(transformMembership);
    
    console.log(`📦 [API groupService.fetchUserGroupMemberships] ${memberships.length} memberships actifs chargés pour ${userId}`);
    return memberships;
    
  } catch (error) {
    console.error(`❌ [API groupService.fetchUserGroupMemberships] ${userId}`, error);
    return [];
  }
}*/


/**
 * Crée un groupe en attente (pending) avec noyau initial.
 * POST /api/groups/pending
 */
export async function createPendingGroup(
  groupData: {
    name: string;
    description: string;
    shortDescription: string;
    type: Group['type'];
    avatar?: string;
    location?: string;
    tags: string[];
  },
  founderIds: string[],
  initiatorId: string,
  founderEmails: string[] = []
): Promise<PendingGroupCreation> {
  try {
    const payload = { ...groupData, founderIds, initiatorId };
    const response = await apiClient.post<RawPendingGroup>('/groups/pending', payload);
    
    const pendingGroup = transformPendingGroup(response.data);
    console.log(`📦 [API groupService.createPendingGroup] Groupe pending créé : ${pendingGroup.id}`);
    return pendingGroup;
  } catch (error) {
    console.error(`❌ [API groupService.createPendingGroup]`, error);
    throw error;
  }
}

/**
 * Confirme la participation d'un fondateur à un groupe pending.
 * POST /api/groups/pending/<key>/confirm
 */
export async function confirmGroupFounder(pendingId: string, userId: string): Promise<PendingGroupCreation> {
  try {
    const pendingKey = pendingId.split('/')[1];
    // Le backend attend { userId } dans le corps (simulé, car auth gère)
    const response = await apiClient.post<RawPendingGroup>(`/groups/pending/${pendingKey}/confirm`, { userId });
    
    const pendingGroup = transformPendingGroup(response.data);
    console.log(`📦 [API groupService.confirmGroupFounder] ${userId} a confirmé ${pendingId}`);
    return pendingGroup;
  } catch (error) {
    console.error(`❌ [API groupService.confirmGroupFounder] ${pendingId}`, error);
    throw error;
  }
}

/**
 * Récupère les détails d'un groupe pending.
 * GET /api/groups/pending/<key>
 */
export async function fetchPendingGroupDetails(pendingId: string): Promise<{
  pendingGroup: PendingGroupCreation | null;
  founders: User[];
}> {
  try {
    const pendingKey = pendingId.split('/')[1];
    const response = await apiClient.get<{ group: RawPendingGroup, users: RawUser[] }>(`/groups/pending/${pendingKey}`);
    
    const pendingGroup = transformPendingGroup(response.data.group);
    const founders = response.data.users.map(transformUser);
    
    console.log(`📦 [API groupService.fetchPendingGroupDetails] Groupe pending ${pendingId} avec ${founders.length} fondateurs`);
    return { pendingGroup, founders };
  } catch (error) {
    console.error(`❌ [API groupService.fetchPendingGroupDetails] ${pendingId}`, error);
    return { pendingGroup: null, founders: [] };
  }
}

/**
 * Recommande un contenu (idée ou post) dans un ou plusieurs groupes
 * Ajoute les groupes aux groupIds du contenu
 * @param contentId - ID du contenu (ex: ideas/12345)
 * @param groupIds - IDs des groupes dans lesquels recommander le contenu
 * @param userId - ID de l'utilisateur qui recommande (pour vérifications futures)
 * @returns true si succès, false sinon
 */
export async function recommendContentToGroups(
  contentId: string,
  contentType: 'idea' | 'post', //pas utile, les id sont complet
  groupIds: string[],
  userId: string
): Promise<boolean> {
  try {

    await apiClient.post(`/groups/recommend-content`, {
      contentId: contentId,
      groupIds: groupIds,
      userId
    });
    
    console.log(`📦 [API groupService.recommendContentToGroups] Contenu ${contentId} recommandé dans ${groupIds.length} groupes`);
    return true;
  } catch (error) {
    console.error(`❌ [API groupService.recommendContentToGroups] ${contentId}`, error);
    return false;
  }
}