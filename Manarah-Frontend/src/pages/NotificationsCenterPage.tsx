import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { api } from '../services/api'
import type { AppNotification } from '../types'

export const NotificationsCenterPage: React.FC = () => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD' | 'APPLICATIONS' | 'SYSTEM'>('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type })
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setFeedbackMsg(null), 4000)
  }

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications().catch(() => [])
      const validNotifications = (data || [])
        .filter((n: AppNotification) => !n.title.includes('فرصة وظيفية جديدة'))
        .sort((a: AppNotification, b: AppNotification) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setNotifications(validNotifications)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      showNotification(msg || 'فشل تحميل قائمة الإشعارات', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationAsRead(id).catch(() => { })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch {
      // Ignored
    }
  }

  const handleMarkAllRead = async () => {
    try {
      setIsMarkingAll(true)
      await api.markAllNotificationsAsRead().catch(() => { })
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      showNotification('تم تحديد جميع الإشعارات كمقروءة بنجاح ✓', 'success')
    } catch {
      showNotification('فشل تحديد الكل كمقروء', 'error')
    } finally {
      setIsMarkingAll(false)
    }
  }

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'UNREAD') return !item.is_read
    if (activeFilter === 'APPLICATIONS') return item.type === 'NEW_APPLICATION' || item.type === 'STATUS_UPDATE'
    if (activeFilter === 'SYSTEM') return item.type === 'SYSTEM' || item.type === 'COMPANY_VERIFIED'
    return true
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] text-[#0F172A] dark:text-white font-sans transition-colors duration-300 relative selection:bg-[#BAE6FD] selection:text-[#0284C7]" dir="rtl">
      {/* Background Decorative Glow Auras */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#BAE6FD]/20 dark:bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-10 w-96 h-96 bg-[#E8DEC8]/25 dark:bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Breadcrumbs & Title */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-[#6C4F3D] dark:text-slate-400 mb-2 font-semibold">
              <Link to="/profile" className="hover:text-[#0284C7] dark:hover:text-[#38BDF8] transition">
                الرئيسية
              </Link>
              <span>/</span>
              <span className="text-[#0284C7] dark:text-[#38BDF8] font-black">مركز الإشعارات والتنبيهات المباشرة</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white">
                  مركز الإشعارات والتنبيهات المباشرة
                </h1>
                <p className="text-[#6C4F3D] dark:text-slate-400 text-sm mt-1 font-medium">
                  إشعارات تحديث طلبات التوظيف والفرص والتنبيهات الرسمية
                </p>
              </div>
              {unreadCount > 0 && (
                <span className="self-start sm:self-center px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-black text-xs shadow-sm">
                  {unreadCount} إشعار جديد غير مقروء
                </span>
              )}
            </div>
          </div>

          {/* Feedback Alert */}
          {feedbackMsg && (
            <div
              className={`mb-6 p-4 rounded-2xl border text-sm font-bold flex items-center justify-between shadow-sm backdrop-blur-md animate-fadeIn ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{feedbackMsg.type === 'success' ? '✓' : '⚠'}</span>
                <span>{feedbackMsg.text}</span>
              </div>
              <button
                onClick={() => setFeedbackMsg(null)}
                className="text-xs text-[#6C4F3D] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white font-normal px-2 py-1 cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          )}

          {/* Card Header & Controls */}
          <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-5 sm:p-6 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DEC8] dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-[#0F172A] dark:text-white">الإشعارات والتحديثات اللحظية</span>
                <span className="text-xs text-[#6C4F3D] dark:text-slate-400 font-mono">({notifications.length})</span>
              </div>

              <button
                type="button"
                disabled={isMarkingAll || unreadCount === 0}
                onClick={handleMarkAllRead}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  unreadCount === 0
                    ? 'bg-[#FAF7F2]/50 dark:bg-slate-800/40 text-[#6C4F3D]/40 dark:text-slate-600 border-[#E8DEC8]/40 dark:border-slate-800 cursor-not-allowed'
                    : 'bg-[#FAF7F2] dark:bg-slate-800 hover:bg-[#E8DEC8]/40 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white border-[#E8DEC8] dark:border-slate-700 cursor-pointer shadow-sm'
                }`}
              >
                {isMarkingAll ? (
                  <span className="w-3 h-3 border-2 border-[#0284C7] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                )}
                <span>تحديد الكل كمقروء</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                  activeFilter === 'ALL'
                    ? 'bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white shadow-md shadow-sky-500/20 font-black'
                    : 'bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700 text-[#6C4F3D] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white hover:bg-[#E8DEC8]/30 dark:hover:bg-slate-700'
                }`}
              >
                الكل ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('UNREAD')}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                  activeFilter === 'UNREAD'
                    ? 'bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white shadow-md shadow-sky-500/20 font-black'
                    : 'bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700 text-[#6C4F3D] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white hover:bg-[#E8DEC8]/30 dark:hover:bg-slate-700'
                }`}
              >
                غير المقروءة ({unreadCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('APPLICATIONS')}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                  activeFilter === 'APPLICATIONS'
                    ? 'bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white shadow-md shadow-sky-500/20 font-black'
                    : 'bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700 text-[#6C4F3D] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white hover:bg-[#E8DEC8]/30 dark:hover:bg-slate-700'
                }`}
              >
                طلبات التوظيف
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('SYSTEM')}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                  activeFilter === 'SYSTEM'
                    ? 'bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white shadow-md shadow-sky-500/20 font-black'
                    : 'bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700 text-[#6C4F3D] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white hover:bg-[#E8DEC8]/30 dark:hover:bg-slate-700'
                }`}
              >
                تنبيهات النظام
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-3 mb-8">
            {isLoading ? (
              <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-12 text-center shadow-sm">
                <span className="inline-block w-8 h-8 border-3 border-[#0284C7] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs font-bold text-[#6C4F3D] dark:text-slate-400">جاري تحميل الإشعارات والتنبيهات المباشرة...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8DEC8] dark:border-slate-700 flex items-center justify-center mx-auto mb-4 text-[#0284C7] dark:text-[#38BDF8]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-base font-black text-[#0F172A] dark:text-white mb-1">صندوق الإشعارات فارغ</h3>
                <p className="text-xs text-[#6C4F3D] dark:text-slate-400 font-medium">لا توجد إشعارات حالياً ضمن التصفية المحددة.</p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const formattedDate = new Date(item.created_at).toLocaleDateString('ar-YE', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <div
                    key={item.id}
                    onClick={() => handleMarkAsRead(item.id)}
                    className={`p-5 rounded-3xl border transition flex items-start gap-4 cursor-pointer hover:shadow-md ${
                      item.is_read
                        ? 'glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-[#E8DEC8] dark:border-slate-800 shadow-sm hover:border-[#BAE6FD] dark:hover:border-sky-800'
                        : 'glass-silk-card bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-[#38BDF8] dark:border-sky-500 shadow-md ring-4 ring-[#38BDF8]/10'
                    }`}
                  >
                    {/* Icon Indicator */}
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 border ${
                        item.type === 'STATUS_UPDATE'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                          : item.type === 'NEW_APPLICATION'
                          ? 'bg-[#BAE6FD]/30 border-[#BAE6FD] dark:border-sky-800 text-[#0284C7] dark:text-[#38BDF8]'
                          : 'bg-[#FAF7F2] dark:bg-slate-800 border-[#E8DEC8] dark:border-slate-700 text-[#0F172A] dark:text-white'
                      }`}
                    >
                      {item.type === 'STATUS_UPDATE' ? '✓' : item.type === 'NEW_APPLICATION' ? '📋' : '🔔'}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3
                          className={`text-sm font-black truncate ${
                            item.is_read ? 'text-[#0F172A] dark:text-slate-200' : 'text-[#0F172A] dark:text-white'
                          }`}
                        >
                          {item.title}
                        </h3>
                        {!item.is_read && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] dark:bg-[#38BDF8] shrink-0 shadow-sm shadow-sky-500/50" title="إشعار غير مقروء" />
                        )}
                      </div>
                      <p className="text-xs text-[#6C4F3D] dark:text-slate-300 leading-relaxed mb-2 font-medium">
                        {item.message}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6C4F3D]/70 dark:text-slate-400 font-medium">
                        <span>{formattedDate}</span>

                        {/* Action Links based on type */}
                        {item.type === 'STATUS_UPDATE' ? (
                          <Link
                            to="/applications"
                            className="text-[#0284C7] dark:text-[#38BDF8] hover:underline font-bold flex items-center gap-1"
                          >
                            <span>عرض الطلب في «طلباتي» ➔</span>
                          </Link>
                        ) : item.type === 'NEW_APPLICATION' ? (
                          <Link
                            to="/company/jobs"
                            className="text-[#0284C7] dark:text-[#38BDF8] hover:underline font-bold flex items-center gap-1"
                          >
                            <span>مراجعة طلبات التوظيف ➔</span>
                          </Link>
                        ) : item.type === 'COMPANY_VERIFIED' ? (
                          <Link
                            to="/company/status"
                            className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1"
                          >
                            <span>عرض حالة الاعتماد ➔</span>
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer Note */}
          <div className="p-4 rounded-2xl glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-[#E8DEC8] dark:border-slate-800 text-center text-xs text-[#6C4F3D] dark:text-slate-400 font-medium shadow-sm">
            تفضيلات الإشعارات: يمكنك التحكم بإشعارات البريد الإلكتروني والتنبيهات اللحظية من إعدادات حسابك.
          </div>
        </main>
      </div>
    </div>
  )
}

export default NotificationsCenterPage
