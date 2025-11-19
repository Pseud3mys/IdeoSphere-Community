# Guide Rapide - Configuration Multi-Client IdeoSphere

## 🎯 En bref

IdeoSphere charge désormais **automatiquement** la bonne configuration selon l'URL d'accès. Un seul déploiement peut servir plusieurs clients avec des identités et terminologies différentes.

---

## 📂 Fichiers créés

### Structure complète

```
/config
├── types.ts                      # Interface TypeScript ClientConfig
├── clientConfig.ts               # Gestionnaire principal (routage URL → config)
├── clients/
│   ├── default.ts                # Config par défaut (mairie)
│   ├── listeCitoyenne.ts         # Config liste citoyenne
│   └── _template.ts.example      # Template pour nouvelles configs
├── README.md                     # Documentation complète
├── CONFIG_URL_BASED.md           # Guide détaillé du système multi-client
├── CHANGELOG.md                  # Historique des changements
└── GUIDE_RAPIDE.md               # Ce fichier
```

---

## 🔄 Mapping URL → Configuration

| URL | Config chargée | Type |
|-----|---------------|------|
| `http://localhost:3000` | `default` | Mairie |
| `https://alpha.ideosphere.community` | `default` | Mairie |
| `https://liste.ideosphere.community` | `listeCitoyenne` | Liste citoyenne |
| `https://demo-liste.ideosphere.community` | `listeCitoyenne` | Liste citoyenne |
| `https://autre.ideosphere.community` | `default` (fallback) | Mairie |

---

## 🚀 Ajouter une nouvelle configuration (3 étapes)

### 1️⃣ Créer le fichier de configuration

```bash
# Copiez le template
cp /config/clients/_template.ts.example /config/clients/entreprise.ts
```

Modifiez `/config/clients/entreprise.ts` selon vos besoins.

### 2️⃣ Importer et mapper

Dans `/config/clientConfig.ts`, ajoutez :

```typescript
import { entrepriseConfig } from './clients/entreprise';

const configs: Record<string, ClientConfig> = {
  'default': defaultConfig,
  'liste': listeCitoyenneConfig,
  
  // ← Ajout
  'entreprise': entrepriseConfig,
  'demo-entreprise': entrepriseConfig,
};
```

### 3️⃣ Tester

Accédez à `https://entreprise.ideosphere.community` → Votre config est chargée ! 🎉

---

## 📝 Configurations disponibles

### 1. Default (Mairie) - `/config/clients/default.ts`

**Contexte** : Collectivités territoriales, mairies, conseils citoyens

**Terminologie** :
- Membres : citoyens
- Organisation : commune
- Participation : citoyenne
- Localisation : Le Blanc (activée)

**Types de groupes** :
- 👥 Communauté
- 🎯 Projet
- 📍 Local
- 💡 Défi

**URLs** : `localhost`, `alpha`, `demo`

---

### 2. Liste Citoyenne - `/config/clients/listeCitoyenne.ts`

**Contexte** : Listes citoyennes, mouvements politiques locaux

**Terminologie** :
- Membres : membres
- Organisation : liste citoyenne
- Participation : collective
- Localisation : Notre Commune (activée)

**Types de groupes** :
- 📋 Commission thématique
- 🎯 Action collective
- 📍 Groupe local
- 💼 Groupe de travail

**Spécificités** :
- Hero : "Co-construisons ensemble notre programme politique"
- CTA : "Co-construction du programme, Décisions collectives"
- Newsletters activées
- Vocabulaire politique et démocratique

**URLs** : `liste`, `demo-liste`, `liste-citoyenne`

---

## 🔧 Utilisation dans les composants

### Import de la configuration

```typescript
import { currentConfig } from '../config/clientConfig';

// Accès direct aux propriétés
const appName = currentConfig.identity.appName;
const cityName = currentConfig.terminology.location.cityName;
```

### Utilisation des helpers

```typescript
import { getMemberTerm, getCityName, getGroupTypes } from '../config/clientConfig';

function MonComposant() {
  return (
    <div>
      <h1>Bienvenue {getMemberTerm({ plural: true })} !</h1>
      <p>Ville : {getCityName()}</p>
    </div>
  );
}
```

---

## ✅ Compatibilité

**100% rétrocompatible** : Tous les imports existants fonctionnent toujours !

```typescript
// ✅ Ancien code (toujours valide)
import { clientConfig } from '../config/clientConfig';

// ✅ Nouveau (recommandé)
import { currentConfig } from '../config/clientConfig';
```

**Aucun changement nécessaire** dans les composants existants.

---

## 📖 Documentation complète

- **Guide complet** : `/config/README.md`
- **Système multi-client** : `/config/CONFIG_URL_BASED.md`
- **Historique** : `/config/CHANGELOG.md`
- **Template** : `/config/clients/_template.ts.example`

---

## 🎨 Différences clés entre les configs

### Configuration Default (Mairie)

```typescript
hero: {
  title: 'Partagez, explorez ou discutez d\'idées locales',
  description: 'Aménagement urbain, services publics, initiatives citoyennes...',
}

cta: {
  values: [
    'Participation citoyenne',
    'Projets concrets',
    'Budget municipal dédié',
  ],
}
```

### Configuration Liste Citoyenne

```typescript
hero: {
  title: 'Co-construisons ensemble notre programme politique',
  description: 'Éducation, environnement, mobilité, culture, social...',
}

cta: {
  values: [
    'Démocratie participative',
    'Co-construction du programme',
    'Décisions collectives',
  ],
}
```

---

## 🔮 Exemple : Créer une config Entreprise

**Fichier** : `/config/clients/entreprise.ts`

```typescript
import { ClientConfig } from '../types';

export const entrepriseConfig: ClientConfig = {
  identity: {
    appName: 'InnoLab',
    appTagline: 'L\'innovation par tous, pour tous',
    // ...
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
    location: {
      cityName: 'Notre Entreprise',
      enabled: false, // ← Pas de localisation géo
    },
  },
  
  welcome: {
    hero: {
      title: 'Partagez vos idées d\'innovation',
      themes: ['Produit', 'Process', 'RH', 'IT', 'RSE'],
    },
    // ...
  },
  
  // ... reste de la config
};
```

**Mapping** dans `/config/clientConfig.ts` :

```typescript
import { entrepriseConfig } from './clients/entreprise';

const configs = {
  'entreprise': entrepriseConfig,
  'innolab': entrepriseConfig,
};
```

**Résultat** : Accessible sur `https://entreprise.ideosphere.community` !

---

## 🛠️ Maintenance

### Modifier une configuration existante

1. Ouvrir `/config/clients/default.ts` ou `/config/clients/listeCitoyenne.ts`
2. Modifier les champs souhaités
3. Redéployer l'application

### Désactiver une configuration

Dans `/config/clientConfig.ts`, retirer le mapping :

```typescript
const configs = {
  // 'ancien-client': ancienneConfig, // ← Commenté ou supprimé
};
```

---

## 📞 Support

- **Documentation** : `/config/README.md`, `/config/CONFIG_URL_BASED.md`
- **Email** : contact@holonsystems.org
- **Discord** : https://discord.gg/WuUY5dtB

---

**Version** : 1.0  
**Dernière mise à jour** : Novembre 2025  
**Projet** : IdeoSphere - Plateforme collaborative open source
