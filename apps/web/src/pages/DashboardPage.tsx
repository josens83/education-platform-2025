export default function DashboardPage() {
  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">대시보드</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-600 text-sm mb-2">학습 중인 책</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-600 text-sm mb-2">완료한 챕터</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-600 text-sm mb-2">학습 시간</h3>
          <p className="text-3xl font-bold">0분</p>
        </div>
      </div>
    </div>
  );
}
