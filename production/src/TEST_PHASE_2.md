# 🧪 Tests Phase 2 - Navigation Publique

Ce document liste tous les tests à effectuer manuellement pour valider la **Phase 2** de la migration React Router.

## ⚠️ Prérequis

Avant de commencer les tests :
1. ✅ React Router installé : `npm install react-router-dom`
2. ✅ Serveur de dev redémarré : `npm run dev`
3. ✅ Console du navigateur ouverte (F12) pour voir les erreurs

---

## 📋 Tests de Navigation Publique

### Test 1 : Page d'accueil
**Action** : Ouvrir `http://localhost:5173/`

**Résultat attendu** :
- ✅ La page CitizenWelcome s'affiche
- ✅ Le Footer est visible
- ✅ Pas d'erreur dans la console
- ✅ L'URL reste `/`

**Erreur possible** :
- ❌ Page blanche → Vérifier console
- ❌ "useNavigate may be used only..." → React Router mal installé

---

### Test 2 : Navigation vers "À propos"
**Action** : Dans le footer, cliquer sur **"À propos"**

**Résultat attendu** :
- ✅ Navigation vers `/about`
- ✅ La page AboutPage s'affiche
- ✅ Bouton "Retour" visible
- ✅ URL dans la barre = `http://localhost:5173/about`

**Erreur possible** :
- ❌ Reste sur `/` → Footer mal adapté (vérifier `<Link to="/about">`)
- ❌ URL change mais page ne change pas → Routes mal configurées

---

### Test 3 : Bouton "Retour"
**Action** : Sur la page `/about`, cliquer sur le bouton **"← Retour"**

**Résultat attendu** :
- ✅ Navigation vers `/`
- ✅ Retour sur CitizenWelcome
- ✅ URL dans la barre = `http://localhost:5173/`

**Erreur possible** :
- ❌ Bouton ne fait rien → Vérifier handler `handleBack` dans AboutPage

---

### Test 4 : Rechargement de page
**Action** : 
1. Aller sur `/about`
2. Appuyer sur **F5** (ou Cmd+R)

**Résultat attendu** :
- ✅ La page AboutPage se recharge
- ✅ Pas de retour sur `/`
- ✅ Contenu reste identique
- ✅ URL reste `/about`

**Erreur possible** :
- ❌ Retour sur `/` → URLStateSync interfère (normal, sera supprimé en Phase 3)
- ❌ Page 404 → Configuration serveur de dev (devrait être OK avec Vite)

---

### Test 5 : Boutons Précédent/Suivant du navigateur
**Action** :
1. Partir de `/`
2. Aller sur `/about`
3. Cliquer sur **bouton Précédent** du navigateur
4. Cliquer sur **bouton Suivant** du navigateur

**Résultat attendu** :
- ✅ Précédent → retour sur `/`
- ✅ Suivant → retour sur `/about`
- ✅ Navigation fluide
- ✅ Pages se rechargent correctement

**Erreur possible** :
- ❌ Comportement erratique → URLStateSync interfère

---

### Test 6 : Tous les liens du Footer
**Action** : Tester tous les liens du footer un par un

| Lien | URL attendue | Page attendue |
|------|--------------|---------------|
| À propos | `/about` | AboutPage |
| Comment ça marche | `/how-it-works` | HowItWorksPage |
| FAQ | `/faq` | FAQPage |
| Confidentialité | `/privacy` | PrivacyPolicyPage |
| CGU | `/terms` | TermsPage |

**Résultat attendu** :
- ✅ Chaque lien navigue vers la bonne URL
- ✅ Chaque page s'affiche correctement
- ✅ Bouton "Retour" fonctionne sur chaque page

---

### Test 7 : Liens externes
**Action** : Dans le footer, cliquer sur **Discord**, **Email**, **GitHub**

**Résultat attendu** :
- ✅ Discord → Ouvre `https://discord.gg/WuUY5dtB` dans un nouvel onglet
- ✅ Email → Ouvre le client email avec `contact@holonsystems.org`
- ✅ GitHub → Ouvre `https://github.com/Pseud3mys/IdeoSphere-Community` dans un nouvel onglet
- ✅ Pas de changement de l'URL de l'application

---

### Test 8 : Partage d'URL
**Action** :
1. Aller sur `/faq`
2. Copier l'URL : `http://localhost:5173/faq`
3. Ouvrir un nouvel onglet
4. Coller l'URL et appuyer sur Entrée

**Résultat attendu** :
- ✅ La page FAQ s'affiche directement
- ✅ Pas de redirection vers `/`
- ✅ Footer visible

---

### Test 9 : URL invalide
**Action** : Aller sur `http://localhost:5173/page-inexistante`

**Résultat attendu** (pour l'instant) :
- ⚠️ Page blanche OU CitizenWelcome (pas de page 404 encore)
- ⚠️ Comportement à définir (sera traité en Phase 7)

**Note** : C'est normal, on n'a pas encore de page 404.

---

### Test 10 : Inscription
**Action** : Sur CitizenWelcome, cliquer sur **"S'inscrire"**

**Résultat attendu** :
- ✅ Navigation vers `/signup`
- ✅ La page SignupPage s'affiche
- ✅ Pas de header ni navigation (page standalone)

**Action 2** : Sur `/signup`, cliquer sur le bouton **"← Retour"**

**Résultat attendu** :
- ✅ Retour sur `/`
- ✅ CitizenWelcome s'affiche

---

## 🐛 Résolution de Problèmes

### Erreur : "useNavigate() may be used only in the context of a <Router>"

**Cause** : React Router pas installé ou composant utilisé hors du `<BrowserRouter>`

**Solution** :
```bash
npm install react-router-dom
```
Puis redémarrer le serveur : `npm run dev`

---

### Erreur : Page blanche après navigation

**Cause** : Erreur dans un composant

**Solution** :
1. Ouvrir la console (F12)
2. Lire l'erreur affichée
3. Vérifier les imports dans le fichier mentionné
4. Vérifier que les props sont correctes

---

### Erreur : URL change mais page ne change pas

**Cause** : Routes mal configurées ou URLStateSync interfère

**Solution** :
1. Vérifier que `routes.tsx` est correct
2. Vérifier que `App.tsx` utilise bien `useRoutes(routes)`
3. (Normal en Phase 2 : URLStateSync sera supprimé en Phase 3)

---

### Erreur : Le rechargement de page retourne sur `/`

**Cause** : URLStateSync interfère (normal)

**Solution** :
- ⏳ Ce sera corrigé en **Phase 3** quand on supprimera URLStateSync
- Pour l'instant, c'est attendu et normal

---

## ✅ Checklist de Validation

Cochez chaque test réussi :

- [ ] Test 1 : Page d'accueil
- [ ] Test 2 : Navigation vers "À propos"
- [ ] Test 3 : Bouton "Retour"
- [ ] Test 4 : Rechargement de page
- [ ] Test 5 : Boutons Précédent/Suivant
- [ ] Test 6.1 : Lien "À propos"
- [ ] Test 6.2 : Lien "Comment ça marche"
- [ ] Test 6.3 : Lien "FAQ"
- [ ] Test 6.4 : Lien "Confidentialité"
- [ ] Test 6.5 : Lien "CGU"
- [ ] Test 7 : Liens externes
- [ ] Test 8 : Partage d'URL
- [ ] Test 10 : Inscription

---

## 📊 Résultat Attendu

Si tous les tests passent :
- ✅ **Phase 2 validée !**
- ✅ Navigation publique fonctionne avec React Router
- ✅ Prêt pour la **Phase 3** (suppression de URLStateSync)

Si certains tests échouent :
- ⚠️ Noter les erreurs rencontrées
- ⚠️ Consulter la section "Résolution de Problèmes"
- ⚠️ Vérifier les fichiers modifiés

---

**Date du test** : _________________

**Testeur** : _________________

**Résultat global** : ✅ Réussi / ⚠️ Problèmes mineurs / ❌ Échec

**Notes** :
