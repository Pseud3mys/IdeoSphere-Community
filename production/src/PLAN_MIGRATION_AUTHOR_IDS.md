# Plan de Migration : Author/Creator Objects → IDs

## Contexte
Actuellement, les types utilisent des objets `User` complets pour les champs `author` et `creators`. L'objectif est de les transformer en simples IDs (strings) et de laisser le frontend aller chercher les informations utilisateur dans le store via les selectors.

## Avantages de cette migration
1. ✅ **Normalisation des données** : évite la duplication des objets User
2. ✅ **Cohérence** : aligne avec l'approche déjà utilisée pour `supporters` (qui sont des IDs)
3. ✅ **Performance** : réduit la taille des objets en mémoire
4. ✅ **Maintenabilité** : une seule source de vérité pour les données utilisateur
5. ✅ **Flexibilité** : facilite les mises à jour des données utilisateur (changement de nom, avatar, etc.)

---

## 📋 PHASE 1 : Modification des Types (/types/index.ts)

### Types à modifier :

#### 1.1. `DiscussionTopic` (ligne 33)
```typescript
// AVANT
export interface DiscussionTopic {
  author: User;
  // ...
}

// APRÈS
export interface DiscussionTopic {
  authorId: string;
  // ...
}
```

#### 1.2. `DiscussionPost` (ligne 47)
```typescript
// AVANT
export interface DiscussionPost {
  author: User;
  // ...
}

// APRÈS
export interface DiscussionPost {
  authorId: string;
  // ...
}
```

#### 1.3. `Discussion` (ligne 56)
```typescript
// AVANT
export interface Discussion {
  author: User;
  // ...
}

// APRÈS
export interface Discussion {
  authorId: string;
  // ...
}
```

#### 1.4. `PostReply` (ligne 64)
```typescript
// AVANT
export interface PostReply {
  author: User;
  // ...
}

// APRÈS
export interface PostReply {
  authorId: string;
  // ...
}
```

#### 1.5. `Post` (ligne 89)
```typescript
// AVANT
export interface Post {
  author: User;
  // ...
}

// APRÈS
export interface Post {
  authorId: string;
  // ...
}
```

#### 1.6. `Idea` (ligne 120)
```typescript
// AVANT
export interface Idea {
  creators: User[];
  supporters: User[];  // ⚠️ À vérifier
  // ...
}

// APRÈS
export interface Idea {
  creatorIds: string[];
  supporters: string[];  // ✅ Déjà correct comme Post
  // ...
}
```

#### 1.7. `PrefilledContent` (ligne 158)
```typescript
// DÉJÀ CORRECT ✅
export interface PrefilledContent {
  author: string;  // C'est déjà un ID
  // ...
}
```

---

## 📋 PHASE 2 : Modification des Données Mockées (/data/)

### Fichiers à modifier :

#### 2.1. `/data/posts.ts`
- Remplacer `author: users[X]` par `authorId: users[X].id`
- Remplacer dans `replies[]` : `author: users[X]` par `authorId: users[X].id`
- **Estimation** : ~50-60 occurrences

#### 2.2. `/data/ideas.ts`
- Remplacer `creators: [users[X], users[Y]]` par `creatorIds: [users[X].id, users[Y].id]`
- Vérifier que `supporters` est déjà en format ID (sinon convertir)
- **Estimation** : ~15-20 occurrences

#### 2.3. `/data/discussions.ts`
- Remplacer `author: users[X]` par `authorId: users[X].id`
- Dans les `posts[]` des DiscussionTopic : `author: users[X]` par `authorId: users[X].id`
- **Estimation** : ~30-40 occurrences

---

## 📋 PHASE 3 : Modification des Services API (/api/)

### Fichiers à modifier :

#### 3.1. `/api/contentService.ts`
- `fetchIdeaDetails()` : s'assurer que la transformation retourne `creatorIds` et non `creators`
- `fetchPostDetails()` : s'assurer que la transformation retourne `authorId` et non `author`
- **Actions** : Vérifier les transformations et mappings

#### 3.2. `/api/feedService.ts`
- `fetchFeed()` : vérifier que les Posts et Ideas retournées ont les bons champs (authorId, creatorIds)
- **Actions** : Vérifier les transformations

#### 3.3. `/api/detailsService.ts`
- `fetchDiscussions()` : transformer `author` en `authorId`
- **Actions** : Modifier les retours

#### 3.4. `/api/transformService.ts`
- Vérifier et adapter toutes les fonctions de transformation
- **Actions** : Revoir la logique de transformation

#### 3.5. `/api/authService.ts`
- Vérifier que la création de posts/idées utilise bien des IDs
- **Actions** : Vérifier les créations

---

## 📋 PHASE 4 : Modification du Store (/store/)

### Fichiers à modifier :

#### 4.1. `/store/SimpleEntityStore.tsx`
- **Ligne 158-161** : Supprimer la logique d'extraction des créateurs d'idée
```typescript
// SUPPRIMER CE BLOC (devenu inutile)
if (idea.creators && Array.isArray(idea.creators)) {
  idea.creators.forEach(creator => {
    if (creator && typeof creator === 'object' && 'id' in creator) {
      ensureUserInStore(creator as User);
    }
  });
}
```

#### 4.2. `/store/simpleSelectors.ts`
- **getUserPosts()** : Modifier pour utiliser `authorId` au lieu de `author.id`
```typescript
// AVANT
export const getUserPosts = (store: SimpleEntityStore) => (userId: string): Post[] => {
  return Object.values(store.posts).filter(post => post.author.id === userId);
};

// APRÈS
export const getUserPosts = (store: SimpleEntityStore) => (userId: string): Post[] => {
  return Object.values(store.posts).filter(post => post.authorId === userId);
};
```

- **getUserIdeas()** : Modifier pour utiliser `creatorIds`
```typescript
// AVANT
export const getUserIdeas = (store: SimpleEntityStore) => (userId: string): Idea[] => {
  return Object.values(store.ideas).filter(idea => 
    idea.creators.some(creator => creator.id === userId)
  );
};

// APRÈS
export const getUserIdeas = (store: SimpleEntityStore) => (userId: string): Idea[] => {
  return Object.values(store.ideas).filter(idea => 
    idea.creatorIds.includes(userId)
  );
};
```

---

## 📋 PHASE 5 : Création d'un Helper de Résolution (/utils/)

### 5.1. Créer `/utils/userResolvers.ts`
```typescript
import { SimpleEntityStore } from '../store/SimpleEntityStore';
import { User } from '../types';

/**
 * Résout un ID utilisateur en objet User depuis le store
 */
export function resolveUser(store: SimpleEntityStore, userId: string): User | null {
  return store.users[userId] || null;
}

/**
 * Résout plusieurs IDs utilisateurs en objets User
 */
export function resolveUsers(store: SimpleEntityStore, userIds: string[]): User[] {
  return userIds
    .map(id => store.users[id])
    .filter(user => user !== undefined);
}

/**
 * Hook pour résoudre un utilisateur
 */
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';

export function useResolveUser(userId: string | null | undefined): User | null {
  const { store } = useEntityStoreSimple();
  if (!userId) return null;
  return store.users[userId] || null;
}

/**
 * Hook pour résoudre plusieurs utilisateurs
 */
export function useResolveUsers(userIds: string[]): User[] {
  const { store } = useEntityStoreSimple();
  return userIds
    .map(id => store.users[id])
    .filter(user => user !== undefined);
}
```

---

## 📋 PHASE 6 : Modification des Composants (/components/)

### Stratégie générale :
Pour chaque composant, remplacer les accès directs aux objets User par des résolutions via le store.

### 6.1. Composants à modifier (liste partielle) :

#### Haute priorité (utilisent directement author/creators) :
1. **IdeaCard.tsx** - Affiche les créateurs d'idées
2. **PostCard.tsx** - Affiche l'auteur des posts
3. **IdeaDescriptionTab.tsx** - Affiche auteurs de questions/réponses
4. **IdeaDiscussionsTab.tsx** - Affiche auteurs de discussions
5. **PostDetailPage.tsx** - Affiche auteur du post et des réponses
6. **CreatorAvatar.tsx** - Affiche avatar des créateurs
7. **CreatorNames.tsx** - Affiche noms des créateurs

#### Exemple de transformation dans un composant :

**AVANT** (IdeaCard.tsx) :
```typescript
export function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <div>
      {idea.creators.map(creator => (
        <div key={creator.id}>
          <img src={creator.avatar} alt={creator.name} />
          <span>{creator.name}</span>
        </div>
      ))}
    </div>
  );
}
```

**APRÈS** (IdeaCard.tsx) :
```typescript
import { useResolveUsers } from '../utils/userResolvers';

export function IdeaCard({ idea }: { idea: Idea }) {
  const creators = useResolveUsers(idea.creatorIds);
  
  return (
    <div>
      {creators.map(creator => (
        <div key={creator.id}>
          <img src={creator.avatar} alt={creator.name} />
          <span>{creator.name}</span>
        </div>
      ))}
    </div>
  );
}
```

### 6.2. Composants identifiés à modifier (par recherche) :

**Fichiers avec `.author.` (30+ occurrences) :**
- IdeaDescriptionTab.tsx
- IdeaDiscussionsTab.tsx
- CreateCompleteIdea.tsx
- ContentLinkDialog.tsx
- ContentLinkSearch.tsx
- PostCard.tsx
- PostDetailPage.tsx
- create-idea/SourceIndicatorBanner.tsx
- create-idea/DetailedDescriptionSection.tsx
- create-idea/CollaborationForm.tsx
- create-idea/BasicIdeaForm.tsx
- create-idea/CollaborationSection.tsx
- create-idea/CreateIdeaHeader.tsx

**Fichiers avec `.creators.` :**
- IdeaCard.tsx
- CreatorAvatar.tsx
- CreatorNames.tsx
- MyIdeasPage.tsx
- UserProfilePage.tsx

**Total estimé : ~40 fichiers de composants à modifier**

---

## 📋 PHASE 7 : Modification des Hooks (/hooks/)

### 7.1. `/hooks/apiActions.ts`
- Vérifier toutes les fonctions qui créent ou manipulent des Posts/Ideas
- S'assurer qu'elles utilisent `authorId` et `creatorIds`
- Fonctions concernées :
  - `createPost()`
  - `createIdea()`
  - `loadFeed()`
  - `loadUserContributions()`

### 7.2. `/hooks/contentActions.ts`
- Vérifier les actions de création
- Adapter les transformations

### 7.3. `/hooks/userActions.ts`
- Vérifier qu'il n'y a pas de dépendances sur author/creators

---

## 📋 PHASE 8 : Tests et Validation

### 8.1. Points de test critiques :
- [ ] Affichage des cartes d'idées dans le feed
- [ ] Affichage des cartes de posts dans le feed
- [ ] Page de détail d'une idée (onglets description, discussions, évaluation)
- [ ] Page de détail d'un post
- [ ] Création d'une nouvelle idée
- [ ] Création d'un nouveau post
- [ ] Affichage du profil utilisateur (contributions)
- [ ] Discussions et réponses
- [ ] Filtrage par auteur

### 8.2. Vérifications TypeScript :
- [ ] Aucune erreur de type après migration
- [ ] Tous les composants compilent correctement
- [ ] Aucun `any` introduit pour contourner les erreurs

---

## 🎯 ORDRE D'EXÉCUTION RECOMMANDÉ

1. **PHASE 5** : Créer les helpers de résolution d'abord
2. **PHASE 1** : Modifier les types (provoquera des erreurs TypeScript utiles)
3. **PHASE 2** : Adapter les données mockées
4. **PHASE 4** : Adapter le store et selectors
5. **PHASE 3** : Adapter les services API
6. **PHASE 7** : Adapter les hooks
7. **PHASE 6** : Corriger tous les composants (en commençant par les plus simples)
8. **PHASE 8** : Tests complets

---

## 📊 ESTIMATION DE TEMPS

| Phase | Complexité | Temps estimé | Fichiers modifiés |
|-------|------------|--------------|-------------------|
| Phase 1 | Faible | 30 min | 1 fichier |
| Phase 2 | Moyenne | 1h | 3 fichiers |
| Phase 3 | Moyenne | 1h30 | 5 fichiers |
| Phase 4 | Moyenne | 1h | 2 fichiers |
| Phase 5 | Faible | 30 min | 1 fichier |
| Phase 6 | Élevée | 4h | 40+ fichiers |
| Phase 7 | Moyenne | 1h | 3 fichiers |
| Phase 8 | Moyenne | 1h30 | - |
| **TOTAL** | - | **~11h** | **55+ fichiers** |

---

## ⚠️ RISQUES ET PRÉCAUTIONS

### Risques identifiés :
1. **Régression visuelle** : Si un composant n'est pas correctement mis à jour
2. **Données manquantes** : Si un userId référencé n'existe pas dans le store
3. **Performance** : Multiples résolutions peuvent impacter les performances (à monitorer)

### Précautions :
1. **Créer une branche dédiée** pour cette migration
2. **Commiter après chaque phase** pour faciliter le rollback
3. **Tester manuellement** après chaque phase
4. **Garder un fallback** dans les resolvers pour les données manquantes
```typescript
export function resolveUser(store: SimpleEntityStore, userId: string): User | null {
  const user = store.users[userId];
  if (!user) {
    console.warn(`[resolveUser] User ${userId} not found in store`);
    return null;
  }
  return user;
}
```

---

## 🔄 COMPATIBILITÉ ASCENDANTE (OPTIONNEL)

Si on veut une migration progressive, on peut créer des types transitoires :

```typescript
// Version transitoire avec support des deux formats
export interface Post {
  // Nouveau format (préféré)
  authorId?: string;
  // Ancien format (déprécié)
  author?: User;
  // ...
}

// Helper de compatibilité
export function getPostAuthorId(post: Post): string {
  return post.authorId || post.author?.id || '';
}
```

Cependant, cette approche **n'est pas recommandée** car elle complexifie le code et retarde la vraie migration.

---

## 📝 NOTES COMPLÉMENTAIRES

### Champs déjà en format ID (aucune action requise) :
- `supporters` dans `Post` et `Idea` : ✅ Déjà des IDs
- `upvotes` dans `DiscussionTopic` et `DiscussionPost` : ✅ Déjà des IDs
- `likes` dans `PostReply` : ✅ Déjà des IDs
- `admins` dans `Community` : ✅ Déjà des IDs

### Composants utilitaires existants :
- `CreatorAvatar.tsx` : Actuellement reçoit des objets User, devra recevoir des IDs
- `CreatorNames.tsx` : Actuellement reçoit des objets User, devra recevoir des IDs
- `UserLink.tsx` : À vérifier si utilisé avec author/creators

---

## ✅ CHECKLIST FINALE

- [ ] Tous les types modifiés
- [ ] Toutes les données mockées adaptées
- [ ] Tous les services API adaptés
- [ ] Store et selectors mis à jour
- [ ] Helpers de résolution créés
- [ ] Tous les composants corrigés
- [ ] Tous les hooks adaptés
- [ ] Tests manuels complets
- [ ] Aucune erreur TypeScript
- [ ] Aucune erreur runtime
- [ ] Performance acceptable
- [ ] Documentation mise à jour

---

## 📝 JOURNAL DE MIGRATION

### ✅ Phase Discussions (DiscussionTopic, DiscussionPost, PostReply) - COMPLÉTÉE

**Date:** 26 octobre 2025

**Types modifiés:**
- ✅ `DiscussionTopic.authorId` (string au lieu de User)
- ✅ `DiscussionPost.authorId` (string au lieu de User)  
- ✅ `Discussion.authorId` (string au lieu de User)
- ✅ `PostReply.authorId` (string au lieu de User)

**Données mockées:**
- ✅ `/data/discussions.ts` - Tous les `author: users[X]` remplacés par `authorId: users[X].id`
- ✅ `/data/posts.ts` - Toutes les `replies[]` utilisent `authorId`

**Composants adaptés:**
- ✅ `IdeaDescriptionTab.tsx` - Utilise `getUserById(question.authorId)` et `getUserById(answer.authorId)`
- ✅ `IdeaDiscussionsTab.tsx` - Utilise `getUserById(topic.authorId)` et `getUserById(post.authorId)`
- ✅ `CollaborationForm.tsx` - Aucune modification nécessaire (n'accède pas aux authors des discussions)

**Store adapté:**
- ✅ `extractUsersFromDiscussionTopic()` complètement supprimée (plus nécessaire)
- ✅ Code d'extraction dans `setDiscussionTopics` et `addDiscussionTopic` complètement nettoyé
- ✅ Les fonctions sont maintenant simplifiées et n'essaient plus d'extraire des utilisateurs

**Résultat:**
- ✅ Aucune erreur TypeScript
- ✅ Tous les composants utilisent correctement `getUserById()` pour résoudre les authorId
- ✅ Les discussions s'affichent correctement avec les bons auteurs
- ✅ La création de nouvelles discussions et posts fonctionne
- ✅ Code mort complètement nettoyé (fonction `extractUsersFromDiscussionTopic` et ses appels supprimés)

**Entités restantes à migrer:**
- ⏳ `Post.author` → `Post.authorId`
- ⏳ `Idea.creators` → `Idea.creatorIds`

---
