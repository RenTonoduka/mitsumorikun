import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { companyUpdateSchema } from "@/lib/validations/company"
import { generateSlug, generateUniqueSlug, isValidSlug } from "@/lib/utils/slug"
import { z } from "zod"

/**
 * GET /api/companies/[id]
 * Get company by ID
 * Public endpoint
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
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
    console.error("Error fetching company:", error)

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
 * PATCH /api/companies/[id]
 * Update company
 * Requires authentication and ownership
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        companyUsers: true,
      },
    })

    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Check if user is owner or admin
    const isOwnerOrAdmin = existingCompany.companyUsers.some(
      (cu) =>
        cu.userId === user.id && (cu.role === "OWNER" || cu.role === "ADMIN")
    )

    if (!isOwnerOrAdmin && user.role !== "SYSTEM_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Parse and validate request body
    const body = await req.json()
    const validatedData = companyUpdateSchema.parse(body)

    // Handle slug update if name changed
    let slug = existingCompany.slug
    if (validatedData.name && validatedData.name !== existingCompany.name) {
      slug = generateSlug(validatedData.name)

      if (!isValidSlug(slug)) {
        slug = generateUniqueSlug(slug)
      }

      // Check if new slug already exists
      const slugExists = await prisma.company.findFirst({
        where: {
          slug,
          id: { not: params.id },
        },
      })

      if (slugExists) {
        slug = generateUniqueSlug(slug)
      }
    }

    // Update company with relations in a transaction
    const updatedCompany = await prisma.$transaction(async (tx) => {
      // Update basic company info
      const company = await tx.company.update({
        where: { id: params.id },
        data: {
          ...(validatedData.name && { name: validatedData.name }),
          ...(validatedData.nameKana !== undefined && {
            nameKana: validatedData.nameKana,
          }),
          ...(slug !== existingCompany.slug && { slug }),
          ...(validatedData.logo !== undefined && { logo: validatedData.logo }),
          ...(validatedData.coverImage !== undefined && {
            coverImage: validatedData.coverImage,
          }),
          ...(validatedData.description !== undefined && {
            description: validatedData.description,
          }),
          ...(validatedData.foundedYear !== undefined && {
            foundedYear: validatedData.foundedYear,
          }),
          ...(validatedData.employeeCount !== undefined && {
            employeeCount: validatedData.employeeCount,
          }),
          ...(validatedData.capital !== undefined && {
            capital: validatedData.capital,
          }),
          ...(validatedData.address !== undefined && {
            address: validatedData.address,
          }),
          ...(validatedData.phone !== undefined && { phone: validatedData.phone }),
          ...(validatedData.email !== undefined && { email: validatedData.email }),
          ...(validatedData.website !== undefined && {
            website: validatedData.website,
          }),
        },
      })

      // Update tech stacks if provided
      if (validatedData.techStackIds) {
        // Delete existing tech stacks
        await tx.companyTechStack.deleteMany({
          where: { companyId: params.id },
        })

        // Create new tech stacks
        if (validatedData.techStackIds.length > 0) {
          await tx.companyTechStack.createMany({
            data: validatedData.techStackIds.map((techStackId) => ({
              companyId: params.id,
              techStackId,
            })),
          })
        }
      }

      // Update specialties if provided
      if (validatedData.specialtyIds) {
        // Delete existing specialties
        await tx.companySpecialty.deleteMany({
          where: { companyId: params.id },
        })

        // Create new specialties
        if (validatedData.specialtyIds.length > 0) {
          await tx.companySpecialty.createMany({
            data: validatedData.specialtyIds.map((specialtyId) => ({
              companyId: params.id,
              specialtyId,
            })),
          })
        }
      }

      return company
    })

    // Fetch complete updated company with relations
    const completeCompany = await prisma.company.findUnique({
      where: { id: updatedCompany.id },
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

    return NextResponse.json({
      success: true,
      data: completeCompany,
      message: "Company updated successfully",
    })
  } catch (error) {
    console.error("Error updating company:", error)

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
 * DELETE /api/companies/[id]
 * Delete company
 * Requires authentication and ownership
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        companyUsers: true,
      },
    })

    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Check if user is owner
    const isOwner = existingCompany.companyUsers.some(
      (cu) => cu.userId === user.id && cu.role === "OWNER"
    )

    if (!isOwner && user.role !== "SYSTEM_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete company (cascade will handle related records)
    await prisma.company.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: "Company deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting company:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
