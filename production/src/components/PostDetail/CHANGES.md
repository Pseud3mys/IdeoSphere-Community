# Refonte Discussion - Interface Unifiée

## Changements Principaux

### ✅ Nouveau Comportement
- **1 seul espace de discussion** : replies + posts promus mélangés
- **Répondre à une reply** → la promeut automatiquement en post
- **Badge "Voir détail"** sur les replies promues pour naviguer
- **Zone de texte inline** partout (plus de navigation vers autre page)

### ❌ Supprimé
- Bouton "Ajouter à la discussion" 
- Section "Suite de la discussion" (posts dérivés)
- Distinction visuelle forte entre replies et posts

### 📂 Fichiers Clés
1. **DiscussionThread.tsx** - Nouveau composant unifié
2. **replyPromotionService.ts** - API de promotion
3. **contentActions.ts** - Action `promoteReplyToPost`

### 🔑 Type Modifié
```typescript
export interface PostReply {
  // ...
  promotedToPostId?: string; // Lien vers le post si promue
}
```

### 📡 Route API
```
POST /api/posts/<post_key>/comments/<comment_id>/promote
Body: { newReplyContent, newReplyAuthorId }
```

## Flux Utilisateur
1. Ajouter reply sur post → Zone de texte simple
2. Cliquer "Répondre" sur reply → Zone inline s'ouvre
3. Envoyer → Promeut reply en post + navigue vers le nouveau post
4. Badge "Voir détail" visible sur reply promue
