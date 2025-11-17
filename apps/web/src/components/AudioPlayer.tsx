import { useRef, useState, useEffect } from 'react';
import type { AudioFile } from '@education-platform/api-client';

interface AudioPlayerProps {
  audio: AudioFile;
  chapterId: number;
  onProgressSave?: (position: number) => void;
  initialPosition?: number;
}

export default function AudioPlayer({ audio, chapterId, onProgressSave, initialPosition = 0 }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialPosition);
  const [duration, setDuration] = useState(audio.duration_seconds || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    // 초기 위치 설정
    if (initialPosition > 0) {
      audioElement.currentTime = initialPosition;
    }

    // 이벤트 리스너
    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime);

      // 10초마다 진도 저장
      if (Math.floor(audioElement.currentTime) % 10 === 0) {
        onProgressSave?.(audioElement.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onProgressSave?.(0); // 완료되면 위치 초기화
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [onProgressSave, initialPosition]);

  const togglePlay = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const newTime = parseFloat(e.target.value);
    audioElement.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handlePlaybackRateChange = (rate: number) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    audioElement.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const newVolume = parseFloat(e.target.value);
    audioElement.volume = newVolume;
    setVolume(newVolume);
  };

  const skip = (seconds: number) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    audioElement.currentTime = Math.max(0, Math.min(duration, audioElement.currentTime + seconds));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 shadow-lg">
      {/* 오디오 엘리먼트 (숨김) */}
      <audio ref={audioRef} src={audio.file_url} preload="metadata" />

      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">오디오 재생</h3>
          <p className="text-sm text-gray-600">
            {audio.audio_type === 'professional' ? '전문 성우' : 'AI 음성'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* 재생 속도 */}
          <select
            value={playbackRate}
            onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {/* 10초 뒤로 */}
        <button
          onClick={() => skip(-10)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:shadow-md transition"
          title="10초 뒤로"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
          </svg>
        </button>

        {/* 재생/일시정지 */}
        <button
          onClick={togglePlay}
          className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition transform hover:scale-105"
        >
          {isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* 10초 앞으로 */}
        <button
          onClick={() => skip(10)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:shadow-md transition"
          title="10초 앞으로"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
          </svg>
        </button>
      </div>

      {/* 볼륨 컨트롤 */}
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <span className="text-sm text-gray-600 w-12 text-right">{Math.round(volume * 100)}%</span>
      </div>

      {/* Transcript (선택사항) */}
      {audio.transcript && (
        <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg">
          <p className="text-sm text-gray-700 italic">"{audio.transcript}"</p>
        </div>
      )}
    </div>
  );
}
