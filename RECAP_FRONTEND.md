# Récap Frontend — IdeoSphere Community

État constaté en lisant le code de `production/` le 2026-10-26. Seul `production/` est actif (pas de dossier `standalone/`).

## 1. Stack et déploiement

- **React 18 + TypeScript + Vite 6** (`npm run dev` sur le port 3000, `npm run build` vers `build/`).
- Composants UI : shadcn/Radix (`src/components/ui/`), Tailwind, lucide, recharts, sonner, react-markdown.
- **React Router 6** (`BrowserRouter`), **axios** (`src/api/apiClient.ts`), **keycloak-js**.
- **Dev** : le proxy Vite redirige `/api` vers `http://localhost:5000`. Il faut ouvrir `test-tenant.localhost:3000` pour que le backend résolve le tenant.
- **Prod** : Dockerfile multi-stage (node 18 → nginx). `nginx.conf` ne fait que le fallback SPA ; `/api` est routé par Nginx Proxy Manager.
- `.env.*` : `VITE_API_BASE_URL=/api`, `VITE_KEYCLOAK_URL/REALM/CLIENT_ID` (client `ideosphere-front`).

## 2. Architecture du code

```
src/
  main.tsx, App.tsx      ErrorBoundary > SimpleEntityStoreProvider > AuthProvider > BrowserRouter
  router/                routes.tsx + *Wrapper.tsx (relient store/actions et page)
  components/            pages et composants métier (ui/ = shadcn)
  store/                 SimpleEntityStore (Context React) + simpleSelectors
  hooks/                 useEntityStoreSimple, qui expose actions, apiActions, contentActions, userActions…
  api/                   1 fichier par domaine + transformService (Raw → types front)
  config/                configuration par client (sous-domaine)
  context/, auth/        AuthProvider (Keycloak) + AuthSyncBridge
  data/                  anciennes données mock (quasi inutilisées)
```

Flux de données type : page → wrapper → `useEntityStoreSimple()` → action (`apiActions`, `contentActions`…) → service `api/*` → backend → `transformService` → store normalisé (`users`, `ideas`, `posts`, `groups`, `groupMemberships`…) → sélecteurs → page.

**Le store est en mémoire.** Seuls sont persistés en `localStorage` : l'email invité (`ideosphere_guest_email`), l'id d'invité du widget (`quickpost_guest_user_id`), les brouillons d'idée (`ideosphere-drafts`) et les items « vus » de Discovery (`seenItems`). Le `currentUserId` n'est **pas** persisté : il est reconstruit à chaque chargement (Keycloak, ou invité retrouvé par son email). Les mises à jour (soutien, upvote) sont **optimistes** : le store change avant la réponse de l'API, sans retour arrière en cas d'échec.

## 3. Multi-client (white-label)

[production/src/config/clientConfig.ts](production/src/config/clientConfig.ts) choisit une config selon le **1er segment du hostname**. Les configs sont dans `config/clients/` : default, leblanc, chesnay-rocquencourt, solidarcy, saintcyrencommun, leschaises, vivons-nimes, ddnice, ehess. `beta`, `test-tenant`, `amdf` et `localhost` utilisent `default`.

Une config définit :
- l'identité (nom, logo) et la terminologie (membre, organisation, ville) ;
- les textes d'accueil, la navigation et le footer ;
- les messages système et les exemples ;
- les **types de groupes** ;
- l'intégration **Kumu** (`embedUrl` de la page Cartographie) ;
- les `features` (`showBetaBanner`, `enableNewsletters`) et `auth` (mode et mockUser, non utilisés).

Ajouter un client : dupliquer `default.ts`, l'enregistrer dans `clientConfig.ts`, sous le même sous-domaine que le tenant backend.

## 4. Authentification et identité

- `AuthProvider` ([context/authContext.tsx](production/src/context/authContext.tsx)) lance Keycloak en `check-sso` (PKCE), et rafraîchit le token toutes les 60 s.
- `syncUserSession` ([api/authService.ts](production/src/api/authService.ts)) :
  1. Cherche l'utilisateur via `GET /users/me?email=`.
  2. S'il existe mais sans keycloakId ou non enregistré : `PATCH /users/<id>` pour lier le compte Keycloak.
  3. En cas de 404 : `POST /users`. Le `keycloakId` envoyé est ignoré par le backend ; le compte est lié au login suivant, par l'étape 2.
- `AuthSyncBridge` copie l'utilisateur dans le store, le force à `isRegistered=true` et charge ses groupes.
- **Mode invité** : à l'entrée sur la plateforme (`CitizenWelcome`), `createTemporaryGuest` fait `POST /users` avec l'email `guest_<timestamp>@temp.local` et garde cet email en `localStorage` pour le retrouver ensuite (`POST /users/login`). Un invité peut poster, commenter, soutenir et noter.
- **Créer une idée** demande un compte enregistré (`canCreateIdea`), car le backend exige un JWT.
- **Admin** : `hasAdminRole()` cherche le rôle `admin:<sous-domaine>` dans le token. Il protège la page `/admin` côté client ; le backend revérifie.
- Login et inscription redirigent vers Keycloak, avec retour sur `/my-contributions` après login.

## 5. Routes et fonctionnalités réelles

`ProtectedRoute` existe mais **n'est utilisé nulle part** : toutes les routes sont accessibles sans compte.

| Route | Page | Ce qu'elle fait | Backend utilisé |
|---|---|---|---|
| `/` | CitizenWelcome | Accueil, stats, aperçu de contenus, newsletter, entrée invité ou SSO | `/feed/stats`, `/feed/weighted-random`, `/newsletter/subscribe`, `POST /users` |
| `/about` `/how-it-works` `/faq` `/privacy` `/terms` | statiques | Textes (partiellement issus de la config client) | — |
| `/signup` | SignupPage | Inscription | Keycloak / `POST /users` |
| `/discovery` | DiscoveryPage | Feed principal, cache dans le store, items « vus » en localStorage | `/feed/neighbors-activity` si l'id est un vrai `users/…`, sinon `/feed/weighted-random` |
| `/create-idea` | CreateIdeaPage | Idée complète (titre, résumé, description riche, tags, lieu, groupes, sources) ou post rapide. Brouillons locaux | `POST /ideas`, `POST /posts` |
| `/content/ideas/:id` | IdeaDetailPage | Onglets : **Description**, **Évaluation** (notes par critère), **Discussions** (posts liés), **Versions** (lignée). Soutenir, ignorer, signaler, créer une version, partager, recommander à un groupe, modifier sous 5 min | `/ideas/*`, `/feedback`, `/ideas/:k/rate`, `/lineage`, `/groups/recommend-content`, `/admin/report` |
| `/content/posts/:id` | PostDetailPage | Post et fil de réponses. Répondre à une réponse la **promeut en post**. Marquer la réponse, upvote de réponse, transformer en idée, modifier sous 5 min | `/posts/*`, `/comments`, `/promote`, `/mark-as-answer`, `/feedback` |
| `/my-ideas` | MyIdeasPage | Mes contenus | `/users/:k/content` |
| `/my-contributions` | MyContributionsPage | Onglet contributions (créé, commenté, soutenu) et onglet **notifications calculées localement** à partir des soutiens et commentaires sur mes contenus | `/users/:k/content` |
| `/profile` | UserProfilePage | Édition du profil, suppression du compte, déconnexion, lien admin | `PATCH`/`DELETE /users/:k`, `/users/:k/stats` |
| `/user/:userId` | profil public | Infos et stats | `/users/:k`, `/users/:k/stats` |
| `/groups` | GroupsExplorerPage | Liste et filtres (type, participation) | `/groups` |
| `/groups/my` | MyGroupsPage | Groupes actifs et en attente | `/users/:k/my-groups` |
| `/groups/pending/:id` | PendingGroupDetail | Confirmation des cofondateurs | `/groups/pending/*` |
| `/groups/:id` | GroupHubPage | Onglets **À la une** (showcase), **Participer** (feed du groupe), **Infos**. Rejoindre ou quitter | `/groups/:k`, `/feed`, `/showcase`, `/join`, `/leave` |
| `/groups/:id/manage` | GroupManagePage | Infos, membres (promotion animateur), liens parent/enfant/partenaire | `PATCH /groups/:k`, `/members/:u/promote`, `/groups/links/*` |
| (flow) | CreateGroupFlow | Création d'un groupe pending avec cofondateurs (comptes ou emails) | `POST /groups/pending` |
| `/statistics` | StatisticsPage | Tableaux de bord et bouton d'export brut | `/stats/global`, `/stats/raw-export` |
| `/cartography` | CartographyPage | iframe Kumu (URL dans la config client) | aucun (Kumu lit `/api/kumu-export`) |
| `/admin` | AdminPage | **Modération** (signalements : supprimer ou ignorer), **Contacts terrain** (crée un invité et éventuellement son 1er post), **Groupe direct** (création immédiate) | `/admin/*`, `POST /users`, `POST /posts` |
| `/widget/quick-post` | QuickPostWidgetStandalone | Widget iframe. Paramètres d'URL : `groups`, `tags`, `showFeed`, `feedSize`, `showContact`, `placeholder`, `background`. Crée un invité puis un post, et affiche éventuellement le feed du groupe | `POST /users`, `POST /posts`, `/groups/:k/feed` |

Aussi : onboarding guidé (`OnboardingTour`), QR code de collaboration, partage (réseaux et lien), géocodage d'adresse via `api-adresse.data.gouv.fr` (`geocodingService`), badges de chaîne et de lignée dans le feed (`feedChainUtils`), hashtags.

## 6. Ce qui ne marche pas ou est mort

**Appels vers des routes absentes ou cassées côté backend :**
- `/statistics` → bouton d'export : `GET /stats/raw-export` renvoie 500 (méthode absente côté backend).
- Widget : quand l'email saisi existe déjà, le widget appelle `GET /users?email=` ([QuickPostComposer.tsx:132](production/src/components/QuickPostWidget/QuickPostComposer.tsx#L132)), route qui n'existe pas (405). **Le post échoue.** Le pré-remplissage de l'email ne marche pas non plus, car le backend ne renvoie pas l'email.
- Quitter un groupe : le backend retire bien le membership mais renvoie 500, donc le front affiche une erreur.
- `adminService.fetchFieldContacts` / `deleteFieldContact` appellent `/admin/field-contacts`, qui n'existe pas. Le composant `FieldContactsList` n'est monté nulle part.
- `getDiscussionTreeOnApi` (`/posts/:k/discussion-tree`, inexistant) est importé dans `PostDetailPage` mais jamais appelé.

**Effets de bord à connaître :**
- **Ignorer** un contenu envoie `type: 'ignores'` sur `/feedback`. Le backend le compte comme un **soutien** (score et notification), et les feeds ne filtrent pas les contenus ignorés ou signalés.
- **Noter** une idée exige d'avoir un feedback existant sur cette idée (soutien), sinon l'API renvoie 404.
- Ajouter un **contact terrain** depuis l'admin écrase `ideosphere_guest_email` dans le `localStorage` de l'admin : `createUnfinalizedAccountOnApi` y écrit systématiquement ([authService.ts:97](production/src/api/authService.ts#L97)).
- Les stats « top contributeurs », « utilisateurs actifs » et Gini sont toujours vides ou à 0 (bug d'agrégation backend).

**Feeds potentiellement vides ou courts :**
- `fetchFeed` appelle `/feed/neighbors-activity` **sans `page`** : seule la page 1 (10 éléments max) est jamais chargée, et il n'y a pas de « charger plus ».
- Le front écarte les posts `isDiscussion` ([feedService.ts](production/src/api/feedService.ts)), y compris ceux que la complétion aléatoire du backend a ajoutés. Un feed de 10 éléments côté API peut donc en afficher moins. **Prévu** : à la place, afficher l'idée mère de la discussion (déjà dédoublonnée côté serveur, voir récap backend), pour que le contenu travaillé ne disparaisse pas.
- Le feed de groupe (`/groups/:k/feed`) n'est pas paginé non plus.
- Aucune gestion du feed vide ou trop court (pas de repli côté front). Voir la complétion incohérente côté backend, §6 du récap backend.

**Code mort ou incohérences :**
- `AuthProvider` est monté deux fois (`main.tsx` et `App.tsx`). C'est sans conséquence grâce au verrou d'init, mais redondant.
- `BrowserRouter initialEntries` est un reste de `MemoryRouter`, sans effet.
- `ProtectedRoute`, `LoginDialog`, `MockLoginDialog`, `MockAuthService`, `auth.mode` et `mockUser` de la config ne sont pas utilisés. Dans `data/`, seuls `unknownUser` et `defaultRatingCriteria` servent encore.
- Les docs périmées de `src/` (architecture, hooks, store, router, routing, config…) ont été supprimées le 2026-10-28 ; ce récap les remplace. Les `.md` restants dans `src/` portent un avertissement en haut quand une partie a été retirée.
- `package.json` à la racine de `IdeoSphere Community/` (react-router 7) n'est pas utilisé par l'app. `scripts/generate-kumu-graph.py` génère un graphe Kumu **du code** (dossiers, fichiers, imports), sans lien avec la plateforme.
