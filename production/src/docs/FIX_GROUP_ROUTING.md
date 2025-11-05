# Fix : Routage des groupes avec IDs préfixés

## Problème
Les IDs des groupes dans la base de données sont au format orienté document avec préfixe : `groups/g1`, `groups/pg1`, etc.
Ce format causait des bugs dans les routes React Router qui attendent des IDs courts dans l'URL.

## Solution implémentée

### 1. Utilitaires dans `/utils/idUtils.ts`
Ajout de deux nouvelles fonctions :

```typescript
// Nettoie un ID en supprimant le préfixe "groups/"
cleanGroupId("groups/g1") // → "g1"

// Ajoute le préfixe "groups/" si absent
ensureGroupPrefix("g1") // → "groups/g1"
```

### 2. Navigation (`/hooks/useNavigationActions.ts`)
Les fonctions de navigation nettoient automatiquement les IDs avant de construire l'URL :

```typescript
goToGroup("groups/g1") // → navigate("/groups/g1") ✅
goToPendingGroup("groups/pg1") // → navigate("/groups/pending/pg1") ✅
goToGroupManage("groups/g1") // → navigate("/groups/g1/manage") ✅
```

### 3. Composants et wrappers
Les composants qui récupèrent l'ID depuis l'URL rajoutent le préfixe :

**GroupHubPage** (`/components/GroupHubPage.tsx`)
```typescript
const { groupId: urlGroupId } = useParams();
const groupId = ensureGroupPrefix(urlGroupId); // "g1" → "groups/g1"
```

**GroupManagePageWrapper** (`/router/GroupManagePageWrapper.tsx`)
```typescript
const groupId = ensureGroupPrefix(urlGroupId);
```

**PendingGroupDetailPage** (`/components/PendingGroupDetailPage.tsx`)
```typescript
const pendingId = ensureGroupPrefix(urlPendingId);
```

## Flux complet

### Navigation vers un groupe
1. Composant : `goToGroup("groups/g1")` 
2. useNavigationActions : nettoie → `navigate("/groups/g1")`
3. URL : `/groups/g1`
4. Wrapper/Composant : récupère "g1" → ajoute préfixe → `"groups/g1"`
5. Services API : utilise l'ID complet `"groups/g1"`

### Avantages
- ✅ URLs propres : `/groups/g1` au lieu de `/groups/groups%2Fg1`
- ✅ Compatible avec la structure orientée document
- ✅ Centralisation de la logique dans les utilitaires
- ✅ Pas de modification des données mockées nécessaire
- ✅ Pattern cohérent avec les autres entités (ideas, posts)

## Fichiers modifiés

### Utilitaires et navigation
- `/utils/idUtils.ts` - Ajout de `cleanGroupId` et `ensureGroupPrefix`
- `/hooks/useNavigationActions.ts` - Nettoyage des IDs dans goToGroup, goToPendingGroup, goToGroupManage

### Composants et wrappers
- `/components/GroupHubPage.tsx` - Ajout du préfixe lors de la récupération de l'URL
- `/router/GroupManagePageWrapper.tsx` - Ajout du préfixe lors de la récupération de l'URL
- `/components/PendingGroupDetailPage.tsx` - Ajout du préfixe lors de la récupération de l'URL

### Données mockées
- `/data/groupLinks.ts` - Correction des IDs : `g1` → `groups/g1`, `g2` → `groups/g2`, etc.
- `/data/ideas.ts` - Correction des `groupId` : 4 idées mises à jour avec le préfixe complet
