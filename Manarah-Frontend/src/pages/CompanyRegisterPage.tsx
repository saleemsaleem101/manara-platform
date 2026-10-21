import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { ThemeToggle } from '../components/ThemeToggle'
import { api } from '../services/api'
import { validatePassword } from '../utils/validators'

export const CompanyRegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  // Form State
  const [companyName, setCompanyName] = useState('')
  const [representativeName, setRepresentativeName] = useState('')
  const [commercialReg, setCommercialReg] = useState('')
  const [website, setWebsite] = useState('https://www.yemen-tech.ye')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [industry, setIndustry] = useState('تكنولوجيا المعلومات والبرمجيات')
  const [location, setLocation] = useState('اليمن - صنعاء (حدة)')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [crDocumentFile, setCrDocumentFile] = useState<File | null>(null)
  const [crDocumentUrl, setCrDocumentUrl] = useState('')

  // UI state
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const isFormValid = Boolean(
    companyName.trim() &&
    representativeName.trim() &&
    commercialReg.trim() &&
    email.trim() &&
    phone.trim() &&
    password.trim() &&
    confirmPassword.trim() &&
    agreeTerms
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('حجم الملف يتجاوز الحد المسموح به (10 ميجابايت).')
        return
      }
      setCrDocumentFile(file)
      setCrDocumentUrl(file.name)
      setErrorMessage(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!companyName.trim()) {
      setErrorMessage('يرجى إدخال اسم المنشأة أو الشركة الرسمي.')
      return
    }
    if (!commercialReg.trim()) {
      setErrorMessage('يرجى إدخال رقم السجل التجاري / الترخيص الرسمي.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('يرجى إدخال بريد إلكتروني مؤسسي صحيح.')
      return
    }
    if (!password) {
      setErrorMessage('يرجى إدخال كلمة المرور.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMessage('كلمة المرور وتأكيد كلمة المرور غير متطابقتين.')
      return
    }
    const pwdCheck = validatePassword(password)
    if (!pwdCheck.isValid) {
      setErrorMessage(pwdCheck.errorMessage || 'يجب ألا تقل كلمة المرور عن 8 خانات وتحتوي على أحرف وأرقام معاً.')
      return
    }
    if (!agreeTerms) {
      setErrorMessage('يرجى الموافقة على الشروط والأحكام وسياسة الخصوصية للمتابعة.')
      return
    }

    try {
      setIsLoading(true)
      await api.registerCompany({
        name: representativeName.trim() || companyName.trim(),
        company_name: companyName.trim(),
        commercial_reg: commercialReg.trim(),
        website: website.trim() || undefined,
        email: email.trim(),
        phone: phone.trim(),
        industry: industry.trim(),
        location: location.trim(),
        password,
        role: 'COMPANY',
        cr_document_url: crDocumentUrl || undefined,
      })

      setCurrentStep(2)
      setSuccessMessage('تم إنشاء حساب المنشأة بنجاح! تم إرسال رمز التحقق إلى بريدكم الإلكتروني.')

      sessionStorage.setItem('manarah_registered_email', email.trim())

      // الانتقال بعد مهلة لتأكيد البريد
      timeoutRef.current = setTimeout(() => {
        navigate('/verify-email', { state: { email: email.trim(), role: 'COMPANY' } })
      }, 1500)
    } catch (err: unknown) {
      const errorObj = err as { message?: string } | undefined
      setErrorMessage(errorObj?.message || 'حدث خطأ أثناء إنشاء حساب المنشأة. يرجى المحاولة لاحقاً.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] font-sans text-start text-[#0F172A] dark:text-white pb-16 transition-colors duration-300 selection:bg-[#BAE6FD] selection:text-[#0284C7]" dir="rtl">
      {/* Top Bar */}
      <header className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-[#E8DEC8] dark:border-slate-800 px-6 sm:px-12 h-16 flex items-center justify-between text-xs sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <BrandLogo size="sm" showSubline={false} />
          <span className="text-[#E8DEC8] dark:text-slate-700">/</span>
          <span className="text-[#6C4F3D] dark:text-slate-400 font-semibold text-[12px]">
            تسجيل حساب منشأة جديد والاعتماد المؤسسي
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8DEC8] dark:border-slate-700 hover:bg-[#E8DEC8]/30 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white font-bold text-[12px] transition shadow-xs"
          >
            <span>العودة لتسجيل الدخول</span>
            <span className="text-[#0284C7] dark:text-[#38BDF8] font-bold">➔</span>
          </Link>
        </div>
      </header>

      {/* Hero Banner Header */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 pt-8 pb-6">
        <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-[#E8DEC8] dark:border-slate-800 rounded-[24px] p-6 sm:p-7 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div className="ps-4 border-s-4 border-[#0284C7] dark:border-[#38BDF8]">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight">
              بوابة تسجيل المنشآت والاعتماد المؤسسي
            </h1>
            <p className="text-[#6C4F3D] dark:text-slate-400 text-sm mt-1.5 font-medium">
              إنشاء حساب جهة عمل وتوثيق السجل التجاري والبيانات الرسمية للمنشأة
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <main className="max-w-[1360px] mx-auto px-4 sm:px-6">
        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
            <button type="button" onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200">✕</button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Right Column: Registration Form (7 cols) */}
          <div className="lg:col-span-7 glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-black text-[#0F172A] dark:text-white">إنشاء حساب جهة عمل / منشأة جديدة</h2>
              <p className="text-xs text-[#6C4F3D] dark:text-slate-400 mt-1 font-medium">
                سجل منشأتك لاستقطاب أفضل الكفاءات الأكاديمية والمهنية عبر خوارزمية المطابقة الموزونة
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Company Name & Representative Name (users.name) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-2">
                    اسم المنشأة أو الشركة الرسمي <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder=""
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 text-sm bg-[#FAF7F2] dark:bg-slate-800 text-[#0F172A] dark:text-white transition shadow-xs"
                    />
                    <div className="absolute end-3.5 top-3.5 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-2">
                    اسم ممثل المنشأة / مسؤول الحساب <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={representativeName}
                      onChange={(e) => setRepresentativeName(e.target.value)}
                      placeholder=""
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 text-sm bg-[#FAF7F2] dark:bg-slate-800 text-[#0F172A] dark:text-white transition shadow-xs"
                    />
                    <div className="absolute end-3.5 top-3.5 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two Column Row: Commercial Register & Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-2">
                    رقم السجل التجاري / الترخيص الرسمي <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={commercialReg}
                      onChange={(e) => setCommercialReg(e.target.value)}
                      placeholder=""
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 text-sm font-mono bg-[#FAF7F2] dark:bg-slate-800 text-[#0F172A] dark:text-white transition shadow-xs"
                    />
                    <div className="absolute end-3.5 top-3.5 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-2">
                    الموقع الإلكتروني الرسمي للمنشأة
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder=""
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 text-sm font-mono bg-[#FAF7F2] dark:bg-slate-800 text-[#0F172A] dark:text-white text-start transition shadow-xs"
                      dir="ltr"
                    />
                    <div className="absolute end-3.5 top-3.5 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two Column Row: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-2">
                    البريد الإلكتروني المؤسسي الرسمي <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=""
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 text-sm font-mono bg-[#FAF7F2] dark:bg-slate-800 text-[#0F172A] dark:text-white transition shadow-xs"
                    />
                    <div className="absolute end-3.5 top-3.5 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-2">
                    رقم الهاتف والتواصل المعتمد <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder=""
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 text-sm font-mono bg-[#FAF7F2] dark:bg-slate-800 text-[#0F172A] dark:text-white transition shadow-xs"
                    />
                    <div className="absolute end-3.5 top-3.5 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two Column Row: Industry & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-2">
                    مجال عمل الشركة / القطاع <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 text-sm bg-[#FAF7F2] dark:bg-slate-800 text-[#0F172A] dark:text-white font-bold transition shadow-xs cursor-pointer"
                  >
                    <option value="تكنولوجيا المعلومات والبرمجيات">تكنولوجيا المعلومات والبرمجيات</option>
                    <option value="المصارف والبنوك والتمويل">المصارف والبنوك والتمويل</option>
                    <option value="الاتصالات وتقنية الشبكات">الاتصالات وتقنية الشبكات</option>
                    <option value="التجارة الإلكترونية والتوزيع">التجارة الإلكترونية والتوزيع</option>
                    <option value="الاستشارات والحلول المؤسسية">الاستشارات والحلول المؤسسية</option>
                    <option value="التعليم والتدريب">التعليم والتدريب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-2">
                    المدينة والمقر الرئيسي <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder=""
                    className="w-full px-4 py-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 text-sm bg-[#FAF7F2] dark:bg-slate-800 text-[#0F172A] dark:text-white transition shadow-xs"
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-2">
                    كلمة المرور الأمنية للحساب <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 pe-11 py-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 text-sm bg-[#FAF7F2] dark:bg-slate-800 text-[#0F172A] dark:text-white transition shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-[#6C4F3D] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition cursor-pointer p-0.5"
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
                  <label className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-2">
                    تأكيد كلمة المرور <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 pe-11 py-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 text-sm bg-[#FAF7F2] dark:bg-slate-800 text-[#0F172A] dark:text-white transition shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-[#6C4F3D] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition cursor-pointer p-0.5"
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

              {/* Terms & Conditions Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="companyAgreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0284C7] focus:ring-[#38BDF8] border-[#E8DEC8] dark:border-slate-700 cursor-pointer"
                />
                <label htmlFor="companyAgreeTerms" className="text-xs text-[#6C4F3D] dark:text-slate-300 font-medium cursor-pointer">
                  أوافق على <span className="text-[#0284C7] dark:text-[#38BDF8] font-bold underline">الشروط والأحكام</span> و<span className="text-[#0284C7] dark:text-[#38BDF8] font-bold underline">سياسة الخصوصية</span> لمنصة منارة
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-sm ${
                    isFormValid && !isLoading
                      ? 'bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white cursor-pointer shadow-md hover:shadow-sky-500/20 active:scale-[0.99]'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-70 shadow-none'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري إنشاء الحساب والتحقق...</span>
                    </>
                  ) : (
                    <>
                      <span>إنشاء حساب المنشأة وإرسال طلب التحقق</span>
                      <span className={isFormValid ? "text-white font-bold" : "text-slate-400 font-bold"}>➔</span>
                    </>
                  )}
                </button>
              </div>

              {/* Security & Verification Notice */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700 text-[#6C4F3D] dark:text-slate-300 text-[11px] leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <span className="font-bold text-[#0F172A] dark:text-white block mb-0.5">حماية البيانات والتحقق المؤسسي:</span>
                    تخضع جميع حسابات الشركات لرقابة وتدقيق إدارة المنصة قبل تمكينها من نشر الوظائف والاطلاع على بيانات المتقدمين لضمان الشفافية وموثوقية الفرص.
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Left Column: Verification Tracker & Document Upload (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Verification Steps Card */}
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-6 sm:p-7 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-black text-[#0F172A] dark:text-white">توثيق المنشأة والاعتماد الرسمي</h3>
                <p className="text-xs text-[#6C4F3D] dark:text-slate-400 mt-1">مراحل تدقيق حسابات جهات العمل لضمان موثوقية الفرص المعلنة</p>
              </div>

              {/* 5-Step Progression Tracker */}
              <div className="grid grid-cols-5 gap-1.5 text-center mb-6">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-xs ${
                    currentStep >= 1 ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    1
                  </div>
                  <span className="text-[10px] font-bold text-[#0F172A] dark:text-white mt-1.5">التسجيل</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                    currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    2
                  </div>
                  <span className="text-[10px] font-bold text-[#6C4F3D] dark:text-slate-400 mt-1.5">تفعيل البريد</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-xs font-black">
                    3
                  </div>
                  <span className="text-[10px] font-bold text-[#6C4F3D] dark:text-slate-400 mt-1.5">رفع الوثائق</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-xs font-black">
                    4
                  </div>
                  <span className="text-[10px] font-bold text-[#6C4F3D] dark:text-slate-400 mt-1.5">المراجعة</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-xs font-black">
                    5
                  </div>
                  <span className="text-[10px] font-bold text-[#6C4F3D] dark:text-slate-400 mt-1.5">نشر الوظائف</span>
                </div>
              </div>

              {/* Document Upload Area */}
              <div className="border-2 border-dashed border-[#BAE6FD] dark:border-sky-800/60 bg-[#E0F2FE]/30 dark:bg-sky-950/20 rounded-2xl p-6 text-center hover:border-[#0284C7] dark:hover:border-[#38BDF8] transition">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#E0F2FE]/70 dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8] border border-[#BAE6FD] dark:border-sky-800 flex items-center justify-center mb-3 shadow-inner">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                  رفع صورة أو ملف السجل التجاري الرسمي (PDF, PNG, JPG)
                </h4>
                <p className="text-[11px] text-[#6C4F3D] dark:text-slate-400 mt-1 mb-4">
                  التحقق من صحة المستند: بحد أقصى 10 ميجابايت للملف المرفق
                </p>

                <label className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white text-xs font-bold cursor-pointer transition shadow-md hover:shadow-sky-500/20">
                  <span>{crDocumentFile ? 'تغيير الملف المحدد' : 'اختر الملف من جهازك'}</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {crDocumentFile && (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                    <span className="truncate max-w-[220px]">📄 {crDocumentFile.name}</span>
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md font-bold">جاهز للإرسال ✓</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CompanyRegisterPage
