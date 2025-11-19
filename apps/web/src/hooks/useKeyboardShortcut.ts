import { useEffect, useRef, useCallback } from 'react';

/**
 * Keyboard Shortcut Hook
 *
 * 키보드 단축키를 쉽게 등록하고 관리하는 훅
 *
 * @example
 * useKeyboardShortcut({ key: 'k', ctrlKey: true }, () => {
 *   openCommandPalette();
 * });
 */

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  code?: string; // KeyboardEvent.code for special keys
}

interface UseKeyboardShortcutOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export function useKeyboardShortcut(
  shortcut: KeyboardShortcut,
  callback: (event: KeyboardEvent) => void,
  options: UseKeyboardShortcutOptions = {}
) {
  const {
    enabled = true,
    preventDefault = true,
    stopPropagation = false,
  } = options;

  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      // Input/Textarea에서는 단축키 비활성화 (Cmd/Ctrl+키는 예외)
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isInput && !shortcut.metaKey && !shortcut.ctrlKey) {
        return;
      }

      // 단축키 매칭 확인
      const matches =
        (shortcut.key ? event.key.toLowerCase() === shortcut.key.toLowerCase() : true) &&
        (shortcut.code ? event.code === shortcut.code : true) &&
        !!event.ctrlKey === !!shortcut.ctrlKey &&
        !!event.metaKey === !!shortcut.metaKey &&
        !!event.shiftKey === !!shortcut.shiftKey &&
        !!event.altKey === !!shortcut.altKey;

      if (matches) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        callbackRef.current(event);
      }
    };

    document.addEventListener('keydown', handler);

    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [
    enabled,
    preventDefault,
    stopPropagation,
    shortcut.key,
    shortcut.code,
    shortcut.ctrlKey,
    shortcut.metaKey,
    shortcut.shiftKey,
    shortcut.altKey,
  ]);
}

/**
 * Multiple Keyboard Shortcuts Hook
 *
 * 여러 단축키를 한 번에 등록
 */
export function useKeyboardShortcuts(
  shortcuts: Array<{
    shortcut: KeyboardShortcut;
    callback: (event: KeyboardEvent) => void;
    options?: UseKeyboardShortcutOptions;
  }>
) {
  shortcuts.forEach(({ shortcut, callback, options }) => {
    useKeyboardShortcut(shortcut, callback, options);
  });
}

/**
 * Get platform-specific modifier key name
 */
export function getModifierKey(): 'Cmd' | 'Ctrl' {
  return navigator.platform.toLowerCase().includes('mac') ? 'Cmd' : 'Ctrl';
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrlKey || shortcut.metaKey) {
    parts.push(getModifierKey());
  }
  if (shortcut.shiftKey) {
    parts.push('Shift');
  }
  if (shortcut.altKey) {
    parts.push('Alt');
  }
  if (shortcut.key) {
    parts.push(shortcut.key.toUpperCase());
  }

  return parts.join(' + ');
}

/**
 * Check if modifier key is pressed
 */
export function isModifierPressed(event: KeyboardEvent | MouseEvent): boolean {
  return event.ctrlKey || event.metaKey;
}
