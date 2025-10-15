/**
 * Request Matches Page
 *
 * Displays matched companies for a request with scoring
 * Accessible by both request owners and companies
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CompanyMatchCard } from '@/components/matching/CompanyMatchCard';
import { MatchedCompany } from '@/types/matching';

interface MatchesResponse {
  requestId: string;
  totalMatches: number;
  matches: MatchedCompany[];
}

export default function RequestMatchesPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    minScore: 30,
    verifiedOnly: false,
    minRating: 0,
  });

  useEffect(() => {
    fetchMatches();
  }, [params.id, filters]);

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        minScore: filters.minScore.toString(),
        verifiedOnly: filters.verifiedOnly.toString(),
        minRating: filters.minRating.toString(),
      });

      const response = await fetch(
        `/api/requests/${params.id}/matches?${queryParams}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch matches');
      }

      const data = await response.json();
      setMatches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitProposal = (companyId: string) => {
    // Navigate to proposal submission form
    router.push(`/requests/${params.id}/proposals/new?company=${companyId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading matched companies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
            Error Loading Matches
          </h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <Link
            href={`/requests/${params.id}`}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-center transition-colors"
          >
            Back to Request
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/requests/${params.id}`}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-flex items-center"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Request
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Matched Companies
          </h1>
          <p className="text-gray-600">
            Found {matches?.totalMatches || 0} companies that match your requirements
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Minimum Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Match Score: {filters.minScore}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={filters.minScore}
                onChange={(e) =>
                  setFilters({ ...filters, minScore: parseInt(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating: {filters.minRating} stars
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.minRating}
                onChange={(e) =>
                  setFilters({ ...filters, minRating: parseFloat(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Verified Only */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="verifiedOnly"
                checked={filters.verifiedOnly}
                onChange={(e) =>
                  setFilters({ ...filters, verifiedOnly: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="verifiedOnly"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Verified companies only
              </label>
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        {matches && matches.matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.matches.map((match) => (
              <CompanyMatchCard
                key={match.company.id}
                match={match}
                onSubmitProposal={handleSubmitProposal}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Matches Found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters to see more companies
            </p>
            <button
              onClick={() =>
                setFilters({ minScore: 0, verifiedOnly: false, minRating: 0 })
              }
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
