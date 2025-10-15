/**
 * Review Validation Schemas
 * Zod schemas for review form validation and API request validation
 */

import { z } from "zod";
import { ProjectType } from "@prisma/client";

/**
 * Review rating validation (1-5 stars)
 */
export const reviewRatingSchema = z
  .number()
  .int()
  .min(1, "Rating must be at least 1")
  .max(5, "Rating must be at most 5");

/**
 * Review title validation (optional, 5-100 chars)
 */
export const reviewTitleSchema = z
  .string()
  .min(5, "Title must be at least 5 characters")
  .max(100, "Title must be at most 100 characters")
  .optional();

/**
 * Review content validation (required, 20-500 chars)
 */
export const reviewContentSchema = z
  .string()
  .min(20, "Review must be at least 20 characters")
  .max(500, "Review must be at most 500 characters");

/**
 * Project type validation
 */
export const reviewProjectTypeSchema = z.nativeEnum(ProjectType).optional();

/**
 * Project duration validation
 */
export const reviewProjectDurationSchema = z
  .string()
  .max(50, "Project duration must be at most 50 characters")
  .optional();

/**
 * Project cost validation
 */
export const reviewProjectCostSchema = z
  .string()
  .max(50, "Project cost must be at most 50 characters")
  .optional();

/**
 * Review creation schema
 */
export const createReviewSchema = z.object({
  companyId: z.string().cuid("Invalid company ID"),
  rating: reviewRatingSchema,
  title: reviewTitleSchema,
  content: reviewContentSchema,
  projectType: reviewProjectTypeSchema,
  projectDuration: reviewProjectDurationSchema,
  projectCost: reviewProjectCostSchema,
});

/**
 * Review update schema
 * Allows partial updates with optional fields
 */
export const updateReviewSchema = z.object({
  rating: reviewRatingSchema.optional(),
  title: reviewTitleSchema.nullable(),
  content: reviewContentSchema.optional(),
  projectType: reviewProjectTypeSchema.nullable(),
  projectDuration: reviewProjectDurationSchema.nullable(),
  projectCost: reviewProjectCostSchema.nullable(),
});

/**
 * Review moderation schema
 * For admin actions only
 */
export const moderateReviewSchema = z.object({
  isPublished: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

/**
 * Review query parameters schema
 */
export const reviewQuerySchema = z.object({
  companyId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
  projectType: reviewProjectTypeSchema,
  rating: z.coerce.number().int().min(1).max(5).optional(),
  isPublished: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  isVerified: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  sortBy: z.enum(["latest", "oldest", "highest", "lowest"]).default("latest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

/**
 * Company review query schema
 */
export const companyReviewQuerySchema = z.object({
  projectType: reviewProjectTypeSchema,
  rating: z.coerce.number().int().min(1).max(5).optional(),
  sortBy: z.enum(["latest", "oldest", "highest", "lowest"]).default("latest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// Type exports
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;
export type ReviewQueryInput = z.infer<typeof reviewQuerySchema>;
export type CompanyReviewQueryInput = z.infer<typeof companyReviewQuerySchema>;

/**
 * Inappropriate content filter
 * Basic content moderation for Japanese and English
 */
const inappropriateWords = [
  // English
  "spam",
  "scam",
  "fraud",
  "fake",
  "illegal",
  // Japanese
  "詐欺",
  "スパム",
  "違法",
  "偽物",
];

/**
 * Check if content contains inappropriate words
 */
export function containsInappropriateContent(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return inappropriateWords.some((word) => lowerContent.includes(word));
}

/**
 * Validate review edit permissions
 * Users can only edit within 30 days of posting
 */
export function canEditReview(createdAt: Date): boolean {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return createdAt >= thirtyDaysAgo;
}

/**
 * Calculate average rating
 */
export function calculateAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal place
}
