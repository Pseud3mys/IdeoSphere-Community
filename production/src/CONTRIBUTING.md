# 🤝 Guide de Contribution - IdeoSphere

Merci de votre intérêt pour contribuer à IdeoSphere ! Ce guide vous explique comment participer efficacement au développement.

## 🌟 Types de Contributions

### 🐛 Rapports de Bugs
- Utilisez les issues GitHub avec le label `bug`
- Incluez les étapes de reproduction
- Précisez votre environnement (OS, navigateur, version)

### ✨ Nouvelles Fonctionnalités  
- Ouvrez d'abord une issue `feature-request` pour discussion
- Décrivez le cas d'usage et la valeur ajoutée
- Proposez une approche technique si possible

### 📚 Documentation
- Améliorations des guides existants
- Nouvelles sections dans le wiki
- Correction des typos et clarifications

### 🎨 UI/UX
- Améliorations de l'interface utilisateur
- Nouvelles interactions ou animations
- Optimisations d'accessibilité

## 🚀 Workflow de Développement

### 1. Setup Initial
```bash
# Fork et clone du repository
git clone https://github.com/votre-username/ideosphere.git
cd ideosphere

# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev
```

### 2. Création d'une Branche
```bash
# Branche depuis main pour features
git checkout -b feature/nom-de-la-fonctionnalite

# Branche depuis main pour fixes
git checkout -b fix/description-du-probleme

# Branche depuis main pour docs
git checkout -b docs/sujet-documentation
```

### 3. Développement
```bash
# Tests pendant le développement
npm run type-check    # Vérification TypeScript
npm run build        # Test du build production

# Commit avec convention
git commit -m "feat: ajouter système de notifications"
git commit -m "fix: corriger bug navigation mobile"
git commit -m "docs: améliorer guide technique"
```

### 4. Pull Request
1. **Push** votre branche vers votre fork
2. **Ouvrir** une PR vers `main` avec :
   - Description claire des changements
   - Screenshots pour les changements UI
   - Référence aux issues liées (`Fixes #123`)
3. **Répondre** aux commentaires de review
4. **Merge** après approbation

## 📋 Standards de Code

### TypeScript
```typescript
// ✅ Bon : Types explicites et interfaces
interface ComponentProps {
  idea: Idea;
  onSupport?: (ideaId: string) => void;
  variant?: 'default' | 'compact';
}

// ❌ Éviter : any et types implicites
const component = (props: any) => { /* ... */ };
```

### React Components
```typescript
// ✅ Pattern recommandé
const IdeaCard: React.FC<ComponentProps> = ({ 
  idea, 
  onSupport,
  variant = 'default'
}) => {
  const { actions } = useEntityStoreSimple();
  
  const handleSupport = useCallback(() => {
    onSupport?.(idea.id) ?? actions.supportIdea(idea.id);
  }, [idea.id, onSupport, actions]);
  
  return (
    <Card className={cn("border-gray-200", {
      "p-4": variant === 'compact'
    })}>
      {/* Contenu */}
    </Card>
  );
};
```

### Hooks Personnalisés
```typescript
// ✅ Hook bien structuré
const useIdeaActions = (ideaId: string) => {
  const { actions, getIdeaById } = useEntityStoreSimple();
  
  const idea = useMemo(() => getIdeaById(ideaId), [getIdeaById, ideaId]);
  
  const support = useCallback(() => {
    actions.supportIdea(ideaId);
  }, [actions, ideaId]);
  
  return { idea, support };
};
```

### CSS et Styling
```typescript
// ✅ Utiliser les tokens du design system
<div className="text-gray-900 bg-primary/10 border-primary/20">

// ✅ Classes conditionnelles avec cn()
<Button className={cn("w-full", {
  "bg-primary": isActive,
  "bg-gray-100": !isActive
})}>

// ❌ Éviter les styles inline
<div style={{ color: '#4f75ff' }}>
```

## 🧪 Tests et Qualité

### Vérifications Automatiques
```bash
# Avant chaque commit
npm run type-check    # Types TypeScript
npm run build        # Build production
```

### Tests Manuels
- [ ] Navigation entre toutes les pages
- [ ] Actions CRUD (créer, lire, modifier, supprimer)
- [ ] Interactions utilisateur (like, support, évaluation)
- [ ] Responsive design (desktop + mobile)
- [ ] Comptes de démo fonctionnels

### Accessibilité
- [ ] Navigation au clavier
- [ ] Contrastes suffisants  
- [ ] Textes alternatifs pour images
- [ ] Labels appropriés pour formulaires

## 🏗️ Architecture et Patterns

### Store d'Entités
```typescript
// ✅ Sélecteur optimisé
const getFilteredIdeas = useMemo(() => 
  Object.values(store.ideas)
    .filter(idea => idea.status === 'published')
    .sort((a, b) => b.supportCount - a.supportCount)
, [store.ideas]);

// ✅ Action immutable
const updateIdea = (ideaId: string, updates: Partial<Idea>) => {
  setStore(prev => ({
    ...prev,
    ideas: {
      ...prev.ideas,
      [ideaId]: { ...prev.ideas[ideaId], ...updates }
    }
  }));
};
```

### Composants Modulaires
```
components/
├── ui/              # Composants de base réutilisables
├── forms/           # Formulaires spécialisés
├── cards/           # Cartes d'affichage
├── dialogs/         # Modals et dialogues
└── pages/           # Pages complètes
```

### Gestion des Erreurs
```typescript
// ✅ Pattern de gestion d'erreurs
const safeAction = async (action: () => Promise<void>) => {
  try {
    await action();
    toast.success('Action réussie !');
  } catch (error) {
    console.error('Action failed:', error);
    toast.error('Une erreur est survenue');
  }
};
```

## 📝 Documentation

### Code Comments
```typescript
// ✅ Commentaires utiles
/**
 * Calcule le score moyen d'une idée pour un critère donné.
 * Gère automatiquement les votes multiples par utilisateur.
 */
const calculateAverageRating = (idea: Idea, criterionId: string): number => {
  // Filtrer les évaluations pour ce critère
  const relevantRatings = idea.ratings.filter(r => r.criterionId === criterionId);
  
  if (relevantRatings.length === 0) return 0;
  
  // ❌ Éviter : Commentaires évidents
  // Diviser la somme par le nombre d'éléments
  return relevantRatings.reduce((sum, r) => sum + r.value, 0) / relevantRatings.length;
};
```

### README et Guides
- Utilisez des exemples concrets
- Incluez des captures d'écran pour les UI
- Maintenez la cohérence avec le style existant
- Testez les instructions sur un environnement propre

## 🎯 Priorités Actuelles

### High Priority
- [ ] Système de recherche avancée
- [ ] Notifications en temps réel  
- [ ] Amélioration des performances
- [ ] Tests automatisés

### Medium Priority
- [ ] Mode sombre
- [ ] Export des idées (PDF, Markdown)
- [ ] Système de favoris
- [ ] Analytics utilisateur

### Nice to Have
- [ ] PWA (Progressive Web App)
- [ ] Intégration sociale étendue
- [ ] Édition collaborative temps réel
- [ ] API publique

## 🚫 Ce Qu'il Faut Éviter

### Code
```typescript
// ❌ Mutations directes du store
store.ideas[ideaId].supportCount++;

// ❌ Any types
const handleClick = (data: any) => { /* ... */ };

// ❌ Logique complexe dans les composants
const ComplexComponent = () => {
  // 50 lignes de logique métier...
  return <div>...</div>;
};
```

### Commits
```bash
# ❌ Messages vagues
git commit -m "fix stuff"
git commit -m "updates"

# ❌ Commits trop gros
# (100+ fichiers changés en un commit)
```

### Pull Requests
- ❌ PR sans description
- ❌ Changements non liés mélangés
- ❌ Breaking changes sans documentation
- ❌ Code non testé

## 🎉 Reconnaissance

Les contributeurs sont reconnus via :
- 📝 Mentions dans le CHANGELOG
- 🏆 Hall of Fame dans le README
- 💬 Remerciements sur Discord/réseaux
- 🎁 Stickers IdeoSphere (pour contributions significatives)

## 📞 Besoin d'Aide ?

- 💬 **Discord** : [discord.gg/ideosphere](https://discord.gg/ideosphere)
- 📧 **Email** : contribute@ideosphere.org
- 🐛 **Issues** : GitHub Issues pour questions techniques
- 📚 **Wiki** : Documentation détaillée

---

**Merci de contribuer à démocratiser l'intelligence collective ! 🚀**