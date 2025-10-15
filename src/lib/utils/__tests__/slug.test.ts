import { describe, expect, it } from "@jest/globals"
import { generateSlug, generateUniqueSlug, isValidSlug } from "../slug"

describe("Slug Utilities", () => {
  describe("generateSlug", () => {
    it("should convert text to lowercase", () => {
      expect(generateSlug("ACME Inc.")).toBe("acme-inc")
    })

    it("should replace spaces with hyphens", () => {
      expect(generateSlug("Acme Corporation Inc")).toBe("acme-corporation-inc")
    })

    it("should remove special characters", () => {
      expect(generateSlug("Acme! @#$ Inc.")).toBe("acme-inc")
    })

    it("should handle multiple consecutive spaces", () => {
      expect(generateSlug("Acme   Inc")).toBe("acme-inc")
    })

    it("should trim leading and trailing hyphens", () => {
      expect(generateSlug("-Acme Inc-")).toBe("acme-inc")
    })

    it("should handle Japanese characters", () => {
      expect(generateSlug("アクメ株式会社")).toBe("")
    })
  })

  describe("generateUniqueSlug", () => {
    it("should append random suffix to base slug", () => {
      const baseSlug = "acme-inc"
      const uniqueSlug = generateUniqueSlug(baseSlug)

      expect(uniqueSlug).toMatch(/^acme-inc-[a-z0-9]{6}$/)
    })

    it("should generate different suffixes for multiple calls", () => {
      const baseSlug = "acme-inc"
      const slug1 = generateUniqueSlug(baseSlug)
      const slug2 = generateUniqueSlug(baseSlug)

      expect(slug1).not.toBe(slug2)
    })
  })

  describe("isValidSlug", () => {
    it("should accept valid slugs", () => {
      expect(isValidSlug("acme-inc")).toBe(true)
      expect(isValidSlug("acme123")).toBe(true)
      expect(isValidSlug("123acme")).toBe(true)
      expect(isValidSlug("a-b-c-d-e")).toBe(true)
    })

    it("should reject slugs with uppercase letters", () => {
      expect(isValidSlug("Acme-Inc")).toBe(false)
    })

    it("should reject slugs with special characters", () => {
      expect(isValidSlug("acme_inc")).toBe(false)
      expect(isValidSlug("acme.inc")).toBe(false)
      expect(isValidSlug("acme inc")).toBe(false)
    })

    it("should reject slugs starting with hyphen", () => {
      expect(isValidSlug("-acme-inc")).toBe(false)
    })

    it("should reject slugs ending with hyphen", () => {
      expect(isValidSlug("acme-inc-")).toBe(false)
    })

    it("should reject slugs that are too short", () => {
      expect(isValidSlug("a")).toBe(false)
      expect(isValidSlug("ab")).toBe(false)
    })

    it("should reject slugs that are too long", () => {
      const longSlug = "a".repeat(101)
      expect(isValidSlug(longSlug)).toBe(false)
    })

    it("should accept slugs at minimum length", () => {
      expect(isValidSlug("abc")).toBe(true)
    })

    it("should accept slugs at maximum length", () => {
      const maxSlug = "a" + "b".repeat(98) + "c"
      expect(isValidSlug(maxSlug)).toBe(true)
    })
  })
})
