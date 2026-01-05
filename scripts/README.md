# Scripts de Métadonnées

## generate-kumu-graph.py

Script Python qui génère un graphe JSON pour visualiser la structure du code dans [Kumu](https://kumu.io).

### Fonctionnalités

- 📁 **Nœuds dossiers** : Un nœud pour chaque dossier
- 📄 **Nœuds fichiers** : Un nœud pour chaque fichier TypeScript/JavaScript avec:
  - Nom du fichier
  - Nombre de lignes
  - Extension
- 🔗 **Connexions imports** : Liens entre fichiers basés sur les imports
- 🏗️ **Hiérarchie** : Liens entre dossiers et fichiers (structure du projet)

### Utilisation

```bash
# Depuis le dossier racine du projet
python scripts/generate-kumu-graph.py
```

Le script génère un fichier `kumu-graph.json` dans le dossier `scripts/`.

### Import dans Kumu

1. Allez sur [https://kumu.io](https://kumu.io)
2. Créez un nouveau projet
3. Cliquez sur "Import" (icône en haut à droite)
4. Sélectionnez le fichier `scripts/kumu-graph.json`
5. Le graphe s'affichera automatiquement

> 💡 **Astuce** : Le fichier `kumu-config.json` contient des styles pré-configurés que vous pouvez copier-coller dans l'éditeur de style de Kumu

### Personnalisation dans Kumu

Une fois importé, vous pouvez :

- **Filtrer par type** : Afficher seulement les fichiers ou dossiers
- **Colorier par attribut** : Par exemple, par extension ou nombre de lignes
- **Layout** : Utiliser différents algorithmes de disposition (force-directed, hierarchy, etc.)
- **Filtrer les connexions** : Afficher seulement les imports ou la hiérarchie

### Exemple de règles Kumu

Dans l'éditeur avancé de Kumu, vous pouvez ajouter :

```scss
/* Colorier les fichiers selon leur extension */
[extension=".tsx"] {
  color: #3178c6;
  label: {{label}};
}

[extension=".ts"] {
  color: #007acc;
}

/* Taille basée sur le nombre de lignes */
[type="file"] {
  size: scale("lines", 10, 100);
}

/* Style des dossiers */
[type="folder"] {
  color: #f4a261;
  shape: square;
}

/* Style des connexions */
/* Imports entre fichiers - bleu/vert */
[connection type="import"] {
  color: #2a9d8f;
  width: 2;
}

/* Hiérarchie entre dossiers - orange pointillé */
[connection type="folder-hierarchy"] {
  color: #e76f51;
  width: 1.5;
  style: dashed;
}

/* Fichiers dans dossiers - violet pointillé */
[connection type="file-in-folder"] {
  color: #8338ec;
  width: 1;
  style: dotted;
}

/* Filtrer par dossier spécifique */
[folder="api"] {
  color: #06d6a0;
}
```

### Configuration

Modifiez les constantes dans le script si nécessaire :

```python
ROOT_DIR = Path(__file__).parent.parent / "production" / "src"  # Dossier à analyser
OUTPUT_FILE = Path(__file__).parent / "kumu-graph.json"        # Fichier de sortie
FILE_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx"}               # Extensions à analyser
```

### Structure du JSON généré

Le fichier JSON contient deux sections principales :

#### Elements (nœuds)

```json
{
  "id": "api/apiClient.ts",
  "label": "apiClient.ts",
  "type": "file",
  "element type": "file",
  "lines": 142,
  "extension": ".ts",
  "folder": "api"
}
```

**Attributs des fichiers :**
- `id` : Chemin relatif complet du fichier
- `label` : Nom du fichier
- `type` & `element type` : "file"
- `lines` : Nombre de lignes de code
- `extension` : Extension du fichier (.ts, .tsx, .js, .jsx)
- `folder` : Dossier parent contenant le fichier

**Attributs des dossiers :**
- `id` : Chemin du dossier
- `label` : Nom du dossier
- `type` & `element type` : "folder"

#### Connections (liens)

**3 types de connexions :**

```json
// 1. Import entre fichiers
{
  "from": "api/authService.ts",
  "to": "api/apiClient.ts",
  "label": "imports",
  "connection type": "import"
}

// 2. Hiérarchie entre dossiers (dossier -> dossier parent)
{
  "from": "components/PostDetail",
  "to": "components",
  "label": "subfolder of",
  "connection type": "folder-hierarchy"
}

// 3. Appartenance fichier -> dossier
{
  "from": "api/apiClient.ts",
  "to": "api",
  "label": "in folder",
  "connection type": "file-in-folder"
}
```

**Types de connexions :**
- `import` : Dépendance entre deux fichiers (imports ES6/CommonJS)
- `folder-hierarchy` : Relation parent-enfant entre dossiers
- `file-in-folder` : Un fichier appartient à un dossier

### Exemple de résultat

Après import dans Kumu, vous verrez :
- **229 fichiers** représentés comme des cercles (taille proportionnelle au nombre de lignes)
- **19 dossiers** représentés comme des carrés
- **758 connexions d'imports** (flèches bleues) montrant les dépendances
- **991 connexions totales** incluant la hiérarchie des dossiers

Le graphe vous permet de :
- Identifier les fichiers centraux (beaucoup d'imports)
- Détecter les dépendances circulaires
- Visualiser l'architecture par modules
- Repérer les fichiers volumineux qui mériteraient d'être refactorisés
