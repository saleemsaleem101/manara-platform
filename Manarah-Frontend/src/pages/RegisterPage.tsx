import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoImg from '../assets/logo_transparent.png'
import { useProfile } from '../context/ProfileContext'
import { api } from '../services/api'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { updateProfile } = useProfile()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    major: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true,
  })

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('كلمة المرور وتأكيد كلمة المرور غير متطابقتين.')
      return
    }

    if (formData.password.length < 8) {
      setError('يجب ألا تقل كلمة المرور عن 8 خانات وتحتوي على أحرف وأرقام.')
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

      await updateProfile({
        name: formData.name,
        email: formData.email,
        university: formData.university,
        major: formData.major,
      })

      navigate('/verify-email')
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الحساب. يرجى التأكد من صحة البيانات.')
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
          
          {/* Child 1 (RIGHT in RTL): Brand & Stats (5 cols) - Exact 01_Auth_Register.svg */}
          <div className="lg:col-span-5 bg-[#F8FAFC] border-b lg:border-b-0 lg:border-l border-[#E2E8F0] p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Halo circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-[#FEF3C7]/60 rounded-full blur-3xl pointer-events-none" />

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
                  بوابتك الذكية لربط مؤهلاتك وتخصصك مباشرة مع شواغر الشركات
                </p>
              </div>
            </div>

            {/* 2 Stat Cards */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <div className="bg-white border border-[#E2E8F0] p-4 rounded-[18px] text-center shadow-xs">
                <div className="text-[26px] font-black text-[#0F1E36]">+12,500</div>
                <div className="text-[11px] font-semibold text-[#64748B] mt-0.5">خريج مسجل في الجامعات</div>
              </div>
              <div className="bg-white border border-[#E2E8F0] p-4 rounded-[18px] text-center shadow-xs">
                <div className="text-[26px] font-black text-[#D97706]">450+</div>
                <div className="text-[11px] font-semibold text-[#64748B] mt-0.5">شركة وجهة توظيف شريكة</div>
              </div>
            </div>
          </div>

          {/* Child 2 (LEFT in RTL): Register Form (7 cols) - Exact 01_Auth_Register.svg */}
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
                <button
                  type="button"
                  className="px-5 py-1.5 text-[#64748B] font-semibold hover:text-[#0F1E36] transition cursor-pointer"
                >
                  حساب شركة
                </button>
              </div>

              <div>
                <h1 className="text-[26px] font-black text-[#0F1E36] tracking-tight">
                  إنشاء حساب خريج جديد
                </h1>
                <p className="text-[13px] text-[#64748B] mt-1">
                  الخطوة الأولى للربط المهني والتحقق الأكاديمي المباشر
                </p>
              </div>

              {/* Error Alert (MNRA-49) */}
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-[12px] text-xs font-bold leading-relaxed text-right flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
                {/* Full Name */}
                <div>
                  <label className="block text-[12px] font-bold text-[#0F1E36] mb-1 text-right">
                    الاسم الكامل (رباعي)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-[44px] px-4 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-right"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[12px] font-bold text-[#0F1E36] mb-1 text-right">
                    البريد الإلكتروني الجامعي أو الشخصي
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-[44px] px-4 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-right"
                  />
                </div>

                {/* University & Major Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F1E36] mb-1 text-right">
                      الجامعة
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      className="w-full h-[44px] px-4 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[12px] font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F1E36] mb-1 text-right">
                      التخصص الأكاديمي
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.major}
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      className="w-full h-[44px] px-4 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[12px] font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-right"
                    />
                  </div>
                </div>

                {/* Passwords Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F1E36] mb-1 text-right">
                      كلمة المرور
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full h-[44px] px-4 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[14px] font-semibold text-[#64748B] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F1E36] mb-1 text-right">
                      تأكيد كلمة المرور
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full h-[44px] px-4 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[14px] font-semibold text-[#64748B] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-right"
                    />
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
                  disabled={isLoading}
                  className="w-full h-[52px] bg-[#F59E0B] hover:bg-amber-600 disabled:opacity-60 text-[#0F1E36] text-[16px] font-black rounded-[14px] shadow-sm transition transform active:scale-[0.99] cursor-pointer mt-2 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-[#0F1E36] border-t-transparent rounded-full animate-spin" />
                      <span>جاري إنشاء الحساب والتحقق...</span>
                    </>
                  ) : (
                    <span>إنشاء الحساب وبدء التوثيق</span>
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
        </div>
      </main>

      <div className="h-4" />
    </div>
  )
}
