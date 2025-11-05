# Guide du Système de Routing - IdeoSphere

**Version** : 1.0  
**Date** : 30 octobre 2025  
**Status** : ✅ Production

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Carte des routes](#carte-des-routes)
3. [Patterns de navigation](#patterns-de-navigation)
4. [Wrappers de page](#wrappers-de-page)
5. [Routes protégées](#routes-protégées)
6. [Routes unifiées](#routes-unifiées)
7. [Hooks de navigation](#hooks-de-navigation)
8. [Bonnes pratiques](#bonnes-pratiques)
9. [Dépannage](#dépannage)

---

## 🎯 Vue d'ensemble

IdeoSphere utilise **React Router v6** pour gérer toute la navigation de l'application.

### Principes

✅ **Une seule source de vérité** : l'URL  
✅ **Navigation déclarative** : Routes définies dans `/router/routes.tsx`  
✅ **Deep linking** : Toutes les pages sont accessibles par URL directe  
✅ **Protection** : Routes authentifiées avec `<ProtectedRoute>`  

### Architecture

```
App.tsx
  └─ <BrowserRouter>
       └─ useRoutes(routes)
            ├─ PublicLayout (/)
            │    ├─ CitizenWelcome
            │    ├─ AboutPage
            │    ├─ FAQPage
            │    └─ ...
            └─ ProtectedRoute
                 └─ AppLayout (/discovery, /my-ideas, ...)
                      ├─ DiscoveryPage
                      ├─ IdeaDetailPage
                      └─ ...
```

---

## 🗺️ Carte des routes

### Routes publiques (non authentifiées)

| Route | Composant | Description |
|-------|-----------|-------------|
| `/` | CitizenWelcome | Page d'accueil publique |
| `/about` | AboutPage | À propos de la plateforme |
| `/how-it-works` | HowItWorksPage | Comment ça marche |
| `/faq` | FAQPage | Questions fréquentes |
| `/privacy` | PrivacyPolicyPage | Politique de confidentialité |
| `/terms` | TermsPage | Conditions d'utilisation |
| `/signup` | SignupPage | Inscription |

### Routes protégées (authentification requise)

| Route | Composant | Description |
|-------|-----------|-------------|
| `/discovery` | DiscoveryPage | Fil d'actualité principal |
| `/my-ideas` | MyIdeasPage | Mes contributions |
| `/create-idea` | CreateIdeaPage | Créer une idée |
| `/communities` | CommunitiesPage | Liste des communautés |
| `/profile` | UserProfilePage | Mon profil |

### Routes unifiées avec paramètres

| Route | Wrapper | Composant final | Description |
|-------|---------|-----------------|-------------|
| `/content/*` | ContentDetailPageWrapper | IdeaDetailPage ou PostDetailPage | Détail d'un contenu (auto-détection) |
| `/community/:id` | CommunityDetailPageWrapper | CommunityDetailPage | Détail d'une communauté |
| `/user/:id` | UserProfilePagePublicWrapper | UserProfilePagePublic | Profil public d'un utilisateur |

#### ⚠️ Note importante sur `/content/*`

La route `/content/*` utilise un **splat route** (`*`) pour capturer les IDs avec slashes :

```
/content/ideas/5        → IdeaDetailPage (ideas/5)
/content/posts/post-2   → PostDetailPage (posts/post-2)
```

**Pourquoi splat ?** Car React Router ne peut pas matcher les slashes dans les paramètres classiques (`:id`).

---

## 🧭 Patterns de navigation

### 1. Navigation par liens (recommandé pour UI)

```tsx
import { Link } from 'react-router-dom';

// Lien simple
<Link to="/discovery">Fil d'actualité</Link>

// Lien avec ID
<Link to={`/content/${ideaId}`}>Voir l'idée</Link>
<Link to={`/user/${userId}`}>Voir le profil</Link>
```

### 2. Navigation programmatique (pour logique)

```tsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/discovery');
  };
  
  const handleBack = () => {
    navigate(-1); // Retour arrière
  };
  
  return <button onClick={handleClick}>Aller au fil</button>;
}
```

### 3. Navigation avec helpers (recommandé)

```tsx
import { useNavigationActions } from '../hooks/useNavigationActions';

function MyComponent() {
  const navigation = useNavigationActions();
  
  return (
    <>
      <button onClick={() => navigation.goToIdea('ideas/123')}>
        Voir l'idée
      </button>
      <button onClick={() => navigation.goToPost('posts/456')}>
        Voir le post
      </button>
      <button onClick={navigation.goToDiscovery}>
        Retour au fil
      </button>
    </>
  );
}
```

---

## 🔄 Wrappers de page

Chaque page avec paramètres a un **wrapper** qui :
1. Extrait les paramètres de l'URL avec `useParams()`
2. Charge les données si nécessaire
3. Passe les données au composant de page

### Exemple : IdeaDetailPageWrapper

```tsx
// router/IdeaDetailPageWrapper.tsx
export function IdeaDetailPageWrapper() {
  const params = useParams<{ '*'?: string }>();
  const ideaId = params['*']; // Récupère "ideas/123"
  const navigate = useNavigate();
  const { getIdeaById, actions } = useEntityStoreSimple();
  const [idea, setIdea] = useState<Idea | null>(null);
  
  useEffect(() => {
    // Charger l'idée...
    loadIdea(ideaId);
  }, [ideaId]);
  
  return <IdeaDetailPage idea={idea} />;
}
```

### Pattern général

```
URL params → Wrapper (charge données) → Page (affiche)
```

**Avantages** :
- ✅ Composant de page reste pur (props uniquement)
- ✅ Logique de chargement centralisée
- ✅ Facile à tester

---

## 🔒 Routes protégées

### ProtectedRoute

```tsx
// router/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { getCurrentUser } = useEntityStoreSimple();
  const currentUser = getCurrentUser();
  const isAuthenticated = currentUser?.isRegistered ?? false;
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}
```

### Utilisation

```tsx
// routes.tsx
{
  path: '/*',
  element: (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  ),
  children: [
    { path: 'discovery', element: <DiscoveryPageWrapper /> },
    { path: 'my-ideas', element: <MyIdeasPageWrapper /> },
    // ...
  ]
}
```

**Comportement** :
- Utilisateur non authentifié → Redirigé vers `/`
- Utilisateur authentifié → Accès autorisé

---

## 🎯 Routes unifiées

### Concept

Au lieu d'avoir des routes séparées pour chaque type de contenu :

```tsx
// ❌ Ancien système (dupliqué)
<Route path="idea/:ideaId" element={<IdeaDetailPage />} />
<Route path="post/:postId" element={<PostDetailPage />} />
```

Nous avons une route unifiée qui détecte automatiquement le type :

```tsx
// ✅ Nouveau système (unifié)
<Route path="content/*" element={<ContentDetailPageWrapper />} />
```

### ContentDetailPageWrapper

```tsx
export function ContentDetailPageWrapper() {
  const { '*': contentId } = useParams<{ '*': string }>();
  
  // Détection automatique du type
  if (contentId?.startsWith('ideas/')) {
    return <IdeaDetailPageWrapper />; // IdeaDetailPageWrapper extrait l'ID réel
  }
  
  if (contentId?.startsWith('posts/')) {
    return <PostDetailPageWrapper />; // PostDetailPageWrapper extrait l'ID réel
  }
  
  return <div>Type de contenu invalide</div>;
}
```

### IdeaDetailPageWrapper et PostDetailPageWrapper

Ces wrappers extraient automatiquement l'ID réel depuis le format préfixé :

```tsx
// Dans IdeaDetailPageWrapper
let ideaId = params['*'] || params.contentId || params.ideaId;

// Extraire l'ID réel si le format est 'ideas/xxx'
if (ideaId?.startsWith('ideas/')) {
  ideaId = ideaId.substring(6); // 'ideas/123' → '123'
}
```

### Avantages

✅ **URLs cohérentes** : Toujours `/content/:id`  
✅ **Pas de duplication** : Un seul point d'entrée  
✅ **Extensible** : Facile d'ajouter de nouveaux types  
✅ **IDs préfixés** : `ideas/123`, `posts/456` (cohérent avec l'API)  
✅ **Navigation transparente** : Les hooks ajoutent automatiquement le préfixe  

---

## 🛠️ Hooks de navigation

### useNavigationActions

Hook custom qui fournit des helpers de navigation :

```typescript
export function useNavigationActions() {
  const navigate = useNavigate();
  
  return {
    // Navigation vers pages principales
    goToDiscovery: () => navigate('/discovery'),
    goToMyIdeas: () => navigate('/my-ideas'),
    goToCreateIdea: () => navigate('/create-idea'),
    goToCommunities: () => navigate('/communities'),
    goToProfile: () => navigate('/profile'),
    
    // Navigation vers détails (avec ID)
    goToIdea: (ideaId: string) => navigate(`/content/${ideaId}`),
    goToPost: (postId: string) => navigate(`/content/${postId}`),
    goToUser: (userId: string) => navigate(`/user/${userId}`),
    goToCommunity: (communityId: string) => navigate(`/community/${communityId}`),
    
    // Navigation relative
    goBack: () => navigate(-1),
  };
}
```

### Utilisation

```tsx
import { useNavigationActions } from '../hooks/useNavigationActions';

function IdeaCard({ idea }) {
  const navigation = useNavigationActions();
  
  return (
    <div onClick={() => navigation.goToIdea(idea.id)}>
      {idea.title}
    </div>
  );
}
```

### useParams

Récupérer les paramètres d'URL :

```tsx
import { useParams } from 'react-router-dom';

function MyComponent() {
  // Route avec paramètre classique
  const { ideaId } = useParams<{ ideaId: string }>();
  
  // Route avec splat (*)
  const { '*': contentId } = useParams<{ '*': string }>();
  
  return <div>ID: {ideaId || contentId}</div>;
}
```

### useLocation

Accéder à l'URL actuelle :

```tsx
import { useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();
  const isActive = location.pathname === '/discovery';
  
  return (
    <Link 
      to="/discovery" 
      className={isActive ? 'active' : ''}
    >
      Fil d'actualité
    </Link>
  );
}
```

---

## ✅ Bonnes pratiques

### 1. Toujours utiliser <Link> pour la navigation UI

```tsx
// ✅ BON
<Link to="/discovery">Fil d'actualité</Link>

// ❌ MAUVAIS
<a href="/discovery">Fil d'actualité</a>  // Recharge la page
<div onClick={() => window.location.href = '/discovery'}>  // Recharge aussi
```

### 2. Utiliser les helpers de navigation

```tsx
// ✅ BON
const navigation = useNavigationActions();
navigation.goToIdea(ideaId);

// ⚠️ OK mais verbeux
const navigate = useNavigate();
navigate(`/content/${ideaId}`);
```

### 3. Toujours typer useParams

```tsx
// ✅ BON
const { ideaId } = useParams<{ ideaId: string }>();

// ❌ MAUVAIS
const { ideaId } = useParams();  // Type any
```

### 4. Gérer les IDs manquants

```tsx
// ✅ BON
const { ideaId } = useParams<{ ideaId: string }>();

if (!ideaId) {
  return <Navigate to="/discovery" replace />;
}

// Utiliser ideaId en toute sécurité
```

### 5. Ne jamais manipuler window.location

```tsx
// ❌ MAUVAIS
window.location.href = '/discovery';
window.location.reload();

// ✅ BON
navigate('/discovery');
```

### 6. Utiliser replace pour les redirections

```tsx
// Redirection permanente (ne pas ajouter à l'historique)
navigate('/discovery', { replace: true });

// Ou avec <Navigate>
<Navigate to="/discovery" replace />
```

---

## 🐛 Dépannage

### Problème : "No routes matched location"

**Cause** : La route n'existe pas ou le path est incorrect.

**Solutions** :
1. Vérifier que la route est définie dans `/router/routes.tsx`
2. Vérifier l'orthographe du path
3. Pour les IDs avec slashes, utiliser splat route (`*`)

```tsx
// ❌ Ne marche pas si l'ID contient un slash
<Route path="content/:id" />

// ✅ Fonctionne avec slashes
<Route path="content/*" />
```

### Problème : Page se recharge lors de la navigation

**Cause** : Utilisation de `<a>` au lieu de `<Link>`.

**Solution** :
```tsx
// ❌ Recharge la page
<a href="/discovery">Fil</a>

// ✅ Navigation SPA
<Link to="/discovery">Fil</Link>
```

### Problème : L'URL ne se met pas à jour

**Cause** : Utilisation d'actions obsolètes du store.

**Solution** :
```tsx
// ❌ Obsolète (ne change pas l'URL)
actions.setActiveTab('discovery');

// ✅ React Router
navigate('/discovery');
```

### Problème : Rechargement de page montre mauvais contenu

**Cause** : Dépendance sur le store au lieu de l'URL.

**Solution** :
```tsx
// ❌ Lit depuis le store
const idea = getSelectedIdea();

// ✅ Lit depuis l'URL
const { ideaId } = useParams();
const idea = getIdeaById(ideaId);
```

### Problème : useParams retourne undefined

**Cause** : Le composant n'est pas un enfant de `<Route>`.

**Solution** : Créer un wrapper et l'utiliser dans la route :
```tsx
// Route
<Route path="idea/:ideaId" element={<IdeaWrapper />} />

// Wrapper
function IdeaWrapper() {
  const { ideaId } = useParams(); // ✅ Fonctionne
  return <IdeaPage ideaId={ideaId} />;
}
```

---

## 📚 Ressources

### Documentation interne

- **`/router/routes.tsx`** - Définition de toutes les routes
- **`/router/README.md`** - Documentation des wrappers
- **`/PLAN_MIGRATION_REACT_ROUTER.md`** - Plan de migration complet
- **`/MIGRATION_PHASE_6_COMPLETE.md`** - Complétion du nettoyage

### Documentation externe

- [React Router v6 Docs](https://reactrouter.com/en/main)
- [useNavigate Hook](https://reactrouter.com/en/main/hooks/use-navigate)
- [useParams Hook](https://reactrouter.com/en/main/hooks/use-params)
- [Splat Routes](https://reactrouter.com/en/main/route/route#splats)

---

## 🎯 Checklist développeur

Avant de créer une nouvelle page/route :

- [ ] Définir le path dans `/router/routes.tsx`
- [ ] Créer le wrapper si nécessaire (avec paramètres)
- [ ] Ajouter la route au bon layout (Public ou Protected)
- [ ] Créer le helper dans `useNavigationActions` si navigation fréquente
- [ ] Tester l'URL directement dans le navigateur
- [ ] Tester le rechargement de page
- [ ] Tester les boutons précédent/suivant

---

**Document maintenu à jour - Dernière mise à jour : 30 octobre 2025**
