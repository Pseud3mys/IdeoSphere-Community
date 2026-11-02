# Revue du code frontend — 2026-11-02

Relecture de `production/src` (auth, store, hooks, services API, wrappers de routes, pages principales).
Complète [RECAP_FRONTEND.md](RECAP_FRONTEND.md) : les problèmes déjà listés là-bas ne sont pas répétés ici.

**Constat général** : le chemin normal fonctionne, mais l'architecture du store produit des bugs discrets (lectures d'un état périmé), et des restes de mock sont encore branchés sur de vraies pages.
TypeScript n'est jamais vérifié : pas de `typescript` ni de `tsconfig`, et Vite ne contrôle pas les types. Un `tsc --noEmit` lancé à part trouve **192 erreurs** (196 avant les corrections ci-dessous).

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

---

## 2. Reste à faire — priorité haute

1. **Les actions lisent un état périmé.** C'est la cause racine de plusieurs bugs. `useEntityStoreSimple` recrée toutes les actions à chaque changement du store, et elles capturent `store` tel qu'il était à ce moment-là. Toute lecture faite après une écriture voit donc l'ancien état. Effets constatés :
   - [IdeaDetailPageWrapper.tsx](production/src/router/IdeaDetailPageWrapper.tsx) (étapes 4 et 5) : à la première ouverture d'une idée, ses sources ne sont pas chargées et ses discussions ne sont pas liées ;
   - les valeurs renvoyées par `fetchFeed`, `fetchMyContributions` et `loadDiscussions` sont fausses (aujourd'hui, elles ne servent qu'aux logs) ;
   - `loadTabData` dans `IdeaDetailPage` est en `useCallback(..., [])` avec le commentaire « actions est stable », ce qui est faux ;
   - les effets qui dépendent de `actions` se relancent à chaque modification du store (`MyContributionsPageWrapper`, `UserProfilePagePublicWrapper`, `AuthSyncBridge`).

   **Piste** : lire l'état via `storeUpdater(prev => …)` ou une `ref` sur le store, et rendre les actions stables.

2. **Des comptes invités sont créés en lecture seule.** `ensureGuestUserExists` ([apiActions.ts:21](production/src/hooks/apiActions.ts#L21)) est appelé par le feed, le lineage, les discussions et le détail d'une idée. Conséquences :
   - tout visiteur arrivant par un lien partagé crée un compte en base ;
   - un membre qui ouvre directement `/content/...` peut recevoir un invité avant la fin de la synchro Keycloak ;
   - sans verrou, des appels en parallèle créent plusieurs invités.

   **Piste** : ne créer l'invité qu'au moment d'une action (soutenir, publier), avec une promesse partagée comme verrou, et seulement après la fin du chargement de l'auth.

3. **Discovery peut afficher l'ancien feed.** La liste triée n'est recalculée que si le *nombre* d'idées ou de posts change ([DiscoveryPage.tsx:161-167](production/src/components/DiscoveryPage.tsx#L161-L167)). Si le feed est vide, le sélecteur affiche tout ce qui est en mémoire ([simpleSelectors.ts:188](production/src/store/simpleSelectors.ts#L188)).

4. **Le store ne peut jamais vider un tableau.** `addIdea` et `addPost` considèrent qu'un tableau vide veut dire « pas chargé » et gardent l'ancien ([SimpleEntityStore.tsx:331-343](production/src/store/SimpleEntityStore.tsx#L331-L343)). Un soutien retiré ailleurs reste donc affiché. À l'inverse, les cartes du feed mettent `replies: []`, ce qui efface les commentaires déjà chargés d'un post.

5. **Les contributions d'un invité sont perdues quand il crée un compte.** La liaison invité → membre se fait par email ([authService.ts:162](production/src/api/authService.ts#L162)). Or l'email `guest_xxx@temp.local` ne correspond jamais à l'email Keycloak.

## 3. Priorité moyenne

- **`currentUserId` au démarrage.** `initializeStore` force `currentUserId: null` ([SimpleEntityStore.tsx:598](production/src/store/SimpleEntityStore.tsx#L598)). Cela peut effacer un utilisateur posé entre-temps, et rend inutile la valeur enregistrée en localStorage. Le contrôle qui suit, dans `useEntityStoreSimple`, ne sert à rien : il lit un store périmé.
- **`getUserById` ne renvoie jamais `null`** (il renvoie `unknownUser`). Tous les `if (!author)` et `.filter(Boolean)` sur des utilisateurs ne servent donc à rien, et des « Utilisateur Inconnu » apparaissent dans les notifications.
- **Token Keycloak** : il n'est rafraîchi que par un `setInterval`. Après une mise en veille, les premières requêtes partent avec un token expiré. **Piste** : `await keycloak.updateToken(30)` dans l'intercepteur axios.
- **Appels API dans une fonction de mise à jour de `setState`** (soutien, upvote dans `contentActions`). C'est un effet de bord à un endroit que React peut rejouer, et il n'y a aucun retour arrière si l'API échoue.
- **Widget, risque de sécurité latent.** Si l'email saisi existe déjà, le widget cherche l'utilisateur par email puis poste sous son identité ([QuickPostComposer.tsx:121-138](production/src/components/QuickPostWidget/QuickPostComposer.tsx#L121-L138)). Si la route `GET /users?email=` est un jour implémentée, n'importe qui pourra publier au nom de n'importe qui.
- **Navigation :**
  - `goToIdea` charge tout avant de naviguer, puis la page recharge tout : requêtes en double, clic lent, échec silencieux ;
  - `goToCommunities` mène vers `/communities`, qui n'existe pas ;
  - `UserProfilePageWrapper` appelle `navigate('/')` pendant le rendu ;
  - un hook est appelé après un `return` conditionnel dans `UserProfilePagePublicWrapper`.
- **Créer un projet :**
  - les brouillons (`ideosphere-drafts`) ne sont pas rangés par utilisateur ;
  - chaque frappe écrit dans le store global, ce qui fait re-rendre toute l'application ;
  - « Repartir de zéro » ne retire pas le post source quand il vient de l'état de navigation, car un effet le rajoute aussitôt.
- **Avatar** : il est stocké en base64 dans le document utilisateur (l'upload est simulé), donc renvoyé dans chaque réponse qui contient des utilisateurs.

## 4. Qualité du code

- **Ajouter la vérification de types** : `typescript` en devDependency, un `tsconfig` qui reprend les alias de `vite.config.ts`, et un script `tsc --noEmit`. `SimpleEntityStore` (l'interface) n'est pas exportée, donc tout le store est en `any`.
- **Restes de mock à supprimer** : `switchToTestUser`, `switchToVisitor`, `checkEmailExists`, `loginWithSocialProvider`, `handleSocialLogin` (avec `demo@google.com`), l'utilisateur `shim-user` injecté par `dataService`, et `MockAuthService`.
- **Doublons dans la fusion des actions** (`useEntityStoreSimple`) : `loadIdeaRatings` existe dans `contentActions` et dans `apiActions` (c'est la seconde qui gagne), et `showOnboarding`/`hideOnboarding` sont définis deux fois.
- **`loadUserGroups`** écrit dans `pendingGroups` au lieu de `pendingGroupCreations` ([apiActions.ts:1056](production/src/hooks/apiActions.ts#L1056)). C'est masqué, parce que les pages de groupes appellent `loadMyGroups`.
- **`loadIdeaTabData('discussions' | 'evaluation')`** appelle `actions.loadDiscussions` sur les actions brutes du store : cela lève une `TypeError`, qui est avalée. Ces onglets ne sont pas appelés aujourd'hui.

## 5. Côté backend, repéré au passage

- `POST /ideas` convertit `location` (texte → objet) dans une variable, puis enregistre quand même `data.get('location')` tel quel ([routes.py:105-128](../IdeoSphere%20Engine/backend/routes/routes.py#L105-L128)).
- La création d'utilisateur vérifie l'unicité de l'email puis insère, sans opération atomique ([user_repo.py:48](../IdeoSphere%20Engine/backend/database/user_repo.py#L48)).
