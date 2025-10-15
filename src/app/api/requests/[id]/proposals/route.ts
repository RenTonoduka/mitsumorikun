/**
 * Request Proposals API Routes
 * GET /api/requests/[id]/proposals - Get all proposals for a request
 * POST /api/requests/[id]/proposals - Submit a proposal (company side)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { calculateMatchScore } from '@/lib/matching/algorithm';
import { RequestWithRequirements } from '@/types/matching';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * Proposal submission validation schema
 */
const proposalSchema = z.object({
  estimatedCost: z.number().int().positive('Estimated cost must be positive'),
  estimatedDuration: z.string().min(1, 'Estimated duration is required'),
  proposal: z.string().min(50, 'Proposal must be at least 50 characters'),
  attachments: z.array(z.string().url()).optional(),
});

/**
 * GET /api/requests/[id]/proposals
 * Get all proposals for a request
 * Only accessible by request owner
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch request with user info
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (request.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Only request owner can view proposals' },
        { status: 403 }
      );
    }

    // Fetch all proposals with company details
    const proposals = await prisma.requestCompany.findMany({
      where: {
        requestId: id,
        status: {
          not: 'PENDING', // Only show submitted proposals
        },
      },
      include: {
        company: {
          include: {
            techStacks: {
              include: {
                techStack: true,
              },
            },
            specialties: {
              include: {
                specialty: true,
              },
            },
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // SELECTED first
        { respondedAt: 'desc' }, // Then by submission time
      ],
    });

    // Calculate match scores for each proposal
    const requestWithReq = request as RequestWithRequirements;
    const proposalsWithScores = proposals.map((proposal) => {
      const matchScore = calculateMatchScore(proposal.company, requestWithReq);

      return {
        id: proposal.id,
        requestId: proposal.requestId,
        companyId: proposal.companyId,
        estimatedCost: proposal.estimatedCost,
        estimatedDuration: proposal.estimatedDuration,
        proposal: proposal.proposal,
        attachments: proposal.attachments,
        status: proposal.status,
        respondedAt: proposal.respondedAt,
        selectedAt: proposal.selectedAt,
        createdAt: proposal.createdAt,
        updatedAt: proposal.updatedAt,
        company: {
          id: proposal.company.id,
          name: proposal.company.name,
          slug: proposal.company.slug,
          logo: proposal.company.logo,
          description: proposal.company.description,
          averageRating: proposal.company.averageRating,
          reviewCount: proposal.company.reviewCount,
          projectCount: proposal.company.projectCount,
          isVerified: proposal.company.isVerified,
          techStacks: proposal.company.techStacks.map((ct) => ct.techStack.name),
          specialties: proposal.company.specialties.map((cs) => cs.specialty.name),
        },
        matchScore,
      };
    });

    return NextResponse.json({
      requestId: id,
      totalProposals: proposalsWithScores.length,
      proposals: proposalsWithScores,
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/requests/[id]/proposals
 * Submit a proposal for a request
 * Only accessible by verified company admins
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: requestId } = params;

    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user with company associations
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        companyUsers: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!user || user.companyUsers.length === 0) {
      return NextResponse.json(
        { error: 'User is not associated with any company' },
        { status: 403 }
      );
    }

    // Get the first company (in production, you'd select from multiple)
    const companyUser = user.companyUsers[0];
    const company = companyUser.company;

    // Check if company is verified
    if (!company.isVerified) {
      return NextResponse.json(
        { error: 'Only verified companies can submit proposals' },
        { status: 403 }
      );
    }

    // Fetch request
    const request = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Only published requests can receive proposals
    if (request.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Only published requests can receive proposals' },
        { status: 400 }
      );
    }

    // Check if company already submitted a proposal
    const existingProposal = await prisma.requestCompany.findUnique({
      where: {
        requestId_companyId: {
          requestId,
          companyId: company.id,
        },
      },
    });

    if (existingProposal && existingProposal.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Company has already submitted a proposal for this request' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = proposalSchema.parse(body);

    // Create or update proposal
    const proposal = await prisma.requestCompany.upsert({
      where: {
        requestId_companyId: {
          requestId,
          companyId: company.id,
        },
      },
      create: {
        requestId,
        companyId: company.id,
        estimatedCost: validatedData.estimatedCost,
        estimatedDuration: validatedData.estimatedDuration,
        proposal: validatedData.proposal,
        attachments: validatedData.attachments || [],
        status: 'RESPONDED',
        respondedAt: new Date(),
      },
      update: {
        estimatedCost: validatedData.estimatedCost,
        estimatedDuration: validatedData.estimatedDuration,
        proposal: validatedData.proposal,
        attachments: validatedData.attachments || [],
        status: 'RESPONDED',
        respondedAt: new Date(),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            averageRating: true,
            reviewCount: true,
          },
        },
      },
    });

    // TODO: Send notification to request owner

    return NextResponse.json(
      {
        message: 'Proposal submitted successfully',
        proposal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting proposal:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
