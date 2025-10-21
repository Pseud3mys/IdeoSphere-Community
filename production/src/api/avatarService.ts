/**
 * Service de génération d'avatars par défaut
 * Crée des avatars avec les initiales de l'utilisateur sur un fond de couleur
 */

/**
 * Génère une couleur de fond basée sur le nom de l'utilisateur
 * @param name - Nom de l'utilisateur
 * @returns Couleur hex
 */
function getColorFromName(name: string): string {
  const colors = [
    '#4f75ff', // ideosphere-blue
    '#8b5cf6', // ideosphere-purple
    '#3b82f6', // blue-500
    '#10b981', // green-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
  ];
  
  // Utiliser le hash du nom pour sélectionner une couleur
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Extrait les initiales d'un nom
 * @param name - Nom complet de l'utilisateur
 * @returns Initiales (max 2 caractères)
 */
function getInitials(name: string): string {
  if (!name || name.trim() === '') return '?';
  
  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 1) {
    // Un seul mot, prendre les 2 premières lettres
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  // Plusieurs mots, prendre la première lettre de chaque mot (max 2)
  return parts
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

/**
 * Génère un avatar SVG avec les initiales de l'utilisateur
 * @param name - Nom de l'utilisateur
 * @param size - Taille de l'avatar (défaut: 64)
 * @returns Data URI de l'image SVG
 */
export function generateDefaultAvatar(name: string, size: number = 64): string {
  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name);
  
  // Créer un SVG avec les initiales
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${backgroundColor}"/>
      <text 
        x="50%" 
        y="50%" 
        dominant-baseline="middle" 
        text-anchor="middle" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="${size * 0.4}" 
        font-weight="500"
        fill="white"
      >${initials}</text>
    </svg>
  `;
  
  // Encoder en base64 pour utiliser comme data URI
  const encoded = btoa(svg.trim());
  return `data:image/svg+xml;base64,${encoded}`;
}

/**
 * Vérifie si un avatar est valide (non vide et pas une URL externe problématique)
 * @param avatar - URL de l'avatar
 * @returns true si l'avatar est valide
 */
export function isValidAvatar(avatar: string | undefined): boolean {
  if (!avatar || avatar.trim() === '') {
    return false;
  }
  
  // Rejeter les URLs pravatar.cc ou autres services externes non fiables
  if (avatar.includes('pravatar.cc') || avatar.includes('i.pravatar.cc')) {
    return false;
  }
  
  return true;
}

/**
 * Obtient un avatar valide pour un utilisateur
 * Si l'avatar existe et est valide, le retourne
 * Sinon, génère un avatar par défaut avec les initiales
 * @param name - Nom de l'utilisateur
 * @param avatar - Avatar existant (optionnel)
 * @param size - Taille de l'avatar généré (défaut: 64)
 * @returns URL de l'avatar valide
 */
export function getValidAvatar(name: string, avatar?: string, size: number = 64): string {
  if (isValidAvatar(avatar)) {
    return avatar!;
  }
  
  return generateDefaultAvatar(name, size);
}

/**
 * Validation d'un fichier image
 * @param file - Fichier à valider
 * @returns Résultat de la validation avec un message d'erreur si invalide
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Vérifier le type de fichier
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Format de fichier invalide. Utilisez JPG, PNG, GIF ou WebP.'
    };
  }

  // Vérifier la taille du fichier (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB en bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Le fichier est trop volumineux. Taille maximum: 5MB.'
    };
  }

  return { valid: true };
}

/**
 * Redimensionne une image à 200x200 pixels
 * @param file - Fichier image à redimensionner
 * @returns Promise avec la data URL de l'image redimensionnée
 */
export function resizeImageTo200x200(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Créer un canvas pour redimensionner
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'));
          return;
        }

        // Définir la taille du canvas
        const size = 200;
        canvas.width = size;
        canvas.height = size;

        // Calculer les dimensions pour le crop carré
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        // Dessiner l'image redimensionnée et croppée
        ctx.drawImage(
          img,
          sx, sy, minDim, minDim, // source
          0, 0, size, size // destination
        );

        // Convertir en data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error('Erreur lors du chargement de l\'image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Upload d'un avatar utilisateur (simulé pour le mock)
 * Dans un vrai système, ceci enverrait l'image à un serveur
 * @param userId - ID de l'utilisateur
 * @param imageDataUrl - Data URL de l'image
 * @returns Promise avec l'URL de l'avatar uploadé
 */
export async function uploadUserAvatar(userId: string, imageDataUrl: string): Promise<string> {
  // Simuler un délai d'upload
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Dans un vrai système, on enverrait l'image à un serveur et on recevrait une URL
  // Ici, on retourne simplement la data URL
  // En production, cela devrait être remplacé par un appel API réel
  
  console.log(`📸 [AVATAR] Upload simulé pour l'utilisateur ${userId}`);
  
  // Retourner la data URL telle quelle (dans un vrai système, ce serait une URL serveur)
  return imageDataUrl;
}
