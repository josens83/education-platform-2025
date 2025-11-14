/**
 * 공유 타입 정의
 * 웹/모바일 앱에서 공통으로 사용
 */

// API 응답 기본 구조
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: any[];
}

// 사용자 관련
export interface User {
  id: number;
  email: string;
  username: string;
  role: 'student' | 'teacher' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  full_name?: string;
  date_of_birth?: string;
  phone_number?: string;
  avatar_url?: string;
  bio?: string;
  learning_goals?: any;
  preferred_difficulty?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// 책 관련
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  created_at: string;
}

export interface Book {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  subtitle?: string;
  author: string;
  description?: string;
  cover_image_url?: string;
  difficulty_level: string;
  target_grade?: string;
  estimated_hours?: number;
  tags?: string[];
  is_published: boolean;
  is_featured?: boolean;
  publish_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: number;
  book_id: number;
  chapter_number: number;
  title: string;
  slug?: string;
  content?: string;
  content_text?: string;
  content_html?: string;
  content_type?: string;
  word_count?: number;
  estimated_minutes?: number;
  display_order?: number;
  is_published?: boolean;
  book_title?: string; // JOIN으로 가져오는 필드
  created_at: string;
  updated_at: string;
}

// 학습 진도
export interface LearningProgress {
  id: number;
  user_id: number;
  book_id: number;
  chapter_id: number;
  progress_percentage: number;
  last_position?: string;
  time_spent_seconds: number;
  is_completed: boolean;
  completed_at?: string;
  last_accessed_at: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProgressRequest {
  chapter_id: number;
  progress_percentage: number;
  last_position?: string;
  time_spent_seconds?: number;
}

// 퀴즈
export interface Quiz {
  id: number;
  chapter_id: number;
  title: string;
  description?: string;
  quiz_type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay';
  difficulty_level: string;
  passing_score: number;
  time_limit_minutes?: number;
  created_at: string;
}

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_number: number;
  question_text: string;
  question_type: string;
  options?: any;
  correct_answer: string;
  explanation?: string;
  points: number;
}

export interface QuizAttempt {
  id: number;
  user_id: number;
  quiz_id: number;
  score: number;
  total_points: number;
  percentage: number;
  time_taken_seconds?: number;
  is_passed: boolean;
  started_at: string;
  completed_at?: string;
}

export interface SubmitQuizRequest {
  answers: Array<{
    question_id: number;
    user_answer: string;
  }>;
  time_taken_seconds?: number;
}

export interface QuizResult {
  attempt_id: number;
  score: number;
  total_points: number;
  percentage: number;
  is_passed: boolean;
  answers: Array<{
    question_id: number;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    points_earned: number;
    explanation?: string;
  }>;
}

// 구독
export interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string;
  price: number;
  billing_cycle: 'trial' | 'monthly' | 'annual';
  trial_days?: number;
  features?: any;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  start_date: string;
  end_date?: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

// 북마크, 노트, 단어장
export interface Bookmark {
  id: number;
  user_id: number;
  chapter_id: number;
  position: string;
  note?: string;
  created_at: string;
}

export interface Note {
  id: number;
  user_id: number;
  chapter_id: number;
  position_start: string;
  position_end?: string;
  highlighted_text?: string;
  note_text?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface VocabularyItem {
  id: number;
  user_id: number;
  word: string;
  definition?: string;
  example_sentence?: string;
  chapter_id?: number;
  is_mastered: boolean;
  created_at: string;
  updated_at: string;
}

// 통계
export interface LearningStats {
  id: number;
  user_id: number;
  stat_date: string;
  books_started: number;
  books_completed: number;
  chapters_read: number;
  quizzes_taken: number;
  quizzes_passed: number;
  total_time_minutes: number;
  words_learned: number;
}
