# IdeoSphere

**Plateforme collaborative** de collecte et discussion d'idées citoyennes avec système de notation sur trois critères et organisation en groupes.

---

## 🎯 Fonctionnalités principales

### Contenu
- **Projets** (Idées) : Propositions structurées avec description détaillée et évaluation multi-critères
- **Discussions** (Posts) : Messages courts et réactifs pour échanger rapidement
- **Transformations** : Tout contenu peut évoluer (post → projet, améliorations, dérivations)

### Groupes
- **4 types** : Communauté, Équipe, Projet, Local
- **Création collaborative** : Noyau initial de 3 personnes minimum
- **Liens entre groupes** : Hiérarchiques (parent/enfant) ou de collaboration
- **Interface moderne** : 3 onglets (Projets, Discussions, Réseau)

### Évaluation
- **3 critères** de notation sur chaque projet
- **Discussions** associées aux idées
- **Soutiens** pour les discussions

---

## 🏗️ Architecture

### Principes Fondamentaux

1. **Source Unique de Vérité** : 
   - **Navigation** : URLs (React Router)
   - **Données** : SimpleEntityStore
2. **Communication Stricte** : Composants → Hooks → API Services → Données
3. **Chargement Progressif** : Feed minimal, puis détails à la demande
4. **Deep Linking** : Toutes les pages accessibles via URL directe

### Flow unidirectionnel

```
Composants React
    ↓
React Router + useEntityStoreSimple
    ↓
API Services
    ↓
Données Mockées
```

---

## 📁 Structure du projet

```
/components     # Composants React
  /group        # Composants spécifiques aux groupes
  /create-idea  # Formulaires de création
  /ui           # Composants shadcn/ui
  
/api            # Services API (mockés)
/data           # Données mockées
/hooks          # Hooks personnalisés
/store          # Store global SimpleEntityStore
/types          # Types TypeScript
/router         # Configuration routes
/docs           # Documentation technique
```

---

## 🚀 Système de groupes

| Phase | Description | Statut |
|-------|-------------|--------|
| Phase 1 | Fondations & Annuaire | ✅ Terminée |
| Phase 2 | Création (Noyau Initial) | ✅ Terminée |
| Phase 3 | Gestion des groupes | ✅ Terminée |
| Phase 4 | Liens entre groupes | ✅ Terminée |
| **Phase 5** | **Intégration complète** | **📋 En cours** |
| Phase 6 | Politiques d'accès | 🔜 À venir |
| Phase 7 | Polish & Optimisations | 🔜 À venir |

**Voir** `/GROUPES_SYNTHESE.md` pour la vue d'ensemble complète.

---

## 📚 Documentation

### Groupes (nouveau)
- **`/GROUPES_SYNTHESE.md`** ⭐ - Vue d'ensemble du système de groupes
- **`/PHASE5_INTEGRATION_GROUPES.md`** - Plan détaillé Phase 5
- **`/PHASE4_COMPLETE.md`** - Système de liens entre groupes
- **`/GROUPE_UI_REVISION.md`** - Refonte interface de groupe

### Architecture
- **`/ARCHITECTURE.md`** - Vue d'ensemble complète
- **`/ETAT_PROJET.md`** ⭐ - État général du projet
- **`/store/README.md`** - Gestion de l'état
- **`/hooks/README.md`** - Interface avec le store
- **`/api/README.md`** - Couche de services

### Routing et Navigation
- **`/docs/ROUTING.md`** ⭐ - Guide complet React Router
- **`/docs/DATA_FLOW.md`** - Circulation des données
- **`/docs/API_CALLS_PATTERN.md`** - Conventions d'appel

### Plans de Migration
- **`/PLANS_MIGRATION_INDEX.md`** - Index de tous les plans
- **`/PLAN_MIGRATION_REFACTORING.md`** - Refactoring 7 phases
- **`/PLAN_MIGRATION_UNKNOWN_USER.md`** - Centralisation unknownUser

---

## 🧭 Navigation principale

### Pages publiques
- `/` - Accueil / Feed général
- `/groups` - Annuaire des groupes
- `/groups/:id` - Page d'un groupe (Projets, Discussions, Réseau)
- `/ideas/:id` - Détails d'un projet
- `/posts/:id` - Détails d'une discussion

### Pages utilisateur
- `/profile` - Mon profil
- `/my-ideas` - Mes contributions
- `/groups/my` - Mes groupes
- `/create/idea` - Créer un projet

### Gestion (animateurs)
- `/groups/:id/manage` - Gérer un groupe
- `/groups/pending/:id` - Groupe en attente de confirmation

---

## 🎨 Stack technique

- **React** + TypeScript
- **Tailwind CSS** v4.0
- **shadcn/ui** - Composants UI
- **React Router** v6 - Navigation
- **Zustand** - State management (SimpleEntityStore)
- **Lucide React** - Icônes

---

## 🚀 Démarrage

```bash
# Installation des dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

---

## 🎯 Phase 5 : Intégration des groupes (en cours)

La Phase 5 intègre complètement les groupes au reste du système :

### Objectifs
- ✅ Champ `groupId` sur tout le contenu (groupe d'origine)
- ✅ Système de suggestions vers des groupes
- ✅ Badge d'origine visible sur le contenu
- ✅ Sélecteur de groupe dans les formulaires de création
- ✅ Feed de groupe avec contenu suggéré

### Nouveaux composants
- `GroupOriginBadge` - Badge cliquable d'origine
- `SuggestToGroupDialog` - Dialog pour suggérer vers un groupe
- `GroupSelector` - Sélection de groupe dans formulaires

**Plan détaillé** : `/PHASE5_INTEGRATION_GROUPES.md`

---

## 📊 État actuel

✅ **Système de base** : Fonctionnel et robuste  
✅ **Groupes** : 4 phases complétées  
✅ **Interface** : Moderne et intuitive  
✅ **Navigation** : Fluide et responsive  
✅ **Mode invité** : Accès complet en lecture  

Le système est prêt pour la Phase 5 ! 🚀

---

## 🧑‍💻 Règles de développement

### ✅ À Faire

- **Toujours** passer par `useEntityStoreSimple` pour accéder aux données
- **Toujours** utiliser les actions du store pour modifier l'état
- Protéger les propriétés optionnelles avec `?.` ou `|| []`
- Utiliser le chargement progressif : feed minimal puis détails à la demande

### ❌ À Éviter

- Accéder directement aux données mockées depuis les composants
- Créer des états locaux pour des données déjà dans le store
- Charger toutes les données d'un coup
- Muter directement le store (toujours passer par les actions)

---

## 📝 Exemple d'utilisation

```tsx
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';

function MyComponent() {
  const { 
    getCurrentUser, 
    getAllIdeas, 
    actions 
  } = useEntityStoreSimple();

  const user = getCurrentUser();
  const ideas = getAllIdeas();

  const handleSupport = (ideaId: string) => {
    actions.toggleIdeaSupport(ideaId);
  };

  return (
    <div>
      {ideas.map(idea => (
        <div key={idea.id}>
          {idea.title}
          <button onClick={() => handleSupport(idea.id)}>
            Soutenir
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

*IdeoSphere - Plateforme collaborative d'intelligence collective*
