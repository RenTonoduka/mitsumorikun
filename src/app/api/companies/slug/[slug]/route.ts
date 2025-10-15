import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/companies/slug/[slug]
 * Get company by slug
 * Public endpoint
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { slug: params.slug },
      include: {
        techStacks: {
          include: {
            techStack: true,
          },
        },
        specialties: {
          include: {
            specialty: true,
          },
        },
        companyUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        reviews: {
          where: {
            isPublished: true,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
            requestCompanies: true,
          },
        },
      },
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: company,
    })
  } catch (error) {
    console.error("Error fetching company by slug:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
