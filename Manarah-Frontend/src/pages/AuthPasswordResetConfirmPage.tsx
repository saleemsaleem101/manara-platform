import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { ThemeToggle } from '../components/ThemeToggle'
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
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] flex flex-col justify-between font-sans text-start text-[#0F172A] dark:text-white transition-colors duration-300 relative selection:bg-[#BAE6FD] selection:text-[#0284C7]" dir="rtl">
      {/* Background Decorative Glow Auras */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#BAE6FD]/20 dark:bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-10 w-96 h-96 bg-[#E8DEC8]/25 dark:bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Bar */}
      <header className="w-full glass-silk-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-[#E8DEC8] dark:border-slate-800 px-6 sm:px-12 h-16 flex items-center justify-between text-xs sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <BrandLogo size="sm" showSubline={false} />
          <span className="text-[#E8DEC8] dark:text-slate-700">/</span>
          <span className="text-[#0284C7] dark:text-[#38BDF8] bg-[#BAE6FD]/30 dark:bg-sky-950/50 border border-[#BAE6FD] dark:border-sky-800 px-3 py-1 rounded-full font-bold text-[11px]">
            تعيين كلمة مرور جديدة
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Centered Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-[540px] glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-[#E8DEC8] dark:border-slate-800 rounded-3xl shadow-xl p-8 sm:p-12 text-center space-y-6">
          {/* Glowing Logo */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] rounded-2xl blur-xs opacity-75" />
              <div className="relative w-14 h-14 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center p-2 border border-[#E8DEC8] dark:border-slate-800 shadow-sm">
                <img src="/logo_trimmed.png" alt="منارة" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
              تعيين كلمة المرور الجديدة
            </h1>
            <p className="text-xs text-[#6C4F3D] dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              أدخل كلمة مرور قوية وجديدة لحسابك لتأمين وصولك إلى منصة منارة
            </p>
          </div>

          {/* Success Notification */}
          {isSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-start space-y-4 transition-all duration-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl text-emerald-700 dark:text-emerald-400">✓</span>
                <div>
                  <h4 className="text-sm font-black text-emerald-700 dark:text-emerald-400">تم تحديث كلمة المرور بنجاح</h4>
                  <p className="text-xs text-emerald-700/90 dark:text-emerald-300/90 mt-1 leading-relaxed">
                    تم تغيير كلمة المرور الخاصة بحسابك بنجاح. جاري تحويلك تلقائياً لصفحة الدخول...
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white font-black text-xs flex items-center justify-center transition shadow-md shadow-sky-500/20"
                >
                  تسجيل الدخول الآن ➔
                </Link>
              </div>
            </div>
          ) : isTokenMissing ? (
            /* Missing / Invalid Token State */
            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-start space-y-4 transition-all duration-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl text-rose-700 dark:text-rose-400">⚠️</span>
                <div>
                  <h4 className="text-sm font-black text-rose-700 dark:text-rose-400">رابط الاستعادة منتهي أو غير صالح</h4>
                  <p className="text-xs text-rose-700/90 dark:text-rose-300/90 mt-1 leading-relaxed">
                    الرابط الذي استخدمته غير صالح أو انتهت صلاحيته الزمنية (30 دقيقة). يرجى طلب رابط جديد.
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  to="/forgot-password"
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white font-black text-xs flex items-center justify-center transition shadow-md shadow-sky-500/20"
                >
                  طلب رابط استعادة جديد ➔
                </Link>
              </div>
            </div>
          ) : (
            /* Password Reset Form */
            <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-start">
              {errorMessage && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-bold leading-relaxed flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-12 px-4 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-xs font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 transition text-start placeholder:text-[#6C4F3D]/40 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3.5 top-3.5 text-[#6C4F3D] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white text-xs font-bold cursor-pointer"
                  >
                    {showPassword ? 'إخفاء' : 'عرض'}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">
                  تأكيد كلمة المرور
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-12 px-4 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-xs font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 transition text-start placeholder:text-[#6C4F3D]/40 dark:placeholder:text-slate-500"
                />
              </div>

              {/* Validation indicators */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700 space-y-1.5 text-[11px] font-semibold">
                <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-[#6C4F3D]/50 dark:text-slate-500'}`}>
                  <span>{hasMinLength ? '✓' : '○'}</span>
                  <span>8 خانات على الأقل</span>
                </div>
                <div className={`flex items-center gap-2 ${hasNumber && hasLetter ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-[#6C4F3D]/50 dark:text-slate-500'}`}>
                  <span>{hasNumber && hasLetter ? '✓' : '○'}</span>
                  <span>تشتمل على أحرف وأرقام معاً</span>
                </div>
                <div className={`flex items-center gap-2 ${isMatch ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-[#6C4F3D]/50 dark:text-slate-500'}`}>
                  <span>{isMatch ? '✓' : '○'}</span>
                  <span>تطابق كلمتي المرور</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] disabled:opacity-50 text-white font-black text-sm transition shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer pt-0.5"
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

      <footer className="py-4 text-center text-[11px] text-[#6C4F3D] dark:text-slate-400 relative z-10">
        جميع الحقوق محفوظة © منصة منارة 2026
      </footer>
    </div>
  )
}

export default AuthPasswordResetConfirmPage
