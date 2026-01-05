/**
 * Utilitaire pour formater les dates en format "il y a X temps"
 */
export function formatTimeAgo(date: Date | undefined): string {
  if (!date) return 'Date inconnue';
  
  // S'assurer que date est bien un objet Date
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'À l\'instant';
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)}min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;
  
  return dateObj.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short'
  });
}
