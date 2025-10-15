/**
 * Review Submission Page
 * Page for creating a new review for a company
 * Route: /companies/[slug]/reviews/new
 */

import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReviewForm } from "@/components/reviews/ReviewForm";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function NewReviewPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  // Require authentication
  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=/companies/${params.slug}/reviews/new`);
  }

  // Fetch company by slug
  const company = await prisma.company.findUnique({
    where: {
      slug: params.slug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!company) {
    notFound();
  }

  // Check if user is trying to review their own company
  const companyUser = await prisma.companyUser.findFirst({
    where: {
      userId: session.user.id,
      companyId: company.id,
    },
  });

  if (companyUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Cannot Review Your Own Company
              </h1>
              <p className="text-gray-600 mb-6">
                You cannot submit a review for a company you are associated
                with.
              </p>
              <a
                href={`/companies/${params.slug}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Company Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has already reviewed this company
  const existingReview = await prisma.review.findFirst({
    where: {
      userId: session.user.id,
      companyId: company.id,
    },
  });

  if (existingReview) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Review Already Submitted
              </h1>
              <p className="text-gray-600 mb-6">
                You have already submitted a review for {company.name}. You can
                edit your existing review instead.
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href={`/reviews/${existingReview.id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Review
                </a>
                <a
                  href={`/companies/${params.slug}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Company Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          <ReviewForm
            companyId={company.id}
            companyName={company.name}
            mode="create"
          />
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const company = await prisma.company.findUnique({
    where: {
      slug: params.slug,
    },
    select: {
      name: true,
    },
  });

  return {
    title: company ? `Write a Review - ${company.name}` : "Write a Review",
    description: company
      ? `Share your experience working with ${company.name}`
      : "Write a review",
  };
}
