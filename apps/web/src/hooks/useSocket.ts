import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface Notification {
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
}

/**
 * WebSocket Hook
 *
 * 실시간 통신을 위한 Socket.IO 훅
 */
export function useSocket() {
  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((state) => state.token);

  // Socket 연결
  useEffect(() => {
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const socket = io(apiUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // 연결 성공
    socket.on('connected', (data) => {
      console.log('Socket connected:', data);
      setConnected(true);
    });

    // 연결 해제
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    // 온라인 사용자 수
    socket.on('online:count', (data: { count: number }) => {
      setOnlineCount(data.count);
    });

    // 알림 수신
    socket.on('notification', (notification: Notification) => {
      console.log('Notification received:', notification);

      // Toast 알림 표시
      switch (notification.type) {
        case 'success':
          toast.success(notification.message, { duration: 5000 });
          break;
        case 'error':
          toast.error(notification.message, { duration: 5000 });
          break;
        case 'warning':
          toast(notification.message, { icon: '⚠️', duration: 5000 });
          break;
        default:
          toast(notification.message, { icon: 'ℹ️', duration: 5000 });
      }
    });

    // 학습 진도 업데이트
    socket.on('progress:updated', (data) => {
      console.log('Progress updated:', data);
    });

    // 연결 해제 시 정리
    return () => {
      socket.disconnect();
    };
  }, [token]);

  // 학습 진도 업데이트 전송
  const updateProgress = useCallback(
    (data: {
      bookId: number;
      chapterId: number;
      progress: number;
      currentPage: number;
    }) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('progress:update', data);
      }
    },
    []
  );

  // 책 읽기 시작
  const startReading = useCallback(
    (data: { bookId: number; bookTitle: string }) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('reading:start', data);
      }
    },
    []
  );

  // 책 읽기 종료
  const endReading = useCallback(
    (data: { bookId: number; duration: number; pagesRead: number }) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('reading:end', data);
      }
    },
    []
  );

  // 퀴즈 완료
  const completeQuiz = useCallback(
    (data: { quizId: number; score: number; passed: boolean }) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('quiz:complete', data);
      }
    },
    []
  );

  return {
    connected,
    onlineCount,
    socket: socketRef.current,
    updateProgress,
    startReading,
    endReading,
    completeQuiz,
  };
}
