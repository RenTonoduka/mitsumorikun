/**
 * Request utility functions
 * Helper functions for request management
 */

import { ProjectType, RequestStatus } from '@prisma/client';

/**
 * Project type labels for UI display
 */
export const projectTypeLabels: Record<ProjectType, string> = {
  WEB_DEVELOPMENT: 'Web Development',
  MOBILE_APP: 'Mobile App',
  AI_ML: 'AI/ML',
  SYSTEM_INTEGRATION: 'System Integration',
  CONSULTING: 'Consulting',
  MAINTENANCE: 'Maintenance',
  OTHER: 'Other',
};

/**
 * Project type descriptions
 */
export const projectTypeDescriptions: Record<ProjectType, string> = {
  WEB_DEVELOPMENT: 'Web applications, websites, e-commerce platforms',
  MOBILE_APP: 'iOS and Android mobile applications',
  AI_ML: 'AI/ML solutions, data analysis, automation',
  SYSTEM_INTEGRATION: 'System integration, API development',
  CONSULTING: 'Technical consulting, architecture design',
  MAINTENANCE: 'System maintenance, bug fixes, updates',
  OTHER: 'Other development projects',
};

/**
 * Request status labels for UI display
 */
export const requestStatusLabels: Record<RequestStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
};

/**
 * Request status colors for badges
 */
export const requestStatusColors: Record<RequestStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-blue-100 text-blue-800',
  CLOSED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

/**
 * Format budget range for display
 */
export function formatBudgetRange(min?: number | null, max?: number | null): string {
  if (!min && !max) return 'Budget not specified';
  if (!min) return `Up to ¥${max?.toLocaleString()}`;
  if (!max) return `¥${min.toLocaleString()}+`;
  return `¥${min.toLocaleString()} - ¥${max.toLocaleString()}`;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'Not specified';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Check if request can be edited
 */
export function canEditRequest(status: RequestStatus): boolean {
  return status === 'DRAFT';
}

/**
 * Check if request can be published
 */
export function canPublishRequest(status: RequestStatus): boolean {
  return status === 'DRAFT';
}

/**
 * Check if request can be cancelled
 */
export function canCancelRequest(status: RequestStatus): boolean {
  return status === 'DRAFT' || status === 'PUBLISHED';
}

/**
 * Generate request summary for display
 */
export function generateRequestSummary(
  title: string,
  projectType: ProjectType,
  budgetMin?: number | null,
  budgetMax?: number | null
): string {
  const typeLabel = projectTypeLabels[projectType];
  const budget = formatBudgetRange(budgetMin, budgetMax);
  return `${typeLabel} project: ${title} (${budget})`;
}

/**
 * Calculate days until deadline
 */
export function daysUntilDeadline(deadline: Date | string | null | undefined): number | null {
  if (!deadline) return null;
  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const now = new Date();
  const diff = deadlineDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get deadline urgency status
 */
export function getDeadlineUrgency(
  deadline: Date | string | null | undefined
): 'urgent' | 'soon' | 'normal' | null {
  const days = daysUntilDeadline(deadline);
  if (days === null) return null;
  if (days < 7) return 'urgent';
  if (days < 30) return 'soon';
  return 'normal';
}
