/**
 * New Proposal Submission Page
 *
 * Form for companies to submit proposals to a request
 * Only accessible by verified company members
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function NewProposalPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    estimatedCost: '',
    estimatedDuration: '',
    proposal: '',
    attachments: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.estimatedCost || !formData.estimatedDuration || !formData.proposal) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.proposal.length < 50) {
      setError('Proposal must be at least 50 characters');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/requests/${params.id}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estimatedCost: parseInt(formData.estimatedCost),
          estimatedDuration: formData.estimatedDuration,
          proposal: formData.proposal,
          attachments: formData.attachments.filter((a) => a.trim() !== ''),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit proposal');
      }

      // Success - redirect to request page
      router.push(`/requests/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit proposal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addAttachment = () => {
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ''],
    }));
  };

  const updateAttachment = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.map((a, i) => (i === index ? value : a)),
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Submit Proposal
          </h1>
          <p className="text-gray-600">
            Provide your quote and proposal details for this project
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Estimated Cost */}
          <div className="mb-6">
            <label
              htmlFor="estimatedCost"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Estimated Cost (JPY) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="estimatedCost"
              name="estimatedCost"
              value={formData.estimatedCost}
              onChange={handleChange}
              required
              min="0"
              step="1000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 5000000"
            />
            <p className="mt-1 text-sm text-gray-500">
              Total project cost in Japanese Yen
            </p>
          </div>

          {/* Estimated Duration */}
          <div className="mb-6">
            <label
              htmlFor="estimatedDuration"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Estimated Duration <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="estimatedDuration"
              name="estimatedDuration"
              value={formData.estimatedDuration}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 3 months, 12 weeks"
            />
            <p className="mt-1 text-sm text-gray-500">
              Expected project completion time
            </p>
          </div>

          {/* Proposal */}
          <div className="mb-6">
            <label
              htmlFor="proposal"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Proposal Details <span className="text-red-500">*</span>
            </label>
            <textarea
              id="proposal"
              name="proposal"
              value={formData.proposal}
              onChange={handleChange}
              required
              rows={10}
              minLength={50}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your approach, methodology, team composition, deliverables, timeline, etc. (minimum 50 characters)"
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.proposal.length} / 50+ characters
            </p>
          </div>

          {/* Attachments */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (Optional)
            </label>
            <div className="space-y-2">
              {formData.attachments.map((attachment, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={attachment}
                    onChange={(e) => updateAttachment(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/document.pdf"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addAttachment}
              className="mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              + Add Attachment URL
            </button>
            <p className="mt-1 text-sm text-gray-500">
              Add URLs to supporting documents, portfolios, case studies, etc.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {isLoading ? 'Submitting...' : 'Submit Proposal'}
            </button>
            <Link
              href={`/requests/${params.id}`}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg text-center transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for a Great Proposal</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Clearly explain your approach and methodology</li>
            <li>Highlight relevant experience and past projects</li>
            <li>Break down the timeline into phases</li>
            <li>Be transparent about what is and isn't included</li>
            <li>Provide references or case studies if available</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
