import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

interface Book {
  id: number;
  title: string;
  author: string;
  difficulty_level: string;
  is_published: boolean;
  category_id: number;
  cover_image_url?: string;
  description?: string;
}

/**
 * 책 관리 페이지
 * - 책 목록 조회
 * - 책 추가/수정/삭제
 * - 출판 상태 토글
 */
export default function BookManagementPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const queryClient = useQueryClient();

  // 책 목록 조회
  const { data: books, isLoading } = useQuery('admin-books', async () => {
    const response = await api.getBooks();
    return response;
  });

  // 책 삭제 mutation
  const deleteMutation = useMutation(
    (bookId: number) => api.deleteBook(bookId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-books');
        toast.success('책이 삭제되었습니다');
      },
      onError: () => {
        toast.error('책 삭제에 실패했습니다');
      },
    }
  );

  const handleDelete = (bookId: number) => {
    if (confirm('정말로 이 책을 삭제하시겠습니까?')) {
      deleteMutation.mutate(bookId);
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingBook(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingBook(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">책 관리</h1>
          <p className="text-gray-600 mt-2">총 {books?.length || 0}권의 책</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-medium flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          새 책 추가
        </button>
      </div>

      {/* 책 목록 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                저자
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                난이도
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
            {books && books.length > 0 ? (
              books.map((book: Book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {book.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {book.cover_image_url && (
                        <img
                          src={book.cover_image_url}
                          alt={book.title}
                          className="w-10 h-14 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{book.title}</div>
                        {book.description && (
                          <div className="text-xs text-gray-500 line-clamp-1">
                            {book.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {book.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      book.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                      book.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {book.difficulty_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      book.is_published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {book.is_published ? '출판됨' : '비공개'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(book)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  등록된 책이 없습니다. 첫 번째 책을 추가해보세요!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 책 추가/수정 모달 */}
      {isFormOpen && (
        <BookFormModal
          book={editingBook}
          onClose={closeForm}
          onSuccess={() => {
            closeForm();
            queryClient.invalidateQueries('admin-books');
          }}
        />
      )}
    </div>
  );
}

/**
 * 책 추가/수정 폼 모달
 */
function BookFormModal({
  book,
  onClose,
  onSuccess,
}: {
  book: Book | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, useState] = useState({
    title: book?.title || '',
    author: book?.author || '',
    description: book?.description || '',
    difficulty_level: book?.difficulty_level || 'beginner',
    cover_image_url: book?.cover_image_url || '',
    is_published: book?.is_published || false,
  });

  const mutation = useMutation(
    async (data: typeof formData) => {
      if (book) {
        // 수정
        return await api.updateBook(book.id, data);
      } else {
        // 추가
        return await api.createBook(data);
      }
    },
    {
      onSuccess: () => {
        toast.success(book ? '책이 수정되었습니다' : '책이 추가되었습니다');
        onSuccess();
      },
      onError: () => {
        toast.error(book ? '책 수정에 실패했습니다' : '책 추가에 실패했습니다');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {book ? '책 수정' : '새 책 추가'}
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
                저자 *
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                난이도 *
              </label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="beginner">초급</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                표지 이미지 URL
              </label>
              <input
                type="url"
                value={formData.cover_image_url}
                onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
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
              {mutation.isLoading ? '처리 중...' : book ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
