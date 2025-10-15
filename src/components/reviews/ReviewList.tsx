/**
 * Review List Component
 * Displays a list of reviews with filters, sorting, and pagination
 */

"use client";

import { useState, useEffect } from "react";
import { ReviewCard } from "./ReviewCard";
import { StarDisplay } from "./StarDisplay";
import { Filter, ChevronDown } from "lucide-react";
import { ProjectType } from "@prisma/client";

interface Review {
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
}

interface ReviewListProps {
  companyId: string;
  companyName: string;
  initialReviews?: Review[];
  initialAverageRating?: number;
  initialReviewCount?: number;
  initialRatingStats?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  currentUserId?: string;
  isAdmin?: boolean;
}

const projectTypeOptions = [
  { value: "", label: "All Project Types" },
  { value: "WEB_DEVELOPMENT", label: "Web Development" },
  { value: "MOBILE_APP", label: "Mobile App" },
  { value: "AI_ML", label: "AI/ML" },
  { value: "SYSTEM_INTEGRATION", label: "System Integration" },
  { value: "CONSULTING", label: "Consulting" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OTHER", label: "Other" },
];

const sortOptions = [
  { value: "latest", label: "Most Recent" },
  { value: "oldest", label: "Oldest First" },
  { value: "highest", label: "Highest Rating" },
  { value: "lowest", label: "Lowest Rating" },
];

export function ReviewList({
  companyId,
  companyName,
  initialReviews = [],
  initialAverageRating = 0,
  initialReviewCount = 0,
  initialRatingStats,
  currentUserId,
  isAdmin = false,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [averageRating, setAverageRating] = useState(initialAverageRating);
  const [reviewCount, setReviewCount] = useState(initialReviewCount);
  const [ratingStats, setRatingStats] = useState(
    initialRatingStats || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("latest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [showFilters, setShowFilters] = useState(false);

  // Fetch reviews
  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        sortBy,
        page: currentPage.toString(),
        limit: "10",
      });

      if (projectTypeFilter) {
        params.append("projectType", projectTypeFilter);
      }

      if (ratingFilter) {
        params.append("rating", ratingFilter);
      }

      const response = await fetch(
        `/api/companies/${companyId}/reviews?${params}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();

      setReviews(data.data);
      setAverageRating(data.company.averageRating);
      setReviewCount(data.company.reviewCount);
      setRatingStats(data.ratingStats);
      setTotalPages(data.pagination.totalPages);
      setHasNextPage(data.pagination.hasNextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch when filters or pagination change
  useEffect(() => {
    fetchReviews();
  }, [projectTypeFilter, ratingFilter, sortBy, currentPage]);

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Customer Reviews
            </h2>
            <p className="text-gray-600">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"} for{" "}
              {companyName}
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {averageRating.toFixed(1)}
            </div>
            <StarDisplay
              rating={averageRating}
              size="md"
              showValue={false}
            />
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingStats[star as keyof typeof ratingStats];
            const percentage =
              reviewCount > 0 ? (count / reviewCount) * 100 : 0;

            return (
              <button
                key={star}
                onClick={() =>
                  setRatingFilter(ratingFilter === star.toString() ? "" : star.toString())
                }
                className={`w-full flex items-center gap-3 hover:bg-gray-50 rounded p-2 transition-colors ${
                  ratingFilter === star.toString() ? "bg-blue-50" : ""
                }`}
              >
                <span className="text-sm font-medium text-gray-700 w-8">
                  {star} ★
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
        >
          <Filter className="w-5 h-5" />
          Filters & Sorting
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
          />
        </button>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Type
              </label>
              <select
                value={projectTypeFilter}
                onChange={(e) => {
                  setProjectTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {projectTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(projectTypeFilter || ratingFilter) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {projectTypeFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {
                  projectTypeOptions.find((o) => o.value === projectTypeFilter)
                    ?.label
                }
                <button
                  onClick={() => setProjectTypeFilter("")}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {ratingFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {ratingFilter} stars
                <button
                  onClick={() => setRatingFilter("")}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading reviews...</p>
        </div>
      )}

      {/* Reviews List */}
      {!isLoading && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && reviews.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">
            {projectTypeFilter || ratingFilter
              ? "No reviews match your filters."
              : "No reviews yet. Be the first to review this company!"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="px-4 py-2 text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={!hasNextPage || isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
