/**
 * Slug generation utilities for company profiles
 */

/**
 * Generate a URL-safe slug from a string
 * @param text - Input text to convert to slug
 * @returns URL-safe slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces, underscores with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a random suffix if needed
 * @param baseSlug - Base slug to start with
 * @returns Unique slug with random suffix if needed
 */
export function generateUniqueSlug(baseSlug: string): string {
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return `${baseSlug}-${randomSuffix}`
}

/**
 * Validate if a slug is valid
 * @param slug - Slug to validate
 * @returns True if slug is valid
 */
export function isValidSlug(slug: string): boolean {
  // Must be lowercase alphanumeric with hyphens only
  // Must start and end with alphanumeric
  // Must be between 3 and 100 characters
  const slugRegex = /^[a-z0-9][a-z0-9-]{1,98}[a-z0-9]$/
  return slugRegex.test(slug)
}
