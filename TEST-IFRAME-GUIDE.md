# 🧪 Guide de Test - QuickPostWidget en iframe

## 📋 Prérequis

- Frontend en cours d'exécution sur `http://localhost:5173`
- Backend en cours d'exécution (avec le groupe `groups/654537` existant OU en acceptant des groupIds invalides)

---

## 🚀 Étapes de Test

### 1️⃣ Frontend - Vérification

La route a été ajoutée dans `src/router/routes.tsx` :

```tsx
{
  path: 'widget/quick-post',
  element: <QuickPostWidgetStandalone />,
}
```

✅ **Accès direct au widget :**
```
http://localhost:5173/widget/quick-post?groups=groups/654537&tags=%23testIframe
```

---

### 2️⃣ Backend - Vérification du groupe (OPTIONNEL)

Le widget tentera de créer un post avec `groupIds: ['groups/654537']`.

**Option A : Créer le groupe sur le backend**

Si vous avez accès à ArangoDB, créez le groupe :

```javascript
// Dans ArangoDB Web Interface
db.groups.insert({
  _key: "654537",
  name: "Test iframe",
  description: "Groupe de test pour le widget iframe",
  tags: ["#test", "#iframe"],
  isPublic: true,
  createdAt: new Date().toISOString()
});
```

**Option B : Modifier temporairement le backend**

Si le backend rejette les groupIds invalides, vous avez 2 options :

1. **Utiliser uniquement les tags** (le plus simple) - Modifiez `test-iframe-quickpost.html` :
   ```html
   src="http://localhost:5173/widget/quick-post?tags=%23testIframe&showFeed=false&showContact=false"
   ```
   Supprimez `groups=groups/654537`

2. **Modifier l'API temporairement** - Dans votre route POST `/posts`, ignorez les groupIds invalides au lieu de rejeter

---

### 3️⃣ Lancer le Frontend

```bash
cd "C:\Users\alexa\OneDrive\Documents\Web App projects\IdeoSphere Community\production"
npm run dev
```

Le serveur devrait démarrer sur `http://localhost:5173`

---

### 4️⃣ Ouvrir la Page de Test

Ouvrez le fichier `test-iframe-quickpost.html` dans votre navigateur :

- **Windows** : Double-cliquer sur le fichier
- **OU via un serveur local** : `python -m http.server 8000` puis `http://localhost:8000/test-iframe-quickpost.html`

---

## 🎯 Résultat Attendu

### Interface

Vous devriez voir :

1. **Header violet** avec titre "Test iframe QuickPostWidget"
2. **Iframe blanche** contenant le widget
3. **Boîte d'info** avec la configuration
4. **Console de logs** affichant les messages

### Fonctionnement

1. ✅ Le widget s'affiche dans l'iframe
2. ✅ Vous pouvez saisir du texte
3. ✅ Vous pouvez sélectionner Question/Suggestion/Autre
4. ✅ Cliquer "Publier" crée le post
5. ✅ Un message `quickpost_created` apparaît dans les logs
6. ✅ Le post est créé avec le tag `#testIframe` (et le groupe `groups/654537` si valide)

---

## 🔍 Vérifications

### Console Navigateur (F12)

```javascript
// Devrait afficher :
✅ Utilisateur invité créé: users/123456
✅ Post créé en mode standalone: posts/789
📨 Message reçu: {type: "quickpost_created", postId: "posts/789", groupIds: ["groups/654537"]}
```

### Logs de Test

Dans la section "Messages reçus de l'iframe" :

```
✅ [14:23:45] Post créé ! ID: posts/789, Groupe: groups/654537
```

### Backend

Vérifiez dans ArangoDB ou via l'API que le post a été créé :

```http
GET http://localhost:8000/api/posts/789
```

Le post devrait avoir :
- `tags: ["#testIframe"]`
- `groupIds: ["groups/654537"]` (si le groupe existe)
- `author: "users/xxx"` (compte invité)

---

## 🛠️ Troubleshooting

### L'iframe ne s'affiche pas

- ✅ Vérifiez que le frontend tourne sur `http://localhost:5173`
- ✅ Ouvrez `http://localhost:5173/widget/quick-post` directement
- ✅ Regardez la console (F12) pour les erreurs

### Erreur "Port 3000 is in use"

Le serveur cherche un autre port. Vérifiez l'URL réelle dans la console et modifiez `test-iframe-quickpost.html` en conséquence.

### Erreur 400/500 lors de la création du post

- ✅ Vérifiez que le backend accepte les posts avec groupIds
- ✅ Utilisez uniquement les tags si le groupe n'existe pas
- ✅ Regardez les logs du backend

### Pas de messages dans les logs

- ✅ Vérifiez la console navigateur (F12)
- ✅ Le `window.postMessage` devrait être envoyé
- ✅ Vérifiez que l'iframe et la page parent sont sur le même protocole (http/https)

---

## 📝 Variantes de Test

### Test sans groupe (tags uniquement)

```html
src="http://localhost:5173/widget/quick-post?tags=%23FAQ,%23Support&showFeed=false"
```

### Test avec feed activé

```html
src="http://localhost:5173/widget/quick-post?groups=groups/654537&tags=%23testIframe&showFeed=true&feedSize=6"
```

### Test avec champs contact

```html
src="http://localhost:5173/widget/quick-post?tags=%23testIframe&showContact=true"
```

---

## ✅ Checklist

- [ ] Frontend démarre sans erreur
- [ ] Route `/widget/quick-post` accessible
- [ ] Iframe se charge dans `test-iframe-quickpost.html`
- [ ] Widget s'affiche correctement
- [ ] Compte invité créé automatiquement
- [ ] Post publié avec succès
- [ ] Tag `#testIframe` ajouté au post
- [ ] Message `postMessage` reçu par la page parent
- [ ] Log affiché dans la console de test

---

## 🎉 Succès !

Si tous les points sont validés, le widget est prêt pour :
- ✅ Être embarqué dans n'importe quelle page web
- ✅ Créer des posts avec tags et/ou groupes
- ✅ Communiquer avec la page parent via postMessage
- ✅ Gérer automatiquement les utilisateurs invités
