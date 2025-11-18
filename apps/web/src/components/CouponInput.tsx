import { useState } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface CouponInputProps {
  planId: number;
  planPrice: number;
  onCouponApplied: (discount: number, couponCode: string) => void;
  onCouponRemoved: () => void;
}

export default function CouponInput({ planId, planPrice, onCouponApplied, onCouponRemoved }: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validatedCoupon, setValidatedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('쿠폰 코드를 입력해주세요');
      return;
    }

    setIsValidating(true);

    try {
      const result = await api.validateCoupon(couponCode.trim().toUpperCase(), planId);

      if (result.valid) {
        setValidatedCoupon(result.coupon);
        setDiscountAmount(result.discount_amount);
        onCouponApplied(result.discount_amount, result.coupon.code);
        toast.success('쿠폰이 적용되었습니다!');
      } else {
        toast.error(result.message || '유효하지 않은 쿠폰입니다');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '쿠폰 검증에 실패했습니다';
      toast.error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setValidatedCoupon(null);
    setDiscountAmount(0);
    onCouponRemoved();
    toast.success('쿠폰이 제거되었습니다');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const finalPrice = Math.max(0, planPrice - discountAmount);
  const discountPercentage = planPrice > 0 ? Math.round((discountAmount / planPrice) * 100) : 0;

  return (
    <div className="mt-4 space-y-3">
      {/* 쿠폰 입력 */}
      {!validatedCoupon ? (
        <div>
          <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-2">
            프로모션 코드
          </label>
          <div className="flex gap-2">
            <input
              id="coupon"
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleValidateCoupon()}
              placeholder="쿠폰 코드 입력"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
              disabled={isValidating}
            />
            <button
              onClick={handleValidateCoupon}
              disabled={isValidating || !couponCode.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isValidating ? '확인 중...' : '적용'}
            </button>
          </div>
        </div>
      ) : (
        /* 적용된 쿠폰 */
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-bold text-lg">
                  ✓ {validatedCoupon.code}
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                  {discountPercentage}% 할인
                </span>
              </div>
              {validatedCoupon.description && (
                <p className="text-sm text-gray-600 mt-1">{validatedCoupon.description}</p>
              )}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">원래 가격</span>
                  <span className="line-through text-gray-500">{formatCurrency(planPrice)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-green-600">
                  <span>할인 금액</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-green-200">
                  <span>최종 가격</span>
                  <span>{formatCurrency(finalPrice)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
              title="쿠폰 제거"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 할인 금액 요약 (쿠폰 적용 시) */}
      {validatedCoupon && discountAmount > 0 && (
        <div className="text-center py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
          <p className="text-green-700 font-semibold">
            🎉 {formatCurrency(discountAmount)} 절약하셨습니다!
          </p>
        </div>
      )}

      {/* 쿠폰 사용 안내 */}
      {!validatedCoupon && (
        <p className="text-xs text-gray-500 mt-2">
          * 쿠폰 코드를 입력하면 자동으로 할인이 적용됩니다
        </p>
      )}
    </div>
  );
}
