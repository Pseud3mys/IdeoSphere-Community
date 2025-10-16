# Synchronisation URL et État de l'Application

## Vue d'ensemble

L'application IdeoSphere utilise un système de routing personnalisé qui synchronise automatiquement l'état interne de l'application avec l'URL du navigateur. Cela permet :

- **Navigation via URL** : Accéder directement à une page via son URL
- **Boutons retour/avant** : Utiliser les boutons du navigateur pour naviguer
- **Partage de liens** : Partager des URLs qui pointent vers des pages ou contenus spécifiques
- **Bookmarks** : Sauvegarder des favoris vers des pages spécifiques

## Architecture

### Hook `useUrlSync`

Situé dans `/hooks/useUrlSync.ts`, ce hook est responsable de la synchronisation bidirectionnelle entre :
- L'état de l'application (stocké dans `SimpleEntityStore`)
- L'URL du navigateur

Il est appelé dans `App.tsx` au niveau du composant racine `AppWithStore`.

### Composant `Link`

Situé dans `/components/Link.tsx`, ce composant permet de créer des liens internes qui utilisent la navigation de l'application au lieu de recharger la page.

```tsx
import { Link } from './components/Link';

<Link href="/feed">Voir le fil d'actualité</Link>
<Link href="/idees/idea-123">Voir cette idée</Link>
```

## Mapping des URLs

### Pages principales

| URL | Page | État correspondant |
|-----|------|-------------------|
| `/` | Page d'accueil | `activeTab: 'welcome'` |
| `/feed` | Fil d'actualité | `activeTab: 'discovery'` |
| `/mes-contributions` | Mes contributions | `activeTab: 'my-ideas'` |
| `/creer-idee` | Créer une idée | `activeTab: 'create-idea'` |
| `/communautes` | Communautés | `activeTab: 'communities'` |
| `/mon-profil` | Mon profil | `activeTab: 'profile'` |
| `/inscription` | Inscription | `activeTab: 'signup'` |

### Pages de contenu dynamique

| URL | Page | État correspondant |
|-----|------|-------------------|
| `/idees/:id` | Détail d'une idée | `activeTab: 'idea-detail'` + `selectedIdeaId` |
| `/posts/:id` | Détail d'un post | `activeTab: 'post-detail'` + `selectedPostId` |
| `/profil/:userId` | Profil public | `activeTab: 'profile'` + `selectedUserId` |

### Pages footer

| URL | Page | État correspondant |
|-----|------|-------------------|
| `/a-propos` | À propos | `activeTab: 'about'` |
| `/comment-ca-marche` | Comment ça marche | `activeTab: 'how-it-works'` |
| `/faq` | FAQ | `activeTab: 'faq'` |
| `/confidentialite` | Confidentialité | `activeTab: 'privacy'` |
| `/conditions` | Conditions d'utilisation | `activeTab: 'terms'` |

## Fonctionnement technique

### 1. État → URL

Quand l'état de l'application change (via `actions.goToTab()`, `actions.setSelectedIdeaId()`, etc.), le hook `useUrlSync` :

1. Détecte le changement via `useEffect` qui observe `store.activeTab`, `store.selectedIdeaId`, etc.
2. Construit le chemin URL approprié via `buildPathFromState()`
3. Met à jour l'URL du navigateur avec `window.history.pushState()`

```typescript
// Exemple : navigation vers une idée
actions.setSelectedIdeaId('idea-123');
actions.setActiveTab('idea-detail');
// → URL devient /idees/idea-123
```

### 2. URL → État

Quand l'URL change (bouton retour, lien direct, etc.), le hook `useUrlSync` :

1. Écoute l'événement `popstate` du navigateur
2. Extrait le chemin de l'URL actuelle
3. Appelle `updateStateFromPath()` qui détermine les actions à effectuer
4. Met à jour l'état de l'application via les actions appropriées

```typescript
// Exemple : utilisateur clique sur le bouton retour
// URL change de /idees/idea-123 à /feed
// → actions.fetchFeed() est appelé automatiquement
```

### 3. Chargement initial

Au premier chargement de l'application :

1. `useUrlSync` lit l'URL actuelle
2. Appelle `updateStateFromPath()` pour initialiser l'état
3. L'application s'affiche directement sur la bonne page

```typescript
// Exemple : utilisateur arrive sur /idees/idea-123
// → L'application charge directement la page de détail de l'idée
```

## Utilisation dans les composants

### Navigation programmatique

Utilisez les actions du store pour naviguer :

```typescript
const { actions } = useEntityStoreSimple();

// Aller vers le feed
actions.fetchFeed();

// Aller vers une idée
actions.setSelectedIdeaId('idea-123');
actions.setActiveTab('idea-detail');

// Aller vers mes contributions
actions.fetchMyContributions();
```

### Liens cliquables

Utilisez le composant `Link` pour créer des liens qui ne rechargent pas la page :

```tsx
import { Link } from './components/Link';

<Link href="/feed" className="text-blue-500">
  Retour au fil
</Link>

<Link href={`/idees/${idea.id}`}>
  Voir l'idée
</Link>
```

## Avantages

1. **Performance** : Pas de rechargement complet de la page
2. **UX améliorée** : Navigation instantanée et fluide
3. **Préservation de l'état** : L'état de l'application est préservé pendant la navigation
4. **SEO-friendly** : URLs lisibles et partageables
5. **Historique du navigateur** : Boutons retour/avant fonctionnent correctement

## Limitations actuelles

- Les URLs ne sont pas encore configurées côté serveur (nécessiterait une config de fallback vers index.html)
- Le refresh d'une page spécifique (ex: `/idees/idea-123`) peut renvoyer une 404 si le serveur n'est pas configuré
- Pour un déploiement production, il faudra configurer le serveur pour servir `index.html` pour toutes les routes

## Configuration serveur recommandée

Pour un déploiement en production, configurez votre serveur web pour :

1. Servir `index.html` pour toutes les routes inconnues
2. Laisser passer les fichiers statiques (CSS, JS, images)

### Exemple Nginx

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Exemple Apache (.htaccess)

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Vercel / Netlify

Créer un fichier `vercel.json` ou `netlify.toml` :

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Debugging

Pour débugger la synchronisation URL :

1. Ouvrir la console du navigateur
2. Observer les logs `useUrlSync` qui montrent les changements d'état et d'URL
3. Vérifier que `window.location.pathname` correspond à l'état attendu

```typescript
// Dans useUrlSync.ts, des logs sont présents pour le debugging
console.log('🔗 [useUrlSync] État → URL:', currentPath);
console.log('🔙 [useUrlSync] URL → État:', path);
```
