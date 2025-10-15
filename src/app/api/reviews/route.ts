/**
 * Review API Routes
 * POST /api/reviews - Create a new review
 * GET /api/reviews - List reviews with filters and pagination
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createReviewSchema,
  reviewQuerySchema,
  containsInappropriateContent,
} from "@/lib/validations/review";
import { Prisma } from "@prisma/client";

/**
 * POST /api/reviews
 * Create a new review
 *
 * Business Rules:
 * - User must be authenticated
 * - One review per user per company
 * - Cannot review own company
 * - Content moderation for inappropriate words
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createReviewSchema.parse(body);

    // Check if user is trying to review their own company
    const companyUser = await prisma.companyUser.findFirst({
      where: {
        userId: session.user.id,
        companyId: validatedData.companyId,
      },
    });

    if (companyUser) {
      return NextResponse.json(
        { error: "Cannot review your own company" },
        { status: 403 }
      );
    }

    // Check if user has already reviewed this company
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        companyId: validatedData.companyId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this company" },
        { status: 409 }
      );
    }

    // Check for inappropriate content
    if (containsInappropriateContent(validatedData.content)) {
      return NextResponse.json(
        {
          error:
            "Review contains inappropriate content and cannot be published",
        },
        { status: 400 }
      );
    }

    // Create review and update company stats in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create review
      const review = await tx.review.create({
        data: {
          userId: session.user.id,
          companyId: validatedData.companyId,
          rating: validatedData.rating,
          title: validatedData.title || null,
          content: validatedData.content,
          projectType: validatedData.projectType || null,
          projectDuration: validatedData.projectDuration || null,
          projectCost: validatedData.projectCost || null,
          isPublished: true,
          isVerified: false,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      // Calculate new average rating
      const reviews = await tx.review.findMany({
        where: {
          companyId: validatedData.companyId,
          isPublished: true,
        },
        select: {
          rating: true,
        },
      });

      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / reviews.length;
      const reviewCount = reviews.length;

      // Update company stats
      await tx.company.update({
        where: {
          id: validatedData.companyId,
        },
        data: {
          averageRating: Math.round(averageRating * 10) / 10,
          reviewCount,
        },
      });

      return review;
    });

    return NextResponse.json(
      {
        message: "Review created successfully",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/reviews error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews
 * List reviews with filters and pagination
 *
 * Query parameters:
 * - companyId: Filter by company ID
 * - userId: Filter by user ID
 * - projectType: Filter by project type
 * - rating: Filter by rating (1-5)
 * - isPublished: Filter by published status
 * - isVerified: Filter by verified status
 * - sortBy: Sort order (latest, oldest, highest, lowest)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const queryParams = {
      companyId: searchParams.get("companyId") || undefined,
      userId: searchParams.get("userId") || undefined,
      projectType: searchParams.get("projectType") || undefined,
      rating: searchParams.get("rating") || undefined,
      isPublished: searchParams.get("isPublished") || undefined,
      isVerified: searchParams.get("isVerified") || undefined,
      sortBy: searchParams.get("sortBy") || "latest",
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
    };

    const validatedQuery = reviewQuerySchema.parse(queryParams);

    // Build filter conditions
    const where: Prisma.ReviewWhereInput = {};

    if (validatedQuery.companyId) {
      where.companyId = validatedQuery.companyId;
    }

    if (validatedQuery.userId) {
      where.userId = validatedQuery.userId;
    }

    if (validatedQuery.projectType) {
      where.projectType = validatedQuery.projectType;
    }

    if (validatedQuery.rating) {
      where.rating = validatedQuery.rating;
    }

    if (validatedQuery.isPublished !== undefined) {
      where.isPublished = validatedQuery.isPublished;
    }

    if (validatedQuery.isVerified !== undefined) {
      where.isVerified = validatedQuery.isVerified;
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
    const [reviews, totalCount] = await Promise.all([
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
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / validatedQuery.limit);
    const hasNextPage = validatedQuery.page < totalPages;
    const hasPreviousPage = validatedQuery.page > 1;

    return NextResponse.json({
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
    console.error("GET /api/reviews error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
