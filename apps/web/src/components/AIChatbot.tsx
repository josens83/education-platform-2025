import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiTrash2 } from 'react-icons/fi';
import { RiRobot2Fill } from 'react-icons/ri';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  message: string;
  timestamp?: string;
}

/**
 * AI Learning Assistant Chatbot
 *
 * GPT-4 기반 영어 학습 어시스턴트
 */
export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // 대화 기록 불러오기
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadChatHistory();
    }
  }, [isOpen]);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/ai/chat/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 20 },
      });

      if (response.data.success) {
        setMessages(response.data.history);
      }
    } catch (error: any) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // 사용자 메시지 추가
    setMessages((prev) => [
      ...prev,
      { role: 'user', message: userMessage },
    ]);

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/api/ai/chat`,
        { message: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            message: response.data.message,
          },
        ]);

        setAiEnabled(response.data.aiEnabled);

        if (!response.data.aiEnabled) {
          toast.error('AI 기능이 현재 사용 불가능합니다');
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error('메시지 전송에 실패했습니다');

      // 오류 메시지 추가
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          message: '죄송합니다. 일시적으로 응답할 수 없습니다. 잠시 후 다시 시도해주세요.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm('대화 기록을 모두 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${apiUrl}/api/ai/chat/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages([]);
      toast.success('대화 기록이 삭제되었습니다');
    } catch (error) {
      console.error('Failed to clear history:', error);
      toast.error('대화 기록 삭제에 실패했습니다');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* 플로팅 챗봇 버튼 */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transition-shadow"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <FiX className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <FiMessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 챗봇 창 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RiRobot2Fill className="w-6 h-6" />
                <div>
                  <h3 className="font-bold text-lg">AI 학습 어시스턴트</h3>
                  <p className="text-xs opacity-90">
                    {aiEnabled ? '온라인' : '오프라인'}
                  </p>
                </div>
              </div>
              <button
                onClick={clearHistory}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="대화 기록 삭제"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>

            {/* 메시지 목록 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-text-secondary">
                  <RiRobot2Fill className="w-16 h-16 mb-4 text-primary-500" />
                  <p className="font-medium">안녕하세요! 👋</p>
                  <p className="text-sm mt-2">
                    영어 학습에 대해 무엇이든 물어보세요
                  </p>
                  <div className="mt-4 text-xs space-y-1">
                    <p>💡 "present perfect는 어떻게 써요?"</p>
                    <p>💡 "이 단어의 뜻이 뭐예요?"</p>
                    <p>💡 "효과적인 학습 방법 알려주세요"</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          msg.role === 'user'
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-text-primary'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.8,
                              delay: 0.2,
                            }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.8,
                              delay: 0.4,
                            }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* 입력 창 */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 resize-none px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 max-h-32"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
