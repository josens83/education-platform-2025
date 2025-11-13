export default function ReaderPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6">챕터 제목</h1>
          <div className="prose max-w-none">
            <p className="mb-4">
              이곳에 챕터 내용이 표시됩니다. 텍스트와 오디오를 동기화하여 재생할 수 있습니다.
            </p>
            <p className="mb-4">
              문장별로 하이라이팅되며 사용자는 읽으면서 듣기 학습을 할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
