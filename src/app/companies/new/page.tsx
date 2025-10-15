"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import {
  companyBasicInfoSchema,
  companyContactInfoSchema,
  companyImagesSchema,
  companyTechSpecSchema,
  companyRegistrationSchema,
  type CompanyRegistration,
} from "@/lib/validations/company"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/company/ImageUpload"
import { TechStackSelector } from "@/components/company/TechStackSelector"
import { SpecialtySelector } from "@/components/company/SpecialtySelector"
import { cn } from "@/lib/utils/cn"

const STEPS = [
  { id: 1, name: "Basic Information", description: "Company details" },
  { id: 2, name: "Contact Information", description: "How to reach you" },
  { id: 3, name: "Images", description: "Logo and cover" },
  { id: 4, name: "Tech & Specialties", description: "Your expertise" },
]

export default function NewCompanyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | undefined>()

  const form = useForm<CompanyRegistration>({
    resolver: zodResolver(companyRegistrationSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      nameKana: "",
      description: "",
      foundedYear: undefined,
      employeeCount: "",
      capital: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      logo: "",
      coverImage: "",
      techStackIds: [],
      specialtyIds: [],
    },
  })

  const onSubmit = async (data: CompanyRegistration) => {
    try {
      setIsSubmitting(true)
      setError(undefined)

      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create company")
      }

      // Redirect to company profile
      router.push(`/companies/${result.data.slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateCurrentStep = async () => {
    let isValid = false

    switch (currentStep) {
      case 1:
        isValid = await form.trigger([
          "name",
          "nameKana",
          "description",
          "foundedYear",
          "employeeCount",
          "capital",
        ])
        break
      case 2:
        isValid = await form.trigger(["address", "phone", "email", "website"])
        break
      case 3:
        isValid = await form.trigger(["logo", "coverImage"])
        break
      case 4:
        isValid = await form.trigger(["techStackIds", "specialtyIds"])
        break
    }

    return isValid
  }

  const handleNext = async () => {
    const isValid = await validateCurrentStep()
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Register Your Company</h1>
          <p className="mt-2 text-gray-600">
            Create your company profile to start receiving project requests
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-colors",
                      currentStep > step.id
                        ? "border-green-600 bg-green-600 text-white"
                        : currentStep === step.id
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 bg-white text-gray-500"
                    )}
                  >
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium text-gray-900">{step.name}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 transition-colors",
                      currentStep > step.id ? "bg-green-600" : "bg-gray-300"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="rounded-lg bg-white p-8 shadow-md">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>

                <div>
                  <Label htmlFor="name">
                    Company Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Acme Inc."
                    className="mt-1"
                  />
                  {form.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nameKana">Company Name (Kana)</Label>
                  <Input
                    id="nameKana"
                    {...form.register("nameKana")}
                    placeholder="アクメ"
                    className="mt-1"
                  />
                  {form.formState.errors.nameKana && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.nameKana.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Tell us about your company..."
                    className="mt-1"
                    rows={4}
                  />
                  {form.formState.errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="foundedYear">Founded Year</Label>
                    <Input
                      id="foundedYear"
                      type="number"
                      {...form.register("foundedYear", { valueAsNumber: true })}
                      placeholder="2020"
                      className="mt-1"
                    />
                    {form.formState.errors.foundedYear && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.foundedYear.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="employeeCount">Employee Count</Label>
                    <Input
                      id="employeeCount"
                      {...form.register("employeeCount")}
                      placeholder="10-50"
                      className="mt-1"
                    />
                    {form.formState.errors.employeeCount && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.employeeCount.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="capital">Capital</Label>
                    <Input
                      id="capital"
                      {...form.register("capital")}
                      placeholder="10M JPY"
                      className="mt-1"
                    />
                    {form.formState.errors.capital && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.capital.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...form.register("address")}
                    placeholder="123 Main St, Tokyo, Japan"
                    className="mt-1"
                  />
                  {form.formState.errors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      {...form.register("phone")}
                      placeholder="+81-3-1234-5678"
                      className="mt-1"
                    />
                    {form.formState.errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="contact@example.com"
                      className="mt-1"
                    />
                    {form.formState.errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    {...form.register("website")}
                    placeholder="https://example.com"
                    className="mt-1"
                  />
                  {form.formState.errors.website && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.website.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Images */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Images</h2>

                <ImageUpload
                  label="Company Logo"
                  description="Square logo, recommended 400x400px"
                  value={form.watch("logo") || undefined}
                  onChange={(url) => form.setValue("logo", url)}
                  onRemove={() => form.setValue("logo", "")}
                  aspectRatio="1/1"
                />

                <ImageUpload
                  label="Cover Image"
                  description="Wide banner image, recommended 1200x400px"
                  value={form.watch("coverImage") || undefined}
                  onChange={(url) => form.setValue("coverImage", url)}
                  onRemove={() => form.setValue("coverImage", "")}
                  aspectRatio="3/1"
                />
              </div>
            )}

            {/* Step 4: Tech & Specialties */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Tech Stacks & Specialties
                </h2>

                <TechStackSelector
                  label="Tech Stacks"
                  description="Select the technologies your company specializes in"
                  value={form.watch("techStackIds")}
                  onChange={(value) => form.setValue("techStackIds", value)}
                />
                {form.formState.errors.techStackIds && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.techStackIds.message}
                  </p>
                )}

                <SpecialtySelector
                  label="Specialties"
                  description="Select your company's areas of expertise"
                  value={form.watch("specialtyIds")}
                  onChange={(value) => form.setValue("specialtyIds", value)}
                />
                {form.formState.errors.specialtyIds && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.specialtyIds.message}
                  </p>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {currentStep < STEPS.length ? (
                <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Create Company
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
