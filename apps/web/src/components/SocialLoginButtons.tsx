import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill } from 'react-icons/ri';

/**
 * Social Login Buttons Component
 */
export default function SocialLoginButtons() {
  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  const handleKakaoLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    window.location.href = `${apiUrl}/api/auth/kakao`;
  };

  return (
    <div className="space-y-3">
      {/* Google Login */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-surface border-2 border-border hover:border-primary-500/50 rounded-xl transition-all hover:shadow-smooth-lg group"
      >
        <FcGoogle className="w-5 h-5" />
        <span className="font-medium text-text-primary group-hover:text-primary-600">
          Google로 계속하기
        </span>
      </button>

      {/* Kakao Login */}
      <button
        type="button"
        onClick={handleKakaoLogin}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#FEE500] hover:bg-[#FDD835] rounded-xl transition-all hover:shadow-smooth-lg group"
      >
        <RiKakaoTalkFill className="w-5 h-5 text-[#3C1E1E]" />
        <span className="font-medium text-[#3C1E1E]">
          카카오로 계속하기
        </span>
      </button>
    </div>
  );
}
