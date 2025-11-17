import { useState } from 'react';
import { useMutation } from 'react-query';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { VocabularyItem } from '@education-platform/api-client';

interface VocabularyModalProps {
  word?: VocabularyItem;
  initialWord?: string;
  chapterId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 단어 추가/수정 모달
 */
export default function VocabularyModal({
  word,
  initialWord = '',
  chapterId,
  onClose,
  onSuccess,
}: VocabularyModalProps) {
  const [formData, setFormData] = useState({
    word: word?.word || initialWord,
    definition: word?.definition || '',
    example_sentence: word?.example_sentence || '',
  });

  // 단어 추가
  const addWordMutation = useMutation(
    (data: {
      word: string;
      definition?: string;
      example_sentence?: string;
      chapter_id?: number;
    }) => api.addVocabulary(data),
    {
      onSuccess: () => {
        toast.success('단어가 추가되었습니다!');
        onSuccess();
      },
      onError: () => {
        toast.error('단어 추가에 실패했습니다');
      },
    }
  );

  // 단어 수정
  const updateWordMutation = useMutation(
    (data: { word?: string; definition?: string; example_sentence?: string }) =>
      api.updateVocabulary(word!.id, data),
    {
      onSuccess: () => {
        toast.success('단어가 수정되었습니다!');
        onSuccess();
      },
      onError: () => {
        toast.error('단어 수정에 실패했습니다');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.word.trim()) {
      toast.error('단어를 입력해주세요');
      return;
    }

    if (word) {
      // 수정
      updateWordMutation.mutate({
        word: formData.word.trim(),
        definition: formData.definition.trim() || undefined,
        example_sentence: formData.example_sentence.trim() || undefined,
      });
    } else {
      // 추가
      addWordMutation.mutate({
        word: formData.word.trim(),
        definition: formData.definition.trim() || undefined,
        example_sentence: formData.example_sentence.trim() || undefined,
        chapter_id: chapterId,
      });
    }
  };

  const isLoading = addWordMutation.isLoading || updateWordMutation.isLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold">
            {word ? '단어 수정' : '단어 추가'}
          </h3>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 단어 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              단어 *
            </label>
            <input
              type="text"
              value={formData.word}
              onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              placeholder="예: vocabulary"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg font-semibold"
              autoFocus
              required
            />
          </div>

          {/* 뜻 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              뜻 (선택사항)
            </label>
            <input
              type="text"
              value={formData.definition}
              onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
              placeholder="예: 어휘, 단어"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* 예문 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              예문 (선택사항)
            </label>
            <textarea
              value={formData.example_sentence}
              onChange={(e) =>
                setFormData({ ...formData, example_sentence: e.target.value })
              }
              placeholder="예: Building a good vocabulary is essential for learning English."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* 버튼 */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '저장 중...' : word ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
