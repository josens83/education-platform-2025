import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import SEO from '../components/SEO';
import { FiBook, FiTarget, FiTrendingUp, FiBookmark, FiEdit3, FiStar, FiCheck } from 'react-icons/fi';

/**
 * Premium Homepage - Linear/Stripe Style
 * Modern design with dark mode support, glass morphism, and micro-interactions
 */
export default function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const features = [
    {
      icon: FiBook,
      title: '이북 리더',
      description: '텍스트와 오디오를 동시에 재생하며 문장별 하이라이팅으로 효과적인 학습',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FiTarget,
      title: '퀴즈 시스템',
      description: '자동 채점과 오답 노트로 학습 효과를 극대화하세요',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: FiTrendingUp,
      title: '학습 진도 관리',
      description: '실시간 진도 추적과 대시보드로 학습 현황을 한눈에 확인',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: FiBookmark,
      title: '북마크 & 노트',
      description: '중요한 부분을 북마크하고 메모를 남기며 학습하세요',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: FiEdit3,
      title: '나만의 단어장',
      description: '모르는 단어를 저장하고 복습하여 어휘력을 향상시키세요',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: FiStar,
      title: '다양한 콘텐츠',
      description: '초등부터 고등, TOEIC, TOEFL까지 수준별 맞춤 콘텐츠',
      gradient: 'from-yellow-500 to-orange-500',
    },
  ];

  const plans = [
    {
      name: '무료 체험',
      price: '무료',
      period: '7일',
      features: [
        '모든 콘텐츠 이용',
        '오프라인 모드 제외',
        'AI 튜터 제외',
      ],
      highlighted: false,
    },
    {
      name: '월간 구독',
      price: '11,900원',
      period: '월',
      features: [
        '모든 콘텐츠 이용',
        '오프라인 모드',
        'AI 튜터 제외',
      ],
      highlighted: false,
    },
    {
      name: '연간 구독',
      price: '119,000원',
      period: '년',
      badge: '인기',
      features: [
        '모든 콘텐츠 이용',
        '오프라인 모드',
        'AI 튜터 포함',
        '2개월 무료',
      ],
      highlighted: true,
    },
    {
      name: '가족 플랜',
      price: '19,900원',
      period: '월',
      features: [
        '모든 콘텐츠 이용',
        '오프라인 모드',
        'AI 튜터 포함',
        '최대 3명 이용',
      ],
      highlighted: false,
    },
  ];

  return (
    <>
      <SEO
        title="영어 원서 읽기 플랫폼"
        description="구독형 영어 원서 읽기 플랫폼. 수준별 영어책과 오디오북, 퀴즈로 영어 실력을 향상시키세요. Storytel 스타일의 이북 리더와 오디오 플레이어 제공."
        keywords="영어학습, 영어원서, 오디오북, 영어공부, 영어교육, 온라인영어, 영어책, 원서읽기, 이북, ebook"
        url="/"
      />

      <div className="relative bg-bg dark:bg-bg overflow-hidden">
        {/* Background gradient spheres - Linear style */}
        <div className="gradient-mesh-bg">
          <div className="gradient-sphere w-96 h-96 bg-gradient-to-r from-primary-500 to-purple-500 -top-48 -left-48" />
          <div className="gradient-sphere w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-500 top-1/2 -right-48" />
          <div className="gradient-sphere w-96 h-96 bg-gradient-to-r from-pink-500 to-purple-500 bottom-0 left-1/3" />
        </div>

        {/* Hero Section */}
        <section className="relative container-custom py-24 md:py-32">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl md:text-7xl font-bold text-text-primary mb-6">
                영어 학습의{' '}
                <span className="text-gradient">새로운 기준</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl md:text-2xl text-text-secondary mb-12 leading-relaxed"
            >
              Storytel 스타일의 이북 리더와 오디오 플레이어로
              <br className="hidden md:block" />
              재미있게 영어를 배우세요
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {isAuthenticated ? (
                <Link to="/books" className="btn-primary text-lg px-10 py-4">
                  책 둘러보기
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-lg px-10 py-4">
                    무료로 시작하기
                  </Link>
                  <Link to="/login" className="btn-secondary text-lg px-10 py-4">
                    로그인
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </section>

        {/* Features Section - Bento Grid Style */}
        <section className="relative container-custom py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              주요 기능
            </h2>
            <p className="text-lg text-text-secondary">
              효과적인 영어 학습을 위한 모든 것
            </p>
          </motion.div>

          <div className="grid-bento">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bento-item p-8 group"
              >
                {/* Gradient Icon Background */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-6`}>
                  <div className="w-full h-full bg-surface rounded-2xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-text-primary" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="relative bg-bg-secondary dark:bg-bg-secondary py-20">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
                구독 플랜
              </h2>
              <p className="text-lg text-text-secondary">
                나에게 맞는 플랜을 선택하세요
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`
                    relative rounded-2xl p-8
                    ${plan.highlighted
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-glow'
                      : 'bg-surface border border-border'
                    }
                    transition-all duration-300
                    ${plan.highlighted ? 'scale-105' : 'hover:scale-105'}
                  `}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <h3 className={`text-xl font-bold mb-4 ${plan.highlighted ? 'text-white' : 'text-text-primary'}`}>
                    {plan.name}
                  </h3>

                  <div className="mb-6">
                    <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-text-primary'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ml-2 ${plan.highlighted ? 'text-white/80' : 'text-text-secondary'}`}>
                      /{plan.period}
                    </span>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className={`flex items-start gap-2 text-sm ${
                          plan.highlighted ? 'text-white/90' : 'text-text-secondary'
                        }`}
                      >
                        <FiCheck className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-white' : 'text-primary-600'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={isAuthenticated ? '/subscription' : '/register'}
                    className={`
                      mt-8 block w-full py-3 px-6 rounded-xl font-medium text-center
                      transition-all duration-200
                      ${plan.highlighted
                        ? 'bg-white text-primary-600 hover:bg-gray-50'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                      }
                    `}
                  >
                    시작하기
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative container-custom py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card-glass-lg p-12 md:p-16 text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-text-secondary mb-10">
              7일 무료 체험으로 모든 기능을 경험해보세요
            </p>
            <Link
              to={isAuthenticated ? '/books' : '/register'}
              className="btn-primary text-lg px-12 py-5 inline-block"
            >
              무료로 시작하기
            </Link>
          </motion.div>
        </section>
      </div>
    </>
  );
}
