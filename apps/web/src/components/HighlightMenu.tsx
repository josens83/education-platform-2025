import { useState } from 'react';

interface HighlightMenuProps {
  onHighlight: (color: string) => void;
  onNote: () => void;
  onAddToVocabulary: () => void;
  position: { x: number; y: number };
}

const COLORS = [
  { name: 'yellow', bg: 'bg-yellow-200', label: '노란색' },
  { name: 'green', bg: 'bg-green-200', label: '초록색' },
  { name: 'blue', bg: 'bg-blue-200', label: '파란색' },
  { name: 'pink', bg: 'bg-pink-200', label: '분홍색' },
];

/**
 * 텍스트 선택 시 나타나는 하이라이트 메뉴
 */
export default function HighlightMenu({ onHighlight, onNote, onAddToVocabulary, position }: HighlightMenuProps) {
  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="flex items-center gap-2">
        {/* 하이라이트 색상 선택 */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => onHighlight(color.name)}
              className={`w-8 h-8 rounded ${color.bg} hover:ring-2 hover:ring-gray-400 transition`}
              title={`${color.label} 하이라이트`}
            />
          ))}
        </div>

        {/* 노트 추가 버튼 */}
        <button
          onClick={onNote}
          className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition"
          title="노트 추가"
        >
          📝 노트
        </button>

        {/* 단어장에 추가 버튼 */}
        <button
          onClick={onAddToVocabulary}
          className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition"
          title="단어장에 추가"
        >
          📚 단어장
        </button>
      </div>
    </div>
  );
}
