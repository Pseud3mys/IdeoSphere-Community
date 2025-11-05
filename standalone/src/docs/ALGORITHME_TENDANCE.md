# Algorithme de Tendance - IdeoSphere

## 📊 Vue d'ensemble

L'algorithme de tendance d'IdeoSphere calcule un score qui combine :
1. **Engagement unique** : nombre de personnes différentes qui interagissent
2. **Récence** : décroissance temporelle pour favoriser le contenu récent
3. **Lineage** (idées uniquement) : bonus pour les connexions dans le réseau d'idées

## 🎯 Principe : Compter les personnes, pas les interactions

### ✅ Bon exemple
- Marie commente un post (1 interaction)
- Marie soutient ce même post (1 autre interaction)
- **Score d'engagement : 1** (Marie ne compte qu'une fois)

### ❌ Ancien système
- 10 commentaires de 2 personnes = score de 10
- **Nouveau système** : = score de 2 (personnes uniques)

### Pourquoi ?
Cela évite qu'un contenu avec beaucoup d'interactions d'une seule personne ne surpasse un contenu avec plusieurs personnes engagées.

---

## 📝 Calcul pour les Posts

### Engagement unique
```typescript
const uniqueUsers = new Set<string>();

// Ajouter les supporters
post.supporters.forEach(userId => uniqueUsers.add(userId));

// Ajouter les auteurs des commentaires
post.replies.forEach(reply => {
  uniqueUsers.add(reply.authorId);
});

const engagementScore = uniqueUsers.size;
```

### Interactions comptées
- ✅ Soutiens (supporters)
- ✅ Commentaires (replies)
- ❌ Vues (non implémenté)

---

## 🎨 Calcul pour les Idées

### Engagement unique
```typescript
const uniqueUsers = new Set<string>();

// Ajouter les supporters
idea.supporters.forEach(userId => uniqueUsers.add(userId));

// Ajouter les créateurs de discussions
idea.discussionIds.forEach(discussionId => {
  const discussion = allDiscussions.find(d => d.id === discussionId);
  if (discussion) {
    uniqueUsers.add(discussion.creatorId);
  }
});

const engagementScore = uniqueUsers.size;
```

### Score de lineage (réseau)
```typescript
let lineageScore = 0;

// Sources (ce qui a inspiré cette idée)
lineageScore += idea.sourceIdeas?.length || 0;
lineageScore += idea.sourcePosts?.length || 0;

// Dérivations (ce qui a été créé à partir de cette idée)
lineageScore += idea.derivedIdeas?.length || 0;

// Le lineage compte pour 30% d'une interaction directe
const lineageBonus = lineageScore * 0.3;
```

### Interactions comptées
- ✅ Soutiens (supporters)
- ✅ Discussions créées (nombre de topics, pas nombre de commentaires)
- ✅ Sources (idées/posts qui ont inspiré)
- ✅ Dérivations (idées créées à partir)
- ❌ Notations individuelles (non comptées dans l'engagement)

---

## ⏰ Décroissance temporelle

### Formule
```typescript
const ageInHours = (now - createdAt) / (1000 * 60 * 60);
const halfLife = 168; // heures (7 jours)
const timeDecay = Math.pow(0.5, ageInHours / halfLife);
```

### Demi-vie de 7 jours
| Âge du contenu | Multiplicateur |
|----------------|----------------|
| Nouveau (0h)   | 100%          |
| 7 jours        | 50%           |
| 14 jours       | 25%           |
| 21 jours       | 12.5%         |
| 30 jours       | ~6%           |

### Exemples concrets

**Post A** : 10 personnes uniques, publié aujourd'hui
- Score = 10 × 1.0 = **10**

**Post B** : 20 personnes uniques, publié il y a 7 jours
- Score = 20 × 0.5 = **10**

**Post C** : 40 personnes uniques, publié il y a 14 jours
- Score = 40 × 0.25 = **10**

→ Les trois posts auraient le même score de tendance !

---

## 🔄 Score final de tendance

### Pour les posts
```typescript
score = engagementUnique × décroissanceTemporelle
```

### Pour les idées
```typescript
score = (engagementUnique + lineageScore × 0.3) × décroissanceTemporelle
```

### Exemple complet - Idée

**Données** :
- 5 supporters : Alice, Bob, Charlie, David, Emma
- 2 discussions créées par : Alice (déjà comptée), Frank
- 3 sources (idées/posts)
- 1 dérivation

**Calcul** :
```
Engagement unique = 6 personnes (Alice, Bob, Charlie, David, Emma, Frank)
Lineage = (3 sources + 1 dérivation) × 0.3 = 1.2
Engagement total = 6 + 1.2 = 7.2

Si publié il y a 3.5 jours (84h) :
Décroissance = 0.5^(84/168) = 0.5^0.5 ≈ 0.707

Score final = 7.2 × 0.707 ≈ 5.1
```

---

## 📑 Filtres disponibles

### 1. "Tendance" (trending)
Trie par score de tendance (engagement × récence)

**Cas d'usage** : Voir ce qui est populaire EN CE MOMENT

### 2. "Plus populaire" (popular)
Trie par engagement unique uniquement (sans décroissance)

**Cas d'usage** : Voir ce qui a généré le plus d'engagement, peu importe quand

### 3. "Par défaut" (default)
Utilise le score de tendance mais avec normalisation par jour

**Cas d'usage** : Feed équilibré entre récent et populaire

### 4. "Plus récent" (recent)
Trie chronologiquement

**Cas d'usage** : Voir les nouveautés

---

## 💡 Avantages de l'algorithme

### ✅ Équité
- Un utilisateur très actif ne peut pas "gonfler" artificiellement le score
- Favorise la diversité des voix

### ✅ Fraîcheur
- Le contenu récent a une chance de briller
- Évite la domination éternelle du "top of all time"

### ✅ Qualité
- Le score reflète combien de personnes trouvent le contenu intéressant
- Pas juste combien de fois il a été vu/cliqué

### ✅ Réseau (idées)
- Les idées bien connectées (sources, dérivations) sont valorisées
- Encourage la collaboration et l'itération

---

## 🛠️ Implémentation

### Fichiers concernés
- `/utils/trendingUtils.ts` - Logique de calcul
- `/components/DiscoveryPage.tsx` - Feed principal
- `/components/MyIdeasPage.tsx` - Page "Mes Idées"

### Utilisation dans le code
```typescript
import { 
  getPostTrendingScore, 
  getIdeaTrendingScore,
  getUniqueEngagementForPost,
  getUniqueEngagementForIdea
} from '../utils/trendingUtils';

// Pour le tri "Tendance"
const allDiscussions = getAllDiscussionTopics();
items.sort((a, b) => {
  const scoreA = a.type === 'post' 
    ? getPostTrendingScore(a)
    : getIdeaTrendingScore(a, allDiscussions);
  const scoreB = b.type === 'post'
    ? getPostTrendingScore(b)
    : getIdeaTrendingScore(b, allDiscussions);
  return scoreB - scoreA;
});

// Pour le tri "Plus populaire"
items.sort((a, b) => {
  const engagementA = a.type === 'post' 
    ? getUniqueEngagementForPost(a)
    : getUniqueEngagementForIdea(a, allDiscussions);
  const engagementB = b.type === 'post'
    ? getUniqueEngagementForPost(b)
    : getUniqueEngagementForIdea(b, allDiscussions);
  return engagementB - engagementA;
});
```

---

## 🔮 Améliorations futures possibles

### Poids personnalisés par type d'interaction
```typescript
// Exemple: donner plus de poids aux discussions qu'aux soutiens
const discussionWeight = 1.5;
const supportWeight = 1.0;
```

### Prise en compte de la qualité
```typescript
// Utiliser les ratings pour ajuster le score
const qualityBonus = averageRating / 5; // 0-1
finalScore *= (1 + qualityBonus);
```

### Boost pour le contenu local
```typescript
// Favoriser le contenu de la même ville/région
if (content.location === user.location) {
  finalScore *= 1.2;
}
```

### Personnalisation
```typescript
// Favoriser le contenu des tags suivis par l'utilisateur
const userTags = user.followedTags;
const contentTags = content.tags;
const relevanceBonus = intersection(userTags, contentTags).length * 0.1;
```

---

**Date de création** : 2 novembre 2025  
**Dernière modification** : 2 novembre 2025  
**Version** : 1.0
