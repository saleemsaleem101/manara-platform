import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'

export const UserMenu: React.FC = () => {
  const { profile, role, logout } = useProfile()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const initials = profile.name
    ? profile.name
        .trim()
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('.')
    : role === 'COMPANY'
    ? 'ي.ت'
    : role === 'ADMIN'
    ? 'م.ن'
    : 'ج.ص'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
    navigate('/login')
  }

  const roleLabel =
    role === 'COMPANY'
      ? 'منشأة معتمدة'
      : role === 'ADMIN'
      ? 'مدير النظام'
      : 'مرشح معتمد'

  return (
    <div className="relative font-['Cairo'] text-start" ref={menuRef} dir="rtl">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-[#E8DEC8] dark:border-slate-700 hover:border-[#BAE6FD] dark:hover:border-sky-500/50 rounded-xl transition cursor-pointer shadow-xs"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8] font-black flex items-center justify-center text-xs shrink-0 ring-1 ring-[#BAE6FD]/60 dark:ring-sky-500/40">
          {initials}
        </div>
        <div className="text-start hidden sm:block">
          <div className="text-xs font-black text-[#0F172A] dark:text-slate-100 leading-none">{profile.name || roleLabel}</div>
          <div className="text-[10px] text-[#64748B] dark:text-slate-400 font-semibold mt-0.5">{roleLabel}</div>
        </div>
        <svg className="w-3.5 h-3.5 text-[#94A3B8] hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute start-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8DEC8] dark:border-slate-800 shadow-2xl p-3 z-50 transition-all duration-150 backdrop-blur-xl">
          {/* Header */}
          <div className="p-2.5 pb-3 border-b border-[#FAF7F2] dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8] font-black flex items-center justify-center text-sm shrink-0 border border-[#BAE6FD] dark:border-sky-500/40">
              {initials}
            </div>
            <div className="truncate text-start flex-1">
              <div className="text-[13px] font-black text-[#0F172A] dark:text-slate-100 truncate">{profile.name || roleLabel}</div>
              <div className="text-[11px] text-[#64748B] dark:text-slate-400 truncate font-mono mt-0.5">{profile.email || roleLabel}</div>
            </div>
          </div>

          {/* Links for Graduate */}
          {(role === 'GRADUATE' || !role) && (
            <div className="py-2 space-y-1 text-xs font-bold">
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0F172A] dark:text-slate-200 hover:bg-[#FAF7F2] dark:hover:bg-slate-800 transition"
              >
                <span>👤</span>
                <span>عرض الملف المهني</span>
              </Link>

              <Link
                to="/profile/edit"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0F172A] dark:text-slate-200 hover:bg-[#FAF7F2] dark:hover:bg-slate-800 transition"
              >
                <span>✏️</span>
                <span>تعديل البيانات الأساسية</span>
              </Link>

              <Link
                to="/portfolio"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0F172A] dark:text-slate-200 hover:bg-[#FAF7F2] dark:hover:bg-slate-800 transition"
              >
                <span>💼</span>
                <span>المشاريع والمهارات والفيديو</span>
              </Link>
            </div>
          )}

          {/* Links for Company */}
          {role === 'COMPANY' && (
            <div className="py-2 space-y-1 text-xs font-bold">
              <Link
                to="/company/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0F172A] dark:text-slate-200 hover:bg-[#FAF7F2] dark:hover:bg-slate-800 transition"
              >
                <span>🏢</span>
                <span>ملف المنشأة</span>
              </Link>

              <Link
                to="/company/status"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0F172A] dark:text-slate-200 hover:bg-[#FAF7F2] dark:hover:bg-slate-800 transition"
              >
                <span>🛡️</span>
                <span>حالة الاعتماد التجاري</span>
              </Link>

              <Link
                to="/company/jobs"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0F172A] dark:text-slate-200 hover:bg-[#FAF7F2] dark:hover:bg-slate-800 transition"
              >
                <span>📑</span>
                <span>إدارة الشواغر (وظائفي)</span>
              </Link>
            </div>
          )}

          {/* Links for Admin */}
          {role === 'ADMIN' && (
            <div className="py-2 space-y-1 text-xs font-bold">
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0F172A] dark:text-slate-200 hover:bg-[#FAF7F2] dark:hover:bg-slate-800 transition"
              >
                <span>📊</span>
                <span>لوحة التحكم الرئيسية</span>
              </Link>

              <Link
                to="/admin/users"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0F172A] dark:text-slate-200 hover:bg-[#FAF7F2] dark:hover:bg-slate-800 transition"
              >
                <span>👥</span>
                <span>إدارة المستخدمين</span>
              </Link>

              <Link
                to="/admin/jobs"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0F172A] dark:text-slate-200 hover:bg-[#FAF7F2] dark:hover:bg-slate-800 transition"
              >
                <span>📋</span>
                <span>إدارة الوظائف</span>
              </Link>
            </div>
          )}

          {/* Logout Action */}
          <div className="pt-2 border-t border-[#FAF7F2] dark:border-slate-800">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs transition cursor-pointer"
            >
              <span>🚪</span>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu
