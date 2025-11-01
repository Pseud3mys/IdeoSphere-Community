import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Toaster } from './ui/sonner';

/**
 * PublicLayout
 * Layout pour les pages publiques (accessibles sans authentification)
 * Contient uniquement le footer et le contenu principal
 */
export function PublicLayout() {
  // Handler pour la navigation du footer
  const handleFooterNavigation = (page: string) => {
    // La navigation sera gérée automatiquement par React Router
    // via les <Link> dans le Footer (Phase 2)
    console.log('📍 [PublicLayout] Navigation footer vers:', page);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Contenu principal (rendu par React Router) */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer onNavigate={handleFooterNavigation} />

      {/* Notifications toast */}
      <Toaster position="bottom-right" />
    </div>
  );
}
