import { type NextRequest, NextResponse } from "next/server"
import { uploadToCloudinary, uploadFromUrl, validateImageFile, validateImageUrl } from "@/lib/cloudinary"
import { verifyToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API called")

    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    console.log("Verifying token...")
    const decoded = await verifyToken(token)
    console.log("Token verified successfully:", decoded)

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const imageUrl = formData.get("imageUrl") as string | null
    const folder = (formData.get("folder") as string) || "uploads"
    const entityType = formData.get("entityType") as string | null
    const entityId = formData.get("entityId") as string | null
    const forceOverwrite = formData.get("forceOverwrite") === "true"

    console.log("Form data received:", {
      hasFile: !!file,
      fileName: file?.name,
      imageUrl,
      folder,
      entityType,
      entityId,
      forceOverwrite,
    })

    let uploadResult

    if (file) {
      // Handle file upload
      console.log("Processing file upload:", file.name, file.size, file.type)

      // Validate file
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Upload to Cloudinary
      uploadResult = await uploadToCloudinary(buffer, {
        folder,
        tags: entityType ? [entityType] : [],
        quality: "auto:good",
        entityType: entityType || undefined,
        entityId: entityId || undefined,
        forceOverwrite: forceOverwrite,
        use_filename: true,
        unique_filename: !forceOverwrite,
        overwrite: forceOverwrite,
      })
    } else if (imageUrl) {
      // Handle URL upload
      console.log("Processing URL upload:", imageUrl)

      // Validate URL
      const validation = validateImageUrl(imageUrl)
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }

      // Upload from URL to Cloudinary
      uploadResult = await uploadFromUrl(imageUrl, {
        folder,
        tags: entityType ? [entityType] : [],
        quality: "auto:good",
        entityType: entityType || undefined,
        entityId: entityId || undefined,
        forceOverwrite: forceOverwrite,
        use_filename: true,
        unique_filename: !forceOverwrite,
        overwrite: forceOverwrite,
      })
    } else {
      return NextResponse.json({ error: "No se proporcionó archivo o URL" }, { status: 400 })
    }

    console.log("Upload successful:", uploadResult.secure_url)
    console.log("Public ID:", uploadResult.public_id)

    return NextResponse.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      folder: uploadResult.folder,
      overwritten: forceOverwrite,
    })
  } catch (error) {
    console.error("Error uploading and saving image:", error)

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
