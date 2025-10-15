/**
 * Request Proposals Page
 *
 * Displays all proposals received for a request
 * Only accessible by request owner
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProposalCard } from '@/components/matching/ProposalCard';
import { ProposalWithDetails } from '@/types/matching';

interface ProposalsResponse {
  requestId: string;
  totalProposals: number;
  proposals: ProposalWithDetails[];
}

export default function RequestProposalsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [data, setData] = useState<ProposalsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handleSelectProposal = async (proposalId: string) => {
    if (!confirm('Are you sure you want to select this proposal? All other proposals will be rejected.')) {
      return;
    }

    try {
      setActionLoading(proposalId);
      const response = await fetch(`/api/proposals/${proposalId}/select`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to select proposal');
      }

      // Refresh proposals
      await fetchProposals();
      alert('Proposal selected successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to select proposal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    if (!confirm('Are you sure you want to reject this proposal?')) {
      return;
    }

    try {
      setActionLoading(proposalId);
      const response = await fetch(`/api/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'REJECTED' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject proposal');
      }

      // Refresh proposals
      await fetchProposals();
      alert('Proposal rejected successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject proposal');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proposals...</p>
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
            Error Loading Proposals
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

  const respondedProposals = data?.proposals.filter((p) => p.status === 'RESPONDED') || [];
  const selectedProposal = data?.proposals.find((p) => p.status === 'SELECTED');
  const rejectedProposals = data?.proposals.filter((p) => p.status === 'REJECTED') || [];

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Received Proposals
              </h1>
              <p className="text-gray-600">
                {data?.totalProposals || 0} proposals received
              </p>
            </div>
            <Link
              href={`/requests/${params.id}/proposals/compare`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Compare All
            </Link>
          </div>
        </div>

        {/* Selected Proposal */}
        {selectedProposal && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-6 h-6 text-green-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Selected Proposal
            </h2>
            <ProposalCard
              proposal={selectedProposal}
              showActions={false}
            />
          </div>
        )}

        {/* New Proposals */}
        {respondedProposals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Awaiting Review ({respondedProposals.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {respondedProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onSelect={handleSelectProposal}
                  onReject={handleRejectProposal}
                  showActions={!actionLoading}
                />
              ))}
            </div>
          </div>
        )}

        {/* Rejected Proposals */}
        {rejectedProposals.length > 0 && (
          <div className="mb-8">
            <details className="bg-white rounded-lg border border-gray-200 p-4">
              <summary className="cursor-pointer text-lg font-semibold text-gray-700">
                Rejected Proposals ({rejectedProposals.length})
              </summary>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {rejectedProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    showActions={false}
                  />
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Empty State */}
        {!data || data.totalProposals === 0 ? (
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
              No Proposals Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Companies will submit their proposals once they review your request
            </p>
            <Link
              href={`/requests/${params.id}/matches`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              View Matched Companies
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
