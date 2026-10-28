// src/api/adminService.ts
import apiClient from './apiClient';
import { createUnfinalizedAccountOnApi } from './authService';
import { createPostOnApi } from './contentService';
import { Group, Location } from '../types';
import { RawGroup, transformGroup } from './transformService';

/**
 * Type pour le contenu signalé
 */
export interface ReportedContent {
  contentType: 'ideas' | 'posts';
  contentId: string;
  content: any;
  reportCount: number;
  firstReportedAt: string;
}

/**
 * Modération automatique (Mistral) : un dossier par contenu signalé ou retiré
 */
export type ModerationView = 'pending' | 'removed' | 'history';
export type ModerationAction = 'remove' | 'dismiss' | 'confirm' | 'restore';
export type ModerationStatus = 'flagged' | 'removed' | 'confirmed' | 'restored' | 'dismissed';

export interface ModerationReason {
  category: string;
  label: string;
  score?: number;
}

export interface ModerationRecord {
  key: string;
  status: ModerationStatus;
  contentType: 'ideas' | 'posts' | 'comment';
  contentId: string;          // pour un commentaire : le post parent
  commentId: string | null;
  title: string | null;
  text: string;
  online: boolean;            // le contenu est-il visible sur le site ?
  authors: { id: string; name: string }[];
  decidedBy: string | null;   // "mistral" ou "admin:..."
  createdAt: string;
  reasons: ModerationReason[];
  categoryScores: Record<string, number>;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  restoreReport: { restoredEdges: number; skippedEdges: { collection: string; key: string; reason: string }[] } | null;
  history: { action: string; from: ModerationStatus | null; by: string; at: string; note: string | null }[];
}

let banReasonsCache: ModerationReason[] | null = null;

/**
 * Motifs proposés pour un bannissement manuel
 * GET /api/admin/moderation/reasons
 */
export async function fetchBanReasons(): Promise<ModerationReason[]> {
  if (banReasonsCache) return banReasonsCache;
  try {
    const response = await apiClient.get('/admin/moderation/reasons');
    banReasonsCache = response.data;
    return response.data;
  } catch (error) {
    console.error(`❌ [Admin API] Erreur lors de la récupération des motifs de bannissement:`, error);
    return [];
  }
}

/**
 * Bannit à la main un contenu vu sur le site (retiré et archivé, restaurable)
 * POST /api/admin/moderation/ban
 */
export async function banContent(
  contentId: string,
  category: string,
  options: { commentId?: string; note?: string } = {}
): Promise<{ success: boolean; data?: ModerationRecord; error?: string }> {
  try {
    const response = await apiClient.post('/admin/moderation/ban', {
      contentId,
      category,
      commentId: options.commentId,
      note: options.note || undefined,
    });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error(`❌ [Admin API] Erreur lors du bannissement de ${contentId}:`, error);
    return { success: false, error: error.response?.data?.message };
  }
}

/**
 * Liste les dossiers de modération d'une vue
 * GET /api/admin/moderation?view=pending|removed|history
 */
export async function fetchModerationRecords(
  view: ModerationView,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: ModerationRecord[]; counts: Record<ModerationView, number>; unauthorized?: boolean } | null> {
  try {
    const response = await apiClient.get('/admin/moderation', { params: { view, limit, offset } });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      return { data: [], counts: { pending: 0, removed: 0, history: 0 }, unauthorized: true };
    }
    console.error(`❌ [Admin API] Erreur lors de la récupération des dossiers de modération:`, error);
    return null;
  }
}

/**
 * Applique une décision admin sur un dossier
 * POST /api/admin/moderation/{key}/{action}
 */
export async function applyModerationAction(
  key: string,
  action: ModerationAction,
  note?: string
): Promise<{ success: boolean; data?: ModerationRecord; error?: string }> {
  try {
    const response = await apiClient.post(`/admin/moderation/${key}/${action}`, note ? { note } : {});
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error(`❌ [Admin API] Erreur lors de l'action ${action} sur le dossier ${key}:`, error);
    return { success: false, error: error.response?.data?.message };
  }
}

/**
 * Type pour un contact terrain (simplifié)
 */
export interface FieldContact {
  name: string;
  email: string;
  firstPost?: string;
}

/**
 * Crée et valide directement un groupe pour un admin.
 * POST /api/admin/groups/direct
 */
export async function createDirectGroup(
  groupData: {
    name: string;
    description: string;
    shortDescription: string;
    type: Group['type'];
    avatar?: string;
    location: Location;
    tags: string[];
  },
  initiatorId: string
): Promise<Group> {
  console.log(`🔄 [Admin API] Création directe d'un groupe par ${initiatorId}`);

  try {
    const response = await apiClient.post('/admin/groups/direct', {
      ...groupData,
      initiatorId
    });

    const rawGroup: RawGroup | undefined = response.data?.group ?? response.data?.data ?? response.data;

    if (!rawGroup || !rawGroup._id) {
      throw new Error('Réponse invalide du backend pour la création directe de groupe');
    }

    const group = transformGroup(rawGroup);
    console.log(`✅ [Admin API] Groupe actif créé directement: ${group.id}`);
    return group;
  } catch (error) {
    console.error(`❌ [Admin API] Erreur lors de la création directe du groupe:`, error);
    throw error;
  }
}

/**
 * Signale un contenu
 * POST /api/admin/report
 */
export async function reportContent(contentType: 'ideas' | 'posts', contentId: string, userId: string): Promise<boolean> {
  console.log(`🔄 [Admin API] Signalement de ${contentType}/${contentId}`);
  try {
    await apiClient.post('/admin/report', {
      contentType,
      contentId,
      userId
    });
    console.log(`✅ [Admin API] Contenu signalé avec succès`);
    return true;
  } catch (error) {
    console.error(`❌ [Admin API] Erreur lors du signalement:`, error);
    return false;
  }
}

/**
 * Supprime ou ignore un signalement
 * DELETE /api/admin/report/{contentType}/{contentId}?action=delete|ignore
 */
export async function handleReport(
  contentType: 'ideas' | 'posts',
  contentId: string,
  action: 'delete' | 'ignore'
): Promise<{ success: boolean; data?: any }> {
  console.log(`🔄 [Admin API] ${action} signalement de ${contentType}/${contentId}`);
  try {
    const response = await apiClient.delete(`/admin/report/${contentType}/${contentId}`, {
      params: { action }
    });
    console.log(`✅ [Admin API] Signalement traité avec succès:`, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`❌ [Admin API] Erreur lors du traitement du signalement:`, error);
    return { success: false };
  }
}

/**
 * Liste les contenus signalés
 * GET /api/admin/reported-content?limit=20&offset=0
 */
export async function fetchReportedContent(
  limit: number = 20,
  offset: number = 0
): Promise<{ data: ReportedContent[]; total: number; limit: number; offset: number; unauthorized?: boolean } | null> {
  console.log(`🔄 [Admin API] Récupération des contenus signalés (limit: ${limit}, offset: ${offset})`);
  try {
    const response = await apiClient.get('/admin/reported-content', {
      params: { limit, offset }
    });
    console.log(`✅ [Admin API] ${response.data.total} contenus signalés récupérés`);
    return response.data;
  } catch (error: any) {
    // Vérifier si c'est une erreur 403 (non autorisé)
    if (error.response?.status === 403) {
      console.warn(`⚠️ [Admin API] Accès refusé (403) - Utilisateur non autorisé`);
      return { data: [], total: 0, limit, offset, unauthorized: true };
    }
    console.error(`❌ [Admin API] Erreur lors de la récupération des contenus signalés:`, error);
    return null;
  }
}

/**
 * Ajoute un nouveau contact terrain en créant un compte invité
 * Utilise createUnfinalizedAccountOnApi de authService
 * Si firstPost est fourni, crée également un post au nom de cet utilisateur
 */
export async function addFieldContact(contact: FieldContact): Promise<{ success: boolean; data?: any; error?: string }> {
  console.log(`🔄 [Admin API] Ajout d'un nouveau contact terrain (compte invité)`);
  try {
    // 1. Créer un compte invité via l'API d'auth
    const user = await createUnfinalizedAccountOnApi({
      name: contact.name,
      email: contact.email
    });
    
    console.log(`✅ [Admin API] Contact terrain (compte invité) créé avec succès:`, user);
    
    // 2. Si firstPost est fourni, créer le post au nom de cet utilisateur
    if (contact.firstPost && contact.firstPost.trim()) {
      console.log(`🔄 [Admin API] Création du premier post pour le contact terrain...`);
      const post = await createPostOnApi({
        authorId: user.id,
        content: contact.firstPost.trim(),
        type: 'general'
      });
      
      if (post) {
        console.log(`✅ [Admin API] Premier post créé avec succès:`, post.id);
      } else {
        console.warn(`⚠️ [Admin API] Impossible de créer le premier post`);
      }
    }
    
    return { success: true, data: user };
  } catch (error: any) {
    console.error(`❌ [Admin API] Erreur lors de l'ajout du contact terrain:`, error);
    
    // Détecter l'erreur 409 (email déjà existant)
    if (error.response?.status === 409) {
      console.warn(`⚠️ [Admin API] Email déjà existant (409 CONFLICT)`);
      return { success: false, error: 'EMAIL_EXISTS' };
    }
    
    return { success: false };
  }
}

/**
 * Récupère la liste des contacts terrain
 * GET /api/admin/field-contacts?limit=50&offset=0
 */
export async function fetchFieldContacts(
  limit: number = 50,
  offset: number = 0
): Promise<{ data: FieldContact[]; total: number; limit: number; offset: number } | null> {
  console.log(`🔄 [Admin API] Récupération des contacts terrain (limit: ${limit}, offset: ${offset})`);
  try {
    const response = await apiClient.get('/admin/field-contacts', {
      params: { limit, offset }
    });
    console.log(`✅ [Admin API] ${response.data.total} contacts terrain récupérés`);
    return response.data;
  } catch (error) {
    console.error(`❌ [Admin API] Erreur lors de la récupération des contacts terrain:`, error);
    return null;
  }
}

/**
 * Supprime un contact terrain
 * DELETE /api/admin/field-contacts/{contactId}
 */
export async function deleteFieldContact(contactId: string): Promise<{ success: boolean }> {
  console.log(`🔄 [Admin API] Suppression du contact terrain ${contactId}`);
  try {
    await apiClient.delete(`/admin/field-contacts/${contactId}`);
    console.log(`✅ [Admin API] Contact terrain supprimé avec succès`);
    return { success: true };
  } catch (error) {
    console.error(`❌ [Admin API] Erreur lors de la suppression du contact terrain:`, error);
    return { success: false };
  }
}
