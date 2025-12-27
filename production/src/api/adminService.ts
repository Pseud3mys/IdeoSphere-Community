// src/api/adminService.ts
import apiClient from './apiClient';

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
 * Signale un contenu
 * POST /api/admin/report
 */
export async function reportContent(contentType: 'ideas' | 'posts', contentId: string): Promise<boolean> {
  console.log(`🔄 [Admin API] Signalement de ${contentType}/${contentId}`);
  try {
    await apiClient.post('/admin/report', {
      contentType,
      contentId
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
