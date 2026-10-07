import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoImg from '../assets/logo_transparent.png'
import { useProfile } from '../context/ProfileContext'
import { api } from '../services/api'

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate()
  const { profile, verifyEmail } = useProfile()
  const [otp, setOtp] = useState(['5', '8', '2', '9', '4', '1'])
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [resendTimer, setResendTimer] = useState(45)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

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

    setIsVerifying(true)
    setError('')

    try {
      const res = await api.verifyEmail(code, profile.email)
      verifyEmail(res.user)
      setIsSuccess(true)
      setTimeout(() => {
        navigate('/profile')
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'رمز التحقق غير صحيح. يرجى إدخال الرمز المكون من 6 أرقام.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = () => {
    setOtp(['', '', '', '', '', ''])
    setError('')
    setResendTimer(60)
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
                {profile.email || 'jalal.matluq@gmail.com'}
              </span>
            </p>
          </div>

          {/* Success Toast */}
          {isSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[12px] text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in duration-150">
              <span>✓ تم التحقق بنجاح! جاري تحويلك إلى الملف المهني...</span>
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
                onClick={handleResend}
                className="text-[#D97706] font-bold hover:underline cursor-pointer"
              >
                إعادة الإرسال بعد ({resendTimer > 0 ? `0:${resendTimer < 10 ? '0' : ''}${resendTimer}` : 'الآن'})
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
