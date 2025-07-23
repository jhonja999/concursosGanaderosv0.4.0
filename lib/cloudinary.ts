import { v2 as cloudinary } from "cloudinary"

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Ensure this is set in your environment variables
})

export { cloudinary }

// Types for Cloudinary
export interface CloudinaryUploadResult {
  public_id: string
  version: number
  signature: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  tags: string[]
  bytes: number
  type: string
  etag: string
  placeholder: boolean
  url: string
  secure_url: string
  folder?: string
  access_mode: string
  original_filename: string
}

export interface UploadOptions {
  folder?: string
  public_id?: string
  tags?: string[]
  transformation?: any[]
  quality?: string | number
  use_filename?: boolean
  unique_filename?: boolean
  overwrite?: boolean
  entityType?: string
  entityId?: string
  allowReuse?: boolean
  forceOverwrite?: boolean
  // upload_preset?: string; // Removed: This is typically for unsigned uploads. For signed uploads, the API secret is used.
}

export interface ExistingImageInfo {
  exists: boolean
  image?: CloudinaryUploadResult
  filename?: string
  uploadedAt?: string
  size?: number
}

// Check if image with same filename exists using Admin API
export async function checkExistingImage(
  filename: string,
  folder: string,
  entityType?: string,
): Promise<ExistingImageInfo> {
  try {
    console.log("Checking existing image:", { filename, folder, entityType })

    // Clean filename for search
    const cleanName = filename.replace(/\.[^/.]+$/, "").toLowerCase()

    // Use Admin API to list resources in folder
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,
      max_results: 100,
    })

    console.log("Found resources:", result.resources?.length || 0)

    if (result.resources && result.resources.length > 0) {
      // Look for exact filename match
      const exactMatch = result.resources.find((resource: any) => {
        const resourceFilename = resource.filename || resource.original_filename || ""
        const resourcePublicId = resource.public_id || ""

        console.log("Comparing:", {
          resourceFilename: resourceFilename.toLowerCase(),
          resourcePublicId: resourcePublicId.toLowerCase(),
          searchName: cleanName,
          originalFilename: filename.toLowerCase(),
        })

        // Check multiple variations
        return (
          resourceFilename.toLowerCase() === filename.toLowerCase() ||
          resourceFilename.toLowerCase() === cleanName.toLowerCase() ||
          resourcePublicId.toLowerCase().includes(cleanName.toLowerCase()) ||
          resourcePublicId.toLowerCase().endsWith(cleanName.toLowerCase())
        )
      })

      if (exactMatch) {
        console.log("Found exact filename match:", exactMatch.public_id)
        return {
          exists: true,
          image: exactMatch as CloudinaryUploadResult,
          filename: exactMatch.filename || exactMatch.original_filename || exactMatch.public_id,
          uploadedAt: exactMatch.created_at,
          size: exactMatch.bytes,
        }
      }
    }

    console.log("No existing image found")
    return { exists: false }
  } catch (error) {
    console.error("Error checking existing image:", error)
    return { exists: false }
  }
}

// Upload function with better error handling
export async function uploadToCloudinary(buffer: Buffer, options: UploadOptions = {}): Promise<CloudinaryUploadResult> {
  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    try {
      console.log("Starting Cloudinary upload with options:", options)

      const uploadOptions = {
        resource_type: "auto" as const,
        folder: options.folder || "uploads",
        quality: options.quality || "auto:good", // "auto:good" is generally good for quality, use "auto" for original
        tags: options.tags || [],
        use_filename: options.use_filename !== false, // Default to true
        unique_filename: options.unique_filename !== false, // Default to true unless overwriting
        overwrite: options.overwrite || false,
        // upload_preset: "your_upload_preset", // Removed: This is typically for unsigned uploads.
      }

      console.log("Final upload options:", uploadOptions)

      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error)
            reject(new Error(`Cloudinary upload failed: ${error.message}`))
          } else if (result) {
            console.log("Upload successful:", result.public_id)
            const cloudinaryResult: CloudinaryUploadResult = {
              ...result,
              folder: result.folder || options.folder || "uploads",
            } as CloudinaryUploadResult
            resolve(cloudinaryResult)
          } else {
            reject(new Error("Upload failed - no result returned"))
          }
        })
        .end(buffer)
    } catch (error) {
      console.error("Error in uploadToCloudinary:", error)
      reject(error)
    }
  })
}

// Upload from URL with better error handling
export async function uploadFromUrl(imageUrl: string, options: UploadOptions = {}): Promise<CloudinaryUploadResult> {
  try {
    console.log("Starting URL upload:", imageUrl)

    const uploadOptions = {
      folder: options.folder || "uploads",
      quality: options.quality || "auto:good", // "auto:good" is generally good for quality, use "auto" for original
      tags: options.tags || [],
      use_filename: options.use_filename !== false,
      unique_filename: options.unique_filename !== false,
      overwrite: options.overwrite || false,
      // upload_preset: "your_upload_preset", // Removed: This is typically for unsigned uploads.
    }

    console.log("URL upload options:", uploadOptions)

    const result = await cloudinary.uploader.upload(imageUrl, uploadOptions)
    console.log("URL upload successful:", result.public_id)

    const cloudinaryResult: CloudinaryUploadResult = {
      ...result,
      folder: result.folder || options.folder || "uploads",
    } as CloudinaryUploadResult
    return cloudinaryResult
  } catch (error) {
    console.error("Cloudinary URL upload error:", error)
    throw new Error(`URL upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Export aliases for media.ts compatibility
export const uploadImage = uploadToCloudinary
export const uploadImageFromUrl = uploadFromUrl

// Delete image function
export async function deleteImage(publicId: string): Promise<any> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error("Cloudinary delete error:", error)
    throw error
  }
}

// Validation functions
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Tipo de archivo no válido. Solo se permiten: JPG, PNG, GIF, WebP",
    }
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "El archivo es demasiado grande. Máximo 10MB",
    }
  }

  return { isValid: true }
}

export function validateImageUrl(url: string): { isValid: boolean; error?: string } {
  try {
    const urlObj = new URL(url)
    const allowedProtocols = ["http:", "https:"]

    if (!allowedProtocols.includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: "URL no válida. Debe usar HTTP o HTTPS",
      }
    }

    return { isValid: true }
  } catch {
    return {
      isValid: false,
      error: "URL no válida",
    }
  }
}

// Helper functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function formatUploadDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
