# 🧪 Tests Phase 4 - Checklist de validation

## ✅ Phase 4 terminée - Tests à effectuer

La Phase 4 est **techniquement complète**. Voici la checklist des tests manuels à effectuer pour valider que tout fonctionne correctement.

---

## 🎯 Tests de Navigation Basique

### Test 1 : Navigation principale (Desktop + Mobile)
- [ ] Aller sur `/discovery`
- [ ] Cliquer sur "Mes contributions" → Vérifier navigation vers `/my-ideas`
- [ ] Cliquer sur "Partager une idée" → Vérifier navigation vers `/create-idea`
- [ ] Cliquer sur "Groupes de travail" → Vérifier navigation vers `/communities`
- [ ] Cliquer sur "Fil d'idées" → Retour sur `/discovery`
- [ ] Vérifier que l'onglet actif est surligné en bleu
- [ ] **Mobile** : Répéter tous les tests sur la navigation du bas

**✅ Résultat attendu** : Navigation fluide, pas d'erreur console, onglet actif visible

---

## 🔗 Tests des Cartes et Liens

### Test 2 : Navigation depuis IdeaCard
- [ ] Sur `/discovery`, cliquer sur le **titre** d'une idée
- [ ] Vérifier navigation vers `/idea/:ideaId`
- [ ] Revenir et cliquer sur le bouton **"Voir détails"**
- [ ] Vérifier navigation vers `/idea/:ideaId`
- [ ] **Clic droit** sur le titre → "Ouvrir dans nouvel onglet"
- [ ] Vérifier que ça fonctionne

**✅ Résultat attendu** : Liens cliquables, clic droit fonctionne, pas d'erreur

### Test 3 : Navigation depuis PostCard
- [ ] Sur `/discovery`, cliquer sur le **titre** d'un post
- [ ] Vérifier navigation vers `/post/:postId`
- [ ] Revenir et cliquer sur le bouton **"Voir détails"**
- [ ] Vérifier navigation vers `/post/:postId`

**✅ Résultat attendu** : Navigation correcte vers les posts

### Test 4 : Navigation vers profil utilisateur (UserLink)
- [ ] Sur `/discovery`, cliquer sur le **nom d'un créateur** d'idée
- [ ] Vérifier navigation vers `/user/:userId`
- [ ] Vérifier affichage du profil public
- [ ] **Clic droit** sur un nom d'utilisateur → "Ouvrir dans nouvel onglet"
- [ ] Vérifier que ça fonctionne

**✅ Résultat attendu** : Liens vers profils utilisateurs fonctionnent

---

## 📄 Tests des Pages de Détails

### Test 5 : Page de détail d'idée
- [ ] Aller sur `/idea/1` (remplacer par un ID valide)
- [ ] Vérifier que la page se charge
- [ ] Vérifier affichage du titre, description, créateurs
- [ ] Vérifier que le bouton "Retour" fonctionne
- [ ] Appuyer sur **F5** (rechargement)
- [ ] Vérifier que la page se recharge correctement

**✅ Résultat attendu** : Page complète, rechargement OK, retour OK

### Test 6 : Page de détail de post
- [ ] Aller sur `/post/1` (remplacer par un ID valide)
- [ ] Vérifier que la page se charge
- [ ] Vérifier affichage du contenu
- [ ] Vérifier que le bouton "Retour" fonctionne

**✅ Résultat attendu** : Page complète, retour OK

### Test 7 : Page de profil public
- [ ] Aller sur `/user/1` (remplacer par un ID valide)
- [ ] Vérifier que la page se charge
- [ ] Vérifier affichage des statistiques
- [ ] Vérifier que le bouton "Retour" fonctionne

**✅ Résultat attendu** : Profil public s'affiche

### Test 8 : Page de profil personnel
- [ ] Aller sur `/profile`
- [ ] Vérifier que c'est bien VOTRE profil
- [ ] Vérifier que vous pouvez éditer la bio
- [ ] Vérifier que le bouton "Retour" fonctionne

**✅ Résultat attendu** : Votre profil s'affiche, édition possible

### Test 9 : Page de communauté
- [ ] Aller sur `/communities`
- [ ] Cliquer sur une communauté
- [ ] Vérifier navigation vers `/community/:communityId`
- [ ] Vérifier affichage de la communauté

**✅ Résultat attendu** : Détails de communauté s'affichent

---

## 🔄 Tests de Rechargement et Navigation Navigateur

### Test 10 : Rechargement de page
- [ ] Aller sur `/discovery`
- [ ] Appuyer sur **F5**
- [ ] Vérifier que la page se recharge sans erreur
- [ ] Aller sur `/idea/1`
- [ ] Appuyer sur **F5**
- [ ] Vérifier que la page se recharge et affiche l'idée

**✅ Résultat attendu** : Rechargement fonctionne partout

### Test 11 : Boutons navigateur
- [ ] Aller sur `/discovery`
- [ ] Cliquer sur une idée → `/idea/1`
- [ ] Cliquer sur bouton **Précédent** du navigateur
- [ ] Vérifier retour sur `/discovery`
- [ ] Cliquer sur bouton **Suivant** du navigateur
- [ ] Vérifier retour sur `/idea/1`

**✅ Résultat attendu** : Boutons navigateur fonctionnent

### Test 12 : Partage d'URL
- [ ] Sur `/idea/1`, copier l'URL
- [ ] Ouvrir un **nouvel onglet**
- [ ] Coller l'URL et Enter
- [ ] Vérifier que la page de l'idée s'affiche directement

**✅ Résultat attendu** : URLs partageables fonctionnent

---

## 🎨 Tests de l'Interface

### Test 13 : Indicateur de page active
- [ ] Aller sur `/discovery`
- [ ] Vérifier que "Fil d'idées" est surligné en bleu
- [ ] Aller sur `/my-ideas`
- [ ] Vérifier que "Mes contributions" est surligné
- [ ] Aller sur `/create-idea`
- [ ] Vérifier que "Partager une idée" est surligné

**✅ Résultat attendu** : Onglet actif toujours visible

### Test 14 : Loader pendant chargement
- [ ] Vider le cache (Ctrl+Shift+R)
- [ ] Aller directement sur `/idea/1`
- [ ] Vérifier qu'un **loader** s'affiche
- [ ] Vérifier que le loader disparaît après chargement

**✅ Résultat attendu** : Loader visible pendant chargement

---

## 🔒 Tests de Protection

### Test 15 : Accès aux routes protégées
- [ ] Se déconnecter (ou mode incognito)
- [ ] Essayer d'aller sur `/discovery`
- [ ] Vérifier redirection vers `/` (CitizenWelcome)
- [ ] Se connecter
- [ ] Vérifier accès à `/discovery` autorisé

**✅ Résultat attendu** : Routes protégées uniquement accessible si connecté

---

## 🐛 Tests d'Erreurs

### Test 16 : ID inexistant
- [ ] Aller sur `/idea/99999` (ID inexistant)
- [ ] Vérifier redirection vers `/discovery` (ou message d'erreur)
- [ ] Vérifier qu'il n'y a pas d'erreur console bloquante

**✅ Résultat attendu** : Gestion d'erreur gracieuse

### Test 17 : Console sans erreurs
- [ ] Ouvrir DevTools (F12)
- [ ] Aller sur `/discovery`
- [ ] Vérifier qu'il n'y a **aucune erreur rouge** dans la console
- [ ] Naviguer entre plusieurs pages
- [ ] Vérifier qu'il n'y a **aucune erreur**

**✅ Résultat attendu** : Console propre, pas d'erreurs

---

## 📊 Récapitulatif

### Checklist globale
- [ ] Tous les tests de navigation passent
- [ ] Tous les tests de cartes passent
- [ ] Tous les tests de pages de détails passent
- [ ] Tous les tests de rechargement passent
- [ ] Tous les tests d'interface passent
- [ ] Tous les tests de protection passent
- [ ] Tous les tests d'erreurs passent
- [ ] **Console sans erreurs**

---

## 🚀 Après validation

Une fois tous les tests passés avec succès, vous pouvez :

1. **Marquer la Phase 4 comme validée** ✅
2. **Passer à la Phase 5** : Suppression de l'ancien système (URLStateSync, activeTab)
3. **Commiter vos changements** si vous utilisez Git

---

## 🆘 En cas de problème

Si un test échoue :

1. **Noter le test qui échoue**
2. **Ouvrir la console (F12)** et noter les erreurs
3. **Me signaler le problème** avec :
   - Le numéro du test
   - L'erreur dans la console
   - Ce qui se passe vs ce qui devrait se passer

---

**Bonne chance avec les tests ! 🎉**

*Toutes les fonctionnalités React Router sont maintenant implémentées.*  
*La migration vers React Router est à 70% complète.*
