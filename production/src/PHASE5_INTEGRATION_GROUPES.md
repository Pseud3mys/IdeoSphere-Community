# 🔗 Phase 5 : Intégration Complète des Groupes

**Date de début** : 1er novembre 2025  
**Statut** : 📋 Planification

---

## 🎯 Objectif

Intégrer complètement les groupes au reste du système IdeoSphere en permettant :
1. D'associer du contenu (posts/projets) à des groupes dès la création
2. De suggérer du contenu existant vers des groupes
3. De voir l'origine groupe d'un contenu
4. De naviguer facilement entre contenu et groupes

---

## 🔄 Architecture de l'intégration

### Principe de base

Chaque contenu (Post ou Idea) peut avoir :
- **Un groupe d'origine** (`groupId`) : où il a été créé/publié
- **Des groupes suggérés** : où il a été partagé/suggéré par d'autres membres

### Flow de contenu

```
Création → Groupe d'origine (optionnel)
                ↓
         Contenu publié
                ↓
         Visible dans :
         - Feed général
         - Feed du groupe d'origine
         - Profil de l'auteur
                ↓
         Suggestion vers d'autres groupes
                ↓
         Visible aussi dans :
         - Feed des groupes suggérés
```

---

## ✅ Tâches Phase 5

### 1. Types et Modèles

#### 1.1 Mettre à jour les types existants

**`/types/index.ts`** :

```typescript
export interface Post {
  // ... champs existants
  groupId?: string; // ✅ Déjà présent - groupe d'origine
  suggestedToGroups?: string[]; // 🆕 Groupes où ce post a été suggéré
}

export interface Idea {
  // ... champs existants
  groupId?: string; // 🆕 À ajouter - groupe d'origine
  suggestedToGroups?: string[]; // 🆕 Groupes où cette idée a été suggérée
}
```

#### 1.2 Créer nouveau type pour suggestions

```typescript
export interface ContentSuggestion {
  id: string;
  contentId: string;
  contentType: 'idea' | 'post';
  sourceGroupId?: string; // Groupe d'origine du contenu
  targetGroupId: string; // Groupe où le contenu est suggéré
  suggestedBy: string; // userId
  suggestedAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string; // Message optionnel de l'utilisateur qui suggère
}
```

**Note** : Pour l'instant, suggestions auto-acceptées. La validation par animateurs viendra en Phase 6.

---

### 2. Données Mockées

#### 2.1 Ajouter groupId aux idées existantes

**`/data/ideas.ts`** :

```typescript
// Exemple : Assigner quelques idées à des groupes
{
  id: 'ideas/1',
  // ... autres champs
  groupId: 'g1', // Commission Culture
  suggestedToGroups: ['g2', 'g5'], // Suggéré aussi dans Culture Locale et Quartier Nord
}
```

#### 2.2 Ajouter groupId aux posts existants

**`/data/posts.ts`** :

```typescript
// Exemple : Assigner quelques posts à des groupes
{
  id: 'posts/post-1',
  // ... autres champs
  groupId: 'g1', // Commission Culture
  suggestedToGroups: [], // Pas encore suggéré ailleurs
}
```

#### 2.3 Créer données de suggestions

**`/data/contentSuggestions.ts`** (nouveau fichier) :

```typescript
export const contentSuggestions: ContentSuggestion[] = [
  {
    id: 'cs1',
    contentId: 'ideas/1',
    contentType: 'idea',
    sourceGroupId: 'g1',
    targetGroupId: 'g2',
    suggestedBy: 'user-1',
    suggestedAt: new Date('2024-01-15T10:00:00'),
    status: 'accepted',
    message: 'Cette idée pourrait intéresser le groupe Culture Locale'
  },
  // ... autres suggestions
];
```

---

### 3. Store et Sélecteurs

#### 3.1 Ajouter au store

**`/store/SimpleEntityStore.tsx`** :

```typescript
interface SimpleEntityStore {
  // ... champs existants
  contentSuggestions: Record<string, ContentSuggestion>;
}

// Actions
const addContentSuggestion = (suggestion: ContentSuggestion) => { ... };
const updateContentSuggestion = (id: string, updates: Partial<ContentSuggestion>) => { ... };
```

#### 3.2 Nouveaux sélecteurs

**`/store/simpleSelectors.ts`** :

```typescript
// Suggestions
export const getAllContentSuggestions = (store) => { ... };
export const getSuggestionById = (store) => (id: string) => { ... };
export const getSuggestionsByTargetGroup = (store) => (groupId: string) => { ... };
export const getSuggestionsByContent = (store) => (contentId: string) => { ... };
export const getUserSuggestions = (store) => (userId: string) => { ... };

// Contenu par groupe (améliorer existants)
export const getGroupContent = (store) => (groupId: string) => {
  // Retourne tout le contenu d'un groupe (origine + suggéré)
  const ideas = getIdeasByGroup(store)(groupId);
  const posts = getPostsByGroup(store)(groupId);
  
  // Ajouter aussi le contenu suggéré
  const allIdeas = Object.values(store.ideas);
  const allPosts = Object.values(store.posts);
  
  const suggestedIdeas = allIdeas.filter(i => 
    i.suggestedToGroups?.includes(groupId)
  );
  const suggestedPosts = allPosts.filter(p => 
    p.suggestedToGroups?.includes(groupId)
  );
  
  return {
    originIdeas: ideas,
    originPosts: posts,
    suggestedIdeas,
    suggestedPosts,
    allIdeas: [...ideas, ...suggestedIdeas],
    allPosts: [...posts, ...suggestedPosts]
  };
};
```

---

### 4. Services API

#### 4.1 Créer service de suggestion

**`/api/suggestionService.ts`** (nouveau fichier) :

```typescript
import { ContentSuggestion } from '../types';

/**
 * Suggérer un contenu vers un groupe
 */
export async function suggestContentToGroup(
  contentId: string,
  contentType: 'idea' | 'post',
  targetGroupId: string,
  message?: string
): Promise<ContentSuggestion> {
  // Mock : créer suggestion auto-acceptée
  const suggestion: ContentSuggestion = {
    id: `cs-${Date.now()}`,
    contentId,
    contentType,
    targetGroupId,
    suggestedBy: 'current', // userId actuel
    suggestedAt: new Date(),
    status: 'accepted', // Auto-accepté pour Phase 5
    message
  };
  
  console.log('📤 [suggestionService.suggestContentToGroup] Suggestion créée:', suggestion);
  
  // Simuler délai API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return suggestion;
}

/**
 * Récupérer les suggestions d'un groupe
 */
export async function fetchGroupSuggestions(
  groupId: string
): Promise<ContentSuggestion[]> {
  console.log('📥 [suggestionService.fetchGroupSuggestions] GroupId:', groupId);
  
  // Mock : retourner suggestions du groupe
  // En vrai : API call
  
  await new Promise(resolve => setTimeout(resolve, 300));
  return [];
}
```

#### 4.2 Mettre à jour contentService

**`/api/contentService.ts`** :

Ajouter paramètre `groupId` optionnel aux fonctions de création :

```typescript
export async function createPost(
  content: string,
  tags?: string[],
  groupId?: string // 🆕
): Promise<Post> {
  // ... logique existante
  
  const newPost: Post = {
    // ... champs existants
    groupId, // 🆕 Assigner le groupe
  };
  
  return newPost;
}

export async function createIdea(
  title: string,
  description: string,
  groupId?: string // 🆕
): Promise<Idea> {
  // ... logique existante
  
  const newIdea: Idea = {
    // ... champs existants
    groupId, // 🆕 Assigner le groupe
  };
  
  return newIdea;
}
```

---

### 5. Hooks

#### 5.1 Créer hook pour suggestions

**`/hooks/useSuggestionActions.ts`** (nouveau fichier) :

```typescript
import { useEntityStoreSimple } from './useEntityStoreSimple';
import { suggestContentToGroup } from '../api/suggestionService';
import { toast } from 'sonner@2.0.3';

export function useSuggestionActions() {
  const store = useEntityStoreSimple();
  
  const suggestContent = async (
    contentId: string,
    contentType: 'idea' | 'post',
    targetGroupId: string,
    message?: string
  ) => {
    try {
      const suggestion = await suggestContentToGroup(
        contentId,
        contentType,
        targetGroupId,
        message
      );
      
      // Ajouter au store
      store.actions.addContentSuggestion(suggestion);
      
      // Mettre à jour le contenu avec suggestedToGroups
      if (contentType === 'idea') {
        const idea = store.getIdeaById(contentId);
        if (idea) {
          const newSuggestedGroups = [
            ...(idea.suggestedToGroups || []),
            targetGroupId
          ];
          store.actions.updateIdea(contentId, {
            suggestedToGroups: newSuggestedGroups
          });
        }
      } else {
        const post = store.getPostById(contentId);
        if (post) {
          const newSuggestedGroups = [
            ...(post.suggestedToGroups || []),
            targetGroupId
          ];
          store.actions.updatePost(contentId, {
            suggestedToGroups: newSuggestedGroups
          });
        }
      }
      
      toast.success('Contenu suggéré au groupe !');
      
    } catch (error) {
      console.error('❌ [useSuggestionActions] Erreur:', error);
      toast.error('Erreur lors de la suggestion');
    }
  };
  
  return { suggestContent };
}
```

#### 5.2 Exporter dans index.ts

**`/hooks/index.ts`** :

```typescript
export * from './useSuggestionActions';
```

---

### 6. Composants UI

#### 6.1 Badge "Groupe d'origine"

**`/components/GroupOriginBadge.tsx`** (nouveau) :

```tsx
import { Badge } from './ui/badge';
import { useEntityStoreSimple } from '../hooks';
import { Building2 } from 'lucide-react';

interface GroupOriginBadgeProps {
  groupId: string;
  size?: 'sm' | 'md';
  clickable?: boolean;
}

export function GroupOriginBadge({ 
  groupId, 
  size = 'md',
  clickable = true 
}: GroupOriginBadgeProps) {
  const { getGroupById } = useEntityStoreSimple();
  const group = getGroupById(groupId);
  
  if (!group) return null;
  
  const handleClick = () => {
    if (clickable) {
      window.location.href = `/groups/${groupId}`;
    }
  };
  
  return (
    <Badge
      variant="outline"
      className={`
        ${clickable ? 'cursor-pointer hover:bg-blue-50' : ''}
        ${size === 'sm' ? 'text-xs' : 'text-sm'}
      `}
      onClick={handleClick}
    >
      <Building2 className="w-3 h-3 mr-1" />
      {group.name}
    </Badge>
  );
}
```

#### 6.2 Dialog "Suggérer vers un groupe"

**`/components/SuggestToGroupDialog.tsx`** (nouveau) :

```tsx
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useEntityStoreSimple, useSuggestionActions } from '../hooks';
import { Search, Send } from 'lucide-react';

interface SuggestToGroupDialogProps {
  contentId: string;
  contentType: 'idea' | 'post';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuggestToGroupDialog({
  contentId,
  contentType,
  open,
  onOpenChange
}: SuggestToGroupDialogProps) {
  const { getAllGroups, getUserGroups, getCurrentUser } = useEntityStoreSimple();
  const { suggestContent } = useSuggestionActions();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const currentUser = getCurrentUser();
  const myGroups = currentUser ? getUserGroups(currentUser.id) : [];
  const allGroups = getAllGroups();
  
  // Filtrer les groupes
  const availableGroups = useMemo(() => {
    const groups = searchQuery 
      ? allGroups.filter(g => 
          g.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : myGroups; // Par défaut : mes groupes
      
    return groups.filter(g => g.isActive);
  }, [searchQuery, allGroups, myGroups]);
  
  const handleSuggest = async () => {
    if (!selectedGroupId || !currentUser?.isRegistered) return;
    
    setIsSending(true);
    try {
      await suggestContent(contentId, contentType, selectedGroupId, message);
      onOpenChange(false);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Suggérer vers un groupe</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un groupe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* Liste des groupes */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableGroups.map(group => (
              <div
                key={group.id}
                className={`
                  p-3 border rounded-lg cursor-pointer transition-colors
                  ${selectedGroupId === group.id 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'hover:bg-gray-50'
                  }
                `}
                onClick={() => setSelectedGroupId(group.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    {group.avatar || '📁'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{group.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {group.shortDescription}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Message optionnel */}
          <Textarea
            placeholder="Message pour les membres du groupe (optionnel)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
          
          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSuggest}
              disabled={!selectedGroupId || isSending}
            >
              <Send className="w-4 h-4 mr-2" />
              Suggérer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### 6.3 Sélecteur de groupe dans formulaires

**`/components/GroupSelector.tsx`** (nouveau) :

```tsx
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useEntityStoreSimple } from '../hooks';

interface GroupSelectorProps {
  value?: string;
  onChange: (groupId: string | undefined) => void;
  label?: string;
  description?: string;
  allowNone?: boolean;
}

export function GroupSelector({
  value,
  onChange,
  label = 'Publier dans un groupe',
  description = 'Optionnel - Ce contenu apparaîtra dans le feed du groupe',
  allowNone = true
}: GroupSelectorProps) {
  const { getUserGroups, getCurrentUser } = useEntityStoreSimple();
  const currentUser = getCurrentUser();
  const myGroups = currentUser ? getUserGroups(currentUser.id) : [];
  
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <Select
        value={value || 'none'}
        onValueChange={(val) => onChange(val === 'none' ? undefined : val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Aucun groupe" />
        </SelectTrigger>
        <SelectContent>
          {allowNone && (
            <SelectItem value="none">Aucun groupe (public)</SelectItem>
          )}
          {myGroups.map(group => (
            <SelectItem key={group.id} value={group.id}>
              {group.avatar} {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

---

### 7. Intégrations dans composants existants

#### 7.1 IdeaCard et PostCard

Ajouter le badge groupe d'origine :

```tsx
// Dans IdeaCard.tsx et PostCard.tsx
import { GroupOriginBadge } from './GroupOriginBadge';

// Dans le render :
{idea.groupId && (
  <GroupOriginBadge groupId={idea.groupId} size="sm" />
)}
```

#### 7.2 IdeaDetailPage et PostDetailPage

Ajouter bouton "Suggérer vers un groupe" :

```tsx
import { SuggestToGroupDialog } from './SuggestToGroupDialog';

// State
const [showSuggestDialog, setShowSuggestDialog] = useState(false);

// Bouton dans la page
<Button
  variant="outline"
  onClick={() => setShowSuggestDialog(true)}
>
  <Share className="w-4 h-4 mr-2" />
  Suggérer à un groupe
</Button>

// Dialog
<SuggestToGroupDialog
  contentId={idea.id}
  contentType="idea"
  open={showSuggestDialog}
  onOpenChange={setShowSuggestDialog}
/>
```

#### 7.3 CreateQuickPost

Ajouter sélecteur de groupe :

```tsx
import { GroupSelector } from './GroupSelector';

// State
const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(
  initialGroupId // Peut être passé en prop depuis GroupHubPage
);

// Dans le formulaire
<GroupSelector
  value={selectedGroupId}
  onChange={setSelectedGroupId}
/>

// Dans la soumission
await createPost(content, tags, selectedGroupId);
```

#### 7.4 CreateCompleteIdea

Ajouter sélecteur de groupe (même principe) :

```tsx
// Dans BasicIdeaForm ou section dédiée
<GroupSelector
  value={formData.groupId}
  onChange={(groupId) => setFormData({ ...formData, groupId })}
/>
```

#### 7.5 GroupHubPage - Boutons de création

Les boutons doivent pré-remplir le groupe :

```tsx
// Modifier les handlers
<Button onClick={() => {
  setShowCreateDialog(true);
  // Passer le groupId au dialog
}}>
  <MessageSquare className="w-4 h-4 mr-2" />
  Discussion
</Button>
```

---

### 8. Affichage dans le feed du groupe

#### 8.1 GroupHubPage - Onglets Projets/Discussions

Améliorer pour montrer :
- Contenu d'origine (créé dans ce groupe)
- Contenu suggéré (partagé depuis d'autres groupes)

```tsx
// Dans GroupHubPage.tsx

const { getGroupContent } = useEntityStoreSimple();
const groupContent = groupId ? getGroupContent(groupId) : null;

// Dans l'onglet Projets
<TabsContent value="projets">
  {/* Section : Projets du groupe */}
  {groupContent.originIdeas.length > 0 && (
    <div className="space-y-4 mb-8">
      <h3 className="text-sm font-medium text-gray-600">
        Projets créés dans ce groupe
      </h3>
      {groupContent.originIdeas.map(idea => (
        <IdeaCard key={idea.id} idea={idea} />
      ))}
    </div>
  )}
  
  {/* Section : Projets suggérés */}
  {groupContent.suggestedIdeas.length > 0 && (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-600">
        Projets suggérés
      </h3>
      {groupContent.suggestedIdeas.map(idea => (
        <div key={idea.id}>
          <IdeaCard idea={idea} />
          <p className="text-xs text-muted-foreground mt-1">
            Suggéré depuis {idea.groupId ? getGroupById(idea.groupId)?.name : 'le feed général'}
          </p>
        </div>
      ))}
    </div>
  )}
</TabsContent>
```

---

## 🎨 UI/UX Considérations

### Badge Groupe d'origine

- **Couleur** : Bleu clair avec icône Building2
- **Position** : Sous le titre, avec les autres badges (tags, statut)
- **Cliquable** : Oui → redirige vers la page du groupe
- **Tooltip** : "Publié dans [nom du groupe]"

### Dialog "Suggérer vers un groupe"

- **Recherche** : Par défaut affiche "Mes groupes", puis recherche globale
- **Sélection** : Click sur une card de groupe
- **Message** : Optionnel, pour expliquer pourquoi la suggestion
- **Feedback** : Toast "Contenu suggéré au groupe !"

### Sélecteur de groupe (création)

- **Position** : Section "Publication", après description/contenu
- **Label** : "Publier dans un groupe (optionnel)"
- **Description** : "Ce contenu apparaîtra dans le feed du groupe"
- **Valeur par défaut** : 
  - Aucun groupe si création depuis feed général
  - Groupe actuel si création depuis GroupHubPage

---

## 📊 Récapitulatif des fonctionnalités

### Pour les utilisateurs

✅ **Créer du contenu dans un groupe spécifique**
- Sélecteur de groupe dans les formulaires de création
- Badge visible sur le contenu

✅ **Suggérer du contenu vers un groupe**
- Bouton "Suggérer à un groupe" sur chaque post/projet
- Dialog de sélection avec recherche
- Message optionnel

✅ **Voir l'origine d'un contenu**
- Badge groupe sur les cards
- Click → navigation vers le groupe

✅ **Feed de groupe enrichi**
- Contenu créé dans le groupe
- Contenu suggéré au groupe (section séparée)

### Pour les animateurs

✅ **Vue d'ensemble du contenu du groupe**
- Onglets Projets / Discussions
- Distinction origine vs suggéré

✅ **Encourager la création**
- Boutons de création pré-remplis avec le groupe

---

## 🧪 Tests à effectuer

### Création avec groupe

- [ ] Créer post avec groupe → visible dans feed groupe
- [ ] Créer projet avec groupe → visible dans projets groupe
- [ ] Créer post sans groupe → visible seulement feed général
- [ ] Badge groupe affiché correctement

### Suggestion

- [ ] Suggérer post vers groupe
- [ ] Suggérer projet vers groupe
- [ ] Contenu suggéré visible dans feed groupe
- [ ] Indication "Suggéré depuis..." affichée

### Navigation

- [ ] Click badge groupe → page du groupe
- [ ] Feed groupe affiche contenu origine + suggéré
- [ ] Sections séparées clairement

### Boutons de création depuis groupe

- [ ] Bouton "Discussion" depuis GroupHubPage → pré-remplit groupe
- [ ] Bouton "Projet" depuis GroupHubPage → pré-remplit groupe
- [ ] Création effective avec le bon groupId

---

## 📝 Notes

### Auto-acceptation (Phase 5)

Pour simplifier, les suggestions sont **auto-acceptées** en Phase 5.
La validation par animateurs viendra en **Phase 6** avec :
- Status `pending` par défaut
- Onglet "Suggestions en attente" pour animateurs
- Actions Accepter/Refuser

### Compatibilité

Le champ `groupId` est optionnel, donc :
- Tout le contenu existant continue de fonctionner
- Nouveau contenu peut avoir ou non un groupe
- Pas de migration nécessaire

---

## 🎯 Résultat attendu

À la fin de la Phase 5, les groupes seront **complètement intégrés** :

✅ Contenu peut être créé dans un groupe
✅ Contenu peut être suggéré vers d'autres groupes
✅ Badge d'origine visible partout
✅ Feed de groupe montre origine + suggestions
✅ Navigation fluide contenu ↔ groupes
✅ Formulaires de création avec sélecteur de groupe

**Le système IdeoSphere est maintenant centré sur les groupes** tout en gardant la flexibilité du feed général !

---

*Document créé le 1er novembre 2025*
