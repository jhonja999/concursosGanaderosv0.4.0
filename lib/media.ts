import { prisma } from "./prisma"
import { uploadImage, uploadImageFromUrl, deleteImage, type CloudinaryUploadResult } from "./cloudinary"

export interface MediaCreateData {
  filename: string
  entityType?: string
  entityId?: string
  folder?: string
  tags?: string[]
  alt?: string
  caption?: string
  uploadedById?: string
}

/**
 * Save media record to database after Cloudinary upload
 */
export async function saveMediaRecord(cloudinaryResult: CloudinaryUploadResult, data: MediaCreateData) {
  try {
    const media = await prisma.media.create({
      data: {
        filename: data.filename,
        publicId: cloudinaryResult.public_id,
        url: cloudinaryResult.url,
        secureUrl: cloudinaryResult.secure_url,
        format: cloudinaryResult.format,
        resourceType: cloudinaryResult.resource_type,
        bytes: cloudinaryResult.bytes,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        entityType: data.entityType,
        entityId: data.entityId,
        folder: cloudinaryResult.folder,
        tags: cloudinaryResult.tags || [],
        alt: data.alt,
        caption: data.caption,
        uploadedById: data.uploadedById,
      },
    })

    return media
  } catch (error) {
    console.error("Error saving media record:", error)
    throw new Error("Failed to save media record")
  }
}

/**
 * Upload image from file and save record
 */
export async function uploadAndSaveImage(file: Buffer, data: MediaCreateData) {
  try {
    // Upload to Cloudinary
    const cloudinaryResult = await uploadImage(file, {
      folder: data.folder,
      tags: data.tags,
    })

    // Save to database
    const media = await saveMediaRecord(cloudinaryResult, data)

    return {
      media,
      cloudinaryResult,
    }
  } catch (error) {
    console.error("Error uploading and saving image:", error)
    throw error
  }
}

/**
 * Upload image from URL and save record
 */
export async function uploadAndSaveImageFromUrl(url: string, data: MediaCreateData) {
  try {
    // Upload to Cloudinary from URL
    const cloudinaryResult = await uploadImageFromUrl(url, {
      folder: data.folder,
      tags: data.tags,
    })

    // Save to database
    const media = await saveMediaRecord(cloudinaryResult, data)

    return {
      media,
      cloudinaryResult,
    }
  } catch (error) {
    console.error("Error uploading and saving image from URL:", error)
    throw error
  }
}

/**
 * Delete image from both Cloudinary and database
 */
export async function deleteMediaRecord(mediaId: string) {
  try {
    // Get media record
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    })

    if (!media) {
      throw new Error("Media record not found")
    }

    // Delete from Cloudinary
    await deleteImage(media.publicId)

    // Delete from database
    await prisma.media.delete({
      where: { id: mediaId },
    })

    return true
  } catch (error) {
    console.error("Error deleting media:", error)
    throw error
  }
}

/**
 * Get media records for an entity
 */
export async function getEntityMedia(entityType: string, entityId: string) {
  try {
    const media = await prisma.media.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return media
  } catch (error) {
    console.error("Error getting entity media:", error)
    throw error
  }
}

/**
 * Update media record
 */
export async function updateMediaRecord(mediaId: string, data: Partial<MediaCreateData>) {
  try {
    const media = await prisma.media.update({
      where: { id: mediaId },
      data,
    })

    return media
  } catch (error) {
    console.error("Error updating media record:", error)
    throw error
  }
}
