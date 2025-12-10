/**
 * Hook pour les actions liées aux groupes
 * 
 * Pattern IdeoSphere : Composants → Hooks → Services API → Data → Store
 * 
 * Phase 1 : Actions de base (load, join, leave)
 * Phase 2 : Création avec Noyau Initial (createPending, confirm, fetchMy)
 */

import { useEntityStoreSimple } from './useEntityStoreSimple';
import * as groupService from '../api/groupService';
import { Group, Location } from '../types';

export function useGroupActions() {
  const { actions, currentUser, getIdeaById, getPostById } = useEntityStoreSimple();

  /**
   * Charge tous les groupes actifs
   */
  const loadAllGroups = async () => {
    try {
      const { groups, users } = await groupService.fetchAllGroups();
      
      // Ajouter les groupes au store
      groups.forEach(group => actions.addGroup(group));
      
      // Ajouter les animateurs au store (si pas déjà présents)
      users.forEach(user => actions.addUser(user));
      
      console.log(`✅ [useGroupActions.loadAllGroups] ${groups.length} groupes chargés`);
    } catch (error) {
      console.error('❌ [useGroupActions.loadAllGroups] Erreur:', error);
      throw error;
    }
  };

  /**
   * Charge les détails d'un groupe et ses membres
   */
  const loadGroupDetails = async (groupId: string) => {
    try {
      const { group, members, memberships } = await groupService.fetchGroupById(groupId);
      
      if (!group) {
        console.warn(`⚠️ [useGroupActions.loadGroupDetails] Groupe ${groupId} introuvable`);
        return;
      }
      
      // Ajouter le groupe au store
      actions.addGroup(group);
      
      // Ajouter les membres au store
      members.forEach(user => actions.addUser(user));
      
      // ✅ Ajouter les memberships au store
      memberships.forEach(membership => actions.addGroupMembership(membership));
      
      console.log(`✅ [useGroupActions.loadGroupDetails] Groupe ${groupId} avec ${members.length} membres et ${memberships.length} memberships chargés`);
    } catch (error) {
      console.error(`❌ [useGroupActions.loadGroupDetails] Erreur pour ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * Charge le feed d'un groupe (idées et posts)
   * NOTE TEMPORAIRE: Protection désactivée, on vérifie seulement isRegistered
   */
  const loadGroupFeed = async (groupId: string) => {
    if (!currentUser || !currentUser.isRegistered) {
      console.warn('⚠️ [useGroupActions.loadGroupFeed] Utilisateur non enregistré - skip');
      return;
    }

    try {
      const { ideas, posts } = await groupService.fetchGroupFeed(groupId, currentUser.id);
      
      // Ajouter les idées au store
      ideas.forEach(idea => actions.addIdea(idea));
      
      // Ajouter les posts au store
      posts.forEach(post => actions.addPost(post));
      
      console.log(`✅ [useGroupActions.loadGroupFeed] Feed du groupe ${groupId} pour utilisateur ${currentUser.id} : ${ideas.length} idées, ${posts.length} posts`);
    } catch (error) {
      console.error(`❌ [useGroupActions.loadGroupFeed] Erreur pour ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * Permet à l'utilisateur courant de rejoindre un groupe
   * NOTE TEMPORAIRE: Protection désactivée, on vérifie seulement isRegistered
   */
  const joinGroup = async (groupId: string) => {
    if (!currentUser || !currentUser.isRegistered) {
      console.error('❌ [useGroupActions.joinGroup] Utilisateur non enregistré');
      throw new Error('Utilisateur non enregistré');
    }

    try {
      const membership = await groupService.joinGroup(currentUser.id, groupId);
      
      // Ajouter le membership au store
      actions.addGroupMembership(membership);
      
      console.log(`✅ [useGroupActions.joinGroup] Utilisateur ${currentUser.id} a rejoint ${groupId}`);
      return membership;
    } catch (error) {
      console.error(`❌ [useGroupActions.joinGroup] Erreur:`, error);
      throw error;
    }
  };

  /**
   * Permet à l'utilisateur courant de quitter un groupe
   * NOTE TEMPORAIRE: Protection désactivée, on vérifie seulement isRegistered
   */
  const leaveGroup = async (groupId: string) => {
    if (!currentUser || !currentUser.isRegistered) {
      console.error('❌ [useGroupActions.leaveGroup] Utilisateur non enregistré');
      throw new Error('Utilisateur non enregistré');
    }

    try {
      const success = await groupService.leaveGroup(currentUser.id, groupId);
      
      if (success) {
        // Mettre à jour le membership dans le store (marquer comme inactif)
        actions.updateGroupMembership(currentUser.id, groupId, { isActive: false });
        
        console.log(`✅ [useGroupActions.leaveGroup] Utilisateur ${currentUser.id} a quitté ${groupId}`);
      }
      
      return success;
    } catch (error) {
      console.error(`❌ [useGroupActions.leaveGroup] Erreur:`, error);
      throw error;
    }
  };

  /**
   * Charge les memberships de l'utilisateur
   * ⚠️ DEPRECATED: Utiliser loadMyGroups à la place
   * Cette fonction charge maintenant groupes + memberships via fetchMyGroups
   */
  const loadMyMemberships = async () => {
    if (!currentUser || !currentUser.isRegistered) {
      console.warn('⚠️ [useGroupActions.loadMyMemberships] Utilisateur non enregistré - skip');
      return;
    }

    try {
      const { groupsWithMemberships } = await groupService.fetchMyGroups(currentUser.id);
      
      // Ajouter les groupes et memberships au store
      groupsWithMemberships.forEach(({ group, membership }) => {
        actions.addGroup(group);
        actions.addGroupMembership(membership);
      });
      
      console.log(`✅ [useGroupActions.loadMyMemberships] ${groupsWithMemberships.length} groupes et memberships chargés`);
    } catch (error) {
      console.error('❌ [useGroupActions.loadMyMemberships] Erreur:', error);
      throw error;
    }
  };

  // ========================================
  // PHASE 2 : Création de groupes avec Noyau Initial
  // ========================================

  /**
   * Crée un groupe en attente avec noyau initial
   * NOTE TEMPORAIRE: Protection désactivée, on vérifie seulement isRegistered
   */
  const createPendingGroup = async (
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
    founderEmails: string[] = []
  ) => {
    if (!currentUser || !currentUser.isRegistered) {
      console.error('❌ [useGroupActions.createPendingGroup] Utilisateur non enregistré');
      throw new Error('Utilisateur non enregistré');
    }

    try {
      const pendingGroup = await groupService.createPendingGroup(groupData, founderIds, currentUser.id, founderEmails);
      
      // Ajouter le groupe pending au store
      actions.addPendingGroupCreation(pendingGroup);
      
      console.log(`✅ [useGroupActions.createPendingGroup] Groupe pending ${pendingGroup.id} créé avec ${founderIds.length} IDs et ${founderEmails.length} emails`);
      
      return pendingGroup;
    } catch (error) {
      console.error('❌ [useGroupActions.createPendingGroup] Erreur:', error);
      throw error;
    }
  };

  /**
   * Confirme la participation d'un fondateur à un groupe pending
   * NOTE TEMPORAIRE: Protection désactivée, on vérifie seulement isRegistered
   */
  const confirmGroupFounder = async (pendingId: string) => {
    if (!currentUser || !currentUser.isRegistered) {
      console.error('❌ [useGroupActions.confirmGroupFounder] Utilisateur non enregistré');
      throw new Error('Utilisateur non enregistré');
    }

    try {
      const pendingGroup = await groupService.confirmGroupFounder(pendingId, currentUser.id);
      
      // Mettre à jour le groupe pending dans le store
      actions.updatePendingGroupCreation(pendingId, pendingGroup);
      
      console.log(`✅ [useGroupActions.confirmGroupFounder] Confirmation ajoutée pour ${pendingId}`);
      return pendingGroup;
    } catch (error) {
      console.error('❌ [useGroupActions.confirmGroupFounder] Erreur:', error);
      throw error;
    }
  };

  /**
   * Charge les groupes de l'utilisateur (actifs + pending)
   * NOTE TEMPORAIRE: Protection désactivée, on vérifie seulement isRegistered
   */
  const loadMyGroups = async () => {
    if (!currentUser || !currentUser.isRegistered) {
      console.warn('⚠️ [useGroupActions.loadMyGroups] Utilisateur non enregistré - skip');
      return;
    }
    
    try {
      const { groupsWithMemberships, pendingGroups } = await groupService.fetchMyGroups(currentUser.id);
      
      // Ajouter les groupes actifs et memberships au store
      groupsWithMemberships.forEach(({ group, membership }) => {
        actions.addGroup(group);
        actions.addGroupMembership(membership);
      });
      
      // Ajouter les groupes pending au store
      pendingGroups.forEach(pg => actions.addPendingGroupCreation(pg));
      
      console.log(`✅ [useGroupActions.loadMyGroups] ${groupsWithMemberships.length} actifs, ${pendingGroups.length} pending`);
      
      return { activeGroups: groupsWithMemberships.map(({ group }) => group), pendingGroups };
    } catch (error) {
      console.error('❌ [useGroupActions.loadMyGroups] Erreur:', error);
      throw error;
    }
  };

  /**
   * Charge les détails d'un groupe pending
   */
  const loadPendingGroupDetails = async (pendingId: string) => {
    try {
      const { pendingGroup, founders } = await groupService.fetchPendingGroupDetails(pendingId);
      
      if (!pendingGroup) {
        console.warn(`⚠️ [useGroupActions.loadPendingGroupDetails] Groupe pending ${pendingId} introuvable`);
        return;
      }
      
      // Ajouter le groupe pending au store
      actions.addPendingGroupCreation(pendingGroup);
      
      // Ajouter les fondateurs au store
      founders.forEach(user => actions.addUser(user));
      
      console.log(`✅ [useGroupActions.loadPendingGroupDetails] Groupe pending ${pendingId} et ${founders.length} fondateurs chargés`);
      
      return { pendingGroup, founders };
    } catch (error) {
      console.error(`❌ [useGroupActions.loadPendingGroupDetails] Erreur pour ${pendingId}:`, error);
      throw error;
    }
  };

  // ========================================
  // PHASE 3 : Gestion de groupes
  // ========================================

  /**
   * Met à jour les informations d'un groupe
   * NOTE TEMPORAIRE: Protection désactivée, on vérifie seulement isRegistered
   */
  const updateGroupInfo = async (
    groupId: string,
    updates: Partial<{ name: string; description: string; shortDescription: string; type: Group['type']; avatar?: string; banner?: string; location?: Location | string; tags: string[] }>
  ) => {
    if (!currentUser || !currentUser.isRegistered) {
      console.error('❌ [useGroupActions.updateGroupInfo] Utilisateur non enregistré');
      throw new Error('Utilisateur non enregistré');
    }

    try {
      const updatedGroup = await groupService.updateGroup(groupId, updates, currentUser.id);
      
      if (updatedGroup) {
        // Mettre à jour le groupe dans le store
        actions.updateGroup(groupId, updatedGroup);
        
        console.log(`✅ [useGroupActions.updateGroupInfo] Groupe ${groupId} mis à jour`);
        return updatedGroup;
      }
      
      return null;
    } catch (error) {
      console.error('❌ [useGroupActions.updateGroupInfo] Erreur:', error);
      throw error;
    }
  };

  /**
   * Promeut un membre en animateur
   * NOTE TEMPORAIRE: Protection désactivée, on vérifie seulement isRegistered
   */
  const promoteToAnimator = async (groupId: string, userId: string) => {
    if (!currentUser || !currentUser.isRegistered) {
      console.error('❌ [useGroupActions.promoteToAnimator] Utilisateur non enregistré');
      throw new Error('Utilisateur non enregistré');
    }

    try {
      const updatedMembership = await groupService.promoteToAnimator(groupId, userId, currentUser.id);
      
      if (updatedMembership) {
        // Mettre à jour le membership dans le store
        actions.updateGroupMembership(userId, groupId, { role: 'animator' });
        
        console.log(`✅ [useGroupActions.promoteToAnimator] ${userId} promu animateur du groupe ${groupId}`);
        return updatedMembership;
      }
      
      return null;
    } catch (error) {
      console.error('❌ [useGroupActions.promoteToAnimator] Erreur:', error);
      throw error;
    }
  };

  /**
   * Recommande un contenu (idée ou post) dans un ou plusieurs groupes
   * Ajoute les groupes aux groupIds du contenu
   */
  const recommendContentToGroups = async (
    contentId: string,
    contentType: 'idea' | 'post',
    groupIds: string[]
  ) => {
    if (!currentUser || !currentUser.isRegistered) {
      console.error('❌ [useGroupActions.recommendContentToGroups] Utilisateur non enregistré');
      throw new Error('Utilisateur non enregistré');
    }

    console.log('🎯 [useGroupActions.recommendContentToGroups] Appel avec:', {
      contentId,
      contentType,
      groupIds,
      groupIdsType: typeof groupIds,
      isArray: Array.isArray(groupIds),
      userId: currentUser.id
    });

    try {
      // Appeler le service API qui contient toute la logique
      const success = await groupService.recommendContentToGroups(
        contentId,
        contentType,
        groupIds,
        currentUser.id
      );
      
      if (success) {
        // Recharger le contenu mis à jour depuis l'API pour mettre à jour le store
        if (contentType === 'idea') {
          const idea = getIdeaById(contentId);
          if (idea) {
            actions.updateIdea(contentId, { groupIds: idea.groupIds });
          }
        } else {
          const post = getPostById(contentId);
          if (post) {
            actions.updatePost(contentId, { groupIds: post.groupIds });
          }
        }
        
        console.log(`✅ [useGroupActions.recommendContentToGroups] ${contentType} ${contentId} recommandé dans ${groupIds.length} groupes`);
      }
      
      return success;
    } catch (error) {
      console.error('❌ [useGroupActions.recommendContentToGroups] Erreur:', error);
      throw error;
    }
  };

  return {
    // Phase 1
    loadAllGroups,
    loadGroupDetails,
    loadGroupFeed,
    joinGroup,
    leaveGroup,
    loadMyMemberships,
    
    // Phase 2
    createPendingGroup,
    confirmGroupFounder,
    loadMyGroups,
    loadPendingGroupDetails,
    
    // Phase 3
    updateGroupInfo,
    promoteToAnimator,
    recommendContentToGroups,
  };
}