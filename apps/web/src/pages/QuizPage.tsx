import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

/**
 * 퀴즈 페이지
 * - 문제 표시 및 답안 선택
 * - 퀴즈 제출 및 채점
 */
export default function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const id = parseInt(quizId || '0');

  const [answers, setAnswers] = useState<{ [questionId: number]: string }>({});
  const [startTime] = useState(Date.now());

  // 퀴즈 및 문제 불러오기
  const { data, isLoading, error } = useQuery(
    ['quiz', id],
    () => api.getQuiz(id),
    { enabled: !!id }
  );

  const quiz = data?.quiz;
  const questions = data?.questions;

  // 답안 제출 mutation
  const submitMutation = useMutation(
    (submitData: { answers: Array<{ question_id: number; user_answer: string }>; time_taken_seconds: number }) =>
      api.submitQuiz(id, submitData),
    {
      onSuccess: (result) => {
        toast.success(`퀴즈 완료! 점수: ${result.percentage}%`);
        navigate(`/quiz/${id}/result`, { state: { result } });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '퀴즈 제출에 실패했습니다.');
      },
    }
  );

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    // 모든 문제에 답했는지 확인
    const unansweredCount = questions?.filter((q) => !answers[q.id])?.length || 0;

    if (unansweredCount > 0) {
      if (!confirm(`${unansweredCount}개의 문제에 답하지 않았습니다. 그래도 제출하시겠습니까?`)) {
        return;
      }
    }

    // 시간 계산
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    // 답안 배열 생성
    const answerArray = Object.entries(answers).map(([questionId, userAnswer]) => ({
      question_id: parseInt(questionId),
      user_answer: userAnswer,
    }));

    submitMutation.mutate({
      answers: answerArray,
      time_taken_seconds: timeTaken,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">퀴즈를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz || !questions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <p className="text-red-600 mb-4">퀴즈를 불러올 수 없습니다.</p>
          <Link to="/books" className="text-primary-600 hover:underline">
            책 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
            {quiz.description && <p className="text-gray-600 mb-4">{quiz.description}</p>}

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>📝</span>
                <span>{totalQuestions}문제</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⭐</span>
                <span>난이도: {quiz.difficulty_level}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>합격 점수: {quiz.passing_score}%</span>
              </div>
              {quiz.time_limit_minutes && (
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span>제한시간: {quiz.time_limit_minutes}분</span>
                </div>
              )}
            </div>

            {/* 진행 상황 */}
            <div className="mt-4 p-3 bg-primary-50 rounded-lg">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium text-primary-900">진행 상황</span>
                <span className="text-primary-600 font-semibold">
                  {answeredCount} / {totalQuestions} 완료
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 문제 목록 */}
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold mb-4">{question.question_text}</p>

                    {/* 객관식 문제 */}
                    {question.question_type === 'multiple_choice' && question.options && (
                      <div className="space-y-3">
                        {Object.entries(question.options as Record<string, string>).map(([key, value]) => (
                          <label
                            key={key}
                            className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                              answers[question.id] === key
                                ? 'border-primary-600 bg-primary-50'
                                : 'border-gray-200 hover:border-primary-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={key}
                              checked={answers[question.id] === key}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                              className="mr-3"
                            />
                            <span className="font-medium">{key}.</span> {value}
                          </label>
                        ))}
                      </div>
                    )}

                    {/* True/False 문제 */}
                    {question.question_type === 'true_false' && (
                      <div className="space-y-3">
                        {['true', 'false'].map((option) => (
                          <label
                            key={option}
                            className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                              answers[question.id] === option
                                ? 'border-primary-600 bg-primary-50'
                                : 'border-gray-200 hover:border-primary-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                              className="mr-3"
                            />
                            {option === 'true' ? '참 (True)' : '거짓 (False)'}
                          </label>
                        ))}
                      </div>
                    )}

                    {/* 단답형 문제 */}
                    {question.question_type === 'fill_blank' && (
                      <input
                        type="text"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="답을 입력하세요"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-600 focus:outline-none"
                      />
                    )}

                    <div className="mt-3 text-sm text-gray-500">
                      배점: {question.points}점
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 제출 버튼 */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {answeredCount < totalQuestions && (
                  <p className="text-orange-600">⚠️ {totalQuestions - answeredCount}개의 문제가 남았습니다</p>
                )}
                {answeredCount === totalQuestions && (
                  <p className="text-green-600">✓ 모든 문제에 답했습니다</p>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitMutation.isLoading}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50"
              >
                {submitMutation.isLoading ? '제출 중...' : '퀴즈 제출하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
