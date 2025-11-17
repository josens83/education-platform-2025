const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 업로드 디렉토리 생성
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const audioDir = path.join(uploadDir, 'audio');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audioDir);
  },
  filename: (req, file, cb) => {
    // 파일명: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// 파일 필터 (오디오 파일만 허용)
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'audio/mpeg',        // MP3
    'audio/mp3',
    'audio/wav',         // WAV
    'audio/wave',
    'audio/x-wav',
    'audio/ogg',         // OGG
    'audio/mp4',         // M4A
    'audio/x-m4a',
    'audio/aac',         // AAC
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`지원하지 않는 파일 형식입니다. (${file.mimetype})`), false);
  }
};

// Multer 설정
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024, // 기본 10MB
  }
});

// 파일 삭제 헬퍼 함수
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('파일 삭제 오류:', error);
    return false;
  }
};

// 오디오 파일 정보 추출 (선택사항 - ffprobe 필요)
const getAudioDuration = async (filePath) => {
  // 실제 프로덕션에서는 ffprobe나 음악 라이브러리 사용
  // 여기서는 간단히 파일 크기로 추정
  try {
    const stats = fs.statSync(filePath);
    // MP3 기준 대략적인 추정: 128kbps = 16KB/s
    const estimatedDuration = Math.round(stats.size / 16000);
    return {
      duration: estimatedDuration,
      size: stats.size
    };
  } catch (error) {
    return {
      duration: 0,
      size: 0
    };
  }
};

module.exports = {
  upload,
  deleteFile,
  getAudioDuration,
  audioDir
};
