#!/usr/bin/env python3
"""
Script de génération de graphe Kumu pour visualiser la structure du code
Analyse les fichiers TypeScript/JavaScript et crée un JSON avec:
- Nœuds pour les fichiers (avec nombre de lignes)
- Nœuds pour les dossiers
- Liens pour les imports entre fichiers
- Liens pour la hiérarchie dossier/fichier
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple

# Configuration
ROOT_DIR = Path(__file__).parent.parent / "production" / "src"
OUTPUT_FILE = Path(__file__).parent / "kumu-graph.json"
FILE_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx"}

def count_lines(file_path: Path) -> int:
    """Compte le nombre de lignes dans un fichier"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return len(f.readlines())
    except:
        return 0

def extract_imports(file_path: Path, root_dir: Path) -> Set[str]:
    """
    Extrait les imports locaux d'un fichier TypeScript/JavaScript
    Retourne les chemins relatifs des fichiers importés
    """
    imports = set()
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern pour capturer les imports relatifs
        # Exemples: import { ... } from '../api/service'
        #           import Component from './Component'
        import_patterns = [
            r"import\s+.*?\s+from\s+['\"](\.\./[^'\"]+)['\"]",  # ../ imports
            r"import\s+.*?\s+from\s+['\"](\./[^'\"]+)['\"]",     # ./ imports
        ]
        
        for pattern in import_patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                import_path = match.group(1)
                
                # Résoudre le chemin complet
                current_dir = file_path.parent
                resolved_path = (current_dir / import_path).resolve()
                
                # Essayer différentes extensions si pas d'extension
                if not resolved_path.suffix:
                    for ext in FILE_EXTENSIONS:
                        test_path = resolved_path.with_suffix(ext)
                        if test_path.exists() and test_path.is_relative_to(root_dir):
                            relative = test_path.relative_to(root_dir)
                            imports.add(str(relative).replace('\\', '/'))
                            break
                elif resolved_path.exists() and resolved_path.is_relative_to(root_dir):
                    relative = resolved_path.relative_to(root_dir)
                    imports.add(str(relative).replace('\\', '/'))
    
    except Exception as e:
        print(f"Erreur lors de l'analyse de {file_path}: {e}")
    
    return imports

def scan_directory(root_dir: Path) -> Tuple[Dict[str, dict], Dict[str, dict], List[dict]]:
    """
    Scanne le répertoire et retourne:
    - files: dict des fichiers avec leurs infos
    - folders: dict des dossiers
    - imports: liste des relations d'import
    """
    files = {}
    folders = {}
    imports_list = []
    
    # Scanner tous les fichiers
    for file_path in root_dir.rglob("*"):
        if file_path.is_file() and file_path.suffix in FILE_EXTENSIONS:
            relative_path = file_path.relative_to(root_dir)
            relative_str = str(relative_path).replace('\\', '/')
            
            # Informations sur le fichier
            line_count = count_lines(file_path)
            file_name = file_path.name
            folder_path = str(relative_path.parent).replace('\\', '/')
            
            files[relative_str] = {
                "id": relative_str,
                "label": file_name,
                "type": "file",
                "lines": line_count,
                "extension": file_path.suffix,
                "folder": folder_path if folder_path != "." else "root"
            }
            
            # Extraire les imports
            file_imports = extract_imports(file_path, root_dir)
            for imported_file in file_imports:
                imports_list.append({
                    "from": relative_str,
                    "to": imported_file,
                    "type": "import"
                })
    
    # Créer les nœuds dossiers
    folder_set = set()
    for file_info in files.values():
        folder = file_info["folder"]
        if folder != "root":
            # Ajouter tous les dossiers parents
            parts = folder.split('/')
            for i in range(len(parts)):
                folder_path = '/'.join(parts[:i+1])
                folder_set.add(folder_path)
    
    for folder_path in folder_set:
        parts = folder_path.split('/')
        folder_name = parts[-1]
        parent_folder = '/'.join(parts[:-1]) if len(parts) > 1 else "root"
        
        folders[folder_path] = {
            "id": folder_path,
            "label": folder_name,
            "type": "folder",
            "parent": parent_folder
        }
    
    return files, folders, imports_list

def create_kumu_json(files: Dict, folders: Dict, imports: List) -> dict:
    """
    Crée la structure JSON pour Kumu
    Format: { "elements": [...], "connections": [...] }
    """
    elements = []
    connections = []
    
    # Ajouter les dossiers comme éléments
    for folder_id, folder_info in folders.items():
        elements.append({
            "id": folder_id,
            "label": folder_info["label"],
            "type": "folder",
            "element type": "folder"
        })
        
        # Lien vers le dossier parent (hiérarchie entre dossiers)
        if folder_info["parent"] != "root":
            connections.append({
                "from": folder_id,
                "to": folder_info["parent"],
                "label": "subfolder of",
                "connection type": "folder-hierarchy"
            })
    
    # Ajouter les fichiers comme éléments
    for file_id, file_info in files.items():
        elements.append({
            "id": file_id,
            "label": file_info["label"],
            "type": "file",
            "element type": "file",
            "lines": file_info["lines"],
            "extension": file_info["extension"],
            "folder": file_info["folder"]  # ✅ Ajout de l'attribut folder
        })
        
        # Lien vers le dossier parent (appartenance fichier/dossier)
        if file_info["folder"] != "root":
            connections.append({
                "from": file_id,
                "to": file_info["folder"],
                "label": "in folder",
                "connection type": "file-in-folder"
            })
    
    # Ajouter les imports comme connexions
    for import_info in imports:
        # Vérifier que les deux fichiers existent
        if import_info["from"] in files and import_info["to"] in files:
            connections.append({
                "from": import_info["from"],
                "to": import_info["to"],
                "label": "imports",
                "connection type": "import"
            })
    
    return {
        "elements": elements,
        "connections": connections
    }

def main():
    """Fonction principale"""
    print(f"🔍 Analyse du répertoire: {ROOT_DIR}")
    
    if not ROOT_DIR.exists():
        print(f"❌ Erreur: Le répertoire {ROOT_DIR} n'existe pas")
        return
    
    # Scanner le projet
    print("📊 Scan des fichiers et imports...")
    files, folders, imports = scan_directory(ROOT_DIR)
    
    print(f"✅ Trouvé:")
    print(f"   - {len(files)} fichiers")
    print(f"   - {len(folders)} dossiers")
    print(f"   - {len(imports)} imports")
    
    # Créer le JSON Kumu
    print("📝 Génération du JSON Kumu...")
    kumu_data = create_kumu_json(files, folders, imports)
    
    # Écrire le fichier
    print(f"💾 Écriture dans {OUTPUT_FILE}")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(kumu_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Graphe généré avec succès!")
    print(f"📊 Statistiques:")
    print(f"   - {len(kumu_data['elements'])} nœuds")
    print(f"   - {len(kumu_data['connections'])} connexions")
    print(f"\n🌐 Importez {OUTPUT_FILE} dans Kumu (https://kumu.io)")

if __name__ == "__main__":
    main()
