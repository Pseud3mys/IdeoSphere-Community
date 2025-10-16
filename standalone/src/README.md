# IdeoSphere

Application web collaborative pour la collecte et discussion d'idées, fonctionnant comme un "système nerveux" permettant aux meilleures idées d'émerger naturellement grâce à l'intelligence collective.

## Architecture Générale

IdeoSphere suit une **architecture unidirectionnelle stricte** :

```
Composants React
    ↓
useEntityStoreSimple (Hook)
    ↓
API Services
    ↓
Données Mockées
```

### Principes Fondamentaux

1. **Source Unique de Vérité** : Le `SimpleEntityStore` est l'unique source de données
2. **Communication Stricte** : Aucune communication directe entre composants et données mockées
3. **Chargement Progressif** : Les données sont chargées selon les besoins (feed minimal, puis détails à la demande)
4. **Mutations Contrôlées** : Toutes les modifications passent par des actions du store

### Distinction Posts vs Projets

- **Posts** : Messages courts et simples (comme des tweets)
- **Projets** : Contenu complexe avec évaluations sur 3 critères (Potentiel, Faisabilité, Aboutissement)

## Structure des Dossiers

### `/store`
Gestion centralisée de l'état applicatif. Voir [store/README.md](./store/README.md)

### `/hooks`
Interface entre composants et store. Voir [hooks/README.md](./hooks/README.md)

### `/api`
Couche de services pour accéder aux données. Voir [api/README.md](./api/README.md)

### `/components`
Composants React organisés par fonctionnalité :
- `auth/` : Authentification (login, signup)
- `create-idea/` : Création d'idées et projets
- `ui/` : Composants UI réutilisables (shadcn/ui)
- Autres : Pages et composants métier

### `/data`
Données mockées simulant une base de données

### `/types`
Définitions TypeScript partagées

### `/utils`
Fonctions utilitaires

## Flux de Données Principaux

### 1. Chargement Initial
```
App.tsx initialise le store
    ↓
WelcomePage affiche la page d'accueil
    ↓
Utilisateur entre sur la plateforme
    ↓
actions.enterPlatform() charge le feed minimal
```

### 2. Navigation vers une Idée
```
Utilisateur clique sur une carte
    ↓
actions.goToIdea(ideaId)
    ↓
fetchIdeaDetails() charge les détails complets
    ↓
fetchDiscussions() charge les discussions
    ↓
Store mis à jour → Composant re-rendu
```

### 3. Interaction (Support/Like)
```
Utilisateur clique sur "Soutenir"
    ↓
actions.toggleIdeaSupport(ideaId)
    ↓
Mise à jour optimiste du store
    ↓
Appel API en arrière-plan
    ↓
Confirmation ou rollback
```

### 4. Changement d'Onglet
```
Utilisateur change d'onglet
    ↓
loadTabData() vérifie si déjà chargé
    ↓
Si non chargé : appel API pour données manquantes
    ↓
Store mis à jour → Onglet affiche les données
```

## Règles de Développement

### ✅ À Faire

- **Toujours** passer par `useEntityStoreSimple` pour accéder aux données
- **Toujours** utiliser les actions du store pour modifier l'état
- Protéger les propriétés optionnelles avec `?.` ou `|| []`
- Utiliser le chargement progressif : feed minimal puis détails à la demande
- Éviter les données imbriquées complexes

### ❌ À Éviter

- Accéder directement aux données mockées depuis les composants
- Créer des états locaux pour des données déjà dans le store
- Charger toutes les données d'un coup
- Muter directement le store (toujours passer par `storeUpdater`)
- Oublier les protections sur les tableaux optionnels

## Exemples d'Utilisation

### Dans un Composant

```tsx
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';

function MyComponent() {
  const { 
    getCurrentUser, 
    getAllIdeas, 
    actions 
  } = useEntityStoreSimple();

  const user = getCurrentUser();
  const ideas = getAllIdeas();

  const handleSupport = (ideaId: string) => {
    actions.toggleIdeaSupport(ideaId);
  };

  return (
    <div>
      {ideas.map(idea => (
        <div key={idea.id}>
          {idea.title}
          <button onClick={() => handleSupport(idea.id)}>
            Soutenir
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Protection des Propriétés Optionnelles

```tsx
// ✅ Correct
const userIdeas = ideas.filter(idea => 
  idea.creators?.some(c => c.id === userId)
);

// ❌ Incorrect (peut crasher)
const userIdeas = ideas.filter(idea => 
  idea.creators.some(c => c.id === userId)
);
```

## Technologies

- **React** : Framework UI
- **TypeScript** : Typage statique
- **Tailwind CSS v4** : Styles
- **Zustand** (via SimpleEntityStore) : Gestion d'état
- **shadcn/ui** : Composants UI

## Démarrage

```bash
npm install
npm run dev
```

## Documentation Détaillée

- [Architecture du Store](./store/README.md)
- [Guide des Hooks](./hooks/README.md)
- [Services API](./api/README.md)
