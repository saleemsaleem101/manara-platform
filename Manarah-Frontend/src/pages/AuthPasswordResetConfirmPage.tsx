import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import logoImg from '../assets/logo_transparent.png'
import { api } from '../services/api'
import { validatePassword } from '../utils/validators'

export const AuthPasswordResetConfirmPage: React.FC = () => {
  const navigate = useNavigate()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])
  const [searchParams] = useSearchParams()
  const rawToken = searchParams.get('token') || searchParams.get('code') || ''
  const token = decodeURIComponent(rawToken).trim()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Check if token is missing
  const isTokenMissing = !token.trim()

  useEffect(() => {
    if (isTokenMissing) {
      setErrorMessage('رابط استعادة كلمة المرور غير صالح أو مفقود. يرجى طلب رابط استعادة جديد.')
    }
  }, [isTokenMissing])

  // Password strength check using shared validator
  const pwdValidation = validatePassword(newPassword)
  const hasMinLength = pwdValidation.hasMinLength
  const hasNumber = pwdValidation.hasNumber
  const hasLetter = pwdValidation.hasLetter
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (isTokenMissing) {
      setErrorMessage('رابط الاستعادة غير صالح أو انتهت صلاحيته.')
      return
    }

    if (!pwdValidation.isValid) {
      setErrorMessage(pwdValidation.errorMessage || 'يجب أن تشتمل كلمة المرور على أحرف وأرقام معاً وألا تقل عن 8 خانات.')
      return
    }

    if (!isMatch) {
      setErrorMessage('كلمتا المرور غير متطابقتين.')
      return
    }

    setIsLoading(true)
    try {
      await api.confirmPasswordReset({
        token: token.trim(),
        new_password: newPassword,
      })
      setIsSuccess(true)
      timeoutRef.current = setTimeout(() => {
        navigate('/login')
      }, 2500)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      setErrorMessage(
        msg || 'فشل إعادة تعيين كلمة المرور. قد يكون الرابط منتهي الصلاحية (صالحة لـ 30 دقيقة).'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-['Cairo'] text-start text-slate-800" dir="rtl">
      {/* Top Bar (48px) - Exact Screen 06 */}
      <header className="w-full bg-white border-b border-[#E2E8F0] px-6 sm:px-12 h-12 flex items-center justify-between text-xs">
        <span className="text-[#64748B] font-semibold text-[13px]">
          منصة منارة لربط الخريجين بسوق العمل
        </span>
        <span className="text-[#0F1E36] font-bold text-[12px]">
          تعيين كلمة مرور جديدة
        </span>
      </header>

      {/* Main Centered Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[540px] bg-white border border-[#E2E8F0] rounded-[28px] shadow-[0_6px_20px_rgba(15,30,54,0.06)] p-8 sm:p-12 text-center space-y-6">
          {/* Logo container */}
          <div className="flex justify-center">
            <Link to="/">
              <img src={logoImg} alt="منارة" className="h-24 w-auto object-contain drop-shadow-sm hover:scale-105 transition" />
            </Link>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-[#0F1E36] tracking-tight">
              تعيين كلمة المرور الجديدة
            </h1>
            <p className="text-xs text-[#64748B] leading-relaxed max-w-sm mx-auto">
              أدخل كلمة مرور قوية وجديدة لحسابك لتأمين وصولك إلى منصة منارة
            </p>
          </div>

          {/* Success Notification */}
          {isSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-start space-y-4 transition-all duration-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl text-emerald-600">✓</span>
                <div>
                  <h4 className="text-sm font-black text-emerald-900">تم تحديث كلمة المرور بنجاح</h4>
                  <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                    تم تغيير كلمة المرور الخاصة بحسابك بنجاح. جاري تحويلك تلقائياً لصفحة الدخول...
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full h-11 rounded-xl bg-[#0F1E36] text-white font-bold text-xs flex items-center justify-center hover:bg-slate-900 transition"
                >
                  تسجيل الدخول الآن ➔
                </Link>
              </div>
            </div>
          ) : isTokenMissing ? (
            /* Missing / Invalid Token State */
            <div className="p-6 rounded-2xl bg-rose-50/80 border border-rose-200 text-start space-y-4 transition-all duration-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl text-rose-600">⚠️</span>
                <div>
                  <h4 className="text-sm font-black text-rose-900">رابط الاستعادة منتهي أو غير صالح</h4>
                  <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                    الرابط الذي استخدمته غير صالح أو انتهت صلاحيته الزمنية (30 دقيقة). يرجى طلب رابط جديد.
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  to="/forgot-password"
                  className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center transition"
                >
                  طلب رابط استعادة جديد ➔
                </Link>
              </div>
            </div>
          ) : (
            /* Password Reset Form */
            <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-start">
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold leading-relaxed flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-[#0F1E36] mb-1.5">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-12 px-4 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-start"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3.5 top-3.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    {showPassword ? 'إخفاء' : 'عرض'}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-[#0F1E36] mb-1.5">
                  تأكيد كلمة المرور
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-12 px-4 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-start"
                />
              </div>

              {/* Validation indicators */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px] font-semibold">
                <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <span>{hasMinLength ? '✓' : '○'}</span>
                  <span>8 خانات على الأقل</span>
                </div>
                <div className={`flex items-center gap-2 ${hasNumber && hasLetter ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <span>{hasNumber && hasLetter ? '✓' : '○'}</span>
                  <span>تشتمل على أحرف وأرقام معاً</span>
                </div>
                <div className={`flex items-center gap-2 ${isMatch ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <span>{isMatch ? '✓' : '○'}</span>
                  <span>تطابق كلمتي المرور</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-[#0F1E36] hover:bg-slate-900 disabled:opacity-60 text-white font-bold text-sm transition shadow-xs flex items-center justify-center gap-2 cursor-pointer pt-0.5"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <span>حفظ كلمة المرور الجديدة ➔</span>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-[11px] text-[#64748B]">
        جميع الحقوق محفوظة © منصة منارة 2026
      </footer>
    </div>
  )
}

export default AuthPasswordResetConfirmPage
