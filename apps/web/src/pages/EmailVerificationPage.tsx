import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiMail, FiLoader } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * Email Verification Page
 *
 * 이메일 인증 페이지 - 이메일 링크 클릭 시 표시
 */
export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('인증 토큰이 없습니다');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/auth/verify-email`, {
        params: { token },
      });

      if (response.data.status === 'success') {
        setStatus('success');
        setMessage(response.data.message);
        toast.success('이메일 인증이 완료되었습니다!');

        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error: any) {
      setStatus('error');
      const errorMessage = error.response?.data?.message || '이메일 인증에 실패했습니다';
      setMessage(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('이메일 주소를 입력해주세요');
      return;
    }

    setIsResending(true);

    try {
      const response = await axios.post(`${apiUrl}/api/auth/resend-verification`, {
        email,
      });

      if (response.data.status === 'success') {
        toast.success('인증 이메일이 재발송되었습니다');
        setMessage('새로운 인증 이메일을 발송했습니다. 이메일을 확인해주세요.');
      }
    } catch (error: any) {
      toast.error('인증 이메일 재발송에 실패했습니다');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8"
      >
        {/* 아이콘 */}
        <div className="flex justify-center mb-6">
          {status === 'loading' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <FiLoader className="w-16 h-16 text-primary-500" />
            </motion.div>
          )}
          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <FiCheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <FiXCircle className="w-16 h-16 text-red-500" />
            </motion.div>
          )}
        </div>

        {/* 제목 */}
        <h1 className="text-2xl font-bold text-center text-text-primary mb-4">
          {status === 'loading' && '이메일 인증 중...'}
          {status === 'success' && '인증 완료!'}
          {status === 'error' && '인증 실패'}
        </h1>

        {/* 메시지 */}
        <p className="text-center text-text-secondary mb-6">{message}</p>

        {/* 성공 시 */}
        {status === 'success' && (
          <div className="text-center">
            <p className="text-sm text-text-tertiary mb-4">
              잠시 후 로그인 페이지로 이동합니다...
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
            >
              로그인하러 가기
            </button>
          </div>
        )}

        {/* 실패 시 - 재발송 옵션 */}
        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <FiMail className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                인증 링크가 만료되었거나 유효하지 않습니다. 새로운 인증 이메일을 받으시겠어요?
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소 입력"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isResending ? (
                  <>
                    <FiLoader className="w-5 h-5 animate-spin" />
                    <span>발송 중...</span>
                  </>
                ) : (
                  <>
                    <FiMail className="w-5 h-5" />
                    <span>인증 이메일 재발송</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-4">
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-text-secondary hover:text-primary-500 transition-colors"
              >
                로그인 페이지로 돌아가기
              </button>
            </div>
          </div>
        )}

        {/* 로딩 중 */}
        {status === 'loading' && (
          <div className="text-center">
            <p className="text-sm text-text-tertiary">
              이메일을 인증하고 있습니다. 잠시만 기다려주세요...
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
