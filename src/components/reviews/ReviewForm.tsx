/**
 * Review Form Component
 * Form for creating and editing reviews
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StarRating } from "./StarRating";
import { ProjectType } from "@prisma/client";

interface ReviewFormProps {
  companyId: string;
  companyName: string;
  initialData?: {
    id: string;
    rating: number;
    title?: string;
    content: string;
    projectType?: ProjectType;
    projectDuration?: string;
    projectCost?: string;
  };
  mode?: "create" | "edit";
}

const projectTypeOptions = [
  { value: "WEB_DEVELOPMENT", label: "Web Development" },
  { value: "MOBILE_APP", label: "Mobile App" },
  { value: "AI_ML", label: "AI/ML" },
  { value: "SYSTEM_INTEGRATION", label: "System Integration" },
  { value: "CONSULTING", label: "Consulting" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OTHER", label: "Other" },
];

export function ReviewForm({
  companyId,
  companyName,
  initialData,
  mode = "create",
}: ReviewFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [projectType, setProjectType] = useState<ProjectType | "">(
    initialData?.projectType || ""
  );
  const [projectDuration, setProjectDuration] = useState(
    initialData?.projectDuration || ""
  );
  const [projectCost, setProjectCost] = useState(
    initialData?.projectCost || ""
  );

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (rating === 0) {
      newErrors.rating = "Please select a rating";
    }

    if (title && (title.length < 5 || title.length > 100)) {
      newErrors.title = "Title must be between 5 and 100 characters";
    }

    if (content.length < 20) {
      newErrors.content = "Review must be at least 20 characters";
    }

    if (content.length > 500) {
      newErrors.content = "Review must be at most 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const url =
        mode === "create"
          ? "/api/reviews"
          : `/api/reviews/${initialData?.id}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const payload: any = {
        rating,
        content,
        title: title || undefined,
        projectType: projectType || undefined,
        projectDuration: projectDuration || undefined,
        projectCost: projectCost || undefined,
      };

      if (mode === "create") {
        payload.companyId = companyId;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      // Redirect to company page
      const slug = data.data?.company?.slug || companyId;
      router.push(`/companies/${slug}?tab=reviews`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Name */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === "create" ? "Write a Review for" : "Edit Review for"}{" "}
          {companyName}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Share your experience with this company
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating <span className="text-red-500">*</span>
        </label>
        <StarRating
          value={rating}
          onChange={setRating}
          size="lg"
          disabled={isSubmitting}
        />
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Review Title (Optional)
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          placeholder="Brief summary of your experience"
          maxLength={100}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <p className="mt-1 text-sm text-gray-500">{title.length}/100</p>
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Content */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          Review <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
          placeholder="Tell us about your experience working with this company..."
          rows={6}
          maxLength={500}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <p className="mt-1 text-sm text-gray-500">{content.length}/500</p>
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
      </div>

      {/* Project Information */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Project Information (Optional)
        </h3>

        <div className="space-y-4">
          {/* Project Type */}
          <div>
            <label
              htmlFor="projectType"
              className="block text-sm font-medium text-gray-700"
            >
              Project Type
            </label>
            <select
              id="projectType"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as ProjectType)}
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select a project type</option>
              {projectTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Project Duration */}
          <div>
            <label
              htmlFor="projectDuration"
              className="block text-sm font-medium text-gray-700"
            >
              Project Duration
            </label>
            <input
              type="text"
              id="projectDuration"
              value={projectDuration}
              onChange={(e) => setProjectDuration(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g., 3 months, 6 weeks"
              maxLength={50}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Project Cost */}
          <div>
            <label
              htmlFor="projectCost"
              className="block text-sm font-medium text-gray-700"
            >
              Project Cost
            </label>
            <input
              type="text"
              id="projectCost"
              value={projectCost}
              onChange={(e) => setProjectCost(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g., 5M-10M yen"
              maxLength={50}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting
            ? mode === "create"
              ? "Submitting..."
              : "Updating..."
            : mode === "create"
              ? "Submit Review"
              : "Update Review"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-6 bg-white text-gray-700 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Review Guidelines
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Be honest and constructive in your feedback</li>
          <li>Focus on your personal experience</li>
          <li>Avoid inappropriate language or personal attacks</li>
          <li>Reviews can be edited within 30 days of posting</li>
        </ul>
      </div>
    </form>
  );
}
