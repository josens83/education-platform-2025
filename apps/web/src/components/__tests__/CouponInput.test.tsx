/**
 * CouponInput Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CouponInput } from '../CouponInput';

describe('CouponInput', () => {
  it('should render coupon input field', () => {
    render(<CouponInput onApply={vi.fn()} />);

    const input = screen.getByPlaceholderText(/쿠폰 코드/i);
    expect(input).toBeInTheDocument();
  });

  it('should render apply button', () => {
    render(<CouponInput onApply={vi.fn()} />);

    const button = screen.getByRole('button', { name: /적용/i });
    expect(button).toBeInTheDocument();
  });

  it('should call onApply with coupon code', async () => {
    const handleApply = vi.fn();
    render(<CouponInput onApply={handleApply} />);

    const input = screen.getByPlaceholderText(/쿠폰 코드/i);
    const button = screen.getByRole('button', { name: /적용/i });

    await userEvent.type(input, 'TEST2025');
    fireEvent.click(button);

    await waitFor(() => {
      expect(handleApply).toHaveBeenCalledWith('TEST2025');
    });
  });

  it('should trim whitespace from coupon code', async () => {
    const handleApply = vi.fn();
    render(<CouponInput onApply={handleApply} />);

    const input = screen.getByPlaceholderText(/쿠폰 코드/i);
    const button = screen.getByRole('button', { name: /적용/i });

    await userEvent.type(input, '  TEST2025  ');
    fireEvent.click(button);

    await waitFor(() => {
      expect(handleApply).toHaveBeenCalledWith('TEST2025');
    });
  });

  it('should convert code to uppercase', async () => {
    const handleApply = vi.fn();
    render(<CouponInput onApply={handleApply} uppercase />);

    const input = screen.getByPlaceholderText(/쿠폰 코드/i);
    const button = screen.getByRole('button', { name: /적용/i });

    await userEvent.type(input, 'test2025');
    fireEvent.click(button);

    await waitFor(() => {
      expect(handleApply).toHaveBeenCalledWith('TEST2025');
    });
  });

  it('should not call onApply with empty code', async () => {
    const handleApply = vi.fn();
    render(<CouponInput onApply={handleApply} />);

    const button = screen.getByRole('button', { name: /적용/i });
    fireEvent.click(button);

    expect(handleApply).not.toHaveBeenCalled();
  });

  it('should show loading state', () => {
    render(<CouponInput onApply={vi.fn()} loading={true} />);

    const button = screen.getByRole('button', { name: /적용/i });
    expect(button).toBeDisabled();
    expect(screen.getByText(/로딩/i)).toBeInTheDocument();
  });

  it('should show success message', () => {
    render(<CouponInput onApply={vi.fn()} success="쿠폰이 적용되었습니다" />);

    expect(screen.getByText(/쿠폰이 적용되었습니다/i)).toBeInTheDocument();
  });

  it('should show error message', () => {
    render(<CouponInput onApply={vi.fn()} error="유효하지 않은 쿠폰입니다" />);

    expect(screen.getByText(/유효하지 않은 쿠폰입니다/i)).toBeInTheDocument();
  });

  it('should show discount amount when applied', () => {
    render(<CouponInput onApply={vi.fn()} discountAmount={1000} />);

    expect(screen.getByText(/1,000원 할인/i)).toBeInTheDocument();
  });

  it('should show percentage discount when applied', () => {
    render(<CouponInput onApply={vi.fn()} discountPercentage={10} />);

    expect(screen.getByText(/10% 할인/i)).toBeInTheDocument();
  });

  it('should allow removing applied coupon', async () => {
    const handleRemove = vi.fn();
    render(
      <CouponInput
        onApply={vi.fn()}
        onRemove={handleRemove}
        appliedCode="TEST2025"
      />
    );

    const removeButton = screen.getByRole('button', { name: /제거/i });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(handleRemove).toHaveBeenCalled();
    });
  });

  it('should clear input after successful application', async () => {
    const { rerender } = render(<CouponInput onApply={vi.fn()} />);

    const input = screen.getByPlaceholderText(/쿠폰 코드/i) as HTMLInputElement;
    await userEvent.type(input, 'TEST2025');
    expect(input.value).toBe('TEST2025');

    // Rerender with success state
    rerender(<CouponInput onApply={vi.fn()} success="적용됨" clearOnSuccess />);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('should handle Enter key press', async () => {
    const handleApply = vi.fn();
    render(<CouponInput onApply={handleApply} />);

    const input = screen.getByPlaceholderText(/쿠폰 코드/i);
    await userEvent.type(input, 'TEST2025{Enter}');

    await waitFor(() => {
      expect(handleApply).toHaveBeenCalledWith('TEST2025');
    });
  });

  it('should disable input when loading', () => {
    render(<CouponInput onApply={vi.fn()} loading={true} />);

    const input = screen.getByPlaceholderText(/쿠폰 코드/i);
    expect(input).toBeDisabled();
  });

  it('should show character limit warning', async () => {
    render(<CouponInput onApply={vi.fn()} maxLength={10} />);

    const input = screen.getByPlaceholderText(/쿠폰 코드/i);
    await userEvent.type(input, 'VERYLONGCOUPONCODE');

    expect(screen.getByText(/최대 10자/i)).toBeInTheDocument();
  });
});
