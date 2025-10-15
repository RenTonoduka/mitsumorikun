/**
 * Proposal Card Component
 *
 * Displays a proposal with company info, cost, duration, and actions
 */

'use client';

import Link from 'next/link';
import { ProposalWithDetails } from '@/types/matching';
import { MatchScoreBadge } from './MatchScoreBadge';
import { RequestCompanyStatus } from '@prisma/client';

interface ProposalCardProps {
  proposal: ProposalWithDetails;
  onSelect?: (proposalId: string) => void;
  onReject?: (proposalId: string) => void;
  showActions?: boolean;
  className?: string;
}

export function ProposalCard({
  proposal,
  onSelect,
  onReject,
  showActions = true,
  className = '',
}: ProposalCardProps) {
  const statusConfig: Record<
    RequestCompanyStatus,
    { label: string; color: string; bgColor: string }
  > = {
    PENDING: { label: 'Pending', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    RESPONDED: { label: 'Submitted', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    SELECTED: { label: 'Selected', color: 'text-green-700', bgColor: 'bg-green-100' },
    REJECTED: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100' },
  };

  const status = statusConfig[proposal.status];

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      notation: 'compact',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md ${className}`}
    >
      <div className="p-6">
        {/* Header: Company Info & Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {proposal.company.logo ? (
              <img
                src={proposal.company.logo}
                alt={proposal.company.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-semibold text-lg">
                  {proposal.company.name[0]}
                </span>
              </div>
            )}
            <div>
              <Link
                href={`/companies/${proposal.company.slug}`}
                className="font-semibold text-gray-900 hover:text-blue-600 text-lg"
              >
                {proposal.company.name}
              </Link>
              {proposal.company.isVerified && (
                <span className="ml-2 inline-flex items-center text-xs font-medium text-blue-600">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified
                </span>
              )}
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <span>⭐ {proposal.company.averageRating.toFixed(1)}</span>
                <span>•</span>
                <span>{proposal.company.reviewCount} reviews</span>
              </div>
            </div>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${status.color} ${status.bgColor}`}
          >
            {status.label}
          </span>
        </div>

        {/* Match Score */}
        {proposal.matchScore && (
          <div className="mb-4">
            <MatchScoreBadge score={proposal.matchScore.total} />
          </div>
        )}

        {/* Cost & Duration */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 mb-1">Estimated Cost</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(proposal.estimatedCost)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Estimated Duration</p>
            <p className="text-xl font-bold text-gray-900">
              {proposal.estimatedDuration || 'N/A'}
            </p>
          </div>
        </div>

        {/* Proposal Text */}
        {proposal.proposal && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 line-clamp-3">
              {proposal.proposal}
            </p>
          </div>
        )}

        {/* Actions */}
        {showActions && proposal.status === 'RESPONDED' && (
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => onSelect?.(proposal.id)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Select Proposal
            </button>
            <button
              onClick={() => onReject?.(proposal.id)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Reject
            </button>
            <Link
              href={`/proposals/${proposal.id}`}
              className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              View Details
            </Link>
          </div>
        )}

        {/* View Details Only */}
        {(!showActions || proposal.status !== 'RESPONDED') && (
          <div className="pt-4 border-t border-gray-200">
            <Link
              href={`/proposals/${proposal.id}`}
              className="block w-full text-center px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
            >
              View Full Proposal
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
