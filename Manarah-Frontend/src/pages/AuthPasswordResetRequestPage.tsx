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
            استعادة كلمة المرور
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Centered Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-[540px] glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-[#E8DEC8] dark:border-slate-800 rounded-3xl shadow-xl p-8 sm:p-12 text-center space-y-6">
          {/* Logo container with glow */}
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
              نسيت كلمة المرور؟
            </h1>
            <p className="text-xs text-[#6C4F3D] dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              أدخل بريدك الإلكتروني المسجل في منصة منارة وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور
            </p>
          </div>

          {/* Success Notification */}
          {isSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-start space-y-4 transition-all duration-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl text-emerald-700 dark:text-emerald-400">✓</span>
                <div>
                  <h4 className="text-sm font-black text-emerald-700 dark:text-emerald-400">تم إرسال الرابط بنجاح</h4>
                  <p className="text-xs text-emerald-700/90 dark:text-emerald-300/90 mt-1 leading-relaxed">{successMessage}</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false)
                    setEmail('')
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white font-bold text-xs hover:bg-[#FAF7F2] dark:hover:bg-slate-700 transition cursor-pointer shadow-sm"
                >
                  إرسال لبريد آخر ↻
                </button>
                <Link
                  to="/login"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white font-black text-xs text-center transition shadow-md shadow-sky-500/20"
                >
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </div>
          ) : (
            /* Request Form */
            <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-start">
              {errorMessage && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-bold leading-relaxed flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">
                  البريد الإلكتروني المسجل
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  className="w-full h-12 px-4 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-xs font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 transition text-start"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] disabled:opacity-50 text-white font-black text-sm transition shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer pt-0.5"
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
                  className="text-xs text-[#6C4F3D] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white font-semibold transition"
                >
                  تذكرت كلمة المرور؟ <span className="font-bold text-[#0284C7] dark:text-[#38BDF8]">تسجيل الدخول</span>
                </Link>
              </div>
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

export default AuthPasswordResetRequestPage
