import React from 'react'
import { Link } from 'react-router-dom'
import logoImg from '../assets/logo_transparent.png'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-['Cairo'] text-start text-slate-800" dir="rtl">
      {/* Top Bar */}
      <header className="w-full bg-white border-b border-[#E2E8F0] px-6 sm:px-12 h-12 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="منارة" className="h-7 w-auto object-contain" />
            <span className="text-[#0F1E36] font-bold text-[13px] tracking-tight">
              منصة منارة
            </span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-[#64748B] font-semibold text-[12px]">
            الصفحة غير موجودة (404)
          </span>
        </div>
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 text-[#0F1E36] font-bold text-[12px] transition"
          >
            <span>الرئيسية</span>
            <span className="text-amber-600 font-bold">➔</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-[520px] w-full bg-white border border-[#E2E8F0] rounded-[28px] shadow-[0_6px_20px_rgba(15,30,54,0.06)] p-8 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-4xl mx-auto ring-8 ring-amber-50/50">
            🔍
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-xs tracking-wider font-mono">
              ERROR 404
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F1E36] tracking-tight">
              الصفحة المطلوبة غير موجودة
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-sm mx-auto">
              عذراً، قد يكون الرابط الذي اتبعته غير صحيح أو تمت إزالة هذه الصفحة أو نقلها إلى عنوان آخر.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto px-6 h-11 rounded-xl bg-[#0F1E36] hover:bg-slate-900 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
            >
              <span>العودة للصفحة الرئيسية</span>
              <span>🏠</span>
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-6 h-11 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <span>الرجوع للخلف</span>
              <span>↩</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-[#64748B]">
        جميع الحقوق محفوظة © منصة منارة 2026
      </footer>
    </div>
  )
}

export default NotFoundPage
