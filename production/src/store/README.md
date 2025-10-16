# Store - Gestion Centralisée de l'État

Le dossier `/store` contient la logique de gestion d'état centralisée d'IdeoSphere, basée sur le pattern **SimpleEntityStore**.

## Architecture

```
SimpleEntityStore.tsx    → Provider React + Store Zustand
simpleSelectors.ts       → Fonctions de sélection de données
```

## SimpleEntityStore.tsx

### Responsabilités

1. **Source Unique de Vérité** : Stocke toutes les entités de l'application
2. **Provider React** : Expose le store via Context API
3. **Mutations Contrôlées** : Seule interface autorisée pour modifier l'état

### Structure du Store

```typescript
interface SimpleEntityStore {
  // Entités principales (Map pour accès O(1))
  ideas: Record<string, Idea>;
  posts: Record<string, Post>;
  users: Record<string, User>;
  discussionTopics: Record<string, DiscussionTopic>;
  communities: Record<string, Community>;
  
  // État UI
  activeTab: string;
  selectedIdeaId: string | null;
  selectedPostId: string | null;
  selectedUserId: string | null;
  selectedCommunityId: string | null;
  
  // Métadonnées
  currentUserId: string;
  hasEnteredPlatform: boolean;
  showOnboarding: boolean;
}
```

### Principes de Conception

#### 1. Données Plates (Normalized Data)

**✅ Correct** : Entités séparées avec références par ID
```typescript
{
  ideas: {
    'idea-1': { 
      id: 'idea-1', 
      title: 'Mon idée',
      discussionIds: ['disc-1', 'disc-2']  // Références
    }
  },
  discussionTopics: {
    'disc-1': { id: 'disc-1', content: '...' }
  }
}
```

**❌ Incorrect** : Données imbriquées
```typescript
{
  ideas: {
    'idea-1': { 
      id: 'idea-1',
      discussions: [  // Imbriqué = duplication
        { id: 'disc-1', content: '...' }
      ]
    }
  }
}
```

#### 2. Mutations via StoreUpdater

Toutes les mutations passent par `storeUpdater` pour éviter les "stale closures".

**✅ Correct** :
```typescript
storeUpdater(prevStore => {
  const idea = selectors.getIdeaById(prevStore)(ideaId);
  
  return {
    ideas: {
      ...prevStore.ideas,
      [ideaId]: { ...idea, title: newTitle }
    }
  };
});
```

**❌ Incorrect** :
```typescript
// Utilise l'ancien état (stale closure)
const idea = getIdeaById(ideaId);
setStore({ 
  ideas: { ...store.ideas, [ideaId]: { ...idea, title: newTitle } }
});
```

#### 3. Mise à Jour Partielle

Ne retourner que les parties du store qui changent.

```typescript
// ✅ Correct : mise à jour partielle
return {
  ideas: {
    ...prevStore.ideas,
    [ideaId]: updatedIdea
  }
};

// ❌ Incorrect : copie complète du store
return {
  ...prevStore,
  ideas: {
    ...prevStore.ideas,
    [ideaId]: updatedIdea
  }
};
```

## simpleSelectors.ts

### Responsabilités

Fonctions pures pour extraire et transformer les données du store.

### Règles des Sélecteurs

1. **Pure Functions** : Pas d'effets de bord
2. **Protections** : Toujours gérer les cas `undefined`
3. **Pas de Mutations** : Retourner de nouvelles références si transformation

### Types de Sélecteurs

#### Sélecteurs Simples
Retournent une entité ou une liste directement du store.

```typescript
export const getCurrentUser = (store: SimpleEntityStore) => {
  return store.users[store.currentUserId];
};

export const getAllIdeas = (store: SimpleEntityStore) => {
  return Object.values(store.ideas);
};
```

#### Sélecteurs Dérivés
Calculent des valeurs à partir des données du store.

```typescript
export const getUserIdeas = (store: SimpleEntityStore) => (userId: string) => {
  return Object.values(store.ideas).filter(idea => 
    idea.creators?.some(creator => creator.id === userId)
  );
};
```

#### Sélecteurs avec Protections

**✅ Toujours protéger les propriétés optionnelles** :

```typescript
// Protection sur tableaux optionnels
idea.supporters?.some(s => s.id === userId) || false

// Protection sur propriétés optionnelles
idea.discussionIds?.includes(discussionId) || false

// Protection avec valeur par défaut
(idea.supporters || []).filter(s => s.id !== userId)
```

## Flux de Données

### 1. Lecture

```
Composant
    ↓
useEntityStoreSimple()
    ↓
Sélecteur (simpleSelectors.ts)
    ↓
Store (SimpleEntityStore)
    ↓
Données retournées
```

### 2. Écriture

```
Composant
    ↓
actions.actionName()
    ↓
storeUpdater(prevStore => ...)
    ↓
Sélecteur lit état actuel
    ↓
Calcul nouvel état
    ↓
Store mis à jour
    ↓
Re-render des composants
```

## Bonnes Pratiques

### ✅ À Faire

- Utiliser `storeUpdater` pour toutes les mutations
- Lire l'état via sélecteurs dans les actions
- Protéger toutes les propriétés optionnelles
- Retourner uniquement les parties modifiées du store
- Utiliser des Records (`Record<string, T>`) pour O(1) lookup

### ❌ À Éviter

- Muter directement le store
- Créer des closures qui capturent l'ancien état
- Oublier les protections sur les tableaux
- Copier tout le store lors des mises à jour
- Imbriquer profondément les données

## Exemple Complet

### Action avec StoreUpdater

```typescript
toggleIdeaSupport: async (ideaId: string) => {
  // Utiliser storeUpdater avec fonction
  storeUpdater(prevStore => {
    // 1. Lire l'état actuel via sélecteurs
    const idea = selectors.getIdeaById(prevStore)(ideaId);
    const currentUser = selectors.getCurrentUser(prevStore);

    if (!idea || !currentUser) return {}; // Pas de changement

    // 2. Calculer nouvel état
    const isSupporting = idea.supporters?.some(s => s.id === currentUser.id);
    const newSupporters = isSupporting
      ? (idea.supporters || []).filter(s => s.id !== currentUser.id)
      : [...(idea.supporters || []), currentUser];

    const updatedIdea = {
      ...idea,
      supporters: newSupporters,
      supportCount: newSupporters.length
    };

    // 3. Appeler API en parallèle (ne pas attendre)
    toggleIdeaSupportOnApi(ideaId, currentUser.id);

    // 4. Retourner uniquement ce qui change
    return {
      ideas: {
        ...prevStore.ideas,
        [ideaId]: updatedIdea
      }
    };
  });
}
```

## Debugging

### Logs Utiles

```typescript
// Dans une action
storeUpdater(prevStore => {
  console.log('État avant:', prevStore.ideas[ideaId]);
  const result = { /* ... */ };
  console.log('État après:', result.ideas?.[ideaId]);
  return result;
});
```

### Vérifier les Re-renders

React DevTools → Components → Highlight updates
