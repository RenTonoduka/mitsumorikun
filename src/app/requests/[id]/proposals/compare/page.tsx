/**
 * Proposals Comparison Page
 *
 * Side-by-side comparison of all proposals for a request
 * Only accessible by request owner
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProposalWithDetails } from '@/types/matching';
import { MatchScoreDetails } from '@/components/matching/MatchScoreDetails';

interface ProposalsResponse {
  requestId: string;
  totalProposals: number;
  proposals: ProposalWithDetails[];
}

export default function ProposalsComparePage({
  params,
}: {
  params: { id: string };
}) {
  const [data, setData] = useState<ProposalsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProposals();
  }, [params.id]);

  const fetchProposals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/requests/${params.id}/proposals`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch proposals');
      }

      const proposalsData = await response.json();
      setData(proposalsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      notation: 'compact',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comparison...</p>
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
            Error Loading Comparison
          </h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <Link
            href={`/requests/${params.id}/proposals`}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-center transition-colors"
          >
            Back to Proposals
          </Link>
        </div>
      </div>
    );
  }

  // Filter to only show responded proposals
  const proposals = data?.proposals.filter((p) => p.status !== 'PENDING') || [];

  if (proposals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Proposals to Compare
            </h3>
            <p className="text-gray-600 mb-4">
              Need at least 2 proposals to use comparison view
            </p>
            <Link
              href={`/requests/${params.id}/proposals`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Back to Proposals
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate comparison metrics
  const costs = proposals
    .map((p) => p.estimatedCost)
    .filter((c): c is number => c !== null);
  const avgCost = costs.length > 0 ? costs.reduce((a, b) => a + b, 0) / costs.length : 0;
  const minCost = costs.length > 0 ? Math.min(...costs) : 0;
  const maxCost = costs.length > 0 ? Math.max(...costs) : 0;
  const scores = proposals
    .map((p) => p.matchScore?.total)
    .filter((s): s is number => s !== undefined);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/requests/${params.id}/proposals`}
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
            Back to Proposals
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Proposal Comparison
          </h1>
          <p className="text-gray-600">
            Comparing {proposals.length} proposals side-by-side
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Average Cost</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgCost)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Cost Range</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(minCost)} - {formatCurrency(maxCost)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Average Match</p>
            <p className="text-2xl font-bold text-gray-900">{avgScore.toFixed(0)}%</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Proposals</p>
            <p className="text-2xl font-bold text-gray-900">{proposals.length}</p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Match Score
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Cost
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {proposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {proposal.company.logo ? (
                          <img
                            src={proposal.company.logo}
                            alt={proposal.company.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-semibold">
                              {proposal.company.name[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/companies/${proposal.company.slug}`}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {proposal.company.name}
                          </Link>
                          {proposal.company.isVerified && (
                            <span className="ml-1 text-blue-600 text-xs">✓</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {proposal.matchScore && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          {proposal.matchScore.total}%
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatCurrency(proposal.estimatedCost)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {proposal.estimatedDuration || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span>⭐</span>
                        <span className="font-medium text-gray-900">
                          {proposal.company.averageRating.toFixed(1)}
                        </span>
                        <span className="text-gray-500 text-sm">
                          ({proposal.company.reviewCount})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          proposal.status === 'SELECTED'
                            ? 'bg-green-100 text-green-700'
                            : proposal.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {proposal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/proposals/${proposal.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Comparison Cards */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Detailed Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <div className="mb-4">
                  <Link
                    href={`/companies/${proposal.company.slug}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 text-lg"
                  >
                    {proposal.company.name}
                  </Link>
                </div>

                {proposal.matchScore && (
                  <MatchScoreDetails
                    matchScore={proposal.matchScore}
                    className="mb-4"
                  />
                )}

                <div className="pt-4 border-t border-gray-200">
                  <Link
                    href={`/proposals/${proposal.id}`}
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    View Full Proposal
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
