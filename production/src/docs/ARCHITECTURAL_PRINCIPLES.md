# Principes Architecturaux - IdeoSphere

## 🏛️ Architecture Store-Centrée

### Principe Fondamental

**Le store est la source de vérité unique. Toutes les données passent par le store.**

```
Données Mockées → API Services → Store → Selectors → Composants
      ↑                                      ↑
      └──────────── UNE FOIS ────────────────┘
```

## 🔑 Règles d'Or

### 1. Chargement Initial Unique

**UNE SEULE fonction** charge les données mockées, **UNE SEULE fois** au démarrage :

```typescript
// /hooks/apiActions.ts
loadInitialData: async () => {
  const { loadMockDataSet } = await import('../api/dataService');
  const mockData = await loadMockDataSet();
  
  actions.initializeStore({
    users: [...mockData.users],
    ideas: [...mockData.ideas],
    posts: [...mockData.posts],
    // ...
  });
}
```

**Appelée dans `/hooks/useEntityStoreSimple.ts` :**

```typescript
useEffect(() => {
  if (isStoreEmpty && !storeInitialized) {
    apiActions.loadInitialData();
  }
}, []);
```

### 2. Pattern en 3 Étapes (Obligatoire)

**TOUTE fonction** qui appelle un service API DOIT suivre ce pattern :

```typescript
async function loadSomething(id: string) {
  // 1️⃣ APPELER L'API (retourne données mockées)
  const apiData = await fetchSomething(id);
  
  // 2️⃣ AJOUTER AU STORE (fusion avec données dynamiques)
  actions.addSomething(apiData);
  
  // 3️⃣ LIRE DEPUIS LE STORE (trouve mockées + dynamiques)
  const dataFromStore = boundSelectors.getSomethingById(id);
  
  return dataFromStore; // ← TOUJOURS retourner depuis le store
}
```

### 3. Zéro Accès Direct aux Données

**INTERDIT** dans les hooks et composants :

```typescript
// ❌ INTERDIT
import { mockIdeas } from '../data/ideas';
import { getIdeaById } from '../api/dataService';

const idea = await getIdeaById(ideaId);
const ideas = mockIdeas.filter(...);
```

**AUTORISÉ** uniquement :

```typescript
// ✅ AUTORISÉ dans les hooks
const idea = boundSelectors.getIdeaById(ideaId);

// ✅ AUTORISÉ dans les composants
const { getIdeaById } = useEntityStoreSimple();
const idea = getIdeaById(ideaId);
```

### 4. Pas de Création Sans API

**INTERDIT** de créer/modifier des données sans passer par un service API :

```typescript
// ❌ INTERDIT
const newIdea = {
  id: `idea-${Date.now()}`,
  title: payload.title,
  // ...
};
actions.addIdea(newIdea); // Création directe sans API
```

**AUTORISÉ** :

```typescript
// ✅ AUTORISÉ
const { createIdeaOnApi } = await import('../api/contentService');
const newIdea = await createIdeaOnApi(payload); // 1. API
actions.addIdea(newIdea);                       // 2. Store
const idea = boundSelectors.getIdeaById(newIdea.id); // 3. Relecture
```

**Exception** : Cas temporaires spécifiques (invités temporaires, visiteurs) qui ne persistent pas.

### 5. Toujours Lire Depuis le Store

Même après avoir ajouté des données au store, **toujours les relire** :

```typescript
// ❌ INCORRECT
const newIdea = await createIdeaOnApi(payload);
actions.addIdea(newIdea);
return newIdea; // Retourne depuis l'API

// ✅ CORRECT
const newIdea = await createIdeaOnApi(payload);
actions.addIdea(newIdea);
const ideaFromStore = boundSelectors.getIdeaById(newIdea.id);
return ideaFromStore; // Retourne depuis le store
```

**Pourquoi ?** Le store peut avoir enrichi/fusionné les données.

## 📁 Organisation des Fichiers

### `/data` - Données Mockées (Lecture Seule)

```typescript
// ❌ INTERDIT d'importer directement dans les hooks/composants
export const mockIdeas: Idea[] = [...];
```

**Rôle** : Données initiales chargées UNE fois au démarrage.

### `/api` - Services API (Simulent Backend)

```typescript
// ✅ AUTORISÉ d'importer dans les hooks
export async function fetchIdeaDetails(ideaId: string): Promise<Idea | null> {
  const { loadMockDataSet } = await import('./dataService');
  const data = await loadMockDataSet();
  return data.ideas.find(i => i.id === ideaId) || null;
}
```

**Rôle** : Simulent des appels API. Retournent les données mockées.

**Point Clé** : Les services API ne connaissent QUE les données mockées !

### `/store` - Store Global (Source de Vérité)

```typescript
// État normalisé par ID
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
// ✅ Pattern correct
export function createApiActions(store, actions, boundSelectors) {
  return {
    publishIdea: async (payload) => {
      // 1. API
      const newIdea = await createIdeaOnApi(payload);
      // 2. Store
      actions.addIdea(newIdea);
      // 3. Relecture
      return boundSelectors.getIdeaById(newIdea.id);
    }
  };
}
```

**Rôle** : Orchestrent les appels API et le store.

**Modules** :
- `apiActions.ts` - Appels API et chargement de données
- `navigationActions.ts` - Navigation et chargement de pages
- `contentActions.ts` - Interactions utilisateur (likes, support, etc.)
- `userActions.ts` - Gestion des utilisateurs

### `/components` - Composants React

```typescript
// ✅ UNIQUEMENT via useEntityStoreSimple
function MyComponent() {
  const { getIdeaById, publishIdea } = useEntityStoreSimple();
  
  const idea = getIdeaById(ideaId);
  
  const handlePublish = async () => {
    await publishIdea(payload);
  };
}
```

**Rôle** : Affichage et interactions utilisateur.

**Règle** : JAMAIS d'import direct de `/data` ou `/api`.

## 🔄 Flux de Données Complet

### Démarrage de l'Application

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

### Création d'une Entité (Idée)

```
1. Utilisateur clique "Publier"
   ↓
2. Composant appelle actions.publishIdea(payload)
   ↓
3. Hook apiActions.publishIdea:
   │
   ├─ 1. createIdeaOnApi(payload)         ← API
   │     └─ Retourne newIdea
   │
   ├─ 2. actions.addIdea(newIdea)         ← Store
   │     └─ newIdea ajoutée au store
   │
   └─ 3. boundSelectors.getIdeaById(id)   ← Relecture
         └─ Retourne idée depuis store
   ↓
4. Composant reçoit idée depuis store
   ↓
5. Affichage mis à jour
```

### Chargement de Relations (Lineage)

```
1. Utilisateur ouvre l'onglet "Versions"
   ↓
2. Composant appelle actions.loadIdeaTabData(ideaId, 'versions')
   ↓
3. Hook apiActions.loadIdeaTabData:
   │
   ├─ 1. fetchLineage(ideaId, 'idea')           ← API
   │     └─ Retourne { parents: [...], children: [...] }
   │
   ├─ 2. Ajouter toutes les entités au store    ← Store
   │     ├─ parents.forEach(p => actions.addIdea(p))
   │     └─ children.forEach(c => actions.addIdea(c))
   │
   └─ 3. Lire depuis le store                   ← Relecture
         ├─ parentIds.map(id => getIdeaById(id))
         └─ childIds.map(id => getIdeaById(id))
   ↓
4. Composant reçoit TOUTES les entités (mockées + dynamiques)
   ↓
5. Affichage complet du lineage
```

## 🎯 Avantages de Cette Architecture

### 1. Cohérence

Toutes les fonctions suivent le même pattern. Code prévisible.

### 2. Fiabilité

Le store contient TOUTES les données. Aucune entité perdue.

```typescript
// ✅ Trouve TOUJOURS l'idée
const idea = getIdeaById('idea-created-by-user');
// → Trouve mockées ET dynamiques
```

### 3. Maintenabilité

Pattern uniforme = facile à comprendre et déboguer.

### 4. Testabilité

Le store peut être mocké facilement. Les selectors sont purs.

### 5. Migration Facile

Pour passer à une vraie API, il suffit de changer `/api/*.ts` :

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

**Les hooks et composants ne changent PAS !**

## 🚨 Pièges à Éviter

### Piège 1 : Retourner Directement depuis l'API

```typescript
// ❌ PIÈGE
const data = await fetchSomething(id);
return data; // Retourne QUE les données mockées
```

**Solution** : Toujours relire depuis le store.

### Piège 2 : Créer sans API

```typescript
// ❌ PIÈGE
const newEntity = { id: Date.now(), ... };
actions.addEntity(newEntity); // Création directe
```

**Solution** : Passer par un service API.

### Piège 3 : Accès Direct aux Données Mockées

```typescript
// ❌ PIÈGE
import { mockIdeas } from '../data/ideas';
const ideas = mockIdeas.filter(...);
```

**Solution** : Utiliser les selectors.

### Piège 4 : Oublier d'Ajouter au Store

```typescript
// ❌ PIÈGE
const data = await fetchSomething(id);
// Oubli d'ajouter au store
return data;
```

**Solution** : Toujours suivre le pattern en 3 étapes.

## ✅ Checklist de Révision

Quand vous créez/modifiez une fonction :

- [ ] Utilise-t-elle un service API ? → Appliquer le pattern en 3 étapes
- [ ] Crée-t-elle des données ? → Passer par un service API
- [ ] Lit-elle des données ? → Utiliser `boundSelectors`
- [ ] Retourne-t-elle des données ? → Lire depuis le store
- [ ] Ajoute-t-elle des logs de confirmation ? → `console.log('✅ ...')`
- [ ] Gère-t-elle les cas d'erreur ? → Vérifier `null`/`undefined`

## 📚 Documentation Complète

- `/ARCHITECTURE.md` - Vue d'ensemble de l'architecture
- `/docs/DATA_FLOW.md` - Flux de données détaillé avec diagrammes
- `/docs/API_CALLS_PATTERN.md` - Guide complet du pattern en 3 étapes
- `/docs/CORRECTIONS_APPLIED.md` - Liste des corrections appliquées
- `/docs/ARCHITECTURAL_PRINCIPLES.md` - Ce document
- `/hooks/README.md` - Documentation des hooks
- `/api/README.md` - Documentation des services API

## 🎓 Résumé en 5 Points

1. **Chargement unique** : `loadInitialData()` UNE fois au démarrage
2. **Pattern en 3 étapes** : API → Store → Selectors (OBLIGATOIRE)
3. **Store = vérité** : Contient mockées + dynamiques
4. **Zéro accès direct** : Jamais d'import de `/data` dans hooks/composants
5. **Pas de création sans API** : Toujours passer par un service API

**L'architecture est maintenant propre, cohérente et prête pour la production !**
