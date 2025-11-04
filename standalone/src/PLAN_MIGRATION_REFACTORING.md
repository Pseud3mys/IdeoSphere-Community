# Plan de Migration - Refactoring et Standardisation

## 🎯 Objectifs

Ce plan de migration vise à :
1. **Standardiser la navigation** en utilisant une seule méthode cohérente
2. **Centraliser la logique de cache** pour éviter les duplications
3. **Supprimer les alias d'actions** pour clarifier l'API
4. **Créer des utilitaires partagés** pour les fonctions communes

## 📋 Problèmes Identifiés

### 1. Navigation Incohérente
- ❌ Multiples méthodes : `useNavigationActions` vs `useNavigate` direct
- ❌ Composants dépréciés : `SharePostDialog.tsx` (déjà supprimé ✅)

### 2. Duplication de Cache
- ❌ Logique de cache dans `apiActions.ts` ET `useEntityStoreSimple.ts`
- ❌ Gestion des feeds et contributions en double

### 3. Actions en Double
- ❌ `createIdeaWithHashtags` = alias de `publishIdea`
- ❌ `createPostWithHashtags` = alias de `publishPost`

### 4. Utilitaires Dupliqués
- ❌ `formatTimeAgo` dans `IdeaDescriptionTab.tsx`, `IdeaCard.tsx`, `PostCard.tsx`
- ❌ Composants de dialogue similaires (`PublishConfirmationDialog`, `ContentActionDialogs`)

---

## 🗺️ Architecture Cible

```
┌─────────────────────────────────────────────────────────────┐
│                        COMPOSANTS                            │
│  (utilisent uniquement les hooks standardisés)              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    HOOKS STANDARDISÉS                        │
│  - useNavigationActions (navigation unique)                 │
│  - useEntityStoreSimple (state + cache centralisé)          │
│  - useAuthHandlers                                           │
│  - Utilitaires partagés (utils/)                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    ACTIONS UNIFIÉES                          │
│  - contentActions.ts (actions de contenu uniques)           │
│  - userActions.ts                                            │
│  - NO MORE apiActions.ts (fusionné dans contentActions)     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     API SERVICES                             │
│  (services purs sans logique de cache)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📅 PHASE 1 : Création des Utilitaires Partagés

**Durée estimée** : 1h  
**Risque** : 🟢 Faible (ajout de nouveaux fichiers sans modification de l'existant)

### Objectif
Créer les fichiers utilitaires réutilisables avant de commencer les migrations.

### Actions

#### 1.1 Créer `utils/dateUtils.ts`
```typescript
// Centraliser toutes les fonctions de formatage de date
- formatTimeAgo(date)
- formatDate(date)
- formatDateTime(date)
```

**Fichiers sources à analyser** :
- `components/IdeaDescriptionTab.tsx` (ligne ~formatTimeAgo)
- `components/IdeaCard.tsx` (ligne ~formatTimeAgo)
- `components/PostCard.tsx` (ligne ~formatTimeAgo)
- `components/PostDetailPage.tsx` (ligne ~formatTimeAgo)

#### 1.2 Créer `utils/navigationUtils.ts`
```typescript
// Utilitaires pour construire les URLs
- buildContentUrl(contentId)
- buildUserUrl(userId)
- buildCommunityUrl(communityId)
```

#### 1.3 Créer `utils/cacheUtils.ts`
```typescript
// Constantes et helpers pour la gestion du cache
- CACHE_DURATION constants
- isCacheValid(timestamp, duration)
- getCacheKey(params)
```

### Tests à effectuer
✅ Vérifier que tous les utilitaires sont exportés correctement  
✅ Tests unitaires pour `formatTimeAgo` avec différentes dates  
✅ Tests unitaires pour `isCacheValid`  
✅ Pas de régression : aucun composant ne devrait être affecté à ce stade

### Fichiers créés
- ✨ `/utils/dateUtils.ts` (nouveau)
- ✨ `/utils/navigationUtils.ts` (nouveau)
- ✨ `/utils/cacheUtils.ts` (nouveau)
- 📝 `/utils/README.md` (mise à jour)

---

## 📅 PHASE 2 : Migration vers les Utilitaires Partagés

**Durée estimée** : 2h  
**Risque** : 🟡 Moyen (modifications de nombreux composants)

### Objectif
Remplacer toutes les implémentations locales par les utilitaires partagés.

### Actions

#### 2.1 Migration de `formatTimeAgo`

**Ordre de migration** (du plus simple au plus complexe) :
1. `IdeaCard.tsx`
2. `PostCard.tsx`
3. `IdeaDescriptionTab.tsx`
4. `PostDetailPage.tsx`

**Pour chaque fichier** :
1. Ajouter l'import : `import { formatTimeAgo } from '../utils/dateUtils';`
2. Supprimer la fonction locale `formatTimeAgo`
3. Vérifier que toutes les utilisations fonctionnent

#### 2.2 Migration des fonctions de construction d'URL

**Fichiers à migrer** :
- `hooks/useNavigationActions.ts`
- `components/ShareDialog.tsx`
- Tous les composants construisant des URLs manuellement

### Tests à effectuer
✅ Vérifier l'affichage des dates sur :
  - Carte d'idée (feed)
  - Carte de post (feed)
  - Page détail d'idée
  - Page détail de post
  - Discussions et commentaires
✅ Vérifier les liens de partage générés
✅ Vérifier la navigation vers les contenus

### Rollback
Si problème : restaurer les fonctions locales en attendant la correction.

### Fichiers modifiés
- 📝 `components/IdeaCard.tsx`
- 📝 `components/PostCard.tsx`
- 📝 `components/IdeaDescriptionTab.tsx`
- 📝 `components/PostDetailPage.tsx`
- 📝 `hooks/useNavigationActions.ts`
- 📝 `components/ShareDialog.tsx`

---

## 📅 PHASE 3 : Centralisation de la Logique de Cache

**Durée estimée** : 3h  
**Risque** : 🔴 Élevé (modification de la logique centrale)

### Objectif
Déplacer toute la logique de cache dans `useEntityStoreSimple.ts` et supprimer la duplication dans `apiActions.ts`.

### Analyse préalable

#### État actuel
```
apiActions.ts (hooks/)
├── feedCache (lastFetched, data)
├── contributionsCache (lastFetched, data)
└── CACHE_DURATION = 5 minutes

useEntityStoreSimple.ts (hooks/)
├── Gère le cache des entités (ideas, posts, users)
└── Pas de cache pour les listes/feeds
```

#### Architecture cible
```
useEntityStoreSimple.ts (hooks/)
├── Cache des entités (existant)
├── Cache des feeds (nouveau)
├── Cache des contributions (nouveau)
└── Logique unifiée avec cacheUtils
```

### Actions

#### 3.1 Étendre `useEntityStoreSimple.ts`

**Ajouter au store** :
```typescript
interface SimpleEntityStore {
  // ... existant ...
  
  // Nouveau : cache des feeds
  feedCache: {
    data: Idea[] | null;
    lastFetched: number | null;
    params: FeedParams | null; // pour invalider si params changent
  };
  
  // Nouveau : cache des contributions
  contributionsCache: {
    data: { ideas: Idea[]; posts: Post[] } | null;
    lastFetched: number | null;
    userId: string | null;
  };
  
  // Actions de cache
  setFeedCache: (data, params) => void;
  invalidateFeedCache: () => void;
  setContributionsCache: (data, userId) => void;
  invalidateContributionsCache: () => void;
}
```

#### 3.2 Migrer la logique de `apiActions.ts` vers `contentActions.ts`

**Étapes** :
1. Copier les fonctions de `apiActions.ts` dans `contentActions.ts`
2. Adapter pour utiliser le nouveau cache de `useEntityStoreSimple`
3. Tester les nouvelles fonctions
4. Migrer progressivement les composants
5. Supprimer `apiActions.ts`

**Fonctions à migrer** :
- `loadFeed()` → `contentActions.loadFeed()`
- `loadUserContributions()` → `contentActions.loadUserContributions()`

#### 3.3 Supprimer les exports de `hooks/index.ts`

Retirer :
```typescript
export { useApiActions } from './apiActions'; // ❌ À supprimer
```

### Tests à effectuer
✅ **Test du cache du feed** :
  1. Charger le feed → doit appeler l'API
  2. Recharger dans les 5 min → doit utiliser le cache
  3. Attendre 6 min → doit rappeler l'API
  4. Changer les filtres → doit rappeler l'API

✅ **Test du cache des contributions** :
  1. Charger les contributions d'un user → doit appeler l'API
  2. Recharger → doit utiliser le cache
  3. Changer d'utilisateur → doit rappeler l'API

✅ **Test de l'invalidation** :
  1. Créer une nouvelle idée → doit invalider le feed
  2. Vérifier que le feed se recharge

✅ **Régression** :
  - Tester toutes les pages principales
  - Vérifier qu'il n'y a pas d'appels API en boucle

### Rollback
Conserver `apiActions.ts` en parallèle jusqu'à validation complète. Restaurer les imports si nécessaire.

### Fichiers modifiés
- 📝 `hooks/useEntityStoreSimple.ts` (ajout cache feeds/contributions)
- 📝 `store/SimpleEntityStore.tsx` (ajout state)
- 📝 `hooks/contentActions.ts` (migration fonctions)
- 📝 `utils/cacheUtils.ts` (utilisé pour les validations)
- 📝 `hooks/index.ts` (retrait export apiActions)
- ❌ `hooks/apiActions.ts` (à supprimer après migration)

---

## 📅 PHASE 4 : Standardisation de la Navigation

**Durée estimée** : 2h  
**Risque** : 🟡 Moyen (nombreux composants à modifier)

### Objectif
Utiliser uniquement `useNavigationActions` pour toutes les navigations, supprimer les usages directs de `useNavigate`.

### Analyse préalable

#### Fichiers utilisant `useNavigate` directement
```bash
# À chercher dans le code
grep -r "useNavigate" components/
grep -r "useNavigate" router/
```

**Liste attendue** :
- Wrappers dans `/router` (✅ acceptable, ce sont des composants de routage)
- Certains composants (❌ à migrer vers `useNavigationActions`)

### Actions

#### 4.1 Audit des usages de `useNavigate`

Créer une liste complète des fichiers à migrer.

#### 4.2 Migration progressive

**Pour chaque composant** :
1. Remplacer `const navigate = useNavigate();` par `const { navigateToContent, navigateToUser, ... } = useNavigationActions();`
2. Remplacer `navigate('/path')` par la méthode appropriée
3. Tester le composant

**Ordre de migration** (du plus isolé au plus central) :
1. Composants de pages (`*Page.tsx`)
2. Composants de cartes (`IdeaCard.tsx`, `PostCard.tsx`)
3. Composants de formulaires
4. Composants de navigation (`Navigation.tsx`, `AppHeader.tsx`)

#### 4.3 Vérifier que `useNavigationActions` couvre tous les cas

Si certaines navigations ne sont pas couvertes, ajouter les méthodes manquantes :
```typescript
// Exemples de méthodes à ajouter si nécessaire
navigateToCommunity(communityId: string)
navigateToAbout()
navigateToFAQ()
navigateBack() // wrapper pour navigate(-1)
```

### Tests à effectuer
✅ Tester tous les liens de navigation :
  - Navigation depuis le feed
  - Navigation depuis une carte
  - Navigation depuis le header
  - Boutons "retour"
  - Navigation après création de contenu
  - Navigation après login/signup

✅ Vérifier le comportement du bouton "back" du navigateur

✅ Vérifier que les URLs sont correctes (format `/content/ideas/12345`)

### Rollback
Restaurer les imports de `useNavigate` si problème.

### Fichiers modifiés
- 📝 `hooks/useNavigationActions.ts` (ajout de méthodes si nécessaire)
- 📝 Nombreux composants (liste à déterminer après audit)

---

## 📅 PHASE 5 : Suppression des Alias d'Actions

**Durée estimée** : 1h  
**Risque** : 🟢 Faible (renommages simples)

### Objectif
Supprimer les alias confus et n'avoir qu'une seule fonction par action.

### Analyse préalable

#### Alias identifiés

**Dans `contentActions.ts`** :
```typescript
// Alias pour les idées
createIdeaWithHashtags() → ALIAS DE → publishIdea()

// Alias pour les posts
createPostWithHashtags() → ALIAS DE → publishPost()
```

**Décision** : Garder le nom le plus explicite et supprimer l'alias.

#### Choix de nommage

**Pour les idées** :
- ✅ **GARDER** : `publishIdea` (plus explicite : création + publication)
- ❌ **SUPPRIMER** : `createIdeaWithHashtags` (redondant, tous les contenus ont des hashtags)

**Pour les posts** :
- ✅ **GARDER** : `publishPost`
- ❌ **SUPPRIMER** : `createPostWithHashtags`

### Actions

#### 5.1 Identifier tous les usages des alias

```bash
grep -r "createIdeaWithHashtags" components/
grep -r "createPostWithHashtags" components/
```

#### 5.2 Remplacer les alias

**Pour chaque fichier** :
1. Remplacer `createIdeaWithHashtags` → `publishIdea`
2. Remplacer `createPostWithHashtags` → `publishPost`
3. Vérifier les imports

**Fichiers attendus** :
- `components/CreateIdeaPage.tsx`
- `components/CreateCompleteIdea.tsx`
- `components/CreateQuickPost.tsx`

#### 5.3 Supprimer les alias de `contentActions.ts`

```typescript
// ❌ À supprimer
export const createIdeaWithHashtags = publishIdea;
export const createPostWithHashtags = publishPost;
```

#### 5.4 Mettre à jour les exports dans `hooks/index.ts`

### Tests à effectuer
✅ **Création d'idée complète** :
  - Remplir le formulaire
  - Publier
  - Vérifier que l'idée apparaît dans le feed
  - Vérifier que les hashtags sont bien créés

✅ **Création de post rapide** :
  - Créer un post
  - Vérifier qu'il apparaît dans le feed

✅ **Vérifier qu'il n'y a pas d'erreurs de compilation**

### Rollback
Restaurer les alias si problème détecté.

### Fichiers modifiés
- 📝 `hooks/contentActions.ts` (suppression des alias)
- 📝 `hooks/index.ts` (mise à jour exports)
- 📝 `components/CreateIdeaPage.tsx`
- 📝 `components/CreateCompleteIdea.tsx`
- 📝 `components/CreateQuickPost.tsx`

---

## 📅 PHASE 6 : Simplification des Composants de Dialogue

**Durée estimée** : 1h30  
**Risque** : 🟡 Moyen (refactoring de composants)

### Objectif
Simplifier et unifier les composants de dialogue similaires.

### Analyse

#### Composants actuels
```
PublishConfirmationDialog (create-idea/)
├── Utilise ConfirmationDialog
└── Spécialisé pour la publication d'idée

ContentActionDialogs (components/)
├── Gère : Transformer en projet, Créer version, Lier contenu
└── Utilise ConfirmationDialog + dialogs spécialisés
```

#### Architecture cible
Garder la séparation actuelle mais améliorer la réutilisabilité :
```
ConfirmationDialog (générique)
├── PublishConfirmationDialog (spécialisé)
└── ContentActionDialogs (spécialisé)
```

### Actions

#### 6.1 Améliorer `ConfirmationDialog`

Ajouter des variants pour les cas d'usage courants :
```typescript
variant?: 'default' | 'destructive' | 'success' | 'warning'
```

#### 6.2 Refactorer `PublishConfirmationDialog`

- Utiliser les nouvelles props de `ConfirmationDialog`
- Supprimer le code dupliqué

#### 6.3 Refactorer `ContentActionDialogs`

- Utiliser les nouvelles props de `ConfirmationDialog`
- Simplifier la logique

### Tests à effectuer
✅ **Dialogue de publication** :
  - Ouvrir le dialogue
  - Annuler → rien ne se passe
  - Publier → idée publiée

✅ **Dialogues d'actions** :
  - Transformer en projet
  - Créer une version
  - Lier du contenu

### Fichiers modifiés
- 📝 `components/ConfirmationDialog.tsx` (ajout variants)
- 📝 `components/create-idea/PublishConfirmationDialog.tsx`
- 📝 `components/ContentActionDialogs.tsx`

---

## 📅 PHASE 7 : Nettoyage et Documentation

**Durée estimée** : 1h  
**Risque** : 🟢 Faible (documentation)

### Objectif
Nettoyer le code, supprimer les fichiers dépréciés, et mettre à jour la documentation.

### Actions

#### 7.1 Supprimer les fichiers dépréciés

**Vérifier et supprimer si plus utilisé** :
- ❌ `hooks/apiActions.ts` (remplacé par contentActions)
- ❌ `hooks/navigationActions.ts` (si dupliqué avec useNavigationActions)

#### 7.2 Mettre à jour les README

**Fichiers à mettre à jour** :
- 📝 `/README.md` (vue d'ensemble)
- 📝 `/ARCHITECTURE.md` (nouvelle architecture)
- 📝 `/hooks/README.md` (hooks standardisés)
- 📝 `/utils/README.md` (nouveaux utilitaires)
- 📝 `/DOCUMENTATION_INDEX.md` (index à jour)

#### 7.3 Créer un guide de migration

- ✨ `/GUIDE_REFACTORING.md` (résumé des changements pour les développeurs)

#### 7.4 Ajouter des commentaires JSDoc

Ajouter de la documentation pour :
- Tous les nouveaux utilitaires
- Les hooks standardisés
- Les actions unifiées

### Tests à effectuer
✅ Vérifier que tous les liens dans la documentation fonctionnent  
✅ Vérifier qu'il n'y a plus de références aux fichiers supprimés  
✅ Compiler le projet → 0 erreurs TypeScript

### Fichiers modifiés
- 📝 `/README.md`
- 📝 `/ARCHITECTURE.md`
- 📝 `/hooks/README.md`
- 📝 `/utils/README.md`
- 📝 `/DOCUMENTATION_INDEX.md`
- ✨ `/GUIDE_REFACTORING.md` (nouveau)

---

## 📊 Récapitulatif des Phases

| Phase | Objectif | Durée | Risque | Priorité |
|-------|----------|-------|--------|----------|
| **Phase 1** | Créer utilitaires partagés | 1h | 🟢 Faible | Haute |
| **Phase 2** | Migrer vers utilitaires | 2h | 🟡 Moyen | Haute |
| **Phase 3** | Centraliser le cache | 3h | 🔴 Élevé | Haute |
| **Phase 4** | Standardiser navigation | 2h | 🟡 Moyen | Moyenne |
| **Phase 5** | Supprimer alias d'actions | 1h | 🟢 Faible | Moyenne |
| **Phase 6** | Simplifier dialogues | 1h30 | 🟡 Moyen | Basse |
| **Phase 7** | Nettoyage et doc | 1h | 🟢 Faible | Basse |

**Durée totale estimée** : 11h30

---

## 🔧 Stratégie de Tests

### Tests par Phase

**Après chaque phase** :
1. ✅ Vérifier qu'il n'y a pas d'erreurs TypeScript
2. ✅ Lancer l'application en dev
3. ✅ Effectuer les tests spécifiques à la phase
4. ✅ Vérifier qu'il n'y a pas de régression sur les fonctionnalités existantes

### Tests de Non-Régression Globaux

**À effectuer après chaque phase** :
- [ ] Feed principal se charge correctement
- [ ] Filtres du feed fonctionnent
- [ ] Navigation vers une idée fonctionne
- [ ] Navigation vers un post fonctionne
- [ ] Création d'idée complète fonctionne
- [ ] Création de post rapide fonctionne
- [ ] Système de rating fonctionne
- [ ] Discussions fonctionnent
- [ ] Profil utilisateur se charge
- [ ] Partage de contenu fonctionne

### Checklist de Validation Finale

**Avant de considérer la migration terminée** :
- [ ] Toutes les phases sont complétées
- [ ] Tous les tests sont au vert
- [ ] Aucune erreur TypeScript
- [ ] Aucun warning dans la console
- [ ] Documentation à jour
- [ ] Code review effectué
- [ ] Pas de fichiers dépréciés restants
- [ ] Performance maintenue ou améliorée

---

## 🚨 Gestion des Risques

### Risques Identifiés

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Régression dans le cache | 🔴 Élevé | Moyenne | Tests exhaustifs + Rollback prévu |
| Navigation cassée | 🔴 Élevé | Faible | Migration progressive + Tests |
| Perte de données en cache | 🟡 Moyen | Faible | Backup du store avant migration |
| Performance dégradée | 🟡 Moyen | Faible | Mesures avant/après |

### Plan de Rollback

**Pour chaque phase** :
1. Créer une branche Git dédiée
2. Commiter après chaque étape réussie
3. En cas de problème : `git revert` ou `git reset --hard`
4. Documenter le problème pour analyse

### Points d'Arrêt

**Arrêter la migration si** :
- ❌ Plus de 5 bugs bloquants détectés
- ❌ Performance dégradée de plus de 20%
- ❌ Impossibilité de rollback

---

## 📝 Ordre d'Exécution Recommandé

### Option 1 : Progressif (Recommandé)
```
Phase 1 → Test → Phase 2 → Test → Phase 3 → Test complet
→ Pause/Validation → Phase 4 → Test → Phase 5 → Test
→ Pause/Validation → Phase 6 → Test → Phase 7
```

### Option 2 : Par Domaine
```
Groupe 1 (Utilitaires) : Phase 1 + Phase 2 → Test
Groupe 2 (Architecture) : Phase 3 + Phase 4 → Test
Groupe 3 (Nettoyage) : Phase 5 + Phase 6 + Phase 7 → Test
```

### Option 3 : Risque First
```
Phase 3 (risque élevé) → Test complet → Validation
→ Autres phases en parallèle si possible
```

**Recommandation** : Option 1 (progressif) pour minimiser les risques.

---

## 🎯 Critères de Succès

### Métriques Quantitatives
- ✅ **0** erreurs TypeScript
- ✅ **0** warnings critiques
- ✅ **-30%** de code dupliqué (estimation)
- ✅ **+50%** de couverture par les utilitaires partagés
- ✅ **100%** des composants utilisent la navigation standardisée
- ✅ **1 seul** système de cache (vs 2 actuellement)

### Métriques Qualitatives
- ✅ Code plus maintenable et lisible
- ✅ Architecture plus claire et cohérente
- ✅ Documentation complète et à jour
- ✅ Onboarding facilité pour nouveaux développeurs

---

## 📚 Ressources

### Documentation à Consulter
- `/ARCHITECTURE.md` - Architecture actuelle
- `/docs/DATA_FLOW.md` - Flux de données
- `/docs/ROUTING.md` - Système de routage
- `/hooks/README.md` - Hooks actuels

### Outils de Développement
- TypeScript pour la vérification des types
- ESLint pour la qualité du code
- Git pour la gestion des versions et rollbacks
- Tests manuels (pas de framework de test actuellement)

---

## ✅ Prochaines Étapes

1. **Valider ce plan** avec l'équipe
2. **Créer une branche** `refactoring/standardization`
3. **Commencer par Phase 1** (utilitaires partagés)
4. **Suivre le plan progressivement**
5. **Documenter les décisions** au fur et à mesure

---

**Date de création** : 30 octobre 2025  
**Version** : 1.0  
**Auteur** : Migration Plan Generator  
**Statut** : 📋 EN ATTENTE DE VALIDATION
