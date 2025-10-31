# Pattern d'Appel API - Référence Rapide

## Pattern en 3 Étapes (Obligatoire)

Toute fonction qui appelle un service API **DOIT** suivre ce pattern :

```typescript
async function loadData(id: string) {
  // 1️⃣ APPELER L'API (retourne données mockées)
  const { fetchSomething } = await import('../api/someService');
  const apiData = await fetchSomething(id);
  
  // 2️⃣ AJOUTER AU STORE (fusion avec données dynamiques)
  if (apiData) {
    actions.addSomething(apiData);
  }
  
  // 3️⃣ LIRE DEPUIS LE STORE (trouve mockées + dynamiques)
  return boundSelectors.getSomethingById(id);
}
```

## Pourquoi Ce Pattern ?

Les services API ne connaissent **QUE** les données mockées. Les entités créées dynamiquement (posts/idées créés par l'utilisateur) existent **UNIQUEMENT** dans le store.

### ❌ Sans le Pattern

```typescript
const { fetchIdea } = await import('../api/contentService');
const idea = await fetchIdea('idea-created-by-user');
// Résultat: null ❌ (créée dynamiquement, pas dans les mockées)
```

### ✅ Avec le Pattern

```typescript
// 1. API (peut retourner null si pas dans mockées)
const apiIdea = await fetchIdea('idea-123');
if (apiIdea) actions.addIdea(apiIdea);

// 2. Store (trouve mockées ET dynamiques)
const idea = boundSelectors.getIdeaById('idea-created-by-user');
// Résultat: { id, title, ... } ✅
```

## Exemples par Cas d'Usage

### Cas 1 : Charger une Entité Simple

```typescript
// Dans /hooks/navigationActions.ts
goToIdea: async (ideaId: string, initialTab = 'description') => {
  const { fetchIdeaDetails } = await import('../api/contentService');
  const { fetchDiscussions } = await import('../api/detailsService');
  
  // 1. APPELER L'API
  const apiIdeaDetails = await fetchIdeaDetails(ideaId);
  
  // 2. AJOUTER AU STORE
  if (apiIdeaDetails) {
    actions.addIdea(apiIdeaDetails);
    
    // Charger aussi les discussions immédiatement
    const { discussions, users } = await fetchDiscussions(ideaId, 'idea');
    discussions.forEach(d => actions.addDiscussionTopic(d));
    users.forEach(u => actions.addUser(u));
  }
  
  // 3. LIRE DEPUIS LE STORE
  const ideaFromStore = boundSelectors.getIdeaById(ideaId);
  console.log(`✅ Chargé idée "${ideaFromStore.title}" depuis le store`);
  
  // Navigation
  actions.setSelectedIdeaId(ideaId);
  actions.setActiveTab('idea-detail');
}
```

### Cas 2 : Charger des Relations (Lineage)

```typescript
// Dans /hooks/apiActions.ts
loadLineage: async (itemId: string, itemType: 'idea' | 'post') => {
  const { fetchLineage } = await import('../api/lineageService');
  
  // 1. APPELER L'API
  const lineageResult = await fetchLineage(itemId, itemType);
  if (!lineageResult) return null;
  
  // 2. AJOUTER TOUTES les entités au store
  const parentIds: string[] = [];
  lineageResult.parents.forEach((parentItem: any) => {
    if (parentItem.type === 'idea') {
      actions.addIdea({
        id: parentItem.id,
        title: parentItem.title || '',
        creatorIds: parentItem.creatorIds || [],
        // ... autres champs
      });
    } else {
      actions.addPost({
        id: parentItem.id,
        content: parentItem.content || '',
        authorId: parentItem.authorId || 'unknown',
        // ... autres champs
      });
    }
    parentIds.push(parentItem.id);
  });
  
  // Mettre à jour l'item avec les IDs des relations
  if (itemType === 'idea') {
    const parentIdeaIds = parentIds.filter(id => {
      const item = lineageResult.parents.find((p: any) => p.id === id);
      return item?.type === 'idea';
    });
    const parentPostIds = parentIds.filter(id => {
      const item = lineageResult.parents.find((p: any) => p.id === id);
      return item?.type === 'post';
    });
    
    actions.updateIdea(itemId, {
      sourceIdeas: parentIdeaIds,
      sourcePosts: parentPostIds,
      derivedIdeas: childIdeaIds
    });
  }
  
  // 3. LIRE DEPUIS LE STORE
  const parents = parentIds.map(id => 
    lineageResult.parents.find((p: any) => p.id === id)?.type === 'idea'
      ? boundSelectors.getIdeaById(id)
      : boundSelectors.getPostById(id)
  ).filter(Boolean);
  
  return { currentItem, parents, children };
}
```

### Cas 3 : Créer une Entité

```typescript
// Dans /hooks/apiActions.ts
publishIdea: async (payload: IdeaData) => {
  const { createIdeaOnApi } = await import('../api/contentService');
  
  // 1. APPELER L'API (génère l'entité avec ID)
  const newIdea = await createIdeaOnApi(payload);
  
  // 2. AJOUTER AU STORE
  actions.addIdea(newIdea);
  
  // 3. LIRE DEPUIS LE STORE
  const ideaFromStore = boundSelectors.getIdeaById(newIdea.id);
  console.log(`✅ Idée "${ideaFromStore.title}" créée et ajoutée au store`);
  
  return ideaFromStore;
}
```

### Cas 4 : Optimisation (Cache)

```typescript
// Dans /hooks/apiActions.ts
fetchFeed: async (forceRefresh = false) => {
  const currentUser = boundSelectors.getCurrentUser();
  
  // Système de cache (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;
  const now = Date.now();
  const isCacheValid = store.feedLastFetched && 
    (now - store.feedLastFetched) < CACHE_DURATION;
  
  if (!forceRefresh && isCacheValid && store.feedIdeaIds.length > 0) {
    // Utiliser le cache - lire directement depuis le store
    const ideasFromStore = store.feedIdeaIds
      .map(id => boundSelectors.getIdeaById(id))
      .filter(Boolean);
    const postsFromStore = store.feedPostIds
      .map(id => boundSelectors.getPostById(id))
      .filter(Boolean);
    
    return { ideas: ideasFromStore, posts: postsFromStore };
  }
  
  // Sinon, pattern normal 1-2-3
  const { fetchFeed } = await import('../api/feedService');
  const feedData = await fetchFeed(currentUser?.id);
  
  // ... ajouter au store + lire depuis store
}
```

## Pattern storeUpdater (Éviter Stale Closures)

Pour les modifications du store, utiliser `storeUpdater` au lieu de lire avant :

### ❌ Stale Closure

```typescript
toggleSupport: async (ideaId: string) => {
  const idea = boundSelectors.getIdeaById(ideaId); // ❌ Closure périmée
  const currentUser = boundSelectors.getCurrentUser(); // ❌ Closure périmée
  
  // Plus tard, ces valeurs peuvent être obsolètes
}
```

### ✅ storeUpdater

```typescript
// Dans /hooks/contentActions.ts
toggleIdeaSupport: async (ideaId: string) => {
  const { toggleSupportOnApi } = await import('../api/interactionService');
  
  storeUpdater(prevStore => {
    // ✅ Lire l'état FRAIS depuis prevStore
    const idea = selectors.getIdeaById(prevStore)(ideaId);
    const currentUser = selectors.getCurrentUser(prevStore);
    
    if (!idea || !currentUser) return {};
    
    const isSupporting = idea.supporters.includes(currentUser.id);
    const newSupporters = isSupporting
      ? idea.supporters.filter(id => id !== currentUser.id)
      : [...idea.supporters, currentUser.id];
    
    // Appeler API en arrière-plan (ne pas attendre)
    toggleSupportOnApi(ideaId, currentUser.id, 'idea', isSupporting);
    
    // Retourner uniquement les changements
    return {
      ideas: {
        ...prevStore.ideas,
        [ideaId]: {
          ...idea,
          supporters: newSupporters,
          supportCount: newSupporters.length
        }
      }
    };
  });
}
```

## Checklist

- [ ] Appelle le service API avec `await import('../api/...')`
- [ ] Vérifie le résultat (`if (apiData)`)
- [ ] Ajoute TOUTES les entités au store via `actions.addXxx()`
- [ ] Relit depuis le store via `boundSelectors.getXxxById()`
- [ ] Retourne les données du store (pas celles de l'API)
- [ ] Gère les cas `null`/`undefined`
- [ ] Logs de confirmation (`console.log('✅ ...')`)
- [ ] Utilise `storeUpdater` pour les mutations

## Règle d'Or

**Ne JAMAIS retourner directement les données de l'API.**

```typescript
// ❌ INCORRECT
const data = await fetchSomething(id);
return data; // Retourne QUE les données mockées

// ✅ CORRECT
const apiData = await fetchSomething(id);
if (apiData) actions.addSomething(apiData);
return boundSelectors.getSomethingById(id); // Trouve mockées + dynamiques
```

## Voir Aussi

- `/ARCHITECTURE.md` - Vue d'ensemble de l'architecture
- `/docs/DATA_FLOW.md` - Flux de données et débogage
- `/hooks/README.md` - Documentation des hooks
