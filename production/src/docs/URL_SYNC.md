# Synchronisation URL et État de l'Application

## Vue d'ensemble

L'application IdeoSphere utilise un système de synchronisation URL basé sur les **query parameters** (paramètres de requête) pour synchroniser l'état interne avec l'URL du navigateur.

**Format d'URL :** `https://app.example.com/?tab=discovery&ideaId=idea-123`

### Avantages de cette approche

✅ **Partage de liens** : Chaque état de l'application a une URL unique  
✅ **Boutons navigateur** : Les boutons précédent/suivant fonctionnent naturellement  
✅ **Bookmarks** : Les utilisateurs peuvent sauvegarder leurs pages favorites  
✅ **Pas de boucle infinie** : Système robuste avec des flags de protection  
✅ **Sans dépendance** : Utilise uniquement l'API native `URLSearchParams`  

---

## Architecture

### Composant `URLStateSync`

Situé dans `/components/URLStateSync.tsx`, ce composant invisible gère la synchronisation bidirectionnelle :

1. **État → URL** : Quand l'état change, l'URL est mise à jour
2. **URL → État** : Quand l'URL change (chargement, boutons navigateur), l'état est mis à jour

#### Protection contre les boucles infinies

Le composant utilise deux flags `useRef` :
- `isUpdatingUrl` : Actif quand on met à jour l'URL depuis l'état
- `isUpdatingState` : Actif quand on met à jour l'état depuis l'URL

Ces flags empêchent les cycles infinis : État → URL → État → URL...

---

## Paramètres d'URL supportés

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `tab` | string | Page/onglet actif | `?tab=discovery` |
| `ideaId` | string | ID de l'idée sélectionnée | `?tab=idea-detail&ideaId=idea-123` |
| `postId` | string | ID du post sélectionné | `?tab=post-detail&postId=post-456` |
| `userId` | string | ID de l'utilisateur affiché | `?tab=profile&userId=user-789` |

---

## Utilisation

### Navigation programmatique

Utilisez les actions du store comme d'habitude :

```typescript
const { actions } = useEntityStoreSimple();

// Aller vers le fil d'actualité
actions.goToTab('discovery');
// URL devient : ?tab=discovery

// Voir une idée
actions.goToIdea('idea-123');
// URL devient : ?tab=idea-detail&ideaId=idea-123

// Voir un profil
actions.goToUser('user-789');
// URL devient : ?tab=profile&userId=user-789
```

L'URL est automatiquement mise à jour !

### Composant NavigationLink (optionnel)

Pour créer des liens cliquables sémantiques :

```tsx
import { NavigationLink } from './components/NavigationLink';

// Lien vers un onglet
<NavigationLink tab="discovery">
  Retour au fil
</NavigationLink>

// Lien vers une idée
<NavigationLink ideaId="idea-123">
  Voir l'idée
</NavigationLink>

// Lien vers un profil
<NavigationLink userId="user-789">
  Voir le profil
</NavigationLink>

// Lien avec URL personnalisée
<NavigationLink href="?tab=discovery&ideaId=idea-123">
  Lien personnalisé
</NavigationLink>
```

**Avantages du composant NavigationLink :**
- Clic-droit "Ouvrir dans un nouvel onglet" fonctionne
- Support du Cmd/Ctrl+Click pour ouvrir dans un nouvel onglet
- URLs visibles au survol
- Meilleure accessibilité

### Liens simples avec onClick

Si vous préférez, utilisez des liens `<a>` avec `preventDefault` :

```tsx
const { actions } = useEntityStoreSimple();

const handleClick = (e: React.MouseEvent) => {
  e.preventDefault();
  actions.goToIdea('idea-123');
};

<a href="?ideaId=idea-123" onClick={handleClick}>
  Voir l'idée
</a>
```

---

## Fonctionnement technique

### 1. État → URL (Synchronisation sortante)

Quand l'état change via `actions`, le hook dans `URLStateSync` :

1. Détecte le changement via `useEffect([activeTab, selectedIdeaId, ...])`
2. Vérifie le flag `isUpdatingState` (ignorer si on vient de l'URL)
3. Construit les query params avec `URLSearchParams`
4. Met à jour l'URL avec `window.history.pushState()`
5. Active le flag `isUpdatingUrl` temporairement

```typescript
// Exemple : L'utilisateur clique sur une idée
actions.goToIdea('idea-123');

// → store.selectedIdeaId = 'idea-123'
// → store.activeTab = 'idea-detail'
// → URL devient ?tab=idea-detail&ideaId=idea-123
```

### 2. URL → État (Synchronisation entrante)

Quand l'URL change (chargement, boutons navigateur, lien partagé) :

1. `handlePopState` ou chargement initial détecte le changement
2. Vérifie le flag `isUpdatingUrl` (ignorer si on vient de changer l'URL)
3. Extrait les paramètres avec `URLSearchParams`
4. Active le flag `isUpdatingState`
5. Appelle les actions appropriées (`goToIdea`, `goToTab`, etc.)
6. Réinitialise le flag via `requestAnimationFrame`

```typescript
// Exemple : L'utilisateur clique sur "Précédent"
// URL change de ?tab=idea-detail&ideaId=idea-123 à ?tab=discovery

// → URLStateSync détecte le changement
// → Appelle actions.goToTab('discovery')
// → L'application affiche le fil d'actualité
```

### 3. Priorité de navigation

La synchronisation URL → État respecte cet ordre de priorité :

1. **Détail d'idée** : Si `ideaId` présent → `goToIdea(ideaId)`
2. **Détail de post** : Si `postId` présent → `goToPost(postId)`
3. **Profil utilisateur** : Si `userId` présent → `goToUser(userId)`
4. **Onglet** : Si `tab` présent → `goToTab(tab)`
5. **Par défaut** : Aller vers `discovery` (si l'utilisateur est connecté)

---

## Exemples d'URLs

| URL | Description | État résultant |
|-----|-------------|----------------|
| `/` | Page d'accueil | `activeTab: 'welcome'` |
| `/?tab=discovery` | Fil d'actualité | `activeTab: 'discovery'` |
| `/?tab=my-ideas` | Mes contributions | `activeTab: 'my-ideas'` |
| `/?tab=idea-detail&ideaId=idea-123` | Détail d'une idée | `activeTab: 'idea-detail', selectedIdeaId: 'idea-123'` |
| `/?tab=post-detail&postId=post-456` | Détail d'un post | `activeTab: 'post-detail', selectedPostId: 'post-456'` |
| `/?tab=profile&userId=user-789` | Profil utilisateur | `activeTab: 'profile', selectedUserId: 'user-789'` |

---

## Debugging

### Vérifier la synchronisation

Pour débugger la synchronisation URL :

1. Ouvrir la console du navigateur
2. Observer l'URL dans la barre d'adresse
3. Vérifier que les paramètres correspondent à l'état

### Points de vérification

- **L'URL ne change pas** : Vérifier que les flags `isUpdatingState` et `isUpdatingUrl` fonctionnent
- **Boucle infinie** : Vérifier que les flags sont bien réinitialisés via `requestAnimationFrame`
- **Navigation ne fonctionne pas** : Vérifier que les actions sont bien appelées dans `syncUrlToState`
- **Bouton retour ne fonctionne pas** : Vérifier que l'événement `popstate` est bien écouté

### Ajouter des logs de debug

Pour comprendre le flux, ajoutez temporairement des logs :

```typescript
// Dans URLStateSync.tsx
console.log('[URLStateSync] État → URL:', { activeTab, selectedIdeaId });
console.log('[URLStateSync] URL → État:', { tab, ideaId });
console.log('[URLStateSync] Flags:', { isUpdatingUrl: isUpdatingUrl.current, isUpdatingState: isUpdatingState.current });
```

---

## Bonnes pratiques

### ✅ À faire

- Toujours utiliser `actions.goToTab()`, `actions.goToIdea()`, etc. pour naviguer
- Utiliser `NavigationLink` pour les liens cliquables
- Tester la navigation avec les boutons précédent/suivant du navigateur
- Tester le partage d'URL (copier-coller dans un nouvel onglet)

### ❌ À éviter

- Ne pas modifier `window.location.search` directement
- Ne pas appeler `window.history.pushState()` en dehors de `URLStateSync`
- Ne pas modifier les flags `isUpdatingUrl` ou `isUpdatingState` ailleurs
- Ne pas oublier `e.preventDefault()` dans les onClick de liens

---

## Évolution future

### URLs "propres" (chemins au lieu de query params)

Si vous souhaitez passer de `?tab=discovery&ideaId=123` à `/feed` et `/idees/123` :

1. Modifier la logique de construction d'URL dans `URLStateSync`
2. Utiliser `window.location.pathname` au lieu de `.search`
3. Parser le chemin au lieu des query params
4. Garder le même système de flags pour éviter les boucles

### Ajout de nouveaux paramètres

Pour ajouter un nouveau paramètre (ex: `filter`) :

1. Ajouter le paramètre dans le store (`SimpleEntityStore`)
2. L'ajouter dans les dépendances du `useEffect` État → URL
3. L'ajouter dans la logique de synchronisation URL → État
4. Tester la synchronisation bidirectionnelle

---

## Résumé

Le système de synchronisation URL d'IdeoSphere :

✅ Utilise les query parameters pour un routing simple  
✅ Protège contre les boucles infinies avec des flags `useRef`  
✅ Synchronise automatiquement l'état et l'URL  
✅ Support des boutons navigateur et du partage de liens  
✅ Aucune dépendance externe (uniquement `URLSearchParams`)  
✅ Architecture claire et maintenable  

**Pour naviguer :** Utilisez simplement les actions du store !
