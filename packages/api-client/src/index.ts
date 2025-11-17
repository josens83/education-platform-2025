/**
 * Education Platform API Client
 * 웹/모바일 앱에서 공유하는 API 클라이언트
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as Types from './types';

export * from './types';

interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
}

export class EducationApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터: 토큰 자동 추가
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터: 에러 처리
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // 토큰 만료 등 인증 에러
          this.token = null;
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * 토큰 설정
   */
  setToken(token: string | null) {
    this.token = token;
  }

  /**
   * 토큰 가져오기
   */
  getToken(): string | null {
    return this.token;
  }

  // ==================== 인증 API ====================

  /**
   * 회원가입
   */
  async register(data: Types.RegisterRequest): Promise<Types.AuthResponse> {
    const response = await this.client.post<Types.ApiResponse<Types.AuthResponse>>(
      '/api/auth/register',
      data
    );
    const authData = response.data.data!;
    this.setToken(authData.token);
    return authData;
  }

  /**
   * 로그인
   */
  async login(data: Types.LoginRequest): Promise<Types.AuthResponse> {
    const response = await this.client.post<Types.ApiResponse<Types.AuthResponse>>(
      '/api/auth/login',
      data
    );
    const authData = response.data.data!;
    this.setToken(authData.token);
    return authData;
  }

  /**
   * 로그아웃
   */
  logout() {
    this.setToken(null);
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(): Promise<string> {
    const response = await this.client.post<Types.ApiResponse<{ token: string }>>(
      '/api/auth/refresh'
    );
    const token = response.data.data!.token;
    this.setToken(token);
    return token;
  }

  // ==================== 사용자 API ====================

  /**
   * 내 프로필 조회
   */
  async getMyProfile(): Promise<Types.User> {
    const response = await this.client.get<Types.ApiResponse<Types.User>>('/api/users/me');
    return response.data.data!;
  }

  /**
   * 프로필 업데이트
   */
  async updateProfile(data: Partial<Types.UserProfile>): Promise<Types.UserProfile> {
    const response = await this.client.put<Types.ApiResponse<Types.UserProfile>>(
      '/api/users/me',
      data
    );
    return response.data.data!;
  }

  // ==================== 카테고리 API ====================

  /**
   * 모든 카테고리 조회
   */
  async getCategories(): Promise<Types.Category[]> {
    const response = await this.client.get<Types.ApiResponse<Types.Category[]>>(
      '/api/categories'
    );
    return response.data.data || [];
  }

  // ==================== 책 API ====================

  /**
   * 책 목록 조회
   */
  async getBooks(params?: {
    category_id?: number;
    difficulty_level?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Types.Book[]> {
    const response = await this.client.get<Types.ApiResponse<Types.Book[]>>('/api/books', {
      params,
    });
    return response.data.data || [];
  }

  /**
   * 책 상세 조회
   */
  async getBook(id: number): Promise<Types.Book> {
    const response = await this.client.get<Types.ApiResponse<Types.Book>>(`/api/books/${id}`);
    return response.data.data!;
  }

  /**
   * 책의 챕터 목록 조회
   */
  async getBookChapters(bookId: number): Promise<Types.Chapter[]> {
    const response = await this.client.get<Types.ApiResponse<Types.Chapter[]>>(
      `/api/books/${bookId}/chapters`
    );
    return response.data.data || [];
  }

  // ==================== 챕터 API ====================

  /**
   * 챕터 상세 조회
   */
  async getChapter(id: number): Promise<{ chapter: Types.Chapter; audio: any | null }> {
    const response = await this.client.get<Types.ApiResponse<{ chapter: Types.Chapter; audio: any | null }>>(
      `/api/chapters/${id}`
    );
    return response.data.data!;
  }

  // ==================== 학습 진도 API ====================

  /**
   * 학습 진도 저장/업데이트
   */
  async updateProgress(data: Types.UpdateProgressRequest): Promise<Types.LearningProgress> {
    const response = await this.client.post<Types.ApiResponse<Types.LearningProgress>>(
      '/api/progress',
      data
    );
    return response.data.data!;
  }

  /**
   * 내 학습 진도 조회
   */
  async getMyProgress(bookId?: number): Promise<Types.LearningProgress[]> {
    const response = await this.client.get<Types.ApiResponse<Types.LearningProgress[]>>(
      '/api/progress/my',
      {
        params: bookId ? { book_id: bookId } : undefined,
      }
    );
    return response.data.data || [];
  }

  /**
   * 특정 챕터의 진도 조회
   */
  async getChapterProgress(chapterId: number): Promise<Types.LearningProgress | null> {
    const response = await this.client.get<Types.ApiResponse<Types.LearningProgress>>(
      `/api/progress/chapter/${chapterId}`
    );
    return response.data.data || null;
  }

  // ==================== 퀴즈 API ====================

  /**
   * 챕터의 퀴즈 조회
   */
  async getChapterQuizzes(chapterId: number): Promise<Types.Quiz[]> {
    const response = await this.client.get<Types.ApiResponse<Types.Quiz[]>>(
      `/api/chapters/${chapterId}/quizzes`
    );
    return response.data.data || [];
  }

  /**
   * 퀴즈 상세 조회 (문제 포함)
   */
  async getQuiz(id: number): Promise<{
    quiz: Types.Quiz;
    questions: Types.QuizQuestion[];
  }> {
    const response = await this.client.get<
      Types.ApiResponse<{ quiz: Types.Quiz; questions: Types.QuizQuestion[] }>
    >(`/api/quizzes/${id}`);
    return response.data.data!;
  }

  /**
   * 퀴즈 제출 및 채점
   */
  async submitQuiz(id: number, data: Types.SubmitQuizRequest): Promise<Types.QuizResult> {
    const response = await this.client.post<Types.ApiResponse<Types.QuizResult>>(
      `/api/quizzes/${id}/submit`,
      data
    );
    return response.data.data!;
  }

  /**
   * 내 퀴즈 시도 내역
   */
  async getMyQuizAttempts(quizId?: number): Promise<Types.QuizAttempt[]> {
    const response = await this.client.get<Types.ApiResponse<Types.QuizAttempt[]>>(
      '/api/quizzes/attempts',
      {
        params: quizId ? { quiz_id: quizId } : undefined,
      }
    );
    return response.data.data || [];
  }

  // ==================== 구독 API ====================

  /**
   * 구독 플랜 목록 조회
   */
  async getSubscriptionPlans(): Promise<Types.SubscriptionPlan[]> {
    const response = await this.client.get<Types.ApiResponse<Types.SubscriptionPlan[]>>(
      '/api/subscriptions/plans'
    );
    return response.data.data || [];
  }

  /**
   * 내 구독 정보 조회
   */
  async getMySubscription(): Promise<Types.Subscription | null> {
    const response = await this.client.get<Types.ApiResponse<Types.Subscription>>(
      '/api/subscriptions/me'
    );
    return response.data.data || null;
  }

  /**
   * 구독 생성
   */
  async createSubscription(planId: number): Promise<Types.Subscription> {
    const response = await this.client.post<Types.ApiResponse<Types.Subscription>>(
      '/api/subscriptions',
      { plan_id: planId }
    );
    return response.data.data!;
  }

  /**
   * 구독 취소
   */
  async cancelSubscription(): Promise<void> {
    await this.client.delete('/api/subscriptions/me');
  }

  // ==================== 북마크 API ====================

  /**
   * 북마크 생성
   */
  async createBookmark(data: {
    chapter_id: number;
    position: string;
    note?: string;
  }): Promise<Types.Bookmark> {
    const response = await this.client.post<Types.ApiResponse<Types.Bookmark>>(
      '/api/bookmarks',
      data
    );
    return response.data.data!;
  }

  /**
   * 내 북마크 조회
   */
  async getMyBookmarks(chapterId?: number): Promise<Types.Bookmark[]> {
    const response = await this.client.get<Types.ApiResponse<Types.Bookmark[]>>('/api/bookmarks', {
      params: chapterId ? { chapter_id: chapterId } : undefined,
    });
    return response.data.data || [];
  }

  /**
   * 북마크 삭제
   */
  async deleteBookmark(id: number): Promise<void> {
    await this.client.delete(`/api/bookmarks/${id}`);
  }

  // ==================== 노트 API ====================

  /**
   * 노트 생성
   */
  async createNote(data: {
    chapter_id: number;
    position_start: string;
    position_end?: string;
    highlighted_text?: string;
    note_text?: string;
    color?: string;
  }): Promise<Types.Note> {
    const response = await this.client.post<Types.ApiResponse<Types.Note>>('/api/notes', data);
    return response.data.data!;
  }

  /**
   * 내 노트 조회
   */
  async getMyNotes(chapterId?: number): Promise<Types.Note[]> {
    const response = await this.client.get<Types.ApiResponse<Types.Note[]>>('/api/notes', {
      params: chapterId ? { chapter_id: chapterId } : undefined,
    });
    return response.data.data || [];
  }

  /**
   * 노트 업데이트
   */
  async updateNote(id: number, data: Partial<Types.Note>): Promise<Types.Note> {
    const response = await this.client.put<Types.ApiResponse<Types.Note>>(
      `/api/notes/${id}`,
      data
    );
    return response.data.data!;
  }

  /**
   * 노트 삭제
   */
  async deleteNote(id: number): Promise<void> {
    await this.client.delete(`/api/notes/${id}`);
  }

  // ==================== 단어장 API ====================

  /**
   * 단어 추가
   */
  async addVocabulary(data: {
    word: string;
    definition?: string;
    example_sentence?: string;
    chapter_id?: number;
  }): Promise<Types.VocabularyItem> {
    const response = await this.client.post<Types.ApiResponse<Types.VocabularyItem>>(
      '/api/vocabulary',
      data
    );
    return response.data.data!;
  }

  /**
   * 내 단어장 조회
   */
  async getMyVocabulary(params?: {
    is_mastered?: boolean;
    search?: string;
  }): Promise<Types.VocabularyItem[]> {
    const response = await this.client.get<Types.ApiResponse<Types.VocabularyItem[]>>(
      '/api/vocabulary',
      { params }
    );
    return response.data.data || [];
  }

  /**
   * 단어 마스터 상태 업데이트
   */
  async updateVocabularyMastery(id: number, isMastered: boolean): Promise<Types.VocabularyItem> {
    const response = await this.client.patch<Types.ApiResponse<Types.VocabularyItem>>(
      `/api/vocabulary/${id}`,
      { is_mastered: isMastered }
    );
    return response.data.data!;
  }

  /**
   * 단어 삭제
   */
  async deleteVocabulary(id: number): Promise<void> {
    await this.client.delete(`/api/vocabulary/${id}`);
  }

  // ==================== 학습 통계 API ====================

  /**
   * 내 학습 통계 조회
   */
  async getMyLearningStats(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<Types.LearningStats[]> {
    const response = await this.client.get<Types.ApiResponse<Types.LearningStats[]>>(
      '/api/stats',
      { params }
    );
    return response.data.data || [];
  }

  // ==================== 오디오 API ====================

  /**
   * 챕터의 오디오 파일 조회
   */
  async getChapterAudio(chapterId: number): Promise<Types.AudioFile | null> {
    const response = await this.client.get<Types.ApiResponse<Types.AudioFile>>(
      `/api/audio/chapters/${chapterId}/audio`
    );
    return response.data.data || null;
  }

  /**
   * 오디오 재생 위치 저장
   */
  async saveAudioProgress(chapterId: number, position: number): Promise<void> {
    await this.client.post('/api/audio/progress', {
      chapter_id: chapterId,
      audio_position_seconds: position,
    });
  }
}

/**
 * 기본 API 클라이언트 생성 함수
 */
export function createApiClient(config: ApiClientConfig): EducationApiClient {
  return new EducationApiClient(config);
}
