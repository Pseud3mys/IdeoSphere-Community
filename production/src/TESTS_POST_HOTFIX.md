# ✅ Tests Post-Hotfix Phase 5

**Objectif** : Valider que les 5 bugs corrigés ne causent plus de problèmes

---

## 🧪 Checklist de tests

### Test 1 : Navigation vers idées ✅
**But** : Vérifier que les URLs ne sont plus doublées

**Étapes** :
1. Aller sur la page Discovery
2. Cliquer sur le titre d'une idée
3. Vérifier l'URL dans la barre d'adresse

**Résultat attendu** :
- ✅ URL est `/idea/[ID]` (ex: `/idea/1`)
- ❌ URL n'est PAS `/idea/ideas/[ID]`

**Validation** :
- [ ] URL correcte
- [ ] Page détail s'affiche
- [ ] Pas d'erreur dans la console

---

### Test 2 : Navigation vers posts ✅
**But** : Vérifier que les posts se chargent correctement

**Étapes** :
1. Aller sur la page Discovery
2. Trouver un post (message court)
3. Cliquer dessus
4. Vérifier l'URL

**Résultat attendu** :
- ✅ URL est `/post/[ID]` (ex: `/post/post-1`)
- ❌ URL n'est PAS `/post/posts/[ID]`

**Validation** :
- [ ] URL correcte
- [ ] Page détail du post s'affiche
- [ ] Contenu chargé
- [ ] Pas d'erreur dans la console

---

### Test 3 : Affichage détail idée (tableau vide) ✅
**But** : Vérifier qu'il n'y a pas de crash si `creators` est vide

**Étapes** :
1. Naviguer vers une idée
2. Observer la section créateurs

**Résultat attendu** :
- ✅ Si pas de créateur : Affiche "Créateur inconnu" ou similaire
- ✅ Si créateur existe : Affiche son nom normalement
- ❌ Pas de crash avec "Cannot read properties of undefined"

**Validation** :
- [ ] Pas d'erreur dans la console
- [ ] Page affichée correctement
- [ ] Nom du créateur visible (ou message si vide)

---

### Test 4 : Création d'idée depuis post ✅
**But** : Vérifier que la variable `sourcePost` est correcte

**Étapes** :
1. Aller sur un post (page détail)
2. Cliquer sur "Transformer en projet" ou similaire
3. Vérifier que le formulaire se charge

**Résultat attendu** :
- ✅ Formulaire s'affiche
- ✅ Post source est indiqué dans la bannière
- ✅ Contenu peut être pré-rempli
- ❌ Pas d'erreur "prefilledSourcePostId is not defined"

**Validation** :
- [ ] Formulaire affiché
- [ ] Bannière source visible
- [ ] Pas d'erreur dans la console

---

### Test 5 : Actions addPost/addIdea disponibles ✅
**But** : Vérifier que les actions de base sont exposées

**Étapes** :
1. Ouvrir la console développeur
2. Naviguer dans l'application
3. Observer les logs de chargement

**Résultat attendu** :
- ✅ Pas d'erreur "actions.addPost is not a function"
- ✅ Pas d'erreur "actions.addIdea is not a function"
- ✅ Contenu se charge normalement

**Validation** :
- [ ] Aucune erreur de fonction manquante
- [ ] Feed se charge
- [ ] Données affichées

---

### Test 6 : Rechargement de page (bonus) ✅
**But** : Vérifier que le rechargement fonctionne avec les nouveaux IDs

**Étapes** :
1. Naviguer vers une idée : `/idea/1`
2. Appuyer sur F5 (rechargement)
3. Observer le chargement

**Résultat attendu** :
- ✅ Page se recharge
- ✅ Idée s'affiche correctement
- ✅ Pas d'erreur 404

**Validation** :
- [ ] Page rechargée
- [ ] Contenu affiché
- [ ] Pas d'erreur

---

### Test 7 : Navigation arrière/avant (bonus) ✅
**But** : Vérifier la navigation du navigateur

**Étapes** :
1. Naviguer : Discovery → Idée → Post
2. Cliquer sur bouton "Précédent"
3. Cliquer sur bouton "Suivant"

**Résultat attendu** :
- ✅ Précédent fonctionne
- ✅ Suivant fonctionne
- ✅ Historique maintenu

**Validation** :
- [ ] Navigation arrière OK
- [ ] Navigation avant OK
- [ ] URLs correctes

---

## 📊 Résumé des tests

### Tests critiques (obligatoires)
- [ ] Test 1 : Navigation vers idées
- [ ] Test 2 : Navigation vers posts
- [ ] Test 3 : Affichage détail idée
- [ ] Test 4 : Création d'idée depuis post
- [ ] Test 5 : Actions disponibles

### Tests bonus (recommandés)
- [ ] Test 6 : Rechargement de page
- [ ] Test 7 : Navigation arrière/avant

---

## 🐛 Si des bugs sont trouvés

### Bug lié aux IDs
**Symptôme** : URL doublée ou 404  
**Solution** : Vérifier que `cleanIdeaId()` est appelé partout :
- transformService.ts
- IdeaCard.tsx
- IdeaDetailPageWrapper.tsx
- useNavigationActions.ts

### Bug lié aux tableaux vides
**Symptôme** : Crash "Cannot read properties of undefined"  
**Solution** : Vérifier la condition :
```typescript
{array.length === 0 ? 'Valeur par défaut' : array[0].property}
```

### Bug lié aux actions
**Symptôme** : "actions.xxx is not a function"  
**Solution** : Vérifier que l'action est dans `simpleActions` dans useEntityStoreSimple.ts

---

## ✅ Validation finale

Tous les tests passent ? → **Hotfix validé ! ✅**

Des bugs trouvés ? → **Consulter** :
- `/HOTFIX_PHASE_5.md` pour les détails techniques
- `/utils/README.md` pour la doc des utilitaires
- `/STATUS_GLOBAL.md` pour l'état global

---

**Tests à effectuer après** : Phase 6 (selectedCommunityId)  
**Documentation** : `/PHASE_6_READY.md`

---

**Créé le** : 30 octobre 2025  
**Pour** : Validation Hotfix Phase 5
