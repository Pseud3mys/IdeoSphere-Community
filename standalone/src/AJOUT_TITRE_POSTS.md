# Ajout du champ titre optionnel aux Posts

## 📋 Résumé
Ajout d'un champ `title` optionnel au type `Post` pour permettre aux utilisateurs de donner un titre explicite à leurs posts, améliorant ainsi la lisibilité et la découvrabilité.

## ✅ Modifications effectuées

### 1. Types et interfaces
- **`/types/index.ts`** : Ajout du champ `title?: string` à l'interface `Post`

### 2. Services API
- **`/api/contentService.ts`** : 
  - Ajout du paramètre `title?: string` dans `createPostOnApi`
  - Inclusion du champ `title` dans l'objet `Post` créé

### 3. Actions et hooks
- **`/hooks/apiActions.ts`** :
  - Ajout du paramètre `title?: string` dans le payload de `publishPost`
  - Transmission du titre à `createPostOnApi`

### 4. Composants de création
- **`/components/CreateQuickPost.tsx`** :
  - Le formulaire avait déjà le champ titre mais ne l'envoyait pas
  - Ajout de `title: title.trim() || undefined` dans l'appel à `publishPost`

### 5. Composants d'affichage - Cartes et listes
- **`/components/PostCard.tsx`** :
  - Utilisation de `post.title` s'il existe, sinon génération à partir du contenu
  - Logique : `{latestPost.title || (latestPost.content.split('\n')[0].slice(0, 60) + ...)}`

- **`/components/PostDetailPage.tsx`** :
  - Affichage du titre comme `<h2>` au-dessus du contenu principal si présent
  - Affichage du titre dans les posts sources de la section "En réponse à"

### 6. Composants de liaison de contenu
- **`/components/ContentLinkSearch.tsx`** :
  - Utilisation du titre du post s'il existe dans la recherche
  - Fallback vers le début du contenu si pas de titre

- **`/components/ContentLinkDialog.tsx`** :
  - Utilisation de `post.title` ou génération du titre à partir du contenu
  - Logique cohérente avec les autres composants

### 7. Pages de création d'idées
- **`/components/create-idea/CreateIdeaHeader.tsx`** :
  - Affichage du titre du post source en gras avant le contenu

- **`/components/CreateCompleteIdea.tsx`** :
  - Utilisation du titre du post pour pré-remplir le résumé de l'idée
  - Inclusion du titre dans le contexte de la description

### 8. Pages de découverte et listes
- **`/components/MyIdeasPage.tsx`** :
  - Inclusion du titre dans la recherche textuelle
  - Utilisation du titre pour le tri alphabétique

### 9. Données mockées
- **`/data/posts.ts`** :
  - Ajout de titres à 6 posts stratégiques :
    - "Manque de bancs dans le village" (post-1)
    - "Besoin de réparer nos appareils" (post-4)
    - "S'organiser pour s'entraider" (post-5)
    - "Les nids de poule rue des Écoles" (post-6)
    - "Problème de stationnement devant l'école" (post-7)

## 🎯 Comportement implémenté

### Affichage dans le feed
- **Si titre présent** : Affichage du titre comme élément principal
- **Si pas de titre** : Génération automatique à partir du début du contenu (comportement actuel)

### Formulaire de création
- Champ "Sujet de votre post" optionnel (déjà présent)
- Si rempli, le titre est sauvegardé et affiché
- Si vide, comportement par défaut (pas de titre)

### Recherche et tri
- Le titre est inclus dans la recherche textuelle
- Le titre est utilisé pour le tri alphabétique (si présent)

### Création d'idées à partir de posts
- Le titre du post est utilisé pour pré-remplir le résumé de l'idée
- Le titre apparaît dans la description de contexte

## 📝 Notes techniques

### Rétrocompatibilité
- Le champ `title` est **optionnel** pour garantir la compatibilité avec les posts existants
- Tous les composants gèrent élégamment l'absence de titre avec un fallback
- Aucun changement breaking dans l'API

### Pattern d'affichage
Le pattern standard utilisé partout :
```typescript
{post.title || (post.content.split('\n')[0].slice(0, 60) + (post.content.length > 60 ? '...' : ''))}
```

### Extraction de hashtags
- L'extraction automatique des hashtags continue de fonctionner sur le contenu
- Le titre pourrait être ajouté à l'extraction dans une future itération si pertinent

## 🔄 Impact sur le système de lineage
Le titre améliore considérablement la lisibilité du système de lineage :
- Les posts sources affichent leur titre dans les cartes de référence
- Plus facile d'identifier rapidement le contexte d'une discussion
- Meilleure expérience lors de la création de versions

## ✨ Avantages utilisateur
1. **Meilleure lisibilité** : Les posts avec titre sont plus faciles à identifier dans le feed
2. **Navigation améliorée** : Plus facile de retrouver un post spécifique
3. **Recherche optimisée** : Le titre est indexé dans la recherche
4. **Contexte clair** : Comprendre rapidement le sujet d'un post
5. **Organisation** : Facilite la structuration des discussions

## 🚀 Prochaines étapes possibles
- [ ] Ajouter des suggestions de titre basées sur le contenu (IA)
- [ ] Limiter la longueur du titre (par exemple 100 caractères max)
- [ ] Afficher un badge "Sans titre" pour différencier visuellement
- [ ] Statistiques sur l'utilisation des titres
- [ ] Inclure le titre dans l'extraction de hashtags
