import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import AudioPlayer from '../components/AudioPlayer';
import HighlightMenu from '../components/HighlightMenu';
import BookmarksPanel from '../components/BookmarksPanel';
import NoteModal from '../components/NoteModal';
import VocabularyModal from '../components/VocabularyModal';

/**
 * 챕터 읽기 페이지
 * - 챕터 내용 표시
 * - 학습 진도 자동 저장
 * - 오디오 플레이어
 */
export default function ReaderPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const id = parseInt(chapterId || '0');
  const [hasStarted, setHasStarted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // 북마크 & 노트 상태
  const [showBookmarksPanel, setShowBookmarksPanel] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showVocabularyModal, setShowVocabularyModal] = useState(false);

  const { data, isLoading, error } = useQuery(
    ['chapter', id],
    () => api.getChapter(id),
    { enabled: !!id }
  );

  const chapter = data?.chapter;

  // 챕터의 오디오 파일 조회
  const { data: audio } = useQuery(
    ['chapterAudio', id],
    () => api.getChapterAudio(id),
    { enabled: !!id }
  );

  // 챕터의 퀴즈 목록 조회
  const { data: quizzes } = useQuery(
    ['chapterQuizzes', id],
    () => api.getChapterQuizzes(id),
    { enabled: !!id }
  );

  // 진도 저장 mutation
  const saveProgressMutation = useMutation(
    (progressData: { chapter_id: number; progress_percentage: number; time_spent_seconds?: number }) =>
      api.updateProgress(progressData),
    {
      onError: (error: any) => {
        console.error('Failed to save progress:', error);
      },
    }
  );

  // 챕터 시작 시 진도 저장
  useEffect(() => {
    if (chapter && !hasStarted) {
      saveProgressMutation.mutate({
        chapter_id: chapter.id,
        progress_percentage: 0,
        time_spent_seconds: 0,
      });
      setHasStarted(true);
    }
  }, [chapter, hasStarted]);

  // 챕터 완료 처리
  const handleComplete = () => {
    if (chapter) {
      saveProgressMutation.mutate(
        {
          chapter_id: chapter.id,
          progress_percentage: 100,
        },
        {
          onSuccess: () => {
            toast.success('챕터를 완료했습니다! 🎉');
            // 책 상세 페이지로 이동
            navigate(`/books/${chapter.book_id}`);
          },
        }
      );
    }
  };

  // 텍스트 선택 처리
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setMenuPosition(null);
        setSelectedText('');
        setSelectionRange(null);
        return;
      }

      const text = selection.toString().trim();
      if (text && contentRef.current?.contains(selection.anchorNode)) {
        setSelectedText(text);
        const range = selection.getRangeAt(0);
        setSelectionRange(range);

        // 선택 영역의 위치 계산
        const rect = range.getBoundingClientRect();
        setMenuPosition({
          x: rect.left + rect.width / 2 - 100, // 메뉴 중앙 정렬
          y: rect.top - 50, // 선택 영역 위에 표시
        });
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('touchend', handleSelection);
    };
  }, []);

  // 북마크 생성 mutation
  const createBookmarkMutation = useMutation(
    (data: { chapter_id: number; position: string; highlighted_text?: string; color?: string }) =>
      api.createBookmark(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bookmarks', id]);
        toast.success('하이라이트가 추가되었습니다!');
        clearSelection();
      },
      onError: () => {
        toast.error('하이라이트 추가에 실패했습니다');
      },
    }
  );

  // 노트 생성 mutation
  const createNoteMutation = useMutation(
    (data: { chapter_id: number; position?: string; content: string; tags?: string }) =>
      api.createNote(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notes', id]);
        toast.success('노트가 추가되었습니다!');
        setShowNoteModal(false);
        clearSelection();
      },
      onError: () => {
        toast.error('노트 추가에 실패했습니다');
      },
    }
  );

  const clearSelection = () => {
    window.getSelection()?.removeAllRanges();
    setMenuPosition(null);
    setSelectedText('');
    setSelectionRange(null);
  };

  const handleHighlight = (color: string) => {
    if (!chapter || !selectedText) return;

    createBookmarkMutation.mutate({
      chapter_id: chapter.id,
      position: `${Date.now()}`, // 간단한 위치 ID (실제로는 더 정교한 방법 필요)
      highlighted_text: selectedText,
      color,
    });
  };

  const handleAddNote = () => {
    setShowNoteModal(true);
    setMenuPosition(null);
  };

  const handleSaveNote = (content: string, tags?: string) => {
    if (!chapter) return;

    createNoteMutation.mutate({
      chapter_id: chapter.id,
      position: `${Date.now()}`,
      content,
      tags,
    });
  };

  const handleAddToVocabulary = () => {
    setShowVocabularyModal(true);
    setMenuPosition(null);
  };

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
          <div className="flex items-center gap-4">
            {chapter.estimated_minutes && (
              <span className="text-sm text-gray-500">
                ⏱️ {chapter.estimated_minutes}분
              </span>
            )}
            <button
              onClick={() => setShowBookmarksPanel(!showBookmarksPanel)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              📑 북마크 & 노트
            </button>
          </div>
        </div>
      </div>

      {/* 챕터 내용 */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          {/* HTML 콘텐츠 렌더링 */}
          {chapter.content && (
            <div
              ref={contentRef}
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

          {/* 완료 버튼 */}
          <div className="mt-8 pt-8 border-t border-gray-200 flex items-center justify-between">
            <Link
              to={`/books/${chapter.book_id}`}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 책으로 돌아가기
            </Link>
            <button
              onClick={handleComplete}
              disabled={saveProgressMutation.isLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
            >
              {saveProgressMutation.isLoading ? '저장 중...' : '✓ 챕터 완료'}
            </button>
          </div>
        </div>

        {/* 퀴즈 섹션 */}
        {quizzes && quizzes.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-xl mb-4">📝 이 챕터의 퀴즈</h3>
            <p className="text-gray-600 mb-4">
              챕터 내용을 이해했는지 퀴즈로 확인해보세요!
            </p>
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <Link
                  key={quiz.id}
                  to={`/quiz/${quiz.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">
                        {quiz.title}
                      </h4>
                      {quiz.description && (
                        <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>난이도: {quiz.difficulty_level}</span>
                        <span>합격 점수: {quiz.passing_score}%</span>
                        {quiz.time_limit_minutes && (
                          <span>제한시간: {quiz.time_limit_minutes}분</span>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-400 group-hover:text-primary-600 transition">
                      →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 오디오 플레이어 */}
        {audio && (
          <div className="mt-6">
            <AudioPlayer
              audio={audio}
              chapterId={id}
              onProgressSave={(position) => {
                api.saveAudioProgress(id, position).catch((err) => {
                  console.error('Failed to save audio progress:', err);
                });
              }}
              initialPosition={0}
            />
          </div>
        )}
      </div>

      {/* 하이라이트 메뉴 */}
      {menuPosition && (
        <HighlightMenu
          position={menuPosition}
          onHighlight={handleHighlight}
          onNote={handleAddNote}
          onAddToVocabulary={handleAddToVocabulary}
        />
      )}

      {/* 북마크 & 노트 패널 */}
      {showBookmarksPanel && (
        <BookmarksPanel chapterId={id} onClose={() => setShowBookmarksPanel(false)} />
      )}

      {/* 노트 작성 모달 */}
      {showNoteModal && (
        <NoteModal
          selectedText={selectedText}
          onSave={handleSaveNote}
          onCancel={() => {
            setShowNoteModal(false);
            clearSelection();
          }}
        />
      )}

      {/* 단어장 추가 모달 */}
      {showVocabularyModal && (
        <VocabularyModal
          initialWord={selectedText}
          chapterId={id}
          onClose={() => {
            setShowVocabularyModal(false);
            clearSelection();
          }}
          onSuccess={() => {
            queryClient.invalidateQueries('vocabulary');
            setShowVocabularyModal(false);
            clearSelection();
          }}
        />
      )}
    </div>
  );
}
