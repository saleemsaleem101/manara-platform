import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'

export const UserMenu: React.FC = () => {
  const { profile, logout } = useProfile()
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
    : 'خ.م'

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

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-[#0F1E36] text-white font-bold flex items-center justify-center text-xs">
            {initials}
          </div>
          {profile.isVerified && (
            <span className="absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
          )}
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-xs font-bold text-slate-900 leading-none">{profile.name || 'خريج منارة'}</div>
        </div>
      </button>

      {/* Dropdown Menu (Matches Frame 06_Navbar_UserMenu.svg exactly) */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-[320px] rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-2.5 pb-3 border-b border-slate-100 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#FEF3C7] text-[#B45309] font-bold flex items-center justify-center text-sm shrink-0">
              {initials}
            </div>
            <div className="truncate text-right flex-1">
              <div className="text-[13px] font-black text-[#0F1E36] truncate">{profile.name || 'خريج منارة'}</div>
              <div className="text-[11px] text-slate-500 truncate font-mono mt-0.5">{profile.email || 'لم يسجل بريد'}</div>
            </div>
            {profile.isVerified && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                ✓
              </span>
            )}
          </div>

          {/* Links */}
          <div className="py-2 space-y-1 text-[13px]">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 text-[#0F1E36] font-bold hover:bg-slate-100 transition"
            >
              <span>👤</span>
              <span>عرض الملف المهني</span>
            </Link>

            <Link
              to="/profile/edit"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#0F1E36] font-semibold hover:bg-slate-50 transition"
            >
              <span>✏️</span>
              <span>تعديل البيانات الأساسية</span>
            </Link>

            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 font-semibold cursor-not-allowed">
              <div className="flex items-center gap-3">
                <span>⚙️</span>
                <span>إعدادات الحساب والأمان</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-normal">قريباً</span>
            </div>
          </div>

          {/* Logout Action */}
          <div className="border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-[13px] font-bold transition cursor-pointer"
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
