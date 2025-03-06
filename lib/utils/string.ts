/**
 * Utility functions for string manipulation
 */
import slugify from 'slugify';

/**
 * Converts a string to a URL-safe slug
 * - Uses the slugify library to properly handle all UTF-8 characters
 * - Replaces spaces with hyphens
 * - Removes special characters
 * - Ensures lowercase output
 * 
 * @param str The string to convert to a slug
 * @returns A URL-safe slug
 */
export function toSlug(str: string): string {
  if (!str) return '';
  
  return slugify(str, {
    lower: true,       // Convert to lowercase
    strict: true,      // Strip special characters
    locale: 'en',      // Language for transliteration rules
    trim: true         // Trim leading/trailing whitespace
  });
}
