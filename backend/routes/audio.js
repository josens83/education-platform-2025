const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { upload, deleteFile, getAudioDuration } = require('../middleware/upload');
const path = require('path');

// ============================================
// 챕터의 오디오 파일 조회
// ============================================
router.get('/chapters/:chapterId/audio', async (req, res) => {
  try {
    const { chapterId } = req.params;

    const result = await query(
      `SELECT
        af.id,
        af.chapter_id,
        af.file_url,
        af.duration_seconds,
        af.file_size_bytes,
        af.audio_type,
        af.transcript,
        af.sync_data,
        af.created_at
       FROM audio_files af
       WHERE af.chapter_id = $1
       ORDER BY af.created_at DESC
       LIMIT 1`,
      [chapterId]
    );

    if (result.rows.length === 0) {
      return res.json({
        status: 'success',
        data: null,
        message: '오디오 파일이 없습니다'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('오디오 파일 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '오디오 파일 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 오디오 파일 생성 (관리자 전용)
// ============================================
router.post('/chapters/:chapterId/audio', authenticateToken, async (req, res) => {
  try {
    const { chapterId } = req.params;
    const {
      file_url,
      duration_seconds,
      file_size_bytes,
      audio_type = 'professional',
      transcript,
      sync_data
    } = req.body;

    // 관리자 권한 체크
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        status: 'error',
        message: '권한이 없습니다'
      });
    }

    const result = await query(
      `INSERT INTO audio_files (
        chapter_id, file_url, duration_seconds, file_size_bytes,
        audio_type, transcript, sync_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [chapterId, file_url, duration_seconds, file_size_bytes, audio_type, transcript, sync_data]
    );

    res.status(201).json({
      status: 'success',
      message: '오디오 파일이 등록되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('오디오 파일 등록 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '오디오 파일 등록 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 오디오 재생 위치 저장
// ============================================
router.post('/audio/progress', authenticateToken, async (req, res) => {
  try {
    const { chapter_id, audio_position_seconds } = req.body;

    // learning_progress 테이블의 last_position에 오디오 위치 저장
    const result = await query(
      `UPDATE learning_progress
       SET last_position = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2 AND chapter_id = $3
       RETURNING *`,
      [JSON.stringify({ audio_position: audio_position_seconds }), req.user.id, chapter_id]
    );

    if (result.rows.length === 0) {
      // 진도가 없으면 생성
      const bookResult = await query(
        'SELECT book_id FROM chapters WHERE id = $1',
        [chapter_id]
      );

      if (bookResult.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: '챕터를 찾을 수 없습니다'
        });
      }

      const insertResult = await query(
        `INSERT INTO learning_progress (
          user_id, book_id, chapter_id, progress_percentage, last_position
        ) VALUES ($1, $2, $3, 0, $4)
        RETURNING *`,
        [req.user.id, bookResult.rows[0].book_id, chapter_id, JSON.stringify({ audio_position: audio_position_seconds })]
      );

      return res.json({
        status: 'success',
        message: '오디오 재생 위치가 저장되었습니다',
        data: insertResult.rows[0]
      });
    }

    res.json({
      status: 'success',
      message: '오디오 재생 위치가 저장되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('오디오 재생 위치 저장 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '오디오 재생 위치 저장 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 오디오 파일 업로드 (관리자 전용)
// ============================================
router.post('/upload', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    // 관리자 권한 체크
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      // 업로드된 파일 삭제
      if (req.file) {
        deleteFile(req.file.path);
      }
      return res.status(403).json({
        status: 'error',
        message: '권한이 없습니다'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: '오디오 파일이 업로드되지 않았습니다'
      });
    }

    const { chapter_id, audio_type = 'professional', transcript } = req.body;

    if (!chapter_id) {
      deleteFile(req.file.path);
      return res.status(400).json({
        status: 'error',
        message: 'chapter_id가 필요합니다'
      });
    }

    // 챕터 존재 확인
    const chapterResult = await query(
      'SELECT id FROM chapters WHERE id = $1',
      [chapter_id]
    );

    if (chapterResult.rows.length === 0) {
      deleteFile(req.file.path);
      return res.status(404).json({
        status: 'error',
        message: '챕터를 찾을 수 없습니다'
      });
    }

    // 오디오 파일 정보 추출
    const audioInfo = await getAudioDuration(req.file.path);

    // 파일 URL 생성 (실제 환경에서는 CDN URL 또는 정적 파일 서버 URL)
    const fileUrl = `/uploads/audio/${req.file.filename}`;

    // 데이터베이스에 저장
    const result = await query(
      `INSERT INTO audio_files (
        chapter_id, file_url, duration_seconds, file_size_bytes,
        audio_type, transcript
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        chapter_id,
        fileUrl,
        audioInfo.duration,
        req.file.size,
        audio_type,
        transcript || null
      ]
    );

    res.status(201).json({
      status: 'success',
      message: '오디오 파일이 업로드되었습니다',
      data: {
        ...result.rows[0],
        filename: req.file.filename,
        original_name: req.file.originalname
      }
    });
  } catch (error) {
    console.error('오디오 파일 업로드 오류:', error);

    // 오류 발생 시 업로드된 파일 삭제
    if (req.file) {
      deleteFile(req.file.path);
    }

    res.status(500).json({
      status: 'error',
      message: '오디오 파일 업로드 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 오디오 파일 삭제 (관리자 전용)
// ============================================
router.delete('/chapters/:chapterId/audio/:audioId', authenticateToken, async (req, res) => {
  try {
    // 관리자 권한 체크
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        status: 'error',
        message: '권한이 없습니다'
      });
    }

    const { chapterId, audioId } = req.params;

    // 오디오 파일 정보 조회
    const audioResult = await query(
      'SELECT * FROM audio_files WHERE id = $1 AND chapter_id = $2',
      [audioId, chapterId]
    );

    if (audioResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '오디오 파일을 찾을 수 없습니다'
      });
    }

    const audioFile = audioResult.rows[0];

    // 데이터베이스에서 삭제
    await query('DELETE FROM audio_files WHERE id = $1', [audioId]);

    // 실제 파일 삭제 (로컬 파일인 경우)
    if (audioFile.file_url && audioFile.file_url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', audioFile.file_url);
      deleteFile(filePath);
    }

    res.json({
      status: 'success',
      message: '오디오 파일이 삭제되었습니다'
    });
  } catch (error) {
    console.error('오디오 파일 삭제 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '오디오 파일 삭제 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
