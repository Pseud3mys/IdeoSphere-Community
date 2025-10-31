// src/main.tsx

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initAuth } from './api/authService';
import { AuthProvider } from './context/authContext';

const container = document.getElementById('root')!;
const root = createRoot(container);

// Nouveau composant pour gérer l'initialisation
function AppInitializer() {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    
    console.log("[AppInitializer] Lancement de initAuth()...");
    
    initAuth().then((authenticated) => {
      if (isMounted) {
        console.log("✅ [AppInitializer] initAuth() terminé.");
        setIsAuthenticated(authenticated);
        setIsInitialized(true);
      }
    }).catch(error => {
      console.error("❌ [AppInitializer] Échec de l'initialisation", error);
      if (isMounted) {
        setIsInitialized(true); // On continue même en cas d'erreur pour ne pas bloquer
      }
    });

    return () => {
      isMounted = false;
    };
  }, []); // Le tableau de dépendances vide garantit une seule exécution

  if (!isInitialized) {
    // Affiche un état de chargement React, qui est plus propre
    return (
      <div className="min-h-screen flex items-center justify-center">
        Initialisation de la session...
      </div>
    );
  }

  return (
    <AuthProvider isAuthenticated={isAuthenticated}>
      <App />
    </AuthProvider>
  );
}


// Rendre le composant AppInitializer qui gère lui-même son état de chargement
root.render(
  <React.StrictMode>
    <AppInitializer />
  </React.StrictMode>
);