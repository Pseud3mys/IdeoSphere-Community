# Checklist : Migration unknownUser

> Utilisez cette checklist pour suivre l'avancement de la migration.

---

## 📋 Phase 1 : Source centrale

- [ ] **1.1** Créer le dossier `/core`
  ```bash
  mkdir src/core
  ```

- [ ] **1.2** Créer `/core/constants.ts`
  - [ ] Copier l'objet `unknownUser` depuis `/data/users.ts`
  - [ ] Renommer en `UNKNOWN_USER` (convention constante)
  - [ ] Simplifier le nom : "Utilisateur Inconnu" (sans "mock")
  - [ ] Ajouter documentation JSDoc
  - [ ] Ajouter d'autres constantes utiles (MAX_TITLE_LENGTH, etc.)

- [ ] **1.3** Créer `/core/README.md`
  - [ ] Documenter le rôle de `/core`
  - [ ] Documenter `UNKNOWN_USER`

---

## 📋 Phase 2 : Mise à jour des dépendances

### 2.1 Store et sélecteurs

- [ ] **`/store/simpleSelectors.ts`**
  - [ ] Remplacer `import { unknownUser } from '../data/users'`
  - [ ] Par `import { UNKNOWN_USER } from '../core/constants'`
  - [ ] Remplacer `unknownUser` par `UNKNOWN_USER` dans `getUserById`
  - [ ] Tester que `getUserById('invalid-id')` retourne bien `UNKNOWN_USER`

### 2.2 Utilitaires

- [ ] **`/utils/userValidation.ts`**
  - [ ] Supprimer la fonction `getDefaultUser()` complète
  - [ ] OU simplifier pour retourner `UNKNOWN_USER`
  - [ ] Ajouter `import { UNKNOWN_USER } from '../core/constants'`

### 2.3 Services API

- [ ] **`/api/transformService.ts`**
  - [ ] Rechercher la définition locale de `unknownUser`
  - [ ] Supprimer cette définition
  - [ ] Ajouter `import { UNKNOWN_USER } from '../core/constants'`
  - [ ] Remplacer toutes les utilisations par `UNKNOWN_USER`

### 2.4 Données mockées (temporaire)

- [ ] **`/data/users.ts`**
  - [ ] Option A : Réexporter pour compatibilité
    ```typescript
    import { UNKNOWN_USER } from '../core/constants';
    export const unknownUser = UNKNOWN_USER;
    ```
  - [ ] Option B : Supprimer complètement si plus d'imports directs

---

## 📋 Phase 3 : Simplification des composants

### 3.1 Composants avec fallback manuel

- [ ] **`/components/ContentLinkSearch.tsx`**
  - [ ] Rechercher `getUserById(...) || { id: 'unknown', ...`
  - [ ] Supprimer le `|| { ... }`
  - [ ] Simplifier en `const creator = getUserById(id);`
  - [ ] Tester l'affichage avec un ID invalide

- [ ] **`/components/CreateCompleteIdea.tsx`**
  - [ ] Rechercher `getUserById(...) || { id: 'unknown', ...`
  - [ ] Supprimer le `|| { ... }`
  - [ ] Simplifier en `const creator = getUserById(id);`

- [ ] **`/components/UserLink.tsx`**
  - [ ] Rechercher `user?.name || 'Utilisateur inconnu...'`
  - [ ] Simplifier en `user.name` (user est toujours défini)
  - [ ] Supprimer la validation manuelle

### 3.2 Vérification des autres composants

- [ ] **`/components/CreatorNames.tsx`**
  - [ ] Vérifier s'il y a des fallbacks manuels
  - [ ] Simplifier si nécessaire

- [ ] **`/components/CreatorAvatar.tsx`**
  - [ ] Vérifier s'il y a des fallbacks manuels
  - [ ] Simplifier si nécessaire

- [ ] **`/components/IdeaDescriptionTab.tsx`**
  - [ ] Vérifier les résolutions d'auteurs (Q&R)
  - [ ] S'assurer qu'aucun fallback manuel n'existe

- [ ] **`/components/IdeaDiscussionsTab.tsx`**
  - [ ] Vérifier les résolutions d'auteurs
  - [ ] S'assurer qu'aucun fallback manuel n'existe

- [ ] **`/components/PostCard.tsx`**
  - [ ] Vérifier la résolution de l'auteur
  - [ ] Simplifier si nécessaire

- [ ] **`/components/IdeaCard.tsx`**
  - [ ] Vérifier la résolution des créateurs
  - [ ] Simplifier si nécessaire

### 3.3 Recherche globale

- [ ] **Recherche de patterns à supprimer**
  ```bash
  # Dans le terminal
  grep -r "|| { id: 'unknown'" src/
  grep -r "Créateur inconnu" src/
  grep -r "Utilisateur inconnu" src/ | grep -v "constants.ts"
  ```

- [ ] **Supprimer tous les patterns trouvés**
  - [ ] Noter les fichiers trouvés
  - [ ] Les modifier un par un
  - [ ] Vérifier que `getUserById()` est bien utilisé

---

## 📋 Phase 4 : Documentation et tests

### 4.1 Documentation

- [ ] **Mettre à jour `/store/README.md`**
  - [ ] Mentionner que `getUserById` utilise `UNKNOWN_USER`
  - [ ] Ajouter exemple d'usage

- [ ] **Mettre à jour `/ARCHITECTURE.md`**
  - [ ] Ajouter section `/core` dans la structure
  - [ ] Documenter le rôle de `/core/constants.ts`

- [ ] **Créer `/core/README.md`** (si pas fait en Phase 1)

### 4.2 Tests manuels

- [ ] **Test 1 : ID invalide dans le code**
  ```typescript
  // Dans la console du navigateur
  const user = store.getUserById('id-qui-nexiste-pas');
  console.log(user.name); // Doit afficher "Utilisateur Inconnu"
  ```

- [ ] **Test 2 : Affichage dans l'UI**
  - [ ] Ouvrir une idée avec des créateurs supprimés/invalides
  - [ ] Vérifier que "Utilisateur Inconnu" s'affiche (pas "Créateur inconnu")

- [ ] **Test 3 : Discussions avec auteurs inconnus**
  - [ ] Ouvrir une idée avec Q&R
  - [ ] Vérifier l'affichage des auteurs inconnus

- [ ] **Test 4 : Cohérence du message**
  - [ ] Rechercher dans toute l'UI
  - [ ] Vérifier qu'il n'y a QUE "Utilisateur Inconnu" (pas d'autres variantes)

### 4.3 Vérification du code

- [ ] **Imports vérifiés**
  ```bash
  # Vérifier qu'il n'y a plus d'imports de unknownUser depuis /data
  grep -r "from '../data/users'" src/
  grep -r "from '../../data/users'" src/
  
  # Vérifier que tous les imports pointent vers /core
  grep -r "from '../core/constants'" src/
  ```

- [ ] **Aucun fallback manuel restant**
  ```bash
  # Ces patterns ne doivent plus exister
  grep -r "|| { id: 'unknown'" src/
  grep -r "|| defaultUser" src/
  grep -r "user?.name ||" src/
  ```

---

## ✅ Validation Finale

### Critères de succès

- [ ] ✅ Un seul `UNKNOWN_USER` dans `/core/constants.ts`
- [ ] ✅ Tous les imports pointent vers `/core/constants`
- [ ] ✅ Aucun pattern `|| { id: 'unknown', ... }` dans le code
- [ ] ✅ Message "Utilisateur Inconnu" cohérent partout
- [ ] ✅ `getUserById` utilisé avec confiance (sans validation `||`)
- [ ] ✅ Tests manuels passent avec des IDs invalides
- [ ] ✅ Documentation à jour

### Métriques

- [ ] **Avant** : 6 sources différentes → **Après** : 1 source unique
- [ ] **Avant** : ~60 lignes de duplication → **Après** : 15 lignes (1 constante)
- [ ] **Avant** : 6 messages différents → **Après** : 1 message cohérent

---

## 📝 Notes et problèmes rencontrés

_Utilisez cette section pour noter les problèmes rencontrés pendant la migration :_

```
[Date] - [Fichier] - [Problème] - [Solution]

Exemple :
30 Oct - ContentLinkSearch.tsx - Pattern || { ... } utilisé 3 fois - Simplifié en getUserById()
```

---

## 🎉 Migration Complétée !

Une fois tous les items cochés :

1. [ ] Créer un commit avec message clair :
   ```bash
   git add .
   git commit -m "Migration: Centralisation unknownUser dans /core/constants.ts"
   ```

2. [ ] Créer un document récapitulatif :
   - [ ] `/MIGRATION_UNKNOWN_USER_COMPLETE.md`
   - [ ] Y inclure les métriques avant/après
   - [ ] Y inclure les problèmes rencontrés
   - [ ] Y inclure la date de complétion

3. [ ] Mettre à jour :
   - [ ] `/ETAT_PROJET.md`
   - [ ] `/PLANS_MIGRATION_INDEX.md`
   - [ ] `/STATUS_FINAL_OCT_2025.md` (si nécessaire)

---

**Durée estimée** : 2-3 heures  
**Date de création** : 30 octobre 2025  
**Bon courage !** 🚀
