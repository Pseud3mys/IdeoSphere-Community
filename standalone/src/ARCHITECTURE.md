# Architecture IdeoSphere

## Principe Fondamental

**Toutes les données sont dans le store. Le store est la source de vérité unique.**

## Flux de Données

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CHARGEMENT INITIAL (UNE SEULE FOIS)                      │
└─────────────────────────────────────────────────────────────┘
                         ↓
          /data/*.ts (données mockées)
                         ↓
          loadMockDataSet() (dataService.ts)
                         ↓
          loadInitialData() (apiActions.ts)
                         ↓
          initializeStore() (SimpleEntityStore.tsx)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. STORE (Source de vérité unique)                          │
│                                                              │
│  • Données mockées (chargées au démarrage)                  │
│  • Données créées dynamiquement (posts, idées, etc.)        │
└─────────────────────────────────────────────────────────────┘
                         ↓
          Selectors (simpleSelectors.ts)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. COMPOSANTS                                                │
│                                                              │
│  • Lisent via selectors                                     │
│  • Modifient via actions                                    │
└─────────────────────────────────────────────────────────────┘
```

## Règle d'Or

### ❌ INTERDIT

**Ne JAMAIS accéder directement à `dataService.ts` depuis les hooks ou composants !**

```typescript
// ❌ INTERDIT dans un hook !
import { getIdeaById } from '../api/dataService';
const idea = await getIdeaById(ideaId); // Ne trouve pas les entités créées dynamiquement
```

**Pourquoi ?** Les données mockées ne contiennent QUE les données initiales. Les entités créées dynamiquement (posts, idées créés par l'utilisateur) ne sont QUE dans le store !

### ✅ CORRECT

**Toujours utiliser les selectors pour lire les données :**

```typescript
// ✅ CORRECT dans un hook
const idea = boundSelectors.getIdeaById(ideaId); // Trouve TOUTES les entités

// ✅ CORRECT dans un composant
const { getIdeaById } = useEntityStoreSimple();
const idea = getIdeaById(ideaId);
```

## Une Seule Exception

### Chargement Initial

**UNE SEULE fonction peut accéder à `dataService.ts` :**

```typescript
// Dans /hooks/apiActions.ts

loadInitialData: async () => {
  const { loadMockDataSet } = await import('../api/dataService');
  const mockData = await loadMockDataSet();
  
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

Cette fonction est appelée **UNE SEULE FOIS** au démarrage dans `/hooks/useEntityStoreSimple.ts`.

## Architecture des Dossiers

```
/api               → Services API (simulent des appels backend)
  dataService.ts   → ⚠️ SEUL point d'accès aux données mockées
  *Service.ts      → Services métier (utilisent dataService pour les données mockées)

/data              → Données mockées (lecture seule)
  *.ts             → Données initiales (chargées UNE FOIS)

/store             → Store global (source de vérité unique)
  SimpleEntityStore.tsx  → Store et actions de base
  simpleSelectors.ts     → Selectors pour lire le store

/hooks             → Logique métier et interface avec le store
  useEntityStoreSimple.ts → Hook principal (point d'entrée unique)
  apiActions.ts          → Actions API (loadInitialData = SEUL accès à dataService)
  contentActions.ts      → Actions de contenu (CRUD)
  navigationActions.ts   → Actions de navigation
  userActions.ts         → Actions utilisateur

/components        → Composants React
  *.tsx            → Utilisent useEntityStoreSimple() pour accéder au store
```

## Cycle de Vie des Données

### 1. Au Démarrage

```typescript
// useEntityStoreSimple.ts
useEffect(() => {
  apiActions.loadInitialData(); // ← UNE SEULE FOIS
}, []);
```

### 2. Pendant l'Utilisation - Création

```typescript
// L'utilisateur crée une idée
actions.publishIdea({
  title: "Mon idée",
  summary: "Résumé",
  description: "Description"
});

// L'API simulée crée l'idée
const newIdea = await createIdeaOnApi(data);

// L'idée est ajoutée au store
actions.addIdea(newIdea);

// Le composant affiche l'idée via les selectors
const ideas = getAllIdeas(); // Contient les idées mockées + l'idée créée
```

### 3. Pendant l'Utilisation - Chargement de Relations

```typescript
// Hook charge les relations d'une idée (par ex. lineage/versions)
loadIdeaTabData: async (ideaId: string, tabType: 'versions') => {
  // 1. APPELER L'API pour obtenir les données (depuis données mockées)
  const { fetchLineage } = await import('../api/lineageService');
  const lineageData = await fetchLineage(ideaId, 'idea');
  
  // 2. AJOUTER toutes les entités au store
  lineageData.parents.forEach(parent => {
    if (parent.type === 'idea') {
      actions.addIdea(convertToIdea(parent));
    } else if (parent.type === 'post') {
      actions.addPost(convertToPost(parent));
    }
  });
  
  // 3. RÉCUPÉRER depuis le store pour construire le résultat
  const currentIdea = boundSelectors.getIdeaById(ideaId);
  const parents = lineageData.parents.map(p => 
    boundSelectors.getIdeaById(p.id) || boundSelectors.getPostById(p.id)
  );
  
  return { currentItem: currentIdea, parents, children: [...] };
}
```

**Pattern en 3 étapes :**
1. **Appeler l'API** (retourne données mockées)
2. **Ajouter au store** via `actions.addIdea()`, `actions.addPost()`, etc.
3. **Lire depuis le store** via `boundSelectors` pour obtenir TOUTES les données (mockées + dynamiques)

### 4. Affichage

```typescript
// Le composant utilise UNIQUEMENT les selectors
const { getAllIdeas, getIdeaById } = useEntityStoreSimple();

const ideas = getAllIdeas(); // Toutes les idées (mockées + dynamiques)
const idea = getIdeaById(ideaId); // N'importe quelle idée (mockée ou dynamique)
```

## Points Clés

1. **Une seule source de vérité** : Le store contient TOUTES les données
2. **Un seul point d'entrée** : `useEntityStoreSimple()` pour tous les composants
3. **Un seul chargement** : `loadInitialData()` appelé UNE FOIS au démarrage
4. **Zéro accès direct** : Les hooks/composants ne touchent JAMAIS à `dataService` ou `/data`
5. **Données normalisées** : Stockées par ID (`Record<string, Entity>`)
6. **Pas de duplication** : Les objets imbriqués sont remplacés par des tableaux d'IDs

## Exemple Complet

### ❌ Mauvaise Architecture (Ancienne)

```typescript
// Hook
const loadIdea = async (ideaId: string) => {
  const { getIdeaById } = await import('../api/dataService');
  const idea = await getIdeaById(ideaId); // ❌ Cherche dans les données mockées
  
  if (idea) {
    actions.addIdea(idea);
  }
}

// Problème : Si l'idée a été créée dynamiquement, elle n'est PAS dans dataService !
```

### ✅ Bonne Architecture (Actuelle)

```typescript
// Hook
const loadIdea = async (ideaId: string) => {
  // L'idée est déjà dans le store (chargée au démarrage ou créée dynamiquement)
  const idea = boundSelectors.getIdeaById(ideaId); // ✅ Cherche dans le store
  
  if (!idea) {
    console.error('Idée non trouvée:', ideaId);
  }
  
  return idea;
}

// Avantage : Trouve TOUTES les idées (mockées + dynamiques)
```

## Migration vers API Réelle

Quand vous passerez à une vraie API, seuls les fichiers `/api/*.ts` devront changer :

```typescript
// Avant (mocké)
export async function fetchIdeaDetails(ideaId: string) {
  const data = await loadMockDataSet();
  return data.ideas.find(i => i.id === ideaId);
}

// Après (vraie API)
export async function fetchIdeaDetails(ideaId: string) {
  const response = await fetch(`${API_URL}/ideas/${ideaId}`);
  return await response.json();
}
```

Les hooks et composants n'ont **aucune modification à faire** !

## Résumé en 3 Points

1. **Chargement initial** : `loadInitialData()` appelée UNE FOIS
2. **Lecture** : TOUJOURS via selectors (`getIdeaById`, `getAllIdeas`, etc.)
3. **Modification** : TOUJOURS via actions (`addIdea`, `updateIdea`, etc.)

**Ne JAMAIS accéder directement à `dataService` ou `/data` depuis les hooks ou composants !**
