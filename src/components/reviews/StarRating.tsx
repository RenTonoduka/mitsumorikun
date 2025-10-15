/**
 * Star Rating Component
 * Interactive star rating input for review forms
 */

"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const sizeClasses = {
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

const labels = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export function StarRating({
  value,
  onChange,
  disabled = false,
  size = "md",
  showLabel = true,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number>(0);

  const displayValue = hoverValue || value;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => !disabled && onChange(rating)}
            onMouseEnter={() => !disabled && setHoverValue(rating)}
            onMouseLeave={() => !disabled && setHoverValue(0)}
            disabled={disabled}
            className={`
              transition-all duration-200
              ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-110"}
            `}
            aria-label={`Rate ${rating} stars`}
          >
            <Star
              className={`
                ${sizeClasses[size]}
                transition-colors duration-200
                ${
                  rating <= displayValue
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                }
              `}
            />
          </button>
        ))}
      </div>

      {showLabel && displayValue > 0 && (
        <p className="text-sm font-medium text-gray-700">
          {labels[displayValue as keyof typeof labels]}
        </p>
      )}
    </div>
  );
}
