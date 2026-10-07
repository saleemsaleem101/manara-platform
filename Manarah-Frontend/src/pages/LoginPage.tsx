import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoImg from '../assets/logo_transparent.png'
import { useProfile } from '../context/ProfileContext'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useProfile()

  const [email, setEmail] = useState('jalal.matluq@gmail.com')
  const [password, setPassword] = useState('••••••••••••')
  const [rememberMe, setRememberMe] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email)
    navigate('/profile')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      {/* Top Bar (48px) - Exact 03_Auth_Login.svg */}
      <header className="w-full bg-white border-b border-[#E2E8F0] px-8 sm:px-16 h-12 flex items-center justify-between text-xs">
        <span className="text-[#64748B] font-semibold text-[13px]">
          منصة منارة لربط الخريجين بسوق العمل
        </span>
        <span className="text-[#0F1E36] font-bold text-[12px]">
          تسجيل الدخول
        </span>
      </header>

      {/* Main Centered Card (1280px on desktop) */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[1280px] bg-white border border-[#E2E8F0] rounded-[24px] shadow-[0_6px_20px_rgba(15,30,54,0.05)] overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[760px]">
          {/* Child 1 (RIGHT in RTL): Brand Section - Exact 03_Auth_Login.svg */}
          <div className="bg-[#F8FAFC] p-8 sm:p-14 flex flex-col items-center justify-center relative overflow-hidden text-center border-b lg:border-b-0 lg:border-l border-[#E2E8F0]">
            {/* Halo circle (cx=1020, cy=380, r=280, fill=#FEF3C7) */}
            <div className="w-[500px] h-[500px] rounded-full bg-[#FEF3C7]/60 blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 space-y-6 max-w-md flex flex-col items-center">
              <img
                src={logoImg}
                alt="شعار منصة منارة الرسمي"
                className="h-48 sm:h-56 w-auto mx-auto object-contain drop-shadow-sm"
              />

              <div className="space-y-2">
                <h2 className="text-[26px] sm:text-[28px] font-black text-[#0F1E36]">
                  تسجيل الدخول إلى منارة
                </h2>
                <p className="text-[14px] sm:text-[15px] font-bold text-[#D97706]">
                  بوابة الخريجين والشركات وسوق العمل
                </p>
              </div>
            </div>
          </div>

          {/* Child 2 (LEFT in RTL): Form Section - Exact 03_Auth_Login.svg */}
          <div className="p-8 sm:p-14 lg:p-16 flex flex-col justify-center">
            <div className="max-w-[480px] mx-auto w-full space-y-6">
              {/* Pill: بوابة الدخول */}
              <div className="inline-block px-4 py-1.5 bg-[#E2E8F0] text-[#0F1E36] text-[12px] font-bold rounded-full">
                بوابة الدخول
              </div>

              <div className="space-y-1">
                <h1 className="text-[28px] font-black text-[#0F1E36] tracking-tight">
                  مرحباً بعودتك إلى منارة
                </h1>
                <p className="text-[13px] text-[#64748B] leading-relaxed">
                  أدخل بيانات اعتماد حسابك للوصول إلى لوحة التحكم والفرص الوظيفية
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                {/* Email */}
                <div>
                  <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5 text-right">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jalal.matluq@gmail.com"
                    className="w-full h-[46px] px-4 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-semibold text-[#0F1E36] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-right"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[12px] font-bold text-[#0F1E36]">كلمة المرور</label>
                    <a href="#" className="text-[12px] font-bold text-[#D97706] hover:underline">
                      نسيت كلمة المرور؟
                    </a>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-[46px] px-4 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[14px] font-semibold text-[#64748B] focus:outline-none focus:border-[#F59E0B] focus:bg-white transition text-right"
                  />
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#F59E0B] focus:ring-amber-400 border-[#CBD5E1] cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="text-[12px] text-[#475569] cursor-pointer">
                    تذكر تسجيل دخولي على هذا الجهاز
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full h-[52px] bg-[#0F1E36] hover:bg-[#1E293B] text-white text-[16px] font-bold rounded-[14px] shadow-sm transition transform active:scale-[0.99] cursor-pointer mt-3"
                >
                  تسجيل الدخول
                </button>
              </form>

              {/* Footer */}
              <div className="text-center pt-3 text-[13px] text-[#64748B]">
                ليس لديك حساب بعد؟{' '}
                <Link to="/register" className="text-[#D97706] font-bold hover:underline">
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
