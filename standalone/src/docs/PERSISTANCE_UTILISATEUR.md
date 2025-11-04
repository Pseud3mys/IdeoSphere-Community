# Persistance de l'utilisateur connecté avec localStorage

## 🎯 Problème résolu

### Symptômes avant correction
1. ❌ Rafraîchir la page (F5) → Retour en mode "Visiteur"
2. ❌ Utilisateur connecté perdu après rafraîchissement
3. ❌ Pas de bouton pour se reconnecter sans retourner à la page d'accueil
4. ❌ Obligation de réouvrir `/` (CitizenWelcome) pour se reconnecter

### Causes identifiées

Le store Zustand React est **en mémoire uniquement** :
- Perdu lors du rafraîchissement de page
- `currentUserId` remis à `null`
- Retour automatique à `unknownUser` (visiteur)

Pas d'interface de connexion accessible depuis les pages internes.

---

## ✅ Solutions implémentées

### 1. Persistance du currentUserId dans localStorage

#### Dans `/store/SimpleEntityStore.tsx`

**Restauration au démarrage** :
```typescript
const createInitialStore = (): SimpleEntityStore => {
  // Restaurer currentUserId depuis localStorage si disponible
  const savedUserId = typeof window !== 'undefined' 
    ? localStorage.getItem('ideosphere_currentUserId') 
    : null;
  
  return {
    // ... autres propriétés
    currentUserId: savedUserId, // ✅ Restauré depuis localStorage
    // ...
  };
};
```

**Sauvegarde lors du changement** :
```typescript
setCurrentUserId: (id) => {
  // Persister dans localStorage
  if (typeof window !== 'undefined') {
    if (id) {
      localStorage.setItem('ideosphere_currentUserId', id);
    } else {
      localStorage.removeItem('ideosphere_currentUserId');
    }
  }
  setStore(prev => ({ ...prev, currentUserId: id }));
},
```

#### Dans `/hooks/useEntityStoreSimple.ts`

**Validation de l'utilisateur restauré** :
```typescript
apiActions.loadInitialData().then(async (success) => {
  if (success) {
    console.log('✅ Données initiales chargées avec succès');
    
    // Si un currentUserId est restauré depuis localStorage, vérifier qu'il existe
    if (store.currentUserId && store.currentUserId !== 'unknown-user') {
      const userInStore = selectors.getUserById(store)(store.currentUserId);
      if (!userInStore) {
        console.warn(`⚠️ Utilisateur restauré ${store.currentUserId} non trouvé. Retour à unknownUser.`);
        actions.setCurrentUserId(null);
      } else {
        console.log(`✅ Utilisateur ${userInStore.name} restauré depuis localStorage`);
      }
    }
  }
});
```

### 2. Bouton de connexion dans l'AppHeader

#### Interface visiteur améliorée

**Avant** : Uniquement avatar et nom d'utilisateur

**Après** : Détection du mode visiteur avec bouton de connexion

```typescript
// Vérifier si l'utilisateur est en mode visiteur
const isGuest = !currentUserData || !currentUserData.isRegistered;
```

**Affichage conditionnel** :

- **Mode visiteur** (`isGuest = true`) :
  - 🔵 Bouton "Se connecter" visible
  - 👤 Indicateur "Visiteur - Mode consultation"
  - ❓ Avatar gris avec icône interrogation

- **Mode connecté** (`isGuest = false`) :
  - 👤 Avatar coloré avec initiales
  - 📍 Nom et localisation
  - 🚫 Pas de bouton de connexion

#### LoginDialog intégré

```tsx
<LoginDialog
  isOpen={showLoginDialog}
  onClose={() => setShowLoginDialog(false)}
  onLogin={handleLoginSuccess}
  onSocialLogin={handleSocialLoginSuccess}
/>
```

Le dialog permet :
- ✅ Connexion par email/mot de passe
- ✅ Connexion sociale (Google, Facebook, Discord)
- ✅ Accessible depuis n'importe quelle page
- ✅ Se ferme automatiquement après connexion réussie

### 3. Handlers d'authentification dans AppLayout

#### Dans `/components/AppLayout.tsx`

Création des handlers avec `useAuthHandlers` :
```typescript
const authHandlers = useAuthHandlers(
  (user) => {
    actions.addUser(user);
    actions.setCurrentUserId(user.id); // ✅ Sauvegardé dans localStorage
  },
  () => {}, // handleEnterPlatform - pas nécessaire ici
  (email) => {
    // switchToUserByEmail
    const allUsers = Object.values(store.users);
    const user = allUsers.find(u => u.email === email);
    if (user) {
      actions.setCurrentUserId(user.id); // ✅ Sauvegardé dans localStorage
      return user;
    }
    return null;
  },
  actions.checkEmailExists,
  actions.loginWithSocialProvider,
  actions.signupUser,
  actions.subscribeToNewsletter
);
```

Transmission à AppHeader :
```tsx
<AppHeader
  currentUserData={currentUserData}
  onHomeClick={handleHomeClick}
  onProfileClick={handleProfileClick}
  onHelpClick={handleHelpClick}
  onLogin={authHandlers.handleLogin}      // ✅ Nouveau
  onSocialLogin={authHandlers.handleSocialLogin}  // ✅ Nouveau
/>
```

---

## 🔄 Flux complet : Rafraîchissement de page

### Avant les corrections (❌ Problème)

```
1. Utilisateur connecté (ex: Sophie Martin)
   currentUserId = 'user-1'
   ↓
2. Rafraîchissement de page (F5)
   ↓
3. Store réinitialisé
   currentUserId = null
   ↓
4. getCurrentUser() retourne unknownUser
   ↓
5. AppHeader affiche "Visiteur"
   ❌ Pas de bouton pour se reconnecter
   ↓
6. Obligation de retourner à / (CitizenWelcome)
```

### Après les corrections (✅ Fonctionne)

```
1. Utilisateur connecté (ex: Sophie Martin)
   currentUserId = 'user-1'
   localStorage.setItem('ideosphere_currentUserId', 'user-1') ✅
   ↓
2. Rafraîchissement de page (F5)
   ↓
3. Store initialisation
   savedUserId = localStorage.getItem('ideosphere_currentUserId')
   currentUserId = 'user-1' ✅ Restauré
   ↓
4. Chargement des données mockées
   ↓
5. Validation de l'utilisateur restauré
   userInStore = getUserById('user-1')
   ✅ Trouvé : Sophie Martin
   ↓
6. getCurrentUser() retourne Sophie Martin ✅
   ↓
7. AppHeader affiche "Sophie Martin - Lyon" ✅
```

### Si l'utilisateur était en mode visiteur

```
1. Visiteur (unknownUser)
   currentUserId = null
   localStorage vide
   ↓
2. Rafraîchissement de page (F5)
   ↓
3. Store initialisation
   savedUserId = null
   currentUserId = null
   ↓
4. getCurrentUser() retourne unknownUser
   ↓
5. AppHeader affiche "Visiteur"
   ✅ Bouton "Se connecter" visible
   ↓
6. Clic sur "Se connecter"
   ↓
7. LoginDialog s'ouvre ✅
   ↓
8. Connexion réussie
   setCurrentUserId('user-1')
   localStorage.setItem('ideosphere_currentUserId', 'user-1')
   ↓
9. AppHeader affiche "Sophie Martin - Lyon" ✅
```

---

## 📝 Fichiers modifiés

### Store et hooks
- ✅ `/store/SimpleEntityStore.tsx` - Persistance localStorage
- ✅ `/hooks/useEntityStoreSimple.ts` - Validation utilisateur restauré

### Composants UI
- ✅ `/components/AppHeader.tsx` - Bouton connexion + LoginDialog
- ✅ `/components/AppLayout.tsx` - Handlers auth + props AppHeader

### Documentation
- ✅ `/docs/PERSISTANCE_UTILISATEUR.md` - Ce fichier

---

## 🎁 Avantages

### ✅ Expérience utilisateur fluide

- **Pas de déconnexion forcée** : L'utilisateur reste connecté après F5
- **Reconnexion facile** : Bouton accessible depuis n'importe quelle page
- **Indicateur clair** : Badge "Visiteur" si non connecté

### ✅ Cohérence

- **Store** : Source unique de vérité pour `currentUserId`
- **localStorage** : Simple backup pour survivre aux rafraîchissements
- **Validation** : Vérifie que l'utilisateur existe avant de le restaurer

### ✅ Robustesse

```typescript
// Gestion des cas limites
if (store.currentUserId && store.currentUserId !== 'unknown-user') {
  const userInStore = selectors.getUserById(store)(store.currentUserId);
  if (!userInStore) {
    // Utilisateur invalide → Retour sécurisé à unknownUser
    actions.setCurrentUserId(null);
  }
}
```

### ✅ Évolutivité

Le système est prêt pour :
- Migration vers une vraie authentification (JWT, session cookies)
- Connexion SSO (le hook `useAuthHandlers` le supporte déjà)
- Multi-onglets synchronisés (via `storage` events)

---

## 🧪 Tests de validation

### Test 1 : Persistance après rafraîchissement
```
1. Se connecter (ex: Sophie Martin)
   ✅ AppHeader affiche "Sophie Martin - Lyon"
2. Rafraîchir la page (F5)
   ✅ Toujours connecté comme "Sophie Martin - Lyon"
3. Naviguer vers /my-ideas
   ✅ Contenu personnalisé visible
4. Rafraîchir à nouveau
   ✅ Toujours connecté
```

### Test 2 : Connexion depuis mode visiteur
```
1. Ouvrir l'app en mode visiteur
   ✅ AppHeader affiche "Visiteur"
   ✅ Bouton "Se connecter" visible
2. Cliquer sur "Se connecter"
   ✅ LoginDialog s'ouvre
3. Se connecter (email + password)
   ✅ Dialog se ferme
   ✅ AppHeader affiche "Sophie Martin - Lyon"
4. Rafraîchir la page
   ✅ Toujours connecté
```

### Test 3 : Déconnexion (future)
```
1. Connecté comme Sophie Martin
2. Cliquer sur avatar → "Se déconnecter"
   ✅ setCurrentUserId(null) appelé
   ✅ localStorage.removeItem('ideosphere_currentUserId')
3. Rafraîchir la page
   ✅ Retour en mode visiteur
```

### Test 4 : Utilisateur invalide
```
1. Connecté comme Sophie Martin
2. Ouvrir DevTools → localStorage
3. Modifier 'ideosphere_currentUserId' → 'user-999' (invalide)
4. Rafraîchir la page
   ✅ Validation échoue
   ✅ Retour en mode visiteur
   ⚠️ Console: "Utilisateur restauré user-999 non trouvé"
```

---

## 🔮 Améliorations futures

### Court terme

- [ ] Ajouter un bouton "Changer d'utilisateur" dans le profil
- [ ] Ajouter un bouton "Se déconnecter" explicite
- [ ] Toast de bienvenue "Re-bienvenue, Sophie !" au rafraîchissement

### Moyen terme

- [ ] Synchronisation multi-onglets avec `storage` events
- [ ] Expiration de session (ex: 30 jours)
- [ ] Sauvegarde du dernier onglet visité

### Long terme (avec vraie API)

- [ ] JWT tokens avec refresh automatique
- [ ] Session cookies HTTP-only
- [ ] Authentication SSO (Google, etc.)
- [ ] 2FA (Two-Factor Authentication)

---

## 🎯 Résumé

**Problème initial** : Rafraîchir la page déconnecte l'utilisateur sans possibilité de se reconnecter

**Causes** :
1. Store Zustand en mémoire uniquement (pas de persistance)
2. Pas de bouton de connexion accessible depuis les pages internes

**Solutions** :
1. ✅ Persistance de `currentUserId` dans localStorage
2. ✅ Restauration automatique au chargement avec validation
3. ✅ Bouton "Se connecter" dans l'AppHeader pour les visiteurs
4. ✅ LoginDialog accessible depuis n'importe quelle page

**Résultat** : ✅ Utilisateur reste connecté après rafraîchissement + reconnexion facile

---

**Date de création** : 3 novembre 2025  
**Version** : 1.0  
**Lié à** : CORRECTIONS_PUBLICATION_IDEES.md
