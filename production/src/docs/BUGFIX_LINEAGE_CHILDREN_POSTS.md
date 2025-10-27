# Bug Fix: Structure incorrecte du lineage après migration des Posts

## Date
27 octobre 2024

## Contexte
Après la migration des Posts de `author: User` vers `authorId: string`, un bug critique est apparu où "Utilisateur inconnu" s'affichait pour les posts dans l'arbre de lineage (page de détail).

## Symptômes
- Message d'erreur : `⚠️ validateUser: user is undefined or null` dans UserLink
- Log : `✅ [apiActions] loadLineage - 1 utilisateurs principaux + 0 auteurs ajoutés au store`
- Les posts dans le lineage affichaient "Utilisateur inconnu"
- Le log montrait "0 auteurs ajoutés" malgré la présence de posts

## Causes racines (multiples)

### 1. Posts enfants manquants
Dans `/api/lineageService.ts`, la fonction `getChildrenLineage` ne gérait que les Ideas dérivées d'une Idea. Elle ignorait :
- Les Ideas dérivées d'un Post (`derivedIdeas` sur un Post)
- Les Posts dérivés d'un Post (`derivedPosts` sur un Post)

### 2. Structure LineageItem incohérente avec la migration
L'interface `LineageItem` utilisait `authors: User[]` pour TOUS les types (Post et Idea), ce qui ne correspondait pas à la nouvelle architecture où les Posts utilisent `authorId: string`.

### 3. Extraction incorrecte des utilisateurs
Dans `/hooks/apiActions.ts`, le code essayait d'extraire les auteurs depuis `item.authors` dans les LineageItems, alors qu'il devrait simplement utiliser le tableau `users` retourné par l'API.

Le code faisait :
```typescript
const allAuthorsFromLineage: User[] = [];
[...lineageResult.parents, ...lineageResult.children].forEach((item: any) => {
  if (item.authors && Array.isArray(item.authors)) {
    allAuthorsFromLineage.push(...item.authors);
  }
});
```

Problème : Pour les Posts, `item.authors` n'existait plus, donc aucun auteur n'était extrait !

## Solution (3 changements)

### 1. Corriger l'interface LineageItem
```typescript
export interface LineageItem {
  id: string;
  type: 'idea' | 'post';
  title?: string;
  content?: string;
  summary?: string;
  // ✅ Pour les Posts: authorId (string)
  authorId?: string; // Pour les Posts uniquement
  // ✅ Pour les Ideas: creators (User[]) - temporaire jusqu'à migration
  creators?: User[]; // Pour les Ideas uniquement
  createdAt: Date;
  level: number;
  relationshipType: 'parent' | 'child' | 'current';
}
```

### 2. Utiliser authorId dans la construction des LineageItems
Dans toutes les fonctions qui créent des LineageItems pour des Posts :
```typescript
// ✅ AVANT (incorrect)
children.push({
  ...
  authors: author ? [author] : [],
  ...
});

// ✅ APRÈS (correct)
children.push({
  ...
  authorId: derivedPost.authorId,
  ...
});
```

### 3. Simplifier l'extraction des utilisateurs dans apiActions.ts
```typescript
// ✅ AVANT (incorrect - essayait d'extraire depuis item.authors)
const allAuthorsFromLineage: User[] = [];
[...lineageResult.parents, ...lineageResult.children].forEach((item: any) => {
  if (item.authors && Array.isArray(item.authors)) {
    allAuthorsFromLineage.push(...item.authors);
  }
});

// ✅ APRÈS (correct - utilise simplement le tableau users de l'API)
users.forEach((user: User) => {
  actions.addUser(user);
});
```

### 4. Compléter getChildrenLineage pour supporter les Posts
Ajout du support pour les Ideas et Posts dérivés d'un Post.

## Fichiers modifiés
- `/api/lineageService.ts` - Interface LineageItem, construction des LineageItems, fonction `getChildrenLineage`
- `/hooks/apiActions.ts` - Simplification de l'extraction des utilisateurs, utilisation de `authorId` au lieu de `authors?.[0]?.id`

## Validation
- Les posts dans le lineage sont maintenant correctement structurés avec `authorId`
- Tous les utilisateurs retournés par l'API sont ajoutés au store AVANT le rendu
- Plus d'affichage "Utilisateur inconnu" pour les posts
- Le log devrait montrer : `✅ [apiActions] loadLineage - X utilisateurs ajoutés au store` avec X > 0
- La structure est cohérente avec la migration : Posts utilisent `authorId`, Ideas utilisent `creators`

## Relation avec d'autres bugs
Ce fix complète la série de corrections liées à la migration `author` → `authorId` :
- [BUGFIX_RACE_CONDITION_USERS.md](./BUGFIX_RACE_CONDITION_USERS.md) - Race condition dans le chargement des utilisateurs
- [BUGFIX_CURRENT_USER_NOT_IN_STORE.md](./BUGFIX_CURRENT_USER_NOT_IN_STORE.md) - Utilisateur connecté jamais ajouté au store
- Ce fix - Posts enfants manquants dans le lineage
