/**
 * Service pour la gestion des avatars utilisateur
 * Fonctionnalités : upload, redimensionnement, stockage
 */

// Simuler un délai d'API
const simulateApiDelay = (ms: number = 200) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Redimensionne une image en 200x200 pixels
 * @param file - Fichier image à redimensionner
 * @returns Promise<string> - Data URL de l'image redimensionnée
 */
export function resizeImageTo200x200(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) {
      reject(new Error('Impossible de créer le contexte canvas'));
      return;
    }
    
    img.onload = () => {
      // Définir la taille du canvas à 200x200
      canvas.width = 200;
      canvas.height = 200;
      
      // Dessiner l'image redimensionnée et centrée
      ctx.drawImage(img, 0, 0, 200, 200);
      
      // Obtenir le data URL de l'image redimensionnée
      const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      resolve(resizedDataUrl);
    };
    
    img.onerror = () => {
      reject(new Error('Erreur lors du chargement de l\'image'));
    };
    
    // Créer une URL pour l'image
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Valide qu'un fichier est une image valide
 * @param file - Fichier à valider
 * @returns boolean - true si le fichier est une image valide
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Vérifier le type MIME
  const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Format non supporté. Utilisez JPG, PNG ou WebP.'
    };
  }
  
  // Vérifier la taille (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Le fichier est trop volumineux. Maximum 5MB.'
    };
  }
  
  return { valid: true };
}

/**
 * SIMULATION - Upload d'un avatar utilisateur
 * En production, cette fonction enverrait l'image au serveur
 * @param userId - ID de l'utilisateur
 * @param imageDataUrl - Data URL de l'image redimensionnée
 * @returns Promise<string> - URL de l'avatar uploadé
 */
export async function uploadUserAvatar(userId: string, imageDataUrl: string): Promise<string> {
  await simulateApiDelay(1000); // Simuler un upload plus long
  
  console.log('🔄 [API SIMULATION] Upload avatar pour utilisateur:', userId);
  console.log('📸 [API SIMULATION] Taille des données:', Math.round(imageDataUrl.length / 1024), 'KB');
  
  // SIMULATION - En production, on enverrait les données au serveur
  // const response = await fetch('/api/users/avatar', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${token}`,
  //   },
  //   body: JSON.stringify({
  //     userId,
  //     imageData: imageDataUrl
  //   })
  // });
  
  // SIMULATION - Retourner une URL simulée
  // En production, le serveur retournerait l'URL réelle de l'image stockée
  const simulatedUrl = `https://api.ideosphere.org/avatars/${userId}_${Date.now()}.jpg`;
  
  console.log('✅ [API SIMULATION] Avatar uploadé avec succès:', simulatedUrl);
  
  // Pour la démo, on retourne directement le data URL
  // En production, on retournerait l'URL du serveur
  return imageDataUrl;
}

/**
 * SIMULATION - Suppression d'un avatar utilisateur
 * @param userId - ID de l'utilisateur
 * @param avatarUrl - URL de l'avatar à supprimer
 * @returns Promise<boolean> - Succès de la suppression
 */
export async function deleteUserAvatar(userId: string, avatarUrl: string): Promise<boolean> {
  await simulateApiDelay(500);
  
  console.log('🔄 [API SIMULATION] Suppression avatar pour utilisateur:', userId);
  console.log('🗑️ [API SIMULATION] URL à supprimer:', avatarUrl);
  
  // SIMULATION - En production :
  // const response = await fetch(`/api/users/${userId}/avatar`, {
  //   method: 'DELETE',
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //   }
  // });
  
  console.log('✅ [API SIMULATION] Avatar supprimé avec succès');
  return true;
}

/**
 * Convertir un data URL en Blob pour l'envoi
 * @param dataUrl - Data URL à convertir
 * @returns Blob - Blob de l'image
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * Générer un avatar par défaut basé sur les initiales
 * @param name - Nom de l'utilisateur
 * @param size - Taille de l'avatar (défaut: 200)
 * @returns string - Data URL de l'avatar généré
 */
export function generateDefaultAvatar(name: string, size: number = 200): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return '';
  }
  
  canvas.width = size;
  canvas.height = size;
  
  // Couleur de fond basée sur le hash du nom
  const hash = name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const hue = Math.abs(hash) % 360;
  ctx.fillStyle = `hsl(${hue}, 65%, 55%)`;
  ctx.fillRect(0, 0, size, size);
  
  // Texte (initiales)
  const initials = name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.4}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, size / 2, size / 2);
  
  return canvas.toDataURL('image/png');
}