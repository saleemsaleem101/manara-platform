import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { ThemeToggle } from '../components/ThemeToggle'
import { useProfile } from '../context/ProfileContext'
import { api } from '../services/api'

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { profile, verifyEmail } = useProfile()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resendTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (resendTimeoutRef.current) clearTimeout(resendTimeoutRef.current)
    }
  }, [])

  // Email state (from query param, route state, sessionStorage, or profile)
  const [targetEmail, setTargetEmail] = useState<string>(() => {
    return (
      searchParams.get('email') ||
      (location.state as { email?: string })?.email ||
      sessionStorage.getItem('manarah_registered_email') ||
      profile.email ||
      ''
    )
  })

  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(!targetEmail)
  const [code, setCode] = useState<string>(() => searchParams.get('code') || searchParams.get('token') || '')

  // Verification states
  const [isVerifying, setIsVerifying] = useState<boolean>(false)
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false)
  const [verificationError, setVerificationError] = useState<string>('')

  // Resend OTP states
  const [resendTimer, setResendTimer] = useState<number>(60)
  const [isResending, setIsResending] = useState<boolean>(false)
  const [resendMessage, setResendMessage] = useState<string>('')
  const [resendError, setResendError] = useState<string>('')

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendTimer])

  // Automatic verification if URL contains both code/token and email
  useEffect(() => {
    const urlCode = (searchParams.get('code') || searchParams.get('token') || '').trim()
    const urlEmail = (searchParams.get('email') || targetEmail).trim()

    if (urlCode && urlEmail && !verificationSuccess) {
      let isCurrent = true
      setIsVerifying(true)
      setVerificationError('')

      api.verifyEmail(urlCode, urlEmail)
        .then(async (res) => {
          if (!isCurrent) return
          setVerificationSuccess(true)
          setIsVerifying(false)
          sessionStorage.removeItem('manarah_registered_email')

          if (res.user) {
            await verifyEmail(res.user)
          }

          timeoutRef.current = setTimeout(() => {
            const uRole = res.user?.role || localStorage.getItem('manarah_user_role')
            if (uRole === 'ADMIN') {
              navigate('/admin')
            } else if (uRole === 'COMPANY') {
              navigate('/company/jobs')
            } else {
              navigate('/profile')
            }
          }, 1800)
        })
        .catch((err: unknown) => {
          if (!isCurrent) return
          setIsVerifying(false)
          const msg = (err as { message?: string })?.message
          setVerificationError(msg || 'رمز التحقق غير صالح أو انتهت صلاحيته (صلاحية الرمز 10 دقائق).')
        })

      return () => {
        isCurrent = false
      }
    }
  }, [searchParams, targetEmail, verifyEmail, navigate, verificationSuccess])

  // Handle Manual OTP Code Submission
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCode = code.trim().replace(/\D/g, '')
    const emailToUse = targetEmail.trim()

    if (!emailToUse) {
      setVerificationError('يرجى تحديد البريد الإلكتروني للمتابعة.')
      return
    }

    if (cleanCode.length !== 6) {
      setVerificationError('يرجى إدخال رمز التحقق المكون من 6 أرقام كاملاً.')
      return
    }

    setIsVerifying(true)
    setVerificationError('')
    setVerificationSuccess(false)

    try {
      const res = await api.verifyEmail(cleanCode, emailToUse)
      setVerificationSuccess(true)
      sessionStorage.removeItem('manarah_registered_email')

      if (res.user) {
        await verifyEmail(res.user)
      }

      timeoutRef.current = setTimeout(() => {
        const uRole = res.user?.role || localStorage.getItem('manarah_user_role')
        if (uRole === 'ADMIN') {
          navigate('/admin')
        } else if (uRole === 'COMPANY') {
          navigate('/company/jobs')
        } else {
          navigate('/profile')
        }
      }, 1800)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      setVerificationError(msg || 'رمز التحقق غير صحيح أو انتهت صلاحيته. يرجى المحاولة أو طلب رمز جديد.')
    } finally {
      setIsVerifying(false)
    }
  }

  // Handle Resend OTP Code
  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return
    const emailToUse = targetEmail.trim()
    if (!emailToUse) {
      setResendError('يرجى تحديد البريد الإلكتروني لإعادة إرسال الرمز.')
      return
    }

    setIsResending(true)
    setResendError('')
    setResendMessage('')

    try {
      const res = await api.resendOTP(emailToUse)
      setResendTimer(60)
      setResendMessage(res.message || 'تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني بنجاح.')
      if (resendTimeoutRef.current) clearTimeout(resendTimeoutRef.current)
      resendTimeoutRef.current = setTimeout(() => setResendMessage(''), 7000)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      setResendError(msg || 'تعذر إعادة إرسال الرمز. يرجى المحاولة بعد قليل.')
    } finally {
      setIsResending(false)
    }
  }

  const handleOpenMailClient = () => {
    if (targetEmail.includes('@gmail.com')) {
      window.open('https://mail.google.com', '_blank')
    } else if (targetEmail.includes('@outlook.com') || targetEmail.includes('@hotmail.com')) {
      window.open('https://outlook.live.com', '_blank')
    } else if (targetEmail.includes('@yahoo.com')) {
      window.open('https://mail.yahoo.com', '_blank')
    } else {
      window.location.href = `mailto:${targetEmail}`
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
            تأكيد البريد الإلكتروني
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Centered Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-[560px] glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-[#E8DEC8] dark:border-slate-800 rounded-3xl shadow-xl p-8 sm:p-12 text-center space-y-6">
          {/* Glowing Logo */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] rounded-2xl blur-xs opacity-75" />
              <div className="relative w-14 h-14 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center p-2 border border-[#E8DEC8] dark:border-slate-800 shadow-sm">
                <img src="/logo_trimmed.png" alt="منارة" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          {/* Success State */}
          {verificationSuccess ? (
            <div className="space-y-5 transition-all duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-3xl mx-auto ring-8 ring-emerald-500/20">
                ✓
              </div>
              <div>
                <h2 className="text-2xl font-black text-emerald-700 dark:text-emerald-400">تم تفعيل الحساب بنجاح!</h2>
                <p className="text-xs text-[#6C4F3D] dark:text-slate-400 mt-2 leading-relaxed">
                  تم تأكيد بريدك الإلكتروني بنجاح وأصبح حسابك نشطاً بالكامل. جاري نقلك تلقائياً...
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const uRole = localStorage.getItem('manarah_user_role')
                    if (uRole === 'ADMIN') navigate('/admin/dashboard')
                    else if (uRole === 'COMPANY') navigate('/company/jobs')
                    else navigate('/profile')
                  }}
                  className="inline-flex items-center justify-center w-full h-12 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white font-black text-sm transition shadow-md shadow-sky-500/20 cursor-pointer"
                >
                  المتابعة إلى لوحة التحكم ➔
                </button>
              </div>
            </div>
          ) : (
            /* Active OTP Verification Form */
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#BAE6FD]/30 dark:bg-sky-950/50 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center text-3xl mx-auto ring-8 ring-[#BAE6FD]/20 dark:ring-sky-500/10">
                ✉️
              </div>

              <div>
                <h1 className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
                  تأكيد وتفعيل البريد الإلكتروني
                </h1>
                <p className="text-xs text-[#6C4F3D] dark:text-slate-400 mt-1.5 leading-relaxed">
                  تم إرسال رمز التحقق المكون من 6 أرقام إلى:
                </p>

                {/* Target Email display / edit */}
                {!isEditingEmail && targetEmail ? (
                  <div className="mt-2.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF7F2] dark:bg-slate-800/80 border border-[#E8DEC8] dark:border-slate-700">
                    <span className="text-xs font-mono font-bold text-[#0F172A] dark:text-white">{targetEmail}</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(true)}
                      className="text-[11px] text-[#0284C7] dark:text-[#38BDF8] hover:underline font-bold transition cursor-pointer"
                    >
                      تغيير
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 max-w-sm mx-auto flex items-center gap-2">
                    <input
                      type="email"
                      value={targetEmail}
                      onChange={(e) => setTargetEmail(e.target.value)}
                      placeholder=""
                      className="flex-1 h-10 px-3.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 text-xs font-mono text-center focus:outline-none focus:border-[#38BDF8] bg-[#FAF7F2] dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-[#0F172A] dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(false)}
                      disabled={!targetEmail.trim()}
                      className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white text-xs font-bold hover:from-[#0369A1] hover:to-[#0284C7] transition disabled:opacity-40 cursor-pointer"
                    >
                      حفظ
                    </button>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {verificationError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-bold text-center">
                  ⚠️ {verificationError}
                </div>
              )}

              {/* Resend Feedback */}
              {resendMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold">
                  ✓ {resendMessage}
                </div>
              )}
              {resendError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-bold">
                  ⚠️ {resendError}
                </div>
              )}

              {/* OTP Form */}
              <form onSubmit={handleVerifySubmit} className="space-y-4 pt-1">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200">
                    أدخل رمز التحقق (OTP) المكون من 6 أرقام:
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setCode(val)
                      if (verificationError) setVerificationError('')
                    }}
                    placeholder="• • • • • •"
                    className="w-full h-14 text-center font-mono text-2xl tracking-[0.4em] font-black rounded-2xl border-2 border-[#E8DEC8] dark:border-slate-700 focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 bg-[#FAF7F2] dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none transition shadow-sm placeholder:text-[#6C4F3D]/30 dark:placeholder:text-slate-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || code.trim().length !== 6 || !targetEmail.trim()}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] disabled:opacity-50 text-white font-black text-sm transition flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري التحقق والتفعيل...</span>
                    </>
                  ) : (
                    <span>تأكيد وتفعيل الحساب ➔</span>
                  )}
                </button>
              </form>

              {/* 10-Minute Expiration Notice */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700 text-start flex items-center gap-3">
                <span className="text-lg text-[#0284C7] dark:text-[#38BDF8]">⏱️</span>
                <div className="text-[11px] text-[#6C4F3D] dark:text-slate-300 leading-relaxed font-semibold">
                  <span className="font-bold text-[#0F172A] dark:text-white ms-1">صلاحية الرمز: 10 دقائق.</span>
                  إذا لم تجد الرسالة في صندوق الوارد، يرجى تفقد مجلد الرسائل غير المرغوب فيها (Spam / Junk).
                </div>
              </div>

              {/* Action: Open Email Client */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={handleOpenMailClient}
                  className="w-full h-11 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 hover:bg-[#E8DEC8]/40 dark:hover:bg-slate-700 border border-[#E8DEC8] dark:border-slate-700 text-[#0F172A] dark:text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <svg className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>فتح صندوق البريد الوارد</span>
                </button>

                {/* Resend Link with 60s Countdown */}
                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <span className="text-[#6C4F3D] dark:text-slate-400 font-medium">لم يصلك الرمز؟</span>
                  <button
                    type="button"
                    disabled={resendTimer > 0 || isResending}
                    onClick={handleResend}
                    className="text-[#0284C7] dark:text-[#38BDF8] hover:text-[#0369A1] disabled:text-slate-400 font-bold transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isResending
                      ? 'جاري الإرسال...'
                      : resendTimer > 0
                      ? `إعادة الإرسال بعد (${resendTimer} ثانية)`
                      : 'إعادة إرسال رمز جديد ↻'}
                  </button>
                </div>
              </div>

              {/* Secondary options */}
              <div className="pt-4 border-t border-[#E8DEC8] dark:border-slate-800 flex items-center justify-center gap-4 text-xs">
                <Link
                  to="/register"
                  className="text-[#6C4F3D] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white font-semibold transition"
                >
                  تسجيل حساب جديد
                </Link>
                <span className="text-[#E8DEC8] dark:text-slate-700">•</span>
                <Link
                  to="/login"
                  className="text-[#6C4F3D] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white font-semibold transition"
                >
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-[#6C4F3D] dark:text-slate-400 relative z-10">
        جميع الحقوق محفوظة © منصة منارة 2026
      </footer>
    </div>
  )
}

export default VerifyEmailPage
