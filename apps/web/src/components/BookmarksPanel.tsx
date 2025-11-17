import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { Bookmark, Note } from '@education-platform/api-client';

interface BookmarksPanelProps {
  chapterId: number;
  onClose: () => void;
}

/**
 * 북마크 및 노트를 표시하는 사이드 패널
 */
export default function BookmarksPanel({ chapterId, onClose }: BookmarksPanelProps) {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'notes'>('bookmarks');
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const queryClient = useQueryClient();

  // 북마크 조회
  const { data: bookmarks = [], isLoading: loadingBookmarks } = useQuery(
    ['bookmarks', chapterId],
    () => api.getMyBookmarks(chapterId)
  );

  // 노트 조회
  const { data: notes = [], isLoading: loadingNotes } = useQuery(
    ['notes', chapterId],
    () => api.getMyNotes(chapterId)
  );

  // 북마크 삭제
  const deleteBookmarkMutation = useMutation(
    (id: number) => api.deleteBookmark(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bookmarks', chapterId]);
        toast.success('북마크가 삭제되었습니다');
      },
      onError: () => {
        toast.error('북마크 삭제에 실패했습니다');
      },
    }
  );

  // 노트 삭제
  const deleteNoteMutation = useMutation(
    (id: number) => api.deleteNote(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notes', chapterId]);
        toast.success('노트가 삭제되었습니다');
      },
      onError: () => {
        toast.error('노트 삭제에 실패했습니다');
      },
    }
  );

  // 노트 수정
  const updateNoteMutation = useMutation(
    ({ id, content }: { id: number; content: string }) => api.updateNote(id, { content }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notes', chapterId]);
        setEditingNote(null);
        toast.success('노트가 수정되었습니다');
      },
      onError: () => {
        toast.error('노트 수정에 실패했습니다');
      },
    }
  );

  const handleEditNote = (note: Note) => {
    setEditingNote(note.id);
    setEditContent(note.content);
  };

  const handleSaveNote = (id: number) => {
    updateNoteMutation.mutate({ id, content: editContent });
  };

  const getColorClass = (color?: string) => {
    switch (color) {
      case 'yellow':
        return 'bg-yellow-100 border-yellow-300';
      case 'green':
        return 'bg-green-100 border-green-300';
      case 'blue':
        return 'bg-blue-100 border-blue-300';
      case 'pink':
        return 'bg-pink-100 border-pink-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-40 flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-lg">내 북마크 & 노트</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 py-3 font-medium transition ${
            activeTab === 'bookmarks'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          북마크 ({bookmarks.length})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-3 font-medium transition ${
            activeTab === 'notes'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          노트 ({notes.length})
        </button>
      </div>

      {/* 내용 */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'bookmarks' ? (
          <div className="space-y-3">
            {loadingBookmarks ? (
              <div className="text-center py-8 text-gray-500">로딩 중...</div>
            ) : bookmarks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                아직 북마크가 없습니다.
                <br />
                텍스트를 선택하여 하이라이트를 추가해보세요!
              </div>
            ) : (
              bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className={`p-3 rounded-lg border ${getColorClass(bookmark.color)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-700 flex-1">
                      {bookmark.highlighted_text || '북마크'}
                    </p>
                    <button
                      onClick={() => deleteBookmarkMutation.mutate(bookmark.id)}
                      className="text-gray-400 hover:text-red-600 transition"
                      disabled={deleteBookmarkMutation.isLoading}
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(bookmark.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {loadingNotes ? (
              <div className="text-center py-8 text-gray-500">로딩 중...</div>
            ) : notes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                아직 노트가 없습니다.
                <br />
                텍스트를 선택하여 노트를 추가해보세요!
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {editingNote === note.id ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        rows={3}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSaveNote(note.id)}
                          className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
                          disabled={updateNoteMutation.isLoading}
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditingNote(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                      {note.tags && (
                        <p className="text-xs text-gray-500 mt-2">🏷️ {note.tags}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {new Date(note.created_at).toLocaleDateString('ko-KR')}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditNote(note)}
                            className="text-xs text-primary-600 hover:underline"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => deleteNoteMutation.mutate(note.id)}
                            className="text-xs text-red-600 hover:underline"
                            disabled={deleteNoteMutation.isLoading}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
