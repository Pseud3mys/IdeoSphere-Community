/**
 * Service API pour la gestion des groupes
 * 
 * Phase 1 : Fonctions simples mockées pour les tests
 * Les vraies fonctions API seront implémentées lors du passage en production
 */

import { Group, GroupMembership, Idea, Post, PendingGroupCreation } from '../types';
import { groups, groupMemberships } from '../data/groups';
import { pendingGroups } from '../data/pendingGroups';
import { getMockIdeas } from '../data/ideas';
import { getMockPosts } from '../data/posts';
import { users } from '../data/users';

// Simulation de délai réseau
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 300));

/**
 * Récupère tous les groupes actifs
 */
export async function fetchAllGroups(): Promise<{ groups: Group[], users: typeof import('../data/users').users }> {
  await simulateNetworkDelay();
  
  // Récupérer tous les animateurs
  const animatorIds = new Set<string>();
  groups.forEach(g => g.animators.forEach(id => animatorIds.add(id)));
  const animators = users.filter(u => animatorIds.has(u.id));
  
  console.log(`📦 [groupService.fetchAllGroups] ${groups.length} groupes chargés`);
  return { groups: [...groups], users: animators };
}

/**
 * Récupère un groupe par son ID
 */
export async function fetchGroupById(groupId: string): Promise<{ 
  group: Group | null, 
  members: typeof import('../data/users').users 
}> {
  await simulateNetworkDelay();
  
  const group = groups.find(g => g.id === groupId) || null;
  
  if (!group) {
    console.log(`📦 [groupService.fetchGroupById] Groupe ${groupId} introuvable`);
    return { group: null, members: [] };
  }
  
  // Récupérer tous les membres du groupe
  const membershipIds = groupMemberships
    .filter(m => m.groupId === groupId && m.isActive)
    .map(m => m.userId);
  
  const members = users.filter(u => membershipIds.includes(u.id));
  
  console.log(`📦 [groupService.fetchGroupById] Groupe ${groupId} avec ${members.length} membres`);
  return { group, members };
}

/**
 * Récupère le feed d'un groupe (idées et posts)
 * Filtrage par groupId
 */
export async function fetchGroupFeed(groupId: string): Promise<{ ideas: Idea[], posts: Post[] }> {
  await simulateNetworkDelay();
  
  const ideas = getMockIdeas();
  const posts = getMockPosts();
  
  const groupIdeas = ideas.filter(i => i.groupId === groupId);
  const groupPosts = posts.filter(p => p.groupId === groupId);
  
  console.log(`📦 [groupService.fetchGroupFeed] Groupe ${groupId} : ${groupIdeas.length} idées, ${groupPosts.length} posts`);
  return { ideas: groupIdeas, posts: groupPosts };
}

/**
 * Permet à un utilisateur de rejoindre un groupe
 */
export async function joinGroup(userId: string, groupId: string): Promise<GroupMembership> {
  await simulateNetworkDelay();
  
  const membership: GroupMembership = {
    userId,
    groupId,
    role: 'member',
    joinedAt: new Date(),
    isActive: true,
  };
  
  // Ajouter au tableau (mutable pour les données mockées)
  groupMemberships.push(membership);
  
  // Incrémenter le compteur de membres
  const group = groups.find(g => g.id === groupId);
  if (group) {
    group.memberCount++;
  }
  
  console.log(`📦 [groupService.joinGroup] ${userId} a rejoint le groupe ${groupId}`);
  return membership;
}

/**
 * Permet à un utilisateur de quitter un groupe
 */
export async function leaveGroup(userId: string, groupId: string): Promise<boolean> {
  await simulateNetworkDelay();
  
  const membership = groupMemberships.find(
    m => m.userId === userId && m.groupId === groupId && m.isActive
  );
  
  if (!membership) {
    console.log(`📦 [groupService.leaveGroup] Aucun membership actif trouvé`);
    return false;
  }
  
  // Marquer comme inactif
  membership.isActive = false;
  
  // Décrémenter le compteur de membres
  const group = groups.find(g => g.id === groupId);
  if (group && group.memberCount > 0) {
    group.memberCount--;
  }
  
  console.log(`📦 [groupService.leaveGroup] ${userId} a quitté le groupe ${groupId}`);
  return true;
}

/**
 * Récupère les memberships d'un utilisateur
 */
export async function fetchUserGroupMemberships(userId: string): Promise<GroupMembership[]> {
  await simulateNetworkDelay();
  
  const memberships = groupMemberships.filter(m => m.userId === userId && m.isActive);
  
  console.log(`📦 [groupService.fetchUserGroupMemberships] ${memberships.length} memberships pour ${userId}`);
  return memberships;
}

// ========================================
// PHASE 2 : Création de groupes avec Noyau Initial
// ========================================

/**
 * Crée un groupe en attente (pending) avec noyau initial
 * @param groupData - Données du groupe (nom, description, type, tags, etc.)
 * @param founderIds - IDs des fondateurs
 * @param initiatorId - ID de l'utilisateur qui initie la création
 * @param founderEmails - Emails de fondateurs (optionnel, sera vérifié côté backend)
 * @returns Le PendingGroupCreation créé
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
  await simulateNetworkDelay();
  
  // Validation : minimum 2 fondateurs (IDs + emails combinés)
  const totalFounders = founderIds.length + founderEmails.length;
  if (totalFounders < 2) {
    throw new Error('Un groupe nécessite au moins 2 co-fondateurs');
  }
  
  // Mock: Dans un vrai backend, on vérifierait que les emails correspondent à des utilisateurs
  // et on convertirait les emails en IDs
  console.log(`📧 [Backend Mock] Vérification de ${founderEmails.length} emails...`);
  
  // Pour la démo, on ajoute l'initiateur + les IDs fournis aux fondateurs
  const allFounderIds = [initiatorId, ...founderIds.filter(id => id !== initiatorId)];
  
  // Créer l'ID
  const pendingId = `pg${Date.now()}`;
  
  // Créer le groupe pending
  const pendingGroup: PendingGroupCreation = {
    id: pendingId,
    name: groupData.name,
    description: groupData.description,
    shortDescription: groupData.shortDescription,
    type: groupData.type,
    avatar: groupData.avatar,
    location: groupData.location,
    tags: groupData.tags,
    founders: allFounderIds, // Les IDs vérifiés
    confirmations: [initiatorId], // L'initiateur confirme automatiquement
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
    initiatorId,
  };
  
  // Ajouter au tableau mocké (mutable)
  pendingGroups.push(pendingGroup);
  
  console.log(`📦 [groupService.createPendingGroup] Groupe pending créé : ${pendingId} avec ${allFounderIds.length} fondateurs (${founderIds.length} IDs + ${founderEmails.length} emails)`);
  console.log(`   📧 [Backend Mock] Emails envoyés aux ${allFounderIds.length - 1} invités + ${founderEmails.length} emails pour vérification`);
  
  return pendingGroup;
}

/**
 * Confirme la participation d'un fondateur à un groupe pending
 * @param pendingId - ID du groupe pending
 * @param userId - ID de l'utilisateur qui confirme
 * @returns Le PendingGroupCreation mis à jour
 */
export async function confirmGroupFounder(pendingId: string, userId: string): Promise<PendingGroupCreation> {
  await simulateNetworkDelay();
  
  const pendingGroup = pendingGroups.find(pg => pg.id === pendingId);
  
  if (!pendingGroup) {
    throw new Error(`Groupe pending ${pendingId} introuvable`);
  }
  
  // Vérifier que l'utilisateur est bien un fondateur
  if (!pendingGroup.founders.includes(userId)) {
    throw new Error(`L'utilisateur ${userId} n'est pas un fondateur de ce groupe`);
  }
  
  // Vérifier si déjà confirmé
  if (pendingGroup.confirmations.includes(userId)) {
    console.log(`📦 [groupService.confirmGroupFounder] ${userId} avait déjà confirmé`);
    return pendingGroup;
  }
  
  // Ajouter la confirmation
  pendingGroup.confirmations.push(userId);
  
  console.log(`📦 [groupService.confirmGroupFounder] ${userId} a confirmé. ${pendingGroup.confirmations.length}/${pendingGroup.founders.length} confirmations`);
  
  // Si tous les fondateurs ont confirmé, activer le groupe automatiquement
  if (pendingGroup.confirmations.length === pendingGroup.founders.length) {
    console.log(`✅ [groupService.confirmGroupFounder] Tous les fondateurs ont confirmé - Activation automatique`);
    await activatePendingGroup(pendingId);
  }
  
  return pendingGroup;
}

/**
 * Active un groupe pending (tous les fondateurs ont confirmé)
 * @param pendingId - ID du groupe pending à activer
 * @returns Le Group activé
 */
async function activatePendingGroup(pendingId: string): Promise<Group> {
  const pendingGroup = pendingGroups.find(pg => pg.id === pendingId);
  
  if (!pendingGroup) {
    throw new Error(`Groupe pending ${pendingId} introuvable`);
  }
  
  // Créer le groupe actif
  const newGroupId = `g${Date.now()}`;
  const newGroup: Group = {
    id: newGroupId,
    name: pendingGroup.name,
    description: pendingGroup.description,
    shortDescription: pendingGroup.shortDescription,
    type: pendingGroup.type,
    avatar: pendingGroup.avatar,
    location: pendingGroup.location,
    tags: pendingGroup.tags,
    memberCount: pendingGroup.founders.length,
    ideaCount: 0,
    projectCount: 0,
    createdAt: new Date(),
    createdBy: pendingGroup.founders,
    animators: pendingGroup.founders, // Tous les fondateurs deviennent animateurs
    isActive: true,
  };
  
  // Ajouter le groupe
  groups.push(newGroup);
  
  // Créer les memberships pour tous les fondateurs (tous animateurs)
  pendingGroup.founders.forEach(founderId => {
    const membership: GroupMembership = {
      userId: founderId,
      groupId: newGroupId,
      role: 'animator',
      joinedAt: new Date(),
      isActive: true,
    };
    groupMemberships.push(membership);
  });
  
  // Retirer le groupe pending
  const index = pendingGroups.findIndex(pg => pg.id === pendingId);
  if (index !== -1) {
    pendingGroups.splice(index, 1);
  }
  
  console.log(`✅ [groupService.activatePendingGroup] Groupe ${newGroupId} activé avec ${pendingGroup.founders.length} animateurs`);
  console.log(`   📧 [Backend Mock] Emails de confirmation envoyés à tous les fondateurs`);
  
  return newGroup;
}

/**
 * Récupère les groupes d'un utilisateur (actifs + pending)
 * @param userId - ID de l'utilisateur
 * @returns Groupes actifs et pending de l'utilisateur
 */
export async function fetchMyGroups(userId: string): Promise<{
  activeGroups: Group[];
  pendingGroups: PendingGroupCreation[];
}> {
  await simulateNetworkDelay();
  
  // Groupes actifs où l'utilisateur est membre
  const userMemberships = groupMemberships.filter(m => m.userId === userId && m.isActive);
  const activeGroupIds = userMemberships.map(m => m.groupId);
  const activeGroups = groups.filter(g => activeGroupIds.includes(g.id));
  
  // Groupes pending où l'utilisateur est fondateur
  const userPendingGroups = pendingGroups.filter(pg => pg.founders.includes(userId));
  
  return {
    activeGroups,
    pendingGroups: userPendingGroups,
  };
}

/**
 * Récupère les détails d'un groupe pending
 * @param pendingId - ID du groupe pending
 * @returns Le PendingGroupCreation et les users fondateurs
 */
export async function fetchPendingGroupDetails(pendingId: string): Promise<{
  pendingGroup: PendingGroupCreation | null;
  founders: typeof import('../data/users').users;
}> {
  await simulateNetworkDelay();
  
  const pendingGroup = pendingGroups.find(pg => pg.id === pendingId) || null;
  
  if (!pendingGroup) {
    console.log(`📦 [groupService.fetchPendingGroupDetails] Groupe pending ${pendingId} introuvable`);
    return { pendingGroup: null, founders: [] };
  }
  
  // Récupérer les users fondateurs
  const founders = users.filter(u => pendingGroup.founders.includes(u.id));
  
  console.log(`📦 [groupService.fetchPendingGroupDetails] Groupe pending ${pendingId} avec ${founders.length} fondateurs`);
  return { pendingGroup, founders };
}

// ========================================
// PHASE 3 : Gestion des groupes
// ========================================

/**
 * Met à jour les informations d'un groupe
 * @param groupId - ID du groupe à mettre à jour
 * @param updates - Champs à mettre à jour
 * @param updatedBy - ID de l'utilisateur qui effectue la mise à jour (doit être animateur)
 * @returns Le groupe mis à jour
 */
export async function updateGroup(
  groupId: string,
  updates: Partial<Pick<Group, 'name' | 'description' | 'shortDescription' | 'type' | 'avatar' | 'banner' | 'location' | 'tags'>>,
  updatedBy: string
): Promise<Group | null> {
  await simulateNetworkDelay();
  
  const group = groups.find(g => g.id === groupId);
  
  if (!group) {
    console.error(`❌ [groupService.updateGroup] Groupe ${groupId} introuvable`);
    return null;
  }
  
  // Vérifier que l'utilisateur est animateur
  if (!group.animators.includes(updatedBy)) {
    console.error(`❌ [groupService.updateGroup] Utilisateur ${updatedBy} n'est pas animateur du groupe ${groupId}`);
    throw new Error('Vous devez être animateur pour modifier ce groupe');
  }
  
  // Appliquer les mises à jour
  Object.assign(group, updates);
  
  console.log(`✅ [groupService.updateGroup] Groupe ${groupId} mis à jour par ${updatedBy}`);
  return group;
}

/**
 * Promeut un membre en animateur
 * @param groupId - ID du groupe
 * @param userId - ID de l'utilisateur à promouvoir
 * @param promotedBy - ID de l'animateur qui effectue la promotion
 * @returns Le membership mis à jour
 */
export async function promoteToAnimator(
  groupId: string,
  userId: string,
  promotedBy: string
): Promise<GroupMembership | null> {
  await simulateNetworkDelay();
  
  const group = groups.find(g => g.id === groupId);
  
  if (!group) {
    console.error(`❌ [groupService.promoteToAnimator] Groupe ${groupId} introuvable`);
    return null;
  }
  
  // Vérifier que promotedBy est animateur
  if (!group.animators.includes(promotedBy)) {
    console.error(`❌ [groupService.promoteToAnimator] Utilisateur ${promotedBy} n'est pas animateur du groupe ${groupId}`);
    throw new Error('Vous devez être animateur pour promouvoir un membre');
  }
  
  // Trouver le membership
  const membership = groupMemberships.find(m => m.userId === userId && m.groupId === groupId);
  
  if (!membership) {
    console.error(`❌ [groupService.promoteToAnimator] Membership introuvable pour ${userId} dans ${groupId}`);
    return null;
  }
  
  // Si déjà animateur, ne rien faire
  if (membership.role === 'animator') {
    console.warn(`⚠️ [groupService.promoteToAnimator] ${userId} est déjà animateur du groupe ${groupId}`);
    return membership;
  }
  
  // Promouvoir le membre
  membership.role = 'animator';
  
  // Ajouter à la liste des animateurs du groupe
  if (!group.animators.includes(userId)) {
    group.animators.push(userId);
  }
  
  console.log(`✅ [groupService.promoteToAnimator] ${userId} promu animateur du groupe ${groupId} par ${promotedBy}`);
  return membership;
}
