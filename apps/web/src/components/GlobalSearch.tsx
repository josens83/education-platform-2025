/**
 * Global Search Component
 *
 * Linear/Algolia style unified search
 * Searches across Books, Chapters, and Notes
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiX,
  FiBook,
  FiFileText,
  FiStickyNote,
  FiClock,
  FiTrendingUp,
  FiLoader,
} from 'react-icons/fi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import { debounce } from 'lodash';

/**
 * Search Result Types
 */
interface SearchResult {
  id: number;
  type: 'book' | 'chapter' | 'note';
  title: string;
  subtitle: string;
  description: string;
  url: string;
  relevance: number;
  imageUrl?: string;
}

interface SearchResults {
  books: SearchResult[];
  chapters: SearchResult[];
  notes: SearchResult[];
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    books: [],
    chapters: [],
    notes: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'books' | 'chapters' | 'notes'>('all');

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults({ books: [], chapters: [], notes: [] });
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (searchQuery: string, type: string) => {
      if (searchQuery.trim().length < 2) {
        setResults({ books: [], chapters: [], notes: [] });
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${apiUrl}/api/search`, {
          params: { q: searchQuery, type, limit: 20 },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status === 'success') {
          setResults(response.data.results);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [apiUrl]
  );

  // Handle search input change
  useEffect(() => {
    if (query.length >= 2) {
      setIsLoading(true);
      performSearch(query, activeTab);
    } else {
      setResults({ books: [], chapters: [], notes: [] });
    }
  }, [query, activeTab, performSearch]);

  // Get all results in flat array for keyboard navigation
  const allResults = [
    ...results.books,
    ...results.chapters,
    ...results.notes,
  ];

  // Handle keyboard navigation
  useKeyboardShortcut({ key: 'ArrowDown' }, (e) => {
    if (!isOpen) return;
    e.preventDefault();
    setSelectedIndex((prev) => Math.min(prev + 1, allResults.length - 1));
  });

  useKeyboardShortcut({ key: 'ArrowUp' }, (e) => {
    if (!isOpen) return;
    e.preventDefault();
    setSelectedIndex((prev) => Math.max(prev - 1, 0));
  });

  useKeyboardShortcut({ key: 'Enter' }, (e) => {
    if (!isOpen || allResults.length === 0) return;
    e.preventDefault();
    handleSelectResult(allResults[selectedIndex]);
  });

  useKeyboardShortcut({ key: 'Escape' }, () => {
    if (isOpen) onClose();
  });

  // Handle result selection
  const handleSelectResult = (result: SearchResult) => {
    navigate(result.url);
    onClose();
  };

  // Get result icon
  const getIcon = (type: string) => {
    switch (type) {
      case 'book':
        return <FiBook className="w-5 h-5 text-blue-500" />;
      case 'chapter':
        return <FiFileText className="w-5 h-5 text-green-500" />;
      case 'note':
        return <FiStickyNote className="w-5 h-5 text-yellow-500" />;
      default:
        return <FiSearch className="w-5 h-5 text-gray-500" />;
    }
  };

  // Render result item
  const renderResult = (result: SearchResult, index: number) => {
    const isSelected = index === selectedIndex;

    return (
      <motion.div
        key={`${result.type}-${result.id}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`px-4 py-3 cursor-pointer transition-colors ${
          isSelected
            ? 'bg-primary-50 dark:bg-primary-900/20'
            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
        onClick={() => handleSelectResult(result)}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">{getIcon(result.type)}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm text-text-primary truncate">
                {result.title}
              </h4>
              <span className="text-xs text-text-tertiary capitalize">
                {result.type}
              </span>
            </div>
            <p className="text-xs text-text-secondary mb-1">{result.subtitle}</p>
            {result.description && (
              <p className="text-xs text-text-tertiary line-clamp-2">
                {result.description}
              </p>
            )}
          </div>

          {/* Image (for books) */}
          {result.imageUrl && (
            <img
              src={result.imageUrl}
              alt={result.title}
              className="w-12 h-16 object-cover rounded"
            />
          )}
        </div>
      </motion.div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Search Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <FiLoader className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <FiSearch className="w-5 h-5 text-gray-400" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, chapters, notes..."
            className="flex-1 bg-transparent text-text-primary placeholder-text-tertiary focus:outline-none text-lg"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {['all', 'books', 'chapters', 'notes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-primary-500 text-white'
                  : 'text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {query.length < 2 ? (
            <div className="px-4 py-8 text-center">
              <FiSearch className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-text-secondary">
                Type at least 2 characters to search
              </p>
            </div>
          ) : allResults.length === 0 && !isLoading ? (
            <div className="px-4 py-8 text-center">
              <FiSearch className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-text-secondary">No results found for "{query}"</p>
            </div>
          ) : (
            <div>
              {/* Books */}
              {results.books.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                    Books ({results.books.length})
                  </div>
                  {results.books.map((result, index) =>
                    renderResult(result, index)
                  )}
                </div>
              )}

              {/* Chapters */}
              {results.chapters.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                    Chapters ({results.chapters.length})
                  </div>
                  {results.chapters.map((result, index) =>
                    renderResult(result, results.books.length + index)
                  )}
                </div>
              )}

              {/* Notes */}
              {results.notes.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                    Notes ({results.notes.length})
                  </div>
                  {results.notes.map((result, index) =>
                    renderResult(
                      result,
                      results.books.length + results.chapters.length + index
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between text-xs text-text-tertiary">
          <div className="flex gap-4">
            <span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded border">↑↓</kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded border">↵</kbd>{' '}
              Select
            </span>
            <span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded border">esc</kbd>{' '}
              Close
            </span>
          </div>
          <span>{allResults.length} results</span>
        </div>
      </motion.div>
    </>
  );
}

/**
 * Hook for Global Search
 */
export function useGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);

  // Cmd+K or Ctrl+K to open
  useKeyboardShortcut({ key: 'k', metaKey: true }, (e) => {
    e.preventDefault();
    setIsOpen(true);
  });

  useKeyboardShortcut({ key: 'k', ctrlKey: true }, (e) => {
    e.preventDefault();
    setIsOpen(true);
  });

  // Cmd+/ or Ctrl+/ to open
  useKeyboardShortcut({ key: '/', metaKey: true }, (e) => {
    e.preventDefault();
    setIsOpen(true);
  });

  useKeyboardShortcut({ key: '/', ctrlKey: true }, (e) => {
    e.preventDefault();
    setIsOpen(true);
  });

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
