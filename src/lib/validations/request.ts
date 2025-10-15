/**
 * Request Validation Schemas
 * Zod schemas for quote request form validation
 */

import { z } from 'zod';
import { ProjectType, RequestStatus } from '@prisma/client';

/**
 * Project type validation with enum values
 */
export const projectTypeSchema = z.nativeEnum(ProjectType);

/**
 * Request status validation
 */
export const requestStatusSchema = z.nativeEnum(RequestStatus);

/**
 * File attachment validation schema
 */
export const fileAttachmentSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  size: z.number().max(10 * 1024 * 1024, '10MB未満にしてください'),
  type: z.string(),
});

/**
 * Requirements JSON schema
 * Flexible structure to accommodate various project types
 */
export const requirementsSchema = z.object({
  features: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  designRequirements: z.string().optional(),
  targetAudience: z.string().optional(),
  integrations: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
}).optional();

/**
 * Base request validation schema
 */
export const requestBaseSchema = z.object({
  title: z
    .string()
    .min(5, '5文字以上で入力してください')
    .max(100, '100文字以内で入力してください'),
  description: z
    .string()
    .min(20, '20文字以上で入力してください')
    .max(2000, '2000文字以内で入力してください'),
  projectType: projectTypeSchema,
  budgetMin: z
    .number()
    .int()
    .positive('正の値を入力してください')
    .optional()
    .nullable(),
  budgetMax: z
    .number()
    .int()
    .positive('正の値を入力してください')
    .optional()
    .nullable(),
  deadline: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .or(z.date().optional().nullable()),
  preferredStart: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .or(z.date().optional().nullable()),
  requirements: requirementsSchema,
  attachments: z.array(z.string()).default([]),
});

/**
 * Budget validation - ensure min < max if both provided
 */
export const requestCreateSchema = requestBaseSchema
  .refine(
    (data) => {
      if (data.budgetMin && data.budgetMax) {
        return data.budgetMin < data.budgetMax;
      }
      return true;
    },
    {
      message: '最小予算は最大予算より小さい値を入力してください',
      path: ['budgetMax'],
    }
  )
  .refine(
    (data) => {
      if (data.deadline && data.preferredStart) {
        const deadline = new Date(data.deadline);
        const start = new Date(data.preferredStart);
        return start < deadline;
      }
      return true;
    },
    {
      message: '希望開始日は納期より前にしてください',
      path: ['deadline'],
    }
  );

/**
 * Update schema - all fields optional except those being updated
 */
export const requestUpdateSchema = requestBaseSchema.partial();

/**
 * Query parameters for request list
 */
export const requestQuerySchema = z.object({
  status: requestStatusSchema.optional(),
  projectType: projectTypeSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'deadline']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

/**
 * Type exports for use in components and API routes
 */
export type RequestCreateInput = z.infer<typeof requestCreateSchema>;
export type RequestUpdateInput = z.infer<typeof requestUpdateSchema>;
export type RequestQueryParams = z.infer<typeof requestQuerySchema>;
export type FileAttachment = z.infer<typeof fileAttachmentSchema>;
export type Requirements = z.infer<typeof requirementsSchema>;
