/**
 * Company Reviews API Route
 * GET /api/companies/[id]/reviews - Get all reviews for a company
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { companyReviewQuerySchema } from "@/lib/validations/review";
import { Prisma } from "@prisma/client";

/**
 * GET /api/companies/[id]/reviews
 * Get all reviews for a specific company with filters and pagination
 *
 * Query parameters:
 * - projectType: Filter by project type
 * - rating: Filter by rating (1-5)
 * - sortBy: Sort order (latest, oldest, highest, lowest)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 50)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        averageRating: true,
        reviewCount: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const queryParams = {
      projectType: searchParams.get("projectType") || undefined,
      rating: searchParams.get("rating") || undefined,
      sortBy: searchParams.get("sortBy") || "latest",
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
    };

    const validatedQuery = companyReviewQuerySchema.parse(queryParams);

    // Build filter conditions
    const where: Prisma.ReviewWhereInput = {
      companyId: params.id,
      isPublished: true, // Only show published reviews
    };

    if (validatedQuery.projectType) {
      where.projectType = validatedQuery.projectType;
    }

    if (validatedQuery.rating) {
      where.rating = validatedQuery.rating;
    }

    // Build sort order
    const orderBy: Prisma.ReviewOrderByWithRelationInput = {};

    switch (validatedQuery.sortBy) {
      case "latest":
        orderBy.createdAt = "desc";
        break;
      case "oldest":
        orderBy.createdAt = "asc";
        break;
      case "highest":
        orderBy.rating = "desc";
        break;
      case "lowest":
        orderBy.rating = "asc";
        break;
    }

    // Calculate pagination
    const skip = (validatedQuery.page - 1) * validatedQuery.limit;

    // Fetch reviews with pagination
    const [reviews, totalCount, ratingDistribution] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy,
        skip,
        take: validatedQuery.limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
      // Get rating distribution
      prisma.review.groupBy({
        by: ["rating"],
        where: {
          companyId: params.id,
          isPublished: true,
        },
        _count: {
          rating: true,
        },
      }),
    ]);

    // Format rating distribution
    const ratingStats = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    ratingDistribution.forEach((item) => {
      ratingStats[item.rating as keyof typeof ratingStats] = item._count.rating;
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / validatedQuery.limit);
    const hasNextPage = validatedQuery.page < totalPages;
    const hasPreviousPage = validatedQuery.page > 1;

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        averageRating: company.averageRating,
        reviewCount: company.reviewCount,
      },
      ratingStats,
      data: reviews,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    console.error("GET /api/companies/[id]/reviews error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch company reviews" },
      { status: 500 }
    );
  }
}
