# Utils - Utilitaires IdeoSphere

Ce dossier contient les fonctions utilitaires réutilisables à travers l'application.

---

## 📁 Fichiers

### `idUtils.ts` - Nettoyage des IDs
Utilitaires pour normaliser les IDs venant de l'API Supabase qui peuvent contenir des préfixes.

**Problème résolu** :
L'API Supabase retourne parfois des IDs avec des préfixes comme "ideas/384539" ou "posts/123", ce qui crée des URLs invalides dans React Router comme `/idea/ideas/384539`.

**Fonctions disponibles** :
```typescript
cleanIdeaId(ideaId: string): string
// Exemples:
cleanIdeaId("ideas/384539") → "384539"
cleanIdeaId("384539") → "384539"

cleanPostId(postId: string): string
// Exemples:
cleanPostId("posts/123") → "123"
cleanPostId("123") → "123"

cleanDiscussionId(discussionId: string): string
cleanCommunityId(communityId: string): string
cleanId(id: string): string // Générique
```

**Utilisation** :
```typescript
// Dans transformService (nettoyage à la source)
import { cleanIdeaId } from '../utils/idUtils';

export function transformIdeaCardToIdea(ideaCard: any): Idea {
  return {
    id: cleanIdeaId(ideaCard.id),
    // ...
  };
}

// Dans les wrappers (nettoyage des params)
const { ideaId } = useParams();
const cleanedId = cleanIdeaId(ideaId);
const idea = getIdeaById(cleanedId);

// Dans les liens (nettoyage avant navigation)
<Link to={`/idea/${cleanIdeaId(idea.id)}`}>
```

**Pattern de nettoyage en 4 couches** :
1. **Source (transformService)** - Nettoyer lors de la transformation API → Store
2. **Navigation** - Nettoyer avant `navigate()`
3. **Params** - Nettoyer dans les wrappers avec `useParams()`
4. **Liens** - Nettoyer dans les composants avec `<Link>`

---

### `hashtagUtils.ts` - Gestion des hashtags
Extraction et manipulation des hashtags dans le contenu.

**Fonctions disponibles** :
```typescript
extractHashtags(text: string): string[]
// Extrait tous les hashtags d'un texte
extractHashtags("Bonjour #idée #projet") → ["idée", "projet"]

extractHashtagsFromMultipleTexts(texts: string[]): string[]
// Extrait et déduplique les hashtags de plusieurs textes
```

**Utilisation** :
```typescript
// Dans createIdea
const tags = extractHashtagsFromMultipleTexts([
  idea.title,
  idea.summary,
  idea.description
]);
```

---

### `feedChainUtils.ts` - Gestion des chaînes d'items
Calcule le contexte de chaîne pour l'affichage dans le feed (post source d'une idée, etc.).

**Types** :
```typescript
interface ItemChainContext {
  type: 'derived' | 'source' | 'response' | 'version';
  relatedItem: {
    id: string;
    type: 'idea' | 'post';
    title?: string;
    content?: string;
    // ...
  };
}
```

**Fonctions** :
```typescript
getItemChainContext(
  item: Idea | Post,
  allIdeas: Idea[],
  allPosts: Post[]
): ItemChainContext | null
```

**Utilisation** :
```typescript
// Dans DiscoveryPage
const chainContext = getItemChainContext(idea, allIdeas, allPosts);

<IdeaCard
  idea={idea}
  chainContext={chainContext}
/>
```

---

### `userValidation.ts` - Validation des utilisateurs
Validation et extraction safe des données utilisateur.

**Fonctions** :
```typescript
getFirstCreator(creators: User[] | undefined): User | null
// Retourne le premier créateur ou null si tableau vide/undefined

isValidUser(user: any): user is User
// Valide qu'un objet est bien un User valide
```

**Utilisation** :
```typescript
// Protection contre les tableaux vides avec résolution d'IDs
const creator = getFirstCreator(idea.creatorIds, getUserById);
if (creator) {
  return <CreatorAvatar user={creator} />;
}
```

---

## 🎯 Bonnes pratiques

### Import des utilitaires
```typescript
// ✅ Bon - Import nommé spécifique
import { cleanIdeaId, cleanPostId } from '../utils/idUtils';

// ❌ Éviter - Import de tout
import * as idUtils from '../utils/idUtils';
```

### Création de nouveaux utilitaires

Quand créer un nouveau fichier dans `/utils` :
- ✅ Fonction réutilisée dans 3+ composants
- ✅ Logique métier sans dépendances UI
- ✅ Transformations de données pures
- ✅ Validation/normalisation

Quand NE PAS créer d'utilitaire :
- ❌ Logique spécifique à un seul composant
- ❌ Fonctions dépendant du state/context
- ❌ Wrappers autour de bibliothèques externes

### Structure d'un fichier utils

```typescript
/**
 * Brief description of the utility
 * 
 * Explains the problem it solves and when to use it
 */

/**
 * Function documentation with JSDoc
 * @param param1 - Description
 * @returns Description
 * @example
 * functionName("input") // "output"
 */
export function functionName(param1: string): string {
  // Implementation
  return result;
}
```

---

---

### `trendingUtils.ts` - Algorithme de tendance

Calcule le score de tendance pour le tri des contenus basé sur l'engagement unique des utilisateurs et la récence.

**Principe** :
- Compte les **utilisateurs uniques** qui interagissent (pas le nombre total d'interactions)
- Si quelqu'un soutient ET commente, il ne compte qu'une fois
- Combine popularité (engagement) et récence avec décroissance temporelle

**Fonctions disponibles** :

```typescript
// Pour les posts
getUniqueEngagementForPost(post: Post): number
// Compte: supporters + auteurs des commentaires (dédupliqués)

getPostTrendingScore(post: Post): number
// Score de tendance = engagement unique × décroissance temporelle

// Pour les idées
getUniqueEngagementForIdea(idea: Idea, allDiscussions?: DiscussionTopic[]): number
// Compte: supporters + créateurs de discussions (dédupliqués)

getLineageScore(idea: Idea): number
// Score basé sur le réseau (sources + dérivations)

getIdeaTrendingScore(idea: Idea, allDiscussions?: DiscussionTopic[]): number
// Score = (engagement unique + lineage × 0.3) × décroissance temporelle

// Tri mixte
sortByTrending<T>(items: T[], allDiscussions?: DiscussionTopic[]): T[]
// Trie un tableau mixte de posts et idées par score de tendance
```

**Algorithme de décroissance** :
- Demi-vie de 7 jours (168 heures)
- Les contenus perdent 50% de leur score tous les 7 jours
- Formule: `score = engagement × 0.5^(ageInHours / 168)`

**Utilisation** :

```typescript
// Dans un filtre "Tendance"
import { getPostTrendingScore, getIdeaTrendingScore } from '../utils/trendingUtils';

const allDiscussions = getAllDiscussionTopics();

items.sort((a, b) => {
  const scoreA = a.type === 'post' 
    ? getPostTrendingScore(a)
    : getIdeaTrendingScore(a, allDiscussions);
  const scoreB = b.type === 'post'
    ? getPostTrendingScore(b)
    : getIdeaTrendingScore(b, allDiscussions);
  return scoreB - scoreA; // Ordre décroissant
});
```

**Différence avec "Plus populaire"** :
- **Tendance** : engagement × récence (favorise le contenu récent ET populaire)
- **Plus populaire** : engagement uniquement (favorise le contenu le plus engageant, peu importe l'âge)

---

## 📊 Statistiques

**Fichiers** : 5  
**Fonctions exportées** : ~15  
**Utilisation** : ~40 imports à travers l'app  
**Couverture** : IDs, hashtags, chaînes, validation, tendance

---

## 🔗 Voir aussi

- `/api/README.md` - Services API
- `/hooks/README.md` - Hooks personnalisés
- `/store/README.md` - Store et selectors
- `/HOTFIX_PHASE_5.md` - Documentation création idUtils.ts

---

**Dernière mise à jour** : 30 octobre 2025
