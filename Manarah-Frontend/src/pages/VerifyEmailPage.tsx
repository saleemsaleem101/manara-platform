import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import logoImg from '../assets/logo_transparent.png'
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
            navigate('/profile')
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
        navigate('/profile')
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-['Cairo'] text-start text-slate-800" dir="rtl">
      {/* Top Bar (48px) */}
      <header className="w-full bg-white border-b border-[#E2E8F0] px-6 sm:px-12 h-12 flex items-center justify-between text-xs">
        <span className="text-[#64748B] font-semibold text-[13px]">
          منصة منارة لربط الخريجين بسوق العمل
        </span>
        <span className="text-[#0F1E36] font-bold text-[12px]">
          تفعيل البريد الإلكتروني
        </span>
      </header>

      {/* Main Centered Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[560px] bg-white border border-[#E2E8F0] rounded-[28px] shadow-[0_6px_20px_rgba(15,30,54,0.06)] p-8 sm:p-12 text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Link to="/">
              <img src={logoImg} alt="منارة" className="h-20 w-auto object-contain drop-shadow-sm hover:scale-105 transition" />
            </Link>
          </div>

          {/* Success State */}
          {verificationSuccess ? (
            <div className="space-y-5 transition-all duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto ring-8 ring-emerald-50">
                ✓
              </div>
              <div>
                <h2 className="text-2xl font-black text-emerald-800">تم تفعيل الحساب بنجاح!</h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  تم تأكيد بريدك الإلكتروني بنجاح وأصبح حسابك نشطاً بالكامل. جاري نقلك تلقائياً...
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="inline-flex items-center justify-center w-full h-[46px] rounded-xl bg-[#0F1E36] hover:bg-slate-900 text-white font-bold text-sm transition shadow-sm cursor-pointer"
                >
                  المتابعة إلى الملف المهني ➔
                </button>
              </div>
            </div>
          ) : (
            /* Active OTP Verification Form */
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mx-auto ring-8 ring-amber-50">
                ✉️
              </div>

              <div>
                <h1 className="text-2xl font-black text-[#0F1E36] tracking-tight">
                  تأكيد وتفعيل البريد الإلكتروني
                </h1>
                <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                  تم إرسال رمز التحقق الأكاديمي المكون من 6 أرقام إلى:
                </p>

                {/* Target Email display / edit */}
                {!isEditingEmail && targetEmail ? (
                  <div className="mt-2.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                    <span className="text-xs font-mono font-bold text-[#0F1E36]">{targetEmail}</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(true)}
                      className="text-[11px] text-amber-600 hover:text-amber-700 font-bold underline transition cursor-pointer"
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
                      placeholder="name@example.com"
                      className="flex-1 h-10 px-3.5 rounded-xl border border-slate-300 text-xs font-mono text-center focus:outline-none focus:border-amber-500 bg-slate-50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(false)}
                      disabled={!targetEmail.trim()}
                      className="h-10 px-3.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition disabled:bg-slate-300 cursor-pointer"
                    >
                      حفظ
                    </button>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {verificationError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold text-center">
                  ⚠️ {verificationError}
                </div>
              )}

              {/* Resend Feedback */}
              {resendMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
                  ✓ {resendMessage}
                </div>
              )}
              {resendError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
                  ⚠️ {resendError}
                </div>
              )}

              {/* OTP Form */}
              <form onSubmit={handleVerifySubmit} className="space-y-4 pt-1">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#0F1E36]">
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
                    className="w-full h-14 text-center font-mono text-2xl tracking-[0.4em] font-black rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:bg-white bg-slate-50 text-[#0F1E36] focus:outline-none transition shadow-inner placeholder:text-slate-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || code.trim().length !== 6 || !targetEmail.trim()}
                  className="w-full h-12 rounded-xl bg-[#0F1E36] hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:cursor-not-allowed"
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
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-start flex items-center gap-3">
                <span className="text-lg text-amber-600">⏱️</span>
                <div className="text-[11px] text-amber-900 leading-relaxed font-semibold">
                  <span className="font-bold text-amber-950 ms-1">صلاحية الرمز: 10 دقائق.</span>
                  إذا لم تجد الرسالة في صندوق الوارد، يرجى تفقد مجلد الرسائل غير المرغوب فيها (Spam / Junk).
                </div>
              </div>

              {/* Action: Open Email Client */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={handleOpenMailClient}
                  className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F1E36] font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>فتح صندوق البريد الوارد</span>
                </button>

                {/* Resend Link with 60s Countdown */}
                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <span className="text-slate-500 font-medium">لم يصلك الرمز؟</span>
                  <button
                    type="button"
                    disabled={resendTimer > 0 || isResending}
                    onClick={handleResend}
                    className="text-amber-600 hover:text-amber-700 disabled:text-slate-400 font-bold transition cursor-pointer disabled:cursor-not-allowed"
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
              <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-xs">
                <Link
                  to="/register"
                  className="text-slate-500 hover:text-slate-800 font-semibold transition"
                >
                  تسجيل حساب جديد
                </Link>
                <span className="text-slate-300">•</span>
                <Link
                  to="/login"
                  className="text-slate-500 hover:text-slate-800 font-semibold transition"
                >
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-[#64748B]">
        جميع الحقوق محفوظة © منصة منارة 2026
      </footer>
    </div>
  )
}

export default VerifyEmailPage
