# Flux de Données IdeoSphere

## Vue d'Ensemble

```
┌────────────────────────────────────────────────────────────┐
│                DÉMARRAGE DE L'APPLICATION                  │
└────────────────────────────────────────────────────────────┘
                          ↓
           useEntityStoreSimple.ts (useEffect)
                          ↓
           apiActions.loadInitialData()
                          ↓
           dataService.loadMockDataSet()
            ↓          ↓          ↓
   /data/ideas  /data/posts  /data/users
                          ↓
           actions.initializeStore(mockData)
                          ↓
┌────────────────────────────────────────────────────────────┐
│           STORE (Source de vérité unique)                  │
│                                                            │
│  users: Record<string, User>                              │
│  ideas: Record<string, Idea>                              │
│  posts: Record<string, Post>                              │
│  discussionTopics: Record<string, DiscussionTopic>        │
│  communities: Record<string, Community>                   │
│  currentUserId: string                                    │
└────────────────────────────────────────────────────────────┘
            ↓                        ↓
   Selectors (lecture)      Actions (écriture)
            ↓                        ↓
        COMPOSANTS               COMPOSANTS
```

## Cycle de Vie des Données

### 1. Données Mockées (Chargement Initial)

**UNE SEULE fonction** charge les données mockées, **UNE SEULE fois** :

```typescript
// /hooks/apiActions.ts - loadInitialData()
loadInitialData: async () => {
  const { loadMockDataSet } = await import('../api/dataService');
  const mockData = await loadMockDataSet();
  
  // Initialiser le store avec TOUTES les données
  actions.initializeStore({
    users: [mockData.currentUser, mockData.guestUser, ...mockData.users],
    ideas: mockData.ideas,
    posts: mockData.posts,
    discussionTopics: mockData.discussions,
    communities: [],
    communityMemberships: [],
    currentUserId: mockData.currentUser.id
  });
}
```

**Appelée dans** `/hooks/useEntityStoreSimple.ts` :

```typescript
useEffect(() => {
  const isStoreEmpty = Object.keys(store.users).length === 0;
  if (isStoreEmpty && !storeInitialized) {
    apiActions.loadInitialData();
  }
}, []); // ← Pas de dépendances, s'exécute UNE fois
```

### 2. Données Créées Dynamiquement

```
Utilisateur clique "Publier"
           ↓
    publishIdea(payload)
           ↓
    createIdeaOnApi(payload) → newIdea
           ↓
    actions.addIdea(newIdea)
           ↓
    boundSelectors.getIdeaById(newIdea.id)
           ↓
    STORE contient l'idée
           ↓
    Accessible partout via selectors
```

### 3. Pattern en 3 Étapes (Chargement de Relations)

Exemple : Charger le lineage d'une idée

```
loadLineage(itemId, itemType)
           │
           ├─ 1. APPELER L'API
           │     fetchLineage(itemId, itemType)
           │     └─ Retourne { parents: [...], children: [...] }
           │
           ├─ 2. AJOUTER AU STORE
           │     parents.forEach(p => actions.addIdea(p))
           │     children.forEach(c => actions.addIdea(c))
           │     └─ Toutes les entités sont dans le store
           │
           └─ 3. LIRE DEPUIS LE STORE
                 parents.map(p => boundSelectors.getIdeaById(p.id))
                 └─ Trouve mockées + dynamiques ✅
```

**Pourquoi 3 étapes ?**
- **Étape 1** : L'API retourne les données mockées
- **Étape 2** : On les ajoute au store (fusion avec données dynamiques)
- **Étape 3** : On lit depuis le store → trouve TOUT

### 4. Mutations Optimistes (storeUpdater)

```
actions.toggleIdeaSupport(ideaId)
           │
           └─ storeUpdater(prevStore => {
                const idea = selectors.getIdeaById(prevStore)(ideaId);
                const currentUser = selectors.getCurrentUser(prevStore);
                // ✅ État FRAIS depuis prevStore
                
                // Calculer nouvel état
                const newSupporters = isSupporting
                  ? idea.supporters.filter(id => id !== currentUser.id)
                  : [...idea.supporters, currentUser.id];
                
                // API en arrière-plan
                toggleSupportOnApi(ideaId, currentUser.id, 'idea', isSupporting);
                
                // Retourner changements
                return {
                  ideas: {
                    ...prevStore.ideas,
                    [ideaId]: { ...idea, supporters: newSupporters }
                  }
                };
              })
```

## Système de Cache

### Cache du Feed (5 minutes)

```typescript
fetchFeed: async (forceRefresh = false) => {
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const now = Date.now();
  const isCacheValid = store.feedLastFetched && 
    (now - store.feedLastFetched) < CACHE_DURATION;
  
  if (!forceRefresh && isCacheValid && store.feedIdeaIds.length > 0) {
    // Utiliser le cache
    return {
      ideas: store.feedIdeaIds.map(id => boundSelectors.getIdeaById(id)),
      posts: store.feedPostIds.map(id => boundSelectors.getPostById(id))
    };
  }
  
  // Sinon, recharger depuis l'API
  const feedData = await fetchFeed(userId);
  // ... ajouter au store + mettre à jour timestamp
  actions.setFeedLastFetched(now);
}
```

## Structure des Données

### Normalisation par ID

```typescript
// Store
{
  ideas: {
    'idea-1': { id: 'idea-1', title: '...', supporters: ['user-1', 'user-2'] },
    'idea-2': { id: 'idea-2', title: '...', supporters: ['user-3'] }
  }
}

// Accès O(1)
const idea = store.ideas['idea-1'];

// Pas de doublons possibles
// Fusion facile : Object.assign(store.ideas, newIdeas)
```

### Relations par IDs

```typescript
// Post avec authorId (string)
{
  id: 'post-1',
  content: 'Contenu du post',
  authorId: 'user-123', // ✅ ID simple
  supporters: ['user-1', 'user-2'], // ✅ IDs simples
  derivedIdeas: ['idea-5', 'idea-8'] // ✅ IDs simples
}

// Idea avec creators (User[]) - migration en cours
{
  id: 'idea-1',
  title: 'Titre',
  creators: [{ id: 'user-1', name: 'Alice' }], // ⏳ Sera migré vers creatorIds
  supporters: ['user-1', 'user-2'], // ✅ Déjà IDs simples
  sourceIdeas: ['idea-2', 'idea-3'] // ✅ IDs simples
}
```

Voir `/PLAN_MIGRATION_AUTHOR_IDS.md` pour la migration en cours.

## Règles d'Usage

### ❌ INTERDIT

```typescript
// Dans un hook
import { getIdeaById } from '../api/dataService';
const idea = await getIdeaById(ideaId);

// Dans un composant
import { mockIdeas } from '../data/ideas';
const ideas = mockIdeas.filter(...);
```

### ✅ AUTORISÉ

```typescript
// Dans un hook
const idea = boundSelectors.getIdeaById(ideaId);

// Dans un composant
const { getAllIdeas, getIdeaById } = useEntityStoreSimple();
const ideas = getAllIdeas();
const idea = getIdeaById(ideaId);
```

## Débogage

### Vérifier le Contenu du Store

```typescript
const { getAllIdeas, getAllPosts } = useEntityStoreSimple();
const ideas = getAllIdeas();
const posts = getAllPosts();

console.log('Idées dans le store:', ideas.length);
console.log('IDs:', ideas.map(i => i.id));
console.log('Posts dans le store:', posts.length);
```

### Vérifier Pourquoi une Entité n'est pas Trouvée

```typescript
const { getIdeaById, getAllIdeas } = useEntityStoreSimple();

const ideaId = 'idea-123';
const idea = getIdeaById(ideaId);

if (!idea) {
  console.error(`Idée ${ideaId} non trouvée !`);
  console.log('Idées disponibles:', getAllIdeas().map(i => i.id));
}
```

### Tracer le Chargement Initial

Logs attendus au démarrage :

```
🔄 [useEntityStoreSimple] Chargement des données initiales...
🔄 [apiActions] Chargement des données initiales...
✅ [apiActions] Données mockées chargées: {users: 12, ideas: 8, posts: 15, discussions: 6}
✅ [apiActions] Store initialisé avec toutes les données
✅ [useEntityStoreSimple] Données initiales chargées avec succès
```

Si ces logs n'apparaissent pas → problème de chargement initial !

### Tracer les Actions

```typescript
// Dans une action
const action = async () => {
  console.log('🔵 Action démarrée');
  
  const apiData = await fetchSomething(id);
  console.log('✅ API retournée:', apiData);
  
  actions.addSomething(apiData);
  const fromStore = boundSelectors.getSomethingById(id);
  console.log('✅ Depuis le store:', fromStore);
};
```

## Résumé

1. **Chargement unique** : `loadInitialData()` UNE fois au démarrage
2. **Store = vérité** : Toutes les données (mockées + dynamiques)
3. **Lecture = selectors** : Via `boundSelectors` ou `useEntityStoreSimple()`
4. **Écriture = actions** : Via `actions.addIdea()`, `storeUpdater()`, etc.
5. **Zéro accès direct** : Hooks/composants ne touchent JAMAIS à `/data`

## Voir Aussi

- `/ARCHITECTURE.md` - Vue d'ensemble de l'architecture
- `/docs/API_CALLS_PATTERN.md` - Pattern en 3 étapes détaillé
- `/hooks/README.md` - Documentation des hooks
