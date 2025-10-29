# BUGFIX : Rating Stale Closure

## Symptômes

Lors de l'évaluation d'une idée sur plusieurs critères :
- ✅ Premier rating : fonctionne (log: "Rating mis à jour...")
- ❌ Deuxième rating : crée un doublon au lieu de mettre à jour (log: "Nouveau rating ajouté...")
- ❌ Ratings suivants : continuent de créer des doublons

Exemple de tableau `ratings` corrompu :
```typescript
[
  { criterionId: "potential", value: 3, userId: "user123" },
  { criterionId: "potential", value: 4, userId: "user123" }, // ❌ Doublon !
  { criterionId: "potential", value: 5, userId: "user123" }, // ❌ Doublon !
  { criterionId: "feasibility", value: 3, userId: "user123" },
  { criterionId: "feasibility", value: 4, userId: "user123" } // ❌ Doublon !
]
```

## Cause racine

**Stale closure** dans la fonction `rateIdea` de `/hooks/contentActions.ts`.

### Code problématique

```typescript
rateIdea: async (ideaId: string, criterionId: string, value: number) => {
  const currentUser = boundSelectors.getCurrentUser(); // ❌ Récupéré UNE FOIS au début
  if (!currentUser) return;
  
  try {
    const result = await rateIdeaOnApi(ideaId, currentUser.id, criterionId, value);
    
    storeUpdater(prevStore => {
      const idea = selectors.getIdeaById(prevStore)(ideaId);
      
      // ❌ PROBLÈME : On utilise currentUser.id qui est une CLOSURE PÉRIMÉE
      const existingRatingIndex = currentRatings.findIndex(
        r => r.criterionId === criterionId && r.userId === currentUser.id
      );
      
      // La première fois, ça fonctionne car currentUser.id correspond
      // Mais ensuite, currentUser.id peut ne plus correspondre à l'état actuel
    });
  }
}
```

### Pourquoi ça cause des doublons ?

1. **Premier appel** :
   - `currentUser = boundSelectors.getCurrentUser()` → récupère l'utilisateur actuel
   - `currentUser.id = "user123"`
   - `findIndex` cherche `userId === "user123"` → trouve et met à jour ✅

2. **Deuxième appel** (même session) :
   - `currentUser = boundSelectors.getCurrentUser()` → récupère l'utilisateur actuel
   - `currentUser.id = "user123"` (toujours le même)
   - MAIS : La référence `currentUser` est créée AVANT le `storeUpdater`
   - Le `storeUpdater` utilise cette référence comme **closure**
   - Si l'état du store change entre-temps, la closure peut être périmée
   - `findIndex` cherche avec l'ancienne référence → ne trouve pas → ajoute en doublon ❌

### Différence avec les autres actions

Les actions qui fonctionnent correctement (`toggleIdeaSupport`, `togglePostLike`) récupèrent `currentUser` **DEPUIS `prevStore`** :

```typescript
toggleIdeaSupport: async (ideaId: string) => {
  storeUpdater(prevStore => {
    // ✅ CORRECT : On récupère currentUser depuis prevStore
    const currentUser = selectors.getCurrentUser(prevStore);
    
    const existingIndex = idea.supporters.findIndex(id => id === currentUser.id);
  });
}
```

## Solution

Utiliser les données retournées par l'API (`result.rating`) au lieu de la closure périmée (`currentUser`).

### Code corrigé

```typescript
rateIdea: async (ideaId: string, criterionId: string, value: number) => {
  const currentUser = boundSelectors.getCurrentUser();
  if (!currentUser) return;
  
  try {
    const result = await rateIdeaOnApi(ideaId, currentUser.id, criterionId, value);
    
    storeUpdater(prevStore => {
      const idea = selectors.getIdeaById(prevStore)(ideaId);
      
      // ✅ SOLUTION : Utiliser result.rating (retourné par l'API)
      // Au lieu de currentUser.id (closure périmée)
      const existingRatingIndex = currentRatings.findIndex(
        r => r.criterionId === result.rating.criterionId 
          && r.userId === result.rating.userId
      );
      
      if (existingRatingIndex >= 0) {
        // Remplacer le rating existant
        updatedRatings[existingRatingIndex] = result.rating;
      } else {
        // Ajouter le nouveau rating
        updatedRatings.push(result.rating);
      }
    });
  }
}
```

### Pourquoi ça fonctionne ?

- ✅ `result.rating` vient de l'API qui vient de traiter la requête
- ✅ `result.rating.userId` et `result.rating.criterionId` sont garantis d'être les bons
- ✅ Pas de dépendance à une closure périmée
- ✅ La logique de recherche trouve toujours le bon rating à mettre à jour

## Validation

### Avant le fix

```
🔄 [API] Évaluation idée: idea1 critère: potential note: 4
✅ [API] Rating mis à jour pour: Potentiel (ancienne: 3 → nouvelle: 4)
✅ [Hook] Rating mis à jour dans le store pour critère: potential

🔄 [API] Évaluation idée: idea1 critère: feasibility note: 5
✅ [API] Rating mis à jour pour: Faisabilité (ancienne: 3 → nouvelle: 5)
❌ [Hook] Nouveau rating ajouté au store pour critère: feasibility  ← BUG!

Résultat: Doublon créé
```

### Après le fix

```
🔄 [API] Évaluation idée: idea1 critère: potential note: 4
✅ [API] Rating mis à jour pour: Potentiel (ancienne: 3 → nouvelle: 4)
✅ [Hook] Rating mis à jour dans le store pour critère: potential userId: user123

🔄 [API] Évaluation idée: idea1 critère: feasibility note: 5
✅ [API] Rating mis à jour pour: Faisabilité (ancienne: 3 → nouvelle: 5)
✅ [Hook] Rating mis à jour dans le store pour critère: feasibility userId: user123  ← FIXED!

Résultat: Pas de doublon, mise à jour correcte
```

## Leçon apprise

### ❌ Anti-pattern : Stale Closure

```typescript
const action = async () => {
  const data = getSomeData(); // ❌ Récupéré AVANT le storeUpdater
  
  storeUpdater(prevStore => {
    // ❌ Utilisation de 'data' qui peut être périmé
    const result = prevStore.items.find(item => item.id === data.id);
  });
}
```

### ✅ Pattern recommandé : Source de vérité unique

**Option 1 : Utiliser les données de l'API**
```typescript
const action = async () => {
  const apiResult = await apiCall();
  
  storeUpdater(prevStore => {
    // ✅ Utiliser apiResult qui est frais et fiable
    const result = prevStore.items.find(item => item.id === apiResult.id);
  });
}
```

**Option 2 : Récupérer depuis prevStore**
```typescript
const action = async () => {
  storeUpdater(prevStore => {
    // ✅ Récupérer les données depuis prevStore
    const data = getSomeDataFromStore(prevStore);
    const result = prevStore.items.find(item => item.id === data.id);
  });
}
```

## Impact

### Fichiers modifiés
- `/hooks/contentActions.ts` - Fonction `rateIdea`

### Fonctionnalités affectées
- ✅ Évaluation des idées sur plusieurs critères
- ✅ Mise à jour des ratings existants
- ✅ Évite les doublons dans le tableau `ratings`

### Tests à effectuer
- [x] Noter une idée sur le premier critère
- [x] Noter la même idée sur le deuxième critère
- [x] Noter la même idée sur le troisième critère
- [x] Modifier une note existante
- [x] Vérifier qu'aucun doublon n'est créé
- [x] Vérifier que les scores moyens se mettent à jour correctement

## Alignement architectural

Ce fix s'aligne sur les principes déjà établis dans IdeoSphere :

1. **Source de vérité unique** : Les données de l'API sont la référence
2. **Immutabilité** : On crée de nouveaux tableaux au lieu de muter
3. **Cohérence** : Même pattern que `toggleSupportOnApi`, `addPostReplyOnApi`, etc.
4. **Approche optimisée** : L'API ne renvoie que le rating modifié (pas tout le tableau)

## Références

- `/docs/OPTIMIZED_RATING_SYSTEM.md` - Documentation du système de rating optimisé
- `/hooks/contentActions.ts` - Implémentation des actions de contenu
- `/api/interactionService.ts` - Service API pour les ratings
