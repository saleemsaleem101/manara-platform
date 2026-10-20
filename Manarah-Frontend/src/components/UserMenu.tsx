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
      : 'خريج تقني'

  return (
    <div className="relative font-['Cairo'] text-start" ref={menuRef} dir="rtl">
      {/* Trigger Button (Screen 15 User Pill / Screen 22 Admin Pill) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          role === 'ADMIN'
            ? 'flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200/90 hover:border-slate-300 rounded-full transition cursor-pointer shadow-2xs'
            : 'flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-100 transition cursor-pointer'
        }
        aria-expanded={isOpen}
      >
        {role === 'ADMIN' ? (
          <>
            <div className="w-6.5 h-6.5 rounded-full bg-[#0F1E36] text-white font-bold flex items-center justify-center text-[11px] shrink-0">
              م
            </div>
            <span className="text-xs font-bold text-slate-800">مدير النظام</span>
            <svg className="w-3 h-3 text-slate-700 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full bg-[#FEF3C7] text-[#B45309] font-bold flex items-center justify-center text-xs shrink-0 ring-1 ring-amber-200">
              {initials}
            </div>
            <div className="text-start hidden sm:block">
              <div className="text-xs font-bold text-[#0F1E36] leading-none">{profile.name || roleLabel}</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{roleLabel}</div>
            </div>
            <svg className="w-3.5 h-3.5 text-slate-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {/* Dropdown Menu (Screen 15) */}
      {isOpen && (
        <div className="absolute start-0 mt-2 w-72 rounded-2xl bg-white border border-[#E2E8F0] shadow-xl p-3 z-50 transition-all duration-150">
          {/* Header */}
          <div className="p-2.5 pb-3 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FEF3C7] text-[#B45309] font-bold flex items-center justify-center text-sm shrink-0">
              {initials}
            </div>
            <div className="truncate text-start flex-1">
              <div className="text-[13px] font-black text-[#0F1E36] truncate">{profile.name || roleLabel}</div>
              <div className="text-[11px] text-slate-500 truncate font-mono mt-0.5">{profile.email || roleLabel}</div>
            </div>
          </div>

          {/* Links for Graduate */}
          {(role === 'GRADUATE' || !role) && (
            <div className="py-2 space-y-1 text-xs font-bold">
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0F1E36] hover:bg-slate-50 transition"
              >
                <span>👤</span>
                <span>عرض الملف المهني</span>
              </Link>

              <Link
                to="/profile/edit"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0F1E36] hover:bg-slate-50 transition"
              >
                <span>✏️</span>
                <span>تعديل البيانات الأساسية</span>
              </Link>

              <Link
                to="/portfolio"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0F1E36] hover:bg-slate-50 transition"
              >
                <span>💼</span>
                <span>المهارات والمشاريع</span>
              </Link>
            </div>
          )}

          {/* Links for Company */}
          {role === 'COMPANY' && (
            <div className="py-2 space-y-1 text-xs font-bold">
              <Link
                to="/company/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0F1E36] hover:bg-slate-50 transition"
              >
                <span>🏢</span>
                <span>ملف المنشأة</span>
              </Link>

              <Link
                to="/company/status"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0F1E36] hover:bg-slate-50 transition"
              >
                <span>🛡️</span>
                <span>حالة الاعتماد التجاري</span>
              </Link>

              <Link
                to="/company/jobs"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0F1E36] hover:bg-slate-50 transition"
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
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0F1E36] hover:bg-slate-50 transition"
              >
                <span>📊</span>
                <span>لوحة التحكم الرئيسية</span>
              </Link>

              <Link
                to="/admin/users"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0F1E36] hover:bg-slate-50 transition"
              >
                <span>👥</span>
                <span>إدارة المستخدمين</span>
              </Link>

              <Link
                to="/admin/jobs"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0F1E36] hover:bg-slate-50 transition"
              >
                <span>📋</span>
                <span>إدارة الوظائف</span>
              </Link>
            </div>
          )}

          {/* Logout Action */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition cursor-pointer"
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
