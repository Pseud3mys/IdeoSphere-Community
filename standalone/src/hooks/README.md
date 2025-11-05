# Hooks - Interface Store ↔ Composants

Le dossier `/hooks` contient l'interface entre les composants React et le SimpleEntityStore. Tous les hooks encapsulent la logique métier et exposent des actions simples aux composants.

## Architecture

```
useEntityStoreSimple.ts    → Hook principal (point d'entrée unique)
    ├── apiActions.ts      → Actions API (chargement données)
    ├── contentActions.ts  → Actions contenu (CRUD idées/posts)
    ├── navigationActions.ts → Actions navigation
    └── userActions.ts     → Actions utilisateur
useAuthHandlers.ts         → Hook spécialisé authentification
```

## useEntityStoreSimple.ts

### Rôle

**Point d'entrée unique** pour tous les composants. Expose :
- Le store complet
- Tous les sélecteurs
- Toutes les actions

### Utilisation

```typescript
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';

function MyComponent() {
  const { 
    store,           // État complet (rarement utilisé directement)
    actions,         // Toutes les actions
    getCurrentUser,  // Sélecteurs
    getAllIdeas,
    getIdeaById
  } = useEntityStoreSimple();

  const user = getCurrentUser();
  const ideas = getAllIdeas();

  return (
    <button onClick={() => actions.toggleIdeaSupport('idea-1')}>
      Soutenir
    </button>
  );
}
```

### Principe : Tout passe par ce hook

**✅ Correct** :
```typescript
const { actions } = useEntityStoreSimple();
actions.goToIdea(ideaId);
```

**❌ Incorrect** :
```typescript
// Ne jamais importer directement depuis /data
import { ideas } from '../data/ideas';
```

## Actions par Fichier

### apiActions.ts - Chargement de Données

Actions pour **récupérer** des données depuis l'API (simulée).

#### Principes
- Appellent les services API
- Mettent à jour le store avec les données reçues
- Gèrent le chargement progressif

#### Actions Principales

```typescript
// Charger le feed (minimal)
actions.fetchFeed()

// Charger les contributions de l'utilisateur
actions.fetchMyContributions()

// Charger les données d'un onglet spécifique
actions.loadIdeaTabData(ideaId, 'versions')

// Charger les discussions
actions.loadDiscussions(ideaId, 'idea')

// Charger les évaluations
actions.loadIdeaRatings(ideaId)
```

#### Exemple

```typescript
fetchFeed: async () => {
  try {
    const { fetchFeed } = await import('../api/feedService');
    
    // Charger données minimales pour le feed
    const feedData = await fetchFeed();
    
    // Ajouter au store
    feedData.ideas.forEach(idea => actions.addIdea(idea));
    feedData.posts.forEach(post => actions.addPost(post));
    
    // Naviguer vers le feed
    actions.setActiveTab('discovery');
  } catch (error) {
    console.error('❌ Erreur fetchFeed:', error);
  }
}
```

### contentActions.ts - Manipulation de Contenu

Actions pour **modifier** le contenu (idées, posts, interactions).

#### Principes
- Mise à jour optimiste du store
- Appel API en parallèle (fire-and-forget)
- Gestion des erreurs avec rollback

#### Actions Principales

```typescript
// Interactions
actions.toggleIdeaSupport(ideaId)
actions.togglePostLike(postId)

// Évaluations
actions.rateIdea(ideaId, criterionId, value)

// CRUD
actions.createIdea(ideaData)
actions.updateIdea(ideaId, updates)
actions.deleteIdea(ideaId)
actions.createPost(postData)
```

#### Pattern : Mise à Jour Optimiste

```typescript
toggleIdeaSupport: async (ideaId: string) => {
  storeUpdater(prevStore => {
    // 1. Lire état actuel
    const idea = selectors.getIdeaById(prevStore)(ideaId);
    const currentUser = selectors.getCurrentUser(prevStore);
    
    if (!idea || !currentUser) return {};

    // 2. Calculer nouvel état
    const isSupporting = idea.supporters?.some(s => s.id === currentUser.id);
    const newSupporters = isSupporting
      ? (idea.supporters || []).filter(s => s.id !== currentUser.id)
      : [...(idea.supporters || []), currentUser];

    // 3. Appeler API en arrière-plan (ne pas attendre)
    toggleIdeaSupportOnApi(ideaId, currentUser.id).catch(error => {
      console.error('❌ API error:', error);
      // TODO: Implémenter rollback si nécessaire
    });

    // 4. Retourner mise à jour optimiste
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

### navigationActions.ts - Navigation

Actions pour **naviguer** entre les pages et charger les données nécessaires.

#### Principes
- Chargent les données manquantes avant navigation
- Utilisent le chargement progressif
- Mettent à jour `activeTab` et les ID sélectionnés

#### Actions Principales

```typescript
// Navigation avec chargement de données
actions.goToIdea(ideaId, initialTab?)
actions.goToPost(postId, initialTab?)
actions.goToUser(userId)

// Navigation simple
actions.goToTab('discovery')
actions.goToProfile()
actions.goToCreateIdea()

// Actions spéciales
actions.enterPlatform()    // Entrée sur la plateforme
actions.exitPlatform()     // Retour à l'accueil
```

#### Pattern : Chargement Progressif

```typescript
goToIdea: async (ideaId: string, initialTab = 'description') => {
  try {
    const { fetchIdeaDetails } = await import('../api/contentService');
    const { fetchDiscussions } = await import('../api/detailsService');
    
    // 1. Charger les détails complets de l'idée
    const ideaDetails = await fetchIdeaDetails(ideaId);
    if (ideaDetails) {
      actions.addIdea(ideaDetails);
      
      // 2. Charger immédiatement les discussions (comme lineage)
      const discussions = await fetchDiscussions(ideaId, 'idea');
      if (discussions?.length > 0) {
        discussions.forEach(d => actions.addDiscussionTopic(d));
      }
    }
    
    // 3. Naviguer vers la page
    actions.setSelectedIdeaId(ideaId);
    actions.setActiveTab('idea-detail');
  } catch (error) {
    console.error('❌ goToIdea error:', error);
  }
}
```

### userActions.ts - Actions Utilisateur

Actions pour **gérer** les utilisateurs (profils, authentification, préférences).

#### Actions Principales

```typescript
// Gestion utilisateur
actions.addUser(userData)
actions.updateUser(userId, updates)
actions.addUserAndSetAsCurrent(userData)
actions.switchToUserByEmail(email)

// Authentification
actions.loginWithSocialProvider(provider)
actions.signupUser(userData)
actions.checkEmailExists(email)

// Préférences
actions.updateUserPreferences(preferences)
```

## useAuthHandlers.ts

### Rôle

Hook spécialisé pour l'**authentification**. Encapsule la logique complexe de login/signup.

### Utilisation

```typescript
import { useAuthHandlers } from '../hooks/useAuthHandlers';

function WelcomePage() {
  const { actions } = useEntityStoreSimple();
  
  const {
    handleLogin,
    handleSocialLogin,
    handleSignup,
    handleNewsletterSubscribe
  } = useAuthHandlers(
    // Callback succès authentification
    (userData) => {
      actions.addUserAndSetAsCurrent(userData);
    },
    // Callback après connexion
    () => {
      actions.enterPlatform();
    },
    actions.switchToUserByEmail,
    actions.checkEmailExists,
    actions.loginWithSocialProvider,
    actions.signupUser,
    actions.subscribeToNewsletter
  );

  return (
    <LoginDialog onLogin={handleLogin} />
  );
}
```

## useNavigationActions.ts

### Rôle

Hook spécialisé pour la **navigation avec React Router**. Remplace les anciennes actions de navigation du store par des appels à `navigate()`.

### Utilisation

```typescript
import { useNavigationActions } from '../hooks/useNavigationActions';

function IdeaCard({ ideaId }) {
  const navigation = useNavigationActions();
  
  return (
    <button onClick={() => navigation.goToIdea(ideaId)}>
      Voir les détails
    </button>
  );
}
```

### Actions Disponibles

```typescript
// Navigation vers entités
navigation.goToIdea(ideaId)           // Charge et navigue vers /content/ideas/123
navigation.goToPost(postId)           // Charge et navigue vers /content/posts/456
navigation.goToUser(userId)           // Navigue vers /user/123
navigation.goToCommunity(communityId) // Navigue vers /community/c1

// Navigation vers pages
navigation.goToDiscovery()            // Navigue vers /discovery
navigation.goToMyIdeas()              // Navigue vers /my-ideas
navigation.goToCreateIdea()           // Navigue vers /create-idea
navigation.goToProfile()              // Navigue vers /profile
navigation.goToCommunities()          // Navigue vers /communities
navigation.goToHome()                 // Navigue vers /
navigation.goToSignup()               // Navigue vers /signup
```

## useCommunityActions.ts ⭐ NOUVEAU

### Rôle

Hook spécialisé pour les **actions liées aux communautés/groupes de travail**. Encapsule tous les appels au `communityService` et met à jour le store automatiquement.

### Architecture

```
Composant → useCommunityActions → communityService → data/communities.ts → Store
```

### Utilisation

```typescript
import { useCommunityActions } from '../hooks/useCommunityActions';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';

function CommunitiesPage() {
  const { getAllCommunities, getCurrentUser } = useEntityStoreSimple();
  const communityActions = useCommunityActions();
  
  useEffect(() => {
    // Charger toutes les communautés au montage
    communityActions.loadAllCommunities();
  }, []);
  
  const communities = getAllCommunities();
  const currentUser = getCurrentUser();
  
  return (
    <div>
      {communities.map(community => (
        <CommunityCard 
          key={community.id}
          community={community}
          onJoin={() => communityActions.joinCommunity(community.id)}
          onViewDetails={() => communityActions.loadCommunityDetails(community.id)}
        />
      ))}
    </div>
  );
}
```

### Actions Disponibles

```typescript
// Chargement de données
communityActions.loadAllCommunities()                    // Charge toutes les communautés + admins
communityActions.loadCommunityDetails(communityId)       // Charge 1 communauté + tous ses membres
communityActions.loadUserCommunities(userId)             // Charge les communautés d'un utilisateur
communityActions.searchCommunities(query)                // Recherche dans les communautés
communityActions.loadCommunitiesByType(type)             // Filtre par type (thematic, association, etc.)
communityActions.loadPublicCommunities()                 // Charge uniquement les communautés publiques
communityActions.loadCommunityStats(communityId)         // Charge les statistiques

// Actions utilisateur
communityActions.joinCommunity(communityId)              // Rejoindre une communauté
communityActions.leaveCommunity(communityId)             // Quitter une communauté
```

### Principe : Mise à Jour Automatique du Store

Toutes les fonctions de `useCommunityActions` :
1. ✅ Appellent le `communityService`
2. ✅ Récupèrent les communautés + utilisateurs associés
3. ✅ Ajoutent automatiquement tout au store via `actions.addCommunity()` et `actions.addUser()`
4. ✅ Retournent les données pour usage immédiat si nécessaire

**Exemple** :
```typescript
// La fonction fait TOUT automatiquement
await communityActions.loadCommunityDetails('c1');

// Le store est déjà à jour, on peut directement lire
const community = getCommunityById('c1');
const members = getCommunityMembers('c1');
const admins = members.filter(m => m.role === 'admin');
```

## Règles de Conception

### ✅ À Faire

1. **Toujours** utiliser `storeUpdater` pour les mutations
2. **Toujours** lire l'état via sélecteurs dans les actions
3. Protéger les propriétés optionnelles (`?.` et `|| []`)
4. Gérer les erreurs avec try/catch
5. Logger les erreurs importantes avec `console.error('❌ ...')`
6. Utiliser le chargement progressif (pas tout charger d'un coup)

### ❌ À Éviter

1. **JAMAIS accéder directement aux données mockées depuis les hooks !**
   ```typescript
   // ❌ INTERDIT dans un hook !
   import { getIdeaById } from '../api/dataService';
   const idea = await getIdeaById(ideaId); // Ne trouve pas les entités créées dynamiquement
   
   // ✅ CORRECT : Utiliser boundSelectors
   const idea = boundSelectors.getIdeaById(ideaId); // Trouve TOUTES les entités (mockées + dynamiques)
   ```
   
   **Pourquoi ?** Les entités créées dynamiquement (posts, idées créés par l'utilisateur) ne sont QUE dans le store, PAS dans les données mockées !

2. Créer des états locaux pour des données du store
3. Oublier de gérer les cas `null` ou `undefined`
4. Charger toutes les données avant navigation
5. Mélanger logique métier et logique UI dans les composants

### 🔐 Règle Architecturale Critique

**Les données mockées (`/data`) ne doivent servir QUE pour le chargement initial !**

#### Flux de données correct :
```
1. Démarrage app → Charger données mockées → Ajouter au store
2. Utilisateur crée une idée → API simulée → Ajouter au store
3. Composant affiche → Lire depuis store via selectors
```

#### ✅ Chargement initial (UNE SEULE FONCTION)
```typescript
// Dans apiActions.ts - LA SEULE fonction qui accède à dataService
loadInitialData: async () => {
  const { loadMockDataSet } = await import('../api/dataService');
  const mockData = await loadMockDataSet(); // ✅ Charge TOUTES les données
  
  // ⚠️ Ajouter IMMÉDIATEMENT au store !
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

#### ❌ Recherche dans données mockées (INTERDIT)
```typescript
// ❌ Ne JAMAIS faire ça dans un hook !
const { getIdeaById } = await import('../api/dataService');
const idea = await getIdeaById(ideaId); // Cherche dans les données mockées uniquement
```

#### ✅ Recherche dans le store (CORRECT)
```typescript
// ✅ Toujours faire ça
const idea = boundSelectors.getIdeaById(ideaId); // Cherche dans le store (mockées + dynamiques)
```

## Patterns Communs

### 1. Action avec Chargement API Simple

```typescript
loadSomething: async (id: string) => {
  try {
    // 1. Import dynamique du service
    const { fetchSomething } = await import('../api/someService');
    
    // 2. Appel API (retourne données mockées)
    const data = await fetchSomething(id);
    
    // 3. Ajouter au store
    if (data) {
      actions.addSomething(data);
    }
    
    // 4. Retourner les données
    return data;
  } catch (error) {
    console.error('❌ Error loading:', error);
    return null;
  }
}
```

### 1b. Action avec Chargement API et Relations

```typescript
loadSomethingWithRelations: async (id: string) => {
  try {
    // 1. APPELER L'API (retourne données mockées)
    const { fetchLineage } = await import('../api/lineageService');
    const lineageData = await fetchLineage(id, 'idea');
    
    if (!lineageData) return null;
    
    // 2. AJOUTER toutes les entités au store
    lineageData.parents.forEach(parent => {
      if (parent.type === 'idea') {
        const existingIdea = boundSelectors.getIdeaById(parent.id);
        if (!existingIdea) {
          actions.addIdea(convertToIdea(parent));
        }
      } else if (parent.type === 'post') {
        const existingPost = boundSelectors.getPostById(parent.id);
        if (!existingPost) {
          actions.addPost(convertToPost(parent));
        }
      }
    });
    
    // 3. RÉCUPÉRER depuis le store (trouve mockées + dynamiques)
    const currentItem = boundSelectors.getIdeaById(id);
    const parents = lineageData.parents.map(p => {
      return p.type === 'idea' 
        ? boundSelectors.getIdeaById(p.id)
        : boundSelectors.getPostById(p.id);
    }).filter(Boolean);
    
    return { currentItem, parents, children: [...] };
  } catch (error) {
    console.error('❌ Error loading:', error);
    return null;
  }
}
```

**Pourquoi ce pattern en 3 étapes ?**
1. **L'API retourne QUE les données mockées** (ne connaît pas les entités créées dynamiquement)
2. **Ajouter au store** assure que les données mockées sont disponibles
3. **Lire depuis le store** via `boundSelectors` trouve TOUTES les entités (mockées + dynamiques)

### 2. Action avec Mise à Jour Optimiste

```typescript
updateSomething: async (id: string, updates: Partial<T>) => {
  storeUpdater(prevStore => {
    const item = selectors.getItemById(prevStore)(id);
    if (!item) return {};

    // API call (fire and forget)
    updateItemOnApi(id, updates);

    // Optimistic update
    return {
      items: {
        ...prevStore.items,
        [id]: { ...item, ...updates }
      }
    };
  });
}
```

### 3. Action avec Validation

```typescript
createSomething: async (data: CreateData) => {
  // Validation côté client
  if (!data.title || data.title.trim() === '') {
    toast.error('Le titre est requis');
    return;
  }

  try {
    const { createItem } = await import('../api/someService');
    const newItem = await createItem(data);
    
    if (newItem) {
      actions.addItem(newItem);
      toast.success('Créé avec succès');
    }
  } catch (error) {
    console.error('❌ Error creating:', error);
    toast.error('Erreur lors de la création');
  }
}
```

## Debugging

### Tracer les Actions

```typescript
const action = async () => {
  console.log('🔵 Action démarrée');
  
  try {
    const result = await someApiCall();
    console.log('✅ API success:', result);
    
    storeUpdater(prevStore => {
      console.log('📦 Store avant:', prevStore.items);
      const updates = { /* ... */ };
      console.log('📦 Store après:', updates);
      return updates;
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }
};
```

### Vérifier les Sélecteurs

```typescript
const { getAllIdeas, getIdeaById } = useEntityStoreSimple();

console.log('All ideas:', getAllIdeas());
console.log('Specific idea:', getIdeaById('idea-1'));
```
