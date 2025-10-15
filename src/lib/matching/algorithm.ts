/**
 * Intelligent Matching Algorithm
 *
 * Matches companies with quote requests based on:
 * - Tech stack compatibility (40 points)
 * - Specialty alignment (30 points)
 * - Budget compatibility (20 points)
 * - Company rating (10 points)
 *
 * Total score: 0-100 points
 */

import {
  MatchScore,
  MatchedCompany,
  CompanyWithRelations,
  RequestWithRequirements,
  MatchingConfig,
  MatchingFilters,
} from '@/types/matching';

/**
 * Default matching configuration
 */
const DEFAULT_CONFIG: Required<MatchingConfig> = {
  techStackWeight: 0.4,
  specialtyWeight: 0.3,
  budgetWeight: 0.2,
  ratingWeight: 0.1,
  minScore: 30,
  maxResults: 20,
};

/**
 * Calculate tech stack matching score (0-40 points)
 *
 * Compares company's tech stacks with request requirements.
 * Uses Jaccard similarity coefficient for matching.
 */
export function calculateTechStackScore(
  companyTechStacks: string[],
  requestedTechStacks: string[]
): { score: number; matched: string[] } {
  if (!requestedTechStacks || requestedTechStacks.length === 0) {
    return { score: 40, matched: [] }; // No requirements = perfect match
  }

  if (companyTechStacks.length === 0) {
    return { score: 0, matched: [] };
  }

  // Normalize to lowercase for case-insensitive matching
  const companySet = new Set(companyTechStacks.map((t) => t.toLowerCase()));
  const requestSet = new Set(requestedTechStacks.map((t) => t.toLowerCase()));

  // Find intersection and union
  const intersection = [...requestSet].filter((tech) => companySet.has(tech));
  const union = new Set([...companySet, ...requestSet]);

  // Jaccard similarity: |intersection| / |union|
  const similarity = intersection.length / union.size;

  // Scale to 40 points
  const score = Math.round(similarity * 40);

  return {
    score,
    matched: intersection,
  };
}

/**
 * Calculate specialty matching score (0-30 points)
 *
 * Matches company specialties with project type and requested specialties.
 */
export function calculateSpecialtyScore(
  companySpecialties: string[],
  projectType: string,
  requestedSpecialties?: string[]
): { score: number; matched: string[] } {
  if (companySpecialties.length === 0) {
    return { score: 0, matched: [] };
  }

  const companySet = new Set(companySpecialties.map((s) => s.toLowerCase()));
  const matched: string[] = [];

  let score = 0;

  // Primary match: Project type (15 points)
  const projectTypeMap: Record<string, string[]> = {
    WEB_DEVELOPMENT: ['web development', 'frontend', 'backend', 'fullstack'],
    MOBILE_APP: ['mobile development', 'ios', 'android', 'mobile app'],
    AI_ML: ['ai', 'machine learning', 'deep learning', 'data science'],
    SYSTEM_INTEGRATION: ['system integration', 'api integration', 'enterprise'],
    CONSULTING: ['consulting', 'strategy', 'advisory'],
    MAINTENANCE: ['maintenance', 'support', 'bug fixing'],
  };

  const projectKeywords = projectTypeMap[projectType] || [];
  const hasProjectMatch = projectKeywords.some((keyword) => {
    const match = [...companySet].some((spec) => spec.includes(keyword.toLowerCase()));
    if (match) matched.push(keyword);
    return match;
  });

  if (hasProjectMatch) {
    score += 15;
  }

  // Secondary match: Requested specialties (15 points)
  if (requestedSpecialties && requestedSpecialties.length > 0) {
    const requestSet = new Set(requestedSpecialties.map((s) => s.toLowerCase()));
    const intersection = [...requestSet].filter((spec) => {
      const match = [...companySet].some((cs) => cs.includes(spec) || spec.includes(cs));
      if (match) matched.push(spec);
      return match;
    });

    const specialtyScore = Math.round((intersection.length / requestedSpecialties.length) * 15);
    score += specialtyScore;
  } else {
    // If no specific specialties requested, give partial credit
    score += 10;
  }

  return { score: Math.min(score, 30), matched };
}

/**
 * Calculate budget compatibility score (0-20 points)
 *
 * Evaluates if company's typical project range matches the request budget.
 */
export function calculateBudgetScore(
  requestBudgetMin?: number,
  requestBudgetMax?: number
): { score: number; compatibility: 'perfect' | 'good' | 'acceptable' | 'mismatch' } {
  if (!requestBudgetMin || !requestBudgetMax) {
    // No budget specified = neutral score
    return { score: 15, compatibility: 'acceptable' };
  }

  const budgetMid = (requestBudgetMin + requestBudgetMax) / 2;

  // Budget range evaluation
  // Perfect: 15-20 points
  // Good: 10-14 points
  // Acceptable: 5-9 points
  // Mismatch: 0-4 points

  // For now, we use a simple heuristic based on budget range
  // In production, you'd compare with company's historical project costs
  const budgetRange = requestBudgetMax - requestBudgetMin;
  const rangeRatio = budgetRange / budgetMid;

  let score = 20;
  let compatibility: 'perfect' | 'good' | 'acceptable' | 'mismatch' = 'perfect';

  if (rangeRatio < 0.2) {
    // Very narrow budget = harder to match
    score = 12;
    compatibility = 'good';
  } else if (rangeRatio < 0.5) {
    score = 18;
    compatibility = 'perfect';
  } else if (rangeRatio < 1.0) {
    score = 15;
    compatibility = 'good';
  } else {
    // Very wide budget range
    score = 10;
    compatibility = 'acceptable';
  }

  // Budget tier adjustments
  if (budgetMid < 100000) {
    // Small budget projects
    score = Math.max(score - 2, 8);
  } else if (budgetMid > 10000000) {
    // Large budget projects (premium)
    score = Math.min(score + 2, 20);
  }

  return { score, compatibility };
}

/**
 * Calculate company rating score (0-10 points)
 *
 * Rewards highly-rated companies.
 */
export function calculateRatingScore(
  averageRating: number,
  reviewCount: number
): number {
  if (reviewCount === 0) {
    return 5; // Neutral score for new companies
  }

  // Base score from rating (0-5 stars -> 0-8 points)
  let score = (averageRating / 5) * 8;

  // Bonus for review count (up to 2 points)
  if (reviewCount >= 50) {
    score += 2;
  } else if (reviewCount >= 20) {
    score += 1.5;
  } else if (reviewCount >= 10) {
    score += 1;
  } else if (reviewCount >= 5) {
    score += 0.5;
  }

  return Math.min(Math.round(score), 10);
}

/**
 * Calculate complete matching score for a company
 */
export function calculateMatchScore(
  company: CompanyWithRelations,
  request: RequestWithRequirements,
  config: MatchingConfig = {}
): MatchScore {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Extract company data
  const companyTechStacks = company.techStacks.map((ct) => ct.techStack.name);
  const companySpecialties = company.specialties.map((cs) => cs.specialty.name);

  // Extract request requirements
  const requestedTechStacks = request.requirements?.techStacks || [];
  const requestedSpecialties = request.requirements?.specialties || [];

  // Calculate individual scores
  const techStackResult = calculateTechStackScore(companyTechStacks, requestedTechStacks);
  const specialtyResult = calculateSpecialtyScore(
    companySpecialties,
    request.projectType,
    requestedSpecialties
  );
  const budgetResult = calculateBudgetScore(request.budgetMin ?? undefined, request.budgetMax ?? undefined);
  const ratingScore = calculateRatingScore(company.averageRating, company.reviewCount);

  // Calculate total score
  const total = Math.round(
    techStackResult.score + specialtyResult.score + budgetResult.score + ratingScore
  );

  return {
    total,
    techStackScore: techStackResult.score,
    specialtyScore: specialtyResult.score,
    budgetScore: budgetResult.score,
    ratingScore,
    matchedTechStacks: techStackResult.matched,
    matchedSpecialties: specialtyResult.matched,
    budgetCompatibility: budgetResult.compatibility,
  };
}

/**
 * Find and rank matching companies for a request
 */
export function findMatchingCompanies(
  companies: CompanyWithRelations[],
  request: RequestWithRequirements,
  filters?: MatchingFilters,
  config?: MatchingConfig
): MatchedCompany[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Apply filters
  let filteredCompanies = companies;

  if (filters) {
    filteredCompanies = filteredCompanies.filter((company) => {
      // Verified only filter
      if (filters.verifiedOnly && !company.isVerified) {
        return false;
      }

      // Minimum rating filter
      if (filters.minRating && company.averageRating < filters.minRating) {
        return false;
      }

      // Must accept new projects
      if (!company.acceptsNewProjects) {
        return false;
      }

      return true;
    });
  }

  // Calculate match scores for all companies
  const matchedCompanies: MatchedCompany[] = filteredCompanies.map((company) => ({
    company,
    matchScore: calculateMatchScore(company, request, config),
  }));

  // Filter by minimum score
  const qualifiedMatches = matchedCompanies.filter(
    (mc) => mc.matchScore.total >= cfg.minScore
  );

  // Sort by score (descending)
  qualifiedMatches.sort((a, b) => b.matchScore.total - a.matchScore.total);

  // Limit results
  return qualifiedMatches.slice(0, cfg.maxResults);
}

/**
 * Get match score tier for display
 */
export function getMatchTier(score: number): {
  tier: 'excellent' | 'good' | 'fair' | 'poor';
  label: string;
  color: string;
} {
  if (score >= 80) {
    return { tier: 'excellent', label: 'Excellent Match', color: 'green' };
  } else if (score >= 60) {
    return { tier: 'good', label: 'Good Match', color: 'blue' };
  } else if (score >= 40) {
    return { tier: 'fair', label: 'Fair Match', color: 'yellow' };
  } else {
    return { tier: 'poor', label: 'Poor Match', color: 'gray' };
  }
}
