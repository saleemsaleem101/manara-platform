import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoImg from '../assets/logo_transparent.png'
import { useProfile } from '../context/ProfileContext'
import { api } from '../services/api'
import { validatePassword } from '../utils/validators'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { updateProfile } = useProfile()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: 'جامعة العلوم والتكنولوجيا',
    major: 'هندسة البرمجيات',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  })

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const isFormValid = Boolean(
    formData.name.trim() &&
    formData.email.trim() &&
    formData.university.trim() &&
    formData.major.trim() &&
    formData.password.trim() &&
    formData.confirmPassword.trim() &&
    formData.agreeTerms
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('كلمة المرور وتأكيد كلمة المرور غير متطابقتين.')
      return
    }

    const pwdCheck = validatePassword(formData.password)
    if (!pwdCheck.isValid) {
      setError(pwdCheck.errorMessage || 'يجب ألا تقل كلمة المرور عن 8 خانات وتحتوي على أحرف وأرقام معاً.')
      return
    }

    if (!formData.agreeTerms) {
      setError('يرجى الموافقة على الشروط والأحكام للمتابعة.')
      return
    }

    setIsLoading(true)
    try {
      const res = await api.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      if (res && (res as any).otp_code) {
        sessionStorage.setItem('manarah_demo_otp', (res as any).otp_code)
      }
      sessionStorage.setItem('manarah_registered_email', formData.email)

      await updateProfile({
        name: formData.name,
        email: formData.email,
        university: formData.university,
        major: formData.major,
      })

      navigate('/verify-email', { state: { email: formData.email } })
    } catch (err: unknown) {
      const errorObj = err as { message?: string } | undefined
      setError(errorObj?.message || 'فشل إنشاء الحساب. يرجى التأكد من صحة البيانات.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      {/* Top Bar (48px) - Exact 01_Auth_Register.svg */}
      <header className="w-full bg-white border-b border-[#E2E8F0] px-6 sm:px-12 h-12 flex items-center justify-between text-xs">
        <span className="text-[#64748B] font-semibold text-[13px]">
          منصة منارة لربط الخريجين بسوق العمل
        </span>
        <span className="text-[#0F1E36] font-bold text-[12px]">
          إنشاء حساب جديد
        </span>
      </header>

      {/* Main Centered Card (1280px on desktop) */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[1280px] bg-white border border-[#E2E8F0] rounded-[24px] shadow-[0_6px_20px_rgba(15,30,54,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[760px]">
          {/* Child 1 (RIGHT in RTL): Register Form (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
            <div className="max-w-[500px] mx-auto w-full space-y-4">
              {/* Role Switcher */}
              <div className="inline-flex p-1 bg-[#F1F5F9] rounded-[12px] text-[12px]">
                <button
                  type="button"
                  className="px-5 py-1.5 bg-[#0F1E36] text-white font-bold rounded-[10px] shadow-xs cursor-pointer"
                >
                  حساب خريج
                </button>
                <span
                  className="px-4 py-1.5 text-slate-400 font-bold flex items-center gap-1.5 cursor-not-allowed"
                  title="تسجيل المنشآت والشركات متاح في السبرنت القادم"
                >
                  <span>حساب منشأة / شركة</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-500 font-normal">قريباً</span>
                </span>
              </div>

              <div>
                <h1 className="text-[26px] font-black text-[#0F1E36] tracking-tight">
                  إنشاء حساب خريج جديد
                </h1>
                <p className="text-[13px] text-[#64748B] mt-1 leading-relaxed">
                  أنشئ حسابك المهني في منارة وابدأ في بناء ملفك الأكاديمي والمهني الموثق
                </p>
              </div>

              {/* Error Alert Banner */}
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-[14px] text-xs font-bold leading-relaxed text-start flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-[12px] font-bold text-[#0F1E36] mb-1 text-start">
                    الاسم الكامل (رباعي) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="سليم شايف سليمان"
                    className="w-full h-[44px] px-4 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-start"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[12px] font-bold text-[#0F1E36] mb-1 text-start">
                    البريد الإلكتروني الأكاديمي أو الشخصي *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@manara.edu.ye"
                    className="w-full h-[44px] px-4 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-start"
                  />
                </div>

                {/* Academic Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F1E36] mb-1 text-start">
                      الجامعة *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      placeholder="جامعة العلوم والتكنولوجيا"
                      className="w-full h-[44px] px-4 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-start"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F1E36] mb-1 text-start">
                      التخصص الأكاديمي *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.major}
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      placeholder="هندسة البرمجيات"
                      className="w-full h-[44px] px-4 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-start"
                    />
                  </div>
                </div>

                {/* Password Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F1E36] mb-1 text-start">
                      كلمة المرور *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••••••"
                        className="w-full h-[44px] px-4 pe-11 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[14px] font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-start"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F1E36] transition cursor-pointer p-0.5"
                        tabIndex={-1}
                        aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        {showPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#0F1E36] mb-1 text-start">
                      تأكيد كلمة المرور *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="••••••••••••"
                        className="w-full h-[44px] px-4 pe-11 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[14px] font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-start"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F1E36] transition cursor-pointer p-0.5"
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? 'إخفاء تأكيد كلمة المرور' : 'إظهار تأكيد كلمة المرور'}
                      >
                        {showConfirmPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="pt-1 text-start">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 border-slate-300 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-xs text-[#64748B]">
                      أوافق على <span className="text-[#0F1E36] font-bold">شروط الاستخدام</span> و{' '}
                      <span className="text-[#0F1E36] font-bold">سياسة الخصوصية</span> لمنصة منارة
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className="w-full h-[50px] bg-[#0F1E36] hover:bg-[#1E293B] disabled:opacity-50 text-white text-[15px] font-bold rounded-[14px] shadow-sm transition transform active:scale-[0.99] cursor-pointer mt-2 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري إنشاء الحساب والتسجيل...</span>
                    </>
                  ) : (
                    <span>إنشاء حساب خريج</span>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="text-center pt-2 text-[13px] text-[#64748B]">
                لديك حساب بالفعل؟{' '}
                <Link to="/login" className="text-[#D97706] font-bold hover:underline">
                  تسجيل الدخول
                </Link>
              </div>
            </div>
          </div>

          {/* Child 2 (LEFT in RTL): Brand Side (5 cols) */}
          <div className="lg:col-span-5 bg-[#F8FAFC] p-8 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden text-center border-t lg:border-t-0 lg:border-s border-[#E2E8F0]">
            <div className="w-[450px] h-[450px] rounded-full bg-[#FEF3C7]/60 blur-3xl absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 space-y-6 max-w-sm flex flex-col items-center">
              <img
                src={logoImg}
                alt="شعار منصة منارة"
                className="h-44 sm:h-52 w-auto mx-auto object-contain drop-shadow-sm"
              />

              <div className="space-y-2">
                <h2 className="text-[24px] sm:text-[26px] font-black text-[#0F1E36]">
                  انضم إلى منصة منارة
                </h2>
                <p className="text-[13px] sm:text-[14px] font-bold text-[#D97706]">
                  منصتك الأكاديمية الأولى نحو سوق العمل التقني
                </p>
                <p className="text-[12px] text-[#64748B] leading-relaxed pt-2">
                  سجل بياناتك الأساسية، ابنِ ملفك المهني الموثق، واستعد للانطلاق بخطوات واثقة.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-4" />
    </div>
  )
}

export default RegisterPage
