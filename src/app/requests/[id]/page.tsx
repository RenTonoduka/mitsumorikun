/**
 * Request Detail Page
 * View individual quote request details
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProjectType, RequestStatus } from '@prisma/client';
import {
  projectTypeLabels,
  requestStatusLabels,
  requestStatusColors,
  formatBudgetRange,
  formatDate,
  canEditRequest,
  canPublishRequest,
  canCancelRequest,
} from '@/lib/utils/request';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Request {
  id: string;
  title: string;
  description: string;
  projectType: ProjectType;
  status: RequestStatus;
  budgetMin?: number | null;
  budgetMax?: number | null;
  deadline?: string | null;
  preferredStart?: string | null;
  requirements?: any;
  attachments: string[];
  publishedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  requestCompanies: Array<{
    id: string;
    status: string;
    estimatedCost?: number | null;
    respondedAt?: string | null;
    company: {
      id: string;
      name: string;
      slug: string;
      logo?: string | null;
      averageRating: number;
      reviewCount: number;
    };
  }>;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function RequestDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [request, setRequest] = useState<Request | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [params.id]);

  const fetchRequest = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/requests/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/requests');
          return;
        }
        throw new Error('Failed to fetch request');
      }

      const data = await response.json();
      setRequest(data);

      // Check if current user is the owner
      // In production, get this from session
      setIsOwner(true); // For demo purposes
    } catch (error) {
      console.error('Error fetching request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!request || !window.confirm('Publish this request?')) return;

    try {
      const response = await fetch(`/api/requests/${request.id}/publish`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to publish request');

      await fetchRequest();
      alert('Request published successfully!');
    } catch (error) {
      console.error('Error publishing request:', error);
      alert('Failed to publish request. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (
      !request ||
      !window.confirm('Are you sure you want to delete this request?')
    )
      return;

    try {
      const response = await fetch(`/api/requests/${request.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete request');

      router.push('/requests');
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Failed to delete request. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Request not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-4 flex items-center gap-3">
                <Badge className={requestStatusColors[request.status]}>
                  {requestStatusLabels[request.status]}
                </Badge>
                <span className="text-sm text-gray-500">
                  {projectTypeLabels[request.projectType]}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900">
                {request.title}
              </h1>

              <div className="mt-4 flex items-center text-sm text-gray-500">
                <span>Posted {formatDate(request.createdAt)}</span>
                {request.publishedAt && (
                  <>
                    <span className="mx-2">•</span>
                    <span>Published {formatDate(request.publishedAt)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            {isOwner && (
              <div className="flex gap-2">
                {canEditRequest(request.status) && (
                  <Link href={`/requests/${request.id}/edit`}>
                    <Button variant="outline">Edit</Button>
                  </Link>
                )}

                {canPublishRequest(request.status) && (
                  <Button onClick={handlePublish}>Publish</Button>
                )}

                {canCancelRequest(request.status) && (
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700">
                  {request.description}
                </p>
              </CardContent>
            </Card>

            {/* Requirements */}
            {request.requirements && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {request.requirements.features &&
                    request.requirements.features.length > 0 && (
                      <div>
                        <h4 className="mb-2 font-medium text-gray-900">
                          Key Features
                        </h4>
                        <ul className="list-inside list-disc space-y-1 text-gray-700">
                          {request.requirements.features.map(
                            (feature: string, index: number) => (
                              <li key={index}>{feature}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {request.requirements.technologies &&
                    request.requirements.technologies.length > 0 && (
                      <div>
                        <h4 className="mb-2 font-medium text-gray-900">
                          Technologies
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {request.requirements.technologies.map(
                            (tech: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {tech}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {request.requirements.targetAudience && (
                    <div>
                      <h4 className="mb-2 font-medium text-gray-900">
                        Target Audience
                      </h4>
                      <p className="text-gray-700">
                        {request.requirements.targetAudience}
                      </p>
                    </div>
                  )}

                  {request.requirements.additionalNotes && (
                    <div>
                      <h4 className="mb-2 font-medium text-gray-900">
                        Additional Notes
                      </h4>
                      <p className="text-gray-700">
                        {request.requirements.additionalNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Attachments */}
            {request.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {request.attachments.map((url, index) => (
                      <li key={index}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          <svg
                            className="mr-2 h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            />
                          </svg>
                          Attachment {index + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Budget & Timeline */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Budget & Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-600">
                    Budget
                  </h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatBudgetRange(request.budgetMin, request.budgetMax)}
                  </p>
                </div>

                {request.preferredStart && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-gray-600">
                      Preferred Start
                    </h4>
                    <p className="text-gray-900">
                      {formatDate(request.preferredStart)}
                    </p>
                  </div>
                )}

                {request.deadline && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-gray-600">
                      Deadline
                    </h4>
                    <p className="text-gray-900">
                      {formatDate(request.deadline)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quote Responses */}
            <Card>
              <CardHeader>
                <CardTitle>Quotes Received</CardTitle>
              </CardHeader>
              <CardContent>
                {request.requestCompanies.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No quotes received yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {request.requestCompanies.map((rc) => (
                      <Link
                        key={rc.id}
                        href={`/companies/${rc.company.slug}`}
                        className="block rounded-lg border p-3 transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-start gap-3">
                          {rc.company.logo && (
                            <img
                              src={rc.company.logo}
                              alt={rc.company.name}
                              className="h-10 w-10 rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {rc.company.name}
                            </p>
                            {rc.estimatedCost && (
                              <p className="text-sm text-gray-600">
                                ¥{rc.estimatedCost.toLocaleString()}
                              </p>
                            )}
                            <div className="mt-1 flex items-center text-xs text-gray-500">
                              <svg
                                className="mr-1 h-3 w-3 text-yellow-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {rc.company.averageRating.toFixed(1)} (
                              {rc.company.reviewCount})
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
