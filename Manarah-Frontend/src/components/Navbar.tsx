import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logoImg from '../assets/logo_transparent.png'
import { UserMenu } from './UserMenu'
import { useProfile } from '../context/ProfileContext'
import { api } from '../services/api'

export const Navbar: React.FC = () => {
  const location = useLocation()
  const { isAuthenticated, role } = useProfile()
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return

    let isCurrent = true
    api.getUnreadNotificationCount()
      .then((res) => {
        if (isCurrent) setUnreadCount(res.count || 0)
      })
      .catch(() => {
        if (isCurrent) setUnreadCount(0)
      })

    return () => {
      isCurrent = false
    }
  }, [isAuthenticated, location.pathname])

  // Close mobile menu on navigate
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const effectiveUnreadCount = isAuthenticated ? unreadCount : 0

  const homePath =
    role === 'COMPANY'
      ? '/company/status'
      : role === 'ADMIN'
      ? '/admin'
      : '/'

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-2xs font-['Cairo'] text-start" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Right in RTL: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <Link to={homePath} className="flex items-center gap-2.5 group">
            <img
              src={logoImg}
              alt="شعار منصة منارة"
              className="h-9 w-auto object-contain transition group-hover:scale-105"
            />
            <div className="text-start leading-none">
              <span className="text-[16px] font-black text-[#0F1E36] block tracking-tight">منصة مَنَارَة</span>
              <span className="text-[9px] font-bold text-[#F59E0B] tracking-wider block mt-0.5">MANARA PLATFORM</span>
            </div>
          </Link>
        </div>

        {/* Center: Navigation Links Based on Role (Screen 15) */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-2 lg:gap-3.5 text-[13px] font-bold">
            {/* Graduate Role */}
            {(role === 'GRADUATE' || !role) && (
              <>
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-xl transition ${
                    isActive('/', true)
                      ? 'bg-[#FEF3C7] text-[#B45309]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  الرئيسية
                </Link>

                <Link
                  to="/profile"
                  className={`px-3 py-1.5 rounded-xl transition ${
                    isActive('/profile') && !isActive('/portfolio')
                      ? 'bg-[#FEF3C7] text-[#B45309]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  ملفي المهني
                </Link>

                <Link
                  to="/jobs"
                  className={`px-3 py-1.5 rounded-xl transition ${
                    isActive('/jobs')
                      ? 'bg-[#FEF3C7] text-[#B45309]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  الفرص المتاحة
                </Link>

                <Link
                  to="/applications"
                  className={`px-3 py-1.5 rounded-xl transition ${
                    isActive('/applications')
                      ? 'bg-[#FEF3C7] text-[#B45309]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  طلباتي
                </Link>
              </>
            )}

            {/* Company Role */}
            {role === 'COMPANY' && (
              <>
                <Link
                  to="/company/status"
                  className={`px-3 py-1.5 rounded-xl transition ${
                    isActive('/company/status')
                      ? 'bg-[#FEF3C7] text-[#B45309]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  لوحة الشركة
                </Link>

                <Link
                  to="/company/profile"
                  className={`px-3 py-1.5 rounded-xl transition ${
                    isActive('/company/profile')
                      ? 'bg-[#FEF3C7] text-[#B45309]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  ملف الشركة
                </Link>

                <Link
                  to="/company/jobs"
                  className={`px-3 py-1.5 rounded-xl transition ${
                    isActive('/company/jobs', true) || isActive('/company/jobs/') && !isActive('/company/jobs/new')
                      ? 'bg-[#FEF3C7] text-[#B45309]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  وظائفي
                </Link>

                <Link
                  to="/company/jobs/new"
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    isActive('/company/jobs/new')
                      ? 'bg-[#0F1E36] text-white shadow-2xs'
                      : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-2xs'
                  }`}
                >
                  + نشر وظيفة
                </Link>
              </>
            )}

            {/* Admin Role */}
            {role === 'ADMIN' && (
              <>
                <Link
                  to="/admin"
                  onClick={() => {
                    if (location.pathname === '/admin') {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }}
                  className={`px-4 py-1.5 rounded-full transition ${
                    isActive('/admin', true) && !location.hash
                      ? 'bg-[#FEF08A] text-[#854D0E] font-black shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  لوحة التحكم
                </Link>

                <Link
                  to="/admin/users"
                  className={`px-3 py-1.5 rounded-xl transition ${
                    isActive('/admin/users')
                      ? 'bg-[#FEF08A] text-[#854D0E]'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  المستخدمون
                </Link>

                <Link
                  to="/admin/jobs"
                  className={`px-3 py-1.5 rounded-xl transition ${
                    isActive('/admin/jobs')
                      ? 'bg-[#FEF08A] text-[#854D0E]'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  الوظائف
                </Link>

                <Link
                  to="/admin#reports"
                  onClick={() => {
                    if (location.pathname === '/admin') {
                      document.getElementById('reports')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    location.pathname === '/admin' && location.hash === '#reports'
                      ? 'bg-[#FEF08A] text-[#854D0E]'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  التقارير
                </Link>
              </>
            )}
          </nav>
        )}

        {/* Left in RTL: User Controls, Notification Bell & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <Link
                to="/notifications"
                className={`relative w-9 h-9 rounded-full flex items-center justify-center transition ${
                  role === 'ADMIN'
                    ? 'bg-[#FEF08A] text-amber-800 hover:bg-amber-200 shadow-2xs'
                    : isActive('/notifications')
                    ? 'bg-[#0F1E36] text-[#F59E0B]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title="مركز الإشعارات"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {effectiveUnreadCount > 0 && (
                  <span className="absolute -top-1 -end-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                    {effectiveUnreadCount > 9 ? '9+' : effectiveUnreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown Menu */}
              <UserMenu />

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-8.5 h-8.5 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer"
                aria-label="القائمة"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              >
                تسجيل الدخول
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-xl bg-[#0F1E36] hover:bg-slate-900 text-white font-bold transition shadow-xs"
              >
                إنشاء حساب
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 text-xs font-bold transition-all duration-150">
          {(role === 'GRADUATE' || !role) && (
            <>
              <Link to="/" className="block py-2 px-3 rounded-lg hover:bg-slate-50">الرئيسية</Link>
              <Link to="/profile" className="block py-2 px-3 rounded-lg hover:bg-slate-50">ملفي المهني</Link>
              <Link to="/portfolio" className="block py-2 px-3 rounded-lg hover:bg-slate-50">المهارات والمشاريع</Link>
              <Link to="/jobs" className="block py-2 px-3 rounded-lg hover:bg-slate-50">الفرص المتاحة</Link>
              <Link to="/applications" className="block py-2 px-3 rounded-lg hover:bg-slate-50">طلباتي</Link>
            </>
          )}

          {role === 'COMPANY' && (
            <>
              <Link to="/company/status" className="block py-2 px-3 rounded-lg hover:bg-slate-50">لوحة الشركة</Link>
              <Link to="/company/profile" className="block py-2 px-3 rounded-lg hover:bg-slate-50">ملف الشركة</Link>
              <Link to="/company/jobs" className="block py-2 px-3 rounded-lg hover:bg-slate-50">وظائفي</Link>
              <Link to="/company/jobs/new" className="block py-2 px-3 rounded-lg hover:bg-slate-50 text-amber-600">+ نشر وظيفة</Link>
            </>
          )}

          {role === 'ADMIN' && (
            <>
              <Link
                to="/admin"
                onClick={() => {
                  setMobileMenuOpen(false)
                  if (location.pathname === '/admin') window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="block py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                لوحة التحكم
              </Link>
              <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg hover:bg-slate-50">المستخدمون</Link>
              <Link to="/admin/jobs" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg hover:bg-slate-50">الوظائف</Link>
              <Link
                to="/admin#reports"
                onClick={() => {
                  setMobileMenuOpen(false)
                  if (location.pathname === '/admin') document.getElementById('reports')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="block py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                التقارير
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}

export default Navbar
