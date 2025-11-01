# Feed Intelligent avec Chaînes d'Inspiration

## Vue d'ensemble

Le système de feed intelligent d'IdeoSphere détecte et affiche automatiquement les **chaînes d'inspiration** entre posts et idées. Cela permet de :

1. **Visualiser l'évolution des idées** - Voir comment un simple post devient un projet structuré
2. **Contextualiser le contenu** - Savoir si une contribution fait partie d'une discussion plus large
3. **Encourager la participation** - Montrer que les contributions évoluent et progressent
4. **Navigation intuitive** - Découvrir facilement le contenu lié

## Architecture

### 1. Utilitaires de chaînes (`/utils/feedChainUtils.ts`)

#### `analyzeContentChains(posts, ideas, seenItems)`
Analyse un feed complet et détecte les chaînes de contenu lié.

**Algorithme :**
1. Pour chaque post/idée, remonte jusqu'à trouver l'élément racine (celui qui n'a pas de source)
2. Construit l'arbre complet des dérivés en descendant depuis la racine
3. Groupe tous les éléments par chaîne
4. Trie les chaînes par pertinence (nouveau contenu > engagement > date)

**Retourne :** Un tableau de `ContentChain`

#### `getItemChainContext(itemId, itemType, chains, seenItems)`
Obtient le contexte de chaîne pour un élément spécifique.

**Retourne :** Un objet `ItemChainContext` contenant :
- `isInChain` - Si l'élément fait partie d'une chaîne
- `chainLength` - Nombre total d'éléments dans la chaîne
- `position` - Position de l'élément : 'root', 'middle', ou 'latest'
- `hasParents` / `hasChildren` - Si l'élément a des sources/dérivés
- `parentCount` / `childCount` - Nombre de sources/dérivés
- `maxSupportInChain` - Support maximum dans la chaîne
- `hasUnseenInChain` - Si la chaîne contient du nouveau contenu
- `evolutionSummary` - Résumé textuel (ex: "3 posts → 1 projet")

#### `getChainEvolutionSummary(chain)`
Génère un résumé textuel de l'évolution de la chaîne.

**Exemples :**
- "3 posts → 2 projets"
- "Chaîne de 5 posts"
- "Post original"

### 2. Composant ChainBadge (`/components/ChainBadge.tsx`)

Badge subtil et informatif intégré directement dans les cartes de contenu.

**Affichage contextuel :**
- **Position root** : "X évolutions" avec flèche droite
- **Position latest** : "Suite de X contributions" avec flèche gauche
- **Position middle** : "Fait partie d'une chaîne de X contributions"

**Dialog au clic :**
- **Statistiques de la chaîne** - Nombre de sources, total, et évolutions
- **Badge "Nouveau contenu"** - Si la chaîne contient du contenu non vu
- **Contribution la plus soutenue** - Affiche la carte complète de l'élément avec le plus de soutiens
- **Actions** - Possibilité de cliquer sur la carte pour naviguer vers l'élément ou le soutenir directement
- **Note explicative** - Encourage l'utilisateur à explorer toute la chaîne

**Fonctionnalité clé :**
Le dialogue affiche automatiquement l'élément le plus populaire de la chaîne, permettant à l'utilisateur de voir immédiatement la contribution qui a le plus résonné avec la communauté.

### 3. Cartes de contenu mises à jour

Les composants `IdeaCard` et `PostCard` acceptent maintenant une prop `chainContext` optionnelle qui affiche automatiquement le `ChainBadge` si l'élément fait partie d'une chaîne.

**Intégration discrète :**
- Badge affiché après la localisation et le type de contenu
- N'ajoute qu'une seule ligne compacte
- Interactif (popover) sans prendre de place
- S'adapte au contexte (racine vs évolution)

### 4. Page Discovery mise à jour

#### Tracking des vus
Le système garde en mémoire (localStorage) les posts/idées déjà consultés pour :
- Marquer les chaînes avec du nouveau contenu
- Afficher en priorité les éléments non vus
- Indiquer visuellement ce qui a déjà été consulté

#### Affichage
Chaque carte dans le feed reçoit automatiquement son contexte de chaîne, permettant :
- Une vue unifiée du feed (pas de composant séparé)
- Des indicateurs subtils et informatifs
- Une navigation intuitive vers les éléments liés

## Relations de Lineage

### Structure des données

**Post :**
```typescript
{
  id: 'post-1',
  sourcePosts: ['post-0'],      // Posts dont celui-ci s'inspire
  derivedPosts: ['post-2'],     // Posts inspirés de celui-ci
  derivedIdeas: ['idea-1'],     // Idées inspirées de celui-ci
}
```

**Idea :**
```typescript
{
  id: 'idea-1',
  sourcePosts: ['post-1', 'post-2'],     // Posts sources
  sourceIdeas: ['idea-0'],               // Idées sources
  derivedIdeas: ['idea-2'],              // Idées dérivées
}
```

### Exemple de chaîne

```
post-1 (Marie) "Manque de bancs..."
  ├─> post-2 (Thomas) "À l'arrêt de bus aussi..."
  ├─> post-3 (Emma) "Place du village..."
  └─> idea-1 (Marie+Emma) "Projet: Bancs publics"
        └─> discussion topics liés
```

**Résultat affiché :**
- Chaîne détectée avec 4 éléments
- Soutiens max : 12 (de l'idée)
- Résumé : "3 posts → 1 projet"
- Élément principal : idea-1 (le plus soutenu)

## Avantages pour l'utilisateur

### 1. Meilleure navigation
- Moins de contenu en double
- Contexte de l'évolution visible
- Focus sur le contenu nouveau

### 2. Motivation accrue
- Voir que les posts simples peuvent devenir des projets
- Comprendre l'impact de sa contribution
- Sentir la progression collective

### 3. Découverte améliorée
- Les chaînes actives remontent naturellement
- Le contenu non vu est priorisé
- L'engagement est pris en compte

## Cas d'usage

### Scénario 1 : Post original avec évolutions
Marie publie un post sur les bancs. Par la suite, 2 autres posts et 1 projet en découlent. Le projet a reçu 45 soutiens.

**Affichage du post de Marie :**
- Badge bleu : "3 évolutions" avec flèche droite
- Au clic sur le badge : dialog montrant les statistiques de la chaîne ET la carte du projet (élément le plus soutenu)
- Marie peut directement soutenir le projet ou cliquer dessus pour voir tous les détails
- Badge vert "Nouveau contenu disponible" si elle n'a pas vu le projet

### Scénario 2 : Projet issu de plusieurs posts
Un projet "Bancs publics" est créé à partir de 3 posts différents. Le post de Sophie a reçu 28 soutiens (le plus dans la chaîne).

**Affichage du projet :**
- Badge bleu : "Suite de 3 contributions" avec flèche gauche
- Au clic sur le badge : dialog montrant la carte du post de Sophie (élément le plus soutenu)
- Statistiques affichées : 3 sources, 4 éléments au total
- L'utilisateur peut cliquer sur le post de Sophie pour voir son contexte complet

### Scénario 3 : Post au milieu d'une chaîne
Thomas répond à un post de Marie, et son post inspire ensuite un projet qui reçoit 60 soutiens.

**Affichage du post de Thomas :**
- Badge bleu : "Fait partie d'une chaîne de 3 contributions"
- Au clic : dialog montrant la carte du projet (élément le plus soutenu avec 60 soutiens)
- Thomas découvre que son post a contribué au projet le plus populaire
- Il peut directement soutenir le projet depuis le dialog

## Configuration

### Persistence des vus
Les items vus sont stockés dans `localStorage` sous la clé `seenItems` :
```json
["post-1", "idea-2", "post-5"]
```

### Algorithme de tri
Les chaînes sont triées par :
1. Présence de contenu non vu (priorité absolue)
2. Soutiens maximum dans la chaîne
3. Date de dernière activité

## Avantages de l'approche intégrée

### Design discret
- Les badges ne prennent qu'une seule ligne compacte
- S'intègrent naturellement dans la mise en page existante
- Pas de composant séparé imposant

### Contextualisation intelligente
- Messages adaptés selon la position dans la chaîne
- Indicateurs visuels (flèches) pour la direction
- Information disponible sans clic (survol)

### Navigation intuitive
- Cliquer sur la carte mène aux détails (comportement standard)
- Cliquer sur le badge montre plus d'infos (popover)
- Pas de mode séparé à activer/désactiver

## Améliorations futures possibles

1. **Synchronisation backend** - Sauvegarder les items vus côté serveur
2. **Notifications** - Alerter quand une chaîne suivie évolue
3. **Vue dédiée chaîne** - Page spéciale montrant toute la chaîne en détail
4. **Vue graphique** - Représentation en arbre des chaînes complexes
5. **Statistiques** - Montrer la croissance des chaînes dans le temps
6. **Smart grouping** - Grouper automatiquement les chaînes très actives
