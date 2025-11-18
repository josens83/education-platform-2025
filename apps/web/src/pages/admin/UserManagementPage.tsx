import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  full_name: string;
  created_at: string;
  last_login: string;
  chapters_completed: number;
  quizzes_passed: number;
}

/**
 * 사용자 관리 페이지
 * - 전체 사용자 목록
 * - 검색/필터
 * - 역할 변경
 * - 사용자 상세 정보
 */
export default function UserManagementPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const queryClient = useQueryClient();

  // 사용자 목록 조회
  const { data, isLoading } = useQuery(
    ['users', page, search, roleFilter],
    async () => {
      return await api.getAllUsers({
        page,
        limit: 20,
        search,
        role: roleFilter,
        sort: 'created_at',
        order: 'desc'
      });
    }
  );

  const users = data?.users || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 20, total_pages: 0 };

  // 검색 실행
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  // 필터 변경
  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    setPage(1);
  };

  // 사용자 상세 정보 보기
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  // 역할 변경
  const updateRoleMutation = useMutation(
    ({ userId, role }: { userId: number; role: string }) =>
      api.updateUserRole(userId, role),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast.success('사용자 역할이 변경되었습니다');
      },
      onError: () => {
        toast.error('역할 변경에 실패했습니다');
      },
    }
  );

  const handleRoleChange = (user: User, newRole: string) => {
    if (user.role === newRole) return;

    if (confirm(`${user.username}의 역할을 ${newRole}(으)로 변경하시겠습니까?`)) {
      updateRoleMutation.mutate({ userId: user.id, role: newRole });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return '관리자';
      case 'teacher':
        return '선생님';
      default:
        return '학생';
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
        <p className="text-gray-600 mt-2">전체 사용자를 관리하고 역할을 변경합니다</p>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="이름, 이메일, 사용자명으로 검색..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                검색
              </button>
            </div>
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => handleRoleFilterChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">모든 역할</option>
              <option value="student">학생</option>
              <option value="teacher">선생님</option>
              <option value="admin">관리자</option>
            </select>
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">전체 사용자</div>
          <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">현재 페이지</div>
          <div className="text-2xl font-bold text-gray-900">
            {pagination.page} / {pagination.total_pages}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">페이지당</div>
          <div className="text-2xl font-bold text-gray-900">{users.length}명</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">필터</div>
          <div className="text-sm font-medium text-gray-900">
            {roleFilter ? getRoleLabel(roleFilter) : '전체'}
          </div>
        </div>
      </div>

      {/* 사용자 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </div>
        ) : users.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사용자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      역할
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      활동
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user: User) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.full_name || user.username}
                          </div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            user.role
                          )} cursor-pointer`}
                          disabled={updateRoleMutation.isLoading}
                        >
                          <option value="student">학생</option>
                          <option value="teacher">선생님</option>
                          <option value="admin">관리자</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-3">
                          <span>📚 {user.chapters_completed}</span>
                          <span>✅ {user.quizzes_passed}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="text-primary-600 hover:text-primary-800 font-medium"
                        >
                          상세보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-600">
                전체 {pagination.total}명 중 {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}명 표시
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  이전
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.total_pages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= pagination.total_pages - 2) {
                      pageNum = pagination.total_pages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          page === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                  disabled={page === pagination.total_pages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  다음
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-gray-600">사용자가 없습니다</p>
          </div>
        )}
      </div>

      {/* 사용자 상세 정보 모달 */}
      {showDetailsModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

/**
 * 사용자 상세 정보 모달
 */
function UserDetailsModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { data, isLoading } = useQuery(
    ['user-details', user.id],
    async () => {
      return await api.getUserDetails(user.id);
    }
  );

  const userDetails = data?.user || user;
  const stats = data?.stats || {};
  const recentActivity = data?.recent_activity || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">사용자 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* 기본 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">이름</div>
                  <div className="font-medium text-gray-900">
                    {userDetails.full_name || userDetails.username}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">사용자명</div>
                  <div className="font-medium text-gray-900">@{userDetails.username}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">이메일</div>
                  <div className="font-medium text-gray-900">{userDetails.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">역할</div>
                  <div className="font-medium text-gray-900">
                    {userDetails.role === 'admin'
                      ? '관리자'
                      : userDetails.role === 'teacher'
                      ? '선생님'
                      : '학생'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">가입일</div>
                  <div className="font-medium text-gray-900">
                    {new Date(userDetails.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">마지막 로그인</div>
                  <div className="font-medium text-gray-900">
                    {userDetails.last_login
                      ? new Date(userDetails.last_login).toLocaleDateString('ko-KR')
                      : '없음'}
                  </div>
                </div>
              </div>
            </div>

            {/* 학습 통계 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">학습 통계</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">시작한 책</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.books_started || 0}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">읽은 챕터</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.chapters_completed || 0}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">퀴즈 합격</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.quizzes_passed || 0}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">저장한 단어</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.words_saved || 0}
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">총 학습 시간</div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.floor((stats.total_time_seconds || 0) / 3600)}시간{' '}
                  {Math.floor(((stats.total_time_seconds || 0) % 3600) / 60)}분
                </div>
              </div>
            </div>

            {/* 최근 활동 */}
            {recentActivity.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
                <div className="space-y-3">
                  {recentActivity.map((activity: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 bg-gray-50 rounded-lg p-3"
                    >
                      <div className="text-2xl">📖</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{activity.book_title}</div>
                        <div className="text-sm text-gray-600">{activity.chapter_title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(activity.activity_date).toLocaleString('ko-KR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
