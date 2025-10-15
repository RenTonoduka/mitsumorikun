/**
 * Publish Request API Route
 * POST /api/requests/[id]/publish - Publish a draft request
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
 * POST /api/requests/[id]/publish
 * Publish a draft request (change status from DRAFT to PUBLISHED)
 * Once published, request cannot be edited
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

    // Check if request can be published
    if (existingRequest.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only draft requests can be published' },
        { status: 400 }
      );
    }

    // Validate required fields for publishing
    if (!existingRequest.title || existingRequest.title.length < 5) {
      return NextResponse.json(
        { error: 'Title must be at least 5 characters' },
        { status: 400 }
      );
    }

    if (!existingRequest.description || existingRequest.description.length < 20) {
      return NextResponse.json(
        { error: 'Description must be at least 20 characters' },
        { status: 400 }
      );
    }

    // Publish request
    const publishedRequest = await prisma.request.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
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

    return NextResponse.json(publishedRequest);
  } catch (error) {
    console.error('Error publishing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
