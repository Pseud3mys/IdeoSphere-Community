# Documentation IdeoSphere

## 📚 Index

### Architecture et Principes

- **[/ARCHITECTURE.md](/ARCHITECTURE.md)** - Vue d'ensemble de l'architecture store-centrée
- **[API_CALLS_PATTERN.md](./API_CALLS_PATTERN.md)** - Pattern en 3 étapes (obligatoire pour tout appel API)
- **[DATA_FLOW.md](./DATA_FLOW.md)** - Flux de données, cache, et débogage

### Fonctionnalités

- **[INTELLIGENT_FEED.md](./INTELLIGENT_FEED.md)** - Système de feed avec chaînes d'inspiration
- **[URL_SYNC.md](./URL_SYNC.md)** - Synchronisation bidirectionnelle état ↔ URL

## 🚀 Démarrage Rapide

### Pour Comprendre le Projet (30 min)

1. **[/ARCHITECTURE.md](/ARCHITECTURE.md)** (10 min)
   - Principes clés : Store = source de vérité, pattern en 3 étapes, storeUpdater
   - Structure des fichiers : `/data`, `/api`, `/store`, `/hooks`, `/components`

2. **[API_CALLS_PATTERN.md](./API_CALLS_PATTERN.md)** (10 min)
   - Pattern obligatoire : API → Store → Relecture
   - Exemples concrets : charger, créer, relations, mutations

3. **[DATA_FLOW.md](./DATA_FLOW.md)** (10 min)
   - Cycle de vie : chargement initial, création, relations
   - Débogage : vérifier le store, tracer les actions

### Pour Ajouter une Fonctionnalité

1. **Créer un service API** → `/api/README.md`
2. **Créer une action** → `/hooks/README.md`
3. **Utiliser dans un composant** → `/ARCHITECTURE.md` (section Composants)

### Pour Débugger

1. **Données manquantes** → `DATA_FLOW.md` (section Débogage)
2. **Stale closure** → `API_CALLS_PATTERN.md` (section storeUpdater)
3. **Pattern API** → `API_CALLS_PATTERN.md` (checklist)

## 🎯 Règles d'Or

### 1. Store = Source de Vérité Unique

```typescript
// ✅ Toujours lire depuis le store
const idea = boundSelectors.getIdeaById(ideaId);

// ❌ Jamais d'accès direct aux données
import { mockIdeas } from '../data/ideas'; // INTERDIT
```

### 2. Pattern en 3 Étapes (Obligatoire)

```typescript
// 1. API
const apiData = await fetchSomething(id);
// 2. Store
if (apiData) actions.addSomething(apiData);
// 3. Relecture
return boundSelectors.getSomethingById(id);
```

**Pourquoi ?** Les services API ne connaissent que les données mockées. Le store contient mockées + dynamiques.

### 3. storeUpdater pour Mutations

```typescript
// ✅ Évite les stale closures
storeUpdater(prevStore => {
  const data = selectors.getSomething(prevStore); // ← État frais
  // ... calculs
  return { /* changements */ };
});

// ❌ Stale closure
const data = boundSelectors.getSomething(); // ← Peut être périmé
```

### 4. Zéro Accès Direct

- Hooks/composants → `boundSelectors` ou `useEntityStoreSimple()`
- Services API → `dataService` (autorisé uniquement dans `/api`)
- Chargement initial → `loadInitialData()` UNE fois au démarrage

## 📖 Documentation Technique

### Par Dossier

- **[/api/README.md](/api/README.md)** - Services API, patterns, types de retour
- **[/hooks/README.md](/hooks/README.md)** - Actions, patterns, debugging
- **[/store/README.md](/store/README.md)** - Store, selectors, types

### Par Type de Réponse API

- **[/api/API_RESPONSE_TYPES.md](/api/API_RESPONSE_TYPES.md)** - Formats de réponse standardisés

## 🔍 Trouver une Réponse

| Question | Document |
|----------|----------|
| Comment charger des données ? | `API_CALLS_PATTERN.md` |
| Pourquoi mes données ne s'affichent pas ? | `DATA_FLOW.md` (Débogage) |
| Comment éviter les stale closures ? | `API_CALLS_PATTERN.md` (storeUpdater) |
| Comment fonctionnent les chaînes d'inspiration ? | `INTELLIGENT_FEED.md` |
| Comment fonctionne la synchronisation URL ? | `URL_SYNC.md` |
| Comment créer un service API ? | `/api/README.md` |
| Comment créer une action ? | `/hooks/README.md` |

## 📐 Structure

```
/
├── ARCHITECTURE.md          ← Vue d'ensemble
├── CHANGELOG.md            ← Historique
├── PLAN_MIGRATION_AUTHOR_IDS.md
│
├── /docs
│   ├── README.md           ← Ce fichier
│   ├── API_CALLS_PATTERN.md
│   ├── DATA_FLOW.md
│   ├── INTELLIGENT_FEED.md
│   └── URL_SYNC.md
│
├── /api → /api/README.md
├── /hooks → /hooks/README.md
└── /store → /store/README.md
```

## ✨ Philosophie

Cette documentation reflète **l'état actuel du code** :

✅ Architecture et patterns actuels  
✅ Règles et bonnes pratiques  
✅ Guides de référence technique  
✅ Fonctionnalités implémentées

❌ Pas d'historique de bugs  
❌ Pas d'anciennes approches  
❌ Pas de notes temporaires

**Principe** : Documentation = Code tel qu'il est aujourd'hui, avec ses subtilités et ses meilleures pratiques.

## 🧭 Parcours Suggérés

### Nouveau Développeur

1. `ARCHITECTURE.md` - Comprendre les bases (20 min)
2. `API_CALLS_PATTERN.md` - Maîtriser le pattern (15 min)
3. `DATA_FLOW.md` - Comprendre le cycle de vie (15 min)
4. Créer une petite fonctionnalité en suivant `/hooks/README.md`

### Débugger un Problème

1. `DATA_FLOW.md` (section Débogage) - Vérifier le store
2. `API_CALLS_PATTERN.md` (Checklist) - Vérifier le pattern
3. Logs + selectors pour tracer le problème

### Ajouter une Fonctionnalité Complexe

1. `ARCHITECTURE.md` - Revoir les principes
2. `/api/README.md` - Créer le service API
3. `/hooks/README.md` - Créer l'action
4. Tester avec les selectors

## 📦 Migration en Cours

**Post → IDs simples** : ✅ Terminée
- `Post.authorId: string`
- `PostReply.authorId: string`

**Idea → IDs simples** : ⏳ En cours
- `Idea.creators: User[]` → `creatorIds: string[]` (prochaine étape)

Voir `/PLAN_MIGRATION_AUTHOR_IDS.md` pour les détails.
