/**
 * Quote Requests API Routes
 * POST /api/requests - Create new request
 * GET /api/requests - List requests with filtering and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import {
  requestCreateSchema,
  requestQuerySchema,
} from '@/lib/validations/request';
import { Prisma } from '@prisma/client';

/**
 * POST /api/requests
 * Create a new quote request
 * Authentication required
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = requestCreateSchema.parse(body);

    // Create request
    const request = await prisma.request.create({
      data: {
        userId: user.id,
        title: validatedData.title,
        description: validatedData.description,
        projectType: validatedData.projectType,
        budgetMin: validatedData.budgetMin,
        budgetMax: validatedData.budgetMax,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : null,
        preferredStart: validatedData.preferredStart
          ? new Date(validatedData.preferredStart)
          : null,
        requirements: validatedData.requirements || Prisma.JsonNull,
        attachments: validatedData.attachments,
        status: 'DRAFT',
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

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error('Error creating request:', error);

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
 * GET /api/requests
 * List quote requests with filtering, sorting, and pagination
 * Public for published requests, private for user's own drafts
 */
export async function GET(req: NextRequest) {
  try {
    // Get session for private requests
    const session = await getServerSession();
    const userEmail = session?.user?.email;

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const queryParams = {
      status: searchParams.get('status') || undefined,
      projectType: searchParams.get('projectType') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      search: searchParams.get('search') || undefined,
    };

    const validatedQuery = requestQuerySchema.parse(queryParams);

    // Build where clause
    const where: Prisma.RequestWhereInput = {
      AND: [
        // Status filter
        validatedQuery.status
          ? { status: validatedQuery.status }
          : // Show only published requests for non-authenticated users
            // Show published + user's own drafts for authenticated users
            userEmail
            ? {
                OR: [
                  { status: 'PUBLISHED' },
                  {
                    user: { email: userEmail },
                    status: 'DRAFT',
                  },
                ],
              }
            : { status: 'PUBLISHED' },

        // Project type filter
        validatedQuery.projectType
          ? { projectType: validatedQuery.projectType }
          : {},

        // Search filter
        validatedQuery.search
          ? {
              OR: [
                { title: { contains: validatedQuery.search, mode: 'insensitive' } },
                {
                  description: {
                    contains: validatedQuery.search,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {},
      ],
    };

    // Calculate pagination
    const skip = (validatedQuery.page - 1) * validatedQuery.limit;

    // Get total count for pagination
    const total = await prisma.request.count({ where });

    // Get requests
    const requests = await prisma.request.findMany({
      where,
      skip,
      take: validatedQuery.limit,
      orderBy: {
        [validatedQuery.sortBy]: validatedQuery.sortOrder,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            requestCompanies: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: requests,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total,
        totalPages: Math.ceil(total / validatedQuery.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching requests:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
