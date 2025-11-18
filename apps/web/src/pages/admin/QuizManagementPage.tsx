import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

interface Book {
  id: number;
  title: string;
}

interface Chapter {
  id: number;
  chapter_number: number;
  title: string;
}

interface Quiz {
  id: number;
  chapter_id: number;
  title: string;
  description: string;
  quiz_type: string;
  passing_score: number;
  time_limit_minutes: number;
  is_active: boolean;
}

interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: string;
  options: any;
  correct_answer: string;
  explanation: string;
  points: number;
  display_order: number;
}

/**
 * 퀴즈 관리 페이지
 * - 챕터별 퀴즈 목록
 * - 퀴즈 추가/수정/삭제
 * - 퀴즈 문제 관리
 */
export default function QuizManagementPage() {
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [isQuizFormOpen, setIsQuizFormOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [showQuestionsPanel, setShowQuestionsPanel] = useState(false);
  const queryClient = useQueryClient();

  // 책 목록 조회
  const { data: books } = useQuery('admin-all-books', async () => {
    return await api.getBooks();
  });

  // 선택된 책의 챕터 목록 조회
  const { data: chapters } = useQuery(
    ['admin-chapters', selectedBookId],
    async () => {
      if (!selectedBookId) return [];
      return await api.getBookChapters(selectedBookId);
    },
    { enabled: !!selectedBookId }
  );

  // 선택된 챕터의 퀴즈 목록 조회
  const { data: quizzes, isLoading } = useQuery(
    ['chapter-quizzes', selectedChapterId],
    async () => {
      if (!selectedChapterId) return [];
      return await api.getChapterQuizzes(selectedChapterId);
    },
    { enabled: !!selectedChapterId }
  );

  // 퀴즈 삭제
  const deleteMutation = useMutation(
    (quizId: number) => api.deleteQuiz(quizId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['chapter-quizzes', selectedChapterId]);
        toast.success('퀴즈가 삭제되었습니다');
      },
      onError: () => {
        toast.error('퀴즈 삭제에 실패했습니다');
      },
    }
  );

  const handleDelete = (quizId: number) => {
    if (confirm('정말로 이 퀴즈를 삭제하시겠습니까? 모든 문제도 함께 삭제됩니다.')) {
      deleteMutation.mutate(quizId);
    }
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setIsQuizFormOpen(true);
  };

  const handleAdd = () => {
    if (!selectedChapterId) {
      toast.error('먼저 챕터를 선택해주세요');
      return;
    }
    setEditingQuiz(null);
    setIsQuizFormOpen(true);
  };

  const handleManageQuestions = (quiz: Quiz) => {
    setSelectedQuizId(quiz.id);
    setShowQuestionsPanel(true);
  };

  const selectedBook = books?.find((b: Book) => b.id === selectedBookId);
  const selectedChapter = chapters?.find((c: Chapter) => c.id === selectedChapterId);

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">퀴즈 관리</h1>
        <p className="text-gray-600 mt-2">챕터별 퀴즈와 문제를 관리합니다</p>
      </div>

      {/* 책 & 챕터 선택 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            1. 책 선택
          </label>
          <select
            value={selectedBookId || ''}
            onChange={(e) => {
              setSelectedBookId(Number(e.target.value) || null);
              setSelectedChapterId(null);
            }}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">책을 선택하세요</option>
            {books?.map((book: Book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>

        {selectedBookId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2. 챕터 선택
            </label>
            <select
              value={selectedChapterId || ''}
              onChange={(e) => setSelectedChapterId(Number(e.target.value) || null)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">챕터를 선택하세요</option>
              {chapters?.map((chapter: Chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  Chapter {chapter.chapter_number}: {chapter.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 선택된 챕터가 있을 때만 퀴즈 관리 UI 표시 */}
      {selectedChapterId && (
        <>
          {/* 액션 바 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {selectedChapter?.title}의 퀴즈
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                총 {quizzes?.length || 0}개의 퀴즈
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-medium flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              새 퀴즈 추가
            </button>
          </div>

          {/* 퀴즈 목록 */}
          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              </div>
            ) : quizzes && quizzes.length > 0 ? (
              quizzes.map((quiz: Quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{quiz.title}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            quiz.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {quiz.is_active ? '활성' : '비활성'}
                        </span>
                      </div>
                      {quiz.description && (
                        <p className="text-gray-600 text-sm mb-3">{quiz.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📝 타입: {quiz.quiz_type}</span>
                        <span>🎯 합격: {quiz.passing_score}점</span>
                        {quiz.time_limit_minutes > 0 && (
                          <span>⏱️ 제한: {quiz.time_limit_minutes}분</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleManageQuestions(quiz)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                      >
                        문제 관리
                      </button>
                      <button
                        onClick={() => handleEdit(quiz)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(quiz.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">❓</div>
                <p className="text-gray-600 mb-4">
                  이 챕터에는 아직 퀴즈가 없습니다
                </p>
                <button
                  onClick={handleAdd}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  첫 퀴즈 추가
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* 선택된 챕터가 없을 때 */}
      {!selectedChapterId && selectedBookId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">챕터를 선택하세요</h3>
          <p className="text-gray-600">
            위에서 챕터를 선택하면 해당 챕터의 퀴즈를 관리할 수 있습니다
          </p>
        </div>
      )}

      {!selectedBookId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">책을 선택하세요</h3>
          <p className="text-gray-600">
            위에서 책을 선택한 후 챕터를 선택하여 퀴즈를 관리할 수 있습니다
          </p>
        </div>
      )}

      {/* 퀴즈 추가/수정 모달 */}
      {isQuizFormOpen && selectedChapterId && (
        <QuizFormModal
          chapterId={selectedChapterId}
          quiz={editingQuiz}
          onClose={() => {
            setIsQuizFormOpen(false);
            setEditingQuiz(null);
          }}
          onSuccess={() => {
            setIsQuizFormOpen(false);
            setEditingQuiz(null);
            queryClient.invalidateQueries(['chapter-quizzes', selectedChapterId]);
          }}
        />
      )}

      {/* 문제 관리 패널 */}
      {showQuestionsPanel && selectedQuizId && (
        <QuestionManagementPanel
          quizId={selectedQuizId}
          onClose={() => {
            setShowQuestionsPanel(false);
            setSelectedQuizId(null);
          }}
        />
      )}
    </div>
  );
}

/**
 * 퀴즈 추가/수정 폼 모달
 */
function QuizFormModal({
  chapterId,
  quiz,
  onClose,
  onSuccess,
}: {
  chapterId: number;
  quiz: Quiz | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: quiz?.title || '',
    description: quiz?.description || '',
    quiz_type: quiz?.quiz_type || 'multiple_choice',
    passing_score: quiz?.passing_score || 70,
    time_limit_minutes: quiz?.time_limit_minutes || 0,
    is_active: quiz?.is_active !== undefined ? quiz.is_active : true,
  });

  const mutation = useMutation(
    async (data: typeof formData) => {
      if (quiz) {
        return await api.updateQuiz(quiz.id, data);
      } else {
        return await api.createQuiz(chapterId, data);
      }
    },
    {
      onSuccess: () => {
        toast.success(quiz ? '퀴즈가 수정되었습니다' : '퀴즈가 생성되었습니다');
        onSuccess();
      },
      onError: () => {
        toast.error(quiz ? '퀴즈 수정에 실패했습니다' : '퀴즈 생성에 실패했습니다');
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
              {quiz ? '퀴즈 수정' : '새 퀴즈 추가'}
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
                퀴즈 제목 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                placeholder="예: Chapter 1 이해도 퀴즈"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="퀴즈에 대한 간단한 설명을 입력하세요"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  퀴즈 타입
                </label>
                <select
                  value={formData.quiz_type}
                  onChange={(e) => setFormData({ ...formData, quiz_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="multiple_choice">객관식</option>
                  <option value="true_false">참/거짓</option>
                  <option value="short_answer">주관식</option>
                  <option value="fill_blank">빈칸 채우기</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  합격 점수 (%)
                </label>
                <input
                  type="number"
                  value={formData.passing_score}
                  onChange={(e) =>
                    setFormData({ ...formData, passing_score: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="0"
                  max="100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제한 시간 (분) - 0이면 무제한
              </label>
              <input
                type="number"
                value={formData.time_limit_minutes}
                onChange={(e) =>
                  setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="0"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                활성화 (체크하면 사용자에게 보임)
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
              {mutation.isLoading ? '처리 중...' : quiz ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * 문제 관리 패널 (사이드 패널)
 */
function QuestionManagementPanel({ quizId, onClose }: { quizId: number; onClose: () => void }) {
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const queryClient = useQueryClient();

  // 퀴즈 문제 목록 조회
  const { data: quizData, isLoading } = useQuery(
    ['quiz-questions', quizId],
    async () => {
      return await api.getQuiz(quizId);
    }
  );

  const questions = quizData?.questions || [];

  // 문제 삭제
  const deleteQuestionMutation = useMutation(
    (questionId: number) => api.deleteQuizQuestion(questionId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['quiz-questions', quizId]);
        toast.success('문제가 삭제되었습니다');
      },
      onError: () => {
        toast.error('문제 삭제에 실패했습니다');
      },
    }
  );

  const handleDeleteQuestion = (questionId: number) => {
    if (confirm('정말로 이 문제를 삭제하시겠습니까?')) {
      deleteQuestionMutation.mutate(questionId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50">
      <div className="bg-white w-full max-w-3xl h-full shadow-2xl flex flex-col">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">문제 관리</h2>
            <p className="text-sm text-gray-600 mt-1">{quizData?.quiz.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* 문제 목록 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <button
              onClick={() => {
                setEditingQuestion(null);
                setIsQuestionFormOpen(true);
              }}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-medium"
            >
              + 새 문제 추가
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((question: QuizQuestion, index: number) => (
                <div
                  key={question.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-primary-600 text-white px-2 py-1 rounded text-xs font-medium">
                          Q{index + 1}
                        </span>
                        <span className="text-xs text-gray-600">{question.question_type}</span>
                        <span className="text-xs text-gray-600">{question.points}점</span>
                      </div>
                      <p className="text-gray-900 font-medium">{question.question_text}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingQuestion(question);
                          setIsQuestionFormOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  {question.options && (
                    <div className="mt-2 text-sm text-gray-600">
                      선택지: {JSON.stringify(question.options)}
                    </div>
                  )}
                  <div className="mt-2 text-sm">
                    <span className="text-green-600 font-medium">정답: </span>
                    {question.correct_answer}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-600">아직 문제가 없습니다</p>
            </div>
          )}
        </div>
      </div>

      {/* 문제 추가/수정 모달 */}
      {isQuestionFormOpen && (
        <QuestionFormModal
          quizId={quizId}
          question={editingQuestion}
          onClose={() => {
            setIsQuestionFormOpen(false);
            setEditingQuestion(null);
          }}
          onSuccess={() => {
            setIsQuestionFormOpen(false);
            setEditingQuestion(null);
            queryClient.invalidateQueries(['quiz-questions', quizId]);
          }}
        />
      )}
    </div>
  );
}

/**
 * 문제 추가/수정 폼 모달
 */
function QuestionFormModal({
  quizId,
  question,
  onClose,
  onSuccess,
}: {
  quizId: number;
  question: QuizQuestion | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    question_text: question?.question_text || '',
    question_type: question?.question_type || 'multiple_choice',
    correct_answer: question?.correct_answer || '',
    explanation: question?.explanation || '',
    points: question?.points || 10,
    display_order: question?.display_order || 0,
    options: question?.options || ['', '', '', ''],
  });

  const mutation = useMutation(
    async (data: typeof formData) => {
      const payload = {
        question_text: data.question_text,
        question_type: data.question_type,
        correct_answer: data.correct_answer,
        explanation: data.explanation,
        points: data.points,
        display_order: data.display_order,
        options: data.question_type === 'multiple_choice' ? data.options.filter(o => o.trim()) : null,
      };

      if (question) {
        return await api.updateQuizQuestion(question.id, payload);
      } else {
        return await api.createQuizQuestion(quizId, payload);
      }
    },
    {
      onSuccess: () => {
        toast.success(question ? '문제가 수정되었습니다' : '문제가 추가되었습니다');
        onSuccess();
      },
      onError: () => {
        toast.error(question ? '문제 수정에 실패했습니다' : '문제 추가에 실패했습니다');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (formData.question_type === 'multiple_choice') {
      const validOptions = formData.options.filter(o => o.trim());
      if (validOptions.length < 2) {
        toast.error('객관식 문제는 최소 2개 이상의 선택지가 필요합니다');
        return;
      }
    }

    mutation.mutate(formData);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) {
      toast.error('최소 2개의 선택지가 필요합니다');
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <form onSubmit={handleSubmit}>
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
            <h3 className="text-xl font-bold text-gray-900">
              {question ? '문제 수정' : '새 문제 추가'}
            </h3>
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
            {/* 문제 타입 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                문제 타입 *
              </label>
              <select
                value={formData.question_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    question_type: e.target.value,
                    options: e.target.value === 'multiple_choice' ? ['', '', '', ''] : [],
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="multiple_choice">객관식</option>
                <option value="true_false">참/거짓</option>
                <option value="short_answer">주관식</option>
                <option value="fill_blank">빈칸 채우기</option>
              </select>
            </div>

            {/* 문제 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                문제 *
              </label>
              <textarea
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                placeholder="문제를 입력하세요"
              />
            </div>

            {/* 객관식 선택지 */}
            {formData.question_type === 'multiple_choice' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  선택지 *
                </label>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 w-6">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder={`선택지 ${index + 1}`}
                      />
                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-red-600 hover:text-red-800 px-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.options.length < 6 && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                      + 선택지 추가
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 정답 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                정답 *
              </label>
              {formData.question_type === 'true_false' ? (
                <select
                  value={formData.correct_answer}
                  onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">선택하세요</option>
                  <option value="true">참 (True)</option>
                  <option value="false">거짓 (False)</option>
                </select>
              ) : formData.question_type === 'multiple_choice' ? (
                <select
                  value={formData.correct_answer}
                  onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">정답을 선택하세요</option>
                  {formData.options
                    .map((option, index) => option.trim() ? { value: option, index } : null)
                    .filter(Boolean)
                    .map((item, idx) => (
                      <option key={idx} value={item!.value}>
                        {item!.index + 1}. {item!.value}
                      </option>
                    ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.correct_answer}
                  onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  placeholder="정답을 입력하세요"
                />
              )}
            </div>

            {/* 해설 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                해설
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="정답에 대한 설명을 입력하세요"
              />
            </div>

            {/* 점수 & 순서 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  배점 *
                </label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="1"
                  required
                />
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
          </div>

          {/* 하단 버튼 */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
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
              {mutation.isLoading ? '처리 중...' : question ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
