// Re-export tout depuis les fichiers modulaires pour compatibilité avec l'ancien système
export { users, currentUser } from './users';
export { mockPosts } from './posts';
export { mockIdeas, getIdeaWithRelatedData } from './ideas';
export { discussionTopics, getDiscussionsForIdea } from './discussions';
export { defaultRatingCriteria } from './ratings';
export { ideaVersions, getVersionsForIdea } from './versions';

// Ce fichier sert maintenant de point central d'export pour toutes les données mock
// Les données sont organisées dans des fichiers séparés pour une meilleure maintenabilité :