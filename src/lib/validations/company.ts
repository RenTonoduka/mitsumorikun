import { z } from "zod"

/**
 * Company registration validation schema
 * Multi-step form validation for company registration
 */

// Step 1: Basic Information
export const companyBasicInfoSchema = z.object({
  name: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must not exceed 100 characters"),
  nameKana: z
    .string()
    .max(100, "Company name (Kana) must not exceed 100 characters")
    .optional()
    .nullable(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must not exceed 2000 characters")
    .optional()
    .nullable(),
  foundedYear: z
    .number()
    .int()
    .min(1900, "Founded year must be after 1900")
    .max(new Date().getFullYear(), "Founded year cannot be in the future")
    .optional()
    .nullable(),
  employeeCount: z
    .string()
    .max(50, "Employee count must not exceed 50 characters")
    .optional()
    .nullable(),
  capital: z
    .string()
    .max(50, "Capital must not exceed 50 characters")
    .optional()
    .nullable(),
})

// Step 2: Contact Information
export const companyContactInfoSchema = z.object({
  address: z
    .string()
    .max(200, "Address must not exceed 200 characters")
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(/^[0-9\-+() ]*$/, "Phone number contains invalid characters")
    .max(20, "Phone number must not exceed 20 characters")
    .optional()
    .nullable(),
  email: z
    .string()
    .email("Invalid email address")
    .max(100, "Email must not exceed 100 characters")
    .optional()
    .nullable(),
  website: z
    .string()
    .url("Invalid website URL")
    .max(200, "Website URL must not exceed 200 characters")
    .optional()
    .nullable(),
})

// Step 3: Images
export const companyImagesSchema = z.object({
  logo: z
    .string()
    .url("Invalid logo URL")
    .max(500, "Logo URL must not exceed 500 characters")
    .optional()
    .nullable(),
  coverImage: z
    .string()
    .url("Invalid cover image URL")
    .max(500, "Cover image URL must not exceed 500 characters")
    .optional()
    .nullable(),
})

// Step 4: Tech Stacks & Specialties
export const companyTechSpecSchema = z.object({
  techStackIds: z
    .array(z.string().cuid("Invalid tech stack ID"))
    .min(1, "At least one tech stack is required")
    .max(20, "Maximum 20 tech stacks allowed"),
  specialtyIds: z
    .array(z.string().cuid("Invalid specialty ID"))
    .min(1, "At least one specialty is required")
    .max(10, "Maximum 10 specialties allowed"),
})

// Complete company registration schema (all steps combined)
export const companyRegistrationSchema = companyBasicInfoSchema
  .merge(companyContactInfoSchema)
  .merge(companyImagesSchema)
  .merge(companyTechSpecSchema)

// Company update schema (partial update allowed)
export const companyUpdateSchema = companyBasicInfoSchema
  .merge(companyContactInfoSchema)
  .merge(companyImagesSchema)
  .merge(companyTechSpecSchema)
  .partial()

// Image upload validation
export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "Image size must be less than 5MB")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type),
      "Only JPEG, PNG, WebP, and GIF images are allowed"
    ),
})

// Type exports
export type CompanyBasicInfo = z.infer<typeof companyBasicInfoSchema>
export type CompanyContactInfo = z.infer<typeof companyContactInfoSchema>
export type CompanyImages = z.infer<typeof companyImagesSchema>
export type CompanyTechSpec = z.infer<typeof companyTechSpecSchema>
export type CompanyRegistration = z.infer<typeof companyRegistrationSchema>
export type CompanyUpdate = z.infer<typeof companyUpdateSchema>
export type ImageUpload = z.infer<typeof imageUploadSchema>
