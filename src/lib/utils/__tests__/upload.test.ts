import { describe, expect, it } from "@jest/globals"
import { validateImageFile } from "../upload"

describe("Upload Utilities", () => {
  describe("validateImageFile", () => {
    it("should accept valid JPEG file", () => {
      const file = new File(["content"], "image.jpg", { type: "image/jpeg" })
      Object.defineProperty(file, "size", { value: 1024 * 1024 }) // 1MB

      const result = validateImageFile(file)
      expect(result.valid).toBe(true)
    })

    it("should accept valid PNG file", () => {
      const file = new File(["content"], "image.png", { type: "image/png" })
      Object.defineProperty(file, "size", { value: 1024 * 1024 })

      const result = validateImageFile(file)
      expect(result.valid).toBe(true)
    })

    it("should accept valid WebP file", () => {
      const file = new File(["content"], "image.webp", { type: "image/webp" })
      Object.defineProperty(file, "size", { value: 1024 * 1024 })

      const result = validateImageFile(file)
      expect(result.valid).toBe(true)
    })

    it("should accept valid GIF file", () => {
      const file = new File(["content"], "image.gif", { type: "image/gif" })
      Object.defineProperty(file, "size", { value: 1024 * 1024 })

      const result = validateImageFile(file)
      expect(result.valid).toBe(true)
    })

    it("should reject file that is too large", () => {
      const file = new File(["content"], "image.jpg", { type: "image/jpeg" })
      Object.defineProperty(file, "size", { value: 6 * 1024 * 1024 }) // 6MB

      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain("5MB")
    })

    it("should reject invalid file type", () => {
      const file = new File(["content"], "document.pdf", { type: "application/pdf" })
      Object.defineProperty(file, "size", { value: 1024 * 1024 })

      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain("JPEG, PNG, WebP, and GIF")
    })

    it("should accept file at max size limit", () => {
      const file = new File(["content"], "image.jpg", { type: "image/jpeg" })
      Object.defineProperty(file, "size", { value: 5 * 1024 * 1024 }) // Exactly 5MB

      const result = validateImageFile(file)
      expect(result.valid).toBe(true)
    })
  })
})
