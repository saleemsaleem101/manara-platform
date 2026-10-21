import React from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { ThemeToggle } from '../components/ThemeToggle'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] flex flex-col justify-between font-sans text-start text-[#0F172A] dark:text-white transition-colors duration-300 relative selection:bg-[#BAE6FD] selection:text-[#0284C7]" dir="rtl">
      {/* Background Decorative Glow Auras */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#BAE6FD]/20 dark:bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-10 w-96 h-96 bg-[#E8DEC8]/25 dark:bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Bar */}
      <header className="w-full glass-silk-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-[#E8DEC8] dark:border-slate-800 px-6 sm:px-12 h-16 flex items-center justify-between text-xs relative z-20">
        <div className="flex items-center gap-4">
          <BrandLogo size="sm" showSubline={false} />
          <span className="text-[#E8DEC8] dark:text-slate-700">/</span>
          <span className="text-[#0284C7] dark:text-[#38BDF8] bg-[#BAE6FD]/30 dark:bg-sky-950/50 border border-[#BAE6FD] dark:border-sky-800 px-3 py-1 rounded-full font-bold text-[11px]">
            الصفحة غير موجودة (404)
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 hover:bg-[#E8DEC8]/40 dark:hover:bg-slate-700 border border-[#E8DEC8] dark:border-slate-700 text-[#0F172A] dark:text-white font-bold text-xs transition shadow-sm"
          >
            <span>الرئيسية</span>
            <span className="text-[#0284C7] dark:text-[#38BDF8] font-bold">➔</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-[520px] w-full glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-[#E8DEC8] dark:border-slate-800 rounded-3xl shadow-xl p-8 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-[#BAE6FD]/30 dark:bg-sky-950/50 text-[#0284C7] dark:text-[#38BDF8] border border-[#BAE6FD] dark:border-sky-800 flex items-center justify-center text-3xl mx-auto ring-8 ring-[#BAE6FD]/20 dark:ring-sky-500/10">
            🔍
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-[#FAF7F2] dark:bg-slate-800 text-[#6C4F3D] dark:text-slate-300 border border-[#E8DEC8] dark:border-slate-700 font-bold text-xs tracking-wider font-mono">
              ERROR 404
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight">
              الصفحة المطلوبة غير موجودة
            </h1>
            <p className="text-xs sm:text-sm text-[#6C4F3D] dark:text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
              عذراً، قد يكون الرابط الذي اتبعته غير صحيح أو تمت إزالة هذه الصفحة أو نقلها إلى عنوان آخر.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto px-6 h-11 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-md shadow-sky-500/20"
            >
              <span>العودة للصفحة الرئيسية</span>
              <span>🏠</span>
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-6 h-11 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 hover:bg-[#E8DEC8]/40 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>الرجوع للخلف</span>
              <span>↩</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-[#6C4F3D] dark:text-slate-400 font-medium relative z-10">
        جميع الحقوق محفوظة © منصة منارة 2026
      </footer>
    </div>
  )
}

export default NotFoundPage
