# Phase 6 - Prêt à démarrer 🚀

## ✅ Phases précédentes complétées

### Phase 1-3 : Migration initiale
✅ Mise en place SimpleEntityStore  
✅ Architecture hooks modulaires  
✅ Selectors optimisés

### Phase 4 : Migration React Router (composants)
✅ 9 composants migrés vers React Router  
✅ Remplacement de `<NavigationLink>` par `<Link>`  
✅ Documentation complète dans `/MIGRATION_PHASE_4_COMPLETE.md`

### Phase 5 : Migration React Router (store)
✅ Suppression de tout le state de navigation du store  
✅ Migration vers `useParams()` et `useNavigate()`  
✅ Nettoyage de 6 fichiers (navigationActions.ts, etc.)  
✅ Documentation dans `/MIGRATION_PHASE_5_COMPLETE.md`

### Hotfix Phase 5 : 5 bugs critiques corrigés
✅ Protection tableaux vides (IdeaDetailPage)  
✅ Fix variable sourcePost (CreateIdeaPage)  
✅ Exposition actions de base (useEntityStoreSimple)  
✅ Nettoyage IDs préfixés (idUtils.ts + 8 fichiers)  
✅ Pattern de normalisation des IDs en 4 couches  
✅ Documentation dans `/HOTFIX_PHASE_5.md`

---

## 🎯 Phase 6 : Nettoyage final

### Objectif
Supprimer les dernières références à `selectedCommunityId` qui reste le dernier vestige de l'ancien système de navigation par state.

### État actuel
```typescript
// ❌ Dans le store
selectedCommunityId: string | null;
setSelectedCommunityId: (id: string | null) => void;

// ❌ Encore utilisé dans quelques composants
actions.setSelectedCommunityId(communityId);
const community = selectors.getSelectedCommunity();
```

### Cible Phase 6
```typescript
// ✅ Utiliser useParams() partout
const { communityId } = useParams();
const community = getCommunityById(communityId);

// ✅ Utiliser navigate() pour la navigation
navigate(`/community/${communityId}`);
```

---

## 📋 Plan d'action Phase 6

### Étape 1 : Identifier tous les usages
```bash
# Chercher selectedCommunityId dans le code
grep -r "selectedCommunityId" --include="*.ts" --include="*.tsx"
```

### Étape 2 : Migration par composant
Pour chaque composant utilisant `selectedCommunityId` :
1. Remplacer par `useParams()` si dans une page de détail
2. Remplacer par `navigate()` si pour la navigation
3. Supprimer les appels à `setSelectedCommunityId()`

### Étape 3 : Nettoyer le store
1. Supprimer `selectedCommunityId` de `SimpleEntityStoreState`
2. Supprimer `setSelectedCommunityId` de `SimpleEntityStoreActions`
3. Supprimer `getSelectedCommunity` de `simpleSelectors.ts`

### Étape 4 : Créer wrappers si nécessaire
Si une page utilise l'ID de communauté :
```typescript
// /router/CommunityPageWrapper.tsx
export function CommunityPageWrapper() {
  const { communityId } = useParams();
  const { getCommunityById } = useEntityStoreSimple();
  const community = getCommunityById(communityId);
  
  if (!community) return <div>Communauté non trouvée</div>;
  
  return <CommunityPage community={community} />;
}
```

### Étape 5 : Documentation
- Mettre à jour `/MIGRATION_PHASE_6_COMPLETE.md`
- Lister tous les fichiers modifiés
- Documenter le pattern utilisé

---

## 🔍 Fichiers à vérifier

### Store et Selectors
- `/store/SimpleEntityStore.tsx` - Supprimer selectedCommunityId
- `/store/simpleSelectors.ts` - Supprimer getSelectedCommunity

### Hooks
- `/hooks/useEntityStoreSimple.ts` - Nettoyer les références
- `/hooks/navigationActions.ts` - Vérifier goToCommunity()

### Composants susceptibles d'utiliser selectedCommunityId
- `/components/CommunitiesPage.tsx`
- `/components/CommunityDetailPage.tsx`
- `/router/CommunityDetailPageWrapper.tsx`

### Wrappers à créer/modifier
- `/router/CommunityDetailPageWrapper.tsx` - Migrer vers useParams()

---

## ⚠️ Points d'attention

### 1. CommunityDetailPageWrapper existe déjà
Vérifier s'il utilise déjà `useParams()` ou s'il faut le migrer.

### 2. Sélecteur getSelectedCommunity
Remplacer partout par :
```typescript
// ❌ Avant
const community = getSelectedCommunity();

// ✅ Après
const { communityId } = useParams();
const community = getCommunityById(communityId);
```

### 3. Navigation vers communautés
Remplacer :
```typescript
// ❌ Avant
actions.setSelectedCommunityId(communityId);
actions.setActiveTab('communities');

// ✅ Après
navigate(`/community/${communityId}`);
```

### 4. Nettoyer les IDs si nécessaire
Si l'API retourne des IDs préfixés comme pour ideas/posts :
```typescript
// Ajouter dans /utils/idUtils.ts si nécessaire
export function cleanCommunityId(id: string): string {
  return id.replace(/^communit(y|ies)\//, '');
}
```

---

## ✅ Critères de succès Phase 6

- [ ] `selectedCommunityId` supprimé du store
- [ ] `setSelectedCommunityId` supprimé du store
- [ ] `getSelectedCommunity` supprimé des selectors
- [ ] Toutes les pages communautés utilisent `useParams()`
- [ ] Navigation vers communautés utilise `navigate()`
- [ ] Aucune référence à `selectedCommunityId` dans le code
- [ ] Tests de navigation vers communautés OK
- [ ] Documentation complète dans MIGRATION_PHASE_6_COMPLETE.md

---

## 🎉 Après la Phase 6

Une fois la Phase 6 terminée, **la migration React Router sera 100% complète** !

### Ce qui aura été accompli
✅ Aucun state de navigation dans le store  
✅ URL comme seule source de vérité  
✅ Navigation déclarative avec React Router  
✅ Pattern consistant dans toute l'app  
✅ Architecture moderne et maintenable  

### Phase 7 et au-delà
Selon `/PLAN_MIGRATION_REACT_ROUTER.md`, les phases suivantes sont :
- **Phase 7** : Tests de non-régression complets
- **Phase 8** : Optimisations et polish final

---

**Créé le** : 30 octobre 2025  
**Status** : ✅ Prêt à démarrer la Phase 6  
**Prérequis** : Toutes les phases précédentes complètes
