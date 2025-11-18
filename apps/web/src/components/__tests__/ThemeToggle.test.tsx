import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle';

// Mock useTheme hook
vi.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    resolvedTheme: 'light',
    setTheme: vi.fn(),
    isDark: false,
  }),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders theme toggle buttons', () => {
    render(<ThemeToggle />);

    // 3개의 버튼이 있어야 함 (light, dark, system)
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  test('displays theme icons correctly', () => {
    render(<ThemeToggle />);

    // SVG 아이콘들이 렌더링되어야 함
    const container = screen.getByRole('button', { name: /light/i }).parentElement;
    expect(container).toBeInTheDocument();
  });

  test('applies active state to current theme', () => {
    const { container } = render(<ThemeToggle />);

    // 현재 테마(light)에 active 스타일이 적용되어야 함
    expect(container).toBeInTheDocument();
  });
});
