import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { ThemeToggle } from '../components/ThemeToggle'
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
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] flex flex-col justify-between relative overflow-hidden" dir="rtl">
      {/* Background Silk Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(186,230,253,0.35),transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(2,132,199,0.2),transparent_70%)] pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-10 w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border-b border-[#E8DEC8] dark:border-slate-800 px-6 sm:px-12 h-16 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <BrandLogo size="sm" showSubline={false} />
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-[#0284C7] dark:text-[#38BDF8] font-black text-[12px] bg-[#E0F2FE] dark:bg-sky-950/60 px-3 py-1 rounded-full border border-[#BAE6FD] dark:border-sky-500/40">
            إنشاء حساب جديد
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link to="/" className="text-[#64748B] dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-[#38BDF8] font-semibold text-[13px] transition flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs">
            <span>الرئيسية</span>
            <span>➔</span>
          </Link>
        </div>
      </header>

      {/* Main Centered Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[1240px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-[#E8DEC8] dark:border-slate-800 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(200,180,155,0.25)] dark:shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[740px]">
          
          {/* Form (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
            <div className="max-w-[480px] mx-auto w-full space-y-4">
              {/* Role Switcher */}
              <div className="inline-flex p-1 bg-[#FAF7F2] dark:bg-slate-800/80 rounded-xl text-[12px] border border-[#E8DEC8] dark:border-slate-700">
                <button
                  type="button"
                  className="px-5 py-1.5 bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  حساب باحث عن عمل
                </button>
                <Link
                  to="/company/register"
                  className="px-4 py-1.5 text-[#475569] dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-[#38BDF8] font-bold flex items-center gap-1.5 transition rounded-lg"
                >
                  <span>حساب منشأة / شركة</span>
                </Link>
              </div>

              <div>
                <h1 className="text-[26px] font-black text-[#0F172A] dark:text-white tracking-tight">
                  إنشاء حساب جديد
                </h1>
                <p className="text-[13px] text-[#64748B] dark:text-slate-400 mt-1">
                  الخطوة الأولى لبناء ملفك المهني الموثق واستقبال فرص العمل المتوافقة
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
                  <label className="block text-[12px] font-bold text-[#0F172A] mb-1 text-start">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder=""
                    className="w-full h-[46px] px-4 rounded-[12px] border border-[#CBD5E1] bg-[#FBF9F5] text-[13px] font-semibold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition text-start"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[12px] font-bold text-[#0F172A] mb-1 text-start">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder=""
                    className="w-full h-[46px] px-4 rounded-[12px] border border-[#CBD5E1] bg-[#FBF9F5] text-[13px] font-semibold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition text-start font-mono"
                  />
                </div>

                {/* University & Major Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1 text-start">
                      الجامعة
                    </label>
                    <select
                      required
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      className="w-full h-[46px] px-3 rounded-[12px] border border-[#CBD5E1] bg-[#FBF9F5] text-[12px] font-semibold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition text-start"
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
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1 text-start">
                      التخصص
                    </label>
                    <select
                      required
                      value={formData.major}
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      className="w-full h-[46px] px-3 rounded-[12px] border border-[#CBD5E1] bg-[#FBF9F5] text-[12px] font-semibold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition text-start"
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
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1 text-start">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••••••"
                        className="w-full h-[46px] px-4 pe-11 rounded-[12px] border border-[#CBD5E1] bg-[#FBF9F5] text-[14px] font-semibold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition text-start"
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
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1 text-start">
                      تأكيد كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="••••••••••••"
                        className="w-full h-[46px] px-4 pe-11 rounded-[12px] border border-[#CBD5E1] bg-[#FBF9F5] text-[14px] font-semibold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition text-start"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition cursor-pointer p-0.5"
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
                    className="w-4 h-4 rounded text-[#0284C7] focus:ring-[#BAE6FD] border-[#CBD5E1] cursor-pointer"
                  />
                  <label htmlFor="agreeTerms" className="text-[12px] text-[#475569] cursor-pointer">
                    أوافق على الشروط والأحكام وسياسة الخصوصية وحماية البيانات
                  </label>
                </div>

                {/* CTA Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className={`w-full h-[52px] rounded-[14px] transition-all duration-200 mt-2 flex items-center justify-center gap-2 text-[15px] font-black ${
                    isFormValid && !isLoading
                      ? 'bg-gradient-to-r from-[#0284C7] to-[#10B981] hover:from-[#0369A1] hover:to-[#059669] text-white cursor-pointer shadow-sm active:scale-[0.99]'
                      : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed opacity-75 shadow-none'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                <Link to="/login" className="text-[#0284C7] font-black hover:underline">
                  تسجيل الدخول
                </Link>
              </div>
            </div>
          </div>

          {/* Features Side (5 cols) */}
          <div className="lg:col-span-5 bg-[#FAF7F2] dark:bg-slate-950/80 border-b lg:border-b-0 lg:border-e border-[#E8DEC8] dark:border-slate-800 p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Subtle Silk Texture */}
            <img
              src="/manarah_silk_bg.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-15 dark:opacity-10 mix-blend-overlay pointer-events-none"
            />

            {/* Halo circle */}
            <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-gradient-to-tr from-[#BAE6FD]/40 to-[#E8DEC8]/30 dark:from-sky-500/20 dark:to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="text-center my-auto py-6 relative z-10 space-y-4">
              <div className="relative mx-auto w-40 h-40 sm:w-48 sm:h-48">
                <div className="absolute -inset-3 bg-gradient-to-r from-[#38BDF8] via-[#BAE6FD] to-[#D4C3A3] rounded-3xl blur-xl opacity-75 animate-pulse" />
                <div className="relative w-full h-full bg-white/95 dark:bg-slate-900/95 rounded-3xl p-5 border border-white/90 dark:border-slate-700 shadow-2xl flex items-center justify-center">
                  <img
                    src="/logo_trimmed.png"
                    alt="شعار منصة منارة الرسمي"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-[22px] font-black text-[#0F172A] dark:text-white">
                  منصة مَنَارَة للربط المهني
                </h2>
                <p className="text-[13px] text-[#6C4F3D] dark:text-[#FDE68A] font-bold mt-2 max-w-sm mx-auto leading-relaxed">
                  بوابتك الموثوقة لربط مؤهلاتك وتخصصك مباشرة مع شواغر الشركات المعتمدة
                </p>
              </div>
            </div>

            {/* Value Feature Cards */}
            <div className="space-y-2.5 relative z-10">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white/90 dark:bg-slate-900/90 border border-[#E8DEC8] dark:border-slate-800 p-3.5 rounded-[16px] text-center shadow-xs">
                  <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center text-sm font-bold border border-[#BAE6FD] dark:border-sky-500/40">
                    ✓
                  </div>
                  <div className="text-[12px] font-black text-[#0F172A] dark:text-white">ملف مهني معتمد</div>
                  <div className="text-[10px] text-[#64748B] dark:text-slate-400 mt-0.5">توثيق مهاراتك ومشاريعك لسوق العمل</div>
                </div>
                <div className="bg-white/90 dark:bg-slate-900/90 border border-[#E8DEC8] dark:border-slate-800 p-3.5 rounded-[16px] text-center shadow-xs">
                  <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-[#E8F8F2] dark:bg-emerald-950/60 text-[#0D6E44] dark:text-[#34D399] flex items-center justify-center text-sm font-bold border border-[#BDE8D2] dark:border-emerald-500/40">
                    ⚡
                  </div>
                  <div className="text-[12px] font-black text-[#0F172A] dark:text-white">مطابقة موزونة</div>
                  <div className="text-[10px] text-[#64748B] dark:text-slate-400 mt-0.5">خوارزمية قياس التوافق مع متطلبات الشركات</div>
                </div>
              </div>
              <div className="bg-white/90 dark:bg-slate-900/90 border border-[#E8DEC8] dark:border-slate-800 p-3 rounded-[16px] flex items-center gap-3 shadow-xs text-start">
                <div className="w-8 h-8 shrink-0 rounded-full bg-[#FAF7F2] dark:bg-slate-800 text-[#8C6D53] dark:text-[#FDE68A] flex items-center justify-center text-sm font-bold border border-[#E8DEC8] dark:border-slate-700">
                  ★
                </div>
                <div className="text-[11px] font-bold text-[#0F172A] dark:text-slate-200 leading-tight">
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

export default RegisterPage
