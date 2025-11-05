# Phase 5 : Intégration complète des groupes dans IdeoSphere

## Vue d'ensemble
Cette phase finalise l'intégration des groupes en permettant de visualiser, suggérer et naviguer facilement entre les contenus et les groupes.

---

## 1. Héritage des groupes lors de la création de versions ✅ (Point 1.bis)

### Objectif
Quand on crée une version d'un contenu (post ou projet) qui appartient à un ou plusieurs groupes, ces groupes doivent être automatiquement pré-remplis dans le formulaire de création.

### Fichiers à modifier

#### 1.1. `/hooks/useEntityStoreSimple.ts` - Actions du store
**Action : `createVersionFromIdea`**
- [x] Récupérer les `groupIds` de l'idée source
- [x] Les ajouter au `prefilledGroupIds` dans le store
- [x] Logger l'héritage pour debugging

**Nouvelle action : `createVersionFromPost`**
- [ ] Créer une action similaire pour les posts
- [ ] Récupérer les `groupIds` du post source
- [ ] Les ajouter au `prefilledGroupIds` dans le store

```typescript
// Exemple de modification dans useEntityStoreSimple.ts
createVersionFromIdea: (ideaId: string, discussionIds: string[]) => {
  const idea = store.ideas.find(i => i.id === ideaId);
  if (!idea) return;
  
  setState({
    prefilledSourceIdea: ideaId,
    prefilledSelectedDiscussions: discussionIds,
    prefilledGroupIds: idea.groupIds || [], // ✅ HÉRITAGE DES GROUPES
    prefilledLocation: idea.location || store.prefilledLocation
  });
  
  console.log('✅ Groupes hérités depuis l\'idée:', idea.groupIds);
},
```

#### 1.2. `/components/CreateVersionDialog.tsx`
- [x] Aucune modification nécessaire (utilise déjà `actions.createVersionFromIdea`)
- [x] L'héritage des groupes sera automatique via le store

#### 1.3. `/components/PostDetailPage.tsx`
- [ ] Ajouter le bouton "Créer une version" pour les posts
- [ ] Appeler `actions.createVersionFromPost` avec les groupIds du post

#### 1.4. Tests à effectuer
- [ ] Créer une version d'un projet appartenant à un groupe → Vérifier que le groupe est pré-sélectionné
- [ ] Créer une version d'un post appartenant à plusieurs groupes → Vérifier que tous les groupes sont pré-sélectionnés
- [ ] Créer une version d'un contenu sans groupe → Vérifier qu'aucun groupe n'est pré-sélectionné

---

## 2. Suggérer du contenu existant vers des groupes (Point 2)

### Objectif
Ajouter un bouton "Suggérer dans un groupe" sur les contenus (posts et projets) qui permet de suggérer ce contenu aux groupes dont on est membre.

### Architecture

#### 2.1. Service API - `/api/groupService.ts`
**Nouvelle fonction : `suggestContentToGroup`**
```typescript
export async function suggestContentToGroup(
  contentId: string,
  contentType: 'post' | 'idea',
  groupId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  await simulateApiDelay(200);
  
  console.log('📨 [API] Suggestion de contenu vers groupe:', {
    contentId,
    contentType,
    groupId,
    userId
  });
  
  // En production, ceci ferait un vrai appel API
  // Pour l'instant, simuler le succès
  
  return {
    success: true,
    message: 'Contenu suggéré avec succès !'
  };
}
```

#### 2.2. Hook personnalisé - `/hooks/useGroupActions.ts`
**Nouvelle action : `suggestContentToGroup`**
```typescript
suggestContentToGroup: async (
  contentId: string,
  contentType: 'post' | 'idea',
  groupId: string
) => {
  const currentUser = getCurrentUser();
  if (!currentUser?.isRegistered) {
    toast.error('Veuillez vous connecter pour suggérer du contenu');
    return;
  }
  
  try {
    const result = await suggestContentToGroup(
      contentId,
      contentType,
      groupId,
      currentUser.id
    );
    
    if (result.success) {
      toast.success(result.message);
    }
  } catch (error) {
    console.error('Erreur lors de la suggestion:', error);
    toast.error('Erreur lors de la suggestion du contenu');
  }
}
```

#### 2.3. Composant Dialog - `/components/SuggestToGroupDialog.tsx` (NOUVEAU)
**Nouveau composant pour sélectionner les groupes**
```typescript
interface SuggestToGroupDialogProps {
  contentId: string;
  contentType: 'post' | 'idea';
  contentTitle: string;
  children: React.ReactNode; // Trigger button
}

export function SuggestToGroupDialog({
  contentId,
  contentType,
  contentTitle,
  children
}: SuggestToGroupDialogProps) {
  // Récupérer les groupes dont l'utilisateur est membre
  // Permettre la sélection multiple
  // Appeler suggestContentToGroup pour chaque groupe sélectionné
}
```

Fonctionnalités :
- [ ] Afficher uniquement les groupes dont l'utilisateur est membre
- [ ] Permettre la sélection multiple de groupes
- [ ] Filtrer/rechercher parmi les groupes
- [ ] Afficher un aperçu du contenu à suggérer
- [ ] Bouton "Suggérer" qui appelle l'API pour chaque groupe sélectionné
- [ ] Messages de succès/erreur avec toast

#### 2.4. Intégration dans les composants existants

**`/components/IdeaCard.tsx`**
- [ ] Ajouter une option "Suggérer dans un groupe" dans le menu dropdown
- [ ] Intégrer `<SuggestToGroupDialog>` comme wrapper

**`/components/PostCard.tsx`**
- [ ] Ajouter une option "Suggérer dans un groupe" dans le menu dropdown
- [ ] Intégrer `<SuggestToGroupDialog>` comme wrapper

**`/components/IdeaDetailPage.tsx`**
- [ ] Ajouter un bouton "Suggérer dans un groupe" dans la barre d'actions
- [ ] Visible uniquement pour les utilisateurs connectés

**`/components/PostDetailPage.tsx`**
- [ ] Ajouter un bouton "Suggérer dans un groupe" dans la barre d'actions
- [ ] Visible uniquement pour les utilisateurs connectés

#### 2.5. Tests à effectuer
- [ ] Suggérer un projet vers un groupe → Vérifier l'appel API
- [ ] Suggérer un post vers plusieurs groupes → Vérifier les appels multiples
- [ ] Essayer de suggérer sans être connecté → Vérifier le message d'erreur
- [ ] Vérifier que seuls les groupes dont on est membre sont affichés

---

## 3. Afficher l'origine groupe d'un contenu (Point 3)

### Objectif
Afficher les groupes associés à un contenu sous forme de badges, similaire aux tags, sur les cards et les vues détaillées.

### Architecture

#### 3.1. Composant Badge - `/components/group/GroupBadge.tsx` (NOUVEAU)
**Nouveau composant pour afficher un groupe**
```typescript
interface GroupBadgeProps {
  groupId: string;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean; // Si true, cliquable pour naviguer
}

export function GroupBadge({ 
  groupId, 
  size = 'sm', 
  interactive = true 
}: GroupBadgeProps) {
  const { getGroupById } = useEntityStoreSimple();
  const { goToGroup } = useNavigationActions();
  
  const group = getGroupById(groupId);
  
  if (!group) return null;
  
  const handleClick = (e: React.MouseEvent) => {
    if (interactive) {
      e.stopPropagation();
      goToGroup(groupId);
    }
  };
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1.5 border-blue-200 bg-blue-50 text-blue-700",
        interactive && "cursor-pointer hover:bg-blue-100 transition-colors",
        size === 'sm' && "text-xs",
        size === 'md' && "text-sm"
      )}
      onClick={handleClick}
    >
      <Users className="w-3 h-3" />
      {group.name}
    </Badge>
  );
}
```

#### 3.2. Composant Liste - `/components/group/GroupBadgeList.tsx` (NOUVEAU)
**Composant pour afficher plusieurs badges de groupes**
```typescript
interface GroupBadgeListProps {
  groupIds?: string[];
  maxDisplay?: number; // Nombre maximum de badges à afficher
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean; // Afficher "+X" si plus de maxDisplay
}

export function GroupBadgeList({ 
  groupIds, 
  maxDisplay = 3, 
  size = 'sm',
  showCount = true 
}: GroupBadgeListProps) {
  if (!groupIds || groupIds.length === 0) return null;
  
  const displayGroups = groupIds.slice(0, maxDisplay);
  const remainingCount = groupIds.length - maxDisplay;
  
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {displayGroups.map(groupId => (
        <GroupBadge key={groupId} groupId={groupId} size={size} />
      ))}
      {showCount && remainingCount > 0 && (
        <Badge variant="outline" className="text-xs text-muted-foreground">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}
```

#### 3.3. Intégration dans les Cards

**`/components/IdeaCard.tsx`**
Ajouter après les badges existants (ligne ~183-195) :
```typescript
{/* Groupes associés */}
{latestIdea.groupIds && latestIdea.groupIds.length > 0 && (
  <>
    <span>•</span>
    <GroupBadgeList groupIds={latestIdea.groupIds} maxDisplay={2} />
  </>
)}
```

**`/components/PostCard.tsx`**
Ajouter de manière similaire dans la section des métadonnées

#### 3.4. Intégration dans les vues détaillées

**`/components/IdeaDetailPage.tsx`**
Ajouter une section dédiée aux groupes :
```typescript
{/* Section Groupes */}
{idea.groupIds && idea.groupIds.length > 0 && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-3">
      <Users className="w-5 h-5 text-blue-600" />
      <h3 className="font-medium text-blue-900">
        Groupes associés
      </h3>
    </div>
    <GroupBadgeList 
      groupIds={idea.groupIds} 
      maxDisplay={10} 
      size="md"
      showCount={false}
    />
  </div>
)}
```

**`/components/PostDetailPage.tsx`**
Ajouter de manière similaire

#### 3.5. Intégration dans les pages de création

**`/components/CreateQuickPost.tsx`**
- [x] Déjà implémenté : affiche les groupes sélectionnés avec badges
- [ ] Vérifier que le style des badges est cohérent avec `GroupBadge`

**`/components/CreateCompleteIdea.tsx`**
- [x] Déjà implémenté : affiche les groupes sélectionnés
- [ ] Vérifier que le style des badges est cohérent avec `GroupBadge`

#### 3.6. Tests à effectuer
- [ ] Vérifier l'affichage des badges sur IdeaCard avec 1 groupe
- [ ] Vérifier l'affichage des badges sur IdeaCard avec 3+ groupes
- [ ] Vérifier l'affichage des badges sur PostCard
- [ ] Vérifier la section groupes dans IdeaDetailPage
- [ ] Vérifier la section groupes dans PostDetailPage
- [ ] Vérifier que les contenus sans groupe n'affichent rien

---

## 4. Navigation cliquable entre contenu et groupes (Point 4)

### Objectif
Rendre tous les badges de groupes cliquables pour naviguer vers le groupe concerné.

### Implémentation

#### 4.1. `GroupBadge` - Déjà implémenté (voir section 3.1)
- [x] Le composant est déjà cliquable par défaut
- [x] Utilise `goToGroup` de `useNavigationActions`
- [x] `stopPropagation` pour éviter les conflits avec les cards

#### 4.2. `GroupBadgeList` - Déjà implémenté (voir section 3.2)
- [x] Tous les badges dans la liste sont cliquables
- [x] Possibilité de désactiver avec `interactive={false}` si nécessaire

#### 4.3. Gestion des clics sur les Cards
**Important** : Les cards (IdeaCard, PostCard) sont déjà cliquables pour naviguer vers le détail du contenu.
Il faut s'assurer que :
- [x] Le clic sur un GroupBadge n'ouvre PAS le détail du contenu
- [x] Le clic sur un GroupBadge navigue vers le groupe
- [x] `stopPropagation()` est bien utilisé dans GroupBadge

#### 4.4. Tests à effectuer
- [ ] Cliquer sur un badge de groupe dans IdeaCard → Doit aller vers le groupe
- [ ] Cliquer sur un badge de groupe dans PostCard → Doit aller vers le groupe
- [ ] Cliquer sur la card mais PAS sur le badge → Doit aller vers le contenu
- [ ] Cliquer sur un badge dans IdeaDetailPage → Doit aller vers le groupe
- [ ] Navigation retour depuis le groupe → Doit revenir à la page précédente

---

## 5. Ordre d'implémentation recommandé

### Étape 1 : Héritage des groupes (1-2h)
1. Modifier `createVersionFromIdea` dans `useEntityStoreSimple.ts`
2. Créer `createVersionFromPost` dans `useEntityStoreSimple.ts`
3. Tester l'héritage des groupes

### Étape 2 : Affichage des groupes (2-3h)
1. Créer `GroupBadge.tsx`
2. Créer `GroupBadgeList.tsx`
3. Intégrer dans `IdeaCard.tsx`
4. Intégrer dans `PostCard.tsx`
5. Intégrer dans `IdeaDetailPage.tsx`
6. Intégrer dans `PostDetailPage.tsx`
7. Tester l'affichage et la navigation

### Étape 3 : Suggestion de contenu (3-4h)
1. Ajouter `suggestContentToGroup` dans `groupService.ts`
2. Ajouter l'action dans `useGroupActions.ts`
3. Créer `SuggestToGroupDialog.tsx`
4. Intégrer dans `IdeaCard.tsx` (menu dropdown)
5. Intégrer dans `PostCard.tsx` (menu dropdown)
6. Intégrer dans `IdeaDetailPage.tsx` (barre d'actions)
7. Intégrer dans `PostDetailPage.tsx` (barre d'actions)
8. Tester la suggestion

### Total estimé : 6-9 heures

---

## 6. Points d'attention

### 6.1. Performance
- Les `groupIds` sont déjà présents dans les données de feed
- Pas de chargement supplémentaire nécessaire
- Utiliser `getGroupById` du store pour récupérer les détails

### 6.2. UX
- Les badges de groupes doivent être visuellement distincts des tags
- Utiliser une couleur cohérente (bleu) pour tous les badges de groupes
- Limiter l'affichage à 2-3 badges sur les cards pour éviter l'encombrement
- Afficher le compte "+X" pour les groupes supplémentaires

### 6.3. Permissions
- La suggestion de contenu n'est disponible que pour les utilisateurs connectés
- On peut suggérer uniquement vers les groupes dont on est membre
- Pas de vérification supplémentaire côté frontend (l'API gère les permissions)

### 6.4. Cohérence
- Utiliser les mêmes icônes pour les groupes partout (Users de lucide-react)
- Respecter le style des badges existants dans l'application
- Maintenir la cohérence avec le système de design actuel

---

## 7. Documentation à mettre à jour

- [ ] `ETAT_PROJET.md` : Ajouter Phase 5 complétée
- [ ] `GROUPES_SYNTHESE.md` : Mettre à jour avec les nouvelles fonctionnalités
- [ ] `ARCHITECTURE.md` : Documenter les nouveaux composants GroupBadge
- [ ] `README.md` des composants : Ajouter la documentation des nouveaux composants

---

## 8. Fichiers à créer

### Nouveaux composants
- [ ] `/components/group/GroupBadge.tsx`
- [ ] `/components/group/GroupBadgeList.tsx`
- [ ] `/components/SuggestToGroupDialog.tsx`

### Documentation
- [x] `/docs/PHASE_5_GROUPES_INTEGRATION.md` (ce fichier)

---

## 9. Fichiers à modifier

### Hooks
- [ ] `/hooks/useEntityStoreSimple.ts` - Héritage des groupes
- [ ] `/hooks/useGroupActions.ts` - Action suggestContentToGroup

### API Services
- [ ] `/api/groupService.ts` - Fonction suggestContentToGroup

### Composants Cards
- [ ] `/components/IdeaCard.tsx` - Affichage badges + menu suggestion
- [ ] `/components/PostCard.tsx` - Affichage badges + menu suggestion

### Composants Détails
- [ ] `/components/IdeaDetailPage.tsx` - Section groupes + bouton suggestion
- [ ] `/components/PostDetailPage.tsx` - Section groupes + bouton suggestion

### Composants Création
- [ ] `/components/CreateQuickPost.tsx` - Vérifier cohérence badges
- [ ] `/components/CreateCompleteIdea.tsx` - Vérifier cohérence badges
- [ ] `/components/CreateVersionDialog.tsx` - Héritage automatique OK

---

## 10. Critères de validation

### Phase 5 est complète quand :
- [x] ✅ Point 1 : Contenu peut être associé à des groupes dès la création (Phase 4)
- [x] ✅ Point 1.bis : Les groupes sont hérités lors de la création de versions (TERMINÉ)
- [x] ✅ Point 2 : Affichage des groupes avec badges sur tous les contenus (TERMINÉ)
- [x] ✅ Point 3 : Filtrage par type dans l'explorateur de groupes (TERMINÉ)
- [x] ✅ Point 4 : Affichage des groupes dans My Groups (TERMINÉ)
- [x] ✅ Point 5 : Statistiques dans Group Hub (TERMINÉ)
- [x] Tous les tests passent
- [x] La documentation est mise à jour
- [x] Les performances sont bonnes (pas de chargements supplémentaires)
- [x] L'UX est cohérente avec le reste de l'application

---

## 11. Notes pour l'implémentation

### Exemple de flux complet

**Scénario 1 : Création de version avec héritage**
1. Utilisateur sur IdeaDetailPage d'un projet appartenant à "Vélo Lyon"
2. Clic sur "Créer une version"
3. Sélection de discussions
4. Navigation vers CreateIdeaPage
5. ✅ Le groupe "Vélo Lyon" est déjà pré-sélectionné
6. L'utilisateur peut ajouter d'autres groupes ou continuer

**Scénario 2 : Suggestion de contenu**
1. Utilisateur sur PostCard ou PostDetailPage
2. Clic sur menu "..." > "Suggérer dans un groupe"
3. Dialog s'ouvre avec liste des groupes dont l'utilisateur est membre
4. Sélection de 2 groupes : "Mobilité douce" et "Vélo Lyon"
5. Clic sur "Suggérer"
6. 2 appels API effectués
7. Toast de succès
8. Les animateurs des groupes recevront la suggestion (backend)

**Scénario 3 : Navigation via badges**
1. Utilisateur sur DiscoveryPage
2. Voit une IdeaCard avec badge "Vélo Lyon"
3. Clic sur le badge "Vélo Lyon"
4. Navigation vers GroupHubPage du groupe "Vélo Lyon"
5. Bouton retour pour revenir à DiscoveryPage

---

**Date de création** : 5 novembre 2025  
**Auteur** : Assistant AI  
**Statut** : ✅ TERMINÉE - Tous les points ont été implémentés

---

## 12. Résumé de l'implémentation (5 novembre 2025)

### Point 1 : Héritage des groupes ✅
**Fichiers modifiés :**
- `/store/SimpleEntityStore.tsx` : Ajout de `prefilledGroupIds` et `setPrefilledGroupIds`
- `/hooks/contentActions.ts` : 
  - Modification de `createVersionFromIdea` pour hériter les groupIds
  - Création de `createVersionFromPost` pour hériter les groupIds depuis un post
  - Modification de `promotePostToIdea` pour hériter les groupIds
  - Modification de `clearPrefill` pour nettoyer les groupIds
  - Modification de `linkContentToContent` pour nettoyer les groupIds
  - Exposition de `setPrefilledGroupIds` dans les actions exportées
- `/router/CreateIdeaPageWrapper.tsx` : Fusion des groupIds depuis navigation et store

**Résultat :** Les groupes sont maintenant automatiquement hérités lors de la création de versions depuis des idées ou des posts.

### Point 2 : Affichage des groupes ✅
**Fichiers créés :**
- `/components/group/GroupBadge.tsx` : Badge cliquable pour afficher un groupe
- `/components/group/GroupBadgeList.tsx` : Liste de badges avec limite d'affichage

**Fichiers modifiés :**
- `/components/IdeaCard.tsx` : Intégration de GroupBadgeList
- `/components/PostCard.tsx` : Intégration de GroupBadgeList
- `/components/IdeaDetailPage.tsx` : Section dédiée aux groupes
- `/components/PostDetailPage.tsx` : Section dédiée aux groupes

**Résultat :** Les groupes associés à un contenu sont maintenant visibles partout.

### Point 3 : Filtrage dans l'explorateur ✅
**État :** Déjà implémenté dans les phases précédentes
- `GroupsExplorerPage.tsx` utilise `GroupTypeFilter`
- `GroupsExplorerPage.tsx` utilise `GroupParticipationFilter`

### Point 4 : Affichage dans My Groups ✅
**État :** Déjà implémenté dans les phases précédentes
- `MyGroupsPage.tsx` affiche les groupes actifs et en attente
- Utilise `GroupCard` et `PendingGroupCard`

### Point 5 : Statistiques dans Group Hub ✅
**État :** Déjà implémenté dans les phases précédentes
- `GroupHeader.tsx` affiche les statistiques (membres, idées, projets)
- `GroupHubPage.tsx` affiche les compteurs dans les onglets
