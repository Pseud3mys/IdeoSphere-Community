# Fix : Routing avec préfixes ideas/ et posts/

## 🎯 Problème résolu

### Symptôme
```
❌ Type de contenu invalide : idea-1762188632515-zuqsilpcn
Format attendu : ideas/xxx ou posts/xxx
```

Lorsqu'un utilisateur créait une nouvelle idée et était redirigé vers la page de détails, une erreur s'affichait car le système de routing attendait un format d'URL avec préfixe.

### Cause

Le système de routing unifié utilise le format `/content/:id` où `:id` doit contenir un préfixe de type :
- `ideas/123` pour les idées
- `posts/456` pour les posts

**Mais** les hooks de navigation (`goToIdea`, `goToPost`) naviguaient avec l'ID brut sans préfixe :
```typescript
// ❌ AVANT
navigate(`/content/${ideaId}`); // ideaId = 'idea-123'
// URL générée : /content/idea-123
// ContentDetailPageWrapper attend : /content/ideas/idea-123
```

## ✅ Solution : Ajout automatique du préfixe

### 1. Dans useNavigationActions.ts

Les fonctions `goToIdea` et `goToPost` ajoutent maintenant automatiquement le préfixe :

```typescript
// ✅ APRÈS
goToIdea: async (ideaId: string) => {
  // ... chargement des données ...
  
  // Ajouter le préfixe 'ideas/' si ce n'est pas déjà présent
  const prefixedId = ideaId.startsWith('ideas/') ? ideaId : `ideas/${ideaId}`;
  navigate(`/content/${prefixedId}`);
  // URL générée : /content/ideas/idea-123 ✅
}
```

### 2. Dans IdeaDetailPageWrapper.tsx et PostDetailPageWrapper.tsx

Les wrappers extraient maintenant l'ID réel depuis le format préfixé :

```typescript
// ✅ Extraction de l'ID réel
let ideaId = params['*'] || params.contentId || params.ideaId;

// Extraire l'ID réel si le format est 'ideas/xxx'
if (ideaId?.startsWith('ideas/')) {
  ideaId = ideaId.substring(6); // 'ideas/idea-123' → 'idea-123'
}

// Maintenant ideaId peut être utilisé avec getIdeaById(), fetchIdeaDetails(), etc.
```

## 🔄 Flux complet

### Avant (❌ Erreur)

```
1. Création d'une idée
   → newIdea.id = 'idea-1762188632515-zuqsilpcn'
   ↓
2. navigation.goToIdea('idea-1762188632515-zuqsilpcn')
   → navigate('/content/idea-1762188632515-zuqsilpcn')
   ↓
3. ContentDetailPageWrapper
   → contentId = 'idea-1762188632515-zuqsilpcn'
   → ❌ Ne commence pas par 'ideas/' ni 'posts/'
   → Affiche "Type de contenu invalide"
```

### Après (✅ Fonctionne)

```
1. Création d'une idée
   → newIdea.id = 'idea-1762188632515-zuqsilpcn'
   ↓
2. navigation.goToIdea('idea-1762188632515-zuqsilpcn')
   → prefixedId = 'ideas/idea-1762188632515-zuqsilpcn'
   → navigate('/content/ideas/idea-1762188632515-zuqsilpcn')
   ↓
3. ContentDetailPageWrapper
   → contentId = 'ideas/idea-1762188632515-zuqsilpcn'
   → ✅ Commence par 'ideas/'
   → Route vers <IdeaDetailPageWrapper />
   ↓
4. IdeaDetailPageWrapper
   → ideaId extrait = 'idea-1762188632515-zuqsilpcn'
   → getIdeaById('idea-1762188632515-zuqsilpcn')
   → ✅ Trouve l'idée dans le cache dynamique
   → Affiche la page de détails
```

## 📊 Format des IDs

### Dans l'application

Les IDs sont stockés sans préfixe partout :
- **Store** : `idea-123`, `post-456`
- **Types** : `Idea.id = 'idea-123'`, `Post.id = 'post-456'`
- **API** : `createIdeaOnApi()` retourne `{ id: 'idea-123', ... }`

### Dans les URLs uniquement

Les URLs utilisent le format préfixé pour la détection de type :
- `/content/ideas/idea-123`
- `/content/posts/post-456`

### Conversion automatique

```
┌─────────────────────────────────────────────────────┐
│              Navigation avec ID brut                 │
│         navigation.goToIdea('idea-123')              │
└─────────────────────────────────────────────────────┘
                         │
                         ↓ useNavigationActions ajoute le préfixe
                         ↓
              /content/ideas/idea-123
                         │
                         ↓ ContentDetailPageWrapper détecte le type
                         ↓
              <IdeaDetailPageWrapper />
                         │
                         ↓ IdeaDetailPageWrapper extrait l'ID
                         ↓
              ideaId = 'idea-123'
                         │
                         ↓ Utilisé avec les APIs et le store
                         ↓
              getIdeaById('idea-123')
```

## 🎁 Avantages

### ✅ Simplicité pour les développeurs

Pas besoin de se souvenir d'ajouter le préfixe manuellement :
```typescript
// Simple et naturel
navigation.goToIdea(idea.id);
// Pas besoin de faire : navigation.goToIdea(`ideas/${idea.id}`);
```

### ✅ URLs propres et cohérentes

Toutes les URLs de contenu suivent le même pattern :
- `/content/ideas/:id`
- `/content/posts/:id`

### ✅ Détection automatique du type

Le `ContentDetailPageWrapper` route automatiquement vers le bon composant selon le préfixe.

### ✅ Compatibilité

Le système supporte les deux formats :
```typescript
// Avec préfixe (déjà fourni par exemple depuis une URL)
navigation.goToIdea('ideas/idea-123'); // ✅ Fonctionne

// Sans préfixe (format normal depuis le store)
navigation.goToIdea('idea-123'); // ✅ Fonctionne aussi
```

## 🧪 Tests de validation

### Test 1 : Création d'idée
```
✅ Créer une nouvelle idée
✅ Navigation vers la page de détails
✅ Page de détails s'affiche correctement
✅ URL contient /content/ideas/idea-xxx
```

### Test 2 : Création de post
```
✅ Créer un nouveau post
✅ Navigation vers la page de détails
✅ Page de détails s'affiche correctement
✅ URL contient /content/posts/post-xxx
```

### Test 3 : Navigation depuis le feed
```
✅ Cliquer sur une idée dans le feed
✅ Navigation vers la page de détails
✅ URL correcte avec préfixe
```

### Test 4 : URL directe
```
✅ Entrer /content/ideas/idea-123 dans le navigateur
✅ Page se charge correctement
✅ Idée affichée
```

## 📝 Fichiers modifiés

### Modifications principales
- ✅ `/hooks/useNavigationActions.ts` - Ajout auto du préfixe dans goToIdea/goToPost
- ✅ `/router/IdeaDetailPageWrapper.tsx` - Extraction de l'ID depuis le format préfixé
- ✅ `/router/PostDetailPageWrapper.tsx` - Extraction de l'ID depuis le format préfixé

### Documentation mise à jour
- ✅ `/docs/ROUTING.md` - Documentation du système de préfixes

## 🔮 Évolution future

### Support d'autres types de contenu

Le système est facilement extensible pour de nouveaux types :

```typescript
// Dans ContentDetailPageWrapper
if (contentId.startsWith('projects/')) {
  return <ProjectDetailPageWrapper />;
}

// Dans useNavigationActions
goToProject: async (projectId: string) => {
  const prefixedId = projectId.startsWith('projects/') 
    ? projectId 
    : `projects/${projectId}`;
  navigate(`/content/${prefixedId}`);
}
```

### Migration vers une vraie API

Avec une vraie API, le format d'URL resterait le même :

```typescript
// L'API retournerait déjà l'URL complète
const response = await fetch('/api/ideas');
const idea = await response.json();
// idea.url = '/content/ideas/idea-123'

// Ou on peut continuer à construire l'URL côté client
navigation.goToIdea(idea.id); // Fonctionne pareil
```

## 🎯 Résumé

**Problème** : URLs sans préfixe causaient des erreurs de routing

**Cause** : Désalignement entre le format attendu par ContentDetailPageWrapper et le format fourni par les hooks de navigation

**Solution** : 
1. Les hooks de navigation ajoutent automatiquement le préfixe
2. Les wrappers extraient automatiquement l'ID réel

**Résultat** : ✅ Navigation fluide avec URLs cohérentes et préfixées

---

**Date de création** : 2 novembre 2025  
**Version** : 1.0  
**Lié à** : CACHE_DYNAMIQUE.md (correction précédente)
