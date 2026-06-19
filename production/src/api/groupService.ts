// src/services/groupService.ts

import { 
  Group, 
  GroupMembership, 
  Idea, 
  Post, 
  PendingGroupCreation, 
  User,
  Location
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
 * Récupère les groupes d'un utilisateur avec leurs memberships.
 * Appelle la route unifiée côté User.
 * GET /api/users/<key>/groups
 */
export async function fetchMyGroups(userId: string): Promise<{
  groupsWithMemberships: Array<{ group: Group; membership: GroupMembership }>;
  pendingGroups: PendingGroupCreation[];
}> {
  try {
    const userKey = userId.includes('/') ? userId.split('/')[1] : userId;

    // ✅ CHANGEMENT D'URL ICI : on tape sur la ressource 'users'
    const response = await apiClient.get<{ 
      activeGroups: Array<{ group: RawGroup, membership: RawMembership }>, 
      pendingGroups: RawPendingGroup[] 
    }>(`/users/${userKey}/my-groups`); // Renommé de 'memberships' à 'groups' pour clarté

    const groupsWithMemberships = response.data.activeGroups.map(item => ({
      group: transformGroup(item.group),
      membership: transformMembership(item.membership)
    }));

    const pendingGroups = response.data.pendingGroups.map(transformPendingGroup);

    console.log(`📦 [groupService] ${groupsWithMemberships.length} actifs, ${pendingGroups.length} pending chargés via User API`);

    return { groupsWithMemberships, pendingGroups };

  } catch (error) {
    console.error(`❌ [groupService] Erreur fetchMyGroups pour ${userId}`, error);
    return { groupsWithMemberships: [], pendingGroups: [] };
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
 * Récupère un groupe, ses membres et les memberships réels.
 * GET /api/groups/<key>
 */
export async function fetchGroupById(groupId: string): Promise<{ 
  group: Group | null; 
  members: User[];
  memberships: GroupMembership[];
}> {
  try {
    const groupKey = groupId.includes('/') ? groupId.split('/')[1] : groupId;
    
    // Le backend renvoie maintenant { group, users, memberships }
    const response = await apiClient.get<{ 
      group: RawGroup, 
      users: RawUser[],
      memberships: RawMembership[] 
    }>(`/groups/${groupKey}`);
    
    if (!response.data || !response.data.group) {
      console.warn(`⚠️ [API groupService] Groupe ${groupId} introuvable`);
      return { group: null, members: [], memberships: [] };
    }
    
    // Transformation simple et directe (Unifiée)
    const group = transformGroup(response.data.group);
    const members = response.data.users.map(transformUser);
    // On utilise les vraies données du backend (rôle, joinedAt exacts)
    const memberships = response.data.memberships.map(transformMembership);
    
    // Si le backend ne fournit pas memberCount, on le calcule localement
    if (group.memberCount === 0 && members.length > 0) {
      group.memberCount = members.length;
    }
    
    console.log(`📦 [API groupService] Groupe ${groupId} chargé: ${members.length} membres, ${memberships.length} adhésions`);
    
    return { group, members, memberships };

  } catch (error) {
    console.error(`❌ [API groupService] Erreur fetchGroupById ${groupId}`, error);
    return { group: null, members: [], memberships: [] };
  }
}

/**
 * Récupère les éléments "À la une" (Showcase) d'un groupe.
 * GET /api/groups/<key>/showcase
 */
export async function fetchGroupShowcase(groupId: string): Promise<(Idea | Post)[]> {
  try {
    const groupKey = groupId.split('/')[1];
    // On suppose que l'API renvoie un tableau mixte d'idées et de posts
    const response = await apiClient.get<RawFeedData>(`/groups/${groupKey}/showcase`);
    
    // On réutilise la transformation existante du feedService ou transformService
    const { ideas, posts } = transformFeedData(response.data);
    
    // On retourne un tableau combiné
    return [...ideas, ...posts];
  } catch (error) {
    console.error(`❌ [API groupService.fetchGroupShowcase] Erreur pour ${groupId}`, error);
    return [];
  }
}

/**
 * Récupère le feed d'un groupe (idées et posts).
 * GET /api/groups/<key>/feed
 */
export async function fetchGroupFeed(groupId: string, userId: string): Promise<{ ideas: Idea[], posts: Post[] }> {
  try {
    const groupKey = groupId.split('/')[1];
    const userKey = userId.includes('/') ? userId.split('/')[1] : userId;

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
    location: Location;
    tags: string[];
  },
  founderIds: string[],
  initiatorId: string,
  founderEmails: string[] = []
): Promise<PendingGroupCreation> {
  try {
    const payload = { ...groupData, founderIds, initiatorId, founderEmails };
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

/**
 * Met à jour les informations d'un groupe.
 * PATCH /api/groups/<key>
 */
export async function updateGroup(
  groupId: string,
  updates: Partial<Omit<Group, 'location'>> & { location?: Location | string },
  updatedBy: string
): Promise<Group | null> {
  try {
    const groupKey = groupId.split('/')[1];

    // On inclut 'updatedBy' dans le body pour la vérification côté serveur
    const payload = { ...updates, updatedBy };

    const response = await apiClient.patch<RawGroup>(`/groups/${groupKey}`, payload);
    
    const updatedGroup = transformGroup(response.data);
    
    // Note : Le backend ne renvoie pas forcément les animateurs dans l'objet RawGroup standard
    // mais le frontend risque d'en avoir besoin. Idéalement, on fusionne ou on recharge, 
    // mais ici on retourne le groupe mis à jour tel quel.
    console.log(`✅ [groupService] Groupe ${groupId} mis à jour par ${updatedBy}`);
    return updatedGroup;

  } catch (error) {
    console.error(`❌ [groupService.updateGroup] Erreur mise à jour ${groupId}`, error);
    // Gestion d'erreur spécifique (ex: 403 Forbidden)
    if ((error as any)?.response?.status === 403) {
      throw new Error("Vous devez être animateur pour modifier ce groupe (Refusé par le serveur)");
    }
    return null;
  }
}

/**
 * Promeut un membre en animateur.
 * POST /api/groups/<key>/members/<userKey>/promote
 */
export async function promoteToAnimator(
  groupId: string,
  userId: string,
  promotedBy: string
): Promise<GroupMembership | null> {
  try {
    const groupKey = groupId.split('/')[1];
    const userKey = userId.split('/')[1];

    const response = await apiClient.post<RawMembership>(
      `/groups/${groupKey}/members/${userKey}/promote`,
      { promotedBy }
    );

    const membership = transformMembership(response.data);
    console.log(`✅ [groupService] ${userId} promu animateur dans ${groupId}`);
    return membership;

  } catch (error) {
    console.error(`❌ [groupService.promoteToAnimator] Erreur pour ${userId}`, error);
    
    if ((error as any)?.response?.status === 403) {
      throw new Error("Vous devez être animateur pour effectuer cette promotion");
    }
    return null;
  }
}