/**
 * Image upload utilities
 * Note: This is a placeholder implementation
 * In production, you should use a proper file storage service like:
 * - AWS S3
 * - Cloudinary
 * - Vercel Blob
 * - Supabase Storage
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

/**
 * Validate uploaded image file
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    }
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Only JPEG, PNG, WebP, and GIF images are allowed",
    }
  }

  return { valid: true }
}

/**
 * Convert File to Base64 string for preview
 * @param file - File to convert
 * @returns Promise resolving to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Upload image file to storage
 * TODO: Implement actual upload to cloud storage
 * @param file - File to upload
 * @param folder - Storage folder (e.g., 'logos', 'covers')
 * @returns Promise resolving to uploaded file URL
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  // Validate file
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // TODO: Implement actual upload to cloud storage
  // For now, return a placeholder URL
  // In production, replace this with actual cloud storage upload

  const formData = new FormData()
  formData.append("file", file)
  formData.append("folder", folder)

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Upload failed")
  }

  const data = await response.json()
  return data.url
}

/**
 * Delete image from storage
 * TODO: Implement actual deletion from cloud storage
 * @param url - URL of the image to delete
 */
export async function deleteImage(url: string): Promise<void> {
  // TODO: Implement actual deletion from cloud storage
  await fetch("/api/upload", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  })
}
