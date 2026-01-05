# Refonte Discussion - Interface Unifiée

## Changements Principaux

### ✅ Nouveau Comportement
- **1 seul espace de discussion** : replies + posts promus mélangés dans l'ordre chronologique
- **Répondre à une reply** → la promeut automatiquement en post (backend supprime la reply originale)
- **Pas de navigation automatique** : l'utilisateur reste sur le post actuel après promotion
- **Zone de texte inline** partout (plus de navigation vers autre page)

### ❌ Supprimé
- Bouton "Ajouter à la discussion" 
- Section "Suite de la discussion" (posts dérivés séparés)
- Distinction visuelle forte entre replies et posts
- Badge "Voir détail" sur les replies promues (supprimé car la reply disparaît)
- Navigation automatique vers le nouveau post créé

### 📂 Fichiers Clés
1. **DiscussionThread.tsx** - Nouveau composant unifié
2. **replyPromotionService.ts** - API de promotion
3. **contentActions.ts** - Action `promoteReplyToPost`

### 🔑 Type PostReply
```typescript
export interface PostReply {
  id: string;
  authorId: string;
  content: string;
  createdAt: Date;
  likes?: string[];
  // Note: promotedToPostId n'est plus utilisé car le backend supprime la reply
}
```

### 📡 Route API
```
POST /api/posts/<post_key>/comments/<comment_id>/promote
Body: { newReplyContent, newReplyAuthorId }

Réponse:
{
  "post": { ... },              // Le nouveau post créé
  "new_reply_id": "...",        // L'ID de la reply ajoutée au nouveau post
  "users": {
    "original_author": { ... },
    "new_reply_author": { ... }
  },
  "parent_post_key": "..."
}

⚠️ Important: Le backend SUPPRIME la reply originale du post parent
```

## Flux Utilisateur
1. **Ajouter reply sur post** → Zone de texte simple en bas
2. **Cliquer "Répondre" sur reply** → Zone inline s'ouvre avec texte "Votre réponse va créer une discussion dédiée..."
3. **Envoyer** → 
   - Backend supprime la reply originale
   - Crée un nouveau post dérivé avec la reply originale comme contenu
   - Ajoute la réponse de l'utilisateur comme première reply du nouveau post
   - L'utilisateur RESTE sur le post actuel (pas de redirection)
4. **Affichage** → Le nouveau post apparaît dans la discussion unifiée, à sa place chronologique

## Comportement du Store (contentActions.ts)

### Avant la promotion:
```typescript
post.replies = [reply1, reply2, reply3]
post.derivedPosts = []
```

### Après la promotion de reply2:
```typescript
post.replies = [reply1, reply3]  // reply2 SUPPRIMÉE
post.derivedPosts = ['newPostId'] // Nouveau post ajouté
```

Le nouveau post est automatiquement ajouté au store et apparaît dans `DiscussionThread` car il est dans `derivedPosts`.
