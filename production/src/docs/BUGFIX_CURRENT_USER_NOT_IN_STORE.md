# Bugfix: Utilisateur Connecté Non Ajouté au Store

**Date:** 27 octobre 2025  
**Statut:** ✅ Résolu

## 🐛 Problème

### Symptômes
Lorsqu'un utilisateur se connecte avec succès (via email ou connexion sociale), son propre nom s'affichait comme "Utilisateur Inconnu" dans ses propres posts et partout où son ID était référencé.

### Exemple concret
1. Utilisateur se connecte avec `demo@google.com`
2. `store.currentUserId` est bien défini à `'user-123'`
3. Mais `store.users['user-123']` n'existe pas
4. `getUserById('user-123')` retourne `unknownUser`
5. Tous les posts de l'utilisateur affichent "Utilisateur Inconnu" comme auteur

### Log d'erreur observé
```
⚠️ validateUser: user is undefined or null
```

## 🔍 Diagnostic

### Cause racine: Utilisateur jamais ajouté au dictionnaire `users`

Le problème était dans le flux d'authentification :

**1. Flux de login par email :**
```typescript
// useAuthHandlers.ts - handleLogin()
const existingUser = await checkEmailExists(email);  // ✅ Retourne User de l'API

if (existingUser) {
  const localUser = switchToUserByEmail(email);  // ❌ Ne trouve pas l'user dans le store !
  
  if (localUser) {
    // Ce code s'exécute
  } else {
    // ❌ Fallback : setCurrentUserData() est appelé MAIS...
    setCurrentUserData(existingUser);
  }
}
```

**2. Le callback `setCurrentUserData` dans App.tsx :**
```typescript
// App.tsx - ligne 92-100
const setCurrentUserData = (userData) => {
  const existingUser = actions.switchToUserByEmail(userData.email);
  if (existingUser) {
    return;  // ❌ RETOUR PRÉCOCE sans rien faire !
  }
  
  // ✅ Ajoute l'user au store seulement si switchToUserByEmail échoue
  actions.addUserAndSetAsCurrent(userData);
};
```

**3. Le problème :**
- `checkEmailExists` appelait l'API et retournait un User complet
- Mais ne l'ajoutait **JAMAIS** au dictionnaire `store.users`
- `switchToUserByEmail` cherchait l'user dans `store.users` → Non trouvé → Retournait `null`
- Le code de fallback s'exécutait, mais `setCurrentUserData` avait une logique défaillante
- Résultat : `currentUserId` était défini, mais l'user n'était pas dans `users`

### Problème architectural

**Le store avait deux états incohérents :**
```typescript
store.currentUserId = 'user-123'  // ✅ Défini
store.users = {                    // ❌ user-123 n'existe pas
  'unknown': unknownUser,
  // user-123 manquant !
}
```

**Conséquence :** Tous les appels à `getUserById(currentUserId)` retournaient `unknownUser`.

## ✅ Solution implémentée

### 1. Correction de `checkEmailExists` dans `/hooks/userActions.ts`

S'assurer que l'utilisateur retourné par l'API est **TOUJOURS** ajouté au store :

```typescript
// Action pour vérifier l'existence d'un email via l'API d'authentification
checkEmailExists: async (email: string) => {
  try {
    const { loginWithEmail } = await import('../api/authService');
    const user = await loginWithEmail(email);
    
    // ✅ Si l'utilisateur existe, l'ajouter au store immédiatement
    if (user) {
      // Vérifier si l'utilisateur n'est pas déjà dans le store
      if (!boundSelectors.userExists(user.id)) {
        actions.addUser(user);
        console.log('✅ [hook/userActions] Utilisateur ajouté au store après login:', user.name);
      } else {
        // Mettre à jour l'utilisateur existant avec les données fraîches de l'API
        actions.updateUser(user.id, user);
        console.log('✅ [hook/userActions] Utilisateur mis à jour dans le store après login:', user.name);
      }
    }
    
    return user;
  } catch (error) {
    console.error('❌ [hook/userActions] checkEmailExists:', error);
    return null;
  }
},
```

**Avantages :**
- ✅ L'utilisateur est ajouté au store dès que l'API répond
- ✅ Si l'utilisateur existe déjà, on met à jour ses données (données fraîches de l'API)
- ✅ Logs de débogage clairs

### 2. Amélioration de `loginWithSocialProvider`

Même correction pour la connexion sociale :

```typescript
loginWithSocialProvider: async (provider: string, socialData: { email: string; name: string; avatar?: string }) => {
  try {
    const { loginWithSocialProvider: loginWithSocialProviderApi } = await import('../api/authService');
    const user = await loginWithSocialProviderApi(provider, socialData);
    
    if (user) {
      // ✅ Vérifier si l'utilisateur existe vraiment dans le store local
      if (!boundSelectors.userExists(user.id)) {
        actions.addUser(user);
        console.log('✅ [hook/userActions] Utilisateur social ajouté au store:', user.name);
      } else {
        // Mettre à jour l'utilisateur existant avec les données fraîches de l'API
        actions.updateUser(user.id, user);
        console.log('✅ [hook/userActions] Utilisateur social mis à jour dans le store:', user.name);
      }
      actions.setCurrentUserId(user.id);
    }
    
    return user;
  } catch (error) {
    console.error('❌ [hook/userActions] loginWithSocialProvider:', error);
    return null;
  }
},
```

### 3. Clarification de `handleLogin` dans `/hooks/useAuthHandlers.ts`

Amélioration de la documentation et de la gestion d'erreur :

```typescript
const handleLogin = async (email: string, password: string = ''): Promise<boolean> => {
  try {
    // ✅ Appeler l'action du store qui vérifie l'email ET ajoute l'user au store
    const existingUser = await checkEmailExists(email);
    
    if (existingUser) {
      // ✅ L'utilisateur est maintenant dans le store grâce à checkEmailExists
      // Basculer vers cet utilisateur (setCurrentUserId)
      const localUser = switchToUserByEmail(email);
      
      if (localUser) {
        toast.success(`Connecté en tant que ${localUser.name} ! 🎉`);
        handleEnterPlatform();
        return true;
      } else {
        // ⚠️ Cela ne devrait jamais arriver car checkEmailExists a ajouté l'user au store
        console.error('❌ [useAuthHandlers] handleLogin: L\'utilisateur n\'a pas été trouvé dans le store après checkEmailExists');
        
        // Fallback: ajouter manuellement l'utilisateur au store
        setCurrentUserData(existingUser);
        toast.success(`Connecté en tant que ${existingUser.name} ! 🎉`);
        handleEnterPlatform();
        return true;
      }
    } else {
      toast.error('Aucun compte trouvé avec cet email. Créez d\'abord un compte.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ [hook/useAuthHandlers] handleLogin:', error);
    toast.error('Erreur de connexion. Veuillez réessayer.');
    return false;
  }
};
```

## 🎯 Résultat

**Avant la correction :**
```typescript
// Après login avec demo@google.com
store.currentUserId = 'user-social-123'
store.users = { 'unknown': unknownUser }  // ❌ user-social-123 manquant !
getUserById('user-social-123') → unknownUser  // ❌ Affiche "Utilisateur Inconnu"
```

**Après la correction :**
```typescript
// Après login avec demo@google.com
store.currentUserId = 'user-social-123'
store.users = { 
  'unknown': unknownUser,
  'user-social-123': { id: 'user-social-123', name: 'Utilisateur Google', ... }  // ✅ Présent !
}
getUserById('user-social-123') → User complet  // ✅ Affiche "Utilisateur Google"
```

## 📚 Leçons apprises

### 1. Cohérence des états du store

**Principe :** Si `store.currentUserId` est défini, alors `store.users[currentUserId]` DOIT exister.

**Solution :** Toujours ajouter l'utilisateur au store AVANT de définir `currentUserId`.

### 2. Pattern pour l'authentification

**Flux correct :**
```
1. API → Retourne User complet
2. addUser(user) → Ajoute au store.users
3. setCurrentUserId(user.id) → Définit l'utilisateur actuel
```

**Anti-pattern :**
```
❌ setCurrentUserId(user.id) avant addUser(user)
❌ Retourner un User sans l'ajouter au store
```

### 3. Gestion du cache vs. données fraîches

**Stratégie adoptée :**
- Si l'utilisateur n'existe pas dans le store → `addUser()`
- Si l'utilisateur existe déjà → `updateUser()` avec les données fraîches de l'API

**Avantage :** Garantit que les données affichées sont toujours les plus récentes.

### 4. Logs de débogage

**Ajout de logs explicites :**
```typescript
console.log('✅ [hook/userActions] Utilisateur ajouté au store après login:', user.name);
console.log('✅ [hook/userActions] Utilisateur mis à jour dans le store après login:', user.name);
```

**Avantage :** Permet de tracer précisément le flux d'authentification et de détecter rapidement les problèmes.

## 🔗 Fichiers modifiés

- `/hooks/userActions.ts` - Fonctions `checkEmailExists` et `loginWithSocialProvider` corrigées
- `/hooks/useAuthHandlers.ts` - Fonction `handleLogin` clarifiée et documentée
- `/docs/BUGFIX_CURRENT_USER_NOT_IN_STORE.md` - Ce document

## ✅ Tests de validation

### Scénarios testés

1. **Login par email :**
   - ✅ Se connecter avec `demo@google.com`
   - ✅ Vérifier que le nom s'affiche correctement dans l'en-tête
   - ✅ Vérifier que les posts de l'utilisateur affichent le bon nom d'auteur
   - ✅ Vérifier le log : "Utilisateur ajouté au store après login"

2. **Connexion sociale :**
   - ✅ Se connecter avec Google/Facebook/Discord
   - ✅ Vérifier que le nom s'affiche correctement
   - ✅ Vérifier le log : "Utilisateur social ajouté au store"

3. **Reconnexion avec un utilisateur existant :**
   - ✅ Se déconnecter et se reconnecter
   - ✅ Vérifier le log : "Utilisateur mis à jour dans le store après login"

4. **Création de compte :**
   - ✅ Créer un nouveau compte
   - ✅ Vérifier que l'utilisateur s'affiche correctement immédiatement

### Régression potentielle

- ⚠️ Aucune régression identifiée
- ✅ Les utilisateurs temporaires (guest, visitor) continuent de fonctionner correctement
- ✅ Les utilisateurs mockés continuent de fonctionner correctement

## 🔄 Impact sur d'autres bugfixes

Ce bugfix est complémentaire au **BUGFIX_RACE_CONDITION_USERS.md** :
- La race condition des utilisateurs du lineage est résolue par l'ajout des users AVANT la création des posts
- Ce bugfix résout le problème de l'utilisateur connecté lui-même
- Les deux corrections ensemble garantissent que TOUS les utilisateurs sont toujours dans le store avant d'être référencés

## 📝 Notes de développement

**Architecture finale :**
```
┌─────────────────┐
│ Authentification│
│    (API call)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  checkEmailExists│  ← Ajoute l'user au store
│ ou loginWithSocial│     (actions.addUser)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│switchToUserByEmail│  ← Définit currentUserId
│                   │     (actions.setCurrentUserId)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  User connecté  │
│  store.currentUserId = 'user-123'
│  store.users['user-123'] = { ... }  ← ✅ Cohérent !
└─────────────────┘
```

**Principe clé :** Les actions d'authentification sont responsables de l'ajout de l'utilisateur au store, pas les callbacks UI.
