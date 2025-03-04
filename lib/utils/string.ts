/**
 * Utility functions for string manipulation
 */

/**
 * Converts a string to a URL-safe slug
 * - Normalizes Unicode characters
 * - Removes diacritics/accents
 * - Replaces spaces with hyphens
 * - Removes special characters
 * - Ensures lowercase output
 * 
 * @param str The string to convert to a slug
 * @returns A URL-safe slug
 */
export function toSlug(str: string): string {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD')                 // Normalize to decomposed form
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics/accents
    .replace(/[^\w\s-]/g, '')        // Remove remaining non-word chars
    .replace(/\s+/g, '-')            // Replace spaces with -
    .replace(/-+/g, '-')             // Replace multiple - with single -
    .replace(/^-|-$/g, '')           // Remove leading/trailing hyphens
    .toLowerCase();                   // Ensure result is lowercase
}
