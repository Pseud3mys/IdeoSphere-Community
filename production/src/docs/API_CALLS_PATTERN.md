# Pattern d'Appel aux Services API

## Principe Fondamental

**Les services API retournent UNIQUEMENT les données mockées. Pour obtenir TOUTES les données (mockées + dynamiques), il faut passer par le store.**

## Le Pattern en 3 Étapes

Chaque fois qu'un hook appelle un service API, il doit suivre ce pattern :

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
  const completeData = boundSelectors.getSomethingById(id);
  
  return completeData;
}
```

## Pourquoi Ce Pattern ?

### ❌ Problème : Appeler l'API sans passer par le store

```typescript
// Hook
const { fetchIdea } = await import('../api/contentService');
const idea = await fetchIdea('idea-created-by-user');

// Résultat: null ❌
// L'idée créée dynamiquement n'est PAS dans les données mockées !
```

### ✅ Solution : Pattern en 3 étapes

```typescript
// 1. Appeler l'API
const { fetchIdea } = await import('../api/contentService');
const apiIdea = await fetchIdea('idea-123');

// 2. Ajouter au store
if (apiIdea) {
  actions.addIdea(apiIdea);
}

// 3. Lire depuis le store
const idea = boundSelectors.getIdeaById('idea-created-by-user');

// Résultat: { id: '...', title: '...', ... } ✅
// Trouve les idées mockées ET dynamiques !
```

## Exemples Concrets

### Exemple 1 : Charger une Idée

```typescript
// Dans /hooks/apiActions.ts

loadIdea: async (ideaId: string) => {
  try {
    // 1. APPELER L'API
    const { fetchIdeaDetails } = await import('../api/contentService');
    const apiIdea = await fetchIdeaDetails(ideaId);
    
    // 2. AJOUTER AU STORE
    if (apiIdea) {
      actions.addIdea(apiIdea);
    }
    
    // 3. LIRE DEPUIS LE STORE
    const completeIdea = boundSelectors.getIdeaById(ideaId);
    
    return completeIdea;
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}
```

### Exemple 2 : Charger le Lineage (Avec Relations)

```typescript
// Dans /hooks/apiActions.ts

loadIdeaTabData: async (ideaId: string, tabType: 'versions') => {
  try {
    // 1. APPELER L'API
    const { fetchLineage } = await import('../api/lineageService');
    const lineageData = await fetchLineage(ideaId, 'idea');
    
    if (!lineageData) return null;
    
    // 2. AJOUTER TOUTES LES ENTITÉS AU STORE
    // Ajouter les parents
    lineageData.parents.forEach(parent => {
      if (parent.type === 'idea') {
        const existing = boundSelectors.getIdeaById(parent.id);
        if (!existing) {
          actions.addIdea(convertToIdea(parent));
        }
      } else if (parent.type === 'post') {
        const existing = boundSelectors.getPostById(parent.id);
        if (!existing) {
          actions.addPost(convertToPost(parent));
        }
      }
    });
    
    // Ajouter les enfants
    lineageData.children.forEach(child => {
      if (child.type === 'idea') {
        const existing = boundSelectors.getIdeaById(child.id);
        if (!existing) {
          actions.addIdea(convertToIdea(child));
        }
      }
    });
    
    // 3. LIRE DEPUIS LE STORE
    const currentIdea = boundSelectors.getIdeaById(ideaId);
    
    const parents = lineageData.parents.map(p => {
      return p.type === 'idea'
        ? boundSelectors.getIdeaById(p.id)
        : boundSelectors.getPostById(p.id);
    }).filter(Boolean);
    
    const children = lineageData.children.map(c => 
      boundSelectors.getIdeaById(c.id)
    ).filter(Boolean);
    
    return {
      currentItem: currentIdea,
      parents,
      children
    };
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}
```

### Exemple 3 : Charger les Discussions

```typescript
// Dans /hooks/apiActions.ts

loadDiscussions: async (entityId: string, entityType: 'idea' | 'post') => {
  try {
    // 1. APPELER L'API
    const { fetchDiscussions } = await import('../api/detailsService');
    const apiDiscussions = await fetchDiscussions(entityId, entityType);
    
    // 2. AJOUTER AU STORE
    if (apiDiscussions && apiDiscussions.length > 0) {
      apiDiscussions.forEach(discussion => {
        actions.addDiscussionTopic(discussion);
      });
    }
    
    // 3. LIRE DEPUIS LE STORE
    // Récupérer l'entité mise à jour avec les discussionIds
    const entity = entityType === 'idea'
      ? boundSelectors.getIdeaById(entityId)
      : boundSelectors.getPostById(entityId);
    
    if (!entity) return [];
    
    // Récupérer toutes les discussions depuis le store
    const discussions = entity.discussionIds?.map(id =>
      boundSelectors.getDiscussionTopicById(id)
    ).filter(Boolean) || [];
    
    return discussions;
  } catch (error) {
    console.error('❌ Error:', error);
    return [];
  }
}
```

## Cas Particuliers

### Cas 1 : Entité Déjà dans le Store

Si l'entité est déjà dans le store, l'étape 1 (appel API) peut être évitée :

```typescript
loadIdea: async (ideaId: string) => {
  // Vérifier si l'idée est déjà dans le store
  const existingIdea = boundSelectors.getIdeaById(ideaId);
  
  if (existingIdea && existingIdea.description) {
    // L'idée complète est déjà là, pas besoin d'appeler l'API
    console.log('✅ Idée déjà dans le store');
    return existingIdea;
  }
  
  // Sinon, appeler l'API + ajouter au store
  const { fetchIdeaDetails } = await import('../api/contentService');
  const apiIdea = await fetchIdeaDetails(ideaId);
  
  if (apiIdea) {
    actions.addIdea(apiIdea);
  }
  
  return boundSelectors.getIdeaById(ideaId);
}
```

### Cas 2 : Création d'Entité (Pas d'Appel API Nécessaire)

Lors de la création, on génère l'entité localement puis on l'ajoute au store :

```typescript
publishIdea: async (data: IdeaData) => {
  // 1. CRÉER l'entité localement (pas d'appel API)
  const newIdea = {
    id: `idea-${Date.now()}`,
    ...data,
    createdAt: new Date(),
    supportCount: 0,
    supporters: [],
    // ...
  };
  
  // 2. AJOUTER AU STORE directement
  actions.addIdea(newIdea);
  
  // 3. LIRE DEPUIS LE STORE
  const createdIdea = boundSelectors.getIdeaById(newIdea.id);
  
  return createdIdea;
}
```

## Tous les Endroits où on Appelle les Services API

### Dans `/hooks/apiActions.ts`

| Fonction | Service API | Pattern à appliquer |
|----------|-------------|---------------------|
| `loadInitialData` | `dataService.loadMockDataSet()` | ✅ Cas unique (chargement initial) |
| `fetchHomePageStats` | `feedService.fetchHomePageStats()` | ⚠️ À vérifier |
| `fetchFeed` | `feedService.fetchFeed()` | ✅ **CORRIGÉ** - Pattern en 3 étapes |
| `fetchMyContributions` | `feedService.fetchMyContributions()` | ✅ **CORRIGÉ** - Pattern en 3 étapes |
| `fetchMyProfile` | `contentService.fetchUserProfileFromApi()` | ✅ **CORRIGÉ** - Pattern en 3 étapes |
| `loadDiscussions` | `detailsService.fetchDiscussions()` | ✅ Pattern correct |
| `loadIdeaRatings` | `detailsService.fetchIdeaRatings()` | ✅ Pattern correct |
| `loadIdeaTabData('versions')` | `lineageService.fetchLineage()` | ✅ Pattern en 3 étapes |
| `publishIdea` | `contentService.createIdeaOnApi()` | ✅ **CORRIGÉ** - Pattern en 3 étapes |
| `publishPost` | `contentService.createPostOnApi()` | ✅ **CORRIGÉ** - Pattern en 3 étapes |

### Dans `/hooks/navigationActions.ts`

| Fonction | Service API | Pattern à appliquer |
|----------|-------------|---------------------|
| `goToIdea` | `contentService.fetchIdeaDetails()` | ✅ **CORRIGÉ** - Pattern en 3 étapes |
| `goToIdea` | `detailsService.fetchDiscussions()` | ✅ **CORRIGÉ** - Pattern en 3 étapes |
| `goToPost` | `contentService.fetchPostDetails()` | ✅ **CORRIGÉ** - Pattern en 3 étapes |
| `goToUser` | Aucun (déjà dans le store) | ✅ Correct (pas d'API)

## Checklist pour Chaque Appel API

- [ ] 1. Appeler le service API
- [ ] 2. Vérifier le résultat (null check)
- [ ] 3. Ajouter TOUTES les entités au store via `actions.addXxx()`
- [ ] 4. Relire depuis le store via `boundSelectors.getXxxById()`
- [ ] 5. Retourner les données du store (pas celles de l'API)

## Résumé

**Règle d'Or** : Ne JAMAIS retourner directement les données de l'API. Toujours les ajouter au store puis les relire depuis le store.

```typescript
// ❌ INCORRECT
const data = await fetchSomething(id);
return data; // Retourne QUE les données mockées

// ✅ CORRECT
const apiData = await fetchSomething(id);
if (apiData) {
  actions.addSomething(apiData);
}
return boundSelectors.getSomethingById(id); // Retourne mockées + dynamiques
```
