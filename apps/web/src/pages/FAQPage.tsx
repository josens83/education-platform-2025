import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: '구독 및 결제',
    question: '무료 체험은 어떻게 시작하나요?',
    answer: '회원가입 후 구독 페이지에서 "무료 체험" 플랜을 선택하시면 7일간 무료로 모든 콘텐츠를 이용하실 수 있습니다. 신용카드 등록 없이 이용 가능합니다.',
  },
  {
    category: '구독 및 결제',
    question: '구독을 취소하면 어떻게 되나요?',
    answer: '구독을 취소하시면 현재 결제 기간이 종료될 때까지는 서비스를 계속 이용하실 수 있습니다. 다음 결제일에 자동으로 갱신되지 않습니다.',
  },
  {
    category: '구독 및 결제',
    question: '환불 정책은 어떻게 되나요?',
    answer: '유료 구독 시작 후 7일 이내 취소 시 전액 환불됩니다. 7일 이후에는 남은 기간에 대한 부분 환불이 불가능합니다.',
  },
  {
    category: '구독 및 결제',
    question: '플랜을 변경할 수 있나요?',
    answer: '네, 언제든지 구독 페이지에서 다른 플랜으로 변경하실 수 있습니다. 변경된 플랜은 다음 결제일부터 적용됩니다.',
  },
  {
    category: '서비스 이용',
    question: '어떤 학습 콘텐츠가 제공되나요?',
    answer: '전자책, 오디오북, 퀴즈, 단어장 등 다양한 학습 자료를 제공합니다. 초등부터 고등, TOEIC, TOEFL, TEPS 등 다양한 레벨과 목적에 맞는 콘텐츠가 준비되어 있습니다.',
  },
  {
    category: '서비스 이용',
    question: '오프라인에서도 사용할 수 있나요?',
    answer: '월간 구독 이상의 유료 플랜을 이용하시면 오프라인 모드를 사용하실 수 있습니다. 원하는 책을 다운로드하여 인터넷 연결 없이 학습하실 수 있습니다.',
  },
  {
    category: '서비스 이용',
    question: '학습 진도는 어떻게 관리되나요?',
    answer: '대시보드에서 실시간으로 학습 진도, 퀴즈 성적, 학습 시간 등을 확인하실 수 있습니다. 목표를 설정하고 달성률을 추적할 수 있습니다.',
  },
  {
    category: '서비스 이용',
    question: '여러 기기에서 사용할 수 있나요?',
    answer: '네, 하나의 계정으로 웹, 모바일 등 여러 기기에서 동시에 이용하실 수 있습니다. 학습 진도도 모든 기기에서 동기화됩니다.',
  },
  {
    category: '기술 지원',
    question: '비밀번호를 잊어버렸어요.',
    answer: '로그인 페이지에서 "비밀번호 찾기"를 클릭하고 가입 시 사용한 이메일 주소를 입력하세요. 비밀번호 재설정 링크가 이메일로 발송됩니다.',
  },
  {
    category: '기술 지원',
    question: '오디오가 재생되지 않아요.',
    answer: '브라우저의 자동 재생 설정을 확인해 주세요. 또한 브라우저를 최신 버전으로 업데이트하시면 대부분의 문제가 해결됩니다.',
  },
  {
    category: '기술 지원',
    question: '계정을 삭제하고 싶어요.',
    answer: '프로필 설정 페이지에서 "계정 삭제" 버튼을 클릭하시면 됩니다. 삭제된 계정은 복구할 수 없으니 신중하게 결정해 주세요.',
  },
  {
    category: '기타',
    question: '가족 플랜은 어떻게 사용하나요?',
    answer: '가족 플랜을 구독하시면 최대 3명까지 개별 계정을 생성하여 사용하실 수 있습니다. 각 계정은 독립적으로 학습 진도가 관리됩니다.',
  },
  {
    category: '기타',
    question: '학습 자료를 다운로드할 수 있나요?',
    answer: '저작권 보호를 위해 콘텐츠 다운로드는 제한되어 있습니다. 다만, 오프라인 모드 기능을 통해 앱 내에서 오프라인으로 이용하실 수 있습니다.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  const categories = ['전체', ...Array.from(new Set(faqData.map((item) => item.category)))];

  const filteredFAQs =
    selectedCategory === '전체'
      ? faqData
      : faqData.filter((item) => item.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">자주 묻는 질문 (FAQ)</h1>
          <p className="text-xl text-gray-600">
            자주 묻는 질문들을 모았습니다. 궁금한 내용을 찾아보세요!
          </p>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ 목록 */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full mr-3">
                    {faq.category}
                  </span>
                  <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                </div>
                <svg
                  className={`w-6 h-6 text-gray-500 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 추가 도움말 */}
        <div className="mt-12 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            찾으시는 답변이 없으신가요?
          </h3>
          <p className="text-gray-700 mb-6">
            고객센터를 통해 문의해 주시면 빠르게 도와드리겠습니다.
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            문의하기
          </a>
        </div>
      </div>
    </div>
  );
}
