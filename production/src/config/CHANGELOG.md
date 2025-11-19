# Changelog - Configuration Client

Ce fichier documente les changements majeurs apportés au système de configuration d'IdeoSphere.

---

## [1.0.0] - Novembre 2025

### 🎉 Configuration basée sur l'URL - Migration majeure

#### Ajouté

- **Architecture multi-client** : Le système charge désormais la configuration en fonction de l'URL (sous-domaine)
- **Fichier `/config/types.ts`** : Interface TypeScript `ClientConfig` pour garantir la cohérence de toutes les configurations
- **Fichier `/config/clientConfig.ts`** : Gestionnaire principal avec fonction `getClientConfig()` qui extrait le sous-domaine et charge la bonne configuration
- **Dossier `/config/clients/`** : Contient les fichiers de configuration séparés par client
  - `default.ts` : Configuration par défaut (mairie)
  - `listeCitoyenne.ts` : Configuration pour listes citoyennes
  - `_template.ts.example` : Template pour créer de nouvelles configurations
- **Documentation** :
  - `/config/CONFIG_URL_BASED.md` : Guide complet du système de configuration basée sur l'URL
  - Mise à jour de `/config/README.md` avec la nouvelle architecture

#### Modifié

- **`/config/clientConfig.ts`** : Transformé d'un fichier de configuration unique en gestionnaire multi-configurations
  - Fonction `getClientConfig()` : Récupère la config selon le sous-domaine
  - Export `currentConfig` : Instance prête à l'emploi de la configuration active
  - Helpers : Toutes les fonctions utilitaires sont maintenant dynamiques (appellent `getClientConfig()`)

#### Structure de migration

**AVANT (fichier unique)** :
```
/config
└── clientConfig.ts  (config monolithique)
```

**APRÈS (multi-clients)** :
```
/config
├── types.ts                    # Interface TypeScript
├── clientConfig.ts             # Gestionnaire (routage URL → config)
└── clients/
    ├── default.ts              # Config mairie
    ├── listeCitoyenne.ts       # Config liste citoyenne
    └── _template.ts.example    # Template
```

#### Compatibilité

✅ **100% rétrocompatible** : Tous les imports existants continuent de fonctionner :

```typescript
// Ces imports fonctionnent toujours
import { clientConfig } from '../config/clientConfig';
import { getMemberTerm, getCityName } from '../config/clientConfig';

// Nouveau (recommandé)
import { currentConfig } from '../config/clientConfig';
```

#### Mapping sous-domaines

| Sous-domaine | Configuration chargée |
|--------------|----------------------|
| `localhost`, `alpha`, `demo` | `defaultConfig` (mairie) |
| `liste`, `demo-liste`, `liste-citoyenne` | `listeCitoyenneConfig` |
| Autre | `defaultConfig` (fallback) |

#### Nouvelles configurations

**Configuration "Liste Citoyenne"** :
- Terminologie : membres, liste citoyenne, participation collective
- Types de groupes : Commission thématique, Action collective, Groupe local, Groupe de travail
- Ton : Militant, orienté co-construction de programme politique
- Newsletters : Activées par défaut
- Localisation : "Notre Commune"

**Différences clés avec la config par défaut** :
- Hero : "Co-construisons ensemble notre programme politique"
- CTA : "Co-construction du programme, Décisions collectives"
- Examples : Adaptés au contexte politique local
- Footer links : "Notre liste citoyenne", "Comment participer", "Charte de participation"

#### Type de client ajouté

Nouveau type dans `ClientType` :
```typescript
export type ClientType = 'mairie' | 'entreprise' | 'association' | 'ong' | 'listeCitoyenne';
```

---

## [0.9.0] - Avant novembre 2025

### Configuration unique centralisée

- Fichier unique `/config/clientConfig.ts`
- Terminologie pour mairie (citoyens, commune)
- Pas de système multi-client
- Export direct de `clientConfig`

---

## Migration des composants

**Aucun changement nécessaire** dans les composants existants. Tous les imports continuent de fonctionner :

- ✅ `AboutPage.tsx`
- ✅ `AppHeader.tsx`
- ✅ `CitizenWelcome.tsx`
- ✅ `CreateGroupFlow.tsx`
- ✅ `CreateQuickPost.tsx`
- ✅ `Footer.tsx`
- ✅ `GroupManagePage.tsx`
- ✅ `IdeaDiscussionsTab.tsx`
- ✅ Tous les autres composants

---

## Guide d'ajout d'une nouvelle configuration

1. **Créer le fichier de configuration** : `/config/clients/monClient.ts`
   - Utilisez `_template.ts.example` comme base
   - Respectez l'interface `ClientConfig`

2. **Importer dans `clientConfig.ts`** :
   ```typescript
   import { monClientConfig } from './clients/monClient';
   
   const configs: Record<string, ClientConfig> = {
     // ... configs existantes
     'mon-sous-domaine': monClientConfig,
   };
   ```

3. **Tester** : Accéder à `http://mon-sous-domaine.ideosphere.community`

---

## Notes techniques

### Gestion du SSR (Server-Side Rendering)

La fonction `getClientConfig()` détecte si elle est appelée côté serveur :

```typescript
if (typeof window === 'undefined') {
  return configs['default'];
}
```

Cela garantit que le build Next.js/Vite ne plante pas.

### Performance

- La configuration est chargée **une seule fois** au moment de l'import du module
- Pas de rechargement dynamique à chaque render
- L'export `currentConfig` est calculé immédiatement

### Limites actuelles

- Les configurations sont **statiques** (fichiers TypeScript compilés dans le bundle)
- Pas de modification de config sans redéploiement
- Toutes les configs sont incluses dans le bundle (pas de code-splitting par client)

### Évolutions futures possibles

- Configuration stockée en base de données (Supabase)
- Interface d'administration pour gérer les configs
- Code-splitting par client pour réduire la taille du bundle
- Configuration hybride (base statique + surcharges dynamiques)

---

**Contributeurs** : Équipe IdeoSphere  
**Documentation** : `/config/README.md`, `/config/CONFIG_URL_BASED.md`
