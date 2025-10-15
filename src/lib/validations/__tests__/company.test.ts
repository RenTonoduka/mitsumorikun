import { describe, expect, it } from "@jest/globals"
import {
  companyBasicInfoSchema,
  companyContactInfoSchema,
  companyImagesSchema,
  companyTechSpecSchema,
  companyRegistrationSchema,
  imageUploadSchema,
} from "../company"

describe("Company Validation Schemas", () => {
  describe("companyBasicInfoSchema", () => {
    it("should validate valid basic info", () => {
      const validData = {
        name: "Acme Inc.",
        nameKana: "アクメ",
        description: "A great company",
        foundedYear: 2020,
        employeeCount: "10-50",
        capital: "10M JPY",
      }

      const result = companyBasicInfoSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject name that is too short", () => {
      const invalidData = {
        name: "A",
      }

      const result = companyBasicInfoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject invalid founded year", () => {
      const invalidData = {
        name: "Acme Inc.",
        foundedYear: 1800,
      }

      const result = companyBasicInfoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject future founded year", () => {
      const invalidData = {
        name: "Acme Inc.",
        foundedYear: 2100,
      }

      const result = companyBasicInfoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe("companyContactInfoSchema", () => {
    it("should validate valid contact info", () => {
      const validData = {
        address: "123 Main St, Tokyo",
        phone: "+81-3-1234-5678",
        email: "contact@example.com",
        website: "https://example.com",
      }

      const result = companyContactInfoSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject invalid email", () => {
      const invalidData = {
        email: "not-an-email",
      }

      const result = companyContactInfoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject invalid website URL", () => {
      const invalidData = {
        website: "not-a-url",
      }

      const result = companyContactInfoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject phone with invalid characters", () => {
      const invalidData = {
        phone: "abc-123-xyz",
      }

      const result = companyContactInfoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe("companyImagesSchema", () => {
    it("should validate valid image URLs", () => {
      const validData = {
        logo: "https://example.com/logo.png",
        coverImage: "https://example.com/cover.jpg",
      }

      const result = companyImagesSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject invalid logo URL", () => {
      const invalidData = {
        logo: "not-a-url",
      }

      const result = companyImagesSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe("companyTechSpecSchema", () => {
    it("should validate valid tech stacks and specialties", () => {
      const validData = {
        techStackIds: ["cuid1", "cuid2"],
        specialtyIds: ["cuid3", "cuid4"],
      }

      const result = companyTechSpecSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject empty tech stack array", () => {
      const invalidData = {
        techStackIds: [],
        specialtyIds: ["cuid1"],
      }

      const result = companyTechSpecSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject empty specialty array", () => {
      const invalidData = {
        techStackIds: ["cuid1"],
        specialtyIds: [],
      }

      const result = companyTechSpecSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject too many tech stacks", () => {
      const invalidData = {
        techStackIds: Array(21).fill("cuid"),
        specialtyIds: ["cuid1"],
      }

      const result = companyTechSpecSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe("companyRegistrationSchema", () => {
    it("should validate complete registration data", () => {
      const validData = {
        name: "Acme Inc.",
        nameKana: "アクメ",
        description: "A great company",
        foundedYear: 2020,
        employeeCount: "10-50",
        capital: "10M JPY",
        address: "123 Main St",
        phone: "+81-3-1234-5678",
        email: "contact@example.com",
        website: "https://example.com",
        logo: "https://example.com/logo.png",
        coverImage: "https://example.com/cover.jpg",
        techStackIds: ["cuid1", "cuid2"],
        specialtyIds: ["cuid3", "cuid4"],
      }

      const result = companyRegistrationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})
