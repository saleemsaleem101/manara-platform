import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { ThemeToggle } from '../components/ThemeToggle'
import { api } from '../services/api'

export const AuthPasswordResetRequestPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('يرجى إدخال بريد إلكتروني صحيح.')
      return
    }

    setIsLoading(true)
    try {
      const res = await api.requestPasswordReset(email.trim())
      setIsSuccess(true)
      setSuccessMessage(
        res.message ||
          'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح. يرجى مراجعة صندوق الوارد.'
      )
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      setErrorMessage(
        msg || 'تعذر إرسال رابط الاستعادة. يرجى التأكد من أن البريد مسجل في المنصة.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-between font-['Cairo'] text-start text-[#0F172A]" dir="rtl">
      {/* Top Bar */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-[#EAE4D9] px-6 sm:px-12 h-16 flex items-center justify-between text-xs sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <BrandLogo size="sm" showSubline={false} />
          <span className="text-slate-300">/</span>
          <span className="text-[#0284C7] bg-[#E8F4FC] border border-[#BAE3F9] px-3 py-1 rounded-full font-bold text-[11px]">
            استعادة كلمة المرور
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Centered Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[540px] bg-white border border-[#EAE4D9] rounded-3xl shadow-2xs p-8 sm:p-12 text-center space-y-6">
          {/* Logo container with glow */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#10B981] rounded-2xl blur-xs opacity-75" />
              <div className="relative w-14 h-14 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center p-2 border border-[#EAE4D9] shadow-xs">
                <img src="/logo_trimmed.png" alt="منارة" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
              نسيت كلمة المرور؟
            </h1>
            <p className="text-xs text-[#64748B] leading-relaxed max-w-sm mx-auto">
              أدخل بريدك الإلكتروني المسجل في منصة منارة وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور
            </p>
          </div>

          {/* Success Notification */}
          {isSuccess ? (
            <div className="p-6 rounded-2xl bg-[#E8F8F2] border border-[#BDE8D2] text-start space-y-4 transition-all duration-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl text-[#0D6E44]">✓</span>
                <div>
                  <h4 className="text-sm font-black text-[#0D6E44]">تم إرسال الرابط بنجاح</h4>
                  <p className="text-xs text-[#0D6E44]/90 mt-1 leading-relaxed">{successMessage}</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false)
                    setEmail('')
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-[#BDE8D2] bg-white text-[#0D6E44] font-bold text-xs hover:bg-[#E8F8F2] transition cursor-pointer"
                >
                  إرسال لبريد آخر ↻
                </button>
                <Link
                  to="/login"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#10B981] hover:from-[#0369A1] hover:to-[#059669] text-white font-black text-xs text-center transition shadow-xs"
                >
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </div>
          ) : (
            /* Request Form */
            <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-start">
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold leading-relaxed flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                  البريد الإلكتروني المسجل
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  className="w-full h-12 px-4 rounded-xl border border-[#CBD5E1] bg-[#FBF9F5] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition text-start"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#10B981] hover:from-[#0369A1] hover:to-[#059669] disabled:opacity-50 text-white font-black text-sm transition shadow-xs flex items-center justify-center gap-2 cursor-pointer pt-0.5"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <span>إرسال رابط الاستعادة ➔</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="text-xs text-[#64748B] hover:text-[#0F172A] font-semibold transition"
                >
                  تذكرت كلمة المرور؟ <span className="font-bold text-[#0284C7]">تسجيل الدخول</span>
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

export default AuthPasswordResetRequestPage
