import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';

/**
 * Onboarding Tour Component
 *
 * n8n/Linear 스타일의 제품 온보딩 투어
 */

interface OnboardingStep {
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface OnboardingTourProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTour({
  steps,
  onComplete,
  onSkip,
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null);

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    if (step.target) {
      const element = document.querySelector(step.target) as HTMLElement;
      setHighlightElement(element);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setHighlightElement(null);
    }
  }, [currentStep, step.target]);

  const handleNext = () => {
    if (step.action) {
      step.action();
    }

    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999]">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onSkip}
        />

        {/* Highlight Spotlight */}
        {highlightElement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute border-4 border-primary-500 rounded-lg pointer-events-none shadow-2xl"
            style={{
              top: highlightElement.offsetTop - 8,
              left: highlightElement.offsetLeft - 8,
              width: highlightElement.offsetWidth + 16,
              height: highlightElement.offsetHeight + 16,
            }}
          />
        )}

        {/* Tour Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg mx-4"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all ${
                        index === currentStep
                          ? 'w-8 bg-white'
                          : index < currentStep
                          ? 'w-2 bg-white/70'
                          : 'w-2 bg-white/30'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={onSkip}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-2xl font-bold">{step.title}</h2>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-text-secondary text-lg leading-relaxed">
                {step.description}
              </p>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={handlePrev}
                  disabled={isFirstStep}
                  className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span>이전</span>
                </button>

                <div className="text-sm text-text-tertiary">
                  {currentStep + 1} / {steps.length}
                </div>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
                >
                  <span>{isLastStep ? '완료' : '다음'}</span>
                  {isLastStep ? (
                    <FiCheck className="w-4 h-4" />
                  ) : (
                    <FiArrowRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/**
 * Onboarding Hook
 *
 * 온보딩 상태 관리
 */
export function useOnboarding(storageKey: string = 'onboarding_completed') {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(storageKey);
    if (!completed) {
      setShowOnboarding(true);
    }
  }, [storageKey]);

  const completeOnboarding = () => {
    localStorage.setItem(storageKey, 'true');
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem(storageKey, 'skipped');
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(storageKey);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
}

/**
 * Default Onboarding Steps for Education Platform
 */
export const defaultOnboardingSteps: OnboardingStep[] = [
  {
    title: '환영합니다! 👋',
    description:
      '영어 학습 플랫폼에 오신 것을 환영합니다. 플랫폼 사용법을 간단히 안내해드리겠습니다.',
  },
  {
    title: '📚 책 둘러보기',
    description:
      '다양한 영어 원서를 탐색하고 레벨에 맞는 책을 선택하세요. 각 책에는 오디오북과 퀴즈가 포함되어 있습니다.',
    target: '[data-tour="books"]',
  },
  {
    title: '📊 학습 진도 추적',
    description:
      '대시보드에서 학습 진도, 완료한 챕터, 퀴즈 점수를 실시간으로 확인할 수 있습니다.',
    target: '[data-tour="dashboard"]',
  },
  {
    title: '📝 단어장 만들기',
    description:
      '모르는 단어를 북마크하고 나만의 단어장을 만들어보세요. AI가 복습 시기를 추천해드립니다.',
    target: '[data-tour="vocabulary"]',
  },
  {
    title: '🤖 AI 학습 어시스턴트',
    description:
      'GPT-4 기반 AI 어시스턴트가 문법, 단어, 독해를 도와드립니다. 우측 하단의 챗봇을 클릭해보세요!',
    target: '[data-tour="ai-chat"]',
  },
  {
    title: '준비 완료! 🎉',
    description:
      '이제 학습을 시작할 준비가 되었습니다. 첫 번째 책을 선택하고 영어 학습 여정을 시작하세요!',
  },
];
