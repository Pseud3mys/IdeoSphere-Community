# Configuration basée sur l'URL - IdeoSphere

## Vue d'ensemble

IdeoSphere utilise un **système de configuration dynamique basé sur l'URL** qui permet de servir différentes configurations client à partir d'une seule instance de l'application. Le sous-domaine de l'URL détermine automatiquement quelle configuration charger.

---

## 🎯 Objectif

Permettre de déployer **une seule instance** d'IdeoSphere pour **plusieurs clients différents**, chacun avec sa propre identité, terminologie et paramètres, sans dupliquer le code.

---

## 🏗️ Architecture

### Structure des fichiers

```
/config
├── types.ts                    # Interface TypeScript (ClientConfig)
├── clientConfig.ts             # Gestionnaire principal (routage URL → config)
└── clients/
    ├── default.ts              # Configuration par défaut (mairie)
    └── listeCitoyenne.ts       # Configuration liste citoyenne
```

### Flux de chargement

```
1. L'utilisateur accède à une URL (ex: liste.ideosphere.community)
   ↓
2. clientConfig.ts extrait le sous-domaine ("liste")
   ↓
3. Le mapping configs['liste'] retourne listeCitoyenneConfig
   ↓
4. La configuration est exportée comme currentConfig
   ↓
5. Les composants utilisent currentConfig pour afficher les textes
```

---

## 📝 Mapping URL → Configuration

### Fichier `/config/clientConfig.ts`

```typescript
const configs: Record<string, ClientConfig> = {
  // Configuration par défaut
  'default': defaultConfig,
  'localhost': defaultConfig,
  'alpha': defaultConfig,
  'demo': defaultConfig,
  
  // Configuration liste citoyenne
  'liste': listeCitoyenneConfig,
  'demo-liste': listeCitoyenneConfig,
  'liste-citoyenne': listeCitoyenneConfig,
};
```

### Exemples d'URLs

| URL | Sous-domaine extrait | Configuration chargée |
|-----|---------------------|----------------------|
| `http://localhost:3000` | `localhost` | `defaultConfig` |
| `https://alpha.ideosphere.community` | `alpha` | `defaultConfig` |
| `https://demo.ideosphere.community` | `demo` | `defaultConfig` |
| `https://liste.ideosphere.community` | `liste` | `listeCitoyenneConfig` |
| `https://demo-liste.ideosphere.community` | `demo-liste` | `listeCitoyenneConfig` |
| `https://xyz.ideosphere.community` | `xyz` | `defaultConfig` (fallback) |

---

## ➕ Ajouter une nouvelle configuration client

### Étape 1 : Créer le fichier de configuration

Créez `/config/clients/entreprise.ts` :

```typescript
import { ClientConfig } from '../types';

export const entrepriseConfig: ClientConfig = {
  identity: {
    appName: 'InnoLab',
    appTagline: 'L\'innovation par tous, pour tous',
    appDescriptionShort: 'Plateforme d\'innovation collaborative pour notre entreprise.',
    appMission: 'InnoLab est la plateforme d\'innovation collaborative de notre entreprise...',
    projectStatus: 'Plateforme collaborative interne',
    copyright: '© 2025 Notre Entreprise. Usage interne.',
  },

  clientType: 'entreprise',
  
  terminology: {
    member: {
      singular: 'collaborateur',
      singularFeminine: 'collaboratrice',
      plural: 'collaborateurs',
    },
    organization: {
      singular: 'entreprise',
      plural: 'entreprises',
    },
    territory: {
      local: 'équipe',
    },
    participation: {
      adjective: 'collaborative',
    },
    location: {
      cityName: 'Notre Entreprise',
      enabled: false, // Pas de localisation géographique pour une entreprise
    },
  },

  // ... reste de la configuration (copier depuis default.ts et adapter)
};
```

### Étape 2 : Importer dans clientConfig.ts

Modifiez `/config/clientConfig.ts` :

```typescript
import { ClientConfig } from './types';
import { defaultConfig } from './clients/default';
import { listeCitoyenneConfig } from './clients/listeCitoyenne';
import { entrepriseConfig } from './clients/entreprise'; // ← Ajout

const configs: Record<string, ClientConfig> = {
  'default': defaultConfig,
  'localhost': defaultConfig,
  'alpha': defaultConfig,
  
  'liste': listeCitoyenneConfig,
  'demo-liste': listeCitoyenneConfig,
  
  // ← Ajout
  'entreprise': entrepriseConfig,
  'demo-entreprise': entrepriseConfig,
  'innolab': entrepriseConfig,
};
```

### Étape 3 : Tester

Accédez à `https://entreprise.ideosphere.community` et votre nouvelle configuration sera chargée automatiquement ! 🎉

---

## 🔧 Fonctionnement technique

### Extraction du sous-domaine

```typescript
export const getClientConfig = (): ClientConfig => {
  // Vérifier si on est côté serveur (lors du build)
  if (typeof window === 'undefined') {
    return configs['default'];
  }

  // Récupère le hostname (ex: "alpha.ideosphere.community" ou "localhost")
  const hostname = window.location.hostname;

  // Extrait le sous-domaine (la partie avant le premier point)
  const subdomain = hostname.split('.')[0];

  // Retourne la config du sous-domaine, ou la config par défaut si inconnu
  return configs[subdomain] || configs['default'];
};
```

### Gestion du build côté serveur

Pendant le build (SSR), `window` n'existe pas. La fonction retourne toujours `defaultConfig` pour éviter les erreurs. La vraie configuration est chargée côté client lors du premier rendu.

### Instance prête à l'emploi

```typescript
export const currentConfig = getClientConfig();
```

Cette instance est calculée **au moment de l'import du module**. Dans un environnement React, elle sera recalculée au premier rendu côté client.

---

## 📚 Utilisation dans les composants

### Import de la configuration

```typescript
import { currentConfig } from '../config/clientConfig';

// Accès direct
console.log(currentConfig.identity.appName);
console.log(currentConfig.terminology.member.plural);
```

### Utilisation des helpers

```typescript
import { getMemberTerm, getCityName, getGroupTypes } from '../config/clientConfig';

// Dans un composant
function MonComposant() {
  return (
    <div>
      <h1>Bienvenue {getMemberTerm({ plural: true })} !</h1>
      <p>Ville : {getCityName()}</p>
      <ul>
        {getGroupTypes().map(type => (
          <li key={type.id}>{type.label}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🎨 Différences entre les configurations

### Configuration par défaut (Mairie)

- **Terminologie** : citoyens, commune, participation citoyenne
- **Localisation** : Activée (Le Blanc)
- **Types de groupes** : Communauté, Projet, Local, Défi
- **Ton** : Institutionnel, orienté service public

### Configuration Liste Citoyenne

- **Terminologie** : membres, liste citoyenne, participation collective
- **Localisation** : Activée (Notre Commune)
- **Types de groupes** : Commission thématique, Action collective, Groupe local, Groupe de travail
- **Ton** : Militant, orienté co-construction de programme politique

---

## ⚠️ Points d'attention

### 1. **Respect de l'interface TypeScript**

Toute nouvelle configuration **doit respecter l'interface `ClientConfig`** définie dans `/config/types.ts`. TypeScript vous alertera si des champs sont manquants.

### 2. **Cohérence de la terminologie**

Assurez-vous que la terminologie est cohérente dans **tous les champs** de la configuration :
- Placeholders
- Exemples
- Messages système
- Descriptions

### 3. **Fallback vers default**

Si un sous-domaine n'est pas mappé, la configuration par défaut sera chargée. C'est un comportement voulu pour éviter les erreurs.

### 4. **Build statique**

Le build Next.js/Vite génère un bundle unique. La configuration est chargée **dynamiquement côté client** en fonction de l'URL. Il n'y a pas de build séparé par client.

---

## 🚀 Déploiement

### Configuration DNS

Pour chaque client, configurez un enregistrement DNS pointant vers votre serveur :

```
alpha.ideosphere.community        → A     51.120.123.45
liste.ideosphere.community        → A     51.120.123.45
entreprise.ideosphere.community   → A     51.120.123.45
```

Tous les sous-domaines pointent vers la **même instance** de l'application. C'est le code qui détermine quelle configuration charger.

### Variables d'environnement (optionnel)

Si vous souhaitez des configurations encore plus dynamiques (ex: API différentes par client), vous pouvez combiner cette approche avec des variables d'environnement :

```typescript
export const getClientConfig = (): ClientConfig => {
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];
  
  // Récupérer une config API spécifique si besoin
  const apiUrl = import.meta.env[`VITE_API_URL_${subdomain.toUpperCase()}`];
  
  return configs[subdomain] || configs['default'];
};
```

---

## 📖 Exemples d'usage

### Exemple 1 : Afficher le nom de l'app dans le header

```tsx
import { currentConfig } from '../config/clientConfig';

function AppHeader() {
  return (
    <header>
      <h1>{currentConfig.identity.appName}</h1>
      <p>{currentConfig.identity.appTagline}</p>
    </header>
  );
}
```

### Exemple 2 : Adapter les placeholders

```tsx
import { currentConfig } from '../config/clientConfig';

function CreatePostForm() {
  return (
    <textarea 
      placeholder={currentConfig.examples.post.contentPlaceholder}
    />
  );
}
```

### Exemple 3 : Afficher les types de groupes

```tsx
import { getGroupTypes } from '../config/clientConfig';

function GroupTypeSelector() {
  const groupTypes = getGroupTypes();
  
  return (
    <select>
      {groupTypes.map(type => (
        <option key={type.id} value={type.id}>
          {type.icon} {type.label}
        </option>
      ))}
    </select>
  );
}
```

---

## 🔮 Évolutions futures

### Configuration stockée en base de données

Au lieu de fichiers TypeScript, les configurations pourraient être stockées dans Supabase :

```sql
CREATE TABLE client_configs (
  id UUID PRIMARY KEY,
  subdomain TEXT UNIQUE NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Avantages :
- Modification de config sans redéploiement
- Interface d'administration pour gérer les configs
- Historique des modifications

### Configuration hybride

Combiner configuration statique (pour les textes) et configuration dynamique (pour les intégrations, API, thèmes) :

```typescript
const baseConfig = defaultConfig;
const dynamicConfig = await fetchClientConfig(subdomain);

return { ...baseConfig, ...dynamicConfig };
```

---

## 📞 Support

Pour toute question sur la configuration multi-client :

- **Documentation** : `/config/README.md`
- **Email** : contact@holonsystems.org
- **Discord** : https://discord.gg/WuUY5dtB

---

**Dernière mise à jour** : Novembre 2025  
**Version** : 1.0  
**Auteur** : Équipe IdeoSphere
