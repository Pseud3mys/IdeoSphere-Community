/**
 * NOTE: This service is client-side. The upload is a simulation.
 * In a real app, `uploadUserAvatar` would send the file to a storage service
 * and return a URL. The backend routes provided do not include file upload.
 */
//Not in use.

export function resizeImageTo200x200(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    if (!ctx) return reject(new Error('Canvas context not available'));
    
    img.onload = () => {
      canvas.width = 200;
      canvas.height = 200;
      ctx.drawImage(img, 0, 0, 200, 200);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => reject(new Error("Image loading error"));
    img.src = URL.createObjectURL(file);
  });
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validMimeTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported format. Use JPG, PNG, or WebP.' };
  }
  
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File is too large. Max 5MB.' };
  }
  
  return { valid: true };
}

export async function uploadUserAvatar(userId: string, imageDataUrl: string): Promise<string> {
    console.log(`🔄 Simulating avatar upload for user: ${userId}`);
    // In a real app, this would be an API call, e.g.:
    // await apiClient.put(`/users/${userId.split('/')[1]}`, { avatar: imageDataUrl });
    // For this demo, we just return the data URL itself.
    return Promise.resolve(imageDataUrl);
}

export async function deleteUserAvatar(userId: string, avatarUrl: string): Promise<boolean> {
    console.log(`🔄 Simulating avatar deletion for user: ${userId}`);
    // In a real app, this would be an API call, e.g.:
    // await apiClient.put(`/users/${userId.split('/')[1]}`, { avatar: null });
    return Promise.resolve(true);
}

export function generateDefaultAvatar(name: string, size: number = 200): string {
  if (!name) return '';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  canvas.width = size;
  canvas.height = size;
  
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const hue = Math.abs(hash % 360);
  ctx.fillStyle = `hsl(${hue}, 65%, 55%)`;
  ctx.fillRect(0, 0, size, size);
  
  const initials = name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.4}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, size / 2, size / 2);
  
  return canvas.toDataURL('image/png');
}
