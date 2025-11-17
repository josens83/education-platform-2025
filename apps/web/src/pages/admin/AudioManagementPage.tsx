import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

interface Book {
  id: number;
  title: string;
}

interface Chapter {
  id: number;
  book_id: number;
  chapter_number: number;
  title: string;
}

interface AudioFile {
  id: number;
  chapter_id: number;
  file_url: string;
  duration_seconds: number;
  file_size_bytes: number;
  audio_type: string;
  transcript: string | null;
  created_at: string;
}

/**
 * 오디오 관리 페이지
 * - 챕터별 오디오 파일 업로드
 * - 드래그 앤 드롭 지원
 * - 오디오 파일 목록 및 삭제
 */
export default function AudioManagementPage() {
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [isUploadFormOpen, setIsUploadFormOpen] = useState(false);
  const queryClient = useQueryClient();

  // 책 목록 조회
  const { data: books } = useQuery('admin-all-books', async () => {
    return await api.getBooks();
  });

  // 선택된 책의 챕터 목록 조회
  const { data: chapters } = useQuery(
    ['admin-chapters', selectedBookId],
    async () => {
      if (!selectedBookId) return [];
      return await api.getBookChapters(selectedBookId);
    },
    {
      enabled: !!selectedBookId,
    }
  );

  // 선택된 챕터의 오디오 파일 조회
  const { data: audioFile, isLoading: audioLoading } = useQuery(
    ['chapter-audio', selectedChapterId],
    async () => {
      if (!selectedChapterId) return null;
      return await api.getChapterAudio(selectedChapterId);
    },
    {
      enabled: !!selectedChapterId,
    }
  );

  const selectedBook = books?.find((b: Book) => b.id === selectedBookId);
  const selectedChapter = chapters?.find((c: Chapter) => c.id === selectedChapterId);

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">오디오 관리</h1>
        <p className="text-gray-600 mt-2">챕터별 오디오 파일을 업로드하고 관리합니다</p>
      </div>

      {/* 책 & 챕터 선택 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            1. 책 선택
          </label>
          <select
            value={selectedBookId || ''}
            onChange={(e) => {
              setSelectedBookId(Number(e.target.value) || null);
              setSelectedChapterId(null); // 책이 변경되면 챕터 초기화
            }}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">책을 선택하세요</option>
            {books?.map((book: Book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>

        {selectedBookId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2. 챕터 선택
            </label>
            <select
              value={selectedChapterId || ''}
              onChange={(e) => setSelectedChapterId(Number(e.target.value) || null)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">챕터를 선택하세요</option>
              {chapters?.map((chapter: Chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  Chapter {chapter.chapter_number}: {chapter.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 선택된 챕터가 있을 때만 오디오 관리 UI 표시 */}
      {selectedChapterId && (
        <>
          {/* 현재 오디오 파일 상태 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              현재 오디오 파일
            </h2>

            {audioLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : audioFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">🎵</div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {audioFile.file_url.split('/').pop()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {Math.floor(audioFile.duration_seconds / 60)}분 {audioFile.duration_seconds % 60}초
                        {' · '}
                        {(audioFile.file_size_bytes / (1024 * 1024)).toFixed(2)} MB
                        {' · '}
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          audioFile.audio_type === 'professional'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {audioFile.audio_type === 'professional' ? '전문 녹음' : 'AI TTS'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <audio controls src={audioFile.file_url} className="h-10" />
                    <DeleteAudioButton audioFileId={audioFile.id} chapterId={selectedChapterId} />
                  </div>
                </div>

                {audioFile.transcript && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">트랜스크립트</div>
                    <div className="p-3 bg-gray-50 rounded text-sm text-gray-800 whitespace-pre-wrap">
                      {audioFile.transcript}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎙️</div>
                <p className="text-gray-600 mb-4">
                  이 챕터에는 아직 오디오 파일이 없습니다
                </p>
                <button
                  onClick={() => setIsUploadFormOpen(true)}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  오디오 업로드
                </button>
              </div>
            )}

            {audioFile && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsUploadFormOpen(true)}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  새 오디오 파일로 교체
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* 선택된 챕터가 없을 때 */}
      {!selectedChapterId && selectedBookId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            챕터를 선택하세요
          </h3>
          <p className="text-gray-600">
            위에서 챕터를 선택하면 해당 챕터의 오디오를 관리할 수 있습니다
          </p>
        </div>
      )}

      {!selectedBookId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            책을 선택하세요
          </h3>
          <p className="text-gray-600">
            위에서 책을 선택한 후 챕터를 선택하여 오디오를 업로드할 수 있습니다
          </p>
        </div>
      )}

      {/* 오디오 업로드 모달 */}
      {isUploadFormOpen && selectedChapterId && selectedChapter && (
        <AudioUploadModal
          chapterId={selectedChapterId}
          chapterTitle={`Chapter ${selectedChapter.chapter_number}: ${selectedChapter.title}`}
          onClose={() => setIsUploadFormOpen(false)}
          onSuccess={() => {
            setIsUploadFormOpen(false);
            queryClient.invalidateQueries(['chapter-audio', selectedChapterId]);
          }}
        />
      )}
    </div>
  );
}

/**
 * 오디오 삭제 버튼
 */
function DeleteAudioButton({
  audioFileId,
  chapterId,
}: {
  audioFileId: number;
  chapterId: number;
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation(
    async () => {
      // DELETE 엔드포인트는 /api/audio/chapters/:chapterId/audio/:audioId
      const response = await api.client.delete(
        `/api/audio/chapters/${chapterId}/audio/${audioFileId}`
      );
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('오디오 파일이 삭제되었습니다');
        queryClient.invalidateQueries(['chapter-audio', chapterId]);
      },
      onError: () => {
        toast.error('오디오 파일 삭제에 실패했습니다');
      },
    }
  );

  const handleDelete = () => {
    if (confirm('정말로 이 오디오 파일을 삭제하시겠습니까?')) {
      deleteMutation.mutate();
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleteMutation.isLoading}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm"
    >
      {deleteMutation.isLoading ? '삭제 중...' : '삭제'}
    </button>
  );
}

/**
 * 오디오 업로드 모달
 */
function AudioUploadModal({
  chapterId,
  chapterTitle,
  onClose,
  onSuccess,
}: {
  chapterId: number;
  chapterTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioType, setAudioType] = useState<string>('professional');
  const [transcript, setTranscript] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useMutation(
    async () => {
      if (!selectedFile) throw new Error('파일을 선택해주세요');
      return await api.uploadAudio(chapterId, selectedFile, audioType);
    },
    {
      onSuccess: () => {
        toast.success('오디오 파일이 업로드되었습니다');
        onSuccess();
      },
      onError: (error: any) => {
        toast.error(error.message || '오디오 업로드에 실패했습니다');
      },
    }
  );

  const handleFileSelect = (file: File) => {
    // 파일 타입 검증
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
      toast.error('지원하는 오디오 형식: MP3, WAV, OGG, M4A, AAC');
      return;
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('파일 크기는 10MB 이하여야 합니다');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('파일을 선택해주세요');
      return;
    }
    uploadMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">오디오 파일 업로드</h2>
              <p className="text-sm text-gray-600 mt-1">{chapterTitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* 폼 내용 */}
          <div className="p-6 space-y-6">
            {/* 파일 드롭존 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                오디오 파일 *
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                  isDragging
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {selectedFile ? (
                  <div>
                    <div className="text-4xl mb-3">🎵</div>
                    <div className="font-medium text-gray-900">{selectedFile.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="mt-4 text-sm text-red-600 hover:text-red-800"
                    >
                      파일 제거
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-3">📁</div>
                    <p className="text-gray-600 mb-2">
                      파일을 여기에 드래그하거나 클릭하여 선택
                    </p>
                    <input
                      type="file"
                      accept=".mp3,.wav,.ogg,.m4a,.aac,audio/*"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                      id="audio-file-input"
                    />
                    <label
                      htmlFor="audio-file-input"
                      className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition"
                    >
                      파일 선택
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      지원 형식: MP3, WAV, OGG, M4A, AAC (최대 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 오디오 타입 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                오디오 타입 *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAudioType('professional')}
                  className={`p-4 border-2 rounded-lg transition ${
                    audioType === 'professional'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🎙️</div>
                  <div className="font-medium">전문 녹음</div>
                  <div className="text-xs text-gray-600 mt-1">
                    성우 또는 원어민 녹음
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setAudioType('ai_tts')}
                  className={`p-4 border-2 rounded-lg transition ${
                    audioType === 'ai_tts'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🤖</div>
                  <div className="font-medium">AI TTS</div>
                  <div className="text-xs text-gray-600 mt-1">
                    AI 음성 합성
                  </div>
                </button>
              </div>
            </div>

            {/* 트랜스크립트 (선택사항) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                트랜스크립트 (선택사항)
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="오디오의 텍스트 내용을 입력하세요..."
              />
              <p className="text-xs text-gray-500 mt-1">
                나중에 오디오-텍스트 동기화 기능에 사용됩니다
              </p>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!selectedFile || uploadMutation.isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {uploadMutation.isLoading ? '업로드 중...' : '업로드'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
