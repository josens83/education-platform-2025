/**
 * AudioPlayer Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AudioPlayer } from '../AudioPlayer';

describe('AudioPlayer', () => {
  const mockAudioData = {
    id: 1,
    title: 'Test Audio',
    url: 'https://example.com/audio.mp3',
    duration: 180, // 3 minutes
  };

  beforeEach(() => {
    // Mock HTML Audio Element
    global.HTMLMediaElement.prototype.load = vi.fn();
    global.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
    global.HTMLMediaElement.prototype.pause = vi.fn();
  });

  it('should render audio player with title', () => {
    render(<AudioPlayer audio={mockAudioData} />);
    expect(screen.getByText(mockAudioData.title)).toBeInTheDocument();
  });

  it('should display play button initially', () => {
    render(<AudioPlayer audio={mockAudioData} />);
    const playButton = screen.getByRole('button', { name: /play/i });
    expect(playButton).toBeInTheDocument();
  });

  it('should toggle play/pause on button click', async () => {
    render(<AudioPlayer audio={mockAudioData} />);

    const playButton = screen.getByRole('button', { name: /play/i });

    // Click play
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(global.HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });

    // Should now show pause button
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    expect(pauseButton).toBeInTheDocument();

    // Click pause
    fireEvent.click(pauseButton);

    await waitFor(() => {
      expect(global.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    });
  });

  it('should display current time and duration', () => {
    render(<AudioPlayer audio={mockAudioData} />);

    // Should show 0:00 / 3:00
    expect(screen.getByText(/0:00/)).toBeInTheDocument();
    expect(screen.getByText(/3:00/)).toBeInTheDocument();
  });

  it('should allow speed control', async () => {
    render(<AudioPlayer audio={mockAudioData} />);

    const speedButton = screen.getByRole('button', { name: /speed/i });
    expect(speedButton).toBeInTheDocument();

    // Click to cycle through speeds
    fireEvent.click(speedButton);

    await waitFor(() => {
      expect(screen.getByText(/1.5x/i)).toBeInTheDocument();
    });
  });

  it('should show volume controls', () => {
    render(<AudioPlayer audio={mockAudioData} />);

    const volumeControl = screen.getByRole('slider', { name: /volume/i });
    expect(volumeControl).toBeInTheDocument();
  });

  it('should show progress bar', () => {
    render(<AudioPlayer audio={mockAudioData} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('should handle audio loading error', async () => {
    global.HTMLMediaElement.prototype.play = vi.fn(() =>
      Promise.reject(new Error('Failed to load audio'))
    );

    render(<AudioPlayer audio={mockAudioData} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByText(/오류/i)).toBeInTheDocument();
    });
  });

  it('should update progress when audio plays', async () => {
    render(<AudioPlayer audio={mockAudioData} />);

    const audioElement = document.querySelector('audio');

    if (audioElement) {
      // Simulate timeupdate event
      Object.defineProperty(audioElement, 'currentTime', {
        value: 60, // 1 minute
        writable: true
      });

      fireEvent.timeUpdate(audioElement);

      await waitFor(() => {
        expect(screen.getByText(/1:00/)).toBeInTheDocument();
      });
    }
  });

  it('should handle end of audio', async () => {
    const onEnded = vi.fn();
    render(<AudioPlayer audio={mockAudioData} onEnded={onEnded} />);

    const audioElement = document.querySelector('audio');

    if (audioElement) {
      fireEvent.ended(audioElement);

      await waitFor(() => {
        expect(onEnded).toHaveBeenCalled();
      });
    }
  });
});
