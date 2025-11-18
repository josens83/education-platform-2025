import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RatingStars from '../reviews/RatingStars';

describe('RatingStars', () => {
  test('renders correct number of stars', () => {
    const { container } = render(<RatingStars rating={3} maxRating={5} />);

    // 5개의 별 버튼이 있어야 함
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(5);
  });

  test('displays filled stars based on rating', () => {
    const { container } = render(<RatingStars rating={3} maxRating={5} />);

    // 3개의 별이 채워져야 함
    expect(container).toBeInTheDocument();
  });

  test('calls onRatingChange when interactive', () => {
    const handleRatingChange = vi.fn();
    const { container } = render(
      <RatingStars
        rating={0}
        interactive
        onRatingChange={handleRatingChange}
      />
    );

    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[2]); // Click third star

    expect(handleRatingChange).toHaveBeenCalledWith(3);
  });

  test('does not call onRatingChange when not interactive', () => {
    const handleRatingChange = vi.fn();
    const { container } = render(
      <RatingStars
        rating={3}
        interactive={false}
        onRatingChange={handleRatingChange}
      />
    );

    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[4]);

    expect(handleRatingChange).not.toHaveBeenCalled();
  });

  test('shows label when showLabel is true', () => {
    render(<RatingStars rating={4.5} showLabel />);

    expect(screen.getByText(/4\.5/)).toBeInTheDocument();
    expect(screen.getByText(/최고예요/)).toBeInTheDocument();
  });

  test('displays correct label for different ratings', () => {
    const { rerender } = render(<RatingStars rating={5} showLabel />);
    expect(screen.getByText(/최고예요/)).toBeInTheDocument();

    rerender(<RatingStars rating={4} showLabel />);
    expect(screen.getByText(/좋아요/)).toBeInTheDocument();

    rerender(<RatingStars rating={3} showLabel />);
    expect(screen.getByText(/보통이에요/)).toBeInTheDocument();

    rerender(<RatingStars rating={2} showLabel />);
    expect(screen.getByText(/별로예요/)).toBeInTheDocument();

    rerender(<RatingStars rating={1) showLabel />);
    expect(screen.getByText(/아쉬워요/)).toBeInTheDocument();
  });
});
