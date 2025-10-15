/**
 * File Upload Component
 * Handles file uploads with drag-and-drop support
 * Max 10MB per file
 */

'use client';

import React, { useCallback, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  disabled?: boolean;
}

interface UploadedFile {
  name: string;
  url: string;
  size: number;
}

export function FileUpload({
  value = [],
  onChange,
  maxFiles = 5,
  maxSizeMB = 10,
  accept = '*/*',
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  // Convert file to base64 for demo purposes
  // In production, use a proper file upload service like Vercel Blob
  const uploadFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        reject(new Error(`File size exceeds ${maxSizeMB}MB`));
        return;
      }

      // For demo: return a placeholder URL
      // In production: upload to cloud storage
      const reader = new FileReader();
      reader.onload = () => {
        // Create a mock URL - in production, this would be your storage URL
        const mockUrl = `https://storage.example.com/${Date.now()}-${file.name}`;
        resolve(mockUrl);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      if (disabled) return;
      if (files.length + fileList.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      setUploading(true);

      try {
        const uploadPromises = Array.from(fileList).map(async (file) => {
          const url = await uploadFile(file);
          return {
            name: file.name,
            url,
            size: file.size,
          };
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        const newFiles = [...files, ...uploadedFiles];
        setFiles(newFiles);

        // Update form value
        onChange?.(newFiles.map((f) => f.url));
      } catch (error) {
        console.error('Upload error:', error);
        alert(error instanceof Error ? error.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [files, maxFiles, onChange, disabled, maxSizeMB]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      onChange?.(newFiles.map((f) => f.url));
    },
    [files, onChange]
  );

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          isDragging
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled || uploading}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm text-gray-600">
            {uploading ? (
              <span className="font-medium text-blue-600">Uploading...</span>
            ) : (
              <>
                Drag and drop files here, or{' '}
                <span className="font-medium text-blue-600">browse</span>
              </>
            )}
          </p>
          <p className="text-xs text-gray-500">
            Max {maxFiles} files, up to {maxSizeMB}MB each
          </p>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Uploaded files ({files.length}/{maxFiles})
          </p>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-3"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
