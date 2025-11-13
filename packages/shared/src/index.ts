/**
 * 공유 유틸리티 및 상수
 * 웹/모바일 앱에서 공통으로 사용
 */

// ==================== 상수 ====================

/**
 * 난이도 레벨
 */
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  ELEMENTARY: 'elementary',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const;

/**
 * 난이도 레벨 라벨 (한국어)
 */
export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: '입문',
  elementary: '초급',
  intermediate: '중급',
  advanced: '고급',
  expert: '전문가',
};

/**
 * 사용자 역할
 */
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
} as const;

/**
 * 퀴즈 타입
 */
export const QUIZ_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  FILL_BLANK: 'fill_blank',
  ESSAY: 'essay',
} as const;

/**
 * 퀴즈 타입 라벨
 */
export const QUIZ_TYPE_LABELS: Record<string, string> = {
  multiple_choice: '객관식',
  true_false: 'O/X',
  fill_blank: '빈칸 채우기',
  essay: '주관식',
};

/**
 * 구독 상태
 */
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  PENDING: 'pending',
} as const;

/**
 * 구독 주기
 */
export const BILLING_CYCLES = {
  TRIAL: 'trial',
  MONTHLY: 'monthly',
  ANNUAL: 'annual',
} as const;

/**
 * 구독 주기 라벨
 */
export const BILLING_CYCLE_LABELS: Record<string, string> = {
  trial: '무료 체험',
  monthly: '월간',
  annual: '연간',
};

// ==================== 유틸리티 함수 ====================

/**
 * 시간(초)을 읽기 쉬운 형식으로 변환
 * @param seconds 초
 * @returns 포맷된 문자열 (예: "1시간 30분")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}초`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${remainingMinutes}분`;
}

/**
 * 날짜를 상대적 시간으로 변환
 * @param date 날짜 문자열 또는 Date 객체
 * @returns 상대적 시간 (예: "3일 전")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return '방금 전';
  } else if (diffMins < 60) {
    return `${diffMins}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 30) {
    return `${diffDays}일 전`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months}개월 전`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years}년 전`;
  }
}

/**
 * 날짜를 한국어 형식으로 포맷
 * @param date 날짜 문자열 또는 Date 객체
 * @returns 포맷된 날짜 (예: "2024년 1월 15일")
 */
export function formatDate(date: string | Date, includeTime: boolean = false): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  if (!includeTime) {
    return `${year}년 ${month}월 ${day}일`;
  }

  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
}

/**
 * 진도율을 백분율로 변환
 * @param current 현재 값
 * @param total 전체 값
 * @returns 백분율 (0-100)
 */
export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

/**
 * 가격을 한국 원화 형식으로 포맷
 * @param price 가격
 * @returns 포맷된 가격 (예: "11,900원")
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

/**
 * 이메일 유효성 검사
 * @param email 이메일 주소
 * @returns 유효 여부
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 비밀번호 강도 검사
 * @param password 비밀번호
 * @returns 강도 (weak, medium, strong)
 */
export function checkPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (password.length < 6) {
    return 'weak';
  }

  let strength = 0;

  // 길이
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // 소문자 포함
  if (/[a-z]/.test(password)) strength++;

  // 대문자 포함
  if (/[A-Z]/.test(password)) strength++;

  // 숫자 포함
  if (/[0-9]/.test(password)) strength++;

  // 특수문자 포함
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
}

/**
 * 텍스트를 제한된 길이로 자르기 (말줄임표 추가)
 * @param text 텍스트
 * @param maxLength 최대 길이
 * @returns 잘린 텍스트
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}

/**
 * 배열을 청크로 나누기
 * @param array 배열
 * @param chunkSize 청크 크기
 * @returns 청크 배열
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * 디바운스 함수
 * @param func 실행할 함수
 * @param wait 대기 시간 (ms)
 * @returns 디바운스된 함수
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * 로컬 스토리지 헬퍼 (웹용)
 */
export const storage = {
  /**
   * 값 저장
   */
  set(key: string, value: any): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  /**
   * 값 가져오기
   */
  get<T = any>(key: string): T | null {
    try {
      if (typeof window !== 'undefined') {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
    }
    return null;
  },

  /**
   * 값 삭제
   */
  remove(key: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },

  /**
   * 모든 값 삭제
   */
  clear(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },
};

/**
 * 에러 메시지 추출
 * @param error 에러 객체
 * @returns 에러 메시지
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * 학습 시간을 시:분 형식으로 변환
 * @param minutes 분
 * @returns 시:분 형식 문자열
 */
export function formatLearningTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}분`;
  }

  return `${hours}시간 ${mins}분`;
}
