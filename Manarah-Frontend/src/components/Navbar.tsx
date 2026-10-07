import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import logoImg from '../assets/logo_transparent.png'
import { UserMenu } from './UserMenu'
import { useProfile } from '../context/ProfileContext'

export const Navbar: React.FC = () => {
  const location = useLocation()
  const { isAuthenticated } = useProfile()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
        {/* Right in RTL: Brand Logo & Title */}
        <Link to="/profile" className="flex items-center gap-3 group">
          <img
            src={logoImg}
            alt="شعار منصة منارة الرسمي"
            className="h-11 w-auto object-contain transition group-hover:scale-105"
          />
          <div className="text-right">
            <span className="text-[17px] font-black text-[#0F1E36] block leading-tight">منصة مَنَارَة</span>
            <span className="text-[10px] font-bold text-[#D97706] block">
              بوابة الخريجين والشركات
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-[13px]">
          <Link
            to="/profile"
            className={`transition font-semibold ${
              location.pathname === '/' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            الرئيسية
          </Link>

          {/* Active Tab: ملفي المهني */}
          <Link
            to="/profile"
            className="px-4 py-1.5 rounded-xl bg-amber-100/80 text-amber-900 font-bold transition hover:bg-amber-200/80"
          >
            ملفي المهني
          </Link>

          <span
            className="text-slate-400 cursor-not-allowed font-medium transition flex items-center gap-1.5"
            title="ميزة الشواغر والفرص الوظيفية متاحة في السبرنت القادم"
          >
            <span>الفرص المتاحة</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-normal">قريباً</span>
          </span>

          <span
            className="text-slate-400 cursor-not-allowed font-medium transition flex items-center gap-1.5"
            title="دليل الشركات الشريكة متاح في السبرنت القادم"
          >
            <span>الشركات الشريكة</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-normal">قريباً</span>
          </span>
        </nav>

        {/* Left in RTL: User Controls & Notification */}
        <div className="flex items-center gap-3">
          {/* Notification Bell (Sprint 3) */}
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-sm cursor-not-allowed opacity-80"
            title="نظام الإشعارات الفورية (سبرنت 3 - قريباً)"
            disabled
          >
            🔔
          </button>

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold">
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              >
                تسجيل الدخول
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black transition shadow-xs"
              >
                إنشاء حساب
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
