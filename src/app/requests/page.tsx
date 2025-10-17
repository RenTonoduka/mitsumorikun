/**
 * Requests List Page
 * Browse and filter quote requests
 */

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProjectType, RequestStatus } from '@prisma/client';
import {
  projectTypeLabels,
  requestStatusLabels,
  requestStatusColors,
  formatBudgetRange,
  formatDate,
  daysUntilDeadline,
} from '@/lib/utils/request';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface Request {
  id: string;
  title: string;
  description: string;
  projectType: ProjectType;
  status: RequestStatus;
  budgetMin?: number | null;
  budgetMax?: number | null;
  deadline?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    requestCompanies: number;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function RequestsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [requests, setRequests] = useState<Request[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    projectType: searchParams.get('projectType') || '',
    search: searchParams.get('search') || '',
  });

  useEffect(() => {
    fetchRequests();
  }, [searchParams]);

  const fetchRequests = async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.projectType) params.set('projectType', filters.projectType);
      if (filters.search) params.set('search', filters.search);
      params.set('page', searchParams.get('page') || '1');

      const response = await fetch(`/api/requests?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch requests');

      const data = await response.json();
      setRequests(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    if (newFilters.status) params.set('status', newFilters.status);
    if (newFilters.projectType) params.set('projectType', newFilters.projectType);
    if (newFilters.search) params.set('search', newFilters.search);

    router.push(`/requests?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({ status: '', projectType: '', search: '' });
    router.push('/requests');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quote Requests
              </h1>
              <p className="mt-2 text-gray-600">
                Browse open requests and submit your quotes
              </p>
            </div>
            <Link href="/requests/new">
              <Button>Create Request</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search requests..."
                value={filters.search}
                onChange={(e) => updateFilters('search', e.target.value)}
              />
            </div>

            <Select
              value={filters.projectType}
              onValueChange={(value) => updateFilters('projectType', value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Project Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {Object.entries(projectTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => updateFilters('status', value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                {Object.entries(requestStatusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(filters.status || filters.projectType || filters.search) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <p className="text-gray-500">No requests found</p>
            <Link href="/requests/new" className="mt-4">
              <Button>Create Your First Request</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Request Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {requests.map((request) => {
                const days = daysUntilDeadline(request.deadline);
                const isUrgent = days !== null && days < 7;

                return (
                  <Link key={request.id} href={`/requests/${request.id}`}>
                    <Card className="h-full transition-shadow hover:shadow-lg">
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className="mb-4 flex items-start justify-between">
                          <Badge
                            variant="info"
                            className={requestStatusColors[request.status]}
                          >
                            {requestStatusLabels[request.status]}
                          </Badge>
                          {isUrgent && (
                            <Badge variant="destructive">Urgent</Badge>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
                          {request.title}
                        </h3>

                        {/* Project Type */}
                        <p className="mb-3 text-sm text-gray-600">
                          {projectTypeLabels[request.projectType]}
                        </p>

                        {/* Description */}
                        <p className="mb-4 text-sm text-gray-600 line-clamp-3">
                          {request.description}
                        </p>

                        {/* Budget */}
                        <div className="mb-3 flex items-center text-sm">
                          <svg
                            className="mr-2 h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-gray-700">
                            {formatBudgetRange(
                              request.budgetMin,
                              request.budgetMax
                            )}
                          </span>
                        </div>

                        {/* Deadline */}
                        {request.deadline && (
                          <div className="mb-3 flex items-center text-sm">
                            <svg
                              className="mr-2 h-4 w-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-gray-700">
                              Deadline: {formatDate(request.deadline)}
                              {days !== null && ` (${days} days)`}
                            </span>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="mt-4 flex items-center justify-between border-t pt-4 text-xs text-gray-500">
                          <span>
                            {request._count.requestCompanies} quote
                            {request._count.requestCompanies !== 1 ? 's' : ''}
                          </span>
                          <span>{formatDate(request.createdAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('page', String(pagination.page - 1));
                    router.push(`/requests?${params.toString()}`);
                  }}
                >
                  Previous
                </Button>

                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('page', String(pagination.page + 1));
                    router.push(`/requests?${params.toString()}`);
                  }}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function RequestsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      }
    >
      <RequestsContent />
    </Suspense>
  );
}
