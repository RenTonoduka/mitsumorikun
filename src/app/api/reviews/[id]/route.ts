/**
 * Review Detail API Routes
 * GET /api/reviews/[id] - Get review details
 * PATCH /api/reviews/[id] - Update review
 * DELETE /api/reviews/[id] - Delete review
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  updateReviewSchema,
  moderateReviewSchema,
  canEditReview,
  containsInappropriateContent,
} from "@/lib/validations/review";

/**
 * GET /api/reviews/[id]
 * Get review details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await prisma.review.findUnique({
      where: {
        id: params.id,
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
            logo: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ data: review });
  } catch (error) {
    console.error("GET /api/reviews/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reviews/[id]
 * Update review
 *
 * Business Rules:
 * - Only review owner can update (or admin for moderation)
 * - Owner can only edit within 30 days of posting
 * - Admin can moderate (publish/verify) anytime
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Fetch existing review
    const existingReview = await prisma.review.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const body = await request.json();

    // Check if this is a moderation request (admin only)
    const isModerationRequest =
      "isPublished" in body || "isVerified" in body;

    if (isModerationRequest) {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (user?.role !== "SYSTEM_ADMIN") {
        return NextResponse.json(
          { error: "Admin privileges required" },
          { status: 403 }
        );
      }

      const moderationData = moderateReviewSchema.parse(body);

      const updatedReview = await prisma.$transaction(async (tx) => {
        const review = await tx.review.update({
          where: {
            id: params.id,
          },
          data: moderationData,
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

        // Recalculate company stats if published status changed
        if ("isPublished" in moderationData) {
          const reviews = await tx.review.findMany({
            where: {
              companyId: existingReview.companyId,
              isPublished: true,
            },
            select: {
              rating: true,
            },
          });

          const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
          const averageRating =
            reviews.length > 0 ? totalRating / reviews.length : 0;
          const reviewCount = reviews.length;

          await tx.company.update({
            where: {
              id: existingReview.companyId,
            },
            data: {
              averageRating: Math.round(averageRating * 10) / 10,
              reviewCount,
            },
          });
        }

        return review;
      });

      return NextResponse.json({
        message: "Review moderated successfully",
        data: updatedReview,
      });
    }

    // Regular update by review owner
    if (existingReview.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only edit your own reviews" },
        { status: 403 }
      );
    }

    // Check if review can still be edited (within 30 days)
    if (!canEditReview(existingReview.createdAt)) {
      return NextResponse.json(
        { error: "Reviews can only be edited within 30 days of posting" },
        { status: 403 }
      );
    }

    const validatedData = updateReviewSchema.parse(body);

    // Check for inappropriate content if content is being updated
    if (
      validatedData.content &&
      containsInappropriateContent(validatedData.content)
    ) {
      return NextResponse.json(
        { error: "Review contains inappropriate content" },
        { status: 400 }
      );
    }

    // Update review and recalculate company stats in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.review.update({
        where: {
          id: params.id,
        },
        data: validatedData,
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

      // Recalculate company stats if rating changed
      if (validatedData.rating !== undefined) {
        const reviews = await tx.review.findMany({
          where: {
            companyId: existingReview.companyId,
            isPublished: true,
          },
          select: {
            rating: true,
          },
        });

        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRating / reviews.length;

        await tx.company.update({
          where: {
            id: existingReview.companyId,
          },
          data: {
            averageRating: Math.round(averageRating * 10) / 10,
          },
        });
      }

      return review;
    });

    return NextResponse.json({
      message: "Review updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("PATCH /api/reviews/[id] error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[id]
 * Delete review
 *
 * Business Rules:
 * - Only review owner can delete (or admin)
 * - Recalculates company average rating after deletion
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Fetch existing review
    const existingReview = await prisma.review.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isOwner = existingReview.userId === session.user.id;
    const isAdmin = user?.role === "SYSTEM_ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You can only delete your own reviews" },
        { status: 403 }
      );
    }

    // Delete review and update company stats in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: {
          id: params.id,
        },
      });

      // Recalculate company stats
      const reviews = await tx.review.findMany({
        where: {
          companyId: existingReview.companyId,
          isPublished: true,
        },
        select: {
          rating: true,
        },
      });

      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating =
        reviews.length > 0 ? totalRating / reviews.length : 0;
      const reviewCount = reviews.length;

      await tx.company.update({
        where: {
          id: existingReview.companyId,
        },
        data: {
          averageRating: Math.round(averageRating * 10) / 10,
          reviewCount,
        },
      });
    });

    return NextResponse.json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/reviews/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
