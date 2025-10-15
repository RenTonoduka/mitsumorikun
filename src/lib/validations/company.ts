import { z } from "zod"

/**
 * Company registration validation schema
 * Multi-step form validation for company registration
 */

// Step 1: Basic Information
export const companyBasicInfoSchema = z.object({
  name: z
    .string()
    .min(2, "2文字以上で入力してください")
    .max(100, "100文字以内で入力してください"),
  nameKana: z
    .string()
    .max(100, "100文字以内で入力してください")
    .optional()
    .nullable(),
  description: z
    .string()
    .min(10, "10文字以上で入力してください")
    .max(2000, "2000文字以内で入力してください")
    .optional()
    .nullable(),
  foundedYear: z
    .number()
    .int()
    .min(1900, "1900年以降を指定してください")
    .max(new Date().getFullYear(), "未来の年は指定できません")
    .optional()
    .nullable(),
  employeeCount: z
    .string()
    .max(50, "50文字以内で入力してください")
    .optional()
    .nullable(),
  capital: z
    .string()
    .max(50, "50文字以内で入力してください")
    .optional()
    .nullable(),
})

// Step 2: Contact Information
export const companyContactInfoSchema = z.object({
  address: z
    .string()
    .max(200, "200文字以内で入力してください")
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(/^[0-9\-+() ]*$/, "無効な文字が含まれています")
    .max(20, "20文字以内で入力してください")
    .optional()
    .nullable(),
  email: z
    .string()
    .email("メールアドレスの形式が正しくありません")
    .max(100, "100文字以内で入力してください")
    .optional()
    .nullable(),
  website: z
    .string()
    .url("URLの形式が正しくありません")
    .max(200, "200文字以内で入力してください")
    .optional()
    .nullable(),
})

// Step 3: Images
export const companyImagesSchema = z.object({
  logo: z
    .string()
    .url("URLの形式が正しくありません")
    .max(500, "500文字以内で入力してください")
    .optional()
    .nullable(),
  coverImage: z
    .string()
    .url("URLの形式が正しくありません")
    .max(500, "500文字以内で入力してください")
    .optional()
    .nullable(),
})

// Step 4: Tech Stacks & Specialties
export const companyTechSpecSchema = z.object({
  techStackIds: z
    .array(z.string().cuid("無効な技術スタックIDです"))
    .min(1, "少なくとも1つの技術スタックを選択してください")
    .max(20, "最大20まで選択できます"),
  specialtyIds: z
    .array(z.string().cuid("無効な専門分野IDです"))
    .min(1, "少なくとも1つの専門分野を選択してください")
    .max(10, "最大10まで選択できます"),
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
    .refine((file) => file.size <= 5 * 1024 * 1024, "5MB未満にしてください")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type),
      "JPEG、PNG、WebP、GIF形式のみ使用できます"
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
