# TODO - URLs Unifiées

**Objectif** : Unifier les URLs de contenu vers `/content/:id`

---

## Changements nécessaires

### Avant
```
/idea/:id  →  IdeaDetailPageWrapper
/post/:id  →  PostDetailPageWrapper
```

### Après
```
/content/:id  →  ContentDetailPageWrapper (détecte le type via le préfixe ideas/ ou posts/)
```

---

## Tâches

### 1. Créer le wrapper unifié
- [ ] Créer `/router/ContentDetailPageWrapper.tsx`
  - Utiliser `useParams()` pour récupérer `contentId`
  - Détecter le type via `contentId.startsWith('ideas/')` ou `contentId.startsWith('posts/')`
  - Router vers IdeaDetailPageWrapper ou PostDetailPageWrapper

### 2. Modifier les routes
- [ ] `/router/routes.tsx`
  - Remplacer les 2 routes par `/content/:contentId`
  - (Optionnel) Ajouter redirections depuis `/idea/:id` et `/post/:id`

### 3. Modifier les liens dans les composants
- [ ] `/components/IdeaCard.tsx` : Changer `/idea/${id}` → `/content/${id}`
- [ ] `/components/PostCard.tsx` : Changer `/post/${id}` → `/content/${id}`
- [ ] `/components/IdeaVersionsTab.tsx` : Vérifier les liens
- [ ] `/components/ShareIdeaDialog.tsx` : Mettre à jour l'URL de partage
- [ ] `/components/SharePostDialog.tsx` : Mettre à jour l'URL de partage
- [ ] Chercher globalement : `grep -r "to=.*\/idea\/" components/`
- [ ] Chercher globalement : `grep -r "to=.*\/post\/" components/`

### 4. Modifier la navigation programmatique
- [ ] `/hooks/useNavigationActions.ts`
  - `goToIdea`: Changer `/idea/` → `/content/`
  - `goToPost`: Changer `/post/` → `/content/`

### 5. Tests
- [ ] Naviguer vers une idée → URL est `/content/ideas/XXX`
- [ ] Naviguer vers un post → URL est `/content/posts/XXX`
- [ ] Rechargement de page fonctionne
- [ ] Navigation arrière/avant fonctionne

---

## Code du ContentDetailPageWrapper

```tsx
import { useParams } from 'react-router-dom';
import { IdeaDetailPageWrapper } from './IdeaDetailPageWrapper';
import { PostDetailPageWrapper } from './PostDetailPageWrapper';

export function ContentDetailPageWrapper() {
  const { contentId } = useParams<{ contentId: string }>();

  if (!contentId) {
    return <div>ID manquant</div>;
  }

  // Détecter le type via le préfixe
  if (contentId.startsWith('ideas/')) {
    return <IdeaDetailPageWrapper ideaId={contentId} />;
  }

  if (contentId.startsWith('posts/')) {
    return <PostDetailPageWrapper postId={contentId} />;
  }

  return <div>Type de contenu invalide</div>;
}
```

**Note** : Adapter si les wrappers actuels ne prennent pas de props.

---

**Estimation** : 1-2 heures
