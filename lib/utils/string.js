/**
 * Utility functions for string manipulation
 */
import slugify from 'slugify';

/**
 * Checks if a string contains non-Latin scripts (e.g., Arabic, Chinese, etc.)
 * @param {string} str The string to check
 * @returns {boolean} True if the string contains non-Latin scripts
 */
function containsNonLatinScripts(str) {
  // Check for common non-Latin scripts: Arabic, CJK, Cyrillic, Thai, etc.
  const nonLatinRegex = /[\u0600-\u06FF\u0750-\u077F\u1100-\u11FF\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\u0400-\u04FF\u0E00-\u0E7F\u0900-\u097F]/;
  return nonLatinRegex.test(str);
}

/**
 * Extracts the Latin script portion from a mixed-script string
 * This helps avoid redundancy in slugs when a name contains both Latin and non-Latin versions
 * @param {string} str The mixed-script string
 * @returns {string} The Latin script portion of the string
 */
function extractLatinPortion(str) {
  // If there's no non-Latin script, return the original string
  if (!containsNonLatinScripts(str)) return str;
  
  // Split by common separators that might divide Latin and non-Latin portions
  const parts = str.split(/[,\(\)\[\]\{\}\s]+/);
  
  // Find the longest sequence of Latin-only parts
  let latinParts = [];
  let currentLatinSequence = [];
  
  for (const part of parts) {
    if (part.trim() === '') continue;
    
    if (!containsNonLatinScripts(part)) {
      currentLatinSequence.push(part);
    } else {
      if (currentLatinSequence.length > latinParts.length) {
        latinParts = [...currentLatinSequence];
      }
      currentLatinSequence = [];
    }
  }
  
  // Check the last sequence
  if (currentLatinSequence.length > latinParts.length) {
    latinParts = [...currentLatinSequence];
  }
  
  // If we found Latin parts, join them; otherwise return the original string
  return latinParts.length > 0 ? latinParts.join(' ') : str;
}

/**
 * Converts a string to a URL-safe slug
 * - Prioritizes Latin script when mixed scripts are present
 * - Uses the slugify library to properly handle all UTF-8 characters
 * - Replaces spaces with hyphens
 * - Removes special characters
 * - Ensures lowercase output
 * 
 * @param {string} str The string to convert to a slug
 * @returns {string} A URL-safe slug
 */
export function toSlug(str) {
  if (!str) return '';
  
  // Process the string to prioritize Latin script if mixed scripts are present
  const processedStr = extractLatinPortion(str);
  
  return slugify(processedStr, {
    lower: true,       // Convert to lowercase
    strict: true,      // Strip special characters
    locale: 'en',      // Language for transliteration rules
    trim: true         // Trim leading/trailing whitespace
  });
}
