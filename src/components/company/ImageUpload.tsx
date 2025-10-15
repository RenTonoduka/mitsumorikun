"use client"

import * as React from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { validateImageFile, fileToBase64 } from "@/lib/utils/upload"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  label?: string
  description?: string
  maxSize?: number // in MB
  aspectRatio?: string
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label,
  description,
  maxSize = 5,
  aspectRatio = "16/9",
  className,
}: ImageUploadProps) {
  const [preview, setPreview] = React.useState<string | undefined>(value)
  const [isDragging, setIsDragging] = React.useState(false)
  const [error, setError] = React.useState<string | undefined>()
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setPreview(value)
  }, [value])

  const handleFile = async (file: File) => {
    setError(undefined)

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    try {
      setIsUploading(true)

      // Convert to base64 for preview
      const base64 = await fileToBase64(file)
      setPreview(base64)

      // TODO: Upload to cloud storage
      // For now, just use the base64 as the URL
      // In production, upload to a real storage service
      onChange(base64)
    } catch (err) {
      setError(err instanceof Error ? err.message : "アップロードに失敗しました")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    []
  )

  const handleDragOver = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleRemove = () => {
    setPreview(undefined)
    setError(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (onRemove) {
      onRemove()
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      {description && <p className="text-sm text-gray-500">{description}</p>}

      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors",
          isDragging
            ? "border-blue-600 bg-blue-50"
            : "border-gray-300 hover:border-gray-400",
          preview && "border-solid"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{ aspectRatio }}
      >
        {preview ? (
          <div className="relative h-full w-full">
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white shadow-lg transition-colors hover:bg-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            className="flex h-full cursor-pointer flex-col items-center justify-center gap-2 p-6 text-center"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                <p className="text-sm text-gray-600">アップロード中...</p>
              </div>
            ) : (
              <>
                <div className="rounded-full bg-gray-100 p-3">
                  <Upload className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    クリックまたはドラッグ&ドロップでアップロード
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG、JPG、WebP、またはGIF (最大 {maxSize}MB)
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
