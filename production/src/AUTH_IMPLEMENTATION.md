# Système d'Authentification Hybride - IdeoSphere

## ✅ Implémentation complète

Date : 19 novembre 2025

### 🎯 Objectif

Créer un système d'authentification flexible qui fonctionne en mode **Mock** (développement/Figma) et qui sera facilement migratable vers **Keycloak** (production).

---

## 📦 Architecture finale

```
App.tsx
  └─ ErrorBoundary
      └─ SimpleEntityStoreProvider
          └─ AuthProvider (context React)
              └─ MemoryRouter
                  ├─ AuthSyncBridge (synchronisation Auth ↔ Store)
                  └─ Routes
```

### Flux de données

1. **AuthProvider** s'initialise au démarrage de l'app
2. Appelle `authService.initAuth()` qui détecte le mode (`'mock'` ou `'keycloak'`)
3. En mode `'mock'` : `MockAuthService.init()` vérifie localStorage
4. **AuthContext** fournit `{ isAuthenticated, user, isLoading }`
5. **AuthSyncBridge** lit `useAuth()` et synchronise avec `SimpleEntityStore`
   - `actions.addUser(user)`
   - `actions.setCurrentUserId(user.id)`
6. L'UI réagit automatiquement (AppHeader, etc.)

---

## 📂 Fichiers créés/modifiés

### ✅ Créés

| Fichier | Description |
|---------|-------------|
| `/auth/MockAuthService.ts` | Service d'auth simulé avec localStorage |
| `/context/authContext.tsx` | Contexte React pour l'authentification |
| `/auth/AuthSyncBridge.tsx` | Pont de synchronisation Auth ↔ Store |
| `/AUTH_IMPLEMENTATION.md` | Cette documentation |

### ✅ Modifiés

| Fichier | Modifications |
|---------|--------------|
| `/api/authService.ts` | Chef d'orchestre qui choisit Mock ou Keycloak |
| `/App.tsx` | Intégration de AuthProvider + AuthSyncBridge |
| `/config/clients/default.ts` | Config auth avec mockUser complet |
| `/config/clients/beta.ts` | Config auth avec mockUser complet |
| `/router/UserProfilePageWrapper.tsx` | Ajout du check `isLoading` pour éviter redirect prématuré |

---

## 🔧 Configuration

### Mode Mock (défaut)

**Fichier :** `/config/clients/default.ts`

```typescript
auth: {
  mode: 'mock',
  mockUser: {
    id: 'user-demo',
    email: 'demo@ideosphere.community',
    name: 'Utilisateur Démo',
    location: 'Paris',
    bio: 'Compte de test pour Figma Make',
  },
}
```

### Mode Keycloak (production - à venir)

**Fichier :** `/config/clients/default.ts`

```typescript
auth: {
  mode: 'keycloak',
  keycloak: {
    url: 'https://auth.ideosphere.community',
    realm: 'ideosphere-prod',
    clientId: 'ideosphere-web-app',
  }
}
```

---

## 🚀 Fonctionnement

### Mode Mock

#### 1. Premier chargement (utilisateur non connecté)

```
🔄 [AUTH] Initialisation du service d'authentification...
⚠️ [AUTH] Mode MOCK activé
⚠️ [MockAuth] Initialisation...
🔄 [AuthContext] Initialisation...
ℹ️ [AuthContext] Aucun utilisateur authentifié
🔓 [AuthContext] Initialisation terminée
```

**Interface :** Affiche "Se connecter"

#### 2. Clic sur "Se connecter avec SSO"

```javascript
MockAuthService.login()
  → localStorage.setItem('mock_auth_is_logged_in', 'true')
  → window.location.reload()
```

#### 3. Après rechargement (utilisateur connecté)

```
🔄 [AUTH] Initialisation du service d'authentification...
⚠️ [AUTH] Mode MOCK activé
⚠️ [MockAuth] Initialisation...
🔄 [AuthContext] Initialisation...
✅ [AuthContext] Utilisateur authentifié: Utilisateur Démo
🔓 [AuthContext] Initialisation terminée
🔄 [AuthSync] Synchro User -> Store: Utilisateur Démo
✅ [AuthSync] Utilisateur synchronisé: mock-user-id-1
```

**Interface :** Affiche l'avatar "UD" et "Mon profil" cliquable

---

## 🔍 Débogage

### Vérifier l'état d'authentification

Ouvrez la console du navigateur :

```javascript
// Vérifier localStorage
localStorage.getItem('mock_auth_is_logged_in');

// Forcer la déconnexion
localStorage.removeItem('mock_auth_is_logged_in');
window.location.reload();

// Forcer la connexion
localStorage.setItem('mock_auth_is_logged_in', 'true');
window.location.reload();
```

### Logs console

Le système fournit des logs détaillés avec préfixes :

- `[AUTH]` - authService.ts
- `[MockAuth]` - MockAuthService.ts
- `[AuthContext]` - authContext.tsx
- `[AuthSync]` - AuthSyncBridge.tsx

---

## ✅ Tests effectués

- ✅ Connexion Mock fonctionne
- ✅ Déconnexion Mock fonctionne
- ✅ Synchronisation avec SimpleEntityStore fonctionne
- ✅ AppHeader affiche l'utilisateur connecté
- ✅ Navigation vers "Mon profil" fonctionne
- ✅ Profil utilisateur s'affiche correctement
- ✅ Pas de redirect prématuré (fix avec `isLoading`)

---

## 🔜 Prochaines étapes (Keycloak)

### À implémenter

1. **Installer Keycloak JS adapter**
   ```bash
   npm install keycloak-js
   ```

2. **Créer `/api/keycloak.ts`**
   ```typescript
   import Keycloak from 'keycloak-js';
   import { getKeycloakConfig } from '../config/clientConfig';
   
   const config = getKeycloakConfig();
   
   export const keycloak = new Keycloak({
     url: config.url,
     realm: config.realm,
     clientId: config.clientId,
   });
   ```

3. **Décommenter le code Keycloak dans `/api/authService.ts`**
   - `initAuth()` : Initialiser Keycloak
   - `getUserProfile()` : Récupérer le profil depuis le token
   - `loginWithSSO()` : Rediriger vers Keycloak login
   - `registerWithSSO()` : Rediriger vers Keycloak register
   - `logout()` : Déconnexion Keycloak

4. **Créer le fichier `/public/silent-check-sso.html`**
   ```html
   <!DOCTYPE html>
   <html>
   <body>
   <script>
     parent.postMessage(location.href, location.origin);
   </script>
   </body>
   </html>
   ```

5. **Changer la config en production**
   ```typescript
   auth: {
     mode: 'keycloak', // ← Changer ici
     keycloak: { ... }
   }
   ```

### Note importante

**Les champs `bio`, `address`, `avatar`, etc. ne seront PAS récupérés depuis Keycloak.**

Ces données seront gérées séparément :
- Stockées dans une base de données IdeoSphere
- Modifiables par l'utilisateur dans son profil
- Synchronisées avec le token JWT (id, name, email uniquement)

---

## 📚 Documentation associée

- `/config/README.md` - Documentation de la configuration
- `/ARCHITECTURE.md` - Architecture globale de l'application
- `/router/README.md` - Documentation du routage

---

## ✨ Avantages de cette architecture

### Pour le développement

- ✅ Pas besoin de Keycloak en local
- ✅ Tests rapides sans serveur externe
- ✅ Utilisateur auto-connecté (configuré dans config)
- ✅ Logs détaillés pour déboguer

### Pour la production

- ✅ Migration simple (1 ligne de config)
- ✅ Architecture prête pour SSO
- ✅ Code bien séparé (Mock/Keycloak)
- ✅ Type-safe avec TypeScript
- ✅ Pas de refactoring nécessaire

---

## 🐛 Problèmes résolus

### 1. Redirect prématuré vers "/" sur /profile

**Problème :** Quand on clique sur "Mon profil", `UserProfilePageWrapper` vérifie immédiatement si `getCurrentUser()` existe. Pendant le chargement de l'auth, cela retourne `null`, donc redirect vers `/`.

**Solution :** Ajout d'un check `isLoading` :

```typescript
const { isLoading: authLoading } = useAuth();

if (authLoading) {
  return <div>Chargement du profil...</div>;
}
```

### 2. Champs location/bio dans getUserProfile Keycloak

**Problème :** Le code commenté pour Keycloak récupérait `location` et `bio` depuis le token.

**Solution :** Ces champs ne seront pas dans le token Keycloak, ils seront gérés séparément dans la base de données IdeoSphere.

```typescript
// Avant (❌)
return {
  id: data.sub,
  name: data.name,
  email: data.email,
  address: data.location,  // ❌ Ne sera pas dans le token
  bio: data.bio,           // ❌ Ne sera pas dans le token
};

// Après (✅)
return {
  id: data.sub,
  name: data.preferred_username || data.name,
  email: data.email,
  isRegistered: true,
  // bio, address, avatar, etc. seront chargés séparément
};
```

---

**Fin de la documentation**
