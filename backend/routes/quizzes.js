const express = require('express');
const router = express.Router();
const { query, transaction } = require('../database');
const { authenticateToken, checkSubscription, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken, checkSubscription);

// ============================================
// 퀴즈 조회
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const quizResult = await query(
      'SELECT * FROM quizzes WHERE id = $1 AND is_active = true',
      [id]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '퀴즈를 찾을 수 없습니다'
      });
    }

    const questionsResult = await query(
      `SELECT id, question_text, question_type, options, points, display_order
       FROM quiz_questions
       WHERE quiz_id = $1
       ORDER BY display_order`,
      [id]
    );

    res.json({
      status: 'success',
      data: {
        quiz: quizResult.rows[0],
        questions: questionsResult.rows
      }
    });
  } catch (error) {
    console.error('퀴즈 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '퀴즈 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 퀴즈 제출 및 채점
// ============================================
router.post('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, time_taken_seconds } = req.body; // answers: [{ question_id, user_answer }]

    await transaction(async (client) => {
      // 퀴즈 정보 조회
      const quizResult = await client.query(
        'SELECT * FROM quizzes WHERE id = $1',
        [id]
      );

      if (quizResult.rows.length === 0) {
        throw new Error('퀴즈를 찾을 수 없습니다');
      }

      const quiz = quizResult.rows[0];

      // 질문 및 정답 조회
      const questionsResult = await client.query(
        'SELECT * FROM quiz_questions WHERE quiz_id = $1',
        [id]
      );

      const questions = questionsResult.rows;
      let totalPoints = 0;
      let earnedPoints = 0;
      const gradedAnswers = [];

      // 채점
      for (const question of questions) {
        totalPoints += question.points;

        const userAnswer = answers.find(a => a.question_id === question.id);
        const isCorrect = userAnswer && userAnswer.user_answer === question.correct_answer;
        const pointsEarned = isCorrect ? question.points : 0;

        earnedPoints += pointsEarned;

        gradedAnswers.push({
          question_id: question.id,
          user_answer: userAnswer?.user_answer || null,
          correct_answer: question.correct_answer,
          is_correct: isCorrect,
          points_earned: pointsEarned,
          explanation: question.explanation
        });
      }

      const percentage = Math.round((earnedPoints / totalPoints) * 100);
      const isPassed = percentage >= quiz.passing_score;

      // 시도 기록 저장
      const attemptResult = await client.query(
        `INSERT INTO quiz_attempts (
          user_id, quiz_id, score, total_points, percentage, time_taken_seconds,
          is_passed, started_at, completed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *`,
        [req.user.id, id, earnedPoints, totalPoints, percentage, time_taken_seconds, isPassed]
      );

      const attemptId = attemptResult.rows[0].id;

      // 답안 저장
      for (const answer of gradedAnswers) {
        await client.query(
          `INSERT INTO quiz_answers (
            attempt_id, question_id, user_answer, is_correct, points_earned
          ) VALUES ($1, $2, $3, $4, $5)`,
          [attemptId, answer.question_id, answer.user_answer, answer.is_correct, answer.points_earned]
        );
      }

      res.json({
        status: 'success',
        message: isPassed ? '퀴즈를 통과했습니다!' : '아쉽지만 불합격입니다. 다시 도전해보세요!',
        data: {
          attempt_id: attemptId,
          score: earnedPoints,
          total_points: totalPoints,
          percentage,
          is_passed: isPassed,
          passing_score: quiz.passing_score,
          answers: gradedAnswers
        }
      });
    });
  } catch (error) {
    console.error('퀴즈 제출 오류:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '퀴즈 제출 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 내 퀴즈 기록
// ============================================
router.get('/my/attempts', async (req, res) => {
  try {
    const result = await query(
      `SELECT qa.*, q.title as quiz_title, c.title as chapter_title
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       JOIN chapters c ON q.chapter_id = c.id
       WHERE qa.user_id = $1
       ORDER BY qa.completed_at DESC`,
      [req.user.id]
    );

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('퀴즈 기록 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '퀴즈 기록 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 퀴즈 수정 (관리자 전용)
// ============================================
router.put('/:id', authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      quiz_type,
      passing_score,
      time_limit_minutes,
      is_active,
    } = req.body;

    const result = await query(
      `UPDATE quizzes SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        quiz_type = COALESCE($3, quiz_type),
        passing_score = COALESCE($4, passing_score),
        time_limit_minutes = COALESCE($5, time_limit_minutes),
        is_active = COALESCE($6, is_active)
      WHERE id = $7
      RETURNING *`,
      [title, description, quiz_type, passing_score, time_limit_minutes, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '퀴즈를 찾을 수 없습니다'
      });
    }

    res.json({
      status: 'success',
      message: '퀴즈가 수정되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('퀴즈 수정 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '퀴즈 수정 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 퀴즈 삭제 (관리자 전용)
// ============================================
router.delete('/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // 퀴즈와 관련된 모든 데이터는 ON DELETE CASCADE로 자동 삭제됨
    const result = await query('DELETE FROM quizzes WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '퀴즈를 찾을 수 없습니다'
      });
    }

    res.json({
      status: 'success',
      message: '퀴즈가 삭제되었습니다'
    });
  } catch (error) {
    console.error('퀴즈 삭제 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '퀴즈 삭제 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 퀴즈 문제 추가 (관리자 전용)
// ============================================
router.post('/:id/questions', authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { id: quizId } = req.params;
    const {
      question_text,
      question_type,
      options,
      correct_answer,
      explanation,
      points,
      display_order,
    } = req.body;

    const result = await query(
      `INSERT INTO quiz_questions (
        quiz_id, question_text, question_type, options, correct_answer,
        explanation, points, display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        quizId,
        question_text,
        question_type || 'multiple_choice',
        options ? JSON.stringify(options) : null,
        correct_answer,
        explanation || '',
        points || 10,
        display_order || 0,
      ]
    );

    res.status(201).json({
      status: 'success',
      message: '문제가 생성되었습니다',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('문제 생성 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '문제 생성 중 오류가 발생했습니다',
    });
  }
});

// ============================================
// 퀴즈 문제 수정 (관리자 전용)
// ============================================
router.put('/questions/:id', authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      question_text,
      question_type,
      options,
      correct_answer,
      explanation,
      points,
      display_order,
    } = req.body;

    const result = await query(
      `UPDATE quiz_questions SET
        question_text = COALESCE($1, question_text),
        question_type = COALESCE($2, question_type),
        options = COALESCE($3, options),
        correct_answer = COALESCE($4, correct_answer),
        explanation = COALESCE($5, explanation),
        points = COALESCE($6, points),
        display_order = COALESCE($7, display_order)
      WHERE id = $8
      RETURNING *`,
      [
        question_text,
        question_type,
        options ? JSON.stringify(options) : undefined,
        correct_answer,
        explanation,
        points,
        display_order,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '문제를 찾을 수 없습니다',
      });
    }

    res.json({
      status: 'success',
      message: '문제가 수정되었습니다',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('문제 수정 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '문제 수정 중 오류가 발생했습니다',
    });
  }
});

// ============================================
// 퀴즈 문제 삭제 (관리자 전용)
// ============================================
router.delete('/questions/:id', authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM quiz_questions WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '문제를 찾을 수 없습니다',
      });
    }

    res.json({
      status: 'success',
      message: '문제가 삭제되었습니다',
    });
  } catch (error) {
    console.error('문제 삭제 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '문제 삭제 중 오류가 발생했습니다',
    });
  }
});

module.exports = router;
