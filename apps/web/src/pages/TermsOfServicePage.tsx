/**
 * 이용약관 페이지
 */
export default function TermsOfServicePage() {
  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">이용약관</h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제1조 (목적)</h2>
            <p className="text-gray-700 leading-relaxed">
              본 약관은 영어 학습 플랫폼(이하 "회사")이 제공하는 온라인 영어 교육 서비스(이하 "서비스")의 이용과 관련하여
              회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제2조 (정의)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              본 약관에서 사용하는 용어의 정의는 다음과 같습니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>"서비스"란 회사가 제공하는 온라인 영어 교육 콘텐츠 및 학습 관리 시스템을 의미합니다.</li>
              <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
              <li>"회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며,
                  회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
              <li>"콘텐츠"란 회사가 제공하는 전자책, 오디오북, 퀴즈, 학습 자료 등 모든 학습 자료를 의미합니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제3조 (약관의 게시와 개정)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>회사는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</li>
              <li>회사는 약관의 규제에 관한 법률, 전자거래기본법, 전자서명법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등
                  관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
              <li>회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행 약관과 함께 서비스 초기 화면에
                  그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제4조 (회원가입)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써
                  회원가입을 신청합니다.</li>
              <li>회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                  <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                  <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제5조 (서비스의 제공)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>회사는 회원에게 아래와 같은 서비스를 제공합니다:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>전자책 및 오디오북 제공</li>
                  <li>학습 진도 관리 서비스</li>
                  <li>퀴즈 및 평가 서비스</li>
                  <li>개인 단어장 및 복습 시스템</li>
                  <li>학습 통계 및 분석 서비스</li>
                </ul>
              </li>
              <li>서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.
                  다만, 회사의 업무상 또는 기술상의 이유로 서비스가 일시 중지될 수 있습니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제6조 (구독 및 결제)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>서비스 이용을 위해서는 회원이 선택한 구독 플랜에 따른 요금을 지불해야 합니다.</li>
              <li>구독 요금은 매월 또는 매년 자동으로 갱신되며, 회원이 구독을 취소하지 않는 한 계속됩니다.</li>
              <li>회원은 언제든지 구독을 취소할 수 있으며, 구독 취소 시 다음 갱신일까지는 서비스를 계속 이용할 수 있습니다.</li>
              <li>환불 정책은 다음과 같습니다:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>무료 체험 기간 중 취소 시 전액 환불</li>
                  <li>유료 구독 시작 후 7일 이내 취소 시 전액 환불</li>
                  <li>7일 이후 취소 시 남은 기간에 대한 부분 환불 불가</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제7조 (저작권 및 콘텐츠 이용)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>회사가 제공하는 모든 콘텐츠의 저작권 및 지적재산권은 회사에 귀속됩니다.</li>
              <li>회원은 서비스를 이용함으로써 얻은 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 등
                  기타 방법으로 이용하거나 제3자에게 이용하게 할 수 없습니다.</li>
              <li>회원이 작성한 게시물(노트, 북마크 등)에 대한 저작권은 회원에게 있으나,
                  회사는 서비스 운영을 위해 이를 사용할 수 있습니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제8조 (회원의 의무)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>회원은 다음 행위를 하여서는 안 됩니다:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>신청 또는 변경 시 허위 내용의 등록</li>
                  <li>타인의 정보 도용</li>
                  <li>회사가 게시한 정보의 변경</li>
                  <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                  <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                  <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                  <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제9조 (서비스 이용의 제한 및 중지)</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 회원이 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우,
              경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제10조 (면책조항)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는
                  서비스 제공에 관한 책임이 면제됩니다.</li>
              <li>회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</li>
              <li>회사는 회원이 서비스를 이용하여 기대하는 학습 효과나 성적 향상 등에 대해서는 보증하지 않습니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제11조 (분쟁 해결)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여
                  피해보상처리기구를 설치·운영합니다.</li>
              <li>서비스 이용으로 발생한 분쟁에 대해 소송이 필요한 경우 회사의 본사 소재지를 관할하는 법원을
                  관할 법원으로 합니다.</li>
            </ol>
          </section>

          <section className="mb-8 pb-8 border-b border-gray-200">
            <p className="text-gray-600 text-sm">
              시행일자: 2025년 1월 1일
            </p>
          </section>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-sm text-blue-900">
              본 약관에 대한 문의사항이 있으시면 고객센터로 연락해 주시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
