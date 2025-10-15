/**
 * Review Card Component
 * Displays a single review with user info, rating, and content
 */

"use client";

import { StarDisplay } from "./StarDisplay";
import { BadgeCheck, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectType } from "@prisma/client";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title?: string | null;
    content: string;
    projectType?: ProjectType | null;
    projectDuration?: string | null;
    projectCost?: string | null;
    isVerified: boolean;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
  currentUserId?: string;
  isAdmin?: boolean;
}

const projectTypeLabels: Record<ProjectType, string> = {
  WEB_DEVELOPMENT: "Web Development",
  MOBILE_APP: "Mobile App",
  AI_ML: "AI/ML",
  SYSTEM_INTEGRATION: "System Integration",
  CONSULTING: "Consulting",
  MAINTENANCE: "Maintenance",
  OTHER: "Other",
};

export function ReviewCard({
  review,
  currentUserId,
  isAdmin = false,
}: ReviewCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOwner = currentUserId === review.user.id;
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;

  const handleEdit = () => {
    router.push(`/reviews/${review.id}/edit`);
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header: User Info and Rating */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* User Avatar */}
          {review.user.image ? (
            <img
              src={review.user.image}
              alt={review.user.name || "User"}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 font-medium">
                {(review.user.name || "U")[0].toUpperCase()}
              </span>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">
                {review.user.name || "Anonymous"}
              </p>
              {review.isVerified && (
                <BadgeCheck className="w-4 h-4 text-blue-600" aria-label="Verified Review" />
              )}
            </div>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(review.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        {/* Actions */}
        {(canEdit || canDelete) && (
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={handleEdit}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                aria-label="Edit review"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                aria-label={showDeleteConfirm ? "Click again to confirm" : "Delete review"}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-3">
        <StarDisplay rating={review.rating} size="sm" showValue={false} />
      </div>

      {/* Title */}
      {review.title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {review.title}
        </h3>
      )}

      {/* Content */}
      <p className="text-gray-700 leading-relaxed mb-4">{review.content}</p>

      {/* Project Info */}
      {(review.projectType || review.projectDuration || review.projectCost) && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
          {review.projectType && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {projectTypeLabels[review.projectType]}
            </span>
          )}
          {review.projectDuration && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
              Duration: {review.projectDuration}
            </span>
          )}
          {review.projectCost && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
              Cost: {review.projectCost}
            </span>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            Are you sure you want to delete this review? This action cannot be
            undone.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Yes, delete"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="text-sm px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
