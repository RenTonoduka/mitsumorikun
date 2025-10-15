import * as React from "react"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Building2, MapPin, Phone, Mail, Globe, Calendar, Users, Briefcase, Star } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface CompanyProfilePageProps {
  params: {
    slug: string
  }
}

async function getCompany(slug: string) {
  const company = await prisma.company.findUnique({
    where: { slug },
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
      companyUsers: {
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
      },
      reviews: {
        where: {
          isPublished: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      _count: {
        select: {
          reviews: true,
          favorites: true,
          requestCompanies: true,
        },
      },
    },
  })

  return company
}

export default async function CompanyProfilePage({ params }: CompanyProfilePageProps) {
  const company = await getCompany(params.slug)

  if (!company) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      {company.coverImage && (
        <div className="relative h-80 w-full bg-gradient-to-r from-blue-600 to-purple-600">
          <img
            src={company.coverImage}
            alt={`${company.name} cover`}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className={cn("relative", company.coverImage ? "-mt-20" : "pt-8")}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            {/* Logo */}
            <div className="flex-shrink-0">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  className="h-32 w-32 rounded-lg border-4 border-white bg-white object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-lg border-4 border-white bg-white shadow-lg">
                  <Building2 className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Company Info */}
            <div className="flex-1 pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                  {company.nameKana && (
                    <p className="mt-1 text-lg text-gray-600">{company.nameKana}</p>
                  )}
                </div>

                {/* Verification Badge */}
                {company.isVerified && (
                  <div className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-900">
                    <Star className="h-4 w-4 fill-blue-600 text-blue-600" />
                    Verified
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                {company.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{company.averageRating.toFixed(1)}</span>
                    <span>({company.reviewCount} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{company.projectCount} projects</span>
                </div>
                {company.foundedYear && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Founded {company.foundedYear}</span>
                  </div>
                )}
                {company.employeeCount && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{company.employeeCount} employees</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 pb-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* About */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-900">About</h2>
              {company.description ? (
                <p className="mt-4 whitespace-pre-wrap text-gray-700">{company.description}</p>
              ) : (
                <p className="mt-4 text-gray-500">No description available.</p>
              )}
            </div>

            {/* Tech Stacks */}
            {company.techStacks.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="text-xl font-semibold text-gray-900">Tech Stack</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {company.techStacks.map((ct) => (
                    <div
                      key={ct.id}
                      className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900"
                    >
                      {ct.techStack.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specialties */}
            {company.specialties.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="text-xl font-semibold text-gray-900">Specialties</h2>
                <div className="mt-4 space-y-3">
                  {company.specialties.map((cs) => (
                    <div key={cs.id}>
                      <h3 className="font-medium text-gray-900">{cs.specialty.name}</h3>
                      {cs.specialty.description && (
                        <p className="mt-1 text-sm text-gray-600">{cs.specialty.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {company.reviews.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="text-xl font-semibold text-gray-900">
                  Reviews ({company._count.reviews})
                </h2>
                <div className="mt-4 space-y-6">
                  {company.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {review.user.image ? (
                            <img
                              src={review.user.image}
                              alt={review.user.name || "User"}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {review.user.name || "Anonymous"}
                            </p>
                            <div className="flex">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                            </div>
                          </div>
                          {review.title && (
                            <h4 className="mt-1 font-medium text-gray-900">{review.title}</h4>
                          )}
                          <p className="mt-2 text-gray-700">{review.content}</p>
                          <p className="mt-2 text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              <div className="mt-4 space-y-3">
                {company.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 flex-shrink-0 text-gray-400" />
                    <span className="text-sm text-gray-700">{company.address}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 flex-shrink-0 text-gray-400" />
                    <a href={`tel:${company.phone}`} className="text-sm text-blue-600 hover:underline">
                      {company.phone}
                    </a>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 flex-shrink-0 text-gray-400" />
                    <a
                      href={`mailto:${company.email}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {company.email}
                    </a>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 flex-shrink-0 text-gray-400" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {company.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Company Details */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900">Company Details</h3>
              <div className="mt-4 space-y-3">
                {company.foundedYear && (
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Founded</p>
                    <p className="mt-1 text-sm text-gray-900">{company.foundedYear}</p>
                  </div>
                )}
                {company.employeeCount && (
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Employees</p>
                    <p className="mt-1 text-sm text-gray-900">{company.employeeCount}</p>
                  </div>
                )}
                {company.capital && (
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Capital</p>
                    <p className="mt-1 text-sm text-gray-900">{company.capital}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
