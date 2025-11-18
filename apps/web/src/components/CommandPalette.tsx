import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiBook,
  FiHome,
  FiUser,
  FiSettings,
  FiLogOut,
  FiBookmark,
  FiFileText,
  FiMessageCircle,
  FiTrendingUp,
  FiCommand,
} from 'react-icons/fi';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import { useAuthStore } from '../store/authStore';

/**
 * Command Palette Component
 *
 * Linear/Vercel 스타일의 Command Palette (Cmd+K)
 */

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
  category?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const inputRef = useRef<HTMLInputElement>(null);

  // 모든 명령어 정의
  const allCommands: Command[] = [
    // 네비게이션
    {
      id: 'nav-home',
      label: '홈으로 이동',
      icon: <FiHome className="w-5 h-5" />,
      action: () => {
        navigate('/');
        onClose();
      },
      keywords: ['home', '홈', 'main'],
      category: '네비게이션',
    },
    {
      id: 'nav-books',
      label: '책 목록',
      icon: <FiBook className="w-5 h-5" />,
      action: () => {
        navigate('/books');
        onClose();
      },
      keywords: ['books', '책', 'library', '도서관'],
      category: '네비게이션',
    },
    {
      id: 'nav-dashboard',
      label: '대시보드',
      icon: <FiTrendingUp className="w-5 h-5" />,
      action: () => {
        navigate('/dashboard');
        onClose();
      },
      keywords: ['dashboard', '대시보드', 'stats', '통계'],
      category: '네비게이션',
    },
    {
      id: 'nav-vocabulary',
      label: '단어장',
      icon: <FiBookmark className="w-5 h-5" />,
      action: () => {
        navigate('/vocabulary');
        onClose();
      },
      keywords: ['vocabulary', '단어장', 'words', '단어'],
      category: '네비게이션',
    },
    {
      id: 'nav-notes',
      label: '노트',
      icon: <FiFileText className="w-5 h-5" />,
      action: () => {
        navigate('/notes');
        onClose();
      },
      keywords: ['notes', '노트', 'memo', '메모'],
      category: '네비게이션',
    },

    // 설정
    {
      id: 'settings-profile',
      label: '프로필 설정',
      icon: <FiUser className="w-5 h-5" />,
      action: () => {
        navigate('/profile');
        onClose();
      },
      keywords: ['profile', '프로필', 'account', '계정'],
      category: '설정',
    },
    {
      id: 'settings-general',
      label: '설정',
      icon: <FiSettings className="w-5 h-5" />,
      action: () => {
        navigate('/settings');
        onClose();
      },
      keywords: ['settings', '설정', 'preferences'],
      category: '설정',
    },

    // AI
    {
      id: 'ai-chat',
      label: 'AI 챗봇 열기',
      icon: <FiMessageCircle className="w-5 h-5" />,
      action: () => {
        // AI 챗봇 열기 액션 (실제 구현 필요)
        onClose();
      },
      keywords: ['ai', 'chatbot', '챗봇', 'assistant', '어시스턴트'],
      category: 'AI',
    },

    // 계정
    {
      id: 'account-logout',
      label: '로그아웃',
      icon: <FiLogOut className="w-5 h-5" />,
      action: () => {
        logout();
        navigate('/login');
        onClose();
      },
      keywords: ['logout', '로그아웃', 'signout'],
      category: '계정',
    },
  ];

  // 검색 필터링
  const filteredCommands = query
    ? allCommands.filter((cmd) => {
        const searchTerm = query.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(searchTerm) ||
          cmd.keywords?.some((kw) => kw.toLowerCase().includes(searchTerm))
        );
      })
    : allCommands;

  // 카테고리별 그룹화
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    const category = cmd.category || '기타';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  // 키보드 네비게이션
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-[20vh] px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Command Palette */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <FiSearch className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="검색하거나 명령어 입력..."
              className="flex-1 bg-transparent text-text-primary placeholder-gray-400 outline-none text-lg"
            />
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-500 dark:text-gray-400">
              <FiCommand className="w-3 h-3" />
              <span>K</span>
            </div>
          </div>

          {/* Commands List */}
          <div className="max-h-[60vh] overflow-y-auto">
            {Object.keys(groupedCommands).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FiSearch className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>검색 결과가 없습니다</p>
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, commands]) => (
                <div key={category}>
                  {/* Category Header */}
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50">
                    {category}
                  </div>

                  {/* Commands */}
                  {commands.map((cmd, index) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <motion.button
                        key={cmd.id}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isSelected
                            ? 'bg-primary-500 text-white'
                            : 'text-text-primary hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.1 }}
                      >
                        <div
                          className={
                            isSelected ? 'text-white' : 'text-gray-400'
                          }
                        >
                          {cmd.icon}
                        </div>
                        <span className="flex-1 font-medium">{cmd.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                  ↑↓
                </kbd>
                <span>이동</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                  Enter
                </kbd>
                <span>선택</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                  Esc
                </kbd>
                <span>닫기</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/**
 * Command Palette Hook
 *
 * Cmd+K 단축키로 팔레트 열기
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useKeyboardShortcut(
    { key: 'k', ctrlKey: true },
    () => {
      setIsOpen(true);
    },
    { preventDefault: true }
  );

  useKeyboardShortcut(
    { key: 'k', metaKey: true },
    () => {
      setIsOpen(true);
    },
    { preventDefault: true }
  );

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return { isOpen, open, close, toggle };
}
