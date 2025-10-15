"use client"

import React, { useEffect, useState } from "react"
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { useOnboarding } from "@/contexts/OnboardingContext"
import { cn } from "@/lib/utils/cn"

export function OnboardingModal() {
  const {
    isActive,
    currentStep,
    steps,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
  } = useOnboarding()

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [spotlightPosition, setSpotlightPosition] = useState<{
    top: number
    left: number
    width: number
    height: number
  } | null>(null)

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  useEffect(() => {
    if (!isActive || !currentStepData?.targetSelector) {
      setTargetElement(null)
      setSpotlightPosition(null)
      return
    }

    const element = document.querySelector(currentStepData.targetSelector) as HTMLElement
    if (element) {
      setTargetElement(element)
      const rect = element.getBoundingClientRect()
      setSpotlightPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      })

      // Scroll to element
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [isActive, currentStep, currentStepData])

  if (!isActive) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={skipOnboarding} />

      {/* Spotlight effect */}
      {spotlightPosition && (
        <div
          className="fixed z-[51] rounded-lg ring-4 ring-blue-500 ring-offset-4 ring-offset-transparent transition-all duration-300"
          style={{
            top: spotlightPosition.top - 8,
            left: spotlightPosition.left - 8,
            width: spotlightPosition.width + 16,
            height: spotlightPosition.height + 16,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Modal */}
      <div
        className={cn(
          "fixed z-[52] w-full max-w-md rounded-lg bg-white p-6 shadow-2xl transition-all duration-300",
          !currentStepData?.targetSelector && "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          currentStepData?.targetSelector &&
            spotlightPosition &&
            "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:left-auto md:top-auto md:translate-x-0 md:translate-y-0",
        )}
        style={
          currentStepData?.targetSelector && spotlightPosition
            ? {
                top:
                  currentStepData.position === "bottom"
                    ? spotlightPosition.top + spotlightPosition.height + 24
                    : currentStepData.position === "top"
                    ? spotlightPosition.top - 200
                    : spotlightPosition.top,
                left:
                  currentStepData.position === "right"
                    ? spotlightPosition.left + spotlightPosition.width + 24
                    : currentStepData.position === "left"
                    ? spotlightPosition.left - 400
                    : spotlightPosition.left,
              }
            : {}
        }
      >
        {/* Close button */}
        <button
          onClick={skipOnboarding}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            ステップ {currentStep + 1} / {steps.length}
          </p>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">{currentStepData.title}</h2>
          <p className="text-gray-600">{currentStepData.description}</p>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={skipOnboarding}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            スキップ
          </button>

          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                onClick={previousStep}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                戻る
              </button>
            )}

            <button
              onClick={isLastStep ? completeOnboarding : nextStep}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-purple-700"
            >
              {isLastStep ? (
                <>
                  完了
                  <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  次へ
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
