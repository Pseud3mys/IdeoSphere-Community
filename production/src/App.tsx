import { BrowserRouter, useRoutes } from 'react-router-dom';
import { SimpleEntityStoreProvider } from './store/SimpleEntityStore';
import { AuthProvider } from './context/authContext';
import { ErrorBoundary } from 'react-error-boundary';
import { routes } from './router/routes';
import { ScrollToTop } from './components/ScrollToTop';
import { AuthSyncBridge } from './auth/AuthSyncBridge';

// Composant d'erreur pour l'error boundary
function ErrorFallback({error, resetErrorBoundary}: {error: Error, resetErrorBoundary: () => void}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center p-6">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold mb-2">Oups ! Une erreur est survenue</h2>
        <p className="text-gray-600 mb-4">
          L'application a rencontré un problème. Essayez de recharger la page.
        </p>
        <button 
          onClick={resetErrorBoundary}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          Réessayer
        </button>
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-gray-500">
            Détails de l'erreur
          </summary>
          <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
            {error.message}
          </pre>
        </details>
      </div>
    </div>
  );
}

/**
 * AppRouter
 * Gère le routage de l'application avec React Router
 */
function AppRouter() {
  const element = useRoutes(routes);
  return (
    <>
      <ScrollToTop />
      <AuthSyncBridge />
      {element}
    </>
  );
}

/**
 * App
 * Composant racine de l'application
 * 
 * Architecture :
 * ErrorBoundary > SimpleEntityStoreProvider > AuthProvider > MemoryRouter > AuthSyncBridge + Routes
 * 
 * NOTE : Utilise MemoryRouter pour la compatibilité avec Figma Make.
 * Pour un déploiement réel, remplacer MemoryRouter par BrowserRouter.
 */
export default function App() {
  console.log('🚀 [App] Initialisation avec React Router + Auth Hybride (Mock/Keycloak)');
  
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('❌ Erreur capturée par ErrorBoundary:', error, errorInfo);
      }}
      onReset={() => {
        // Recharger la page en cas de reset
        window.location.reload();
      }}
    >
      <SimpleEntityStoreProvider>
        <AuthProvider>
          <BrowserRouter initialEntries={['/']}>
            <AppRouter />
          </BrowserRouter>
        </AuthProvider>
      </SimpleEntityStoreProvider>
    </ErrorBoundary>
  );
}