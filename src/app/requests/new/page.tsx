/**
 * New Request Page
 * Multi-step form for creating quote requests
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProjectType } from '@prisma/client';
import {
  requestCreateSchema,
  type RequestCreateInput,
} from '@/lib/validations/request';
import {
  projectTypeLabels,
  projectTypeDescriptions,
} from '@/lib/utils/request';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/request/FileUpload';

type FormData = RequestCreateInput;

const STEPS = [
  { id: 1, title: 'Project Info', description: 'Basic project details' },
  { id: 2, title: 'Budget & Timeline', description: 'Budget and schedule' },
  { id: 3, title: 'Requirements', description: 'Detailed requirements' },
  { id: 4, title: 'Attachments', description: 'Upload files' },
  { id: 5, title: 'Review', description: 'Review and submit' },
];

export default function NewRequestPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(requestCreateSchema),
    mode: 'onChange',
  });

  const formData = watch();

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (formData.title || formData.description) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData]);

  const saveDraft = async () => {
    try {
      const method = draftId ? 'PATCH' : 'POST';
      const url = draftId ? `/api/requests/${draftId}` : '/api/requests';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        if (!draftId) {
          setDraftId(data.id);
        }
        console.log('Draft saved');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Create or update request
      const method = draftId ? 'PATCH' : 'POST';
      const url = draftId ? `/api/requests/${draftId}` : '/api/requests';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save request');
      }

      const request = await response.json();

      // Ask if user wants to publish immediately
      const shouldPublish = window.confirm(
        'Request saved as draft. Do you want to publish it now?'
      );

      if (shouldPublish) {
        const publishResponse = await fetch(
          `/api/requests/${request.id}/publish`,
          { method: 'POST' }
        );

        if (!publishResponse.ok) {
          throw new Error('Failed to publish request');
        }
      }

      router.push(`/requests/${request.id}`);
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Quote Request
          </h1>
          <p className="mt-2 text-gray-600">
            Fill out the form below to request quotes from companies
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      step.id === currentStep
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : step.id < currentStep
                          ? 'border-green-600 bg-green-600 text-white'
                          : 'border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <p className="mt-2 hidden text-xs font-medium text-gray-900 sm:block">
                    {step.title}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      step.id < currentStep ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Project Info */}
              {currentStep === 1 && (
                <>
                  <div>
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="e.g., E-commerce website development"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="projectType">Project Type *</Label>
                    <Select
                      value={formData.projectType}
                      onValueChange={(value) =>
                        setValue('projectType', value as ProjectType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(projectTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            <div>
                              <div className="font-medium">{label}</div>
                              <div className="text-xs text-gray-500">
                                {projectTypeDescriptions[key as ProjectType]}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.projectType && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.projectType.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Project Description *</Label>
                    <Textarea
                      id="description"
                      rows={6}
                      {...register('description')}
                      placeholder="Describe your project in detail..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description.message}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.description?.length || 0} / 2000 characters
                    </p>
                  </div>
                </>
              )}

              {/* Step 2: Budget & Timeline */}
              {currentStep === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budgetMin">Minimum Budget (¥)</Label>
                      <Input
                        id="budgetMin"
                        type="number"
                        {...register('budgetMin', { valueAsNumber: true })}
                        placeholder="e.g., 1000000"
                      />
                      {errors.budgetMin && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.budgetMin.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="budgetMax">Maximum Budget (¥)</Label>
                      <Input
                        id="budgetMax"
                        type="number"
                        {...register('budgetMax', { valueAsNumber: true })}
                        placeholder="e.g., 3000000"
                      />
                      {errors.budgetMax && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.budgetMax.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preferredStart">Preferred Start Date</Label>
                      <Input
                        id="preferredStart"
                        type="date"
                        {...register('preferredStart')}
                      />
                      {errors.preferredStart && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.preferredStart.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input id="deadline" type="date" {...register('deadline')} />
                      {errors.deadline && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.deadline.message}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Requirements */}
              {currentStep === 3 && (
                <>
                  <div>
                    <Label htmlFor="features">Key Features</Label>
                    <Textarea
                      id="features"
                      rows={4}
                      placeholder="List the main features you need..."
                      onChange={(e) => {
                        const features = e.target.value
                          .split('\n')
                          .filter((f) => f.trim());
                        setValue('requirements', {
                          ...formData.requirements,
                          features,
                        });
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="technologies">
                      Preferred Technologies (Optional)
                    </Label>
                    <Input
                      id="technologies"
                      placeholder="e.g., React, Node.js, PostgreSQL"
                      onChange={(e) => {
                        const technologies = e.target.value
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean);
                        setValue('requirements', {
                          ...formData.requirements,
                          technologies,
                        });
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Input
                      id="targetAudience"
                      placeholder="Who will use this system?"
                      onChange={(e) => {
                        setValue('requirements', {
                          ...formData.requirements,
                          targetAudience: e.target.value,
                        });
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="additionalNotes">Additional Notes</Label>
                    <Textarea
                      id="additionalNotes"
                      rows={4}
                      placeholder="Any other requirements or notes..."
                      onChange={(e) => {
                        setValue('requirements', {
                          ...formData.requirements,
                          additionalNotes: e.target.value,
                        });
                      }}
                    />
                  </div>
                </>
              )}

              {/* Step 4: Attachments */}
              {currentStep === 4 && (
                <>
                  <div>
                    <Label>File Attachments (Optional)</Label>
                    <p className="mb-4 text-sm text-gray-600">
                      Upload any relevant documents, designs, or specifications
                    </p>
                    <FileUpload
                      value={formData.attachments}
                      onChange={(urls) => setValue('attachments', urls)}
                    />
                  </div>
                </>
              )}

              {/* Step 5: Review */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="font-medium text-gray-900">Project Info</h3>
                    <dl className="mt-2 space-y-2 text-sm">
                      <div>
                        <dt className="text-gray-600">Title:</dt>
                        <dd className="font-medium">{formData.title}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Type:</dt>
                        <dd className="font-medium">
                          {formData.projectType &&
                            projectTypeLabels[formData.projectType]}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Description:</dt>
                        <dd>{formData.description}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="font-medium text-gray-900">
                      Budget & Timeline
                    </h3>
                    <dl className="mt-2 space-y-2 text-sm">
                      <div>
                        <dt className="text-gray-600">Budget:</dt>
                        <dd className="font-medium">
                          {formData.budgetMin && formData.budgetMax
                            ? `¥${formData.budgetMin.toLocaleString()} - ¥${formData.budgetMax.toLocaleString()}`
                            : 'Not specified'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Timeline:</dt>
                        <dd className="font-medium">
                          {formData.preferredStart && formData.deadline
                            ? `${formData.preferredStart} to ${formData.deadline}`
                            : 'Not specified'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {formData.attachments && formData.attachments.length > 0 && (
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h3 className="font-medium text-gray-900">Attachments</h3>
                      <p className="mt-2 text-sm">
                        {formData.attachments.length} file(s) attached
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={saveDraft}
                    disabled={isSubmitting}
                  >
                    Save Draft
                  </Button>

                  {currentStep < STEPS.length ? (
                    <Button type="button" onClick={nextStep}>
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
