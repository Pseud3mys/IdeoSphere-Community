# 🚀 IdeoSphere - Démarrage Rapide

**Dernière mise à jour** : 30 octobre 2025  
**État** : Phase 5 complétée + Hotfix ✅ | Phase 6 prête 🚀

---

## 📍 Où en sommes-nous ?

### ✅ Complété
- **Phase 1-5** : Migration React Router complète
- **Données mockées** : IDs préfixés (`ideas/123`, `posts/456`)

### 🔴 TODO Immédiat
- **Migration URLs Unifiées** : `/idea/:id` et `/post/:id` → `/content/:id`
- **Durée** : 1-2 heures
- **Voir** : `/TODO_MIGRATION_URLS.md`

### 📊 Progression
```
Migration React Router: 85% ████████████████░░░░
Migration URLs:          0% ░░░░░░░░░░░░░░░░░░░░
```

---

## 📁 Documentation essentielle

### Pour comprendre le projet
- `/STATUS_GLOBAL.md` - Vue d'ensemble complète ⭐
- `/ARCHITECTURE.md` - Architecture technique
- `/README.md` - Description du projet

### Pour la migration React Router
- `/PLAN_MIGRATION_REACT_ROUTER.md` - Plan complet 7 phases
- `/STATUS_MIGRATION.md` - État détaillé ⭐
- `/PHASE_6_READY.md` - Prochaine phase

### Pour les bugs corrigés
- `/HOTFIX_PHASE_5.md` - Détails techniques ⭐
- `/RESUME_HOTFIX.md` - Résumé exécutif
- `/TESTS_POST_HOTFIX.md` - Tests de validation

### Documentation technique
- `/api/README.md` - Services API
- `/hooks/README.md` - Hooks personnalisés
- `/store/README.md` - SimpleEntityStore
- `/utils/README.md` - Utilitaires (idUtils, etc.)
- `/router/README.md` - Système de routage

---

## 🏗️ Architecture actuelle

### Flux de données
```
Composants
    ↓
useEntityStoreSimple() ← Interface unifiée
    ↓
┌─────────────┬──────────────┬──────────────┐
│ Selectors   │   Actions    │   API        │
│ (lecture)   │   (écriture) │   (backend)  │
└─────────────┴──────────────┴──────────────┘
            │
    SimpleEntityStore (état global)
```

### Pattern de navigation
```
<Link to="/idea/123"> ou navigate("/idea/123")
    ↓
React Router change URL
    ↓
Wrapper utilise useParams() pour extraire ID
    ↓
Wrapper charge données si nécessaire (API)
    ↓
Wrapper passe données au composant
    ↓
Composant affiche
```

---

## 🔴 TODO - Migration URLs Unifiées

**Objectif** : Unifier `/idea/:id` et `/post/:id` vers `/content/:id`

### Actions
1. Créer `/router/ContentDetailPageWrapper.tsx`
2. Modifier `/router/routes.tsx` - Route unifiée
3. Modifier les liens dans les composants (IdeaCard, PostCard, etc.)
4. Modifier `/hooks/useNavigationActions.ts`

**Durée** : 1-2h  
**Voir** : `/TODO_MIGRATION_URLS.md`

---

## 🧪 Tests recommandés

Avant de commencer Phase 6, valider que le hotfix fonctionne :

- [ ] Cliquer sur une idée → détail s'affiche sans erreur
- [ ] Cliquer sur un post → détail s'affiche sans erreur
- [ ] Créer idée depuis post → formulaire fonctionne
- [ ] URLs sont propres (`/idea/123` pas `/idea/ideas/123`)
- [ ] Pas d'erreur "actions.xxx is not a function"

**Checklist complète** : `/TESTS_POST_HOTFIX.md`

---

## 💡 Commandes utiles

### Chercher des références
```bash
# Trouver tous les usages de selectedCommunityId
grep -r "selectedCommunityId" --include="*.ts" --include="*.tsx"

# Trouver tous les usages de setActiveTab (devrait être 0)
grep -r "setActiveTab" --include="*.ts" --include="*.tsx"

# Trouver tous les usages de navigate()
grep -r "navigate(" --include="*.ts" --include="*.tsx"
```

### Vérifier les imports
```bash
# Vérifier les imports de idUtils
grep -r "from.*idUtils" --include="*.ts" --include="*.tsx"

# Vérifier les imports de Link
grep -r "import.*Link.*from 'react-router-dom'" --include="*.tsx"
```

---

## 🎯 Métriques du projet

| Métrique | Valeur |
|----------|--------|
| **Phases complétées** | 5/7 (+ Hotfix) |
| **Bugs corrigés** | 5/5 |
| **Fichiers modifiés (hotfix)** | 9 |
| **Fichiers créés (hotfix)** | 2 |
| **Documentation créée** | 20+ fichiers MD |
| **Composants** | ~60 |
| **Hooks personnalisés** | ~8 |
| **Services API** | ~9 |

---

## 🚀 Prochaines Étapes

1. **Migration URLs** : Voir `/TODO_MIGRATION_URLS.md` (1-2h)
2. **Phase 6** : Nettoyer selectedCommunityId (après migration URLs)

---

## 📞 Aide rapide

### Problème d'URL doublée
→ Vérifier que `cleanIdeaId()` est appelé dans :
- transformService.ts (transformation API)
- IdeaCard.tsx (liens)
- IdeaDetailPageWrapper.tsx (params)
- useNavigationActions.ts (navigation)

### Problème d'action manquante
→ Vérifier que l'action est exposée dans `simpleActions` :
- `/hooks/useEntityStoreSimple.ts` lignes 194-205

### Problème de crash tableau vide
→ Ajouter une vérification :
```typescript
{array.length === 0 ? 'Défaut' : array[0].prop}
```

---

## 📚 Ressources

- **Architecture** : `/ARCHITECTURE.md`
- **Migration complète** : `/STATUS_MIGRATION.md`
- **État global** : `/STATUS_GLOBAL.md`
- **Hotfix détails** : `/HOTFIX_PHASE_5.md`
- **Phase suivante** : `/PHASE_6_READY.md`

---

**Projet** : IdeoSphere  
**Status** : 🟢 Phase 5 complète + Hotfix  
**Next** : Phase 6 - selectedCommunityId
