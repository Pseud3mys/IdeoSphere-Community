# Revue du code frontend — 2026-11-02

Relecture de `production/src` (auth, store, hooks, services API, wrappers de routes, pages principales).
Complète [RECAP_FRONTEND.md](RECAP_FRONTEND.md) : les problèmes déjà listés là-bas ne sont pas répétés ici.

**Constat général** : le chemin normal fonctionne, mais l'architecture du store produit des bugs discrets (lectures d'un état périmé), et des restes de mock sont encore branchés sur de vraies pages.
TypeScript n'est jamais vérifié : pas de `typescript` ni de `tsconfig`, et Vite ne contrôle pas les types. Un `tsc --noEmit` lancé à part trouvait **196 erreurs** au départ, **130** après les corrections ci-dessous (l'interface du store est maintenant exportée, donc typée).

---

## 1. Corrigé le 2026-11-02

Build Vite vérifié. Pas encore testé dans un navigateur.

| Problème | Correction | Fichiers |
|---|---|---|
| Suppression de compte : le serveur supprime le compte, mais l'écran affiche « Erreur » et l'utilisateur reste connecté (`deleteUserAccountOnApi` ne renvoie rien, testé comme un booléen ; puis `actions.rawActions` inexistant) | On attend l'appel API (qui lève une erreur en cas d'échec), on vide le store, puis on se déconnecte de Keycloak pour un membre, ou on oublie l'email local pour un invité | `hooks/userActions.ts`, `components/UserProfilePage.tsx` |
| `/signup` échouait toujours : elle appelait `createUserAccount`, `loginWithEmail` et `loginWithSocialProvider`, qui n'existent pas dans `authService`. On y arrivait par « Créer un compte » (groupe) et quand un invité publiait un projet | `/signup` sert seulement à **compléter le profil d'un membre déjà connecté** (`PATCH /users` : bio, année de naissance, lieu géocodé via `LocationSearch`). Le bouton « Créer un compte » du groupe et la publication d'un projet par un invité ouvrent **directement l'inscription Keycloak** (`registerWithSSO`). Si quelqu'un ouvre `/signup` sans être connecté, la page affiche les boutons Keycloak | `components/auth/SignupPage.tsx`, `hooks/userActions.ts` (`signupUser`), `hooks/useAuthHandlers.ts`, `components/group/GroupHubPage.tsx`, `components/CreateCompleteIdea.tsx` |
| Créer un projet : le formulaire était vidé même quand la publication échouait | Retour immédiat en cas d'échec, la saisie est conservée | `components/CreateCompleteIdea.tsx` |
| La localisation était stockée en `JSON.stringify` (store et brouillons), puis relue comme du texte : le lieu devenait `{"label":...}` | La localisation reste un objet. Les anciens brouillons au format texte JSON sont reconvertis au chargement | `components/CreateCompleteIdea.tsx`, `components/CreateIdeaPage.tsx`, `store/SimpleEntityStore.tsx` |
| Brouillons : le résumé pouvait valoir `"undefined..."`, et un `localStorage` corrompu faisait planter la page | Priorité des opérateurs corrigée, `try/catch` autour du `JSON.parse` | `components/CreateIdeaPage.tsx` |
| Profil : chaque modification (bio, avatar) partait **deux fois** en `PATCH` | Le wrapper ne repasse plus `onUpdateProfile` | `router/UserProfilePageWrapper.tsx` |
| `AuthProvider` monté deux fois : deux `syncUserSession` en parallèle, donc deux `POST /users` pour un nouvel utilisateur (le backend vérifie puis insère, sans opération atomique : risque de doublon) | Monté uniquement dans `App.tsx`. `initialEntries`, reste de `MemoryRouter`, supprimé | `main.tsx`, `App.tsx` |

**Non corrigé, car il faut toucher le backend** : les co-créateurs choisis dans le formulaire de projet ne sont jamais enregistrés. Le front ne les envoie pas, et `POST /ideas` écrit `creators: [author_id]` en dur.

### 1 bis. Corrigé le 2026-11-02 (2e passe) : état périmé et comptes invités

Build Vite vérifié. **Pas encore testé dans un navigateur** : voir la liste à tester plus bas.

**État périmé (ancien point haut n° 1).**
- Le provider ([SimpleEntityStore.tsx](production/src/store/SimpleEntityStore.tsx)) garde une `ref` mise à jour **de façon synchrone** à chaque écriture, et expose `getStore()`. Une lecture faite juste après une écriture voit la nouvelle valeur.
- Chaque fonction de mise à jour n'est exécutée qu'une seule fois. Les appels API lancés dans `storeUpdater` (soutien, upvote) ne peuvent donc plus partir en double.
- Les sélecteurs ([useEntityStoreSimple.ts](production/src/hooks/useEntityStoreSimple.ts)) lisent `getStore()` au moment de l'appel. Même une ancienne closure async obtient l'état courant.
- Les modules d'actions reçoivent `getStore` au lieu de `store`, et ne sont plus recréés à chaque changement du store (seulement quand `navigate` change). Les effets qui dépendent de `actions` ne se relancent plus en boucle.
- Effets corrigés au passage :
  - à la première ouverture d'une idée, ses sources sont bien chargées et ses discussions bien liées ;
  - `fetchMyContributions` filtrait sur `post.author?.id` (champ inexistant), il filtre maintenant sur `authorId` ;
  - `loadIdeaTabData` appelait `actions.loadDiscussions` sur les actions brutes, où la fonction n'existe pas ;
  - le profil public avait un hook appelé après un `return` conditionnel, et un effet relancé à chaque modification du store ;
  - `loadUserGroups` écrit maintenant les groupes en attente dans `pendingGroupCreations`.

**Comptes invités (ancien point haut n° 2).** Le nouveau module [guestSession.ts](production/src/hooks/guestSession.ts) fournit deux fonctions :
- `resolveSession` : retrouve l'identité existante, c'est-à-dire le membre Keycloak (après la synchro) ou l'invité mémorisé (`ideosphere_guest_email`, via `POST /users/login`). Ne crée **jamais** de compte. Elle est utilisée au démarrage (`AuthSyncBridge`) et par le feed.
- `ensureCurrentUser` : même chose, puis crée un invité seulement s'il n'y a personne. Elle est appelée **au moment d'une action** : soutenir, commenter, voter, noter, signaler, publier un post, « Entrer » sur l'accueil, participer à un groupe.

Les deux attendent la fin de l'initialisation Keycloak (un membre ne reçoit jamais d'invité) et partagent une promesse en cours, donc des clics simultanés ne créent qu'un seul invité.

Autres changements liés :
- `syncUserSession` est partagée (un seul `GET /users/me` par chargement de page) ;
- le feed, le lineage, les discussions, les notes et le détail d'une idée **ne créent plus de compte**. Un simple visiteur voit le feed public (`weighted-random`) ;
- `currentUserId` n'est plus persisté (il était de toute façon remis à `null` au démarrage), et `initializeStore` n'écrase plus l'utilisateur posé entre-temps ;
- un invité n'est oublié (email effacé du `localStorage`) que si `POST /users/login` renvoie 404, et non plus sur une simple erreur réseau.

**Le plantage au démarrage sans compte**, qui justifiait la création d'invité en lecture, venait de [IdeaDiscussionsTab.tsx](production/src/components/IdeaDiscussionsTab.tsx) : il lisait `currentUser.id` sans vérifier, ce qui plantait l'onglet Discussions d'une idée qui a des discussions. C'est protégé maintenant. Les autres composants vérifiés (`RatingSection`, onglets d'idée, détail d'un post, `MyContributionsPage`, `MyGroupsPage`, `RecommendToGroupDialog`) gèrent déjà `currentUser === null`.

**À tester dans un navigateur :**
1. Visiteur sans compte : ouvrir directement une idée (onglet Discussions compris) et un post, puis Discovery. Pas de plantage, et aucun `POST /users` dans l'onglet Réseau.
2. Même visiteur : soutenir, commenter, publier un post. Un seul `POST /users`, puis l'action réussit.
3. Recharger la page : l'invité est retrouvé (`POST /users/login`), sans nouveau `POST /users`.
4. Membre connecté : ouvrir directement `/content/ideas/...`. Aucun invité créé, groupes chargés une seule fois.
5. Premier login d'un nouveau membre : un seul `POST /users`.

---

## 2. Reste à faire — priorité haute

1. ~~**Les actions lisent un état périmé.**~~ Corrigé, voir 1 bis. C'est la cause racine de plusieurs bugs. `useEntityStoreSimple` recrée toutes les actions à chaque changement du store, et elles capturent `store` tel qu'il était à ce moment-là. Toute lecture faite après une écriture voit donc l'ancien état. Effets constatés :
   - [IdeaDetailPageWrapper.tsx](production/src/router/IdeaDetailPageWrapper.tsx) (étapes 4 et 5) : à la première ouverture d'une idée, ses sources ne sont pas chargées et ses discussions ne sont pas liées ;
   - les valeurs renvoyées par `fetchFeed`, `fetchMyContributions` et `loadDiscussions` sont fausses (aujourd'hui, elles ne servent qu'aux logs) ;
   - `loadTabData` dans `IdeaDetailPage` est en `useCallback(..., [])` avec le commentaire « actions est stable », ce qui est faux ;
   - les effets qui dépendent de `actions` se relancent à chaque modification du store (`MyContributionsPageWrapper`, `UserProfilePagePublicWrapper`, `AuthSyncBridge`).

2. ~~**Des comptes invités sont créés en lecture seule.**~~ Corrigé, voir 1 bis. `ensureGuestUserExists` ([apiActions.ts:21](production/src/hooks/apiActions.ts#L21)) est appelé par le feed, le lineage, les discussions et le détail d'une idée. Conséquences :
   - tout visiteur arrivant par un lien partagé crée un compte en base ;
   - un membre qui ouvre directement `/content/...` peut recevoir un invité avant la fin de la synchro Keycloak ;
   - sans verrou, des appels en parallèle créent plusieurs invités.


3. **Discovery peut afficher l'ancien feed.** La liste triée n'est recalculée que si le *nombre* d'idées ou de posts change ([DiscoveryPage.tsx:161-167](production/src/components/DiscoveryPage.tsx#L161-L167)). Si le feed est vide, le sélecteur affiche tout ce qui est en mémoire ([simpleSelectors.ts:188](production/src/store/simpleSelectors.ts#L188)).

4. **Le store ne peut jamais vider un tableau.** `addIdea` et `addPost` considèrent qu'un tableau vide veut dire « pas chargé » et gardent l'ancien ([SimpleEntityStore.tsx:331-343](production/src/store/SimpleEntityStore.tsx#L331-L343)). Un soutien retiré ailleurs reste donc affiché. À l'inverse, les cartes du feed mettent `replies: []`, ce qui efface les commentaires déjà chargés d'un post.

5. **Les contributions d'un invité sont perdues quand il crée un compte.** La liaison invité → membre se fait par email ([authService.ts:162](production/src/api/authService.ts#L162)). Or l'email `guest_xxx@temp.local` ne correspond jamais à l'email Keycloak.

## 3. Priorité moyenne

- **`getUserById` ne renvoie jamais `null`** (il renvoie `unknownUser`). Tous les `if (!author)` et `.filter(Boolean)` sur des utilisateurs ne servent donc à rien, et des « Utilisateur Inconnu » apparaissent dans les notifications.
- **Token Keycloak** : il n'est rafraîchi que par un `setInterval`. Après une mise en veille, les premières requêtes partent avec un token expiré. **Piste** : `await keycloak.updateToken(30)` dans l'intercepteur axios.
- **Mises à jour optimistes sans retour arrière** (soutien, upvote dans `contentActions`) : si l'API échoue, l'écran reste faux. L'appel API reste lancé depuis la fonction de mise à jour ; il n'est plus rejoué (voir 1 bis), mais le sortir de là serait plus lisible.
- **Widget, risque de sécurité latent.** Si l'email saisi existe déjà, le widget cherche l'utilisateur par email puis poste sous son identité ([QuickPostComposer.tsx:121-138](production/src/components/QuickPostWidget/QuickPostComposer.tsx#L121-L138)). Si la route `GET /users?email=` est un jour implémentée, n'importe qui pourra publier au nom de n'importe qui.
- **Navigation :**
  - `goToIdea` charge tout avant de naviguer, puis la page recharge tout : requêtes en double, clic lent, échec silencieux ;
  - `goToCommunities` mène vers `/communities`, qui n'existe pas ;
  - `UserProfilePageWrapper` appelle `navigate('/')` pendant le rendu.
- **Créer un projet :**
  - les brouillons (`ideosphere-drafts`) ne sont pas rangés par utilisateur ;
  - chaque frappe écrit dans le store global, ce qui fait re-rendre toute l'application ;
  - « Repartir de zéro » ne retire pas le post source quand il vient de l'état de navigation, car un effet le rajoute aussitôt.
- **Avatar** : il est stocké en base64 dans le document utilisateur (l'upload est simulé), donc renvoyé dans chaque réponse qui contient des utilisateurs.

## 4. Qualité du code

- **Ajouter la vérification de types** : `typescript` en devDependency, un `tsconfig` qui reprend les alias de `vite.config.ts`, et un script `tsc --noEmit`. L'interface `SimpleEntityStore` est maintenant exportée, ce qui a fait apparaître de vraies erreurs, comme les fonctions mock ci-dessous qui appellent des fonctions inexistantes.
- **Restes de mock à supprimer** : `switchToTestUser`, `switchToVisitor`, `checkEmailExists` et `loginWithSocialProvider` (qui appellent des fonctions d'`authService` inexistantes), `createUserAccount` (même problème), `handleSocialLogin` (avec `demo@google.com`), l'utilisateur `shim-user` injecté par `dataService`, et `MockAuthService`.
- **Doublons dans la fusion des actions** (`useEntityStoreSimple`) : `loadIdeaRatings` existe dans `contentActions` et dans `apiActions` (c'est la seconde qui gagne), et `showOnboarding`/`hideOnboarding` sont définis deux fois.

## 5. Côté backend, repéré au passage

- `POST /ideas` convertit `location` (texte → objet) dans une variable, puis enregistre quand même `data.get('location')` tel quel ([routes.py:105-128](../IdeoSphere%20Engine/backend/routes/routes.py#L105-L128)).
- La création d'utilisateur vérifie l'unicité de l'email puis insère, sans opération atomique ([user_repo.py:48](../IdeoSphere%20Engine/backend/database/user_repo.py#L48)).
