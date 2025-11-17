import { useState } from 'react';

interface NoteModalProps {
  selectedText: string;
  onSave: (content: string, tags?: string) => void;
  onCancel: () => void;
}

/**
 * 노트 작성 모달
 */
export default function NoteModal({ selectedText, onSave, onCancel }: NoteModalProps) {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim(), tags.trim() || undefined);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold">노트 작성</h3>
        </div>

        {/* 선택된 텍스트 */}
        {selectedText && (
          <div className="px-6 pt-4">
            <p className="text-sm text-gray-500 mb-2">선택된 텍스트:</p>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700 italic">"{selectedText}"</p>
            </div>
          </div>
        )}

        {/* 내용 */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              노트 내용 *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="이 부분에 대한 메모를 작성하세요..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={6}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              태그 (선택사항)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="예: 중요, 복습 필요, 문법"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              여러 태그는 쉼표로 구분하세요
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
