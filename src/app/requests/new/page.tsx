/**
 * New Request Page
 * Multi-step form for creating quote requests
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
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
import { AlertCircle } from 'lucide-react';

type FormData = RequestCreateInput;

const STEPS = [
  { id: 1, title: 'プロジェクト情報', description: '基本的なプロジェクト詳細' },
  { id: 2, title: '予算とスケジュール', description: '予算と期間' },
  { id: 3, title: '要件', description: '詳細な要件' },
  { id: 4, title: '添付ファイル', description: 'ファイルをアップロード' },
  { id: 5, title: '確認', description: '確認して送信' },
];

export default function NewRequestPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    // Check authentication
    if (!session) {
      setError('リクエストを送信するにはログインが必要です。');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create or update request
      const method = draftId ? 'PATCH' : 'POST';
      const url = draftId ? `/api/requests/${draftId}` : '/api/requests';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        setError('認証の有効期限が切れました。再度ログインしてください。');
        setTimeout(() => signIn('google'), 2000);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save request');
      }

      const request = await response.json();

      // Ask if user wants to publish immediately
      const shouldPublish = window.confirm(
        'リクエストを下書きとして保存しました。今すぐ公開しますか?'
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
      setError(
        error instanceof Error
          ? error.message
          : 'リクエストの送信に失敗しました。もう一度お試しください。'
      );
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

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-purple-600"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // Show login prompt for unauthenticated users
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              ログインが必要です
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              見積もりリクエストを作成するには、ログインが必要です。
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => signIn('google')}
                className="w-full"
                size="lg"
              >
                Googleでログイン
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
              >
                ホームに戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            見積もりリクエストを作成
          </h1>
          <p className="mt-2 text-gray-600">
            以下のフォームに入力して、企業から見積もりを依頼してください
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

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
                    <Label htmlFor="title">プロジェクト名 *</Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="例: ECサイト開発"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="projectType">プロジェクトタイプ *</Label>
                    <Select
                      value={formData.projectType}
                      onValueChange={(value) =>
                        setValue('projectType', value as ProjectType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="プロジェクトタイプを選択" />
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
                    <Label htmlFor="description">プロジェクト概要 *</Label>
                    <Textarea
                      id="description"
                      rows={6}
                      {...register('description')}
                      placeholder="プロジェクトの詳細を記述してください..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description.message}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.description?.length || 0} / 2000 文字
                    </p>
                  </div>
                </>
              )}

              {/* Step 2: Budget & Timeline */}
              {currentStep === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budgetMin">最低予算 (¥)</Label>
                      <Input
                        id="budgetMin"
                        type="number"
                        {...register('budgetMin', { valueAsNumber: true })}
                        placeholder="例: 1000000"
                      />
                      {errors.budgetMin && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.budgetMin.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="budgetMax">最高予算 (¥)</Label>
                      <Input
                        id="budgetMax"
                        type="number"
                        {...register('budgetMax', { valueAsNumber: true })}
                        placeholder="例: 3000000"
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
                      <Label htmlFor="preferredStart">希望開始日</Label>
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
                      <Label htmlFor="deadline">納期</Label>
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
                    <Label htmlFor="features">主要機能</Label>
                    <Textarea
                      id="features"
                      rows={4}
                      placeholder="必要な主要機能をリストアップしてください..."
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
                      希望技術スタック (任意)
                    </Label>
                    <Input
                      id="technologies"
                      placeholder="例: React, Node.js, PostgreSQL"
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
                    <Label htmlFor="targetAudience">ターゲット</Label>
                    <Input
                      id="targetAudience"
                      placeholder="誰がこのシステムを使用しますか?"
                      onChange={(e) => {
                        setValue('requirements', {
                          ...formData.requirements,
                          targetAudience: e.target.value,
                        });
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="additionalNotes">備考</Label>
                    <Textarea
                      id="additionalNotes"
                      rows={4}
                      placeholder="その他の要件やメモ..."
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
                    <Label>ファイル添付 (任意)</Label>
                    <p className="mb-4 text-sm text-gray-600">
                      関連するドキュメント、デザイン、仕様書をアップロードしてください
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
                    <h3 className="font-medium text-gray-900">プロジェクト情報</h3>
                    <dl className="mt-2 space-y-2 text-sm">
                      <div>
                        <dt className="text-gray-600">プロジェクト名:</dt>
                        <dd className="font-medium">{formData.title}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">タイプ:</dt>
                        <dd className="font-medium">
                          {formData.projectType &&
                            projectTypeLabels[formData.projectType]}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">概要:</dt>
                        <dd>{formData.description}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="font-medium text-gray-900">
                      予算とスケジュール
                    </h3>
                    <dl className="mt-2 space-y-2 text-sm">
                      <div>
                        <dt className="text-gray-600">予算:</dt>
                        <dd className="font-medium">
                          {formData.budgetMin && formData.budgetMax
                            ? `¥${formData.budgetMin.toLocaleString()} - ¥${formData.budgetMax.toLocaleString()}`
                            : '未指定'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">期間:</dt>
                        <dd className="font-medium">
                          {formData.preferredStart && formData.deadline
                            ? `${formData.preferredStart} から ${formData.deadline}`
                            : '未指定'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {formData.attachments && formData.attachments.length > 0 && (
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h3 className="font-medium text-gray-900">添付ファイル</h3>
                      <p className="mt-2 text-sm">
                        {formData.attachments.length}個のファイル添付済み
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
                  戻る
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={saveDraft}
                    disabled={isSubmitting}
                  >
                    下書き保存
                  </Button>

                  {currentStep < STEPS.length ? (
                    <Button type="button" onClick={nextStep}>
                      次へ
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? '送信中...' : 'リクエストを送信'}
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
