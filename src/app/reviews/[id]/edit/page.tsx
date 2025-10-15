/**
 * Review Edit Page
 * Page for editing an existing review
 * Route: /reviews/[id]/edit
 */

import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { canEditReview } from "@/lib/validations/review";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditReviewPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  // Require authentication
  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=/reviews/${params.id}/edit`);
  }

  // Fetch review
  const review = await prisma.review.findUnique({
    where: {
      id: params.id,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      user: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!review) {
    notFound();
  }

  // Check if user is the review owner
  if (review.user.id !== session.user.id) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Access Denied
              </h1>
              <p className="text-gray-600 mb-6">
                You can only edit your own reviews.
              </p>
              <a
                href={`/companies/${review.company.slug}`}
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

  // Check if review can still be edited (within 30 days)
  if (!canEditReview(review.createdAt)) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Edit Period Expired
              </h1>
              <p className="text-gray-600 mb-6">
                Reviews can only be edited within 30 days of posting. Your
                review was posted more than 30 days ago and can no longer be
                edited.
              </p>
              <a
                href={`/companies/${review.company.slug}`}
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          <ReviewForm
            companyId={review.company.id}
            companyName={review.company.name}
            initialData={{
              id: review.id,
              rating: review.rating,
              title: review.title || undefined,
              content: review.content,
              projectType: review.projectType || undefined,
              projectDuration: review.projectDuration || undefined,
              projectCost: review.projectCost || undefined,
            }}
            mode="edit"
          />
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const review = await prisma.review.findUnique({
    where: {
      id: params.id,
    },
    include: {
      company: {
        select: {
          name: true,
        },
      },
    },
  });

  return {
    title: review ? `Edit Review - ${review.company.name}` : "Edit Review",
    description: "Edit your review",
  };
}
