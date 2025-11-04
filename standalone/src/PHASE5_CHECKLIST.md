# ✅ Phase 5 : Checklist de progression

**Date de début** : 1er novembre 2025  
**Plan détaillé** : `/PHASE5_INTEGRATION_GROUPES.md`

---

## 📋 Tâches principales

### 1. Types et Modèles

- [ ] Ajouter `groupId?: string` au type `Idea`
- [ ] Ajouter `suggestedToGroups?: string[]` à `Post` et `Idea`
- [ ] Créer type `ContentSuggestion`
- [ ] Mettre à jour `/types/index.ts`

**Note** : `groupId` existe déjà sur `Post`, juste l'ajouter à `Idea`.

---

### 2. Données Mockées

- [ ] Assigner `groupId` à quelques idées dans `/data/ideas.ts`
- [ ] Assigner `groupId` à quelques posts dans `/data/posts.ts`
- [ ] Créer `/data/contentSuggestions.ts` avec exemples
- [ ] Exporter dans `/data/index.ts`

**Objectif** : Au moins 3-4 contenus par groupe de test.

---

### 3. Store et Sélecteurs

#### Store (`/store/SimpleEntityStore.tsx`)

- [ ] Ajouter `contentSuggestions: Record<string, ContentSuggestion>`
- [ ] Créer action `addContentSuggestion`
- [ ] Créer action `updateContentSuggestion`
- [ ] Créer action `setContentSuggestions`
- [ ] Mettre à jour `createInitialStore()`

#### Sélecteurs (`/store/simpleSelectors.ts`)

- [ ] `getAllContentSuggestions()`
- [ ] `getSuggestionById(id)`
- [ ] `getSuggestionsByTargetGroup(groupId)`
- [ ] `getSuggestionsByContent(contentId)`
- [ ] `getUserSuggestions(userId)`
- [ ] Améliorer `getGroupContent(groupId)` pour inclure contenu suggéré

#### Export (`/hooks/useEntityStoreSimple.ts`)

- [ ] Exporter tous les nouveaux sélecteurs
- [ ] Exporter les actions de suggestions

---

### 4. Services API

#### Créer `/api/suggestionService.ts`

- [ ] `suggestContentToGroup(contentId, contentType, targetGroupId, message)`
- [ ] `fetchGroupSuggestions(groupId)`
- [ ] Logs appropriés

#### Mettre à jour `/api/contentService.ts`

- [ ] Ajouter paramètre `groupId` à `createPost()`
- [ ] Ajouter paramètre `groupId` à `createIdea()`
- [ ] Assigner `groupId` dans les objets créés

---

### 5. Hooks

#### Créer `/hooks/useSuggestionActions.ts`

- [ ] Hook `useSuggestionActions()`
- [ ] Fonction `suggestContent()`
- [ ] Mise à jour du store après suggestion
- [ ] Gestion d'erreurs + toasts

#### Export (`/hooks/index.ts`)

- [ ] Exporter `useSuggestionActions`

---

### 6. Composants UI

#### Créer `/components/GroupOriginBadge.tsx`

- [ ] Composant badge avec icône Building2
- [ ] Props : `groupId`, `size`, `clickable`
- [ ] Navigation au click
- [ ] Styles cohérents (bleu clair)

#### Créer `/components/SuggestToGroupDialog.tsx`

- [ ] Dialog avec recherche de groupes
- [ ] Affichage par défaut : mes groupes
- [ ] Sélection visuelle
- [ ] Textarea pour message optionnel
- [ ] Gestion de l'envoi

#### Créer `/components/GroupSelector.tsx`

- [ ] Select avec liste de mes groupes
- [ ] Option "Aucun groupe (public)"
- [ ] Props : `value`, `onChange`, `label`, `description`
- [ ] Avatar + nom du groupe dans les options

---

### 7. Intégrations dans composants existants

#### IdeaCard et PostCard

- [ ] Importer `GroupOriginBadge`
- [ ] Afficher badge si `groupId` présent
- [ ] Taille `sm` pour les cards

#### IdeaDetailPage

- [ ] Importer `SuggestToGroupDialog`
- [ ] Ajouter bouton "Suggérer à un groupe"
- [ ] State pour contrôler le dialog
- [ ] Afficher badge groupe d'origine

#### PostDetailPage

- [ ] Importer `SuggestToGroupDialog`
- [ ] Ajouter bouton "Suggérer à un groupe"
- [ ] State pour contrôler le dialog
- [ ] Afficher badge groupe d'origine

#### CreateQuickPost

- [ ] Importer `GroupSelector`
- [ ] Ajouter sélecteur de groupe dans le formulaire
- [ ] State `selectedGroupId`
- [ ] Passer `groupId` à `createPost()`
- [ ] Support du pré-remplissage (prop `initialGroupId`)

#### CreateCompleteIdea (BasicIdeaForm)

- [ ] Importer `GroupSelector`
- [ ] Ajouter sélecteur de groupe
- [ ] Ajouter `groupId` au state du formulaire
- [ ] Passer `groupId` à la création
- [ ] Support du pré-remplissage

#### GroupHubPage - Boutons de création

- [ ] Modifier les boutons pour pré-remplir le `groupId`
- [ ] Passer `initialGroupId={groupId}` aux dialogs
- [ ] Tester la création avec le bon groupe

---

### 8. Affichage feed de groupe

#### GroupHubPage - Amélioration des onglets

- [ ] Utiliser `getGroupContent(groupId)` au lieu de `getGroupIdeas/Posts`
- [ ] Séparer contenu origine vs suggéré dans les onglets
- [ ] Section "Projets créés dans ce groupe"
- [ ] Section "Projets suggérés" (si non vide)
- [ ] Indication de provenance sur contenu suggéré
- [ ] Même chose pour l'onglet Discussions

---

### 9. Tests

#### Création avec groupe

- [ ] Créer post avec groupe → visible dans feed groupe
- [ ] Créer projet avec groupe → visible dans projets groupe
- [ ] Créer post sans groupe → visible seulement feed général
- [ ] Badge groupe affiché correctement sur les cards
- [ ] Badge groupe affiché sur les pages de détail
- [ ] Click badge → navigation vers le groupe

#### Suggestion

- [ ] Suggérer post vers groupe depuis page détail
- [ ] Suggérer projet vers groupe depuis page détail
- [ ] Contenu suggéré visible dans feed du groupe cible
- [ ] Indication "Suggéré depuis..." affichée
- [ ] Message optionnel enregistré

#### Pré-remplissage

- [ ] Bouton "Discussion" depuis GroupHubPage → pré-remplit groupe
- [ ] Bouton "Projet" depuis GroupHubPage → pré-remplit groupe
- [ ] Création effective avec le bon groupId
- [ ] Badge affiché immédiatement après création

#### Feed de groupe

- [ ] Contenu d'origine affiché dans section dédiée
- [ ] Contenu suggéré affiché dans section séparée
- [ ] Sections vides si aucun contenu
- [ ] Navigation fluide entre sections

---

## 📊 Progression

**Fichiers à créer** : 4
- `/data/contentSuggestions.ts`
- `/api/suggestionService.ts`
- `/hooks/useSuggestionActions.ts`
- `/components/GroupOriginBadge.tsx`
- `/components/SuggestToGroupDialog.tsx`
- `/components/GroupSelector.tsx`

**Fichiers à modifier** : 12
- `/types/index.ts`
- `/data/ideas.ts`
- `/data/posts.ts`
- `/data/index.ts`
- `/store/SimpleEntityStore.tsx`
- `/store/simpleSelectors.ts`
- `/hooks/useEntityStoreSimple.ts`
- `/hooks/index.ts`
- `/api/contentService.ts`
- `/components/IdeaCard.tsx`
- `/components/PostCard.tsx`
- `/components/IdeaDetailPage.tsx`
- `/components/PostDetailPage.tsx`
- `/components/CreateQuickPost.tsx`
- `/components/CreateCompleteIdea.tsx`
- `/components/GroupHubPage.tsx`

**Total** : 6 nouveaux + 16 modifiés = **22 fichiers**

---

## 🎯 Critères de succès

### Fonctionnalités de base

✅ **Création avec groupe**
- Sélecteur visible dans formulaires
- Groupe assigné au contenu
- Badge visible sur le contenu

✅ **Suggestion vers groupe**
- Bouton visible sur pages de détail
- Dialog fonctionnel avec recherche
- Contenu apparaît dans feed du groupe cible

✅ **Affichage groupe d'origine**
- Badge visible sur cards
- Badge visible sur pages de détail
- Navigation au click

✅ **Feed de groupe enrichi**
- Contenu d'origine affiché
- Contenu suggéré affiché (séparé)
- Indications claires de provenance

### Qualité

✅ **UX**
- Sélecteur de groupe intuitif
- Pré-remplissage automatique depuis GroupHubPage
- Feedback immédiat (toasts)

✅ **Performance**
- Pas de re-render inutile
- Sélecteurs optimisés

✅ **Code**
- Types corrects partout
- Gestion d'erreurs complète
- Logs appropriés dans les services

---

## 📝 Notes

### Simplifications Phase 5

- **Auto-acceptation** : Les suggestions sont automatiquement acceptées
- **Pas de validation** : Les animateurs ne valident pas (vient en Phase 6)
- **Compatibilité** : Le champ `groupId` est optionnel, donc pas de migration nécessaire

### Prochaines étapes (Phase 6)

- Status `pending` sur les suggestions
- Validation par animateurs
- Onglet "Suggestions en attente" dans GroupManagePage
- Actions Accepter/Refuser

---

**Plan détaillé** : Voir `/PHASE5_INTEGRATION_GROUPES.md`

---

*Checklist créée le 1er novembre 2025*
