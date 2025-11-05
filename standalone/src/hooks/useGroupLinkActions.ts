/**
 * useGroupLinkActions.ts
 * 
 * Hook spécialisé pour les actions sur les liens entre groupes (Phase 4)
 * 
 * Fonctionnalités :
 * - Charger les liens d'un groupe
 * - Créer des liens verticaux et horizontaux
 * - Supprimer des liens
 * 
 * Pattern : Hook → Service API → Store
 */

import { useEntityStoreSimple } from './useEntityStoreSimple';
import * as groupLinkService from '../api/groupLinkService';
import { toast } from 'sonner@2.0.3';

export function useGroupLinkActions() {
  const { actions, getCurrentUser } = useEntityStoreSimple();

  return {
    /**
     * Charge tous les liens d'un groupe
     */
    loadGroupLinks: async (groupId: string) => {
      try {
        const { parentLinks, childLinks, partnerLinks, linkedGroups } = 
          await groupLinkService.fetchGroupLinks(groupId);
        
        // Ajouter tous les liens au store
        [...parentLinks, ...childLinks, ...partnerLinks].forEach((link) => {
          actions.addGroupLink(link);
        });
        
        // Ajouter les groupes liés au store s'ils ne sont pas déjà présents
        linkedGroups.forEach((group) => {
          actions.addGroup(group);
        });
        
        console.log(
          `✅ [useGroupLinkActions.loadGroupLinks] ${parentLinks.length + childLinks.length + partnerLinks.length} liens chargés pour groupe ${groupId}`
        );
        
        return { parentLinks, childLinks, partnerLinks };
      } catch (error) {
        console.error('❌ [useGroupLinkActions.loadGroupLinks]', error);
        toast.error('Erreur lors du chargement des liens');
        return { parentLinks: [], childLinks: [], partnerLinks: [] };
      }
    },

    /**
     * Charge tous les liens du système
     */
    loadAllGroupLinks: async () => {
      try {
        const links = await groupLinkService.fetchAllGroupLinks();
        
        links.forEach((link) => {
          actions.addGroupLink(link);
        });
        
        console.log(`✅ [useGroupLinkActions.loadAllGroupLinks] ${links.length} liens chargés`);
        return links;
      } catch (error) {
        console.error('❌ [useGroupLinkActions.loadAllGroupLinks]', error);
        return [];
      }
    },

    /**
     * Crée un lien vertical (parent → enfant)
     */
    createVerticalLink: async (parentGroupId: string, childGroupId: string) => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          toast.error('Vous devez être connecté pour créer un lien');
          return null;
        }

        const newLink = await groupLinkService.createVerticalLink(
          parentGroupId,
          childGroupId,
          currentUser.id
        );
        
        actions.addGroupLink(newLink);
        
        console.log(
          `✅ [useGroupLinkActions.createVerticalLink] Lien vertical créé: ${parentGroupId} → ${childGroupId}`
        );
        
        toast.success('Lien hiérarchique créé avec succès');
        return newLink;
      } catch (error) {
        console.error('❌ [useGroupLinkActions.createVerticalLink]', error);
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la création du lien');
        return null;
      }
    },

    /**
     * Crée un lien horizontal (partenaires)
     */
    createHorizontalLink: async (groupId1: string, groupId2: string) => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          toast.error('Vous devez être connecté pour créer un lien');
          return null;
        }

        const newLink = await groupLinkService.createHorizontalLink(
          groupId1,
          groupId2,
          currentUser.id
        );
        
        actions.addGroupLink(newLink);
        
        console.log(
          `✅ [useGroupLinkActions.createHorizontalLink] Lien horizontal créé: ${groupId1} ↔ ${groupId2}`
        );
        
        toast.success('Partenariat créé avec succès');
        return newLink;
      } catch (error) {
        console.error('❌ [useGroupLinkActions.createHorizontalLink]', error);
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la création du lien');
        return null;
      }
    },

    /**
     * Supprime un lien entre groupes
     */
    deleteGroupLink: async (linkId: string) => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          toast.error('Vous devez être connecté pour supprimer un lien');
          return false;
        }

        const success = await groupLinkService.deleteGroupLink(linkId, currentUser.id);
        
        if (success) {
          actions.removeGroupLink(linkId);
          
          console.log(`✅ [useGroupLinkActions.deleteGroupLink] Lien ${linkId} supprimé`);
          toast.success('Lien supprimé avec succès');
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('❌ [useGroupLinkActions.deleteGroupLink]', error);
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression du lien');
        return false;
      }
    },
  };
}
