// src/router/AdminPageWrapper.tsx
import { useState, useEffect } from 'react';
import { AdminPage } from '../components/AdminPage';
import { 
  fetchReportedContent, 
  handleReport, 
  ReportedContent,
  FieldContact,
  addFieldContact
} from '../api/adminService';
import { toast } from 'sonner';
import { useAuth } from '../context/authContext';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { hasAdminRole } from '../api/authService';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

/**
 * AdminPageWrapper
 * Connecte la page d'administration avec les services API
 * Utilise le contexte d'auth pour attendre l'initialisation
 * Vérifie l'autorisation admin avant d'afficher la page
 */
export function AdminPageWrapper() {
  const [reportedContent, setReportedContent] = useState<ReportedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Charger les contenus signalés une fois l'auth initialisée
  useEffect(() => {
    if (!authLoading) {
      // Vérifier si l'utilisateur a le rôle admin
      // hasAdminRole() vérifie automatiquement :
      // 1. Si l'utilisateur est authentifié via Keycloak (pas un invité)
      // 2. Si l'utilisateur a le rôle "admin:{tenant}"
      if (!hasAdminRole()) {
        console.warn('⚠️ [AdminPage] Utilisateur non autorisé');
        setIsUnauthorized(true);
        setIsLoading(false);
        return;
      }
      loadReportedContent();
    }
  }, [authLoading]);

  const loadReportedContent = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 [AdminPage] Chargement des contenus signalés...');
      const result = await fetchReportedContent(20, 0);
      if (result) {
        // Vérifier si l'utilisateur est non autorisé (erreur 403 de l'API)
        if (result.unauthorized) {
          console.warn('⚠️ [AdminPage] Accès refusé par l\'API (403)');
          setIsUnauthorized(true);
        } else {
          setReportedContent(result.data);
          console.log(`✅ [AdminPage] ${result.data.length} contenus signalés chargés`);
        }
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

  const handleAddContact = async (contact: FieldContact): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await addFieldContact(contact);
      if (result.success) {
        toast.success('Contact ajouté avec succès');
        return { success: true };
      } else if (result.error === 'EMAIL_EXISTS') {
        toast.error('Cet email est déjà associé à un compte existant');
        return { success: false, error: 'EMAIL_EXISTS' };
      } else {
        toast.error('Erreur lors de l\'ajout du contact');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du contact:', error);
      toast.error('Erreur lors de l\'ajout du contact');
      return { success: false };
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

  // Afficher un message si l'utilisateur n'est pas autorisé
  if (isUnauthorized) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
          </div>
        </div>
        
        <Alert variant="destructive" className="border-red-300 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800 font-semibold text-lg">
            Accès non autorisé
          </AlertTitle>
          <AlertDescription className="text-red-700 mt-2">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            Seuls les administrateurs peuvent accéder à l'interface d'administration.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <AdminPage
      onDeleteReport={handleDeleteReport}
      onIgnoreReport={handleIgnoreReport}
      reportedContent={reportedContent}
      isLoading={isLoading}
      onAddContact={handleAddContact}
    />
  );
}
