/**
 * AI Learning Assistant Chatbot
 *
 * GPT-4를 사용한 영어 학습 어시스턴트
 * - 학습 질문 응답
 * - 문법 설명
 * - 단어 뜻 설명
 * - 독해 도움
 * - 학습 계획 조언
 */

const pool = require('./db');

/**
 * 대화 기록 저장
 */
async function saveChatMessage(userId, role, message, bookContext = null) {
  try {
    await pool.query(
      `INSERT INTO chat_history (user_id, role, message, book_context, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId, role, message, bookContext ? JSON.stringify(bookContext) : null]
    );
  } catch (error) {
    console.error('Error saving chat message:', error);
  }
}

/**
 * 대화 기록 가져오기
 */
async function getChatHistory(userId, limit = 10) {
  try {
    const result = await pool.query(
      `SELECT role, message, book_context, created_at
       FROM chat_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.reverse(); // 시간순 정렬
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

/**
 * AI 챗봇 응답 생성
 */
async function generateChatResponse(userId, userMessage, bookContext = null) {
  try {
    // OpenAI API가 비활성화된 경우
    if (!process.env.OPENAI_API_KEY) {
      return {
        message: '죄송합니다. AI 어시스턴트 기능을 사용할 수 없습니다. 관리자에게 문의해주세요.',
        aiEnabled: false,
      };
    }

    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 사용자 정보 가져오기
    const userInfo = await pool.query(
      `SELECT username, email, role FROM users WHERE id = $1`,
      [userId]
    );

    // 최근 학습 기록 가져오기
    const recentBooks = await pool.query(
      `
      SELECT b.title, b.category, b.level, rp.progress
      FROM reading_progress rp
      JOIN books b ON rp.book_id = b.id
      WHERE rp.user_id = $1
      ORDER BY rp.updated_at DESC
      LIMIT 5
      `,
      [userId]
    );

    // 이전 대화 기록
    const chatHistory = await getChatHistory(userId, 5);

    // 시스템 프롬프트 구성
    const systemPrompt = `
당신은 친절하고 전문적인 영어 학습 어시스턴트입니다.

**역할:**
- 영어 학습과 관련된 질문에 답변합니다
- 문법, 단어, 독해에 대해 쉽고 명확하게 설명합니다
- 학생의 레벨에 맞는 조언을 제공합니다
- 격려하고 동기부여합니다

**학생 정보:**
- 이름: ${userInfo.rows[0]?.username || '학생'}
- 최근 읽은 책: ${recentBooks.rows.map(b => `${b.title} (${b.level})`).join(', ') || '없음'}

**응답 가이드라인:**
1. 항상 한글로 답변하되, 예시는 영어로 제공
2. 간단명료하게 설명 (3-5문장)
3. 예시를 들어 이해를 돕기
4. 학생 레벨에 맞는 표현 사용
5. 격려와 긍정적인 피드백 포함

${bookContext ? `**현재 읽고 있는 책:** ${bookContext.title} (${bookContext.level})` : ''}
`;

    // 대화 메시지 구성
    const messages = [
      { role: 'system', content: systemPrompt },
    ];

    // 이전 대화 기록 추가
    chatHistory.forEach(chat => {
      messages.push({
        role: chat.role,
        content: chat.message,
      });
    });

    // 현재 사용자 메시지 추가
    messages.push({
      role: 'user',
      content: userMessage,
    });

    // OpenAI API 호출
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: messages,
      temperature: 0.8,
      max_tokens: 800,
    });

    const assistantMessage = response.choices[0].message.content;

    // 대화 기록 저장
    await saveChatMessage(userId, 'user', userMessage, bookContext);
    await saveChatMessage(userId, 'assistant', assistantMessage, bookContext);

    return {
      message: assistantMessage,
      aiEnabled: true,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      },
    };
  } catch (error) {
    console.error('Error generating chat response:', error);

    return {
      message: '죄송합니다. 일시적으로 응답을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.',
      aiEnabled: false,
      error: error.message,
    };
  }
}

/**
 * 문법 설명 생성
 */
async function explainGrammar(userId, grammarTopic) {
  const prompt = `"${grammarTopic}"에 대해 설명해주세요. 초보자도 이해할 수 있도록 쉽게 설명하고, 예시 문장을 3개 이상 포함해주세요.`;

  return await generateChatResponse(userId, prompt);
}

/**
 * 단어 뜻 설명
 */
async function explainWord(userId, word, sentence = null) {
  const prompt = sentence
    ? `"${word}" 단어의 뜻을 설명해주세요. 다음 문장에서 어떤 의미인지도 알려주세요: "${sentence}"`
    : `"${word}" 단어의 뜻을 설명해주세요. 예시 문장도 3개 포함해주세요.`;

  return await generateChatResponse(userId, prompt);
}

/**
 * 독해 도움
 */
async function helpWithReading(userId, passage, question = null) {
  const prompt = question
    ? `다음 지문을 읽고 질문에 답해주세요:\n\n${passage}\n\n질문: ${question}`
    : `다음 지문의 내용을 요약하고 핵심 내용을 설명해주세요:\n\n${passage}`;

  return await generateChatResponse(userId, prompt);
}

/**
 * 학습 계획 조언
 */
async function getLearningAdvice(userId, goal = null) {
  try {
    // 사용자의 학습 통계
    const stats = await pool.query(
      `
      SELECT
        COUNT(DISTINCT rp.book_id) as books_read,
        AVG(rp.progress) as avg_progress,
        COUNT(DISTINCT CASE WHEN rp.completed_at IS NOT NULL THEN rp.book_id END) as completed_books,
        array_agg(DISTINCT b.level) as levels_studied
      FROM reading_progress rp
      JOIN books b ON rp.book_id = b.id
      WHERE rp.user_id = $1
      `,
      [userId]
    );

    const userStats = stats.rows[0];

    const prompt = goal
      ? `제 학습 목표는 "${goal}"입니다. 현재 ${userStats.books_read}권의 책을 읽었고, 평균 진도율은 ${Math.round(userStats.avg_progress)}%입니다. 어떻게 학습하면 좋을까요?`
      : `현재 ${userStats.books_read}권의 책을 읽었고, ${userStats.completed_books}권을 완료했습니다. 효과적인 학습 계획을 세우고 싶은데 조언해주세요.`;

    return await generateChatResponse(userId, prompt);
  } catch (error) {
    console.error('Error getting learning advice:', error);
    return {
      message: '학습 조언을 생성하는 중 오류가 발생했습니다.',
      aiEnabled: false,
      error: error.message,
    };
  }
}

/**
 * 대화 기록 삭제
 */
async function clearChatHistory(userId) {
  try {
    await pool.query(
      'DELETE FROM chat_history WHERE user_id = $1',
      [userId]
    );
    return { success: true };
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  generateChatResponse,
  getChatHistory,
  explainGrammar,
  explainWord,
  helpWithReading,
  getLearningAdvice,
  clearChatHistory,
};
