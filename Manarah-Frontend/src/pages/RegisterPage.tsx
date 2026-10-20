import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoImg from '../assets/logo_transparent.png'
import { api } from '../services/api'
import { validatePassword } from '../utils/validators'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    major: '',
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
      await api.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      sessionStorage.setItem('manarah_registered_email', formData.email)
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
          
          {/* Child 1 (RIGHT in RTL): Register Form (7 cols) - Exact 01_Auth_Register_Graduate.png */}
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
                <Link
                  to="/company/register"
                  className="px-4 py-1.5 text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1.5 transition rounded-[10px]"
                >
                  <span>حساب منشأة / شركة</span>
                </Link>
              </div>

              <div>
                <h1 className="text-[26px] font-black text-[#0F1E36] tracking-tight">
                  إنشاء حساب خريج جديد
                </h1>
                <p className="text-[13px] text-[#64748B] mt-1">
                  الخطوة الأولى للربط المهني وبناء الملف الأكاديمي المعتمد
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-[12px] text-xs font-bold leading-relaxed text-start flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
                {/* Full Name */}
                <div>
                  <label className="block text-[12px] font-bold text-[#0F1E36] mb-1 text-start">
                    الاسم الكامل (رباعي)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="جلال عبد الملك الصوفي"
                    className="w-full h-[44px] px-4 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-start"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[12px] font-bold text-[#0F1E36] mb-1 text-start">
                    البريد الإلكتروني الجامعي أو الشخصي
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jalal.matluq@gmail.com"
                    className="w-full h-[44px] px-4 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-start font-mono"
                  />
                </div>

                {/* University & Major Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F1E36] mb-1 text-start">
                      الجامعة
                    </label>
                    <select
                      required
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      className="w-full h-[44px] px-3 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[12px] font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-start"
                    >
                      <option value="">اختر الجامعة...</option>
                      <option value="جامعة العلوم والتكنولوجيا">جامعة العلوم والتكنولوجيا</option>
                      <option value="جامعة صنعاء">جامعة صنعاء</option>
                      <option value="الجامعة اللبنانية الدولية">الجامعة اللبنانية الدولية</option>
                      <option value="جامعة الرازي">جامعة الرازي</option>
                      <option value="جامعة سبأ">جامعة سبأ</option>
                      <option value="جامعة ذمار">جامعة ذمار</option>
                      <option value="جامعة عدن">جامعة عدن</option>
                      <option value="أخرى">جامعة أخرى</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F1E36] mb-1 text-start">
                      التخصص (اختر تخصص الحاسوب)
                    </label>
                    <select
                      required
                      value={formData.major}
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      className="w-full h-[44px] px-3 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[12px] font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-start"
                    >
                      <option value="">اختر التخصص...</option>
                      <option value="هندسة البرمجيات">هندسة البرمجيات (Software Eng)</option>
                      <option value="علوم الحاسوب">علوم الحاسوب (Computer Science)</option>
                      <option value="تقنية المعلومات">تقنية المعلومات (IT)</option>
                      <option value="الأمن السيبراني">الأمن السيبراني (Cybersecurity)</option>
                      <option value="نظم المعلومات الحاسوبية">نظم المعلومات الحاسوبية (CIS)</option>
                      <option value="هندسة الشبكات والاتصالات">هندسة الشبكات والاتصالات (Networks)</option>
                      <option value="ذكاء الأعمال وتحليل البيانات">ذكاء الأعمال وتحليل البيانات (Data Analytics)</option>
                      <option value="أخرى">تخصص آخر</option>
                    </select>
                  </div>
                </div>

                {/* Passwords Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F1E36] mb-1 text-start">
                      كلمة المرور
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
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F1E36] mb-1 text-start">
                      تأكيد كلمة المرور
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
                </div>

                {/* Terms */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-[#CBD5E1] cursor-pointer"
                  />
                  <label htmlFor="agreeTerms" className="text-[12px] text-[#475569] cursor-pointer">
                    أوافق على الشروط والأحكام وسياسة الخصوصية وحماية البيانات
                  </label>
                </div>

                {/* CTA Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className={`w-full h-[52px] rounded-[14px] transition-all duration-200 mt-2 flex items-center justify-center gap-2 text-[16px] font-black ${
                    isFormValid && !isLoading
                      ? 'bg-[#F59E0B] hover:bg-amber-600 text-[#0F1E36] cursor-pointer shadow-amber-500/25 shadow-md active:scale-[0.99]'
                      : 'bg-[#CBD5E1] text-[#64748B] cursor-not-allowed opacity-70 shadow-none'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-[#0F1E36] border-t-transparent rounded-full animate-spin" />
                      <span>جاري إنشاء الحساب...</span>
                    </>
                  ) : (
                    <span>إنشاء الحساب</span>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="text-center pt-2 text-[13px] text-[#64748B]">
                لديك حساب مسبقاً؟{' '}
                <Link to="/login" className="text-[#0F1E36] font-bold hover:underline">
                  تسجيل الدخول
                </Link>
              </div>
            </div>
          </div>

          {/* Child 2 (LEFT in RTL): Brand & Features (5 cols) - Exact 01_Auth_Register_Graduate.png */}
          <div className="lg:col-span-5 bg-[#F8FAFC] border-b lg:border-b-0 lg:border-e border-[#E2E8F0] p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Halo circle */}
            <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-[#FEF3C7]/60 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center my-auto py-6 relative z-10 space-y-4">
              <img
                src={logoImg}
                alt="شعار منصة منارة الرسمي"
                className="h-44 sm:h-52 w-auto mx-auto object-contain drop-shadow-sm"
              />
              <div>
                <h2 className="text-[24px] font-black text-[#0F1E36]">
                  منصة مَنَارَة لربط الخريجين بسوق العمل
                </h2>
                <p className="text-[13px] font-mono font-bold tracking-widest text-[#D97706] mt-1">
                  CONNECT • GROW • SUCCEED
                </p>
                <p className="text-[13px] text-[#64748B] mt-2 max-w-sm mx-auto leading-relaxed">
                  بوابتك الموثوقة لربط مؤهلاتك وتخصصك مباشرة مع شواغر الشركات
                </p>
              </div>
            </div>

            {/* 3 Value Feature Cards - Matching 01_Auth_Register_Graduate.png */}
            <div className="space-y-2.5 relative z-10">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-[16px] text-center shadow-xs">
                  <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                    ✓
                  </div>
                  <div className="text-[12px] font-black text-[#0F1E36]">ملف أكاديمي معتمد</div>
                  <div className="text-[10px] font-semibold text-[#64748B] mt-0.5">توثيق بيانات التخصص والمهارات لسوق العمل</div>
                </div>
                <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-[16px] text-center shadow-xs">
                  <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">
                    ⚡
                  </div>
                  <div className="text-[12px] font-black text-[#0F1E36]">مطابقة موزونة دقيقة</div>
                  <div className="text-[10px] font-semibold text-[#64748B] mt-0.5">خوارزمية قياس التوافق مع متطلبات الشركات</div>
                </div>
              </div>
              <div className="bg-white border border-[#E2E8F0] p-3 rounded-[16px] flex items-center gap-3 shadow-xs text-start">
                <div className="w-8 h-8 shrink-0 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
                  ★
                </div>
                <div className="text-[11px] font-bold text-[#0F1E36] leading-tight">
                  سيرة ذاتية هجينة موحدة تجمع المشاريع البرمجية الحية والفيديو التعريفي
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="h-4" />
    </div>
  )
}
