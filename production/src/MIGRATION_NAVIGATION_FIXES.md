# Migration Navigation - Corrections du bouton "Créer un compte"

## Problème identifié
Le bouton "Créer un compte" n'était plus connecté suite à la migration React Router. Les composants utilisaient encore `actions.goToSignup()` qui ne fait plus de navigation depuis la migration.

## Solution mise en place

### 1. Ajout de `goToSignup()` dans `useNavigationActions`
**Fichier** : `/hooks/useNavigationActions.ts`

```typescript
goToSignup: () => navigate('/signup'),
```

### 2. Corrections des composants

#### ✅ `CitizenWelcome.tsx` (2 occurrences corrigées)
- Ligne 98 : `handleAuthAction('signup')` → utilise `navigation.goToSignup()`
- Ligne 540 : `onSwitchToSignup` dans LoginDialog → utilise `navigation.goToSignup()`

#### ✅ `CommunitiesPage.tsx`
- Import ajouté : `useNavigationActions`
- Hook ajouté dans le composant : `const navigation = useNavigationActions()`
- Ligne 157 : `actions.goToSignup()` → `navigation.goToSignup()`
- Ligne 167 : `actions.goToCommunity()` → `navigation.goToCommunity()` (bonus)

#### ✅ `CommunityDetailPage.tsx`
- Import ajouté : `useNavigationActions`
- Hook ajouté dans le composant : `const navigation = useNavigationActions()`
- Ligne 106 : `actions.goToSignup()` → `navigation.goToSignup()`

#### ✅ `CreateCompleteIdea.tsx`
- Hook déjà présent : `const navigation = useNavigationActions()`
- Ligne 167 : `actions.goToSignup()` → `navigation.goToSignup()`

## Validation

✅ **0 occurrence** de `actions.goToSignup()` dans le code  
✅ **0 occurrence** de `actions.goToCommunity()` dans le code  
✅ **0 occurrence** de `actions.goToXxx()` dans les composants React  
✅ Tous les composants utilisent `navigation.goToXxx()` depuis `useNavigationActions`

## Pattern cohérent

```typescript
// ✅ Pattern correct après migration
import { useNavigationActions } from '../hooks/useNavigationActions';

function MyComponent() {
  const navigation = useNavigationActions();
  
  const handleClick = () => {
    navigation.goToSignup();
    // ou navigation.goToDiscovery()
    // ou navigation.goToIdea(ideaId)
    // etc.
  };
}
```

```typescript
// ❌ Pattern obsolète (ne fonctionne plus)
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';

function MyComponent() {
  const { actions } = useEntityStoreSimple();
  
  const handleClick = () => {
    actions.goToSignup(); // ❌ Ne fait plus de navigation !
  };
}
```

## Architecture finale

```
Composant
    ↓
useNavigationActions() → navigate() [React Router]
    ↓
Changement d'URL
    ↓
Route correspondante s'affiche
```

La navigation est maintenant **entièrement gérée par React Router** via le hook `useNavigationActions`, qui encapsule la logique de navigation et de chargement de données pour une expérience cohérente.
