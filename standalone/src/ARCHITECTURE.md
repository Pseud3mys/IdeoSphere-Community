# Architecture IdeoSphere

## Vue d'Ensemble

IdeoSphere utilise une **architecture store-centrée** où toutes les données passent par un store global unique (SimpleEntityStore). Les composants interagissent avec le store via le hook `useEntityStoreSimple`.

```
Composants → useEntityStoreSimple → Actions → Services API → Données mockées
                ↑                                                    ↓
                └──────────────── STORE (source de vérité) ─────────┘
```

## Principes Clés

### 1. Store = Source de Vérité Unique

Le store contient **TOUTES** les données (mockées + créées dynamiquement) :

```typescript
interface SimpleEntityStore {
  // Données normalisées par ID
  users: Record<string, User>;
  ideas: Record<string, Idea>;
  posts: Record<string, Post>;
  discussionTopics: Record<string, DiscussionTopic>;
  communities: Record<string, Community>;
  communityMemberships: Record<string, CommunityMembership>;
  
  // États UI (Phase 6: navigation supprimée - voir React Router)
  currentUserId: string | null;
  hasEnteredPlatform: boolean;
  showOnboarding: boolean;
  // ...
}
```

**Pourquoi Record<string, Entity> ?**
- Accès O(1) par ID : `store.ideas[ideaId]`
- Pas de doublons
- Fusion facile des données mockées + dynamiques

### 2. Pattern en 3 Étapes (Obligatoire)

**Toute fonction** qui appelle un service API doit suivre ce pattern :

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
  return completeData; // ← TOUJOURS retourner depuis le store
}
```

**Pourquoi ?** Les services API ne connaissent que les données mockées. Les entités créées dynamiquement existent uniquement dans le store.

### 3. storeUpdater pour Mutations Optimistes

Pour les modifications du store, utiliser `storeUpdater` pour éviter les stale closures :

```typescript
toggleIdeaSupport: async (ideaId: string) => {
  storeUpdater(prevStore => {
    // ✅ Lire l'état FRAIS depuis prevStore
    const idea = selectors.getIdeaById(prevStore)(ideaId);
    const currentUser = selectors.getCurrentUser(prevStore);
    
    if (!idea || !currentUser) return {};
    
    // Calculer le nouvel état
    const isSupporting = idea.supporters.includes(currentUser.id);
    const newSupporters = isSupporting
      ? idea.supporters.filter(id => id !== currentUser.id)
      : [...idea.supporters, currentUser.id];
    
    // Appel API en arrière-plan (ne pas attendre)
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

### 4. Zéro Accès Direct aux Données

**Interdit** dans hooks et composants :

```typescript
// ❌ INTERDIT
import { mockIdeas } from '../data/ideas';
import { getIdeaById } from '../api/dataService';
```

**Autorisé** uniquement :

```typescript
// ✅ Dans les hooks
const idea = boundSelectors.getIdeaById(ideaId);

// ✅ Dans les composants
const { getIdeaById } = useEntityStoreSimple();
const idea = getIdeaById(ideaId);
```

**Exception** : Les services API (`/api/*.ts`) peuvent accéder à `dataService`.

## Organisation des Fichiers

### `/data` - Données Mockées (Lecture Seule)

```typescript
export const mockIdeas: Idea[] = [...];
export const mockPosts: Post[] = [...];
export const mockUsers: User[] = [...];
```

**Rôle** : Données initiales chargées UNE fois au démarrage via `loadInitialData()`.

### `/api` - Services API (Simulent Backend)

```typescript
export async function fetchIdeaDetails(ideaId: string): Promise<{ idea: Idea; users: User[] } | null> {
  const idea = await getIdeaById(ideaId);
  if (!idea) return null;
  
  // Récupérer les créateurs
  const users: User[] = [];
  if (idea.creatorIds) {
    for (const creatorId of idea.creatorIds) {
      const creator = await getUserById(creatorId);
      if (creator) users.push(creator);
    }
  }
  
  return { idea, users };
}
```

**Rôle** : Simulent des appels API. Retournent les données mockées.  
**Point clé** : Ne connaissent QUE les données mockées !

### `/store` - Store Global (Source de Vérité)

```typescript
interface SimpleEntityStore {
  users: Record<string, User>;
  ideas: Record<string, Idea>;
  posts: Record<string, Post>;
  // ...
}
```

**Rôle** : Contient TOUTES les données (mockées + dynamiques).

### `/hooks` - Logique Métier

```typescript
export function createApiActions(store, actions, boundSelectors, storeUpdater) {
  return {
    loadIdea: async (ideaId) => {
      // 1. API → 2. Store → 3. Relecture
    }
  };
}
```

**Rôle** : Orchestrent les appels API et le store.

**Modules** :
- `apiActions.ts` - Chargement de données
- `contentActions.ts` - Interactions (like, support, etc.)
- `navigationActions.ts` - Navigation et chargement de pages
- `userActions.ts` - Gestion utilisateurs

### `/components` - Composants React

```typescript
function MyComponent() {
  const { getIdeaById, actions } = useEntityStoreSimple();
  const idea = getIdeaById(ideaId);
  
  return <button onClick={() => actions.toggleIdeaSupport(ideaId)}>
    Soutenir
  </button>;
}
```

**Rôle** : Affichage et interactions utilisateur.  
**Règle** : JAMAIS d'import direct de `/data` ou `/api`.

## Flux de Données

### Démarrage

```
1. App démarre
   ↓
2. useEntityStoreSimple (useEffect)
   ↓
3. apiActions.loadInitialData()
   ↓
4. dataService.loadMockDataSet()
   ↓
5. actions.initializeStore({ users, ideas, posts, ... })
   ↓
6. STORE rempli avec données mockées
```

### Création d'Entité

```
1. Utilisateur clique "Publier"
   ↓
2. actions.publishIdea(payload)
   ↓
3. createIdeaOnApi(payload) → retourne newIdea
   ↓
4. actions.addIdea(newIdea)
   ↓
5. boundSelectors.getIdeaById(newIdea.id)
   ↓
6. Composant reçoit idée depuis store
```

### Chargement de Relations

```
1. loadIdeaTabData(ideaId, 'versions')
   ↓
2. fetchLineage(ideaId) → { parents: [...], children: [...] }
   ↓
3. Ajouter toutes les entités au store
   parents.forEach(p => actions.addIdea(p))
   children.forEach(c => actions.addIdea(c))
   ↓
4. Lire depuis le store
   parents.map(p => boundSelectors.getIdeaById(p.id))
   ↓
5. Retourner { currentItem, parents, children }
```

## Migration de Données

### État Actuel (Octobre 2025)

**Posts** : Migration terminée
- ✅ `Post.authorId: string` (ID simple)
- ✅ `PostReply.authorId: string`
- ✅ `DiscussionTopic.authorId: string`
- ✅ `DiscussionPost.authorId: string`

**Idées** : ✅ Migration terminée
- ✅ `Idea.creatorIds: string[]` (migration complétée)
- ✅ `Idea.supporters: string[]` (déjà IDs)

**Support unifié** : ✅ Terminé
- `toggleSupportOnApi(entityId, userId, entityType, isCurrentlySupporting)`
- Fonctionne pour idées ET posts

## Avantages

1. **Cohérence** : Pattern uniforme partout
2. **Fiabilité** : Le store trouve TOUTES les entités
3. **Maintenabilité** : Logique centralisée
4. **Testabilité** : Selectors purs, store mockable
5. **Migration facile** : Changer `/api` suffit pour passer à une vraie API

## Voir Aussi

- `/docs/API_CALLS_PATTERN.md` - Pattern en 3 étapes détaillé
- `/docs/DATA_FLOW.md` - Flux de données avec débogage
- `/hooks/README.md` - Documentation des hooks
- `/api/README.md` - Documentation des services API
- `/store/README.md` - Documentation du store
