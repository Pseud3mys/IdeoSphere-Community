// src/api/adminService.ts
import apiClient from './apiClient';
import { createUnfinalizedAccountOnApi } from './authService';

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
 * Type pour un contact terrain (simplifié)
 */
export interface FieldContact {
  name: string;
  email: string;
  neighborhood?: string;
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
): Promise<{ data: ReportedContent[]; total: number; limit: number; offset: number } | null> {
  console.log(`🔄 [Admin API] Récupération des contenus signalés (limit: ${limit}, offset: ${offset})`);
  try {
    const response = await apiClient.get('/admin/reported-content', {
      params: { limit, offset }
    });
    console.log(`✅ [Admin API] ${response.data.total} contenus signalés récupérés`);
    return response.data;
  } catch (error) {
    console.error(`❌ [Admin API] Erreur lors de la récupération des contenus signalés:`, error);
    return null;
  }
}

/**
 * Ajoute un nouveau contact terrain en créant un compte invité
 * Utilise createUnfinalizedAccountOnApi de authService
 */
export async function addFieldContact(contact: FieldContact): Promise<{ success: boolean; data?: any }> {
  console.log(`🔄 [Admin API] Ajout d'un nouveau contact terrain (compte invité)`);
  try {
    // Créer un compte invité via l'API d'auth
    const user = await createUnfinalizedAccountOnApi({
      name: contact.name,
      email: contact.email,
      address: contact.neighborhood // Le quartier devient l'adresse
    });
    
    console.log(`✅ [Admin API] Contact terrain (compte invité) créé avec succès:`, user);
    return { success: true, data: user };
  } catch (error) {
    console.error(`❌ [Admin API] Erreur lors de l'ajout du contact terrain:`, error);
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
