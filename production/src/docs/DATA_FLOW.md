# Flux de Données - IdeoSphere

## Vue d'Ensemble

```
┌──────────────────────────────────────────────────────────────────┐
│                    DÉMARRAGE DE L'APPLICATION                     │
└──────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
                    useEntityStoreSimple.ts (useEffect)
                                  │
                                  ↓
┌──────────────────────────────────────────────────────────────────┐
│          apiActions.loadInitialData() ← SEUL ACCÈS               │
│                                                                   │
│  const { loadMockDataSet } = await import('../api/dataService'); │
│  const mockData = await loadMockDataSet();                       │
└──────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
┌──────────────────────────────────────────────────────────────────┐
│                      dataService.ts                               │
│                                                                   │
│  loadMockDataSet() {                                             │
│    return {                                                       │
│      ideas: [...],      ← depuis /data/ideas.ts                  │
│      posts: [...],      ← depuis /data/posts.ts                  │
│      users: [...],      ← depuis /data/users.ts                  │
│      discussions: [...]  ← depuis /data/discussions.ts           │
│    }                                                              │
│  }                                                                │
└──────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
┌──────────────────────────────────────────────────────────────────┐
│              actions.initializeStore(mockData)                    │
│                                                                   │
│  → Store rempli avec TOUTES les données mockées                  │
└──────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
┌──────────────────────────────────────────────────────────────────┐
│                   STORE (Source de vérité unique)                 │
│                                                                   │
│  users: {                                                         │
│    'user-1': { id: 'user-1', name: 'Alice', ... },               │
│    'user-2': { id: 'user-2', name: 'Bob', ... }                  │
│  }                                                                │
│                                                                   │
│  ideas: {                                                         │
│    'idea-1': { id: 'idea-1', title: '...', ... },                │
│    'idea-2': { id: 'idea-2', title: '...', ... }                 │
│  }                                                                │
│                                                                   │
│  posts: { ... }                                                   │
│  discussionTopics: { ... }                                        │
└──────────────────────────────────────────────────────────────────┘
                                  │
                 ┌────────────────┴────────────────┐
                 ↓                                  ↓
    ┌────────────────────────┐      ┌────────────────────────┐
    │   LECTURE (Selectors)  │      │  ÉCRITURE (Actions)    │
    └────────────────────────┘      └────────────────────────┘
                 │                                  │
                 ↓                                  ↓
       boundSelectors.getIdeaById()      actions.addIdea()
       boundSelectors.getAllIdeas()      actions.updateIdea()
       boundSelectors.getCurrentUser()   actions.publishIdea()
                 │                                  │
                 ↓                                  ↓
    ┌────────────────────────┐      ┌────────────────────────┐
    │      COMPOSANTS        │      │      COMPOSANTS        │
    │   (lecture seule)      │      │   (modifications)      │
    └────────────────────────┘      └────────────────────────┘
```

## Cycle de Vie d'une Entité

### 1. Entité Mockée (Chargée au démarrage)

```
/data/ideas.ts → loadMockDataSet() → initializeStore() → STORE
                                                          │
                                                          ↓
                                            Accessible via selectors
```

### 2. Entité Créée Dynamiquement

```
Utilisateur clique "Publier" → actions.publishIdea()
                                         │
                                         ↓
                              createIdeaOnApi() (simule API)
                                         │
                                         ↓
                              Retourne newIdea { id: '...', ... }
                                         │
                                         ↓
                              actions.addIdea(newIdea)
                                         │
                                         ↓
                                      STORE
                                         │
                                         ↓
                              Accessible via selectors
```

### 2b. Chargement de Relations (Pattern en 3 Étapes)

```
Hook charge les relations → loadIdeaTabData('idea-123', 'versions')
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   │                                            │
                   ↓                                            ↓
        1. APPELER L'API                          2. AJOUTER AU STORE
   fetchLineage('idea-123', 'idea')          actions.addIdea(parent1)
           │                                  actions.addPost(parent2)
           ↓                                  actions.addIdea(child1)
   Retourne lineageData                              │
   {                                                 ↓
     parents: [...],  ← depuis données mockées    STORE
     children: [...]                               │
   }                                                │
           │                                        │
           └────────────────┬───────────────────────┘
                            ↓
              3. LIRE DEPUIS LE STORE
        boundSelectors.getIdeaById(parentId)
        boundSelectors.getPostById(parentId)
                            │
                            ↓
              Trouve TOUTES les entités
           (mockées + créées dynamiquement)
```

**Pourquoi 3 étapes ?**
- **Étape 1** : L'API retourne les données mockées
- **Étape 2** : On les ajoute au store (fusion avec les données dynamiques)
- **Étape 3** : On lit depuis le store → trouve mockées + dynamiques !

### 3. Recherche d'une Entité

```
Composant veut afficher une idée
              │
              ↓
const { getIdeaById } = useEntityStoreSimple()
              │
              ↓
const idea = getIdeaById('idea-123')
              │
              ├─ Si mockée → Trouvée ✅
              ├─ Si créée dynamiquement → Trouvée ✅
              └─ Si n'existe pas → null ❌
```

## Pourquoi Cette Architecture ?

### ❌ Problème de l'ancienne approche

```typescript
// Hook cherche dans les données mockées
const { getIdeaById } = await import('../api/dataService');
const idea = await getIdeaById('idea-created-by-user');

// Résultat: null ❌
// Car l'idée créée dynamiquement n'est PAS dans /data/ideas.ts
```

### ✅ Solution actuelle

```typescript
// Hook cherche dans le store
const idea = boundSelectors.getIdeaById('idea-created-by-user');

// Résultat: { id: '...', title: '...', ... } ✅
// Car l'idée créée dynamiquement EST dans le store
```

## Points d'Attention

### ⚠️ Ne JAMAIS faire

```typescript
// ❌ Dans un hook
import { getIdeaById } from '../api/dataService';
const idea = await getIdeaById(ideaId);

// ❌ Dans un composant
import { mockIdeas } from '../data/ideas';
const ideas = mockIdeas.filter(...);

// ❌ Dans un composant
const { getAllIdeas } = await import('../api/dataService');
const ideas = await getAllIdeas();
```

### ✅ Toujours faire

```typescript
// ✅ Dans un hook
const idea = boundSelectors.getIdeaById(ideaId);

// ✅ Dans un composant
const { getAllIdeas, getIdeaById } = useEntityStoreSimple();
const ideas = getAllIdeas();
const idea = getIdeaById(ideaId);
```

## Exceptions et Cas Spéciaux

### Services API (`/api/*.ts`)

Les services API PEUVENT accéder à `dataService.ts` car ils simulent une vraie API :

```typescript
// Dans /api/contentService.ts - OK ✅
export async function fetchIdeaDetails(ideaId: string) {
  const { getIdeaById } = await import('./dataService');
  return await getIdeaById(ideaId);
}
```

**MAIS** les hooks doivent ensuite ajouter le résultat au store :

```typescript
// Dans /hooks/apiActions.ts
const idea = await fetchIdeaDetails(ideaId);
if (idea) {
  actions.addIdea(idea); // ← Ajouter au store
}
```

### Chargement Initial

**UNE SEULE fonction** peut charger les données mockées :

```typescript
// Dans /hooks/apiActions.ts
loadInitialData: async () => {
  const { loadMockDataSet } = await import('../api/dataService');
  const mockData = await loadMockDataSet();
  
  actions.initializeStore({
    users: [...],
    ideas: [...],
    posts: [...],
    discussionTopics: [...]
  });
}
```

Appelée **UNE SEULE FOIS** dans `/hooks/useEntityStoreSimple.ts` au démarrage.

## Résumé en 5 Règles

1. **Chargement unique** : `loadInitialData()` appelée UNE FOIS au démarrage
2. **Store = vérité** : Toutes les données (mockées + dynamiques) sont dans le store
3. **Lecture = selectors** : Toujours utiliser `boundSelectors` ou `useEntityStoreSimple()`
4. **Écriture = actions** : Toujours utiliser `actions.addIdea()`, `actions.updateIdea()`, etc.
5. **Zéro accès direct** : Hooks et composants ne touchent JAMAIS à `dataService` ou `/data`

## Débogage

### Comment vérifier si une entité est dans le store ?

```typescript
const { getAllIdeas } = useEntityStoreSimple();
const ideas = getAllIdeas();

console.log('Toutes les idées:', ideas);
console.log('Nombre total:', ideas.length);
console.log('IDs:', ideas.map(i => i.id));
```

### Comment vérifier pourquoi une entité n'est pas trouvée ?

```typescript
const { getIdeaById, getAllIdeas } = useEntityStoreSimple();

const ideaId = 'idea-123';
const idea = getIdeaById(ideaId);

if (!idea) {
  console.error(`Idée ${ideaId} non trouvée !`);
  console.log('Idées disponibles:', getAllIdeas().map(i => i.id));
}
```

### Comment tracer le chargement initial ?

```typescript
// Dans useEntityStoreSimple.ts, la console affiche :
// 🔄 [useEntityStoreSimple] Chargement des données initiales...
// 🔄 [apiActions] Chargement des données initiales...
// ✅ [apiActions] Données mockées chargées: {users: 12, ideas: 8, posts: 15, discussions: 6}
// ✅ [apiActions] Store initialisé avec toutes les données
// ✅ [useEntityStoreSimple] Données initiales chargées avec succès
```

Si ces logs n'apparaissent pas, le chargement initial a échoué !
