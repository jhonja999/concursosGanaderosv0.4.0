import { type NextRequest, NextResponse } from "next/server"
import { checkExistingImage } from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    console.log("Check existing image API called")

    const body = await request.json()
    const { filename, folder, entityType } = body

    if (!filename || !folder) {
      return NextResponse.json({ error: "Filename and folder are required" }, { status: 400 })
    }

    console.log("Checking existing image:", { filename, folder, entityType })

    const existingInfo = await checkExistingImage(filename, folder, entityType)

    console.log("Existing image check result:", existingInfo)

    return NextResponse.json(existingInfo)
  } catch (error) {
    console.error("Error checking existing image:", error)
    return NextResponse.json(
      {
        error: "Failed to check existing image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
