import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { UserMenu } from './UserMenu'
import { BrandLogo } from './BrandLogo'
import { ThemeToggle } from './ThemeToggle'
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE4D9]/80 shadow-2xs font-['Cairo'] text-start" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Right in RTL: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <BrandLogo to={homePath} />
        </div>

        {/* Center: Navigation Links Based on Role */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 bg-[#F4EFE6]/60 p-1.5 rounded-2xl border border-[#EAE4D9] text-[13px] font-bold">
            {/* Graduate Role */}
            {(role === 'GRADUATE' || !role) && (
              <>
                <Link
                  to="/"
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    isActive('/', true)
                      ? 'bg-white text-[#0284C7] font-black shadow-2xs border border-[#BAE3F9]/60'
                      : 'text-[#475569] hover:text-[#0284C7] hover:bg-white/60'
                  }`}
                >
                  الرئيسية
                </Link>

                <Link
                  to="/profile"
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    isActive('/profile') && !isActive('/portfolio')
                      ? 'bg-white text-[#0284C7] font-black shadow-2xs border border-[#BAE3F9]/60'
                      : 'text-[#475569] hover:text-[#0284C7] hover:bg-white/60'
                  }`}
                >
                  ملفي المهني
                </Link>

                <Link
                  to="/portfolio"
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    isActive('/portfolio')
                      ? 'bg-white text-[#0284C7] font-black shadow-2xs border border-[#BAE3F9]/60'
                      : 'text-[#475569] hover:text-[#0284C7] hover:bg-white/60'
                  }`}
                >
                  المشاريع والمهارات
                </Link>

                <Link
                  to="/jobs"
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    isActive('/jobs')
                      ? 'bg-white text-[#0284C7] font-black shadow-2xs border border-[#BAE3F9]/60'
                      : 'text-[#475569] hover:text-[#0284C7] hover:bg-white/60'
                  }`}
                >
                  الفرص المتاحة
                </Link>

                <Link
                  to="/applications"
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    isActive('/applications')
                      ? 'bg-white text-[#0284C7] font-black shadow-2xs border border-[#BAE3F9]/60'
                      : 'text-[#475569] hover:text-[#0284C7] hover:bg-white/60'
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
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    isActive('/company/status')
                      ? 'bg-white text-[#0284C7] font-black shadow-2xs border border-[#BAE3F9]/60'
                      : 'text-[#475569] hover:text-[#0284C7] hover:bg-white/60'
                  }`}
                >
                  لوحة الشركة
                </Link>

                <Link
                  to="/company/profile"
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    isActive('/company/profile')
                      ? 'bg-white text-[#0284C7] font-black shadow-2xs border border-[#BAE3F9]/60'
                      : 'text-[#475569] hover:text-[#0284C7] hover:bg-white/60'
                  }`}
                >
                  ملف المنشأة
                </Link>

                <Link
                  to="/company/jobs"
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    isActive('/company/jobs', true) || (isActive('/company/jobs/') && !isActive('/company/jobs/new'))
                      ? 'bg-white text-[#0284C7] font-black shadow-2xs border border-[#BAE3F9]/60'
                      : 'text-[#475569] hover:text-[#0284C7] hover:bg-white/60'
                  }`}
                >
                  وظائفي
                </Link>

                <Link
                  to="/company/jobs/new"
                  className={`px-3.5 py-1.5 rounded-xl transition font-black ${
                    isActive('/company/jobs/new')
                      ? 'bg-[#0284C7] text-white shadow-2xs'
                      : 'bg-gradient-to-r from-[#0284C7] to-[#10B981] hover:from-[#0369A1] hover:to-[#059669] text-white shadow-2xs'
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
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    isActive('/admin', true) && !location.hash
                      ? 'bg-white text-[#0284C7] font-black shadow-2xs border border-[#BAE3F9]/60'
                      : 'text-[#475569] hover:text-[#0284C7] hover:bg-white/60'
                  }`}
                >
                  لوحة التحكم
                </Link>

                <Link
                  to="/admin/users"
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    isActive('/admin/users')
                      ? 'bg-white text-[#0284C7] font-black shadow-2xs border border-[#BAE3F9]/60'
                      : 'text-[#475569] hover:text-[#0284C7] hover:bg-white/60'
                  }`}
                >
                  المستخدمون
                </Link>

                <Link
                  to="/admin/jobs"
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    isActive('/admin/jobs')
                      ? 'bg-white text-[#0284C7] font-black shadow-2xs border border-[#BAE3F9]/60'
                      : 'text-[#475569] hover:text-[#0284C7] hover:bg-white/60'
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
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    location.pathname === '/admin' && location.hash === '#reports'
                      ? 'bg-white text-[#0284C7] font-black shadow-2xs border border-[#BAE3F9]/60'
                      : 'text-[#475569] hover:text-[#0284C7] hover:bg-white/60'
                  }`}
                >
                  التقارير
                </Link>
              </>
            )}
          </nav>
        )}

        {/* Left in RTL: User Controls, Theme Toggle, Notification Bell & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Universal Theme Toggle */}
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <Link
                to="/notifications"
                className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition ${
                  isActive('/notifications')
                    ? 'bg-[#E8F4FC] text-[#0284C7] border-[#BAE3F9]'
                    : 'bg-white text-[#475569] border-[#EAE4D9] hover:bg-[#F4EFE6]/60 hover:text-[#0284C7]'
                }`}
                title="مركز الإشعارات"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {effectiveUnreadCount > 0 && (
                  <span className="absolute -top-1 -end-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#EF4444] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
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
                className="md:hidden w-10 h-10 rounded-xl bg-white border border-[#EAE4D9] text-[#0F172A] flex items-center justify-center cursor-pointer shadow-2xs"
                aria-label="القائمة"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-[#334155] border border-[#EAE4D9] bg-white hover:bg-[#F4EFE6]/60 transition"
              >
                تسجيل الدخول
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#10B981] hover:from-[#0369A1] hover:to-[#059669] text-white font-black transition shadow-xs"
              >
                إنشاء حساب
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden border-t border-[#EAE4D9] bg-white px-4 py-3 space-y-1.5 text-xs font-bold transition-all duration-150">
          {(role === 'GRADUATE' || !role) && (
            <>
              <Link to="/" className="block py-2 px-3 rounded-lg hover:bg-[#F4EFE6]">الرئيسية</Link>
              <Link to="/profile" className="block py-2 px-3 rounded-lg hover:bg-[#F4EFE6]">ملفي المهني</Link>
              <Link to="/portfolio" className="block py-2 px-3 rounded-lg hover:bg-[#F4EFE6]">المشاريع والمهارات</Link>
              <Link to="/jobs" className="block py-2 px-3 rounded-lg hover:bg-[#F4EFE6]">الفرص المتاحة</Link>
              <Link to="/applications" className="block py-2 px-3 rounded-lg hover:bg-[#F4EFE6]">طلباتي</Link>
            </>
          )}

          {role === 'COMPANY' && (
            <>
              <Link to="/company/status" className="block py-2 px-3 rounded-lg hover:bg-[#F4EFE6]">لوحة الشركة</Link>
              <Link to="/company/profile" className="block py-2 px-3 rounded-lg hover:bg-[#F4EFE6]">ملف المنشأة</Link>
              <Link to="/company/jobs" className="block py-2 px-3 rounded-lg hover:bg-[#F4EFE6]">وظائفي</Link>
              <Link to="/company/jobs/new" className="block py-2 px-3 rounded-lg bg-[#E8F4FC] text-[#0284C7] font-black">+ نشر وظيفة</Link>
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
                className="block py-2 px-3 rounded-lg hover:bg-[#F4EFE6]"
              >
                لوحة التحكم
              </Link>
              <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg hover:bg-[#F4EFE6]">المستخدمون</Link>
              <Link to="/admin/jobs" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg hover:bg-[#F4EFE6]">الوظائف</Link>
              <Link
                to="/admin#reports"
                onClick={() => {
                  setMobileMenuOpen(false)
                  if (location.pathname === '/admin') document.getElementById('reports')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="block py-2 px-3 rounded-lg hover:bg-[#F4EFE6]"
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
