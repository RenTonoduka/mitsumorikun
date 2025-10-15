import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/specialties
 * List all specialties
 * Public endpoint
 */
export async function GET(req: NextRequest) {
  try {
    const specialties = await prisma.specialty.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({
      success: true,
      data: specialties,
    })
  } catch (error) {
    console.error("Error fetching specialties:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
