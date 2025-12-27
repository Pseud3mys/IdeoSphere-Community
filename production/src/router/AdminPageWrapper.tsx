// src/router/AdminPageWrapper.tsx
import { useState, useEffect } from 'react';
import { AdminPage } from '../components/AdminPage';
import { fetchReportedContent, handleReport, ReportedContent } from '../api/adminService';
import { toast } from 'sonner';
import { useAuth } from '../context/authContext';
import { Loader2 } from 'lucide-react';

/**
 * AdminPageWrapper
 * Connecte la page d'administration avec les services API
 * Utilise le contexte d'auth pour attendre l'initialisation
 */
export function AdminPageWrapper() {
  const [reportedContent, setReportedContent] = useState<ReportedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Charger les contenus signalés une fois l'auth initialisée
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        loadReportedContent();
      } else {
        console.warn('⚠️ [AdminPage] Utilisateur non authentifié');
        setIsLoading(false);
      }
    }
  }, [authLoading, isAuthenticated]);

  const loadReportedContent = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 [AdminPage] Chargement des contenus signalés...');
      const result = await fetchReportedContent(20, 0);
      if (result) {
        setReportedContent(result.data);
        console.log(`✅ [AdminPage] ${result.data.length} contenus signalés chargés`);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des contenus signalés:', error);
      toast.error('Impossible de charger les contenus signalés');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReport = async (contentType: 'ideas' | 'posts', contentId: string) => {
    try {
      const result = await handleReport(contentType, contentId, 'delete');
      if (result.success) {
        toast.success('Contenu supprimé avec succès');
        // Recharger la liste
        await loadReportedContent();
      } else {
        toast.error('Erreur lors de la suppression du contenu');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du contenu');
    }
  };

  const handleIgnoreReport = async (contentType: 'ideas' | 'posts', contentId: string) => {
    try {
      const result = await handleReport(contentType, contentId, 'ignore');
      if (result.success) {
        toast.success('Signalement ignoré avec succès');
        // Recharger la liste
        await loadReportedContent();
      } else {
        toast.error('Erreur lors de l\'ignorance du signalement');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'ignorance:', error);
      toast.error('Erreur lors de l\'ignorance du signalement');
    }
  };

  // Afficher un loader pendant l'initialisation de l'auth
  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminPage
      onDeleteReport={handleDeleteReport}
      onIgnoreReport={handleIgnoreReport}
      reportedContent={reportedContent}
      isLoading={isLoading}
    />
  );
}
