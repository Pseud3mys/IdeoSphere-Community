# ⚠️ OBSOLÈTE - Ce document est dépassé (Phase 5 terminée)

**Date de dépréciation :** Octobre 2025  
**Raison :** Migration vers React Router terminée (Phases 5 & 6)

---

# Synchronisation URL et État de l'Application

## ⚠️ AVERTISSEMENT

**Ce document décrit l'ancien système de synchronisation URL basé sur query parameters et `URLStateSync.tsx`.**

**Ce système a été remplacé par React Router en Phase 4-5. Consultez la nouvelle documentation :**
- `/router/README.md` - Documentation du nouveau système de routing
- `/PLAN_MIGRATION_REACT_ROUTER.md` - Plan de migration
- `/MIGRATION_PHASE_5_STATUS.md` - Statut de la migration

---

## Ancien système (déprécié)

L'application IdeoSphere **utilisait** un système de synchronisation URL basé sur les **query parameters** (paramètres de requête).

**Ancien format d'URL :** `https://app.example.com/?tab=discovery&ideaId=idea-123`

**Nouveau format d'URL :** `https://app.example.com/discovery` et `https://app.example.com/idea/idea-123`

### Ce qui a changé

| Avant (Query Params) | Après (React Router) |
|---------------------|---------------------|
| `?tab=discovery` | `/discovery` |
| `?tab=idea-detail&ideaId=123` | `/idea/123` |
| `?tab=post-detail&postId=456` | `/post/456` |
| `?tab=profile&userId=789` | `/profile/789` |
| `?tab=my-ideas` | `/my-ideas` |
| `?tab=create-idea` | `/create-idea` |

### Composants supprimés

- ❌ **`URLStateSync.tsx`** - Plus nécessaire (React Router gère la synchronisation)
- ❌ **`NavigationLink.tsx`** - Remplacé par `<Link>` de react-router-dom
- ❌ **`AppContent.tsx`** - Remplacé par les routes de React Router

### Actions supprimées du store

- ❌ `actions.goToTab(tab)` - Utilisez `navigate('/path')` ou `navigation.goToXxx()`
- ❌ `actions.goToIdea(id)` - Utilisez `navigate(`/idea/${id}`)` ou `navigation.goToIdea(id)`
- ❌ `actions.goToPost(id)` - Utilisez `navigate(`/post/${id}`)` ou `navigation.goToPost(id)`
- ❌ `actions.goToUser(id)` - Utilisez `navigate(`/profile/${id}`)` ou `navigation.goToUser(id)`

### État supprimé du store

- ❌ `activeTab: TabType` - Remplacé par `useLocation().pathname`
- ❌ `selectedIdeaId: string | null` - Remplacé par `useParams().ideaId`
- ❌ `selectedPostId: string | null` - Remplacé par `useParams().postId`
- ❌ `selectedUserId: string | null` - Remplacé par `useParams().userId`
- ❌ `selectedCommunityId: string | null` - Remplacé par `useParams().communityId` (Phase 6)

---

## Nouvelle approche (React Router)

### Navigation programmatique

```typescript
import { useNavigate } from 'react-router-dom';
import { useNavigationActions } from '../hooks/useNavigationActions';

// Approche 1 : Navigation directe avec useNavigate
const navigate = useNavigate();
navigate('/discovery');
navigate('/idea/123');
navigate('/post/456');

// Approche 2 : Actions de navigation (recommandé)
const navigation = useNavigationActions();
navigation.goToIdea('123');
navigation.goToPost('456');
navigation.goToUser('789');
navigation.goToCreateIdea();
```

### Liens cliquables

```tsx
import { Link } from 'react-router-dom';

// Au lieu de <NavigationLink>
<Link to="/discovery">Fil d'actualité</Link>
<Link to={`/idea/${ideaId}`}>Voir l'idée</Link>
<Link to={`/post/${postId}`}>Voir le post</Link>
```

### Récupérer les paramètres d'URL

```tsx
import { useParams, useLocation } from 'react-router-dom';

// Au lieu de selectedIdeaId du store
const { ideaId } = useParams<{ ideaId: string }>();

// Au lieu de activeTab du store
const location = useLocation();
const currentPath = location.pathname;
```

### Wrappers de page

Chaque page de détail a maintenant un wrapper qui :
1. Récupère l'ID depuis `useParams()`
2. Charge les données si nécessaire
3. Passe les données au composant de page

Exemple :
```tsx
// router/IdeaDetailPageWrapper.tsx
export function IdeaDetailPageWrapper() {
  const { ideaId } = useParams<{ ideaId: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);
  
  // Charger l'idée...
  
  return <IdeaDetailPage idea={idea} />;
}
```

---

## Migration guide

Si vous avez du code ancien qui utilise l'ancien système :

1. **Remplacer les actions de navigation**
   ```typescript
   // ❌ Avant
   actions.goToIdea(ideaId);
   
   // ✅ Après
   const navigation = useNavigationActions();
   navigation.goToIdea(ideaId);
   ```

2. **Remplacer les liens**
   ```tsx
   // ❌ Avant
   <NavigationLink ideaId={ideaId}>Voir l'idée</NavigationLink>
   
   // ✅ Après
   <Link to={`/idea/${ideaId}`}>Voir l'idée</Link>
   ```

3. **Remplacer l'accès à l'état de navigation**
   ```typescript
   // ❌ Avant
   const activeTab = store.activeTab;
   const selectedIdeaId = store.selectedIdeaId;
   
   // ✅ Après
   const location = useLocation();
   const { ideaId } = useParams();
   ```

---

## Documentation actuelle

Consultez ces documents pour la documentation à jour :

- **`/router/README.md`** - Guide complet du système de routing
- **`/PLAN_MIGRATION_REACT_ROUTER.md`** - Plan de migration en 7 phases
- **`/MIGRATION_PHASE_5_STATUS.md`** - Statut final de la migration
- **`/hooks/useNavigationActions.ts`** - Nouvelles actions de navigation

---

**Ce document est conservé à titre de référence historique uniquement.**
