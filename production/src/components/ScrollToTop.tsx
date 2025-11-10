import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 * Composant qui scroll automatiquement en haut de la page à chaque changement de route
 * 
 * Utilisation : Placer dans le Router, au même niveau que les Routes
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll instantané en haut de la page à chaque changement de pathname
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
