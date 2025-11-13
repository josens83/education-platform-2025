export default function BooksPage() {
  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">책 목록</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow hover:shadow-lg transition">
            <div className="h-48 bg-gray-200 rounded-t-xl"></div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">책 제목 {i}</h3>
              <p className="text-gray-600 text-sm">저자명</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
