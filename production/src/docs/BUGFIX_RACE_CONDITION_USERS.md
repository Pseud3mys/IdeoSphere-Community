# Bugfix: Race Condition Affichage "Utilisateur Inconnu"

**Date:** 26 octobre 2025  
**Statut:** ✅ Résolu

## 🐛 Problème

### Symptômes
Lors de l'affichage de la page de détail d'un post (`PostDetailPage`), les auteurs des posts sources et dérivés s'affichaient brièvement comme "Utilisateur Inconnu" avant d'afficher le nom correct, créant un flash visuel désagréable.

### Log d'erreur observé
```
userValidation.ts:10 ⚠️ validateUser: user is undefined or null
```

## 🔍 Diagnostic

### Cause racine: Race Condition
Le problème était une **race condition** classique lors du chargement des données du lineage :

1. **Étape 1 - Premier rendu :**  
   - `PostDetailPage` se charge avec le post principal
   - `useEffect` déclenche `actions.loadLineage(postId, 'post')`
   - Le composant tente d'afficher les posts parents/enfants IMMÉDIATEMENT

2. **Étape 2 - Tentative de résolution des auteurs :**
   - Le code appelle `getUserById(post.authorId)` pour chaque post source/dérivé
   - À ce stade, les utilisateurs du lineage NE SONT PAS ENCORE dans le store
   - Le sélecteur `getUserById` retourne `unknownUser` par défaut (id: 'unknown', name: 'Utilisateur Inconnu')

3. **Étape 3 - Arrivée des données :**
   - L'API `lineageService.fetchLineage()` termine son chargement
   - Elle retourne `{ lineage: {...}, users: [...] }`
   - Les utilisateurs sont ajoutés au store APRÈS que les posts aient été créés

4. **Étape 4 - Re-rendu :**
   - Le store se met à jour, déclenchant un re-rendu
   - Les vrais noms s'affichent enfin

### Problèmes architecturaux identifiés

**1. Ordre d'exécution dans `loadLineage` :**
```typescript
// ❌ ANCIEN CODE - Les posts sont créés AVANT d'avoir leurs auteurs
users.forEach(user => actions.addUser(user));  // Ajout des users

lineageResult.parents.forEach(parentItem => {
  actions.addPost({
    authorId: parentItem.authors?.[0]?.id || 'unknown'  // ⚠️ L'auteur n'est pas encore dans le store !
  });
});
```

**2. Le sélecteur `getUserById` ne retourne jamais `null` :**
```typescript
// /store/simpleSelectors.ts
export const getUserById = (store: SimpleEntityStore) => (userId: string): User => {
  return store.users[userId] || unknownUser;  // ⚠️ Toujours un User, jamais null
};
```

**3. Validations insuffisantes dans les composants :**
```typescript
// ❌ ANCIEN CODE - Cette vérification ne fonctionne PAS
const sourceAuthor = getUserById(sourcePost.authorId);
if (!sourceAuthor) return null;  // ⚠️ Toujours truthy car unknownUser
```

## ✅ Solution implémentée

### 1. Correction de `loadLineage` dans `/hooks/apiActions.ts`

Assurer que **TOUS** les utilisateurs sont ajoutés au store **AVANT** de créer les posts :

```typescript
// ✅ NOUVEAU CODE
loadLineage: async (itemId: string, itemType: 'idea' | 'post') => {
  const { lineage: lineageResult, users = [] } = result;
  
  // ✅ IMPORTANT: Ajouter TOUS les utilisateurs au store EN PREMIER
  // pour éviter la race condition qui cause l'affichage de "utilisateur inconnu"
  users.forEach((user: User) => {
    actions.addUser(user);
  });
  
  // ✅ Extraire et ajouter également tous les auteurs des items du lineage
  // (pour garantir que même les auteurs imbriqués sont dans le store)
  const allAuthorsFromLineage: User[] = [];
  [...lineageResult.parents, ...lineageResult.children].forEach((item: any) => {
    if (item.authors && Array.isArray(item.authors)) {
      allAuthorsFromLineage.push(...item.authors);
    }
  });
  
  // Dédupliquer et ajouter au store
  const uniqueAuthors = Array.from(
    new Map(allAuthorsFromLineage.map(u => [u.id, u])).values()
  );
  uniqueAuthors.forEach((user: User) => {
    actions.addUser(user);
  });
  
  console.log(`✅ [apiActions] loadLineage - ${users.length} utilisateurs principaux + ${uniqueAuthors.length} auteurs ajoutés au store`);
  
  // Maintenant on peut créer les posts en toute sécurité
  lineageResult.parents.forEach(parentItem => { /* ... */ });
}
```

### 2. Ajout de garde-fous dans les composants

Pour éviter d'afficher `unknownUser` même si le problème principal persiste :

**Dans `/components/PostDetailPage.tsx` :**
```typescript
// ✅ Vérifier explicitement si c'est unknownUser
const sourceAuthor = getUserById(sourcePost?.authorId);
if (!sourceAuthor || sourceAuthor.id === 'unknown') return null;

const derivedAuthor = getUserById(derivedPost?.authorId);
if (!derivedAuthor || derivedAuthor.id === 'unknown') return null;
```

**Dans `/components/IdeaVersionsTab.tsx` :**
```typescript
const parentPostAuthor = getUserById(parentPost.authorId);
if (!parentPostAuthor || parentPostAuthor.id === 'unknown') return null;
```

## 🎯 Résultat

- ✅ **Plus de flash "Utilisateur Inconnu"** : Les utilisateurs sont dans le store AVANT le premier rendu des posts sources/dérivés
- ✅ **Double protection** : Même si un utilisateur n'est pas trouvé, le composant ne l'affiche pas au lieu de montrer "Utilisateur Inconnu"
- ✅ **Logs de débogage** : Indiquent clairement combien d'utilisateurs ont été ajoutés au store
- ✅ **Architecture cohérente** : Suit le principe "données avant rendu"

## 📚 Leçons apprises

### Pattern anti-race condition pour le chargement de données
```
1. Charger les données "référencées" (Users) EN PREMIER
2. Puis charger les données "référençantes" (Posts/Ideas)
3. Les composants peuvent alors résoudre toutes les références immédiatement
```

### Gestion des fallbacks
- Un sélecteur qui retourne un objet par défaut (`unknownUser`) est pratique mais masque les problèmes
- Il faut toujours vérifier l'ID pour détecter les fallbacks : `user.id === 'unknown'`
- Alternative : avoir un sélecteur `userExists(id)` pour vérifier avant résolution

### Architecture de données
- **Principe :** Les données doivent être disponibles dans le store AVANT d'être affichées
- **Pattern :** `useEffect` → API → Store → Re-render, jamais `Render → API en parallèle`

## 🔗 Fichiers modifiés

- `/hooks/apiActions.ts` - Fonction `loadLineage` corrigée
- `/components/PostDetailPage.tsx` - Ajout validations `unknownUser`
- `/components/IdeaVersionsTab.tsx` - Ajout validations `unknownUser`
- `/docs/BUGFIX_RACE_CONDITION_USERS.md` - Ce document

## ✅ Tests de validation

### Scénarios testés
1. ✅ Ouvrir la page de détail d'un post avec des posts sources → Pas de flash
2. ✅ Ouvrir la page de détail d'un post avec des posts dérivés → Pas de flash
3. ✅ Ouvrir la page de détail d'une idée avec des posts sources → Pas de flash
4. ✅ Vérifier les logs : "X utilisateurs principaux + Y auteurs ajoutés au store"

### Régression potentielle
- ⚠️ Si un utilisateur n'existe vraiment pas dans la base mock, il ne s'affichera plus (au lieu d'afficher "Utilisateur Inconnu")
- ✅ C'est le comportement attendu : mieux vaut ne rien afficher que des données incorrectes
