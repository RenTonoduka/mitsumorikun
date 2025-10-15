"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface OnboardingStep {
  id: string
  title: string
  description: string
  targetSelector?: string
  position?: "top" | "bottom" | "left" | "right"
}

interface OnboardingContextType {
  isActive: boolean
  currentStep: number
  steps: OnboardingStep[]
  startOnboarding: () => void
  nextStep: () => void
  previousStep: () => void
  skipOnboarding: () => void
  completeOnboarding: () => void
  isCompleted: boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "みつもりくんへようこそ！",
    description: "AI・システム開発の見積もり比較プラットフォームです。簡単なツアーで主要機能をご紹介します。",
  },
  {
    id: "company-registration",
    title: "企業登録",
    description: "開発会社の方は、こちらから企業情報を登録できます。プロジェクト依頼を受け取りましょう。",
    targetSelector: "#company-register-link",
    position: "bottom",
  },
  {
    id: "request-creation",
    title: "見積依頼作成",
    description: "プロジェクトの見積もりが必要な方は、こちらから依頼を作成できます。",
    targetSelector: "#create-request-link",
    position: "bottom",
  },
  {
    id: "matching-system",
    title: "自動マッチング",
    description: "AIが最適な開発会社を自動的にマッチングします。技術スタックや予算に基づいて提案を受け取れます。",
  },
  {
    id: "reviews",
    title: "レビューシステム",
    description: "プロジェクト完了後、企業を評価してコミュニティに貢献できます。",
  },
]

const STORAGE_KEY = "mitsumorikun-onboarding-completed"

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    // Check if onboarding was already completed
    const completed = localStorage.getItem(STORAGE_KEY)
    if (completed === "true") {
      setIsCompleted(true)
    } else {
      // Auto-start onboarding for new users after a short delay
      const timer = setTimeout(() => {
        setIsActive(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const startOnboarding = () => {
    setIsActive(true)
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      completeOnboarding()
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const skipOnboarding = () => {
    setIsActive(false)
    localStorage.setItem(STORAGE_KEY, "true")
    setIsCompleted(true)
  }

  const completeOnboarding = () => {
    setIsActive(false)
    localStorage.setItem(STORAGE_KEY, "true")
    setIsCompleted(true)
  }

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        currentStep,
        steps: ONBOARDING_STEPS,
        startOnboarding,
        nextStep,
        previousStep,
        skipOnboarding,
        completeOnboarding,
        isCompleted,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }
  return context
}
