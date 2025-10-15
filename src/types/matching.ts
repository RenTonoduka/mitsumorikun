/**
 * Matching System Types
 *
 * Defines types for the intelligent company-request matching algorithm
 * and proposal management system.
 */

import { Company, Request, RequestCompanyStatus, ProjectType } from '@prisma/client';

/**
 * Matching score breakdown for a company-request pair
 */
export interface MatchScore {
  /** Overall matching score (0-100) */
  total: number;

  /** Tech stack compatibility score (0-40 points) */
  techStackScore: number;

  /** Specialty alignment score (0-30 points) */
  specialtyScore: number;

  /** Budget compatibility score (0-20 points) */
  budgetScore: number;

  /** Company rating score (0-10 points) */
  ratingScore: number;

  /** Matched tech stacks */
  matchedTechStacks: string[];

  /** Matched specialties */
  matchedSpecialties: string[];

  /** Budget compatibility status */
  budgetCompatibility: 'perfect' | 'good' | 'acceptable' | 'mismatch';
}

/**
 * Company with matching score
 */
export interface MatchedCompany {
  company: CompanyWithRelations;
  matchScore: MatchScore;
}

/**
 * Company with all necessary relations for matching
 */
export interface CompanyWithRelations extends Company {
  techStacks: {
    techStack: {
      id: string;
      name: string;
      slug: string;
      category: string;
    };
  }[];
  specialties: {
    specialty: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
}

/**
 * Request with requirements for matching
 */
export interface RequestWithRequirements extends Omit<Request, 'requirements'> {
  requirements?: {
    techStacks?: string[];
    specialties?: string[];
    location?: string;
  } | null;
}

/**
 * Proposal submission data
 */
export interface ProposalSubmission {
  estimatedCost: number;
  estimatedDuration: string;
  proposal: string;
  attachments?: string[];
}

/**
 * Proposal with full details
 */
export interface ProposalWithDetails {
  id: string;
  requestId: string;
  companyId: string;
  estimatedCost: number | null;
  estimatedDuration: string | null;
  proposal: string | null;
  attachments: string[];
  status: RequestCompanyStatus;
  respondedAt: Date | null;
  selectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  company: CompanyWithRelations;
  matchScore?: MatchScore;
}

/**
 * Proposal comparison data
 */
export interface ProposalComparison {
  proposals: ProposalWithDetails[];
  request: Request;
  comparisonMetrics: {
    avgCost: number;
    minCost: number;
    maxCost: number;
    avgDuration: number;
    avgMatchScore: number;
  };
}

/**
 * Proposal status update
 */
export interface ProposalStatusUpdate {
  status: RequestCompanyStatus;
  reason?: string;
}

/**
 * Matching algorithm configuration
 */
export interface MatchingConfig {
  /** Weight for tech stack matching (0-1, default: 0.4) */
  techStackWeight?: number;

  /** Weight for specialty matching (0-1, default: 0.3) */
  specialtyWeight?: number;

  /** Weight for budget matching (0-1, default: 0.2) */
  budgetWeight?: number;

  /** Weight for company rating (0-1, default: 0.1) */
  ratingWeight?: number;

  /** Minimum matching score threshold (0-100, default: 30) */
  minScore?: number;

  /** Maximum number of matches to return (default: 20) */
  maxResults?: number;
}

/**
 * Matching filter options
 */
export interface MatchingFilters {
  projectType?: ProjectType;
  minBudget?: number;
  maxBudget?: number;
  techStacks?: string[];
  specialties?: string[];
  location?: string;
  minRating?: number;
  verifiedOnly?: boolean;
}
