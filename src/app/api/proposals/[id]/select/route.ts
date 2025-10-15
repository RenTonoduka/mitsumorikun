/**
 * Proposal Selection API Route
 * POST /api/proposals/[id]/select - Select a proposal (auto-reject others)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * POST /api/proposals/[id]/select
 * Select a proposal and automatically reject all other proposals for the request
 * Only accessible by request owner
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
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

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (proposal.request.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Only request owner can select proposals' },
        { status: 403 }
      );
    }

    // Check if proposal is in valid state for selection
    if (proposal.status !== 'RESPONDED') {
      return NextResponse.json(
        { error: 'Only responded proposals can be selected' },
        { status: 400 }
      );
    }

    // Check if request is still open
    if (proposal.request.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Request is no longer accepting selections' },
        { status: 400 }
      );
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Select this proposal
      const selectedProposal = await tx.requestCompany.update({
        where: { id },
        data: {
          status: 'SELECTED',
          selectedAt: new Date(),
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

      // 2. Reject all other proposals for this request
      await tx.requestCompany.updateMany({
        where: {
          requestId: proposal.requestId,
          id: {
            not: id,
          },
          status: 'RESPONDED',
        },
        data: {
          status: 'REJECTED',
        },
      });

      // 3. Optionally close the request (or mark as closed)
      await tx.request.update({
        where: { id: proposal.requestId },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
        },
      });

      return selectedProposal;
    });

    // TODO: Send notifications
    // - Notify selected company
    // - Notify rejected companies
    // - Update request status

    return NextResponse.json({
      message: 'Proposal selected successfully',
      proposal: result,
    });
  } catch (error) {
    console.error('Error selecting proposal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
