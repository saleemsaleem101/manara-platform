import React from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { ThemeToggle } from '../components/ThemeToggle'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-between font-sans text-start text-[#0F172A]" dir="rtl">
      {/* Top Bar */}
      <header className="w-full bg-white border-b border-[#EAE4D9] px-6 sm:px-12 h-16 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <BrandLogo size="sm" showSubline={false} />
          <span className="text-slate-300">/</span>
          <span className="text-[#0284C7] font-bold text-xs">
            الصفحة غير موجودة (404)
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FBF9F5] hover:bg-[#F4EFE6] border border-[#EAE4D9] text-[#0F172A] font-bold text-xs transition shadow-2xs"
          >
            <span>الرئيسية</span>
            <span className="text-[#0284C7] font-bold">➔</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-[520px] w-full bg-white border border-[#EAE4D9] rounded-3xl shadow-sm p-8 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-[#E8F4FC] text-[#0284C7] border border-[#BAE3F9] flex items-center justify-center text-3xl mx-auto ring-8 ring-[#E8F4FC]/50">
            🔍
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-[#F4EFE6] text-slate-700 border border-[#EAE4D9] font-bold text-xs tracking-wider font-mono">
              ERROR 404
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              الصفحة المطلوبة غير موجودة
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
              عذراً، قد يكون الرابط الذي اتبعته غير صحيح أو تمت إزالة هذه الصفحة أو نقلها إلى عنوان آخر.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto px-6 h-11 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#10B981] hover:from-[#0369A1] hover:to-[#059669] text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-xs"
            >
              <span>العودة للصفحة الرئيسية</span>
              <span>🏠</span>
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-6 h-11 rounded-xl border border-[#EAE4D9] bg-white hover:bg-[#F4EFE6]/60 text-[#0F172A] font-bold text-xs transition flex items-center justify-center gap-2 shadow-2xs"
            >
              <span>الرجوع للخلف</span>
              <span>↩</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-400 font-medium">
        جميع الحقوق محفوظة © منصة منارة 2026
      </footer>
    </div>
  )
}

export default NotFoundPage
