import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

/**
 * OAuth Callback Page
 *
 * Google, Kakao 등 소셜 로그인 후 리다이렉트되는 페이지
 */
export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const provider = searchParams.get('provider');
    const error = searchParams.get('error');

    if (error) {
      toast.error(`로그인 실패: ${error}`);
      navigate('/login');
      return;
    }

    if (token) {
      // 토큰 저장 및 로그인 처리
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Zustand store 업데이트
      login(token);

      toast.success(`${provider || 'OAuth'} 로그인 성공!`);

      // 대시보드로 이동
      navigate('/dashboard');
    } else {
      toast.error('로그인 토큰을 받지 못했습니다.');
      navigate('/login');
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold text-text-primary mb-2">로그인 처리 중...</h2>
        <p className="text-text-secondary">잠시만 기다려주세요</p>
      </motion.div>
    </div>
  );
}
