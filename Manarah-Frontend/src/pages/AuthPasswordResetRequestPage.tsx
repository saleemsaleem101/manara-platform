import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import logoImg from '../assets/logo_transparent.png'
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-['Cairo'] text-start text-slate-800" dir="rtl">
      {/* Top Bar (48px) */}
      <header className="w-full bg-white border-b border-[#E2E8F0] px-6 sm:px-12 h-12 flex items-center justify-between text-xs">
        <span className="text-[#64748B] font-semibold text-[13px]">
          منصة منارة لربط الخريجين بسوق العمل
        </span>
        <span className="text-[#0F1E36] font-bold text-[12px]">
          استعادة كلمة المرور
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
              نسيت كلمة المرور؟
            </h1>
            <p className="text-xs text-[#64748B] leading-relaxed max-w-sm mx-auto">
              أدخل بريدك الإلكتروني المسجل في منصة منارة وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور
            </p>
          </div>

          {/* Success Notification (Appears only after successful submission) */}
          {isSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-start space-y-4 transition-all duration-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl text-emerald-600">✓</span>
                <div>
                  <h4 className="text-sm font-black text-emerald-900">تم إرسال الرابط بنجاح</h4>
                  <p className="text-xs text-emerald-700 mt-1 leading-relaxed">{successMessage}</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false)
                    setEmail('')
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-emerald-300 text-emerald-800 font-bold text-xs hover:bg-emerald-100/60 transition cursor-pointer"
                >
                  إرسال لبريد آخر ↻
                </button>
                <Link
                  to="/login"
                  className="flex-1 py-2.5 rounded-xl bg-[#0F1E36] text-white font-bold text-xs text-center hover:bg-slate-900 transition"
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
                <label className="block text-xs font-bold text-[#0F1E36] mb-1.5">
                  البريد الإلكتروني المسجل
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-start font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-[#0F1E36] hover:bg-slate-900 disabled:opacity-60 text-white font-bold text-sm transition shadow-xs flex items-center justify-center gap-2 cursor-pointer pt-0.5"
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
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition"
                >
                  تذكرت كلمة المرور؟ <span className="font-bold text-[#D97706]">تسجيل الدخول</span>
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
