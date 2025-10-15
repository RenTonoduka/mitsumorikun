import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { companyRegistrationSchema } from "@/lib/validations/company"
import { generateSlug, generateUniqueSlug, isValidSlug } from "@/lib/utils/slug"
import { z } from "zod"

/**
 * POST /api/companies
 * Create a new company
 * Requires authentication
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse and validate request body
    const body = await req.json()
    const validatedData = companyRegistrationSchema.parse(body)

    // Generate slug from company name
    let slug = generateSlug(validatedData.name)

    // Validate slug format
    if (!isValidSlug(slug)) {
      slug = generateUniqueSlug(slug)
    }

    // Check if slug already exists
    const existingCompany = await prisma.company.findUnique({
      where: { slug },
    })

    if (existingCompany) {
      // Generate unique slug with random suffix
      slug = generateUniqueSlug(slug)
    }

    // Create company with all relations in a transaction
    const company = await prisma.$transaction(async (tx) => {
      // Create company
      const newCompany = await tx.company.create({
        data: {
          name: validatedData.name,
          nameKana: validatedData.nameKana,
          slug,
          logo: validatedData.logo,
          coverImage: validatedData.coverImage,
          description: validatedData.description,
          foundedYear: validatedData.foundedYear,
          employeeCount: validatedData.employeeCount,
          capital: validatedData.capital,
          address: validatedData.address,
          phone: validatedData.phone,
          email: validatedData.email,
          website: validatedData.website,
        },
      })

      // Create company user relation (owner)
      await tx.companyUser.create({
        data: {
          userId: user.id!,
          companyId: newCompany.id,
          role: "OWNER",
        },
      })

      // Create tech stack relations
      if (validatedData.techStackIds.length > 0) {
        await tx.companyTechStack.createMany({
          data: validatedData.techStackIds.map((techStackId) => ({
            companyId: newCompany.id,
            techStackId,
          })),
        })
      }

      // Create specialty relations
      if (validatedData.specialtyIds.length > 0) {
        await tx.companySpecialty.createMany({
          data: validatedData.specialtyIds.map((specialtyId) => ({
            companyId: newCompany.id,
            specialtyId,
          })),
        })
      }

      return newCompany
    })

    // Fetch complete company with relations
    const completeCompany = await prisma.company.findUnique({
      where: { id: company.id },
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
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: completeCompany,
        message: "Company created successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating company:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/companies
 * List companies with optional filters
 * Public endpoint
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const skip = (page - 1) * limit

    // Filters
    const search = searchParams.get("search")
    const techStackId = searchParams.get("techStackId")
    const specialtyId = searchParams.get("specialtyId")
    const isVerified = searchParams.get("isVerified")

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (isVerified === "true") {
      where.isVerified = true
    }

    if (techStackId) {
      where.techStacks = {
        some: {
          techStackId,
        },
      }
    }

    if (specialtyId) {
      where.specialties = {
        some: {
          specialtyId,
        },
      }
    }

    // Fetch companies with pagination
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
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
          _count: {
            select: {
              reviews: true,
              favorites: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.company.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error listing companies:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
