import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { ThemeToggle } from '../components/ThemeToggle'
import { useProfile } from '../context/ProfileContext'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useProfile()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isUnverified, setIsUnverified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsUnverified(false)
    setIsLoading(true)

    try {
      await login(email, password)
      const storedRole = localStorage.getItem('manarah_user_role') || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('manarah_user_role') : null)
      if (storedRole === 'ADMIN') {
        navigate('/admin')
      } else if (storedRole === 'COMPANY') {
        navigate('/company/jobs')
      } else {
        navigate('/profile')
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string; status?: number } | undefined
      const msg = errorObj?.message || 'بيانات الاعتماد غير صحيحة. يرجى التحقق من البريد وكلمة المرور.'
      setError(msg)
      if (errorObj?.status === 403 || msg.includes('تأكيد بريدك') || msg.includes('تفعيل')) {
        setIsUnverified(true)
        sessionStorage.setItem('manarah_registered_email', email)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-between" dir="rtl">
      {/* Top Bar */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-[#EAE4D9] px-6 sm:px-12 h-16 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <BrandLogo size="sm" showSubline={false} />
          <span className="text-slate-300">/</span>
          <span className="text-[#0284C7] font-black text-[12px] bg-[#E8F4FC] px-3 py-1 rounded-full border border-[#BAE3F9]">
            تسجيل الدخول
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link to="/" className="text-[#64748B] hover:text-[#0284C7] font-semibold text-[13px] transition flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EAE4D9] bg-white">
            <span>الرئيسية</span>
            <span>➔</span>
          </Link>
        </div>
      </header>

      {/* Main Centered Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[1240px] bg-white border border-[#EAE4D9] rounded-[28px] shadow-[0_6px_24px_rgba(15,23,42,0.04)] overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[720px]">
          {/* Brand Visual Section */}
          <div className="bg-[#FAF8F5] p-8 sm:p-14 flex flex-col items-center justify-center relative overflow-hidden text-center border-b lg:border-b-0 lg:border-e border-[#EAE4D9]">
            {/* Halo light */}
            <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#BAE6FD]/40 to-[#DCFCE7]/30 blur-3xl absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 space-y-6 max-w-md flex flex-col items-center">
              {/* Glowing Logo Card */}
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#10B981] rounded-3xl blur-md opacity-70" />
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xs border border-[#EAE4D9] dark:border-slate-700 flex items-center justify-center">
                  <img
                    src="/logo_trimmed.png"
                    alt="شعار منصة منارة الرسمي"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-[26px] sm:text-[28px] font-black text-[#0F172A]">
                  تسجيل الدخول إلى منارة
                </h2>
                <p className="text-[14px] sm:text-[15px] font-bold text-[#0284C7]">
                  بوابة الكفاءات والربط المهني الذكي
                </p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 sm:p-14 lg:p-16 flex flex-col justify-center">
            <div className="max-w-[460px] mx-auto w-full space-y-6">
              {/* Pill: بوابة الدخول */}
              <div className="inline-block px-4 py-1.5 bg-[#E8F4FC] text-[#0284C7] border border-[#BAE3F9] text-[12px] font-black rounded-full">
                بوابة الدخول الموحدة
              </div>

              <div className="space-y-1">
                <h1 className="text-[28px] font-black text-[#0F172A] tracking-tight">
                  مرحباً بعودتك
                </h1>
                <p className="text-[13px] text-[#64748B] leading-relaxed">
                  أدخل بيانات اعتماد حسابك للوصول إلى لوحة التحكم والفرص المتاحة
                </p>
              </div>

              {/* Error Alert Banner */}
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-[14px] text-xs font-bold leading-relaxed text-start space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <span>{error}</span>
                  </div>
                  {isUnverified && (
                    <div className="pt-2 border-t border-rose-200 flex justify-end">
                      <Link
                        to="/verify-email"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition"
                      >
                        <span>الانتقال لصفحة تفعيل الحساب بالرمز ←</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                {/* Email */}
                <div>
                  <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5 text-start">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=""
                    className="w-full h-[48px] px-4 rounded-[12px] border border-[#CBD5E1] bg-[#FBF9F5] text-[13px] font-semibold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition text-start"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[12px] font-bold text-[#0F172A]">كلمة المرور</label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] font-bold text-[#0284C7] hover:underline transition"
                    >
                      نسيت كلمة المرور؟
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-[48px] px-4 pe-11 rounded-[12px] border border-[#CBD5E1] bg-[#FBF9F5] text-[14px] font-semibold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition text-start"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition cursor-pointer p-0.5"
                      tabIndex={-1}
                      aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[52px] bg-gradient-to-r from-[#0284C7] to-[#10B981] hover:from-[#0369A1] hover:to-[#059669] disabled:opacity-60 text-white text-[15px] font-black rounded-[14px] shadow-sm transition transform active:scale-[0.99] cursor-pointer mt-3 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري التحقق وتسجيل الدخول...</span>
                    </>
                  ) : (
                    <span>تسجيل الدخول</span>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="text-center pt-3 text-[13px] text-[#64748B]">
                ليس لديك حساب بعد؟{' '}
                <Link to="/register" className="text-[#0284C7] font-black hover:underline">
                  إنشاء حساب جديد
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-4" />
    </div>
  )
}

export default LoginPage
