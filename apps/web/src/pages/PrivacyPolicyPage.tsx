/**
 * 개인정보처리방침 페이지
 */
export default function PrivacyPolicyPage() {
  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <p className="text-gray-700 leading-relaxed mb-4">
              영어 학습 플랫폼(이하 "회사")은 정보통신망 이용촉진 및 정보보호 등에 관한 법률,
              개인정보보호법 등 관련 법령상의 개인정보보호 규정을 준수하며,
              이용자의 개인정보 보호에 최선을 다하고 있습니다.
            </p>
            <p className="text-gray-700 leading-relaxed">
              회사는 개인정보처리방침을 통하여 이용자가 제공하는 개인정보가 어떠한 용도와 방식으로
              이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 수집하는 개인정보의 항목 및 수집방법</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">가. 수집하는 개인정보의 항목</h3>

            <div className="mb-4">
              <p className="font-semibold text-gray-800 mb-2">회원가입 시:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                <li>필수항목: 이메일 주소, 비밀번호, 이름(닉네임)</li>
                <li>선택항목: 생년월일, 학년, 학습 목표</li>
              </ul>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-gray-800 mb-2">서비스 이용 과정에서 자동 수집되는 정보:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                <li>접속 로그, IP주소, 쿠키, 서비스 이용 기록</li>
                <li>학습 진도, 퀴즈 응시 기록, 단어장 데이터</li>
                <li>기기 정보 (OS, 브라우저 종류)</li>
              </ul>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-gray-800 mb-2">결제 시:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                <li>신용카드 정보는 결제대행사(Stripe)에서 암호화하여 관리하며, 회사는 저장하지 않습니다</li>
                <li>결제 내역, 구독 정보</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">나. 개인정보 수집방법</h3>
            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
              <li>회원가입 및 서비스 이용 과정에서 이용자가 직접 입력</li>
              <li>서비스 이용 과정에서 자동 수집</li>
              <li>고객센터를 통한 상담 과정에서 수집</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 개인정보의 수집 및 이용목적</h2>

            <div className="mb-4">
              <p className="font-semibold text-gray-800 mb-2">가. 회원 관리</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                <li>회원제 서비스 제공, 개인 식별, 회원자격 유지·관리</li>
                <li>부정 이용 방지, 비인가 사용 방지</li>
                <li>가입 의사 확인, 분쟁 조정을 위한 기록 보존</li>
                <li>불만처리 등 민원처리, 고지사항 전달</li>
              </ul>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-gray-800 mb-2">나. 서비스 제공</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                <li>학습 콘텐츠 제공 및 맞춤형 서비스 제공</li>
                <li>학습 진도 관리 및 통계 제공</li>
                <li>구독 서비스 제공 및 관리</li>
              </ul>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-gray-800 mb-2">다. 결제 및 환불</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                <li>유료 서비스 이용에 대한 요금 결제</li>
                <li>구매 및 요금 결제, 요금 추심</li>
              </ul>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-gray-800 mb-2">라. 마케팅 및 광고 활용</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                <li>신규 서비스 개발 및 맞춤 서비스 제공</li>
                <li>이벤트 및 광고성 정보 제공 및 참여기회 제공</li>
                <li>서비스 이용에 대한 통계</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 개인정보의 보유 및 이용기간</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
              단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.
            </p>

            <div className="mb-4">
              <p className="font-semibold text-gray-800 mb-2">가. 회사 내부 방침에 의한 정보보유 사유</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                <li>부정이용기록: 보존 이유 - 부정 이용 방지 / 보존 기간 - 1년</li>
              </ul>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-gray-800 mb-2">나. 관련법령에 의한 정보보유 사유</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
                <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
                <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
                <li>표시/광고에 관한 기록: 6개월 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
                <li>웹사이트 방문기록: 3개월 (통신비밀보호법)</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 개인정보의 파기절차 및 방법</h2>

            <div className="mb-4">
              <p className="font-semibold text-gray-800 mb-2">가. 파기절차</p>
              <p className="text-gray-700 leading-relaxed ml-4">
                이용자가 회원가입 등을 위해 입력한 정보는 목적이 달성된 후 별도의 DB로 옮겨져
                내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라 일정 기간 저장된 후 파기됩니다.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-gray-800 mb-2">나. 파기방법</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                <li>전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
                <li>종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 개인정보 제3자 제공</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
              다만, 아래의 경우에는 예외로 합니다:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 개인정보 처리위탁</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              회사는 서비스 향상을 위해서 아래와 같이 개인정보를 위탁하고 있으며,
              관계 법령에 따라 위탁계약 시 개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정하고 있습니다.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 px-3">수탁업체</th>
                    <th className="text-left py-2 px-3">위탁업무 내용</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3">Stripe</td>
                    <td className="py-2 px-3">결제 처리 및 관리</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3">AWS / Google Cloud</td>
                    <td className="py-2 px-3">서버 호스팅 및 데이터 저장</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">이메일 발송 서비스</td>
                    <td className="py-2 px-3">이메일 발송 대행</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. 이용자의 권리와 행사방법</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              이용자는 언제든지 다음과 같은 개인정보 보호 관련 권리를 행사할 수 있습니다:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4 ml-4">
              권리 행사는 프로필 설정 페이지 또는 고객센터를 통해 할 수 있으며,
              회사는 지체 없이 조치하겠습니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. 개인정보 자동 수집 장치의 설치·운영 및 거부</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용 정보를 저장하고 수시로 불러오는
              '쿠키(cookie)'를 사용합니다.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              쿠키는 웹사이트를 운영하는데 이용되는 서버가 이용자의 컴퓨터 브라우저에게 보내는
              소량의 정보이며 이용자의 PC 컴퓨터 하드디스크에 저장되기도 합니다.
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
              <li>쿠키 설정 거부 방법: 웹브라우저 옵션 설정을 통해 쿠키 허용/차단 가능</li>
              <li>단, 쿠키 저장을 거부할 경우 맞춤형 서비스 이용에 어려움이 발생할 수 있습니다</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. 개인정보 보호책임자</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한
              이용자의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700"><strong>개인정보 보호책임자</strong></p>
              <p className="text-gray-700">이메일: privacy@yourplatform.com</p>
              <p className="text-gray-700">전화번호: 02-1234-5678</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. 개인정보 처리방침 변경</h2>
            <p className="text-gray-700 leading-relaxed">
              이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는
              변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>

          <section className="mb-8 pb-8 border-b border-gray-200">
            <p className="text-gray-600 text-sm">
              시행일자: 2025년 1월 1일
            </p>
          </section>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-sm text-blue-900">
              개인정보 보호에 대한 문의사항이 있으시면 개인정보 보호책임자에게 연락해 주시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
