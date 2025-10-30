import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Composant ProtectedRoute
 * Protège les routes qui nécessitent une authentification
 * Redirige vers la page d'accueil si l'utilisateur n'est pas authentifié
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { getCurrentUser } = useEntityStoreSimple();
  const currentUser = getCurrentUser();
  
  // Vérifier si l'utilisateur est authentifié (compte finalisé)
  const isAuthenticated = currentUser?.isRegistered ?? false;
  
  // Si non authentifié, rediriger vers la page d'accueil
  if (!isAuthenticated) {
    console.log('🔒 [ProtectedRoute] Utilisateur non authentifié, redirection vers /');
    return <Navigate to="/" replace />;
  }
  
  // Si authentifié, afficher le contenu protégé
  return <>{children}</>;
}
