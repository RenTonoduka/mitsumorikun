/**
 * Individual Proposal API Routes
 * GET /api/proposals/[id] - Get proposal details
 * PATCH /api/proposals/[id] - Update proposal status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { RequestCompanyStatus } from '@prisma/client';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * Status update validation schema
 */
const statusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'RESPONDED', 'SELECTED', 'REJECTED']),
  reason: z.string().optional(),
});

/**
 * GET /api/proposals/[id]
 * Get proposal details
 * Accessible by request owner or company member
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

    // Fetch proposal with full details
    const proposal = await prisma.requestCompany.findUnique({
      where: { id },
      include: {
        request: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        company: {
          include: {
            companyUsers: {
              include: {
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
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
    });

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Check authorization (request owner or company member)
    const isRequestOwner = proposal.request.user.email === session.user.email;
    const isCompanyMember = proposal.company.companyUsers.some(
      (cu) => cu.user.email === session.user.email
    );

    if (!isRequestOwner && !isCompanyMember) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Format response
    const response = {
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
      request: {
        id: proposal.request.id,
        title: proposal.request.title,
        description: proposal.request.description,
        projectType: proposal.request.projectType,
        budgetMin: proposal.request.budgetMin,
        budgetMax: proposal.request.budgetMax,
        status: proposal.request.status,
      },
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
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/proposals/[id]
 * Update proposal status
 * Only accessible by request owner (for SELECTED/REJECTED status)
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
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

    // Fetch proposal with request details
    const proposal = await prisma.requestCompany.findUnique({
      where: { id },
      include: {
        request: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (proposal.request.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Only request owner can update proposal status' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = statusUpdateSchema.parse(body);

    // Validate status transition
    if (validatedData.status === 'RESPONDED') {
      return NextResponse.json(
        { error: 'Cannot manually set status to RESPONDED' },
        { status: 400 }
      );
    }

    // Update proposal
    const updatedProposal = await prisma.requestCompany.update({
      where: { id },
      data: {
        status: validatedData.status,
        selectedAt: validatedData.status === 'SELECTED' ? new Date() : null,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
    });

    // TODO: Send notification to company

    return NextResponse.json({
      message: 'Proposal status updated',
      proposal: updatedProposal,
    });
  } catch (error) {
    console.error('Error updating proposal:', error);

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
