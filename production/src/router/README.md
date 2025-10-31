# Router - Système de Routage avec React Router

Ce dossier contient la configuration du système de routage de l'application IdeoSphere basé sur React Router v6.

## Structure

```
/router
├── README.md           # Ce fichier
├── routes.tsx          # Configuration de toutes les routes
└── ProtectedRoute.tsx  # Composant pour protéger les routes authentifiées
```

## Fichiers

### `routes.tsx`
Définit toutes les routes de l'application de manière déclarative.

**Structure des routes** :
- Routes publiques (layout avec Footer uniquement)
- Routes d'authentification (signup)
- Routes protégées (layout complet avec Header + Navigation)

**Exemple** :
```tsx
import { routes } from './router/routes';
import { useRoutes } from 'react-router-dom';

function App() {
  return useRoutes(routes);
}
```

### `ProtectedRoute.tsx`
Composant wrapper qui vérifie l'authentification avant d'afficher une route.

**Fonctionnement** :
1. Récupère l'utilisateur actuel depuis le store
2. Vérifie si `currentUser.isRegistered === true`
3. Si oui : affiche le contenu
4. Si non : redirige vers `/` (page d'accueil)

**Exemple** :
```tsx
<Route 
  path="/discovery" 
  element={
    <ProtectedRoute>
      <DiscoveryPage />
    </ProtectedRoute>
  } 
/>
```

## Routes Disponibles

### Routes Publiques (accessible à tous)
- `/` - Page d'accueil (CitizenWelcome)
- `/about` - À propos
- `/how-it-works` - Comment ça marche
- `/faq` - Questions fréquentes
- `/privacy` - Politique de confidentialité
- `/terms` - Conditions d'utilisation

### Routes d'Authentification
- `/signup` - Inscription

### Routes Protégées (authentification requise)
- `/discovery` - Feed de découverte (page principale)
- `/my-ideas` - Mes contributions
- `/create-idea` - Créer une idée
- `/idea/:ideaId` - Détail d'une idée
- `/post/:postId` - Détail d'un post
- `/profile` - Mon profil
- `/user/:userId` - Profil public d'un utilisateur
- `/communities` - Liste des communautés
- `/community/:communityId` - Détail d'une communauté

## Migration en Cours

Ce système de routage est actuellement en cours de migration (Phase 1/7).

### Phase actuelle : Phase 1 ✅
- ✅ Installation de React Router
- ✅ Création de la structure de base
- ✅ Création des layouts (AppLayout, PublicLayout)
- ✅ Définition des routes

### Prochaine phase : Phase 2
- Intégration de React Router dans App.tsx
- Migration des pages publiques
- Adaptation du Footer pour utiliser `<Link>`

## État de Transition

**Actuellement** :
- Les routes sont définies mais pas encore utilisées
- L'ancienne logique de navigation (URLStateSync, AppContent) est toujours active
- Les composants utilisent encore les props `onNavigateBack`, `onBack`, etc.

**Après migration complète** :
- Une seule source de vérité : l'URL
- Plus de `URLStateSync.tsx` ou `AppContent.tsx`
- Navigation avec `useNavigate()` et `<Link>`
- Rechargement de page fonctionnel
- Partage d'URLs fonctionnel

## Utilisation Future (après migration)

### Navigation programmatique
```tsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/discovery');
  };
  
  return <button onClick={handleClick}>Aller au feed</button>;
}
```

### Liens déclaratifs
```tsx
import { Link } from 'react-router-dom';

function MyComponent() {
  return <Link to="/idea/123">Voir l'idée</Link>;
}
```

### Paramètres d'URL
```tsx
import { useParams } from 'react-router-dom';

function IdeaDetailPage() {
  const { ideaId } = useParams<{ ideaId: string }>();
  
  // ideaId est extrait de l'URL /idea/:ideaId
  return <div>Idée {ideaId}</div>;
}
```

### Route active
```tsx
import { useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();
  const isActive = location.pathname === '/discovery';
  
  return <Link className={isActive ? 'active' : ''}>Discovery</Link>;
}
```

## Avantages du Nouveau Système

1. **Une seule source de vérité** : L'URL reflète toujours l'état de navigation
2. **Rechargement fonctionnel** : Pas de perte de contexte au refresh
3. **Partage d'URLs** : Les liens peuvent être copiés/partagés
4. **Boutons navigateur** : Précédent/Suivant fonctionnent nativement
5. **Code simplifié** : Logique déclarative au lieu de conditions if/else
6. **TypeScript** : Typage des paramètres d'URL

## Voir Aussi

- `/PLAN_MIGRATION_REACT_ROUTER.md` - Plan complet de migration
- `/docs/URL_SYNC.md` - Documentation de l'ancien système
- [React Router Documentation](https://reactrouter.com/)

---

*Dernière mise à jour : Phase 1 de la migration (30 octobre 2025)*
