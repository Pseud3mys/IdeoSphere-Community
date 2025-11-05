# API Services - Référence

## Vue d'Ensemble

Les services API simulent un backend en utilisant des données mockées. Ils sont conçus pour être facilement remplaçables par de vraies API.

```
Hooks → API Services → dataService → Données mockées + Cache dynamique
   ↑                                         ↓
   └──────── STORE (source de vérité) ──────┘
```

**Règle Clé** : Les services API accèdent aux données mockées ET au cache dynamique. Les entités créées (posts, idées, utilisateurs) sont ajoutées au cache dynamique ET au store.

## Services

### authService.ts

**Authentification et inscription**

```typescript
loginWithEmail(email: string, password: string): Promise<User | null>
loginWithSocialProvider(provider: string, userData: {...}): Promise<User | null>
createUserAccount(userData: { name, email, password, address?, bio?, birthYear }): Promise<User | null>
createUnfinalizedAccountOnApi(guestData?: {...}): Promise<User>
validateAuthToken(token: string): Promise<User | null>
logoutUser(userId: string): Promise<boolean>
resetPassword(email: string): Promise<boolean>
subscribeToNewsletterOnApi(email: string): Promise<boolean>
```

**Notes** : 
- `loginWithEmail` : Vérifie email + mot de passe. En mode démo, tout mot de passe est accepté.
- `createUserAccount` : Reçoit le mot de passe mais ne le stocke pas (en mode démo). Dans un système réel, il serait hashé avec bcrypt avant stockage.

### avatarService.ts

**Génération et validation d'avatars**

```typescript
generateDefaultAvatar(name: string, size?: number): string
getValidAvatar(name: string, avatar?: string, size?: number): string
isValidAvatar(avatar?: string): boolean
validateImageFile(file: File): { valid: boolean; error?: string }
resizeImageTo200x200(file: File): Promise<string>
uploadUserAvatar(userId: string, imageDataUrl: string): Promise<string>
```

### contentService.ts

**Création et récupération de contenu**

```typescript
// Création
createIdeaOnApi(payload: {...}): Promise<Idea>
createPostOnApi(payload: {...}): Promise<Post>
createUserAccountOnApi(userData: {...}): Promise<User>

// Récupération détaillée
fetchIdeaDetails(ideaId: string): Promise<{ idea: Idea; users: User[] } | null>
fetchPostDetails(postId: string): Promise<{ post: Post; users: User[] } | null>
fetchUserProfileFromApi(userId: string): Promise<User | null>

// Mise à jour
updateUserProfileOnApi(userId: string, updates: Partial<User>): Promise<User | null>
```

### dataService.ts

**Point d'accès unique aux données mockées + cache dynamique**

```typescript
// Chargement initial (UNE SEULE fonction qui charge TOUT)
loadMockDataSet(): Promise<MockDataSet>
invalidateMockDataCache(): void

// Cache dynamique pour les contenus créés pendant la session
addDynamicIdea(idea: Idea): void
addDynamicPost(post: Post): void
addDynamicUser(user: User): void

// Recherche par ID (cherche d'abord dans le cache dynamique, puis dans les données mockées)
getUserById(userId: string): Promise<User | null>
getUserByEmail(email: string): Promise<User | null>
getIdeaById(ideaId: string): Promise<Idea | null>
getPostById(postId: string): Promise<Post | null>

// Listes filtrées
getIdeasByUserId(userId: string): Promise<Idea[]>
getPostsByUserId(userId: string): Promise<Post[]>

// Listes complètes
getAllIdeas(): Promise<Idea[]>
getAllPosts(): Promise<Post[]>
getAllUsers(): Promise<User[]>
getAllDiscussions(): Promise<DiscussionTopic[]>
```

**⚠️ LIMITATION CRITIQUE** : Ne retourne QUE les données mockées, pas les entités créées dynamiquement.

**Usage :**
- ✅ Chargement initial via `loadInitialData()` UNE fois
- ✅ Dans les autres services API pour enrichir les données
- ❌ Jamais dans les hooks pour chercher des entités (utiliser `boundSelectors` à la place)

### detailsService.ts

**Chargement progressif selon l'onglet**

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

**Principe** : Charger uniquement ce qui est nécessaire pour l'onglet actif.

### feedService.ts

**Données minimalistes pour les feeds**

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

**Principe** : Retourner des cartes légères (FeedIdeaCard, FeedPostCard) sans relations complètes.

### interactionService.ts

**Interactions utilisateur**

```typescript
// Soutien unifié (idées + posts)
toggleSupportOnApi(contentId: string, userId: string, contentType: 'idea' | 'post', 
  isCurrentlySupporting: boolean): Promise<SupportResult | null>

// Évaluation
rateIdeaOnApi(ideaId: string, userId: string, criterionId: string, value: number): 
  Promise<RatingResult | null>
getIdeaRatingsOnApi(ideaId: string): Promise<Rating[] | null>

// Réponses aux posts
addPostReplyOnApi(postId: string, userId: string, content: string): Promise<PostReply | null>
togglePostReplyLikeOnApi(postId: string, replyId: string, userId: string): Promise<boolean>

// Discussions
createDiscussionTopicOnApi(ideaId: string, userId: string, data: {...}): 
  Promise<DiscussionTopic | null>
createDiscussionPostOnApi(topicId: string, userId: string, content: string): 
  Promise<DiscussionPost | null>
upvoteDiscussionTopicOnApi(topicId: string, userId: string): Promise<boolean>
upvoteDiscussionPostOnApi(topicId: string, postId: string, userId: string): Promise<boolean>
markDiscussionPostAsAnswerOnApi(topicId: string, postId: string, userId: string): Promise<boolean>

// Modération et social
reportContentOnApi(contentType, contentId, userId, reason): Promise<boolean>
ignoreContentOnApi(contentType, contentId, userId): Promise<boolean>
shareContentOnApi(contentType, contentId, userId): Promise<string | null>
toggleUserFollowOnApi(targetUserId, currentUserId): Promise<boolean>
```

### lineageService.ts

**Relations entre entités (arbre généalogique)**

```typescript
fetchLineage(itemId: string, itemType: 'idea' | 'post', maxDepth?: number): 
  Promise<{ lineage: LineageResult, users: User[] } | null>
```

**Retours** :
- `lineage.parents` : Sources (idées et posts parents)
- `lineage.children` : Dérivées (idées et posts enfants)
- `users` : Utilisateurs associés

### communityService.ts

**Gestion des communautés/groupes de travail** ⭐ NOUVEAU

```typescript
// Récupération
fetchAllCommunities(): Promise<{ communities: Community[], users: User[] }>
fetchCommunityById(communityId: string): Promise<{ community: Community, members: Array<{user: User, membership: CommunityMembership}> } | null>
fetchUserCommunities(userId: string): Promise<{ communities: Community[], users: User[] }>
searchCommunities(query: string): Promise<{ communities: Community[], users: User[] }>
fetchCommunitiesByType(type: Community['type']): Promise<{ communities: Community[], users: User[] }>
fetchPublicCommunities(): Promise<{ communities: Community[], users: User[] }>

// Actions
joinCommunity(userId: string, communityId: string): Promise<CommunityMembership | null>
leaveCommunity(userId: string, communityId: string): Promise<boolean>
checkUserMembership(userId: string, communityId: string): Promise<boolean>
getUserCommunityRole(userId: string, communityId: string): Promise<CommunityMembership | null>

// Statistiques
fetchCommunityStats(communityId: string): Promise<{ memberCount, ideaCount, activeMembers, adminsCount, moderatorsCount } | null>
```

**Principe** : 
- Toutes les fonctions retournent à la fois les communautés ET les utilisateurs associés
- Les membres sont triés par rôle (admin > moderator > member) puis par date d'adhésion
- Compatible avec le hook `useCommunityActions` pour mise à jour automatique du store

### transformService.ts

**Transformation de données API → Store**

```typescript
transformIdeaCardToIdea(ideaCard: any): Idea
transformPostCardToPost(postCard: any): Post
transformLineageItemToEntity(lineageItem: any): Idea | Post
createVisitorUser(visitorId: string): User
```

**Principe** : Convertir les données minimales (feed) en objets complets avec champs progressifs initialisés vides.

## Patterns Importants

### 1. Chargement Initial (UNE SEULE FOIS)

```typescript
// Dans apiActions.ts - loadInitialData()
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
```

**Appelée UNE fois dans `useEntityStoreSimple.ts` au démarrage.**

### 2. Pattern en 3 Étapes (Obligatoire)

```typescript
async function loadData(id: string) {
  // 1. APPELER L'API
  const { fetchSomething } = await import('../api/someService');
  const apiData = await fetchSomething(id);
  
  // 2. AJOUTER AU STORE
  if (apiData) {
    actions.addSomething(apiData);
  }
  
  // 3. LIRE DEPUIS LE STORE
  return boundSelectors.getSomethingById(id);
}
```

**Pourquoi ?** L'API ne trouve que les données mockées. Le store contient mockées + dynamiques.

### 3. Chargement Progressif

```typescript
// Feed : Données minimales
const feed = await fetchFeed();
feed.ideas.forEach(ideaCard => {
  const idea = transformIdeaCardToIdea(ideaCard);
  actions.addIdea(idea); // Champs progressifs vides
});

// Onglet détails : Enrichir progressivement
const discussions = await fetchDiscussions(ideaId, 'idea');
discussions.forEach(d => actions.addDiscussionTopic(d));

const ratings = await fetchIdeaRatings(ideaId);
actions.updateIdea(ideaId, { ratings });
```

### 4. Données Minimalistes vs Complètes

**Feed (légères)** :
```typescript
FeedIdeaCard { id, title, summary, creatorIds: string[], supportCount }
FeedPostCard { id, content, authorId, supportCount, replyCount }
```

**Détails (complètes)** :
```typescript
Idea { id, title, summary, description, creatorIds, supporters, ratings, ... }
Post { id, content, authorId, supporters, replies, ... }
```

## Migration en Cours

**Posts** : ✅ Migration terminée
```typescript
Post.authorId: string           // ✅ ID simple
PostReply.authorId: string      // ✅ ID simple
FeedPostCard.authorId: string   // ✅ ID simple
```

**Idées** : ✅ Migration terminée
```typescript
Idea.creatorIds: string[]       // ✅ IDs des créateurs
Idea.supporters: string[]       // ✅ IDs des supporters
```

## Bonnes Pratiques

### ✅ À Faire

```typescript
// 1. Simuler latence réseau
await new Promise(resolve => setTimeout(resolve, 150));

// 2. Logs structurés
console.log('✅ [API] Succès:', data);
console.error('❌ [API] Échec:', error);

// 3. Gestion d'erreurs
try {
  const data = await fetchData();
  return data;
} catch (error) {
  console.error('❌ [API]:', error);
  return null;
}

// 4. Données immuables
return { ...item, ...updates }; // ✅ Nouveau objet
```

### ❌ À Éviter

```typescript
// ❌ Accès direct aux données depuis hooks/composants
import { mockIdeas } from '../data/ideas';

// ❌ Mutation directe
item.title = newTitle; // Muter les données

// ❌ Retourner undefined
return undefined; // Utiliser null pour la cohérence
```

## Règles Clés

1. **dataService** = Données mockées uniquement
2. **boundSelectors** = Toutes les données (mockées + dynamiques)
3. **Pattern en 3 étapes** = Obligatoire pour les appels API
4. **Chargement progressif** = Feed léger → Détails enrichis selon onglet
5. **Transformation** = transformService pour convertir API → Store

## Migration vers API Réelle

Remplacer uniquement les services API :

```typescript
// Avant (mocké)
export async function fetchIdeaDetails(ideaId: string) {
  const idea = await getIdeaById(ideaId);
  return idea || null;
}

// Après (vraie API)
export async function fetchIdeaDetails(ideaId: string) {
  try {
    const response = await fetch(`${API_URL}/ideas/${ideaId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('❌ API Error:', error);
    return null;
  }
}
```

Les hooks et composants ne changent pas ! 🎯

## Voir Aussi

- **[API_RESPONSE_TYPES.md](./API_RESPONSE_TYPES.md)** - Types et signatures détaillés
- **[/ARCHITECTURE.md](/ARCHITECTURE.md)** - Architecture globale
- **[/docs/API_CALLS_PATTERN.md](/docs/API_CALLS_PATTERN.md)** - Pattern en 3 étapes
- **[/hooks/README.md](/hooks/README.md)** - Documentation des hooks
