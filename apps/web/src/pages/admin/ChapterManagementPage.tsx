import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

interface Book {
  id: number;
  title: string;
  author: string;
}

interface Chapter {
  id: number;
  book_id: number;
  chapter_number: number;
  title: string;
  slug: string;
  content: string;
  content_type: string;
  estimated_minutes: number;
  is_published: boolean;
  display_order: number;
}

/**
 * 챕터 관리 페이지
 * - 책 선택 후 챕터 목록 조회
 * - 챕터 추가/수정/삭제
 */
export default function ChapterManagementPage() {
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const queryClient = useQueryClient();

  // 책 목록 조회
  const { data: books } = useQuery('admin-all-books', async () => {
    const response = await api.getBooks();
    return response;
  });

  // 선택된 책의 챕터 목록 조회
  const { data: chapters, isLoading } = useQuery(
    ['admin-chapters', selectedBookId],
    async () => {
      if (!selectedBookId) return [];
      const response = await api.getBookChapters(selectedBookId);
      return response;
    },
    {
      enabled: !!selectedBookId,
    }
  );

  // 챕터 삭제 mutation
  const deleteMutation = useMutation(
    (chapterId: number) => api.deleteChapter(chapterId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-chapters', selectedBookId]);
        toast.success('챕터가 삭제되었습니다');
      },
      onError: () => {
        toast.error('챕터 삭제에 실패했습니다');
      },
    }
  );

  const handleDelete = (chapterId: number) => {
    if (confirm('정말로 이 챕터를 삭제하시겠습니까?')) {
      deleteMutation.mutate(chapterId);
    }
  };

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    if (!selectedBookId) {
      toast.error('먼저 책을 선택해주세요');
      return;
    }
    setEditingChapter(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingChapter(null);
  };

  const selectedBook = books?.find((b: Book) => b.id === selectedBookId);

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">챕터 관리</h1>
        <p className="text-gray-600 mt-2">책별 챕터를 관리합니다</p>
      </div>

      {/* 책 선택 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          책 선택
        </label>
        <select
          value={selectedBookId || ''}
          onChange={(e) => setSelectedBookId(Number(e.target.value) || null)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">책을 선택하세요</option>
          {books?.map((book: Book) => (
            <option key={book.id} value={book.id}>
              {book.title} - {book.author}
            </option>
          ))}
        </select>
      </div>

      {/* 선택된 책이 있을 때만 챕터 관리 UI 표시 */}
      {selectedBookId && (
        <>
          {/* 액션 바 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {selectedBook?.title}의 챕터
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                총 {chapters?.length || 0}개의 챕터
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-medium flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              새 챕터 추가
            </button>
          </div>

          {/* 챕터 목록 테이블 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    번호
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예상 시간
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : chapters && chapters.length > 0 ? (
                  chapters.map((chapter: Chapter) => (
                    <tr key={chapter.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Chapter {chapter.chapter_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {chapter.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {chapter.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {chapter.estimated_minutes}분
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            chapter.is_published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {chapter.is_published ? '출판됨' : '비공개'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(chapter)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(chapter.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      이 책에는 아직 챕터가 없습니다. 첫 번째 챕터를 추가해보세요!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 선택된 책이 없을 때 */}
      {!selectedBookId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            책을 선택하세요
          </h3>
          <p className="text-gray-600">
            위에서 책을 선택하면 해당 책의 챕터를 관리할 수 있습니다
          </p>
        </div>
      )}

      {/* 챕터 추가/수정 모달 */}
      {isFormOpen && selectedBookId && (
        <ChapterFormModal
          bookId={selectedBookId}
          chapter={editingChapter}
          onClose={closeForm}
          onSuccess={() => {
            closeForm();
            queryClient.invalidateQueries(['admin-chapters', selectedBookId]);
          }}
        />
      )}
    </div>
  );
}

/**
 * 챕터 추가/수정 폼 모달
 */
function ChapterFormModal({
  bookId,
  chapter,
  onClose,
  onSuccess,
}: {
  bookId: number;
  chapter: Chapter | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    chapter_number: chapter?.chapter_number || 1,
    title: chapter?.title || '',
    content: chapter?.content || '',
    content_type: chapter?.content_type || 'html',
    estimated_minutes: chapter?.estimated_minutes || 10,
    is_published: chapter?.is_published || false,
    display_order: chapter?.display_order || 0,
  });

  const mutation = useMutation(
    async (data: typeof formData) => {
      if (chapter) {
        // 수정
        return await api.updateChapter(chapter.id, data);
      } else {
        // 추가
        return await api.createChapter(bookId, data);
      }
    },
    {
      onSuccess: () => {
        toast.success(chapter ? '챕터가 수정되었습니다' : '챕터가 추가되었습니다');
        onSuccess();
      },
      onError: () => {
        toast.error(chapter ? '챕터 수정에 실패했습니다' : '챕터 추가에 실패했습니다');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {chapter ? '챕터 수정' : '새 챕터 추가'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* 폼 내용 */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  챕터 번호 *
                </label>
                <input
                  type="number"
                  value={formData.chapter_number}
                  onChange={(e) =>
                    setFormData({ ...formData, chapter_number: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  예상 학습 시간 (분) *
                </label>
                <input
                  type="number"
                  value={formData.estimated_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, estimated_minutes: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                콘텐츠 *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                placeholder="HTML 또는 텍스트 콘텐츠를 입력하세요..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                HTML 태그를 사용할 수 있습니다 (예: &lt;p&gt;, &lt;strong&gt; 등)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  콘텐츠 타입
                </label>
                <select
                  value={formData.content_type}
                  onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="html">HTML</option>
                  <option value="markdown">Markdown</option>
                  <option value="text">Plain Text</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  표시 순서
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) =>
                  setFormData({ ...formData, is_published: e.target.checked })
                }
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                출판 (체크하면 사용자에게 보임)
              </label>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {mutation.isLoading ? '처리 중...' : chapter ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
