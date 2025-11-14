import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { UserProfile } from '@education-platform/api-client';

/**
 * 프로필 페이지
 * - 사용자 정보 조회 및 수정
 * - 학습 목표 설정
 */
export default function ProfilePage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    full_name: '',
    date_of_birth: '',
    phone_number: '',
    bio: '',
    preferred_difficulty: 'intermediate',
    learning_goals: {
      target_grade: '',
      target_test: '',
      daily_goal_minutes: 30,
    },
  });

  // 프로필 조회
  const { data: profile, isLoading } = useQuery('myProfile', () => api.getMyProfile(), {
    onSuccess: (data: any) => {
      // 프로필이 있으면 폼 데이터 초기화
      if (data) {
        setFormData({
          full_name: data.full_name || '',
          date_of_birth: data.date_of_birth || '',
          phone_number: data.phone_number || '',
          bio: data.bio || '',
          preferred_difficulty: data.preferred_difficulty || 'intermediate',
          learning_goals: data.learning_goals || {
            target_grade: '',
            target_test: '',
            daily_goal_minutes: 30,
          },
        });
      }
    },
  });

  // 프로필 업데이트 mutation
  const updateProfileMutation = useMutation(
    (data: Partial<UserProfile>) => api.updateProfile(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('myProfile');
        toast.success('프로필이 업데이트되었습니다!');
        setIsEditing(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '프로필 업데이트에 실패했습니다.');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    // 원래 데이터로 복원
    if (profile) {
      setFormData({
        full_name: (profile as any).full_name || '',
        date_of_birth: (profile as any).date_of_birth || '',
        phone_number: (profile as any).phone_number || '',
        bio: (profile as any).bio || '',
        preferred_difficulty: (profile as any).preferred_difficulty || 'intermediate',
        learning_goals: (profile as any).learning_goals || {
          target_grade: '',
          target_test: '',
          daily_goal_minutes: 30,
        },
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">프로필을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">내 프로필</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              프로필 수정
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* 사용자 기본 정보 */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold mb-6">계정 정보</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">사용자명</label>
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* 프로필 정보 */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold mb-6">프로필 정보</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                <input
                  type="text"
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="홍길동"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">생년월일</label>
                  <input
                    type="date"
                    value={formData.date_of_birth || ''}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                  <input
                    type="tel"
                    value={formData.phone_number || ''}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">자기소개</label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="간단한 자기소개를 작성해주세요..."
                />
              </div>
            </div>
          </div>

          {/* 학습 목표 */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold mb-6">학습 목표</h2>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">목표 학년</label>
                  <select
                    value={formData.learning_goals?.target_grade || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        learning_goals: { ...formData.learning_goals, target_grade: e.target.value },
                      })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="elementary">초등학생</option>
                    <option value="middle">중학생</option>
                    <option value="high">고등학생</option>
                    <option value="adult">성인</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">목표 시험</label>
                  <select
                    value={formData.learning_goals?.target_test || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        learning_goals: { ...formData.learning_goals, target_test: e.target.value },
                      })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="toeic">TOEIC</option>
                    <option value="toefl">TOEFL</option>
                    <option value="teps">TEPS</option>
                    <option value="ielts">IELTS</option>
                    <option value="none">없음</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  선호 난이도
                </label>
                <select
                  value={formData.preferred_difficulty || 'intermediate'}
                  onChange={(e) => setFormData({ ...formData, preferred_difficulty: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="beginner">초급</option>
                  <option value="intermediate">중급</option>
                  <option value="advanced">고급</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  하루 학습 목표 (분)
                </label>
                <input
                  type="number"
                  min="10"
                  max="180"
                  step="10"
                  value={formData.learning_goals?.daily_goal_minutes || 30}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      learning_goals: {
                        ...formData.learning_goals,
                        daily_goal_minutes: parseInt(e.target.value),
                      },
                    })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  하루에 {formData.learning_goals?.daily_goal_minutes || 30}분씩 학습합니다
                </p>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          {isEditing && (
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={updateProfileMutation.isLoading}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50"
              >
                {updateProfileMutation.isLoading ? '저장 중...' : '저장하기'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={updateProfileMutation.isLoading}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold disabled:opacity-50"
              >
                취소
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
