export default function BookDetailPage() {
  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 bg-gray-200 h-96"></div>
            <div className="p-8 md:w-2/3">
              <h1 className="text-3xl font-bold mb-4">책 제목</h1>
              <p className="text-gray-600 mb-4">저자명</p>
              <p className="text-gray-700 mb-6">책 설명이 여기에 표시됩니다...</p>
              <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                읽기 시작
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
