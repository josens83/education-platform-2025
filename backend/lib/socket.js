/**
 * Socket.IO Configuration
 *
 * 실시간 알림 및 학습 진도 업데이트를 위한 WebSocket 서버
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

/**
 * Socket.IO 초기화
 */
function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // 인증 미들웨어
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // 연결 처리
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // 사용자별 방에 참여
    socket.join(`user:${socket.userId}`);

    // 관리자/선생님이면 관리자 방에도 참여
    if (socket.userRole === 'admin' || socket.userRole === 'teacher') {
      socket.join('admins');
    }

    // 연결 알림
    socket.emit('connected', {
      message: 'Successfully connected to real-time server',
      userId: socket.userId,
    });

    // 온라인 사용자 수 브로드캐스트
    broadcastOnlineUsersCount();

    // 학습 진도 업데이트
    socket.on('progress:update', (data) => {
      handleProgressUpdate(socket, data);
    });

    // 책 읽기 시작
    socket.on('reading:start', (data) => {
      handleReadingStart(socket, data);
    });

    // 책 읽기 종료
    socket.on('reading:end', (data) => {
      handleReadingEnd(socket, data);
    });

    // 퀴즈 완료
    socket.on('quiz:complete', (data) => {
      handleQuizComplete(socket, data);
    });

    // 연결 해제
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      broadcastOnlineUsersCount();
    });
  });

  return io;
}

/**
 * 온라인 사용자 수 브로드캐스트
 */
function broadcastOnlineUsersCount() {
  const onlineCount = io.sockets.sockets.size;
  io.emit('online:count', { count: onlineCount });
}

/**
 * 학습 진도 업데이트 핸들러
 */
function handleProgressUpdate(socket, data) {
  const { bookId, chapterId, progress, currentPage } = data;

  console.log(`Progress update from user ${socket.userId}:`, data);

  // 같은 사용자의 다른 세션에 브로드캐스트
  socket.to(`user:${socket.userId}`).emit('progress:updated', {
    bookId,
    chapterId,
    progress,
    currentPage,
    timestamp: new Date().toISOString(),
  });

  // 관리자에게 알림
  io.to('admins').emit('user:progress', {
    userId: socket.userId,
    bookId,
    chapterId,
    progress,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 책 읽기 시작 핸들러
 */
function handleReadingStart(socket, data) {
  const { bookId, bookTitle } = data;

  console.log(`User ${socket.userId} started reading book ${bookId}`);

  // 사용자에게 확인
  socket.emit('reading:started', {
    bookId,
    bookTitle,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 책 읽기 종료 핸들러
 */
function handleReadingEnd(socket, data) {
  const { bookId, duration, pagesRead } = data;

  console.log(`User ${socket.userId} finished reading session:`, data);

  // 사용자에게 요약 전송
  socket.emit('reading:summary', {
    bookId,
    duration,
    pagesRead,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 퀴즈 완료 핸들러
 */
function handleQuizComplete(socket, data) {
  const { quizId, score, passed } = data;

  console.log(`User ${socket.userId} completed quiz ${quizId}:`, data);

  // 사용자에게 축하 메시지
  if (passed) {
    socket.emit('notification', {
      type: 'success',
      title: '퀴즈 통과!',
      message: `축하합니다! ${score}점으로 퀴즈를 통과했습니다.`,
      data: { quizId, score },
    });
  }
}

/**
 * 특정 사용자에게 알림 전송
 */
function sendNotificationToUser(userId, notification) {
  if (!io) return;

  io.to(`user:${userId}`).emit('notification', {
    type: notification.type || 'info',
    title: notification.title,
    message: notification.message,
    data: notification.data || {},
    timestamp: new Date().toISOString(),
  });
}

/**
 * 모든 사용자에게 알림 브로드캐스트
 */
function broadcastNotification(notification) {
  if (!io) return;

  io.emit('notification', {
    type: notification.type || 'info',
    title: notification.title,
    message: notification.message,
    data: notification.data || {},
    timestamp: new Date().toISOString(),
  });
}

/**
 * 관리자에게만 알림 전송
 */
function sendNotificationToAdmins(notification) {
  if (!io) return;

  io.to('admins').emit('notification', {
    type: notification.type || 'info',
    title: notification.title,
    message: notification.message,
    data: notification.data || {},
    timestamp: new Date().toISOString(),
  });
}

/**
 * Socket.IO 인스턴스 가져오기
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

module.exports = {
  initializeSocket,
  sendNotificationToUser,
  broadcastNotification,
  sendNotificationToAdmins,
  getIO,
};
