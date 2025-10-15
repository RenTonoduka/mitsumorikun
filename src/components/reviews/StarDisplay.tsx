/**
 * Star Display Component
 * Read-only star rating display for showing existing ratings
 */

"use client";

import { Star } from "lucide-react";

interface StarDisplayProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function StarDisplay({
  rating,
  size = "md",
  showValue = true,
  reviewCount,
}: StarDisplayProps) {
  // Round rating to nearest 0.5
  const roundedRating = Math.round(rating * 2) / 2;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const fillPercentage =
            star <= roundedRating
              ? 100
              : star - roundedRating === 0.5
                ? 50
                : 0;

          return (
            <div key={star} className="relative">
              <Star
                className={`${sizeClasses[size]} text-gray-200`}
                fill="currentColor"
              />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star
                  className={`${sizeClasses[size]} text-yellow-400`}
                  fill="currentColor"
                />
              </div>
            </div>
          );
        })}
      </div>

      {showValue && (
        <div className="flex items-center gap-1">
          <span className={`font-semibold text-gray-900 ${textSizeClasses[size]}`}>
            {rating.toFixed(1)}
          </span>
          {reviewCount !== undefined && (
            <span className={`text-gray-500 ${textSizeClasses[size]}`}>
              ({reviewCount})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
