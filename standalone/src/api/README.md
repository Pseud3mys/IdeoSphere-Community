# API Services - Couche d'Accès aux Données

Le dossier `/api` contient les services qui gèrent l'accès aux données. Ces services simulent une API backend en utilisant des données mockées, mais sont conçus pour être facilement remplaçables par de vraies API.

## Architecture

```
Hooks/Actions
    ↓
API Services (ce dossier)
    ↓
Data (données mockées)
```

## Services Disponibles

### authService.ts - Authentification

Gère l'authentification et l'inscription des utilisateurs.

#### Fonctions

```typescript
// Connexion classique
loginUser(email: string, password: string): Promise<User | null>

// Connexion sociale (Google, GitHub)
loginWithSocialProvider(provider: string): Promise<User | null>

// Inscription
signupUser(userData: SignupData): Promise<User | null>

// Vérifications
checkEmailExists(email: string): Promise<boolean>

// Newsletter
subscribeToNewsletter(email: string): Promise<boolean>
```

#### Utilisation

```typescript
import { loginUser } from '../api/authService';

const user = await loginUser('email@example.com', 'password123');
if (user) {
  // Authentification réussie
}
```

---

### contentService.ts - Création et Récupération de Contenu

Gère la **création** de nouvelles entités et la **récupération** des détails complets.

#### Fonctions

```typescript
// Création d'idées et posts
createIdeaOnApi(payload: CreateIdeaPayload): Promise<Idea>
createPostOnApi(payload: CreatePostPayload): Promise<Post>

// Détails d'une idée (version complète)
fetchIdeaDetails(ideaId: string): Promise<Idea | null>

// Détails d'un post
fetchPostDetails(postId: string): Promise<Post | null>

// Profil utilisateur complet
fetchUserProfileFromApi(userId: string): Promise<User | null>
```

#### Distinction avec dataService

- **contentService** : Retourne des données **enrichies** (avec relations)
- **dataService** : Retourne des données **brutes** (accès direct)

```typescript
// contentService : données enrichies
const idea = await fetchIdeaDetails('idea-1');
// idea.supporters contient les objets User complets

// dataService : données brutes
const idea = getIdeaById('idea-1');
// idea.supporterIds contient uniquement les IDs
```

---

### dataService.ts - Accès Direct aux Données

Accès **direct** aux données mockées. Utilisé par les autres services.

#### Fonctions

```typescript
// Récupération par ID
getIdeaById(ideaId: string): Idea | undefined
getPostById(postId: string): Post | undefined
getUserById(userId: string): User | undefined
getDiscussionTopicById(id: string): DiscussionTopic | undefined

// Listes filtrées
getIdeasByUserId(userId: string): Promise<Idea[]>
getPostsByUserId(userId: string): Promise<Post[]>

// Listes complètes
getAllIdeas(): Idea[]
getAllPosts(): Post[]
getAllUsers(): User[]
getAllDiscussions(): DiscussionTopic[]
getAllCommunities(): Community[]
```

#### ⚠️ LIMITATION CRITIQUE

**Les services API ne retournent QUE les données mockées !**

Les entités créées dynamiquement (idées/posts créés par l'utilisateur) ne sont **PAS** dans les données mockées, elles sont **UNIQUEMENT** dans le store.

```typescript
// ❌ PROBLÈME : Cette fonction ne trouve QUE les données mockées
const idea = await getIdeaById('idea-dynamic-123'); // null (si créée dynamiquement)

// ✅ SOLUTION : Utiliser le store dans les hooks
const idea = boundSelectors.getIdeaById('idea-dynamic-123'); // Trouve tout !
```

**Règle** : 
- `dataService` → Chargement initial UNE FOIS
- `boundSelectors` → Lecture de TOUTES les données (mockées + dynamiques)

#### ⚠️ Attention

Ce service est un **layer d'abstraction**. Ne jamais importer directement depuis `/data` dans les hooks ou composants.

**✅ Correct - LA SEULE fonction de chargement initial** :
```typescript
// Dans apiActions.ts - Chargement initial au démarrage
// ⚠️ C'EST LA SEULE FONCTION qui peut accéder à dataService !
loadInitialData: async () => {
  const { loadMockDataSet } = await import('../api/dataService');
  const mockData = await loadMockDataSet(); // ✅ Charge TOUTES les données en une fois
  
  // ⚠️ Ajouter au store immédiatement !
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

**Cette fonction est appelée UNE SEULE FOIS au démarrage dans `useEntityStoreSimple.ts`.**

**❌ Incorrect pour recherche** :
```typescript
// Dans un hook - Recherche d'une entité
const { getIdeaById } = await import('../api/dataService');
const idea = await getIdeaById(ideaId); // ❌ Ne trouve pas les entités dynamiques !

// ✅ Utiliser boundSelectors à la place
const idea = boundSelectors.getIdeaById(ideaId); // ✅ Trouve tout !
```

**❌ Toujours incorrect** :
```typescript
// Dans un composant
import { ideas } from '../data/ideas';  // ❌ Ne jamais faire ça
```

---

### detailsService.ts - Données Détaillées

Charge les **données supplémentaires** nécessaires pour les pages de détail.

#### Fonctions

```typescript
// Discussions liées à une entité
fetchDiscussions(
  entityId: string, 
  entityType: 'idea' | 'post'
): Promise<DiscussionTopic[]>

// Évaluations d'une idée
fetchIdeaRatings(ideaId: string): Promise<Rating[]>

// Stats détaillées
fetchDetailedStats(ideaId: string): Promise<DetailedStats>
```

#### Utilisation Typique

```typescript
// Dans navigationActions.goToIdea()
const discussions = await fetchDiscussions(ideaId, 'idea');
discussions.forEach(d => actions.addDiscussionTopic(d));
```

---

### feedService.ts - Feeds et Listes

Génère les **feeds** (discovery, contributions) avec données minimales pour la performance.

#### Fonctions

```typescript
// Feed principal (discovery)
fetchFeed(filters?: FeedFilters): Promise<FeedData>

// Contributions de l'utilisateur
fetchMyContributions(userId: string): Promise<ContributionsData>

// Stats page d'accueil
fetchHomePageStats(): Promise<HomeStats>
```

#### Principe : Données Minimales

Les feeds retournent uniquement les données nécessaires pour afficher les cartes :

```typescript
// Feed minimal
{
  ideas: [{
    id: 'idea-1',
    title: 'Titre',
    summary: 'Résumé',
    supportCount: 42,
    // PAS de description complète
    // PAS de discussions
    // PAS d'évaluations détaillées
  }]
}

// Les détails sont chargés à la demande via contentService
```

---

### interactionService.ts - Interactions Utilisateur

Gère toutes les **interactions** de l'utilisateur (likes, supports, évaluations, réponses).

#### Fonctions

```typescript
// Support/Like
toggleIdeaSupportOnApi(
  ideaId: string, 
  userId: string
): Promise<SupportResult | null>

togglePostLikeOnApi(
  postId: string, 
  userId: string
): Promise<LikeResult | null>

togglePostReplyLikeOnApi(
  postId: string,
  replyId: string,
  userId: string
): Promise<boolean>

// Réponses aux posts
addPostReplyOnApi(
  postId: string,
  userId: string,
  content: string
): Promise<PostReply | null>

// Évaluations
rateIdeaOnApi(
  ideaId: string, 
  userId: string, 
  criterionId: string, 
  value: number
): Promise<boolean>

// Discussions
createDiscussionTopicOnApi(
  ideaId: string,
  userId: string,
  data: TopicData
): Promise<string | null>

createDiscussionPostOnApi(
  topicId: string,
  userId: string,
  content: string
): Promise<string | null>

upvoteDiscussionTopicOnApi(
  topicId: string,
  userId: string
): Promise<boolean>

upvoteDiscussionPostOnApi(
  topicId: string,
  postId: string,
  userId: string
): Promise<boolean>

// Modération et social
reportContentOnApi(...): Promise<boolean>
ignoreContentOnApi(...): Promise<boolean>
shareContentOnApi(...): Promise<string | null>
toggleUserFollowOnApi(...): Promise<boolean>
```

#### Pattern Retourné

Les fonctions d'interaction retournent soit :
- Un **objet complet** (pour ajout de contenu)
- Un **résultat structuré** (pour toggle)
- Un **boolean** (pour succès/échec simple)
- **null** en cas d'erreur

```typescript
// Exemple 1 : Toggle retourne un résultat structuré
const result = await toggleIdeaSupportOnApi(ideaId, userId);
if (result) {
  console.log('Nouveau count:', result.supportCount);
  console.log('Soutenu?', result.isSupporting);
}

// Exemple 2 : Ajout retourne l'objet complet
const newReply = await addPostReplyOnApi(postId, userId, content);
if (newReply) {
  console.log('Réponse créée:', newReply.id);
  console.log('Auteur:', newReply.author.name);
}
```

---

### lineageService.ts - Relations entre Entités

Gère les **relations** entre idées et posts (versions, sources, dérivées).

#### Fonctions

```typescript
// Structure d'un élément de lineage
interface LineageItem {
  id: string;
  type: 'idea' | 'post';
  title?: string;
  content?: string;
  summary?: string;
  authors: User[];
  createdAt: Date;
  level: number;
  relationshipType: 'parent' | 'child' | 'current';
}

// Résultat du lineage
interface LineageResult {
  currentItem: LineageItem;
  parents: LineageItem[];      // Sources (idées et posts)
  children: LineageItem[];     // Dérivées
  totalLevels: number;
}

// Récupérer le lineage complet
fetchLineage(
  itemId: string, 
  itemType: 'idea' | 'post',
  maxDepth?: number
): Promise<LineageResult | null>
```

#### Utilisation

```typescript
// Dans loadIdeaTabData pour l'onglet versions
const lineageData = await fetchLineage(ideaId, 'idea');

// Accéder aux parents (sources)
lineageData.parents.forEach(parent => {
  if (parent.type === 'idea') {
    // Charger l'idée source complète
  } else if (parent.type === 'post') {
    // Charger le post source complet
  }
});

// Accéder aux enfants (dérivées)
lineageData.children.forEach(child => {
  // Toujours des idées pour une idée source
});
```

---

### transformService.ts - Transformation de Données

Transforme les données brutes en **formats enrichis** utilisables par l'UI.

#### Fonctions

```typescript
// Enrichir une idée avec les relations
enrichIdeaWithRelations(idea: Idea): Promise<EnrichedIdea>

// Résoudre les références utilisateur
resolveUserReferences(userIds: string[]): User[]

// Calculer des statistiques agrégées
calculateIdeaStats(idea: Idea): IdeaStats

// Formater les données pour le feed
transformToFeedFormat(ideas: Idea[], posts: Post[]): FeedItem[]
```

#### Principe

Sépare la **logique de transformation** de la logique métier.

```typescript
// Au lieu de transformer dans le composant
const enrichedIdea = {
  ...idea,
  creatorDetails: users.find(u => u.id === idea.creatorId)
};

// Utiliser transformService
const enrichedIdea = await enrichIdeaWithRelations(idea);
```

## Règles de Conception

### ✅ Bonnes Pratiques

1. **Simuler la Latence** : Ajouter des delays pour simuler réseau
   ```typescript
   await new Promise(resolve => setTimeout(resolve, 300));
   ```

2. **Gestion d'Erreurs** : Toujours retourner des structures cohérentes
   ```typescript
   try {
     const data = await fetch(...);
     return data;
   } catch (error) {
     console.error('❌ API Error:', error);
     return null;
   }
   ```

3. **Données Immuables** : Ne jamais muter les données mockées
   ```typescript
   // ✅ Correct
   return { ...idea, title: newTitle };
   
   // ❌ Incorrect
   idea.title = newTitle;
   return idea;
   ```

4. **Logs Structurés** : Utiliser des emojis pour la clarté
   ```typescript
   console.log('✅ [API] Support ajouté:', ideaId);
   console.error('❌ [API] Échec:', error);
   console.log('🔵 [API] Chargement:', ideaId);
   ```

### ❌ À Éviter

1. Accès direct aux données depuis les composants
2. Mutations directes des données mockées
3. Mélanger logique métier et transformation
4. Retourner `undefined` au lieu de `null` (cohérence)
5. Oublier la gestion d'erreurs

## Patterns Communs

### 1. Service Simple (Lecture)

```typescript
export async function fetchSomething(id: string): Promise<Something | null> {
  try {
    // Simuler latence réseau
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Accès aux données
    const item = dataService.getSomethingById(id);
    
    if (!item) {
      console.error('❌ [API] Item non trouvé:', id);
      return null;
    }
    
    // Enrichir si nécessaire
    const enriched = await enrichItem(item);
    
    console.log('✅ [API] Item chargé:', id);
    return enriched;
  } catch (error) {
    console.error('❌ [API] Erreur:', error);
    return null;
  }
}
```

### 2. Service avec Mutation

```typescript
export async function updateSomething(
  id: string, 
  updates: Partial<Something>
): Promise<{ success: boolean; item?: Something }> {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const item = dataService.getSomethingById(id);
    if (!item) {
      return { success: false };
    }
    
    // Créer nouvelle instance (immuable)
    const updated = { ...item, ...updates };
    
    // Dans un vrai système, envoyer à l'API ici
    // await fetch(`/api/something/${id}`, { method: 'PATCH', body: updates });
    
    console.log('✅ [API] Item mis à jour:', id);
    return { success: true, item: updated };
  } catch (error) {
    console.error('❌ [API] Erreur mise à jour:', error);
    return { success: false };
  }
}
```

### 3. Service avec Agrégation

```typescript
export async function fetchAggregatedData(
  filters: Filters
): Promise<AggregatedData> {
  try {
    const ideas = dataService.getAllIdeas();
    const posts = dataService.getAllPosts();
    
    // Filtrer
    const filteredIdeas = ideas.filter(idea => 
      filters.tags?.some(tag => idea.tags?.includes(tag))
    );
    
    // Agréger
    const stats = {
      totalIdeas: filteredIdeas.length,
      totalSupports: filteredIdeas.reduce(
        (sum, idea) => sum + idea.supportCount, 
        0
      )
    };
    
    return {
      ideas: filteredIdeas,
      posts,
      stats
    };
  } catch (error) {
    console.error('❌ [API] Erreur agrégation:', error);
    return { ideas: [], posts: [], stats: {} };
  }
}
```

## Migration vers une Vraie API

Quand vous passerez à une vraie API, changez uniquement ce dossier :

```typescript
// Avant (mocké)
export async function fetchIdeaDetails(ideaId: string): Promise<Idea | null> {
  const idea = dataService.getIdeaById(ideaId);
  return idea || null;
}

// Après (vraie API)
export async function fetchIdeaDetails(ideaId: string): Promise<Idea | null> {
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

Les hooks et composants n'ont **pas besoin de changer** !

## Debugging

### Tracer les Appels API

```typescript
// Ajouter au début de chaque fonction
console.log('🔵 [API] Appel:', functionName, params);

// À la fin
console.log('✅ [API] Succès:', result);
// ou
console.error('❌ [API] Échec:', error);
```

### Simuler des Erreurs

```typescript
// Pour tester la gestion d'erreurs
export async function fetchSomething(id: string) {
  // Simuler erreur 30% du temps
  if (Math.random() < 0.3) {
    throw new Error('Network error');
  }
  
  // Reste du code...
}
```
