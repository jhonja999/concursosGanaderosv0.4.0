import { type NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Debug endpoint to test Cloudinary configuration
export async function GET(request: NextRequest) {
  try {
    console.log("Debug endpoint called")

    // Test configuration
    const config = {
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET ? "***configured***" : "missing",
    }

    console.log("Cloudinary config:", config)

    // Test API connection
    try {
      const result = await cloudinary.api.resources({
        type: "upload",
        max_results: 5,
      })

      return NextResponse.json({
        status: "success",
        config,
        resourcesFound: result.resources?.length || 0,
        resources:
          result.resources?.map((r: any) => ({
            public_id: r.public_id,
            filename: r.filename || r.original_filename,
            created_at: r.created_at,
          })) || [],
      })
    } catch (apiError) {
      return NextResponse.json({
        status: "api_error",
        config,
        error: apiError instanceof Error ? apiError.message : "Unknown API error",
      })
    }
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
