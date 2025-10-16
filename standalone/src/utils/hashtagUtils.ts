/**
 * Utilitaires pour gérer les hashtags dans le contenu
 */

/**
 * Extrait les hashtags d'un texte
 * @param text Le texte à analyser
 * @returns Un tableau de hashtags uniques (sans le #)
 */
export function extractHashtags(text: string): string[] {
  if (!text) return [];
  
  // Regex pour capturer les hashtags : # suivi de lettres, chiffres, accents, tirets et underscores
  const hashtagRegex = /#([a-zA-ZÀ-ÿ0-9_\-]+)/g;
  const hashtags: string[] = [];
  let match;
  
  while ((match = hashtagRegex.exec(text)) !== null) {
    const tag = match[1].toLowerCase(); // Convertir en minuscules pour la cohérence
    if (!hashtags.includes(tag)) {
      hashtags.push(tag);
    }
  }
  
  return hashtags;
}

/**
 * Extrait les hashtags de plusieurs textes
 * @param texts Les textes à analyser
 * @returns Un tableau de hashtags uniques (sans le #) de tous les textes
 */
export function extractHashtagsFromMultipleTexts(...texts: (string | undefined)[]): string[] {
  const allHashtags: string[] = [];
  
  texts.forEach(text => {
    if (text) {
      const hashtags = extractHashtags(text);
      hashtags.forEach(tag => {
        if (!allHashtags.includes(tag)) {
          allHashtags.push(tag);
        }
      });
    }
  });
  
  return allHashtags;
}

/**
 * Formate un hashtag pour l'affichage (ajoute le # si nécessaire)
 * @param tag Le tag à formater
 * @returns Le tag formaté avec #
 */
export function formatHashtag(tag: string): string {
  return tag.startsWith('#') ? tag : `#${tag}`;
}

/**
 * Nettoie un texte en retirant les hashtags
 * @param text Le texte à nettoyer
 * @returns Le texte sans les hashtags
 */
export function removeHashtagsFromText(text: string): string {
  if (!text) return text;
  
  // Supprimer les hashtags mais conserver les espaces
  return text.replace(/#[a-zA-ZÀ-ÿ0-9_\-]+/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Valide si un tag est valide
 * @param tag Le tag à valider
 * @returns true si le tag est valide
 */
export function isValidHashtag(tag: string): boolean {
  if (!tag) return false;
  
  // Supprimer le # s'il est présent
  const cleanTag = tag.startsWith('#') ? tag.slice(1) : tag;
  
  // Un tag valide contient au moins 2 caractères et uniquement lettres, chiffres, accents, tirets et underscores
  return /^[a-zA-ZÀ-ÿ0-9_\-]{2,}$/.test(cleanTag);
}