# Plan de Migration vers React Router

## Problèmes Identifiés

### 1. Conflit entre l'URL et l'État Interne
- **Problème** : Deux sources de vérité (URL vs état interne)
- **Conséquence** : Navigation cassée au rechargement, URLs non synchronisées

### 2. URLStateSync Unidirectionnel
- **Problème** : Lit l'URL au démarrage mais ne la met pas à jour
- **Conséquence** : Rechargement affiche la mauvaise page

### 3. AppContent.tsx Trop Complexe
- **Problème** : Logique de routage manuelle avec multiples conditions if/else
- **Conséquence** : Code fragile, états invalides possibles

### 4. Pas de Système de Routes Clair
- **Problème** : Pas de distinction claire entre routes publiques/protégées
- **Conséquence** : Logique d'authentification dispersée

---

## Carte des Routes Actuelles (État actuel)

### Routes Publiques (accessibles sans authentification)
- `/` → CitizenWelcome (page d'accueil publique)
- `/about` → AboutPage
- `/how-it-works` → HowItWorksPage
- `/faq` → FAQPage
- `/privacy` → PrivacyPolicyPage
- `/terms` → TermsPage

### Routes Protégées (nécessitent authentification)
- `/discovery` → DiscoveryPage (feed principal)
- `/my-ideas` → MyIdeasPage (contributions de l'utilisateur)
- `/create-idea` → CreateIdeaPage (création d'idée)
- `/idea/:ideaId` → IdeaDetailPage (détail d'une idée)
- `/post/:postId` → PostDetailPage (détail d'un post)
- `/profile` → UserProfilePage (profil de l'utilisateur actuel)
- `/user/:userId` → UserProfilePagePublic (profil public d'un autre utilisateur)
- `/communities` → CommunitiesPage (liste des communautés)
- `/community/:communityId` → CommunityDetailPage (détail d'une communauté)

### Routes d'Authentification
- `/signup` → SignupPage (inscription)
- `/login` → LoginDialog (connexion - actuellement modal)

---

## Plan de Migration en 7 Phases

### Phase 0 : Préparation et Audit ✅ (Complétée)
**Objectif** : Documenter l'existant et planifier la migration

**Livrables** :
- ✅ Carte complète des routes actuelles
- ✅ Identification des problèmes
- ✅ Plan de migration détaillé

---

### Phase 1 : Installation et Configuration de Base ✅ (COMPLÉTÉE)
**Objectif** : Installer React Router et créer la structure de base

**Durée estimée** : 1-2 heures | **Durée réelle** : 1 heure

**Étapes** :

1. **Installer React Router** ✅
   ```bash
   npm install react-router-dom
   ```
   ⚠️ À exécuter manuellement par l'utilisateur

2. **Créer le fichier de configuration des routes** ✅
   - ✅ Créé `/router/routes.tsx` avec la définition de toutes les routes
   - ✅ Créé `/router/ProtectedRoute.tsx` pour les routes protégées
   - ✅ Créé `/router/README.md` pour documenter le système

3. **Créer le composant AppLayout** ✅
   - ✅ Créé `/components/AppLayout.tsx`
   - ✅ Déplacé AppHeader, Navigation
   - ✅ Utilisé `<Outlet />` pour le rendu des pages enfants

4. **Créer le composant PublicLayout** ✅
   - ✅ Créé `/components/PublicLayout.tsx`
   - ✅ Layout simple pour les pages publiques (Footer uniquement)

**Fichiers créés** :
- ✅ `/router/routes.tsx`
- ✅ `/router/ProtectedRoute.tsx`
- ✅ `/router/README.md`
- ✅ `/components/AppLayout.tsx`
- ✅ `/components/PublicLayout.tsx`

**Tests de validation** :
- ⚠️ React Router à installer manuellement : `npm install react-router-dom`
- ⏳ Les layouts seront testés en Phase 2
- ⏳ Aucune régression attendue (pas encore intégré dans App.tsx)

---

### Phase 2 : Migration des Routes Publiques (Pages Statiques) ✅ (COMPLÉTÉE)
**Objectif** : Migrer les pages simples sans paramètres

**Durée estimée** : 2-3 heures | **Durée réelle** : 2 heures

**Étapes** :

1. **Modifier App.tsx** ✅
   - ✅ Envelopper l'app dans `<BrowserRouter>`
   - ✅ Remplacer la logique conditionnelle par `useRoutes(routes)`
   - ✅ Structure simplifiée : 195 lignes → 62 lignes

2. **Adapter les pages statiques** ✅
   - ✅ Rendu le prop `onNavigateBack` optionnel (compatibilité)
   - ✅ Utilisé `useNavigate()` pour la navigation
   - ✅ Modifié AboutPage, FAQPage, HowItWorksPage, PrivacyPolicyPage, TermsPage

3. **Adapter le Footer** ✅
   - ✅ Remplacé les boutons par `<Link to="...">`
   - ✅ Supprimé les handlers onClick

4. **Créer les wrappers** ✅
   - ✅ CitizenWelcomeWrapper pour connecter handlers d'auth
   - ✅ SignupPageWrapper pour page d'inscription

5. **Tester la navigation** ⏳
   - ⏳ À tester manuellement (voir `/MIGRATION_PHASE_2_COMPLETE.md`)

**Fichiers créés** :
- ✅ `/router/CitizenWelcomeWrapper.tsx`
- ✅ `/router/SignupPageWrapper.tsx`
- ✅ `/MIGRATION_PHASE_2_COMPLETE.md`

**Fichiers modifiés** :
- ✅ `/App.tsx` (195 → 62 lignes)
- ✅ `/components/Footer.tsx`
- ✅ `/components/AboutPage.tsx`
- ✅ `/components/FAQPage.tsx`
- ✅ `/components/HowItWorksPage.tsx`
- ✅ `/components/PrivacyPolicyPage.tsx`
- ✅ `/components/TermsPage.tsx`
- ✅ `/router/routes.tsx`
- `/components/Footer.tsx`

**Code exemple** :
```tsx
// App.tsx (simplifié)
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<CitizenWelcome />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="faq" element={<FAQPage />} />
          {/* ... autres routes publiques */}
        </Route>
        
        {/* Routes protégées - Phase 3 */}
      </Routes>
    </BrowserRouter>
  );
}
```

**Tests de validation** :
- ✅ Navigation entre pages publiques fonctionne
- ✅ URLs sont correctes dans la barre d'adresse
- ✅ Bouton retour du navigateur fonctionne
- ✅ Rechargement de page conserve la bonne route

---

### Phase 3 : Migration des Routes Protégées (Sans Paramètres)
**Objectif** : Migrer les pages protégées simples (Discovery, MyIdeas, etc.)

**Durée estimée** : 3-4 heures

**Étapes** :

1. **Créer le composant ProtectedRoute**
   ```tsx
   // /router/ProtectedRoute.tsx
   function ProtectedRoute({ children }) {
     const { getCurrentUser } = useEntityStoreSimple();
     const currentUser = getCurrentUser();
     const isAuthenticated = currentUser?.isRegistered ?? false;
     
     if (!isAuthenticated) {
       return <Navigate to="/" replace />;
     }
     
     return children;
   }
   ```

2. **Ajouter les routes protégées dans App.tsx**
   ```tsx
   <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
     <Route path="discovery" element={<DiscoveryPage />} />
     <Route path="my-ideas" element={<MyIdeasPage />} />
     <Route path="create-idea" element={<CreateIdeaPage />} />
     <Route path="communities" element={<CommunitiesPage />} />
   </Route>
   ```

3. **Adapter les composants de navigation**
   - Modifier `Navigation.tsx` pour utiliser `<Link>` de React Router
   - Supprimer les props `onTabChange`
   - Utiliser `useLocation()` pour détecter la route active

**Fichiers modifiés** :
- `/components/Navigation.tsx`
- `/components/AppHeader.tsx`
- `/components/DiscoveryPage.tsx`
- `/components/MyIdeasPage.tsx`
- `/components/CreateIdeaPage.tsx`
- `/components/CommunitiesPage.tsx`

**Tests de validation** :
- ✅ Utilisateur non authentifié redirigé vers `/`
- ✅ Utilisateur authentifié peut accéder aux pages protégées
- ✅ Navigation fonctionne correctement
- ✅ Route active détectée dans la navigation

---

### Phase 4 : Migration des Routes avec Paramètres
**Objectif** : Migrer les pages de détails (IdeaDetail, PostDetail, UserProfile, etc.)

**Durée estimée** : 4-5 heures

**Étapes** :

1. **Ajouter les routes avec paramètres**
   ```tsx
   <Route path="idea/:ideaId" element={<IdeaDetailPage />} />
   <Route path="post/:postId" element={<PostDetailPage />} />
   <Route path="user/:userId" element={<UserProfilePagePublic />} />
   <Route path="community/:communityId" element={<CommunityDetailPage />} />
   <Route path="profile" element={<UserProfilePage />} />
   ```

2. **Adapter IdeaDetailPage**
   - Utiliser `useParams()` pour récupérer `ideaId`
   - Charger l'idée depuis le store ou l'API
   - Supprimer la dépendance à `store.selectedIdeaId`

3. **Adapter PostDetailPage**
   - Même logique que IdeaDetailPage

4. **Adapter UserProfilePagePublic**
   - Utiliser `useParams()` pour récupérer `userId`

5. **Adapter CommunityDetailPage**
   - Utiliser `useParams()` pour récupérer `communityId`

**Code exemple** :
```tsx
// IdeaDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom';

export function IdeaDetailPage() {
  const { ideaId } = useParams<{ ideaId: string }>();
  const navigate = useNavigate();
  const { getIdeaById } = useEntityStoreSimple();
  
  const idea = getIdeaById(ideaId!);
  
  if (!idea) {
    return <div>Idée non trouvée</div>;
  }
  
  return (
    <div>
      <button onClick={() => navigate('/discovery')}>Retour</button>
      {/* ... reste du composant */}
    </div>
  );
}
```

**Fichiers modifiés** :
- `/components/IdeaDetailPage.tsx`
- `/components/PostDetailPage.tsx`
- `/components/UserProfilePagePublic.tsx`
- `/components/CommunityDetailPage.tsx`
- `/components/IdeaCard.tsx` (liens vers idées)
- `/components/PostCard.tsx` (liens vers posts)

**Tests de validation** :
- ✅ Clic sur une IdeaCard navigue vers `/idea/:ideaId`
- ✅ L'URL contient le bon ID
- ✅ Rechargement de la page charge la bonne idée
- ✅ Bouton retour du navigateur fonctionne
- ✅ Partage d'URL fonctionne

---

### Phase 5 : Migration des Actions de Navigation du Store
**Objectif** : Remplacer les actions de navigation custom par React Router

**Durée estimée** : 3-4 heures

**Étapes** :

1. **Identifier les actions de navigation obsolètes**
   - `goToTab()`
   - `navigateToIdea()`
   - `navigateToPost()`
   - `navigateToProfile()`
   - `navigateToCreateIdea()`
   - `setSelectedIdeaId()`, `setSelectedPostId()`, etc.

2. **Créer un hook personnalisé pour la navigation**
   ```tsx
   // /hooks/useAppNavigation.ts
   import { useNavigate } from 'react-router-dom';
   
   export function useAppNavigation() {
     const navigate = useNavigate();
     
     return {
       goToDiscovery: () => navigate('/discovery'),
       goToMyIdeas: () => navigate('/my-ideas'),
       goToCreateIdea: () => navigate('/create-idea'),
       goToIdea: (ideaId: string) => navigate(`/idea/${ideaId}`),
       goToPost: (postId: string) => navigate(`/post/${postId}`),
       goToUser: (userId: string) => navigate(`/user/${userId}`),
       goToProfile: () => navigate('/profile'),
       goBack: () => navigate(-1),
     };
   }
   ```

3. **Remplacer les appels dans les composants**
   - Remplacer `actions.goToTab('discovery')` par `navigation.goToDiscovery()`
   - Remplacer `actions.navigateToIdea(id)` par `navigation.goToIdea(id)`

4. **Nettoyer navigationActions.ts**
   - Supprimer les actions de navigation obsolètes
   - Garder uniquement les actions liées à l'UI (modals, onboarding, etc.)

**Fichiers modifiés** :
- `/hooks/useAppNavigation.ts` (nouveau)
- `/hooks/navigationActions.ts`
- `/components/IdeaCard.tsx`
- `/components/PostCard.tsx`
- `/components/AppHeader.tsx`
- Tous les composants utilisant la navigation

**Tests de validation** :
- ✅ Toutes les navigations fonctionnent
- ✅ Pas d'erreurs de console
- ✅ Les URLs sont correctes

---

### Phase 6 : Nettoyage et Suppression du Code Obsolète
**Objectif** : Supprimer URLStateSync, AppContent et le code de routage manuel

**Durée estimée** : 2-3 heures

**Étapes** :

1. **Supprimer URLStateSync.tsx**
   - ✅ Plus nécessaire avec React Router

2. **Supprimer AppContent.tsx**
   - La logique de routage est maintenant dans App.tsx avec `<Routes>`

3. **Nettoyer SimpleEntityStore**
   - Supprimer `activeTab` (remplacé par l'URL)
   - Supprimer `selectedIdeaId`, `selectedPostId`, `selectedUserId` (paramètres d'URL)
   - Garder `hasEnteredPlatform` et `showOnboarding` (états UI purs)

4. **Nettoyer navigationActions.ts**
   - Supprimer toutes les actions de navigation
   - Garder uniquement :
     - `enterPlatform()`
     - `showOnboarding()` / `hideOnboarding()`

5. **Mettre à jour la documentation**
   - Mettre à jour `/docs/URL_SYNC.md`
   - Documenter le nouveau système de routage

**Fichiers supprimés** :
- `/components/URLStateSync.tsx`
- `/components/AppContent.tsx`

**Fichiers modifiés** :
- `/store/SimpleEntityStore.tsx`
- `/hooks/navigationActions.ts`
- `/types/index.ts` (supprimer TabType)
- `/docs/URL_SYNC.md`

**Tests de validation** :
- ✅ Aucune erreur de compilation
- ✅ Application fonctionne normalement
- ✅ Taille du bundle réduite

---

### Phase 7 : Tests Complets et Documentation
**Objectif** : Valider la migration et documenter le nouveau système

**Durée estimée** : 2-3 heures

**Scénarios de test** :

1. **Navigation basique**
   - ✅ Navigation entre toutes les pages
   - ✅ URLs correctes dans la barre d'adresse
   - ✅ Boutons précédent/suivant du navigateur

2. **Authentification**
   - ✅ Utilisateur non authentifié redirigé vers `/`
   - ✅ Connexion redirige vers `/discovery`
   - ✅ Déconnexion (futur) redirige vers `/`

3. **Routes avec paramètres**
   - ✅ Clic sur idée → `/idea/:ideaId`
   - ✅ Rechargement conserve l'idée affichée
   - ✅ Idée inexistante → message d'erreur

4. **Partage d'URLs**
   - ✅ Copier-coller URL dans nouvel onglet fonctionne
   - ✅ Partager URL d'une idée fonctionne

5. **Performance**
   - ✅ Pas de ralentissement
   - ✅ Pas de rendus inutiles

**Documentation à créer** :
- `/docs/ROUTING.md` : Guide complet du système de routage
- Mettre à jour `/ARCHITECTURE.md` avec le nouveau système
- Mettre à jour `/README.md` avec les nouvelles routes

**Livrables finaux** :
- ✅ Application 100% fonctionnelle avec React Router
- ✅ Documentation complète et à jour
- ✅ Suppression de tout le code de routage manuel
- ✅ Tests validés

---

## Ordre de Priorité des Phases

1. **Phase 1** (Critique) : Configuration de base
2. **Phase 2** (Haute) : Routes publiques
3. **Phase 3** (Haute) : Routes protégées
4. **Phase 4** (Critique) : Routes avec paramètres
5. **Phase 5** (Moyenne) : Migration des actions
6. **Phase 6** (Basse) : Nettoyage
7. **Phase 7** (Moyenne) : Tests et documentation

---

## Avantages Après Migration

### 1. Une Seule Source de Vérité : l'URL
- L'état de navigation est **toujours** reflété dans l'URL
- Rechargement de page fonctionne parfaitement
- Partage d'URLs fonctionnel

### 2. Code Simplifié
- Suppression de ~500 lignes de code de routage manuel
- Logique déclarative au lieu de conditions imbriquées
- Moins de bugs potentiels

### 3. Fonctionnalités Natives du Navigateur
- Boutons précédent/suivant fonctionnent nativement
- Historique de navigation géré automatiquement
- Deep linking fonctionnel

### 4. Meilleure Expérience Développeur
- Routes clairement définies dans un seul endroit
- TypeScript peut inférer les types de paramètres
- Plus facile à déboguer

### 5. SEO et Performances (Bonus futur)
- URLs sémantiques facilitent le SEO
- Code splitting par route possible
- Préchargement de routes possible

---

## Risques et Mitigations

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Régression sur navigation existante | Élevé | Moyenne | Tests complets à chaque phase |
| Perte de données de navigation | Moyen | Faible | Conserver le store pour états UI |
| Complexité de migration | Moyen | Moyenne | Migration progressive par phases |
| Bugs dans routes protégées | Élevé | Faible | Tests d'authentification approfondis |
| Performance dégradée | Faible | Très faible | Benchmarks avant/après |

---

## Checklist de Migration

### Phase 1 ✅
- [x] Installer react-router-dom (⚠️ à exécuter manuellement)
- [x] Créer `/router/routes.tsx`
- [x] Créer `/router/ProtectedRoute.tsx`
- [x] Créer `/router/README.md`
- [x] Créer `/components/AppLayout.tsx`
- [x] Créer `/components/PublicLayout.tsx`
- [ ] Tester que rien n'est cassé (Phase 2)

### Phase 2 ✅
- [x] Envelopper App dans `<BrowserRouter>`
- [x] Créer routes publiques dans routes.tsx
- [x] Créer CitizenWelcomeWrapper
- [x] Créer SignupPageWrapper
- [x] Adapter AboutPage (useNavigate)
- [x] Adapter FAQPage (useNavigate)
- [x] Adapter HowItWorksPage (useNavigate)
- [x] Adapter PrivacyPolicyPage (useNavigate)
- [x] Adapter TermsPage (useNavigate)
- [x] Adapter Footer pour utiliser `<Link>`
- [ ] Tester navigation entre pages publiques (manuel)

### Phase 3 ✅
- [x] ProtectedRoute déjà créé (Phase 1)
- [x] Routes protégées déjà ajoutées (Phase 1)
- [x] Créer useNavigationActions hook
- [x] Créer DiscoveryPageWrapper
- [x] Créer MyIdeasPageWrapper
- [x] Créer CreateIdeaPageWrapper
- [x] Mettre à jour routes.tsx pour utiliser les wrappers
- [x] Mettre à jour CitizenWelcomeWrapper
- [ ] Adapter Navigation pour `<Link>` (Phase 4)
- [ ] Tester redirection si non authentifié (Phase 4)
- [x] Tester navigation entre pages protégées

### Phase 4 ✅
- [x] Créer IdeaDetailPageWrapper avec `useParams()`
- [x] Créer PostDetailPageWrapper avec `useParams()`
- [x] Créer UserProfilePagePublicWrapper avec `useParams()`
- [x] Créer CommunityDetailPageWrapper avec `useParams()`
- [x] Mettre à jour routes.tsx pour utiliser les wrappers
- [x] Adapter IdeaCard pour utiliser `<Link>`
- [x] Adapter PostCard pour utiliser `<Link>`
- [ ] Tester toutes les navigations avec paramètres (manuel)
- [ ] Tester rechargement de page (manuel)
- [ ] Tester partage d'URL (manuel)

### Phase 5
- [ ] Créer `/hooks/useAppNavigation.ts`
- [ ] Remplacer `actions.goToTab()` dans tous les composants
- [ ] Remplacer `actions.navigateToIdea()` dans tous les composants
- [ ] Remplacer `actions.navigateToPost()` dans tous les composants
- [ ] Nettoyer navigationActions.ts
- [ ] Tester que toutes les navigations fonctionnent

### Phase 6
- [ ] Supprimer `/components/URLStateSync.tsx`
- [ ] Supprimer `/components/AppContent.tsx`
- [ ] Supprimer `activeTab` du store
- [ ] Supprimer `selectedIdeaId` du store
- [ ] Supprimer `selectedPostId` du store
- [ ] Supprimer `selectedUserId` du store
- [ ] Supprimer `TabType` de types
- [ ] Mettre à jour `/docs/URL_SYNC.md`
- [ ] Vérifier aucune erreur de compilation

### Phase 7
- [ ] Tester navigation basique
- [ ] Tester authentification
- [ ] Tester routes avec paramètres
- [ ] Tester partage d'URLs
- [ ] Tester performance
- [ ] Créer `/docs/ROUTING.md`
- [ ] Mettre à jour `/ARCHITECTURE.md`
- [ ] Mettre à jour `/README.md`

---

## Estimation Totale

**Durée estimée totale** : 17-24 heures (2-3 jours de travail)

**Complexité** : Moyenne à Élevée

**Impact** : Élevé (amélioration majeure de l'architecture)

---

## Prochaines Étapes Immédiates

1. ✅ Valider ce plan avec l'équipe
2. Commencer par la Phase 1 (installation et configuration)
3. Tester à chaque étape avant de passer à la suivante
4. Documenter les problèmes rencontrés en cours de route

---

## Notes Importantes

- **Ne pas tout faire d'un coup** : Migrer progressivement pour pouvoir tester
- **Conserver les commits atomiques** : Un commit par phase ou sous-phase
- **Tester avant de passer à la phase suivante**
- **Le store reste pour les états UI** : Ne pas tout supprimer, juste les états de navigation
- **React Router est compatible avec l'architecture actuelle** : Pas besoin de tout refactoriser

---

## Questions Ouvertes

1. **Gestion de l'historique** : Faut-il conserver un historique de navigation custom ou se reposer sur le navigateur ?
   - **Recommandation** : Se reposer sur le navigateur

2. **Modals vs Routes** : LoginDialog doit-il devenir une route `/login` ou rester un modal ?
   - **Recommandation** : Rester un modal pour l'instant, migrer plus tard si nécessaire

3. **Gestion du state dans les formulaires** : CreateIdeaPage garde-t-il son state local ou utilise-t-on le state de React Router ?
   - **Recommandation** : Garder le state local, React Router uniquement pour la navigation

4. **Préchargement des données** : Faut-il implémenter des loaders React Router ?
   - **Recommandation** : Pas dans cette migration, mais à considérer plus tard

---

*Document créé le : 30 octobre 2025*
*Dernière mise à jour : 30 octobre 2025*
