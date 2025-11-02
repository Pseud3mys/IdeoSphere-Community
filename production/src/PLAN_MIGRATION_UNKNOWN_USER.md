# Plan de Migration : Centralisation de l'objet `unknownUser`

## 🎯 Objectif

Établir une source de vérité unique pour l'objet `unknownUser` en dehors du dossier `/data` et s'assurer que toute l'application s'appuie sur le sélecteur `getUserById` pour la résolution des utilisateurs.

---

## 📊 Analyse de la situation actuelle

### Problème identifié

La résolution d'un ID utilisateur en objet `User` se fait via le sélecteur `getUserById` du store, qui fournit un objet `unknownUser` si l'ID n'est pas trouvé. Cependant :

**❌ Source principale incorrecte** :
- L'objet `unknownUser` est défini dans `src/data/users.ts`
- Ce dossier est destiné à être supprimé lors de la connexion à une vraie API
- La constante fondamentale est couplée aux données de test

**❌ Duplications multiples** :
1. **`src/utils/userValidation.ts`** - `getDefaultUser()` crée "Utilisateur inconnu uservalidation"
2. **`src/api/transformService.ts`** - Définit son propre `unknownUser` "Utilisateur Inconnu apitransform"
3. **`src/components/ContentLinkSearch.tsx`** - Crée "Créateur inconnu" à la volée
4. **`src/components/CreateCompleteIdea.tsx`** - Crée "Créateur inconnu" à la volée
5. **`src/components/UserLink.tsx`** - Affiche "Utilisateur inconnu Userlink" au lieu d'utiliser l'objet

### Architecture actuelle (problématique)

```
┌──────────────────────────────────────────────────────────┐
│                 Sources multiples                         │
├──────────────────────────────────────────────────────────┤
│ /data/users.ts           → unknownUser (mock)            │
│ /utils/userValidation.ts → "Utilisateur inconnu valid"   │
│ /api/transformService.ts → "Utilisateur inconnu api"     │
│ ContentLinkSearch.tsx    → "Créateur inconnu" (inline)   │
│ CreateCompleteIdea.tsx   → "Créateur inconnu" (inline)   │
│ UserLink.tsx             → "Utilisateur inconnu Userlink"│
└──────────────────────────────────────────────────────────┘
                            ↓
              ❌ Incohérence et duplication
```

### Architecture cible (propre)

```
┌──────────────────────────────────────────────────────────┐
│              Source unique centralisée                    │
├──────────────────────────────────────────────────────────┤
│ /core/constants.ts → UNKNOWN_USER (unique)               │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│                 Store / Sélecteurs                        │
├──────────────────────────────────────────────────────────┤
│ simpleSelectors.ts → getUserById()                        │
│   - Retourne user OU UNKNOWN_USER                         │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│          Composants et utilitaires                        │
├──────────────────────────────────────────────────────────┤
│ TOUS utilisent getUserById() uniquement                   │
│ ✅ Pas de fallback manuel                                │
│ ✅ Pas de création d'utilisateur de secours              │
│ ✅ Confiance totale dans le sélecteur                    │
└──────────────────────────────────────────────────────────┘
```

---

## 🗺️ Plan de Migration (3 Phases)

### Phase 1 : Créer une source de vérité centrale et indépendante

**Objectif** : Découpler `unknownUser` des données de test mockées

#### Étape 1.1 : Créer le dossier `/core`

```bash
mkdir src/core
```

#### Étape 1.2 : Créer `/core/constants.ts`

**Nouveau fichier** : `/core/constants.ts`

```typescript
import { User } from '../types';

/**
 * UNKNOWN_USER
 * 
 * Utilisateur de secours utilisé partout dans l'application
 * lorsqu'un ID utilisateur ne peut pas être résolu.
 * 
 * Source unique de vérité pour tous les fallbacks utilisateur.
 * Cette constante est indépendante des données mockées et sera
 * conservée même après la connexion à une API réelle.
 */
export const UNKNOWN_USER: User = {
  id: 'unknown',
  name: 'Utilisateur Inconnu',
  email: 'unknown@example.com',
  avatar: '/avatars/default.png',
  role: 'citizen',
  joinedAt: new Date('2024-01-01'),
  contributionsCount: 0,
  supportsCount: 0,
  communitiesCount: 0,
  bio: '',
  location: '',
  interests: []
};

/**
 * Autres constantes de l'application
 */

// Taille maximale pour les avatars (en octets)
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

// Taille maximale pour les images (en octets)
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// Limites de caractères
export const MAX_TITLE_LENGTH = 100;
export const MAX_SUMMARY_LENGTH = 300;
export const MAX_DESCRIPTION_LENGTH = 5000;
export const MAX_COMMENT_LENGTH = 1000;

// Délai de cache (en millisecondes)
export const FEED_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
export const CONTRIBUTIONS_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Valeurs par défaut pour les ratings
export const DEFAULT_RATING_CRITERIA = [
  { id: 'potential', name: 'Potentiel', description: 'Impact et valeur ajoutée' },
  { id: 'feasibility', name: 'Faisabilité', description: 'Réalisme et praticité' },
  { id: 'completion', name: 'Aboutissement', description: 'Niveau de détail et complétude' }
];
```

**Justification** :
- ✅ Constante fondamentale découplée des données de test
- ✅ Documentation claire de son rôle
- ✅ Prête pour la transition vers une API réelle
- ✅ Autres constantes de l'application peuvent être ajoutées au même endroit

---

### Phase 2 : Mettre à jour les dépendances pour utiliser la nouvelle source

**Objectif** : Remplacer toutes les sources multiples par la source unique

#### Étape 2.1 : Mettre à jour `/store/simpleSelectors.ts`

**Fichier** : `/store/simpleSelectors.ts`

```typescript
// ❌ AVANT
import { unknownUser } from '../data/users';

// ✅ APRÈS
import { UNKNOWN_USER } from '../core/constants';

// Dans la fonction getUserById
export const getUserById = (state: SimpleEntityStore) => (userId: string): User => {
  // ❌ AVANT
  return state.users[userId] || unknownUser;
  
  // ✅ APRÈS
  return state.users[userId] || UNKNOWN_USER;
};
```

**Impact** : Le sélecteur principal utilise maintenant la source centralisée

---

#### Étape 2.2 : Simplifier `/utils/userValidation.ts`

**Fichier** : `/utils/userValidation.ts`

```typescript
// ❌ AVANT
export function getDefaultUser(): User {
  return {
    id: 'unknown',
    name: 'Utilisateur inconnu uservalidation',
    email: 'unknown@example.com',
    avatar: '/avatars/default.png',
    // ... reste des propriétés
  };
}

// ✅ APRÈS
import { UNKNOWN_USER } from '../core/constants';

export function getDefaultUser(): User {
  return UNKNOWN_USER;
}
```

**Simplification** : Plus besoin de créer un nouvel objet, on retourne directement la constante

---

#### Étape 2.3 : Nettoyer `/api/transformService.ts`

**Fichier** : `/api/transformService.ts`

```typescript
// ❌ AVANT
const unknownUser: User = {
  id: 'unknown',
  name: 'Utilisateur Inconnu apitransform',
  // ...
};

// ✅ APRÈS
import { UNKNOWN_USER } from '../core/constants';

// Si la constante locale est utilisée, la remplacer par UNKNOWN_USER partout
```

**Action** : Supprimer la définition locale et importer `UNKNOWN_USER`

---

#### Étape 2.4 : Mettre à jour `/data/users.ts` (temporaire)

**Fichier** : `/data/users.ts`

```typescript
// ❌ AVANT
export const unknownUser: User = {
  id: 'unknown',
  name: 'Utilisateur Inconnu mock',
  // ...
};

// ✅ APRÈS (temporaire, pour compatibilité)
import { UNKNOWN_USER } from '../core/constants';

// Réexporter pour compatibilité temporaire
export const unknownUser = UNKNOWN_USER;

// OU supprimer complètement si plus d'imports
```

**Justification** : Permet une migration progressive sans casser le code existant

---

### Phase 3 : Simplifier les composants en s'appuyant sur `getUserById`

**Objectif** : Supprimer toute logique manuelle de fallback

#### Étape 3.1 : Simplifier `/components/ContentLinkSearch.tsx`

**Fichier** : `/components/ContentLinkSearch.tsx`

**Localiser et modifier** :

```typescript
// ❌ AVANT
const creator = getUserById(idea.creatorIds[0]) || {
  id: 'unknown',
  name: 'Créateur inconnu',
  email: '',
  avatar: '/avatars/default.png',
  role: 'citizen' as const,
  joinedAt: new Date(),
  contributionsCount: 0,
  supportsCount: 0,
  communitiesCount: 0
};

// ✅ APRÈS
const creator = getUserById(idea.creatorIds[0]);
// getUserById garantit de toujours retourner un User valide
```

**Impact** : -10 lignes de code, logique simplifiée, cohérence garantie

---

#### Étape 3.2 : Simplifier `/components/CreateCompleteIdea.tsx`

**Fichier** : `/components/CreateCompleteIdea.tsx`

**Localiser et modifier** :

```typescript
// ❌ AVANT
const linkedCreator = getUserById(linked.creatorId) || {
  id: 'unknown',
  name: 'Créateur inconnu',
  // ... 8 lignes supplémentaires
};

// ✅ APRÈS
const linkedCreator = getUserById(linked.creatorId);
// Confiance dans getUserById
```

**Impact** : Code plus propre, comportement cohérent

---

#### Étape 3.3 : Simplifier `/components/UserLink.tsx`

**Fichier** : `/components/UserLink.tsx`

**Localiser et modifier** :

```typescript
// ❌ AVANT
<span className="...">
  {user?.name || 'Utilisateur inconnu Userlink'}
</span>

// ✅ APRÈS
<span className="...">
  {user.name}
</span>
// user est toujours défini grâce à getUserById
```

**Justification** :
- `getUserById` retourne toujours un objet `User` valide
- Si l'ID n'existe pas, `user.name` sera "Utilisateur Inconnu" (depuis `UNKNOWN_USER`)
- Plus besoin de validation manuelle

---

#### Étape 3.4 : Vérifier tous les autres composants

**Fichiers à vérifier** (recherche dans le code) :

1. `/components/CreatorNames.tsx`
2. `/components/CreatorAvatar.tsx`
3. `/components/IdeaDescriptionTab.tsx`
4. `/components/IdeaDiscussionsTab.tsx`
5. `/components/PostCard.tsx`
6. `/components/IdeaCard.tsx`

**Pattern à rechercher** :
```typescript
// ❌ Patterns à supprimer
getUserById(id) || { ... }
getUserById(id) || defaultUser
user?.name || 'Utilisateur inconnu'
user ? user.name : 'Inconnu'
```

**Pattern à utiliser** :
```typescript
// ✅ Pattern correct
const user = getUserById(id);
// Puis utiliser directement user.name, user.avatar, etc.
```

---

## 📋 Checklist de Migration

### Phase 1 : Source centrale ✅

- [ ] Créer le dossier `/core`
- [ ] Créer `/core/constants.ts` avec `UNKNOWN_USER`
- [ ] Ajouter la documentation dans le fichier
- [ ] Ajouter d'autres constantes utiles (tailles max, durées cache, etc.)

### Phase 2 : Mise à jour des dépendances ✅

- [ ] Mettre à jour `/store/simpleSelectors.ts` → importer `UNKNOWN_USER`
- [ ] Simplifier `/utils/userValidation.ts` → retourner `UNKNOWN_USER`
- [ ] Nettoyer `/api/transformService.ts` → supprimer constante locale
- [ ] Mettre à jour `/data/users.ts` → réexporter temporairement

### Phase 3 : Simplification des composants ✅

- [ ] Simplifier `/components/ContentLinkSearch.tsx`
- [ ] Simplifier `/components/CreateCompleteIdea.tsx`
- [ ] Simplifier `/components/UserLink.tsx`
- [ ] Vérifier `/components/CreatorNames.tsx`
- [ ] Vérifier `/components/CreatorAvatar.tsx`
- [ ] Vérifier `/components/IdeaDescriptionTab.tsx`
- [ ] Vérifier `/components/IdeaDiscussionsTab.tsx`
- [ ] Vérifier `/components/PostCard.tsx`
- [ ] Vérifier `/components/IdeaCard.tsx`
- [ ] Rechercher tous les patterns `|| { id: 'unknown'` dans le code
- [ ] Rechercher tous les patterns `|| 'Utilisateur inconnu'` dans le code

### Phase 4 : Documentation et tests ✅

- [ ] Mettre à jour `/store/README.md` pour mentionner `UNKNOWN_USER`
- [ ] Mettre à jour `/ARCHITECTURE.md` pour documenter `/core`
- [ ] Créer `/core/README.md` si nécessaire
- [ ] Tester l'affichage avec des IDs invalides
- [ ] Vérifier qu'aucun "Créateur inconnu" n'apparaît
- [ ] Vérifier que "Utilisateur Inconnu" est cohérent partout

---

## 🎯 Bénéfices Attendus

### 1. Cohérence totale

✅ **Un seul message** : "Utilisateur Inconnu" partout dans l'application
✅ **Un seul objet** : `UNKNOWN_USER` comme source unique
✅ **Un seul avatar** : `/avatars/default.png` pour tous les utilisateurs inconnus

### 2. Code simplifié

✅ **-50 lignes** : Suppression des créations manuelles d'objets User
✅ **Moins de duplication** : 1 constante au lieu de 6 versions différentes
✅ **Logique centralisée** : `getUserById` fait tout le travail

### 3. Architecture pérenne

✅ **Découplé des données de test** : `/core` est indépendant de `/data`
✅ **Prêt pour l'API réelle** : La constante survivra à la suppression de `/data`
✅ **Maintenabilité** : Un seul endroit à modifier pour changer le comportement

### 4. Confiance dans les sélecteurs

✅ **Pas de validation manuelle** : `getUserById` garantit toujours un objet valide
✅ **Pas de vérification `null`** : Plus besoin de `|| defaultUser`
✅ **TypeScript heureux** : Pas de `User | undefined`

---

## 🔍 Validation Finale

### Tests à effectuer après la migration

1. **Test des IDs invalides**
   ```typescript
   // Tester avec un ID qui n'existe pas
   const user = getUserById('id-inexistant');
   console.log(user.name); // Doit afficher "Utilisateur Inconnu"
   ```

2. **Test des composants**
   - Ouvrir une idée avec des créateurs inconnus
   - Vérifier l'affichage des Q&R avec auteurs inconnus
   - Vérifier les cartes d'idées et posts

3. **Test de cohérence**
   - Chercher dans toute l'UI : "Utilisateur Inconnu" doit être le seul message
   - Pas de "Créateur inconnu", "Utilisateur inconnu uservalidation", etc.

4. **Test de l'import**
   ```bash
   # Rechercher les anciens imports
   grep -r "from '../data/users'" src/
   grep -r "unknownUser" src/
   
   # Vérifier qu'ils pointent tous vers /core/constants
   ```

---

## 📊 Comparaison Avant/Après

### Avant (6 sources différentes)

```typescript
// /data/users.ts
const unknownUser = { name: 'Utilisateur Inconnu mock', ... };

// /utils/userValidation.ts
const defaultUser = { name: 'Utilisateur inconnu uservalidation', ... };

// /api/transformService.ts
const unknownUser = { name: 'Utilisateur Inconnu apitransform', ... };

// ContentLinkSearch.tsx
const creator = getUserById(id) || { name: 'Créateur inconnu', ... };

// CreateCompleteIdea.tsx
const creator = getUserById(id) || { name: 'Créateur inconnu', ... };

// UserLink.tsx
{user?.name || 'Utilisateur inconnu Userlink'}
```

### Après (1 source unique)

```typescript
// /core/constants.ts
export const UNKNOWN_USER = { name: 'Utilisateur Inconnu', ... };

// Tous les autres fichiers
import { UNKNOWN_USER } from '../core/constants';
const user = getUserById(id); // Garantit de retourner un User valide
```

**Résultat** :
- ✅ 6 → 1 source
- ✅ 6 messages différents → 1 message cohérent
- ✅ ~60 lignes de duplication → 1 constante de 15 lignes

---

## 🚀 Ordre d'exécution recommandé

```
1. Phase 1 → Créer /core/constants.ts
   ├─ Créer dossier
   ├─ Créer fichier avec UNKNOWN_USER
   └─ Documenter

2. Phase 2 → Mettre à jour les dépendances
   ├─ simpleSelectors.ts (critique)
   ├─ userValidation.ts
   ├─ transformService.ts
   └─ data/users.ts (temporaire)

3. Phase 3 → Simplifier les composants
   ├─ ContentLinkSearch.tsx
   ├─ CreateCompleteIdea.tsx
   ├─ UserLink.tsx
   └─ Vérifier tous les autres

4. Phase 4 → Documentation et validation
   ├─ Mettre à jour README
   ├─ Tester l'affichage
   └─ Vérifier la cohérence
```

**Durée estimée** : 2-3 heures

---

## 📚 Documentation à créer

### `/core/README.md` (nouveau)

```markdown
# Core Constants

Ce dossier contient les constantes fondamentales de l'application,
indépendantes des données de test et des mocks.

## UNKNOWN_USER

Utilisateur de secours utilisé partout dans l'application lorsqu'un
ID utilisateur ne peut pas être résolu.

**Usage** :
- Importé par `simpleSelectors.ts` dans `getUserById()`
- Garantit qu'aucun composant ne reçoit `null` ou `undefined`
- Message cohérent : "Utilisateur Inconnu"

**Important** :
Cette constante survivra à la suppression du dossier `/data` lors de
la connexion à une API réelle.
```

---

## 🎯 Critères de Succès

✅ Un seul `UNKNOWN_USER` dans `/core/constants.ts`  
✅ Tous les imports pointent vers `/core/constants`  
✅ Aucun pattern `|| { id: 'unknown', ... }` dans le code  
✅ Message "Utilisateur Inconnu" cohérent partout  
✅ `getUserById` utilisé avec confiance (sans validation `||`)  
✅ Tests passent avec des IDs invalides  
✅ Documentation à jour  

---

**Date de création** : 30 octobre 2025  
**Priorité** : ⭐⭐ Moyenne (amélioration de la qualité du code)  
**Impact** : Cohérence, maintenabilité, préparation pour l'API réelle  
**Risque** : Faible (changement localisé, pas de changement de comportement)
