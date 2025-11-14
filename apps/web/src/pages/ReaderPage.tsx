import { useQuery } from 'react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';

/**
 * 챕터 읽기 페이지
 * - 챕터 내용 표시
 * - 오디오 재생 (추후 구현)
 */
export default function ReaderPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const id = parseInt(chapterId || '0');

  const { data, isLoading, error } = useQuery(
    ['chapter', id],
    () => api.getChapter(id),
    { enabled: !!id }
  );

  const chapter = data?.chapter;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">챕터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <p className="text-red-600 mb-4">챕터를 불러올 수 없습니다.</p>
          <Link to="/books" className="text-primary-600 hover:underline">
            책 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={`/books/${chapter.book_id}`}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 뒤로
            </Link>
            <div>
              <p className="text-sm text-gray-500">{chapter.book_title}</p>
              <h1 className="font-semibold">
                Chapter {chapter.chapter_number}: {chapter.title}
              </h1>
            </div>
          </div>
          {chapter.estimated_minutes && (
            <span className="text-sm text-gray-500">
              ⏱️ {chapter.estimated_minutes}분
            </span>
          )}
        </div>
      </div>

      {/* 챕터 내용 */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          {/* HTML 콘텐츠 렌더링 */}
          {chapter.content && (
            <div
              className="prose prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-gray-900
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-6
                prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-6
                prose-li:text-gray-700 prose-li:mb-2
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-em:italic"
              dangerouslySetInnerHTML={{ __html: chapter.content }}
            />
          )}

          {/* 텍스트 콘텐츠 (fallback) */}
          {!chapter.content && chapter.content_text && (
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {chapter.content_text}
            </div>
          )}

          {/* 내용이 없는 경우 */}
          {!chapter.content && !chapter.content_text && (
            <p className="text-gray-500 text-center py-8">
              챕터 내용이 아직 준비되지 않았습니다.
            </p>
          )}
        </div>

        {/* 오디오 플레이어 (추후 구현) */}
        {data?.audio && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold mb-4">🎧 오디오</h3>
            <p className="text-sm text-gray-500">
              오디오 재생 기능은 추후 구현 예정입니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
