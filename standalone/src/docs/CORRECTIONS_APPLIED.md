# Corrections Appliquées - Pattern en 3 Étapes

## Résumé des Corrections

Toutes les fonctions des hooks ont été corrigées pour suivre strictement le **pattern en 3 étapes** :

```typescript
// 1️⃣ APPELER L'API (retourne données mockées)
const apiData = await fetchSomething(id);

// 2️⃣ AJOUTER AU STORE (fusion avec données dynamiques)
actions.addSomething(apiData);

// 3️⃣ LIRE DEPUIS LE STORE (trouve mockées + dynamiques)
const dataFromStore = boundSelectors.getSomethingById(id);
return dataFromStore; // ← TOUJOURS retourner depuis le store !
```

## ✅ Fonctions Corrigées

### `/hooks/navigationActions.ts`

#### `goToIdea()`

**Avant** :
```typescript
const ideaDetails = await fetchIdeaDetails(ideaId);
actions.addIdea(ideaDetails);
// ❌ Pas de relecture depuis le store
```

**Après** :
```typescript
// 1. APPELER L'API
const apiIdeaDetails = await fetchIdeaDetails(ideaId);

// 2. AJOUTER AU STORE
actions.addIdea(apiIdeaDetails);

// 3. LIRE DEPUIS LE STORE
const ideaFromStore = boundSelectors.getIdeaById(ideaId);
console.log(`✅ Chargé idée "${ideaFromStore.title}" depuis le store`);
```

#### `goToPost()`

**Avant** :
```typescript
const postDetails = await fetchPostDetails(postId);
actions.addPost(postDetails);
// ❌ Pas de relecture depuis le store
```

**Après** :
```typescript
// 1. APPELER L'API
const apiPostDetails = await fetchPostDetails(postId);

// 2. AJOUTER AU STORE
actions.addPost(apiPostDetails);

// 3. LIRE DEPUIS LE STORE
const postFromStore = boundSelectors.getPostById(postId);
console.log(`✅ Chargé post depuis le store`);
```

### `/hooks/apiActions.ts`

#### `fetchFeed()`

**Avant** :
```typescript
const feedData = await fetchFeed(userId);
feedData.ideas.forEach(idea => actions.addIdea(idea));
feedData.posts.forEach(post => actions.addPost(post));

return {
  posts: feedData.posts, // ❌ Retourne données mockées
  ideas: feedData.ideas  // ❌ Retourne données mockées
};
```

**Après** :
```typescript
// 1. APPELER L'API
const apiFeedData = await fetchFeed(userId);

// 2. AJOUTER AU STORE
apiFeedData.ideas.forEach(idea => {
  actions.addIdea(transformIdeaCardToIdea(idea));
  feedIdeaIds.push(idea.id);
});

apiFeedData.posts.forEach(post => {
  actions.addPost(transformPostCardToPost(post));
  feedPostIds.push(post.id);
});

// 3. LIRE DEPUIS LE STORE
const ideasFromStore = feedIdeaIds.map(id => 
  boundSelectors.getIdeaById(id)
).filter(Boolean);

const postsFromStore = feedPostIds.map(id => 
  boundSelectors.getPostById(id)
).filter(Boolean);

return {
  posts: postsFromStore, // ✅ Retourne depuis le store
  ideas: ideasFromStore  // ✅ Retourne depuis le store
};
```

#### `fetchMyContributions()`

**Avant** :
```typescript
const contributionsData = await fetchUserContributionsFromApi(currentUser.id);

contributionsData.participationIdeas.forEach(idea => {
  actions.addIdea(idea);
});

return contributionsData; // ❌ Retourne données mockées
```

**Après** :
```typescript
// 1. APPELER L'API
const apiContributionsData = await fetchUserContributionsFromApi(currentUser.id);

// 2. AJOUTER AU STORE
const allIdeaIds = [];
apiContributionsData.participationIdeas.forEach(idea => {
  actions.addIdea(idea);
  allIdeaIds.push(idea.id);
});

// 3. LIRE DEPUIS LE STORE
const participationIdeas = allIdeaIds
  .map(id => boundSelectors.getIdeaById(id))
  .filter(Boolean)
  .filter(idea => idea.creators?.some(c => c.id === currentUser.id));

return {
  participationIdeas, // ✅ Retourne depuis le store
  supportIdeas,       // ✅ Retourne depuis le store
  participationPosts, // ✅ Retourne depuis le store
  supportPosts        // ✅ Retourne depuis le store
};
```

#### `fetchMyProfile()`

**Avant** :
```typescript
const fullProfile = await fetchUserProfileFromApi(currentUser.id);
if (fullProfile) {
  actions.updateUser(currentUser.id, fullProfile);
}

return currentUser; // ❌ Retourne l'ancien utilisateur
```

**Après** :
```typescript
// 1. APPELER L'API
const apiFullProfile = await fetchUserProfileFromApi(currentUser.id);

// 2. AJOUTER/METTRE À JOUR dans le store
if (apiFullProfile) {
  actions.updateUser(currentUser.id, apiFullProfile);
}

// 3. LIRE DEPUIS LE STORE
const userFromStore = boundSelectors.getUserById(currentUser.id);
console.log(`✅ Chargé profil de ${userFromStore.name} depuis le store`);

return userFromStore; // ✅ Retourne depuis le store
```

#### `publishIdea()`

**Avant** :
```typescript
const newIdea = await createIdeaOnApi({...});
actions.addIdea(newIdea);

return newIdea; // ❌ Retourne directement depuis l'API
```

**Après** :
```typescript
// 1. APPELER L'API (création)
const newIdea = await createIdeaOnApi({...});

// 2. AJOUTER AU STORE
actions.addIdea(newIdea);

// 3. LIRE DEPUIS LE STORE
const ideaFromStore = boundSelectors.getIdeaById(newIdea.id);
console.log(`✅ Idée "${ideaFromStore.title}" créée et ajoutée au store`);

return ideaFromStore; // ✅ Retourne depuis le store
```

#### `publishPost()`

**Avant** :
```typescript
const newPost = await createPostOnApi({...});
actions.addPost(newPost);

return newPost; // ❌ Retourne directement depuis l'API
```

**Après** :
```typescript
// 1. APPELER L'API (création)
const newPost = await createPostOnApi({...});

// 2. AJOUTER AU STORE
actions.addPost(newPost);

// 3. LIRE DEPUIS LE STORE
const postFromStore = boundSelectors.getPostById(newPost.id);
console.log(`✅ Post créé et ajouté au store`);

return postFromStore; // ✅ Retourne depuis le store
```

#### `loadIdeaTabData('versions')` - Bug Fix

**Problème** :
```typescript
// ❌ Variables non définies
...sourceIdeaIds.map(id => {...})
// ReferenceError: sourceIdeaIds is not defined
```

**Après** :
```typescript
// 1. APPELER L'API
const lineageData = await fetchLineage(ideaId, 'idea');

// 2. AJOUTER AU STORE
lineageData.parents.forEach(parent => {
  if (parent.type === 'idea') {
    actions.addIdea(convertToIdea(parent));
  } else {
    actions.addPost(convertToPost(parent));
  }
});

lineageData.children.forEach(child => {
  if (child.type === 'idea') {
    actions.addIdea(convertToIdea(child));
  }
});

// 3. LIRE DEPUIS LE STORE et construire le résultat
const parentsFromStore = lineageData.parents.map(parent => {
  if (parent.type === 'idea') {
    const idea = boundSelectors.getIdeaById(parent.id);
    return idea ? convertToLineageItem(idea) : null;
  } else {
    const post = boundSelectors.getPostById(parent.id);
    return post ? convertToLineageItem(post) : null;
  }
}).filter(Boolean);

// 4. RETOURNER depuis le store
return {
  currentItem: {...},
  parents: parentsFromStore, // ✅ Depuis le store
  children: childrenFromStore // ✅ Depuis le store
};
```

## 🎯 Pourquoi Ces Corrections ?

### Problème

Les services API (`/api/*.ts`) ne connaissent QUE les données mockées. Ils ne trouvent PAS les entités créées dynamiquement !

```typescript
// ❌ PROBLÈME
const idea = await fetchIdea('idea-created-by-user');
// → null (car pas dans /data/ideas.ts)

// ❌ PROBLÈME
return apiData; // Retourne QUE les données mockées
```

### Solution

En lisant depuis le store après l'ajout, on obtient TOUTES les données (mockées + dynamiques) :

```typescript
// ✅ SOLUTION
const apiIdea = await fetchIdea(ideaId);        // 1. API (mockées)
actions.addIdea(apiIdea);                       // 2. Store (fusion)
const idea = boundSelectors.getIdeaById(ideaId); // 3. Store (mockées + dynamiques)
return idea; // ← Trouve TOUT !
```

## 📋 Checklist de Vérification

Pour chaque fonction qui appelle un service API :

- [x] 1. Appelle le service API
- [x] 2. Vérifie le résultat (null check)
- [x] 3. Ajoute TOUTES les entités au store via `actions.addXxx()`
- [x] 4. Relit depuis le store via `boundSelectors.getXxxById()`
- [x] 5. Retourne les données du store (pas celles de l'API)
- [x] 6. Logs de confirmation avec ✅

## 🚀 Impact

Maintenant, **TOUTES** les fonctions suivent le même pattern :

1. **Cohérence** : Pattern uniforme dans toute la codebase
2. **Fiabilité** : Trouve toujours les entités (mockées + dynamiques)
3. **Maintenabilité** : Code prévisible et facile à déboguer
4. **Migration** : Prêt pour une vraie API (il suffira de changer les services API)

## ✅ Résultat Final

```
┌─────────────────────────────────────────────────────────────┐
│                 PATTERN EN 3 ÉTAPES                          │
└─────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ↓                               ↓
    /hooks/apiActions.ts      /hooks/navigationActions.ts
          │                               │
          ├─ fetchFeed ✅                ├─ goToIdea ✅
          ├─ fetchMyContributions ✅     ├─ goToPost ✅
          ├─ fetchMyProfile ✅           └─ goToUser ✅
          ├─ publishIdea ✅
          ├─ publishPost ✅
          ├─ loadIdeaTabData ✅
          ├─ loadDiscussions ✅
          └─ loadIdeaRatings ✅
          
                          │
                          ↓
              ┌───────────────────────┐
              │  STORE (vérité unique) │
              │  mockées + dynamiques  │
              └───────────────────────┘
```

**Toutes les fonctions respectent maintenant le pattern en 3 étapes !**
