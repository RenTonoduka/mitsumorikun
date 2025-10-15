/**
 * Company Match Card Component
 *
 * Displays a matched company with matching score and action to submit proposal
 */

'use client';

import Link from 'next/link';
import { MatchedCompany } from '@/types/matching';
import { MatchScoreBadge } from './MatchScoreBadge';

interface CompanyMatchCardProps {
  match: MatchedCompany;
  onSubmitProposal?: (companyId: string) => void;
  showActions?: boolean;
  className?: string;
}

export function CompanyMatchCard({
  match,
  onSubmitProposal,
  showActions = true,
  className = '',
}: CompanyMatchCardProps) {
  const { company, matchScore } = match;

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md ${className}`}
    >
      <div className="p-6">
        {/* Header: Company Info */}
        <div className="flex items-start gap-4 mb-4">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-gray-500 font-semibold text-xl">
                {company.name[0]}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/companies/${company.slug}`}
                className="font-semibold text-gray-900 hover:text-blue-600 text-lg truncate"
              >
                {company.name}
              </Link>
              {company.isVerified && (
                <span className="inline-flex items-center text-xs font-medium text-blue-600 flex-shrink-0">
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
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span>⭐ {company.averageRating.toFixed(1)}</span>
              <span>•</span>
              <span>{company.reviewCount} reviews</span>
              <span>•</span>
              <span>{company.projectCount} projects</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {company.description && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
            {company.description}
          </p>
        )}

        {/* Match Score */}
        <div className="mb-4">
          <MatchScoreBadge score={matchScore.total} size="lg" />
        </div>

        {/* Match Details */}
        <div className="space-y-2 mb-4">
          {/* Tech Stack Match */}
          {matchScore.matchedTechStacks.length > 0 && (
            <div className="text-sm">
              <span className="text-gray-600 font-medium">Tech Stack: </span>
              <span className="text-gray-700">
                {matchScore.matchedTechStacks.join(', ')}
              </span>
            </div>
          )}

          {/* Specialty Match */}
          {matchScore.matchedSpecialties.length > 0 && (
            <div className="text-sm">
              <span className="text-gray-600 font-medium">Specialties: </span>
              <span className="text-gray-700">
                {matchScore.matchedSpecialties.join(', ')}
              </span>
            </div>
          )}

          {/* Budget Compatibility */}
          <div className="text-sm">
            <span className="text-gray-600 font-medium">Budget: </span>
            <span
              className={`font-medium ${
                matchScore.budgetCompatibility === 'perfect'
                  ? 'text-green-600'
                  : matchScore.budgetCompatibility === 'good'
                  ? 'text-blue-600'
                  : 'text-yellow-600'
              }`}
            >
              {matchScore.budgetCompatibility.charAt(0).toUpperCase() +
                matchScore.budgetCompatibility.slice(1)}{' '}
              compatibility
            </span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => onSubmitProposal?.(company.id)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Submit Proposal
            </button>
            <Link
              href={`/companies/${company.slug}`}
              className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              View Company
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
