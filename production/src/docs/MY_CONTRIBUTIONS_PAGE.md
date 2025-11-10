# Page "Mes Contributions"

## Vue d'ensemble

La page "Mes Contributions" (`/my-contributions`) est une refonte complète de l'ancienne page "Mes Idées" (`/my-ideas`). Elle offre une vue centralisée et organisée de toute l'activité de l'utilisateur sur la plateforme IdeoSphere.

## Architecture

### Fichiers principaux
- **Composant** : `/components/MyContributionsPage.tsx`
- **Wrapper Router** : `/router/MyContributionsPageWrapper.tsx`
- **Route** : `/my-contributions` (définie dans `/router/routes.tsx`)

### Nouveaux champs de données

#### User
```typescript
interface User {
  // ... champs existants
  lastLoginDate?: Date; // Date de dernière connexion (pour calculer les notifications)
}
```

## Fonctionnalités

### 1. **Tableau de bord avec statistiques**
Affichage en haut de page de 5 indicateurs clés :
- Nombre de contenus publiés (posts + projets)
- Nombre de participations (commentaires + évaluations)
- Nombre de soutiens donnés
- Nombre de groupes
- Nombre de notifications non lues

### 2. **5 onglets organisés**

#### Tab 1: "Mes posts" (Ce que j'ai publié)
- Affiche tous les posts et projets créés par l'utilisateur
- Permet de gérer son propre contenu
- Filtrable par recherche

#### Tab 2: "Participé" (Ce à quoi j'ai participé)
- Posts que j'ai commentés (excluant mes propres posts)
- Projets que j'ai évalués (excluant mes propres projets)
- Filtrable par recherche
- Utile pour retrouver les discussions actives

#### Tab 3: "Supporté" (Ce que j'ai supporté)
- Posts que j'ai supportés uniquement (sans commenter ni être auteur)
- Projets que j'ai supportés uniquement (sans évaluer ni être co-créateur)
- Filtrable par recherche
- Sert d'archive/bookmark des contenus intéressants

#### Tab 4: "Groupes" (Mes groupes)
- Affiche tous les groupes dont l'utilisateur est membre
- Badge "Animateur" ou "Membre" selon le rôle
- Affiche les statistiques du groupe (membres, projets)
- Cliquable pour accéder au hub du groupe

#### Tab 5: "Notifs" (Notifications)
- Système de notifications calculé côté frontend
- Basé sur `lastLoginDate` de l'utilisateur
- Types de notifications :
  - Nouveau soutien sur mes posts/projets
  - Nouveau commentaire sur mes posts
  - Nouvelle évaluation sur mes projets
- Notifications triées par date décroissante
- Badge rouge avec compteur dans l'onglet

### 3. **Barre de recherche globale**
- Recherche dans le titre, contenu et tags
- Fonctionne sur tous les onglets (sauf groupes et notifications)
- Temps réel avec `useState`

### 4. **Navigation intelligente**
- Liens directs vers les posts/projets/groupes
- Intégration avec React Router
- Gestion des clics sur les notifications

## Logique des notifications

### Calcul des notifications
Les notifications sont calculées dynamiquement côté frontend à partir de :
1. `lastLoginDate` de l'utilisateur connecté
2. Parcours de tous les posts/projets créés par l'utilisateur
3. Détection des nouvelles activités (soutiens, commentaires, évaluations)

### Types de notifications
```typescript
interface Notification {
  id: string;
  type: 'new_support' | 'new_comment' | 'new_rating' | 'mention';
  contentId: string;
  contentType: 'idea' | 'post';
  contentTitle: string;
  actor: User; // Utilisateur qui a effectué l'action
  timestamp: Date;
  isRead: boolean;
}
```

### Exemple de détection
```typescript
// Pour chaque post créé par l'utilisateur
myPosts.forEach(post => {
  // Détecter les nouveaux soutiens depuis la dernière connexion
  post.supporters.forEach(supporterId => {
    if (supporterId !== currentUser.id) {
      const supporter = getUserById(supporterId);
      if (supporter && post.createdAt > lastLogin) {
        // Créer une notification
      }
    }
  });
});
```

## Différences avec l'ancienne page "Mes Idées"

### Avant (`MyIdeasPage`)
- 2 sections seulement : "Participations" et "Soutiens"
- Pas de section "Mes posts"
- Pas de notifications
- Pas de liens vers les groupes
- Interface moins organisée

### Après (`MyContributionsPage`)
- 5 onglets clairs et bien séparés
- Section dédiée à mes publications
- Système de notifications intelligent
- Accès rapide aux groupes
- Statistiques en haut de page
- Meilleure organisation visuelle

## Migration

### Routage
L'ancienne route `/my-ideas` existe toujours mais la navigation principale pointe maintenant vers `/my-contributions`.

### Composants réutilisés
- `IdeaCard` : affichage des projets
- `PostCard` : affichage des posts
- `Card`, `Badge`, `Tabs` : composants UI shadcn

## TODO / Améliorations futures

### À court terme
1. ✅ Ajouter `lastLoginDate` à tous les utilisateurs mockés
2. ⏳ Implémenter la persistance des notifications lues/non lues
3. ⏳ Ajouter un filtre par date dans chaque onglet

### À moyen terme
1. ⏳ Remplacer `isDiscussion` par un champ `répertorier` plus générique
2. ⏳ Ajouter la possibilité de marquer une notification comme lue
3. ⏳ Implémenter un système de notifications push (backend requis)

### À long terme
1. ⏳ Notifications en temps réel avec WebSocket
2. ⏳ Historique des notifications (au-delà de lastLoginDate)
3. ⏳ Notifications par email (backend requis)

## Utilisation

### Navigation
Accessible depuis la barre de navigation principale :
- Desktop : onglet "Mes contributions"
- Mobile : bouton "Mes idées" en bas

### URL directe
```
http://localhost:5173/my-contributions
```

### Permissions
- Nécessite d'être connecté (currentUser non null)
- Affiche uniquement le contenu de l'utilisateur connecté

## Performance

### Optimisations
- Utilisation de `useMemo` pour les calculs coûteux
- Filtrage côté client (données mockées)
- Pas de requêtes API pour les notifications (calcul local)

### Limites
- Le calcul des notifications peut être lent avec beaucoup de contenus
- À optimiser avec une vraie API backend plus tard
