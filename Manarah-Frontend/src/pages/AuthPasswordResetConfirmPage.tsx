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
        msg || 'فشل إعادة تعيين كلمة المرور. قد يكون الرابط منتهي الصلاحية.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-['Cairo'] text-start text-slate-800" dir="rtl">
      {/* Top Bar (48px) */}
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
              تعيين كلمة مرور جديدة
            </h1>
            <p className="text-xs text-[#64748B] leading-relaxed max-w-sm mx-auto">
              أدخل كلمة المرور الجديدة وتأكيدها لتأمين حسابك والوصول إليه مجدداً
            </p>
          </div>

          {/* Success State */}
          {isSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-start space-y-4 transition-all duration-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl text-emerald-600">✓</span>
                <div>
                  <h4 className="text-sm font-black text-emerald-900">تم تحديث كلمة المرور بنجاح</h4>
                  <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                    تم تغيير كلمة المرور لحسابك بنجاح. جاري تحويلك تلقائياً لصفحة تسجيل الدخول...
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full py-2.5 rounded-xl bg-[#0F1E36] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-900 transition"
                >
                  <span>تسجيل الدخول الآن ➔</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Reset Form */
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
                  كلمة المرور الجديدة *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isTokenMissing || isLoading}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-12 px-4 pe-11 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-start disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer p-0.5"
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-[#0F1E36] mb-1.5">
                  تأكيد كلمة المرور الجديدة *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isTokenMissing || isLoading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-start disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || isTokenMissing}
                className="w-full h-12 rounded-xl bg-[#0F1E36] hover:bg-slate-900 disabled:opacity-60 text-white font-bold text-sm transition shadow-xs flex items-center justify-center gap-2 cursor-pointer pt-0.5"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري تحديث كلمة المرور...</span>
                  </>
                ) : (
                  <span>حفظ كلمة المرور الجديدة ➔</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition"
                >
                  إلغاء والعودة إلى <span className="font-bold text-[#D97706]">تسجيل الدخول</span>
                </Link>
              </div>
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
