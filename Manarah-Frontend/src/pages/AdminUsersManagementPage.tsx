import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { LoadingState } from '../components/LoadingState'
import { EmptyState } from '../components/EmptyState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { api } from '../services/api'
import type { AdminUser } from '../types'

export const AdminUsersManagementPage: React.FC = () => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ALL' | 'GRADUATE' | 'COMPANY' | 'ADMIN'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Action states
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const showNotification = (text: string, type: 'success' | 'error') => {
    setFeedbackMsg({ text, type })
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setFeedbackMsg(null), 4000)
  }

  const loadUsers = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await api.getAdminUsers({
        role: activeTab === 'ALL' ? undefined : activeTab,
        search: searchQuery.trim() || undefined,
        page: currentPage,
      })
      setUsers(data.results)
      setTotalCount(data.count)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      showNotification(msg || 'فشل جلب قائمة مستخدمي المنصة', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, currentPage, searchQuery])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadUsers()
  }

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      setTogglingUserId(user.id)
      const newStatus = !user.is_active
      await api.updateAdminUserStatus(user.id, newStatus)
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: newStatus } : u))
      )
      showNotification(
        `تم ${newStatus ? 'تفعيل' : 'تعطيل'} حساب المستخدم (${user.name}) بنجاح`,
        'success'
      )
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      showNotification(msg || 'فشل تعديل حالة الحساب', 'error')
    } finally {
      setTogglingUserId(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return
    try {
      setIsDeleting(true)
      await api.deleteAdminUser(userToDelete.id)
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
      setTotalCount((prev) => Math.max(0, prev - 1))
      showNotification(`تم حذف حساب المستخدم (${userToDelete.name}) نهائياً`, 'success')
      setUserToDelete(null)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      showNotification(msg || 'فشل حذف الحساب', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans" dir="rtl">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link to="/admin" className="hover:text-slate-900 transition font-medium">
              لوحة التحكم
            </Link>
            <span>/</span>
            <span className="text-amber-600 font-bold">إدارة المستخدمين</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F1E36]">
                إدارة مستخدمي المنصة
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                عرض حسابات الخريجين والشركات ومسؤولي النظام والتحكم في صلاحيات التفعيل والحذف
              </p>
            </div>
            <div className="text-xs font-mono font-bold bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
              إجمالي الحسابات: <bdi dir="ltr">{totalCount}</bdi>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-sm font-bold ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="text-xs text-slate-400 hover:text-slate-700 font-normal px-2 py-1"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* Controls: Search and Tabs */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Role Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 w-full md:w-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('ALL')
                  setCurrentPage(1)
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                  activeTab === 'ALL'
                    ? 'bg-white text-[#0F1E36] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('GRADUATE')
                  setCurrentPage(1)
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                  activeTab === 'GRADUATE'
                    ? 'bg-white text-[#0F1E36] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الخريجون
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('COMPANY')
                  setCurrentPage(1)
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                  activeTab === 'COMPANY'
                    ? 'bg-white text-[#0F1E36] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الشركات
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('ADMIN')
                  setCurrentPage(1)
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                  activeTab === 'ADMIN'
                    ? 'bg-white text-[#0F1E36] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                مديرو النظام
              </button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو البريد..."
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#0F1E36] text-white text-xs font-bold hover:bg-slate-900 transition shrink-0"
              >
                بحث
              </button>
            </form>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden mb-6">
          {isLoading ? (
            <div className="p-16">
              <LoadingState message="جاري تحميل سجلات المستخدمين..." />
            </div>
          ) : users.length === 0 ? (
            <div className="p-16">
              <EmptyState
                title="لا يوجد مستخدمون"
                description="لم يتم العثور على أي حسابات تطابق معايير البحث أو التصفية الحالية."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/70 text-slate-500 font-bold">
                    <th className="py-4 px-6">المستخدم</th>
                    <th className="py-4 px-4">نوع الحساب</th>
                    <th className="py-4 px-4">حالة البريد</th>
                    <th className="py-4 px-4">حالة الحساب</th>
                    <th className="py-4 px-4">تاريخ التسجيل</th>
                    <th className="py-4 px-6 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition">
                      {/* Name & Email */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono" dir="ltr">
                          {user.email}
                        </div>
                        {user.company_name && (
                          <div className="text-[10px] text-amber-700 font-bold mt-0.5">
                            المنشأة: {user.company_name}
                          </div>
                        )}
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'COMPANY'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-blue-100 text-blue-900'
                          }`}
                        >
                          {user.role === 'ADMIN'
                            ? 'مدير نظام'
                            : user.role === 'COMPANY'
                            ? 'منشأة توظيف'
                            : 'خريج'}
                        </span>
                      </td>

                      {/* Email Verified */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            user.email_verified
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {user.email_verified ? '✓ مفعل' : 'غير مفعل'}
                        </span>
                      </td>

                      {/* Account Active */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black ${
                            user.is_active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {user.is_active ? 'نشط' : 'معطل'}
                        </span>
                      </td>

                      {/* Registration Date */}
                      <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                        <bdi dir="ltr">{new Date(user.created_at).toLocaleDateString('ar-YE')}</bdi>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            disabled={togglingUserId === user.id}
                            onClick={() => handleToggleStatus(user)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition ${
                              user.is_active
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {togglingUserId === user.id
                              ? 'جاري...'
                              : user.is_active
                              ? 'تعطيل الحساب'
                              : 'تفعيل الحساب'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setUserToDelete(user)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition"
                          >
                            حذف ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>
                صفحة <bdi dir="ltr">{currentPage}</bdi> من <bdi dir="ltr">{totalPages}</bdi>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 font-bold transition"
                >
                  السابق
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 font-bold transition"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={Boolean(userToDelete)}
          title="تأكيد حذف حساب المستخدم"
          message={`هل أنت متأكد من رغبتك في حذف حساب (${userToDelete?.name})؟ سيتم مسح بيانات المستخدم والملف المرتبط به نهائياً ولا يمكن التراجع عن هذا الإجراء.`}
          confirmLabel="نعم، حذف الحساب نهائياً"
          cancelLabel="إلغاء التراجع"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setUserToDelete(null)}
        />
      </main>
    </div>
  )
}

export default AdminUsersManagementPage
