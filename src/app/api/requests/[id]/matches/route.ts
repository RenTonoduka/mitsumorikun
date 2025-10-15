/**
 * Request Matching API Routes
 * GET /api/requests/[id]/matches - Get matched companies with scores
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findMatchingCompanies } from '@/lib/matching/algorithm';
import { RequestWithRequirements, MatchingFilters } from '@/types/matching';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/requests/[id]/matches
 * Get matched companies for a request with matching scores
 *
 * Query parameters:
 * - minScore: Minimum matching score (0-100, default: 30)
 * - maxResults: Maximum number of results (default: 20)
 * - verifiedOnly: Only verified companies (boolean, default: false)
 * - minRating: Minimum company rating (0-5, default: 0)
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const minScore = parseInt(searchParams.get('minScore') || '30');
    const maxResults = parseInt(searchParams.get('maxResults') || '20');
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const minRating = parseFloat(searchParams.get('minRating') || '0');

    // Fetch request with all details
    const request = await prisma.request.findUnique({
      where: { id },
    });

    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Only published requests can receive matches
    if (request.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Only published requests can receive matches' },
        { status: 400 }
      );
    }

    // Fetch all active companies with their tech stacks and specialties
    const companies = await prisma.company.findMany({
      where: {
        acceptsNewProjects: true,
        isVerified: verifiedOnly ? true : undefined,
      },
      include: {
        techStacks: {
          include: {
            techStack: {
              select: {
                id: true,
                name: true,
                slug: true,
                category: true,
              },
            },
          },
        },
        specialties: {
          include: {
            specialty: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // Cast request to RequestWithRequirements
    const requestWithReq = request as RequestWithRequirements;

    // Prepare filters
    const filters: MatchingFilters = {
      verifiedOnly,
      minRating,
    };

    // Find matching companies
    const matchedCompanies = findMatchingCompanies(
      companies,
      requestWithReq,
      filters,
      {
        minScore,
        maxResults,
      }
    );

    // Format response
    const response = {
      requestId: id,
      totalMatches: matchedCompanies.length,
      matches: matchedCompanies.map((mc) => ({
        company: {
          id: mc.company.id,
          name: mc.company.name,
          slug: mc.company.slug,
          logo: mc.company.logo,
          description: mc.company.description,
          averageRating: mc.company.averageRating,
          reviewCount: mc.company.reviewCount,
          projectCount: mc.company.projectCount,
          isVerified: mc.company.isVerified,
          techStacks: mc.company.techStacks.map((ct) => ct.techStack.name),
          specialties: mc.company.specialties.map((cs) => cs.specialty.name),
        },
        matchScore: mc.matchScore,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
