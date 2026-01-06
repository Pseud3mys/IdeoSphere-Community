# QuickPostWidget

Composant réutilisable pour créer rapidement des posts avec support optionnel d'un feed de suggestions.

## � Principes de design pour widgets embarqués (iframe)

### ✅ Transparence
- **Body/HTML transparents** : Configuré dans `QuickPostWidgetStandalone.tsx`
- **Pas de conteneurs avec fond** : Éviter `bg-white`, `bg-gray-*` sur les conteneurs externes
- **Seuls les éléments interactifs** (Cards, Inputs) ont un fond

### ✅ Dimensionnement correct
- **Pas de `min-h-screen`** : Le widget doit prendre uniquement la hauteur de son contenu
- **Largeur contrôlée** : `w-full max-w-2xl mx-auto` sur le conteneur principal
- **Pas de padding excessif** : Éviter les marges qui créent de l'espace vide autour

### ✅ Structure type
```tsx
<div className="w-full max-w-2xl mx-auto">
  <div className="rounded-lg border border-black/20 shadow-sm p-6">
    {/* Contenu */}
  </div>
</div>
```

## �🎯 Fonctionnalités

- **Création rapide de posts** : textarea + sélection de type (question/suggestion/autre)
- **Gestion intelligente des utilisateurs** :
  - Utilise l'utilisateur connecté si disponible
  - Crée/réutilise un compte invité stocké en localStorage sinon
- **Champs de contact optionnels** : prénom et email (cachables)
- **Support de tags et groupes** : association automatique aux posts
- **Feed optionnel** : affiche 4-6 posts similaires après publication
- **Embeddable en iframe** : support des paramètres URL

## 📦 Utilisation

### Simple (dans l'app)

```tsx
import { QuickPostWidget } from './components/QuickPostWidget';

<QuickPostWidget 
  defaultTags={['#FAQ']}
  showFeedAfterPost={false}
  showContactFields={false}
  placeholder="Posez votre question..."
/>
```

### Avec feed et groupes

```tsx
<QuickPostWidget 
  defaultGroupIds={['groups/123']}
  defaultTags={['#Support', '#Question']}
  showFeedAfterPost={true}
  feedSize={6}
  showContactFields={true}
  onPostCreated={(post) => console.log('Post créé:', post.id)}
  onClose={() => console.log('Widget fermé')}
/>
```

### En iframe (standalone)

URL: `/widget/quick-post?groups=FAQ&tags=Support,Question&showFeed=true&feedSize=6&showContact=false`

Le composant `QuickPostWidgetStandalone` parse automatiquement les paramètres.

## 🔧 Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `defaultGroupIds` | `string[]` | `[]` | IDs des groupes à associer automatiquement |
| `defaultTags` | `string[]` | `[]` | Tags à ajouter automatiquement (ex: `['#FAQ']`) |
| `showContactFields` | `boolean` | `false` | Affiche les champs prénom/email optionnels |
| `showFeedAfterPost` | `boolean` | `false` | Affiche le feed après publication |
| `feedSize` | `4 \| 6` | `6` | Nombre de posts dans le feed |
| `onPostCreated` | `(post: Post) => void` | - | Callback après création du post |
| `onClose` | `() => void` | - | Callback à la fermeture du widget |
| `standalone` | `boolean` | `false` | Active le mode iframe |
| `placeholder` | `string` | - | Texte du placeholder personnalisé |

## 🎨 Composants internes

- **QuickPostComposer** : Formulaire de création
- **QuickPostFeed** : Affichage du feed filtré par groupe ou tags
- **QuickPostCard** : Card minimaliste pour afficher un post
- **QuickPostWidgetStandalone** : Wrapper pour iframe avec parsing URL

## 💾 Gestion des utilisateurs

1. **Utilisateur connecté** : utilise `currentUser` depuis EntityStore
2. **Invité existant** : réutilise l'ID stocké dans `localStorage.quickpost_guest_user_id`
3. **Nouvel invité** : crée un compte via `POST /users` et stocke l'ID

## 🔍 Feed intelligent

- **Avec groupIds** : appelle `fetchGroupFeed()` pour récupérer les posts du groupe
- **Avec tags uniquement** : récupère le feed général et filtre par tags
- Affiche 4-6 posts avec bouton "Soutenir"

## 📍 Exemple d'intégration

Voir `FAQPage.tsx` pour un exemple concret d'intégration à la place du bouton Discord.

```tsx
<QuickPostWidget 
  defaultTags={['#FAQ']}
  showFeedAfterPost={false}
  showContactFields={false}
  placeholder="Posez votre question ici..."
/>
```

## 🔗 Communication iframe

En mode standalone, le widget utilise `window.postMessage` pour communiquer avec le parent :

- `quickpost_created` : post créé avec `{ postId, groupIds }`
- `quickpost_closed` : widget fermé
