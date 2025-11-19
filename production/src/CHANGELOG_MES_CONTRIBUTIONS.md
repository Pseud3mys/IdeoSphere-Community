# Refonte de l'interface "Mes Contributions"

## Date : 6 novembre 2025

## Objectif
Refondre complètement l'interface "Mes contributions" pour mieux organiser les contenus et ajouter un système de notifications calculé côté frontend.

## Modifications apportées

### 1. Types et Modèles de données (`/types/index.ts`)

#### Ajout du champ `lastConnectionDate` à l'interface `User`
```typescript
export interface User {
  // ... autres champs
  lastConnectionDate?: Date; // Date de dernière connexion (pour les notifications)
}
```

Ce champ permet de calculer les notifications en comparant les activités récentes avec la dernière connexion de l'utilisateur.

### 2. Données mockées (`/data/users.ts`)

#### Ajout de dates de dernière connexion pour tous les utilisateurs
- Marie Dubois : 2025-11-01 10:30
- Pierre Martin : 2025-11-03 14:20
- Sophie Laurent : 2025-11-04 09:15
- Thomas Chen : 2025-11-05 16:45
- Emma Rodriguez : 2025-11-02 11:00
- Jean-Claude Perrin : 2025-10-30 08:45
- Léa Dumont : 2025-11-05 19:30
- **Julie Renaud (currentUser) : 2025-11-04 08:00** (il y a 2 jours)

Ces dates permettent de simuler des notifications réalistes basées sur l'activité récente.

### 3. Nouveau composant principal (`/components/MyContributionsPage.tsx`)

#### Remplacement de `MyIdeasPage.tsx` par une nouvelle interface complète

**Structure en 3 onglets principaux :**

1. **Mes créations** 📝
   - Tous les posts et projets créés par l'utilisateur
   - Affichage avec stats de performance
   - Bouton "Créer mon premier contenu" si vide

2. **Participations** 💬
   - Contenus auxquels l'utilisateur a participé (commentaires, co-créations)
   - Exclut les contenus créés par l'utilisateur (déjà dans "Mes créations")
   - Focus sur l'engagement actif

3. **Soutiens** ❤️
   - Posts likés et projets soutenus
   - Section "archive" moins prioritaire
   - Permet de retrouver facilement les contenus soutenus

**Zone de notifications intelligente** 🔔

Calculée dynamiquement côté frontend basée sur :
- Date de dernière connexion de l'utilisateur
- Nouveaux soutiens sur les posts/projets de l'utilisateur
- Nouveaux commentaires sur les posts de l'utilisateur
- Nouvelles évaluations sur les projets de l'utilisateur

Types de notifications :
- 👍 Nouveau soutien
- 💬 Nouveau commentaire
- ⭐ Nouvelle évaluation

Affichage :
- Carte distincte en haut de page (seulement si notifications présentes)
- Badge avec nombre de notifications
- Scroll si plus de 10 notifications
- Clic sur une notification → navigation vers le contenu concerné
- Tri par date décroissante

**Colonne latérale avec :**

1. **Statistiques** 📊
   - Nombre de créations
   - Nombre de participations
   - Nombre de soutiens
   - Nombre de groupes
   - Détail posts/projets créés

2. **Mes groupes** 👥
   - Liste des groupes dont l'utilisateur est membre/animateur
   - Accès rapide avec clic vers chaque groupe
   - Badge avec nombre de membres
   - Emoji/avatar du groupe

**Fonctionnalités :**
- Barre de recherche globale pour filtrer tous les contenus
- Compteurs dans les badges des onglets
- États vides avec messages et actions contextuelles
- Design responsive avec grid layout

### 4. Mise à jour du wrapper (`/router/MyIdeasPageWrapper.tsx`)

- Import du nouveau composant `MyContributionsPage`
- Ajout du handler `onGroupClick` pour la navigation vers les groupes
- Conservation de toute la logique de chargement des contributions

### 5. Configuration Kumu (bonus)

Ajout dans `/config/clientConfig.ts` :
- Section "INTÉGRATIONS EXTERNES"
- Configuration Kumu avec `embedUrl` et `projectUrl`
- Intégration de l'iframe Kumu dans la page de statistiques
- Bouton "Ouvrir dans Kumu" pour accès direct

## Architecture respectée

✅ **Pattern SimpleEntityStore**
- Utilisation de `useEntityStoreSimple` pour accéder aux données
- Utilisation de `getMyContributions()` pour récupérer les contributions
- Pas d'accès direct aux données mockées

✅ **Navigation avec React Router**
- Utilisation de `useNavigationActions` pour tous les liens
- Navigation vers groupes, posts, projets

✅ **Composants réutilisables**
- `IdeaCard` et `PostCard` pour l'affichage uniforme
- Composants UI Shadcn (Tabs, Card, Badge, etc.)

## Points techniques

### Calcul des notifications

```typescript
const notifications = useMemo((): Notification[] => {
  const notifs: Notification[] = [];
  const lastConnection = currentUser.lastConnectionDate || new Date(0);
  
  // Pour chaque post/projet créé par l'utilisateur
  // Vérifier les nouvelles activités depuis lastConnection
  // Créer des objets Notification avec type, acteur, timestamp
  
  return notifs.sort((a, b) => b.timestamp - a.timestamp);
}, [currentUser, myContributions, allPosts, allIdeas]);
```

### Organisation des contenus

- **Créations** : `myContributions.myPosts` + `myContributions.myIdeas`
- **Participations** : `myContributions.commentedPosts` + `participationIdeas` (filtrés)
- **Soutiens** : `myContributions.likedPosts` + `myContributions.supportedIdeas`

### Gestion des états vides

Chaque onglet a un état vide personnalisé avec :
- Icône représentative
- Message contextuel
- Action suggérée (si applicable)

## TODO/Futures améliorations

1. **Paramètre "répertorier"** sur Post/Idea
   - Remplacer `isDiscussion` par un système plus flexible
   - Permettre de marquer certains contenus comme "à ne pas répertorier"
   - Utile pour les brouillons, tests, contenus temporaires

2. **Amélioration du système de notifications**
   - Ajouter des timestamps réels pour les actions (soutiens, commentaires)
   - Marquer les notifications comme "lues"
   - Regrouper les notifications similaires
   - Notifications push (si backend activé)

3. **Filtres avancés**
   - Filtrer par groupe
   - Filtrer par période
   - Filtrer par type de participation

4. **Analytics détaillées**
   - Graphiques d'évolution de l'engagement
   - Comparaison avec la moyenne de la plateforme
   - Meilleurs posts/projets de l'utilisateur

## Tests recommandés

- ✅ Affichage correct des 3 onglets
- ✅ Calcul des notifications basé sur lastConnectionDate
- ✅ Navigation vers les groupes
- ✅ Recherche dans les contributions
- ✅ États vides pour chaque onglet
- ✅ Responsive design
- ⚠️ Performance avec beaucoup de contributions (>100)
- ⚠️ Gestion des cas limites (utilisateur sans contributions, sans groupes)

## Impact sur l'existant

- ✅ Aucun changement dans les autres composants
- ✅ Conservation de l'ancien composant `MyIdeasPage.tsx` (peut être supprimé après tests)
- ✅ Compatibilité totale avec le routing existant
- ✅ Pas de breaking changes dans l'API du store
