# Cache Dynamique - Système de persistance en mémoire

## 🎯 Problème résolu

### Symptôme
```
❌ Idée idea-1762188246761-4dng99ysd non trouvée
```

Lorsqu'un utilisateur créait une nouvelle idée ou un nouveau post :
1. L'idée/post était créé par `createIdeaOnApi()` 
2. L'idée/post était ajouté au store via `actions.addIdea(newIdea)`
3. L'utilisateur était redirigé vers la page de détails
4. Le wrapper de la page appelait `fetchIdeaDetails(ideaId)`
5. Cette fonction appelait `getIdeaById(ideaId)` qui cherchait UNIQUEMENT dans les données mockées
6. **L'idée n'était pas trouvée** car elle n'existait que dans le store, pas dans les données mockées

### Pourquoi ce problème ?

Les données mockées sont des fichiers statiques (`/data/ideas.ts`, `/data/posts.ts`, etc.) qui sont chargés au démarrage de l'application. Les contenus créés dynamiquement pendant la session n'y sont jamais ajoutés.

**Avant** :
```typescript
// Dans dataService.ts
export async function getIdeaById(ideaId: string): Promise<Idea | null> {
  const data = await loadMockDataSet(); // Charge les fichiers statiques
  return data.ideas.find(idea => idea.id === ideaId) || null;
  // ❌ Les idées créées dynamiquement ne sont pas trouvées !
}
```

## ✅ Solution : Cache dynamique en mémoire

### Principe

Ajouter un cache en mémoire qui stocke les contenus créés pendant la session, séparément des données mockées.

```typescript
// Cache en mémoire (vit pendant toute la session)
const dynamicIdeasCache: Map<string, Idea> = new Map();
const dynamicPostsCache: Map<string, Post> = new Map();
const dynamicUsersCache: Map<string, User> = new Map();
```

### Flux de données

```
┌─────────────────────────────────────────────────────────────┐
│                    Création de contenu                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
                   ┌──────────────────────┐
                   │  createIdeaOnApi()   │
                   │  createPostOnApi()   │
                   └──────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ↓                           ↓
    ┌──────────────────────┐    ┌──────────────────────┐
    │  Cache dynamique     │    │  Store (Zustand)     │
    │  (pour les APIs)     │    │  (pour l'UI)         │
    └──────────────────────┘    └──────────────────────┘
                ↑                           ↑
                │                           │
    ┌──────────────────────┐    ┌──────────────────────┐
    │  getIdeaById()       │    │  getIdeaById()       │
    │  (cherche d'abord    │    │  (depuis selector)   │
    │   dans le cache)     │    │                      │
    └──────────────────────┘    └──────────────────────┘
```

## 🔧 Implémentation

### 1. Ajout du cache en mémoire (`/api/dataService.ts`)

```typescript
// Cache pour les contenus créés dynamiquement
const dynamicIdeasCache: Map<string, Idea> = new Map();
const dynamicPostsCache: Map<string, Post> = new Map();
const dynamicUsersCache: Map<string, User> = new Map();

// Fonctions pour ajouter au cache
export function addDynamicIdea(idea: Idea): void {
  dynamicIdeasCache.set(idea.id, idea);
}

export function addDynamicPost(post: Post): void {
  dynamicPostsCache.set(post.id, post);
}

export function addDynamicUser(user: User): void {
  dynamicUsersCache.set(user.id, user);
}
```

### 2. Recherche prioritaire dans le cache (`/api/dataService.ts`)

```typescript
export async function getIdeaById(ideaId: string): Promise<Idea | null> {
  // ✅ Vérifier d'abord dans le cache dynamique
  if (dynamicIdeasCache.has(ideaId)) {
    return dynamicIdeasCache.get(ideaId) || null;
  }
  
  // Sinon chercher dans les données mockées
  const data = await loadMockDataSet();
  return data.ideas.find(idea => idea.id === ideaId) || null;
}
```

### 3. Ajout automatique au cache lors de la création (`/api/contentService.ts`)

```typescript
export async function createIdeaOnApi(payload: {...}): Promise<Idea> {
  // ... création de l'idée ...
  
  const newIdea: Idea = {
    id: `idea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    // ... autres champs ...
  };
  
  // ✅ Ajouter au cache dynamique
  addDynamicIdea(newIdea);
  
  return newIdea;
}
```

## 📊 Double stockage

Les contenus créés sont maintenant stockés à **deux endroits** :

### Cache dynamique (dataService)
- **Objectif** : Permettre aux fonctions API de retrouver les contenus créés
- **Durée de vie** : Pendant toute la session (jusqu'au refresh de la page)
- **Accès** : Via `getIdeaById()`, `getPostById()`, `getUserById()`
- **Utilisé par** : `fetchIdeaDetails()`, `fetchPostDetails()`, etc.

### Store Zustand (SimpleEntityStore)
- **Objectif** : Source de vérité pour l'UI
- **Durée de vie** : Pendant toute la session (jusqu'au refresh de la page)
- **Accès** : Via `getIdeaById()` (selector), `getCurrentUser()`, etc.
- **Utilisé par** : Tous les composants React

## 🔄 Flux complet : Création → Affichage

```
1. Utilisateur remplit le formulaire
   ↓
2. actions.publishIdea(payload)
   ↓
3. createIdeaOnApi(payload)
   → Crée newIdea
   → addDynamicIdea(newIdea)     ✅ Cache dynamique
   → return newIdea
   ↓
4. actions.addIdea(newIdea)       ✅ Store Zustand
   ↓
5. navigate(`/idea/${newIdea.id}`)
   ↓
6. IdeaDetailPageWrapper monte
   → useEffect déclenché
   ↓
7. fetchIdeaDetails(ideaId)
   → getIdeaById(ideaId)
   → ✅ Trouve dans dynamicIdeasCache
   → return { idea, users }
   ↓
8. actions.addIdea(idea)          ✅ Re-sync le store
   ↓
9. Composant affiche l'idée
```

## 🎁 Bénéfices

### ✅ Cohérence
Les fonctions API peuvent maintenant retrouver les contenus qu'elles ont créées

### ✅ Simplicité
Pas besoin de modifier tous les wrappers pour gérer un cas spécial "contenu nouvellement créé"

### ✅ Réalisme
Simule mieux le comportement d'une vraie API qui persiste les données

### ✅ Évolutivité
Facilite la transition vers une vraie API :
- Le cache dynamique sera remplacé par une vraie base de données
- Les fonctions `getById()` feront de vraies requêtes HTTP
- La logique métier reste la même

## ⚠️ Limitations

### Durée de vie limitée
Le cache est en mémoire et disparaît au refresh de la page. C'est normal pour un prototype.

**En production** : Les contenus seraient persistés dans une vraie base de données.

### Pas de synchronisation entre onglets
Si l'utilisateur ouvre deux onglets, les caches seront indépendants.

**En production** : Une vraie API + base de données résoudrait ce problème.

### Pas de limite de taille
Le cache peut grandir indéfiniment pendant la session.

**En production** : Géré par la base de données côté serveur.

## 🔮 Évolution future

### Vers une vraie API

Le jour où on remplace les données mockées par une vraie API :

```typescript
// Avant (avec cache dynamique)
export async function getIdeaById(ideaId: string): Promise<Idea | null> {
  if (dynamicIdeasCache.has(ideaId)) {
    return dynamicIdeasCache.get(ideaId) || null;
  }
  const data = await loadMockDataSet();
  return data.ideas.find(idea => idea.id === ideaId) || null;
}

// Après (avec vraie API)
export async function getIdeaById(ideaId: string): Promise<Idea | null> {
  const response = await fetch(`/api/ideas/${ideaId}`);
  if (!response.ok) return null;
  return response.json();
}
```

### Avec persistance locale (optionnel)

Pour améliorer l'expérience avant d'avoir une vraie API :

```typescript
// Sauvegarder dans localStorage
export function addDynamicIdea(idea: Idea): void {
  dynamicIdeasCache.set(idea.id, idea);
  
  // Optionnel : persister dans localStorage
  const cached = JSON.parse(localStorage.getItem('dynamic_ideas') || '[]');
  cached.push(idea);
  localStorage.setItem('dynamic_ideas', JSON.stringify(cached));
}

// Restaurer au démarrage
export function loadDynamicCache(): void {
  const cachedIdeas = JSON.parse(localStorage.getItem('dynamic_ideas') || '[]');
  cachedIdeas.forEach(idea => dynamicIdeasCache.set(idea.id, idea));
  // ... même chose pour posts et users
}
```

## 📝 Fichiers modifiés

- ✅ `/api/dataService.ts` - Ajout du cache + fonctions add/get
- ✅ `/api/contentService.ts` - Ajout au cache lors de la création
- ✅ `/api/README.md` - Documentation mise à jour
- ✅ `/types/index.ts` - Correction de `creatorIds` (déjà OK)

## 🎯 Résumé

**Problème** : Les idées créées n'étaient pas trouvées par `fetchIdeaDetails()`

**Cause** : `getIdeaById()` cherchait uniquement dans les données mockées statiques

**Solution** : Cache dynamique en mémoire pour les contenus créés pendant la session

**Résultat** : ✅ Les idées/posts créés sont maintenant accessibles via les fonctions API

---

**Date de création** : 2 novembre 2025  
**Version** : 1.0
