/**
 * Individual Request API Routes
 * GET /api/requests/[id] - Get request details
 * PATCH /api/requests/[id] - Update request
 * DELETE /api/requests/[id] - Delete request
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { requestUpdateSchema } from '@/lib/validations/request';
import { Prisma } from '@prisma/client';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/requests/[id]
 * Get request details
 * Public for published requests, private for drafts
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // Get session for authorization
    const session = await getServerSession();

    // Fetch request
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        requestCompanies: {
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Authorization check for draft requests
    if (request.status === 'DRAFT') {
      if (!session?.user?.email || session.user.email !== request.user.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error('Error fetching request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/requests/[id]
 * Update request (only if status is DRAFT and user is owner)
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

    // Fetch request with user info
    const existingRequest = await prisma.request.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check ownership
    if (existingRequest.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if request can be edited (only DRAFT status)
    if (existingRequest.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only draft requests can be edited' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = requestUpdateSchema.parse(body);

    // Build update data
    const updateData: Prisma.RequestUpdateInput = {};

    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.projectType !== undefined)
      updateData.projectType = validatedData.projectType;
    if (validatedData.budgetMin !== undefined)
      updateData.budgetMin = validatedData.budgetMin;
    if (validatedData.budgetMax !== undefined)
      updateData.budgetMax = validatedData.budgetMax;
    if (validatedData.deadline !== undefined)
      updateData.deadline = validatedData.deadline
        ? new Date(validatedData.deadline)
        : null;
    if (validatedData.preferredStart !== undefined)
      updateData.preferredStart = validatedData.preferredStart
        ? new Date(validatedData.preferredStart)
        : null;
    if (validatedData.requirements !== undefined)
      updateData.requirements = validatedData.requirements || Prisma.JsonNull;
    if (validatedData.attachments !== undefined)
      updateData.attachments = validatedData.attachments;

    // Update request
    const updatedRequest = await prisma.request.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating request:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/requests/[id]
 * Delete request (only if user is owner and status is DRAFT or CANCELLED)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
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
    const existingRequest = await prisma.request.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check ownership
    if (existingRequest.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if request can be deleted
    if (
      existingRequest.status !== 'DRAFT' &&
      existingRequest.status !== 'CANCELLED'
    ) {
      return NextResponse.json(
        { error: 'Only draft or cancelled requests can be deleted' },
        { status: 400 }
      );
    }

    // Delete request (cascade will handle related records)
    await prisma.request.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Request deleted' });
  } catch (error) {
    console.error('Error deleting request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
