import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { VocabularyItem } from '@education-platform/api-client';

/**
 * 플래시카드 학습 페이지
 */
export default function FlashcardsPage() {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterMastered, setFilterMastered] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<VocabularyItem[]>([]);

  // 단어장 조회 (학습 중인 단어만 또는 전체)
  const { data: allWords = [], isLoading } = useQuery('vocabulary', () =>
    api.getMyVocabulary()
  );

  // 필터링 및 셔플
  useEffect(() => {
    let filtered = allWords;
    if (filterMastered) {
      filtered = allWords.filter((word) => !word.is_mastered);
    }

    // Fisher-Yates 셔플 알고리즘
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setShuffledWords(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [allWords, filterMastered]);

  // 마스터 상태 토글
  const toggleMasteryMutation = useMutation(
    ({ id, isMastered }: { id: number; isMastered: boolean }) =>
      api.updateVocabularyMastery(id, isMastered),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vocabulary');
        queryClient.invalidateQueries('vocabularyStats');
      },
    }
  );

  const currentWord = shuffledWords[currentIndex];
  const progress = shuffledWords.length > 0 ? ((currentIndex + 1) / shuffledWords.length) * 100 : 0;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleKnow = () => {
    if (currentWord && !currentWord.is_mastered) {
      toggleMasteryMutation.mutate({ id: currentWord.id, isMastered: true });
      toast.success('마스터 완료! 🎉');
    }
    setTimeout(handleNext, 300);
  };

  const handleDontKnow = () => {
    if (currentWord && currentWord.is_mastered) {
      toggleMasteryMutation.mutate({ id: currentWord.id, isMastered: false });
    }
    setTimeout(handleNext, 300);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">단어장을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (shuffledWords.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">📚 플래시카드</h1>
            <p className="text-gray-600 mb-8">
              {filterMastered
                ? '학습 중인 단어가 없습니다. 필터를 해제하거나 새로운 단어를 추가해보세요!'
                : '아직 저장된 단어가 없습니다. 먼저 단어를 추가해주세요!'}
            </p>
            <div className="flex justify-center gap-4">
              {filterMastered && (
                <button
                  onClick={() => setFilterMastered(false)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
                >
                  모든 단어 보기
                </button>
              )}
              <Link
                to="/vocabulary"
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
              >
                단어장으로 이동
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = currentIndex === shuffledWords.length - 1 && isFlipped;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📚 플래시카드</h1>
              <p className="text-sm text-gray-600 mt-1">
                {shuffledWords.length}개의 단어 학습 중
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterMastered}
                  onChange={(e) => setFilterMastered(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">학습 중인 단어만</span>
              </label>
              <Link
                to="/vocabulary"
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                단어장으로
              </Link>
            </div>
          </div>

          {/* 진행바 */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>
                {currentIndex + 1} / {shuffledWords.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 플래시카드 */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="perspective-1000">
          <div
            className={`relative w-full aspect-[3/2] cursor-pointer transition-transform duration-500 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            onClick={handleFlip}
          >
            {/* 앞면 - 단어 */}
            <div
              className={`absolute inset-0 backface-hidden ${
                isFlipped ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <div className="h-full bg-white rounded-2xl shadow-2xl p-12 flex flex-col items-center justify-center border-4 border-blue-200">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-4">단어</p>
                  <h2 className="text-5xl font-bold text-gray-900 mb-6">
                    {currentWord.word}
                  </h2>
                  {currentWord.book_title && (
                    <p className="text-sm text-gray-500">
                      📖 {currentWord.book_title}
                      {currentWord.chapter_title && ` - ${currentWord.chapter_title}`}
                    </p>
                  )}
                  <p className="text-sm text-gray-400 mt-8">클릭하여 뜻 보기</p>
                </div>
              </div>
            </div>

            {/* 뒷면 - 뜻과 예문 */}
            <div
              className={`absolute inset-0 backface-hidden rotate-y-180 ${
                isFlipped ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="h-full bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-2xl p-12 flex flex-col justify-center text-white">
                <div className="text-center">
                  <p className="text-sm opacity-90 mb-2">단어</p>
                  <h2 className="text-4xl font-bold mb-8">{currentWord.word}</h2>

                  {currentWord.definition && (
                    <div className="mb-6">
                      <p className="text-sm opacity-90 mb-2">뜻</p>
                      <p className="text-2xl font-semibold">{currentWord.definition}</p>
                    </div>
                  )}

                  {currentWord.example_sentence && (
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <p className="text-sm opacity-90 mb-2">예문</p>
                      <p className="text-lg italic">"{currentWord.example_sentence}"</p>
                    </div>
                  )}

                  <p className="text-sm opacity-75 mt-6">클릭하여 앞면 보기</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="mt-8 flex flex-col gap-4">
          {isFlipped && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleDontKnow}
                className="px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-semibold text-lg shadow-lg"
              >
                😕 모르겠어요
              </button>
              <button
                onClick={handleKnow}
                className="px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition font-semibold text-lg shadow-lg"
              >
                ✅ 알아요!
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← 이전
            </button>

            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium shadow"
            >
              🔄 처음부터
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === shuffledWords.length - 1}
              className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음 →
            </button>
          </div>
        </div>

        {/* 완료 메시지 */}
        {isCompleted && (
          <div className="mt-8 bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center animate-slide-up">
            <h3 className="text-2xl font-bold text-green-900 mb-2">🎉 모든 단어 학습 완료!</h3>
            <p className="text-green-700 mb-4">수고하셨습니다!</p>
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              다시 학습하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
