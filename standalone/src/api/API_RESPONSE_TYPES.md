# Types de Réponse API - Référence

## Vue d'Ensemble

Ce document liste **uniquement** les types et fonctions réellement utilisés dans `/api`. Référence basée sur le code source au 29 octobre 2025.

## Services API

### authService.ts

**Fonctions exportées :**
```typescript
loginWithEmail(email: string, password: string): Promise<User | null>
loginWithSocialProvider(provider: string, userData: {...}): Promise<User | null>
createUserAccount(userData: { name, email, password, address?, bio?, birthYear }): Promise<User | null>
validateAuthToken(token: string): Promise<User | null>
logoutUser(userId: string): Promise<boolean>
resetPassword(email: string): Promise<boolean>
subscribeToNewsletterOnApi(email: string): Promise<boolean>
createUnfinalizedAccountOnApi(guestData?: {...}): Promise<User>
```

**Notes** : 
- `loginWithEmail` : Accepte email + mot de passe. En mode démo, tout mot de passe est accepté.
- `createUserAccount` : Accepte le mot de passe mais ne le stocke pas (en mode démo). Dans un vrai système, il serait hashé et stocké.

**Retours** : `User` (objet complet) ou `boolean` ou `null`

---

### avatarService.ts

**Fonctions exportées :**
```typescript
generateDefaultAvatar(name: string, size?: number): string
isValidAvatar(avatar?: string): boolean
getValidAvatar(name: string, avatar?: string, size?: number): string
validateImageFile(file: File): { valid: boolean; error?: string }
resizeImageTo200x200(file: File): Promise<string>
uploadUserAvatar(userId: string, imageDataUrl: string): Promise<string>
```

**Retours** : `string` (data URI SVG ou URL) ou `boolean` ou objet validation

---

### contentService.ts

**Fonctions exportées :**
```typescript
createIdeaOnApi(payload: {...}): Promise<Idea>
createPostOnApi(payload: {...}): Promise<Post>
fetchIdeaDetails(ideaId: string): Promise<{ idea: Idea; users: User[] } | null>
fetchPostDetails(postId: string): Promise<{ post: Post; users: User[] } | null>
fetchUserProfileFromApi(userId: string): Promise<User | null>
createUserAccountOnApi(userData: {...}): Promise<User>
updateUserProfileOnApi(userId: string, updates: Partial<User>): Promise<User | null>
```

**Retours** : 
- `createIdeaOnApi`, `createPostOnApi`: objets complets (`Idea`, `Post`)
- `fetchIdeaDetails`: `{ idea: Idea; users: User[] }` - l'idée complète avec ses créateurs
- `fetchPostDetails`: `{ post: Post; users: User[] }` - le post complet avec son auteur
- `fetchUserProfileFromApi`, `createUserAccountOnApi`, `updateUserProfileOnApi`: `User` ou `null`

---

### dataService.ts

**Interface principale :**
```typescript
interface MockDataSet {
  ideas: Idea[];
  posts: Post[];
  users: User[];
  currentUser: User;
  guestUser: User;
  discussions: DiscussionTopic[];
}
```

**Fonctions exportées :**
```typescript
loadMockDataSet(): Promise<MockDataSet>
invalidateMockDataCache(): void
getUserById(userId: string): Promise<User | null>
getUserByEmail(email: string): Promise<User | null>
getIdeaById(ideaId: string): Promise<Idea | null>
getPostById(postId: string): Promise<Post | null>
getIdeasByUserId(userId: string): Promise<Idea[]>
getPostsByUserId(userId: string): Promise<Post[]>
getAllDiscussions(): Promise<DiscussionTopic[]>
getAllIdeas(): Promise<Idea[]>
getAllPosts(): Promise<Post[]>
getAllUsers(): Promise<User[]>
```

**Retours** : Objets complets ou tableaux d'objets ou `null`

---

### detailsService.ts

**Interfaces :**
```typescript
interface IdeaDetailsResult {
  idea: Idea;
  discussions?: DiscussionTopic[];
  users?: User[];
  ratings?: Rating[];
  versions?: Idea[];
}

interface PostDetailsResult {
  post: Post;
  discussions?: DiscussionTopic[];
  users?: User[];
  replies?: PostReply[];
}
```

**Fonctions exportées :**
```typescript
fetchDiscussions(itemId: string, itemType: 'idea' | 'post'): 
  Promise<{ discussions: DiscussionTopic[], users: User[] }>

fetchIdeaRatings(ideaId: string): Promise<Rating[]>

fetchPostReplies(postId: string): Promise<PostReply[]>

fetchIdeaTabDetails(ideaId: string, tab: 'description' | 'discussions' | 'ratings' | 'lineage'): 
  Promise<IdeaDetailsResult | null>

fetchPostTabDetails(postId: string, tab: 'content' | 'discussions' | 'lineage'): 
  Promise<PostDetailsResult | null>
```

**Retours** : Objets détaillés avec champs optionnels selon l'onglet

---

### feedService.ts

**Interfaces :**
```typescript
interface FeedIdeaCard {
  id: string;
  title: string;
  summary: string;
  location?: string;
  creators: Array<{ id: string; name: string; avatar: string }>;
  status: string;
  createdAt: Date;
  supportCount: number;
  tags: string[];
  type: 'idea';
}

interface FeedPostCard {
  id: string;
  content: string;
  location?: string;
  authorId: string; // ✅ Migré vers ID simple
  createdAt: Date;
  supportCount: number;
  replyCount: number;
  tags: string[];
  type: 'post';
}

interface HomePageData {
  totalContributions: number;
  totalIdeas: number;
  totalSupports: number;
  recentSharedPropositions: (FeedIdeaCard | FeedPostCard)[];
  featuredIdeas: FeedIdeaCard[];
}
```

**Fonctions exportées :**
```typescript
fetchHomePageStats(): Promise<HomePageData>

fetchFeed(userId?: string): Promise<{
  ideas: FeedIdeaCard[];
  posts: FeedPostCard[];
  communities: Community[];
}>

fetchUserContributionsFromApi(userId: string): Promise<{
  participationIdeas: Idea[];
  supportIdeas: Idea[];
  participationPosts: Post[];
  supportPosts: Post[];
} | null>
```

**Retours** : Données minimalistes pour le feed (cartes légères)

---

### interactionService.ts

**Interfaces :**
```typescript
interface SupportResult {
  success: boolean;
  isSupporting: boolean;
  supportCount: number;
  supporters: string[]; // ✅ Tableau d'IDs (unifié idées + posts)
}

interface RatingResult {
  success: boolean;
  rating: Rating; // ✅ Un seul rating (optimisé)
}
```

**Fonctions exportées :**
```typescript
// Soutien unifié (idées + posts)
toggleSupportOnApi(contentId: string, userId: string, contentType: 'idea' | 'post', isCurrentlySupporting: boolean): 
  Promise<SupportResult | null>

// Évaluation d'idées
rateIdeaOnApi(ideaId: string, userId: string, criterionId: string, value: number): 
  Promise<RatingResult | null>

getIdeaRatingsOnApi(ideaId: string): Promise<Rating[] | null>

// Interactions diverses
reportContentOnApi(contentType: 'idea' | 'post', contentId: string, userId: string, reason: string): 
  Promise<boolean>

ignoreContentOnApi(contentType: 'idea' | 'post', contentId: string, userId: string): 
  Promise<boolean>

shareContentOnApi(contentType: 'idea' | 'post', contentId: string, userId: string): 
  Promise<string | null>

toggleUserFollowOnApi(targetUserId: string, currentUserId: string): 
  Promise<boolean>

// Réponses aux posts
togglePostReplyLikeOnApi(postId: string, replyId: string, userId: string): 
  Promise<boolean>

addPostReplyOnApi(postId: string, userId: string, content: string): 
  Promise<PostReply | null>

// Discussions
upvoteDiscussionTopicOnApi(topicId: string, userId: string): 
  Promise<boolean>

upvoteDiscussionPostOnApi(topicId: string, postId: string, userId: string): 
  Promise<boolean>

createDiscussionTopicOnApi(ideaId: string, userId: string, data: {...}): 
  Promise<DiscussionTopic | null>

createDiscussionPostOnApi(topicId: string, userId: string, content: string): 
  Promise<DiscussionPost | null>

markDiscussionPostAsAnswerOnApi(topicId: string, postId: string, userId: string): 
  Promise<boolean>
```

**Retours** : Résultats spécifiques (SupportResult, RatingResult) ou `boolean` ou `null`

---

### lineageService.ts

**Interfaces :**
```typescript
interface LineageItem {
  id: string;
  type: 'idea' | 'post';
  title?: string;
  content?: string;
  summary?: string;
  authorId?: string;        // ✅ Pour Posts (migré)
  creators?: User[];        // ✅ Pour Ideas (temporaire, sera migré)
  createdAt: Date;
  level: number;
  relationshipType: 'parent' | 'child' | 'current';
}

interface LineageResult {
  currentItem: LineageItem;
  parents: LineageItem[];
  children: LineageItem[];
  totalLevels: number;
}
```

**Fonction exportée :**
```typescript
fetchLineage(itemId: string, itemType: 'idea' | 'post', maxDepth?: number): 
  Promise<{ lineage: LineageResult, users: User[] } | null>
```

**Retours** : Structure arborescente avec utilisateurs associés

---

### transformService.ts

**Fonctions exportées :**
```typescript
transformIdeaCardToIdea(ideaCard: any): Idea
transformPostCardToPost(postCard: any): Post
transformLineageItemToEntity(lineageItem: any): Idea | Post
createVisitorUser(visitorId: string): User
```

**Retours** : Objets transformés avec chargement progressif

**Note** : Les transformations créent des objets avec :
- Champs essentiels remplis (du feed)
- Champs progressifs initialisés vides (`supporters: []`, `discussionIds: []`, etc.)
- Champs enrichis chargés plus tard selon l'onglet consulté

---

## Patterns Communs

### 1. Données Minimales vs Complètes

**Feed** → Données légères (FeedIdeaCard, FeedPostCard)
```typescript
{
  id, title, summary, creators: [{ id, name, avatar }], supportCount, tags
}
```

**Détails** → Données complètes (Idea, Post)
```typescript
{
  id, title, summary, description, creators, supporters, ratings, 
  discussionIds, sourceIdeas, derivedIdeas, ...
}
```

### 2. Chargement Progressif

Les données sont chargées selon l'onglet consulté :

- **Feed** : Champs minimaux
- **Onglet Description** : + `supporters`, `ratings`, `ratingCriteria`
- **Onglet Discussions** : + `discussionIds`, objets `DiscussionTopic`
- **Onglet Versions** : + `sourceIdeas`, `derivedIdeas`, `sourcePosts`

### 3. Migration en Cours

**Posts** : ✅ Migration terminée
```typescript
Post.authorId: string           // ✅ ID simple
PostReply.authorId: string      // ✅ ID simple
```

**Idées** : ✅ Migration terminée
```typescript
Idea.creatorIds: string[]       // ✅ IDs des créateurs
Idea.supporters: string[]       // ✅ IDs des supporters
```

---

## Types de Base (depuis `/types/index.ts`)

```typescript
interface User { id, name, email, avatar, bio, address, birthYear, createdAt, isRegistered }
interface Idea { id, title, summary, description, creators, supporters, status, ratings, ... }
interface Post { id, content, authorId, supporters, replies, tags, ... }
interface Rating { criterionId, value, userId }
interface PostReply { id, authorId, content, createdAt, likes }
interface DiscussionTopic { id, title, type, authorId, content, posts, upvotes, ... }
interface DiscussionPost { id, authorId, content, timestamp, upvotes, isAnswer }
```

---

## Voir Aussi

- `/api/README.md` - Documentation générale des services API
- `/ARCHITECTURE.md` - Architecture globale
- `/docs/API_CALLS_PATTERN.md` - Pattern en 3 étapes
- `/PLAN_MIGRATION_AUTHOR_IDS.md` - Plan de migration vers IDs simples
