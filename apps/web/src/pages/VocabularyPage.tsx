import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { VocabularyItem } from '@education-platform/api-client';
import VocabularyModal from '../components/VocabularyModal';

/**
 * 단어장 페이지
 */
export default function VocabularyPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'learning' | 'mastered'>('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabularyItem | null>(null);

  // 단어장 조회
  const { data: vocabulary = [], isLoading } = useQuery(
    ['vocabulary', filter, search],
    () => {
      const params: any = {};
      if (filter !== 'all') {
        params.is_mastered = filter === 'mastered';
      }
      if (search) {
        params.search = search;
      }
      return api.getMyVocabulary(params);
    }
  );

  // 통계 조회
  const { data: stats } = useQuery('vocabularyStats', () => api.getVocabularyStats());

  // 단어 삭제
  const deleteWordMutation = useMutation((id: number) => api.deleteVocabulary(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('vocabulary');
      queryClient.invalidateQueries('vocabularyStats');
      toast.success('단어가 삭제되었습니다');
    },
    onError: () => {
      toast.error('단어 삭제에 실패했습니다');
    },
  });

  // 마스터 상태 토글
  const toggleMasteryMutation = useMutation(
    ({ id, isMastered }: { id: number; isMastered: boolean }) =>
      api.updateVocabularyMastery(id, isMastered),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vocabulary');
        queryClient.invalidateQueries('vocabularyStats');
      },
      onError: () => {
        toast.error('상태 업데이트에 실패했습니다');
      },
    }
  );

  const handleEdit = (word: VocabularyItem) => {
    setEditingWord(word);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingWord(null);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries('vocabulary');
    queryClient.invalidateQueries('vocabularyStats');
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📚 내 단어장</h1>
              <p className="text-gray-600 mt-1">학습한 단어들을 관리하고 복습하세요</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/flashcards"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-medium"
              >
                🎴 플래시카드
              </Link>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
              >
                + 단어 추가
              </button>
            </div>
          </div>

          {/* 통계 */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">전체 단어</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total_words}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-600 font-medium">학습 중</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.learning_words}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">마스터</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.mastered_words}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 필터 */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilter('learning')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'learning'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                학습 중
              </button>
              <button
                onClick={() => setFilter('mastered')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'mastered'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                마스터
              </button>
            </div>

            {/* 검색 */}
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="단어 또는 뜻 검색..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 단어 목록 */}
        <div className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">단어장을 불러오는 중...</p>
            </div>
          ) : vocabulary.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">
                {search ? '검색 결과가 없습니다' : '아직 저장된 단어가 없습니다'}
              </p>
              <p className="text-gray-400 mt-2">
                책을 읽으며 모르는 단어를 추가해보세요!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vocabulary.map((word) => (
                <div
                  key={word.id}
                  className={`bg-white rounded-lg shadow-sm border-2 p-4 transition hover:shadow-md ${
                    word.is_mastered ? 'border-green-200' : 'border-gray-200'
                  }`}
                >
                  {/* 헤더 */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{word.word}</h3>
                    <button
                      onClick={() =>
                        toggleMasteryMutation.mutate({
                          id: word.id,
                          isMastered: !word.is_mastered,
                        })
                      }
                      className="text-2xl"
                      title={word.is_mastered ? '마스터 해제' : '마스터 표시'}
                    >
                      {word.is_mastered ? '✅' : '⭐'}
                    </button>
                  </div>

                  {/* 뜻 */}
                  {word.definition && (
                    <p className="text-gray-700 mb-2">{word.definition}</p>
                  )}

                  {/* 예문 */}
                  {word.example_sentence && (
                    <div className="bg-gray-50 border border-gray-200 rounded p-2 mb-3">
                      <p className="text-sm text-gray-600 italic">"{word.example_sentence}"</p>
                    </div>
                  )}

                  {/* 출처 */}
                  {word.book_title && (
                    <p className="text-xs text-gray-500 mb-3">
                      📖 {word.book_title}
                      {word.chapter_title && ` - ${word.chapter_title}`}
                    </p>
                  )}

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(word)}
                      className="flex-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => deleteWordMutation.mutate(word.id)}
                      disabled={deleteWordMutation.isLoading}
                      className="flex-1 px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                    >
                      삭제
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(word.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 단어 추가/수정 모달 */}
      {(showAddModal || editingWord) && (
        <VocabularyModal
          word={editingWord || undefined}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
