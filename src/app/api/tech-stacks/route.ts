import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/tech-stacks
 * List all tech stacks
 * Public endpoint
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")

    const where: any = {}

    if (category) {
      where.category = category.toUpperCase()
    }

    const techStacks = await prisma.techStack.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({
      success: true,
      data: techStacks,
    })
  } catch (error) {
    console.error("Error fetching tech stacks:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
