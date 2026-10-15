import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import logoImg from '../assets/logo_transparent.png'
import { useProfile } from '../context/ProfileContext'
import { api } from '../services/api'

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { profile, verifyEmail } = useProfile()

  const urlEmail = searchParams.get('email') || ''
  const locationEmail = (location.state as { email?: string })?.email || ''
  const sessionEmail = sessionStorage.getItem('manarah_registered_email') || ''
  const targetEmail = urlEmail || locationEmail || sessionEmail || profile.email || ''

  const urlCode = searchParams.get('code') || searchParams.get('token') || ''
  const demoOtp = sessionStorage.getItem('manarah_demo_otp') || (urlCode && urlCode.length === 6 ? urlCode : null)

  const [otp, setOtp] = useState<string[]>(() => {
    if (urlCode && urlCode.length === 6) {
      return urlCode.split('')
    }
    return ['', '', '', '', '', '']
  })
  const [error, setError] = useState('')
  const [resendMessage, setResendMessage] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendTimer <= 0) return
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendTimer])

  const executeVerification = useCallback(async (codeToVerify: string, emailToVerify: string) => {
    if (codeToVerify.length !== 6 || !emailToVerify) return
    setIsVerifying(true)
    setError('')
    try {
      const res = await api.verifyEmail(codeToVerify, emailToVerify)
      if (res.user) {
        verifyEmail(res.user)
      }
      setIsSuccess(true)
      sessionStorage.removeItem('manarah_demo_otp')
      sessionStorage.removeItem('manarah_registered_email')
      setTimeout(() => {
        navigate('/profile')
      }, 1200)
    } catch (err: any) {
      setError(err.message || 'رمز التحقق غير صحيح أو انتهت صلاحيته (صلاحية الرمز 10 دقائق).')
    } finally {
      setIsVerifying(false)
    }
  }, [navigate, verifyEmail])

  // إذا وصل المستخدم عبر نقر الرابط المباشر في البريد (email + code)
  useEffect(() => {
    if (urlCode && urlCode.length === 6 && urlEmail && !isSuccess && !isVerifying) {
      executeVerification(urlCode, urlEmail)
    }
  }, [urlCode, urlEmail, isSuccess, isVerifying, executeVerification])

  const handleChange = (index: number, val: string) => {
    setError('')
    // handle pasted string
    if (val.length > 1) {
      const digits = val.replace(/\D/g, '').slice(0, 6).split('')
      if (digits.length > 0) {
        const next = [...otp]
        digits.forEach((d, i) => {
          if (index + i < 6) next[index + i] = d
        })
        setOtp(next)
        const targetIdx = Math.min(index + digits.length, 5)
        inputsRef.current[targetIdx]?.focus()
        return
      }
    }

    const digit = val.slice(-1).replace(/\D/g, '')
    const next = [...otp]
    next[index] = digit
    setOtp(next)

    // auto focus next input if digit entered
    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6 || otp.some((d) => d === '')) {
      setError('يرجى إدخال رمز التحقق المكون من 6 أرقام كاملاً.')
      return
    }

    const emailToUse = targetEmail || sessionStorage.getItem('manarah_registered_email') || profile.email
    if (!emailToUse) {
      setError('يرجى تحديد البريد الإلكتروني للمتابعة.')
      return
    }

    await executeVerification(code, emailToUse)
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    setOtp(['', '', '', '', '', ''])
    setError('')
    setResendTimer(60)
    try {
      const emailToUse = targetEmail || sessionStorage.getItem('manarah_registered_email') || profile.email
      if (emailToUse) {
        const res = await api.resendOTP(emailToUse)
        if (res && res.dev_otp) {
          sessionStorage.setItem('manarah_demo_otp', res.dev_otp)
        }
      }
      setResendMessage('تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني بنجاح.')
    } catch (err: any) {
      setError(err.message || 'فشل إعادة إرسال الرمز.')
    }
    setTimeout(() => setResendMessage(''), 5000)
    inputsRef.current[0]?.focus()
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      {/* Top Bar (48px) - Exact 02_Auth_Verify_Email.svg */}
      <header className="w-full bg-white border-b border-[#E2E8F0] px-6 sm:px-12 h-12 flex items-center justify-between text-xs">
        <span className="text-[#64748B] font-semibold text-[13px]">
          منصة منارة لربط الخريجين بسوق العمل
        </span>
        <span className="text-[#0F1E36] font-bold text-[12px]">
          تفعيل البريد الإلكتروني
        </span>
      </header>

      {/* Main Centered Card (560px - Exact 02_Auth_Verify_Email.svg) */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[560px] bg-white border border-[#E2E8F0] rounded-[28px] shadow-[0_6px_20px_rgba(15,30,54,0.06)] p-8 sm:p-12 text-center space-y-6">
          {/* Logo container */}
          <div className="flex justify-center">
            <img src={logoImg} alt="منارة" className="h-28 w-auto object-contain drop-shadow-sm" />
          </div>

          <div>
            <h1 className="text-[28px] font-black text-[#0F1E36] tracking-tight">
              تفعيل الحساب الأكاديمي
            </h1>
            <p className="text-[13px] text-[#64748B] mt-2 leading-relaxed">
              أرسلنا رمز التفعيل المكون من 6 أرقام إلى بريدك الجامعي:
              <br />
              <span className="font-bold text-[#0F1E36] font-mono text-[15px] mt-1 inline-block">
                {targetEmail || 'البريد الإلكتروني المسجل'}
              </span>
            </p>
          </div>

          {/* Demo OTP Notice */}
          {demoOtp && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-[12px] text-xs font-semibold flex items-center justify-between">
              <span>رمز التحقق المؤقت لهذا الحساب:</span>
              <span className="font-mono font-black text-amber-950 text-sm tracking-widest">{demoOtp}</span>
            </div>
          )}

          {/* Success Toast */}
          {isSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[12px] text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in duration-150">
              <span>✓ تم التحقق بنجاح! جاري تحويلك إلى الملف المهني...</span>
            </div>
          )}

          {/* Resend Notice */}
          {resendMessage && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-[12px] text-xs font-bold">
              {resendMessage}
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-[12px] text-xs font-bold">
              {error}
            </div>
          )}

          {/* OTP Input Slots (60px x 70px) */}
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputsRef.current[i] = el
                  }}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={isSuccess || isVerifying}
                  className="w-12 h-16 sm:w-14 sm:h-[70px] text-center text-2xl font-bold rounded-[14px] border-2 border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white focus:border-[#F59E0B] focus:outline-none transition font-mono disabled:opacity-50"
                />
              ))}
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              disabled={isVerifying || isSuccess}
              className="w-full h-[52px] bg-[#F59E0B] hover:bg-amber-600 disabled:bg-slate-300 text-[#0F1E36] text-[16px] font-black rounded-[14px] shadow-sm transition transform active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <span>جاري التحقق...</span>
              ) : isSuccess ? (
                <span>تم التحقق بنجاح ✓</span>
              ) : (
                <span>تأكيد الرمز وتفعيل الحساب</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <p className="text-[#64748B]">
              لم يصلك الرمز؟{' '}
              <button
                type="button"
                disabled={resendTimer > 0}
                onClick={handleResend}
                className={`font-bold transition ${
                  resendTimer > 0
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-[#D97706] hover:underline cursor-pointer'
                }`}
              >
                {resendTimer > 0
                  ? `إعادة الإرسال بعد (0:${resendTimer < 10 ? '0' : ''}${resendTimer})`
                  : 'إعادة إرسال رمز التفعيل الآن'}
              </button>
            </p>
            <p>
              <Link to="/register" className="text-[#94A3B8] hover:text-slate-700 font-semibold transition">
                تغيير عنوان البريد الإلكتروني
              </Link>
            </p>
          </div>
        </div>
      </main>

      <div className="h-4" />
    </div>
  )
}
