/**
 * AI 기능 라우트
 *
 * - AI 책 추천
 * - AI 학습 어시스턴트 챗봇
 * - 문법/단어 설명
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getCollaborativeRecommendations,
  getContentBasedRecommendations,
  getPopularRecommendations,
  getHybridRecommendations,
  getAIRecommendations,
} = require('../lib/ai-recommendations');
const {
  generateChatResponse,
  getChatHistory,
  explainGrammar,
  explainWord,
  helpWithReading,
  getLearningAdvice,
  clearChatHistory,
} = require('../lib/ai-chatbot');

/**
 * AI 책 추천 (하이브리드)
 * GET /api/ai/recommendations
 */
router.get('/recommendations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'hybrid', limit = 10 } = req.query;

    let recommendations;

    switch (type) {
      case 'collaborative':
        recommendations = await getCollaborativeRecommendations(userId, parseInt(limit));
        break;
      case 'content':
        recommendations = await getContentBasedRecommendations(userId, parseInt(limit));
        break;
      case 'popular':
        recommendations = await getPopularRecommendations(parseInt(limit));
        break;
      case 'ai':
        recommendations = await getAIRecommendations(userId, req.body.preferences);
        break;
      case 'hybrid':
      default:
        recommendations = await getHybridRecommendations(userId, parseInt(limit));
        break;
    }

    res.json({
      success: true,
      type,
      recommendations,
    });
  } catch (error) {
    console.error('AI recommendations error:', error);
    res.status(500).json({
      success: false,
      message: '추천을 생성하는 중 오류가 발생했습니다',
      error: error.message,
    });
  }
});

/**
 * AI 개인화 추천 (GPT-4 사용)
 * POST /api/ai/recommendations/personalized
 */
router.post('/recommendations/personalized', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;

    const result = await getAIRecommendations(userId, preferences);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('AI personalized recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'AI 추천을 생성하는 중 오류가 발생했습니다',
      error: error.message,
    });
  }
});

/**
 * 챗봇 대화
 * POST /api/ai/chat
 */
router.post('/chat', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, bookContext } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: '메시지를 입력해주세요',
      });
    }

    const response = await generateChatResponse(userId, message, bookContext);

    res.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: '응답을 생성하는 중 오류가 발생했습니다',
      error: error.message,
    });
  }
});

/**
 * 대화 기록 조회
 * GET /api/ai/chat/history
 */
router.get('/chat/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    const history = await getChatHistory(userId, parseInt(limit));

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      success: false,
      message: '대화 기록을 불러오는 중 오류가 발생했습니다',
      error: error.message,
    });
  }
});

/**
 * 대화 기록 삭제
 * DELETE /api/ai/chat/history
 */
router.delete('/chat/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await clearChatHistory(userId);

    if (result.success) {
      res.json({
        success: true,
        message: '대화 기록이 삭제되었습니다',
      });
    } else {
      res.status(500).json({
        success: false,
        message: '대화 기록 삭제 중 오류가 발생했습니다',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({
      success: false,
      message: '대화 기록 삭제 중 오류가 발생했습니다',
      error: error.message,
    });
  }
});

/**
 * 문법 설명
 * POST /api/ai/explain/grammar
 */
router.post('/explain/grammar', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: '문법 주제를 입력해주세요',
      });
    }

    const response = await explainGrammar(userId, topic);

    res.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error('Grammar explanation error:', error);
    res.status(500).json({
      success: false,
      message: '문법 설명을 생성하는 중 오류가 발생했습니다',
      error: error.message,
    });
  }
});

/**
 * 단어 뜻 설명
 * POST /api/ai/explain/word
 */
router.post('/explain/word', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { word, sentence } = req.body;

    if (!word) {
      return res.status(400).json({
        success: false,
        message: '단어를 입력해주세요',
      });
    }

    const response = await explainWord(userId, word, sentence);

    res.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error('Word explanation error:', error);
    res.status(500).json({
      success: false,
      message: '단어 설명을 생성하는 중 오류가 발생했습니다',
      error: error.message,
    });
  }
});

/**
 * 독해 도움
 * POST /api/ai/help/reading
 */
router.post('/help/reading', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { passage, question } = req.body;

    if (!passage) {
      return res.status(400).json({
        success: false,
        message: '지문을 입력해주세요',
      });
    }

    const response = await helpWithReading(userId, passage, question);

    res.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error('Reading help error:', error);
    res.status(500).json({
      success: false,
      message: '독해 도움을 생성하는 중 오류가 발생했습니다',
      error: error.message,
    });
  }
});

/**
 * 학습 계획 조언
 * POST /api/ai/advice/learning
 */
router.post('/advice/learning', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { goal } = req.body;

    const response = await getLearningAdvice(userId, goal);

    res.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error('Learning advice error:', error);
    res.status(500).json({
      success: false,
      message: '학습 조언을 생성하는 중 오류가 발생했습니다',
      error: error.message,
    });
  }
});

module.exports = router;
