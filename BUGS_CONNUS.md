# Bugs connus

Liste des bugs rencontrés, avec leur cause, un contournement et l'état de la correction.
Ajouter les nouveaux bugs en haut, sur le même modèle.

| # | Bug | État |
|---|-----|------|
| 1 | « Voir détails » ramène à `/discovery` après un déploiement | Non corrigé (solution prête, voir ci-dessous) |

---

## 1. « Voir détails » ramène à `/discovery` après un déploiement

**Constaté le** 28/10/2026 sur `https://beta.ideosphere.social/discovery`.

### Symptôme

Un clic sur « Voir détails » d'une idée ou d'un post renvoie à la page d'exploration au lieu d'ouvrir le détail. Aucun message d'erreur n'est affiché. Les autres pages fonctionnent.

### Message dans la console du navigateur (F12)

```
Failed to load module script: Expected a JavaScript-or-Wasm module script but the server
responded with a MIME type of "text/html".
❌ Erreur lors du chargement de l'idée ideas/1292849: TypeError: Failed to fetch dynamically
imported module: https://beta.ideosphere.social/assets/detailsService-DLlTXI1C.js
```

### Cause

1. Vite nomme les fichiers du build avec un hash (`index-BlYfYn1V.js`, `detailsService-DLlTXI1C.js`). Le hash change à chaque modification du code.
2. Le navigateur garde en cache l'ancien `index.html` / `index-*.js`, qui référence les anciens noms.
3. Après un redéploiement, les anciens fichiers n'existent plus sur le serveur.
4. [production/nginx.conf](production/nginx.conf) applique `try_files $uri /index.html` à toutes les adresses : pour un fichier `/assets/...` absent, il renvoie la page HTML au lieu d'un 404. Le navigateur attendait du JavaScript, d'où l'erreur « MIME type text/html ».
5. [IdeaDetailPageWrapper.tsx](production/src/router/IdeaDetailPageWrapper.tsx) attrape toute erreur de chargement et fait `navigate('/discovery')`, ce qui masque la cause.

Seules les pages chargées à la demande (le détail, au clic) sont touchées. Celles déjà chargées au démarrage fonctionnent.

### Contournement

Recharger complètement la page : **Ctrl+Maj+R** (ou Ctrl+F5). Le navigateur récupère alors le nouveau `index.html`. Vérifié : ça résout le problème.

### Solution proposée (non appliquée)

Deux changements, testés en local (config nginx valide, build Vite OK, réponses vérifiées avec nginx dans Docker). Ils ne protègent que les déploiements **suivants** : les navigateurs qui ont déjà l'ancienne version devront faire un dernier Ctrl+Maj+R.

**a) `production/nginx.conf`** : ne jamais mettre `index.html` en cache, et renvoyer un vrai 404 pour un fichier de `/assets/` absent.

```nginx
  location /assets/ {
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  location = /index.html {
    add_header Cache-Control "no-cache";
  }
```

À placer avant le `location /` existant. Résultats vérifiés : fichier inexistant → 404 ; fichier réel → 200 avec cache long ; `/discovery` et `/index.html` → 200 avec `no-cache`.

**b) `production/src/main.tsx`** : sur un échec de chargement d'un fichier, recharger la page une seule fois.

```tsx
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  try {
    if (sessionStorage.getItem('chunk-reload')) return;
    sessionStorage.setItem('chunk-reload', '1');
  } catch {
    return;
  }
  window.location.reload();
});

// après le rendu : autoriser un futur rechargement une fois la page stable
setTimeout(() => {
  try { sessionStorage.removeItem('chunk-reload'); } catch { /* sans importance */ }
}, 10000);
```

Le rechargement automatique n'a pas été testé dans un navigateur (il faudrait simuler un déploiement entre deux clics).

**Mise en prod** (quand la correction sera décidée) : `git pull` puis `docker compose up -d --build` dans `IdeoSphere-Community` sur le VPS.

### Piste supplémentaire (non faite)

La redirection silencieuse de `IdeaDetailPageWrapper` vers `/discovery` rend les erreurs difficiles à diagnostiquer. Afficher un message d'erreur à la place aiderait pour les prochains bugs.
