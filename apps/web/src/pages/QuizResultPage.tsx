import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { api } from '../lib/api';

/**
 * 퀴즈 결과 페이지
 * - 점수 및 합격 여부 표시
 * - 정답/오답 표시
 * - 오답 노트 기능
 */

interface AnswerData {
  question_id: number;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
}

export default function QuizResultPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const id = parseInt(quizId || '0');

  // location.state에서 result 가져오기 (QuizPage에서 전달)
  const resultFromState = (location.state as any)?.result;

  // 퀴즈 정보 불러오기 (문제 설명 표시용)
  const { data: quizData } = useQuery(['quiz', id], () => api.getQuiz(id), { enabled: !!id });

  const quiz = quizData?.quiz;
  const questions = quizData?.questions;

  // result가 없으면 대시보드로 리다이렉트
  if (!resultFromState) {
    navigate('/dashboard');
    return null;
  }

  const result = resultFromState;
  const isPassed = result.is_passed;

  // 문제별 결과 매핑
  const answerMap = new Map<number, AnswerData>(
    result.answers.map((a: AnswerData) => [a.question_id, a])
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* 결과 카드 */}
          <div className={`rounded-xl shadow-lg p-8 mb-8 ${
            isPassed ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'
          } text-white`}>
            <div className="text-center">
              <div className="text-6xl mb-4">{isPassed ? '🎉' : '💪'}</div>
              <h1 className="text-4xl font-bold mb-2">
                {isPassed ? '합격입니다!' : '조금 더 노력해보세요!'}
              </h1>
              <p className="text-xl opacity-90 mb-6">
                {quiz?.title || '퀴즈'} 결과
              </p>

              <div className="flex items-center justify-center gap-8 mb-6">
                <div>
                  <div className="text-5xl font-bold">{result.percentage}%</div>
                  <div className="text-sm opacity-75">득점률</div>
                </div>
                <div className="w-px h-16 bg-white opacity-30"></div>
                <div>
                  <div className="text-3xl font-bold">
                    {result.score} / {result.total_points}
                  </div>
                  <div className="text-sm opacity-75">점수</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Link
                  to="/dashboard"
                  className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition font-semibold"
                >
                  대시보드로
                </Link>
                <Link
                  to={`/quiz/${id}`}
                  className="px-6 py-3 bg-white/20 backdrop-blur text-white border-2 border-white rounded-lg hover:bg-white/30 transition font-semibold"
                >
                  다시 도전하기
                </Link>
              </div>
            </div>
          </div>

          {/* 답안 분석 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">답안 분석</h2>

            {questions && questions.length > 0 ? (
              <div className="space-y-6">
                {questions.map((question, index) => {
                  const answerData = answerMap.get(question.id);
                  const isCorrect = answerData?.is_correct;

                  return (
                    <div
                      key={question.id}
                      className={`p-6 border-2 rounded-lg ${
                        isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white ${
                            isCorrect ? 'bg-green-600' : 'bg-red-600'
                          }`}
                        >
                          {isCorrect ? '✓' : '✗'}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-lg">문제 {index + 1}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {isCorrect ? '정답' : '오답'} ({question.points}점)
                            </span>
                          </div>

                          <p className="text-gray-900 mb-4">{question.question_text}</p>

                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-semibold text-gray-700">내 답:</span>{' '}
                              <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                {answerData?.user_answer || '(답변 없음)'}
                              </span>
                            </div>
                            {!isCorrect && (
                              <div>
                                <span className="font-semibold text-gray-700">정답:</span>{' '}
                                <span className="text-green-600">{answerData?.correct_answer}</span>
                              </div>
                            )}
                            {question.explanation && !isCorrect && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-900">
                                  <span className="font-semibold">💡 해설:</span> {question.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">문제 정보를 불러올 수 없습니다.</p>
            )}
          </div>

          {/* 통계 */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-green-600">
                {result.answers.filter((a: any) => a.is_correct).length}
              </div>
              <div className="text-sm text-gray-600">정답</div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="text-3xl mb-2">❌</div>
              <div className="text-2xl font-bold text-red-600">
                {result.answers.filter((a: any) => !a.is_correct).length}
              </div>
              <div className="text-sm text-gray-600">오답</div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold text-primary-600">{result.percentage}%</div>
              <div className="text-sm text-gray-600">정답률</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
