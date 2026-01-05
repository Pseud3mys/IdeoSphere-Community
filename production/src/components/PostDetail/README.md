# Structure des composants PostDetail

Ce dossier contient les composants séparés pour la page de détail d'un post.

## Architecture

Le fichier `PostDetailPage.tsx` (729 lignes) a été divisé en plusieurs fichiers plus petits pour une meilleure maintenabilité :

### 📁 Structure

```
components/
├── PostDetailPage.tsx              (~177 lignes) - Composant principal orchestrateur
└── PostDetail/
    ├── formatTimeAgo.ts            (~25 lignes)  - Utilitaire de formatage de dates
    ├── PostDetailContent.tsx       (~470 lignes) - Affichage du contenu et des actions
    └── PostDetailReplies.tsx       (~210 lignes) - Section commentaires/réponses
```

### 🔧 Composants

#### 1. **PostDetailPage.tsx** (Principal)
- **Rôle** : Orchestrateur principal qui gère la logique et l'état
- **Responsabilités** :
  - Récupération des données depuis le store
  - Chargement du lineage (posts sources/dérivés)
  - Gestion des états (signalement, support)
  - Coordination entre les sous-composants

#### 2. **PostDetail/PostDetailContent.tsx**
- **Rôle** : Affichage du post principal et du contenu dérivé
- **Contenu** :
  - Posts sources (inspiration)
  - Header et contenu du post principal
  - Actions de contribution (réponse, promouvoir)
  - Actions secondaires (like, partage, signalement)
  - Contenu dérivé (projets et discussions)

#### 3. **PostDetail/PostDetailReplies.tsx**
- **Rôle** : Gestion des commentaires/réactions rapides
- **Contenu** :
  - Formulaire d'ajout de commentaire
  - Liste des commentaires avec votes
  - Interface de réponse aux commentaires

#### 4. **PostDetail/formatTimeAgo.ts**
- **Rôle** : Utilitaire de formatage de dates
- **Format** : "Il y a Xmin/h/j" ou date complète

## 🔄 Flux de données

```
PostDetailPageWrapper (Router)
    ↓
    ↓ Props: post, callbacks (onBack, onIdeaClick, onPostClick, onReport)
    ↓
PostDetailPage (Orchestrateur)
    ↓
    ├─→ PostDetailContent
    │       - Affiche le post et ses relations
    │       - Gère les actions de contribution
    │
    └─→ PostDetailReplies
            - Affiche et gère les commentaires
```

## 📝 Props et callbacks

### PostDetailPage
```typescript
interface PostDetailPageProps {
  post: Post;                        // Post initial (rechargé depuis le store)
  onBack: () => void;                // Navigation retour
  onIdeaClick: (ideaId: string) => void;    // Navigation vers une idée
  onPostClick: (postId: string) => void;    // Navigation vers un post
  onReport?: (postId: string) => void;      // Signalement (optionnel)
}
```

### Actions gérées en interne
Ces actions sont maintenant gérées directement via le store (`actions`), plus besoin de les passer en props :
- `promotePostToIdea` - Transformer un post en idée
- `createResponsePost` - Créer un post de réponse
- `togglePostLike` - Liker/unliker un post
- `addPostReply` - Ajouter un commentaire
- `likePostReply` - Liker un commentaire

## 🎯 Avantages de cette architecture

1. **Maintenabilité** : Fichiers plus courts (~200-470 lignes vs 729)
2. **Réutilisabilité** : Les composants peuvent être utilisés séparément
3. **Clarté** : Chaque composant a une responsabilité unique
4. **Testabilité** : Plus facile de tester chaque partie indépendamment
5. **Performance** : Possibilité d'optimiser le rendu de chaque section

## 🔧 Modifications récentes

- ✅ Suppression des props `onPromoteToIdea` et `onCreateResponsePost` (gérées en interne)
- ✅ Gestion du signalement avec état local + callback parent
- ✅ Import de sonner corrigé (sans version)
- ✅ Corrections TypeScript pour les types optionnels

## 📦 Fichier de backup

L'ancien fichier monolithique est sauvegardé dans :
`src/components/PostDetailPage_old.tsx`
