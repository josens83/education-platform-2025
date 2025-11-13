import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * 홈페이지
 * - 플랫폼 소개
 * - CTA (Call To Action)
 */
export default function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="bg-gradient-to-br from-primary-50 to-white">
      {/* 히어로 섹션 */}
      <section className="container-custom py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 animate-slide-up">
            영어 학습의 새로운 기준
          </h1>
          <p className="text-xl text-gray-600 mb-8 animate-slide-up">
            Storytel 스타일의 이북 리더와 오디오 플레이어로
            <br />
            재미있게 영어를 배우세요
          </p>

          <div className="flex gap-4 justify-center animate-slide-up">
            {isAuthenticated ? (
              <Link
                to="/books"
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-lg font-semibold"
              >
                책 둘러보기
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-lg font-semibold"
                >
                  무료로 시작하기
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition text-lg font-semibold"
                >
                  로그인
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 주요 기능 */}
      <section className="container-custom py-16">
        <h2 className="text-3xl font-bold text-center mb-12">주요 기능</h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">📖</div>
            <h3 className="text-xl font-semibold mb-2">이북 리더</h3>
            <p className="text-gray-600">
              텍스트와 오디오를 동시에 재생하며 문장별 하이라이팅으로 효과적인 학습
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">퀴즈 시스템</h3>
            <p className="text-gray-600">
              자동 채점과 오답 노트로 학습 효과를 극대화하세요
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">학습 진도 관리</h3>
            <p className="text-gray-600">
              실시간 진도 추적과 대시보드로 학습 현황을 한눈에 확인
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">🔖</div>
            <h3 className="text-xl font-semibold mb-2">북마크 & 노트</h3>
            <p className="text-gray-600">
              중요한 부분을 북마크하고 메모를 남기며 학습하세요
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">나만의 단어장</h3>
            <p className="text-gray-600">
              모르는 단어를 저장하고 복습하여 어휘력을 향상시키세요
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-xl font-semibold mb-2">다양한 콘텐츠</h3>
            <p className="text-gray-600">
              초등부터 고등, TOEIC, TOEFL까지 수준별 맞춤 콘텐츠
            </p>
          </div>
        </div>
      </section>

      {/* 구독 플랜 */}
      <section className="bg-white py-16">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">구독 플랜</h2>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-primary-500 transition">
              <h3 className="text-xl font-bold mb-2">무료 체험</h3>
              <div className="text-3xl font-bold mb-4">
                무료
                <span className="text-sm text-gray-600 font-normal ml-2">7일</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ 모든 콘텐츠 이용</li>
                <li>✓ 오프라인 모드 제외</li>
                <li>✓ AI 튜터 제외</li>
              </ul>
            </div>

            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-primary-500 transition">
              <h3 className="text-xl font-bold mb-2">월간 구독</h3>
              <div className="text-3xl font-bold mb-4">
                11,900원
                <span className="text-sm text-gray-600 font-normal ml-2">/월</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ 모든 콘텐츠 이용</li>
                <li>✓ 오프라인 모드</li>
                <li>✓ AI 튜터 제외</li>
              </ul>
            </div>

            <div className="border-2 border-primary-500 rounded-xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-xs font-semibold">
                인기
              </div>
              <h3 className="text-xl font-bold mb-2">연간 구독</h3>
              <div className="text-3xl font-bold mb-4">
                119,000원
                <span className="text-sm text-gray-600 font-normal ml-2">/년</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ 모든 콘텐츠 이용</li>
                <li>✓ 오프라인 모드</li>
                <li>✓ AI 튜터 포함</li>
                <li>✓ 2개월 무료</li>
              </ul>
            </div>

            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-primary-500 transition">
              <h3 className="text-xl font-bold mb-2">가족 플랜</h3>
              <div className="text-3xl font-bold mb-4">
                19,900원
                <span className="text-sm text-gray-600 font-normal ml-2">/월</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ 모든 콘텐츠 이용</li>
                <li>✓ 오프라인 모드</li>
                <li>✓ AI 튜터 포함</li>
                <li>✓ 최대 3명 이용</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
