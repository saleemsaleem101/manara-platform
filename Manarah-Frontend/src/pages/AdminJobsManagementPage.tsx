import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { LoadingState } from '../components/LoadingState'
import { EmptyState } from '../components/EmptyState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { api } from '../services/api'
import type { AdminJobItem } from '../types'

export const AdminJobsManagementPage: React.FC = () => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])
  const [jobs, setJobs] = useState<AdminJobItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ALL' | 'OPEN' | 'CLOSED' | 'HIDDEN'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Action states
  const [jobToDelete, setJobToDelete] = useState<AdminJobItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingJobId, setTogglingJobId] = useState<number | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const showNotification = (text: string, type: 'success' | 'error') => {
    setFeedbackMsg({ text, type })
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setFeedbackMsg(null), 4000)
  }

  const loadJobs = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await api.getAdminJobs({
        status: activeTab === 'ALL' ? undefined : activeTab,
        search: searchQuery.trim() || undefined,
        page: currentPage,
      })
      setJobs(data.results)
      setTotalCount(data.count)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      showNotification(msg || 'فشل جلب قائمة وظائف المنصة', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, currentPage, searchQuery])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadJobs()
  }

  const handleToggleVisibility = async (job: AdminJobItem) => {
    try {
      setTogglingJobId(job.id)
      const newStatus = job.status === 'HIDDEN' ? 'OPEN' : 'HIDDEN'
      await api.updateAdminJobStatus(job.id, newStatus)
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
      )
      showNotification(
        `تم ${newStatus === 'HIDDEN' ? 'إخفاء' : 'إظهار'} الشاغر الوظيفي (${job.title}) بنجاح`,
        'success'
      )
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      showNotification(msg || 'فشل تعديل حالة ظهور الوظيفة', 'error')
    } finally {
      setTogglingJobId(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return
    try {
      setIsDeleting(true)
      await api.deleteAdminJob(jobToDelete.id)
      setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id))
      setTotalCount((prev) => Math.max(0, prev - 1))
      showNotification(`تم حذف الوظيفة (${jobToDelete.title}) وجميع طلباتها المرتبطة نهائياً`, 'success')
      setJobToDelete(null)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      showNotification(msg || 'فشل حذف الوظيفة', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] text-[#0F172A] dark:text-white font-sans transition-colors duration-300 relative selection:bg-[#BAE6FD] selection:text-[#0284C7]" dir="rtl">
      {/* Background Decorative Glow Auras */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#BAE6FD]/20 dark:bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-10 w-96 h-96 bg-[#E8DEC8]/25 dark:bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Breadcrumb Navigation & Header with Generous Spacing */}
          <div>
            <div className="flex items-center gap-2 text-xs text-[#6C4F3D] dark:text-slate-400 mb-3 font-semibold">
              <Link to="/admin" className="hover:text-[#0284C7] dark:hover:text-[#38BDF8] transition">
                لوحة التحكم
              </Link>
              <span>/</span>
              <span className="text-[#0284C7] dark:text-[#38BDF8] font-black">إدارة الوظائف والشواغر</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white">
                  إدارة شواغر المنصة
                </h1>
                <p className="text-[#6C4F3D] dark:text-slate-400 text-sm mt-1.5 font-medium">
                  متابعة الوظائف المعلنة من المنشآت المعتمدة، وضبط ظهور الشواغر أو حذفها
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/admin#approvals"
                  className="px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-800 glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-md hover:bg-[#FAF7F2] dark:hover:bg-slate-800 text-[#0F172A] dark:text-white text-xs font-bold transition shadow-sm"
                >
                  طلبات الاعتماد التجاري
                </Link>
                <div className="text-xs font-mono font-black text-[#0284C7] dark:text-[#38BDF8] bg-[#BAE6FD]/30 dark:bg-sky-950/50 px-4 py-2.5 rounded-xl border border-[#BAE6FD] dark:border-sky-800 shadow-sm">
                  إجمالي الشواغر: <bdi dir="ltr">{totalCount}</bdi>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Alert */}
          {feedbackMsg && (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between text-sm font-bold shadow-sm backdrop-blur-md ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400'
              }`}
            >
              <span>{feedbackMsg.text}</span>
              <button
                type="button"
                onClick={() => setFeedbackMsg(null)}
                className="text-xs text-[#6C4F3D] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white font-normal px-2 py-1 cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          )}

          {/* Filter Bar with Enhanced Spacing */}
          <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Status Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800/80 border border-[#E8DEC8] dark:border-slate-700 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ALL')
                    setCurrentPage(1)
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    activeTab === 'ALL'
                      ? 'bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white shadow-md shadow-sky-500/20'
                      : 'text-[#6C4F3D] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('OPEN')
                    setCurrentPage(1)
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    activeTab === 'OPEN'
                      ? 'bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white shadow-md shadow-sky-500/20'
                      : 'text-[#6C4F3D] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  مفتوحة
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('CLOSED')
                    setCurrentPage(1)
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    activeTab === 'CLOSED'
                      ? 'bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white shadow-md shadow-sky-500/20'
                      : 'text-[#6C4F3D] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  مغلقة
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('HIDDEN')
                    setCurrentPage(1)
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    activeTab === 'HIDDEN'
                      ? 'bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white shadow-md shadow-sky-500/20'
                      : 'text-[#6C4F3D] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  مخفية
                </button>
              </div>

              {/* Search Input */}
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2.5 w-full md:w-80">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالمسمى أو الشركة أو التخصص..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-xs font-semibold text-[#0F172A] dark:text-white placeholder:text-[#6C4F3D]/50 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 transition"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white text-xs font-black shadow-md shadow-sky-500/20 transition shrink-0 cursor-pointer"
                >
                  بحث
                </button>
              </form>
            </div>
          </div>

          {/* Jobs Table */}
          <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-16">
                <LoadingState message="جاري استرجاع شواغر المنصة..." />
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-16">
                <EmptyState
                  title="لا توجد شواغر معلنة"
                  description="لم يتم العثور على أي شواغر تطابق معايير البحث أو التصفية الحالية."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead>
                    <tr className="bg-[#FAF7F2] dark:bg-slate-800/60 border-b border-[#E8DEC8] dark:border-slate-800 text-[#6C4F3D] dark:text-slate-300 font-bold">
                      <th className="py-4 px-6">المسمى الوظيفي والشركة</th>
                      <th className="py-4 px-4">التخصص المطلوب</th>
                      <th className="py-4 px-4">الخبرة المطلوبة</th>
                      <th className="py-4 px-4">المتقدمون</th>
                      <th className="py-4 px-4">الحالة</th>
                      <th className="py-4 px-4">تاريخ النشر</th>
                      <th className="py-4 px-6 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DEC8]/60 dark:divide-slate-800">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-slate-800/50 transition">
                        {/* Title & Company */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-[#0F172A] dark:text-white text-sm">{job.title}</div>
                          <div className="text-[11px] text-[#6C4F3D] dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>{job.company_name}</span>
                            {job.company_verified && (
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 dark:border-emerald-800 px-2 py-0.5 rounded-md font-black">
                                معتمدة ✓
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Major */}
                        <td className="py-4 px-4 font-semibold text-[#0F172A] dark:text-slate-200">
                          {job.required_major}
                        </td>

                        {/* Experience */}
                        <td className="py-4 px-4 text-[#6C4F3D] dark:text-slate-300 font-mono font-bold">
                          {job.required_exp === 0 ? 'حديث تخرج' : `${job.required_exp} سنوات`}
                        </td>

                        {/* Applicants Count */}
                        <td className="py-4 px-4">
                          <span className="font-bold font-mono text-[#0284C7] dark:text-[#38BDF8] bg-[#BAE6FD]/30 dark:bg-sky-950/50 border border-[#BAE6FD] dark:border-sky-800 px-2.5 py-1 rounded-lg">
                            <bdi dir="ltr">{job.applicants_count}</bdi>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                              job.status === 'OPEN'
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-800'
                                : job.status === 'CLOSED'
                                ? 'bg-[#E8DEC8]/30 dark:bg-slate-800 text-[#6C4F3D] dark:text-slate-300 border-[#E8DEC8] dark:border-slate-700'
                                : 'bg-slate-100 dark:bg-slate-800 text-[#6C4F3D] dark:text-slate-400 border-[#E8DEC8] dark:border-slate-700'
                            }`}
                          >
                            {job.status === 'OPEN'
                              ? 'مفتوحة'
                              : job.status === 'CLOSED'
                              ? 'مغلقة'
                              : 'مخفية'}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-[#6C4F3D] dark:text-slate-400 font-mono text-[11px]">
                          <bdi dir="ltr">{new Date(job.created_at).toLocaleDateString('ar-YE')}</bdi>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              disabled={togglingJobId === job.id}
                              onClick={() => handleToggleVisibility(job)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] border transition cursor-pointer ${
                                job.status === 'HIDDEN'
                                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-700'
                                  : 'bg-[#FAF7F2] dark:bg-slate-800 hover:bg-[#E8DEC8]/40 dark:hover:bg-slate-700 text-[#6C4F3D] dark:text-slate-200 border-[#E8DEC8] dark:border-slate-700'
                              }`}
                            >
                              {togglingJobId === job.id
                                ? 'جاري...'
                                : job.status === 'HIDDEN'
                                ? 'إظهار الشاغر'
                                : 'إخفاء عن العامة'}
                            </button>

                            <button
                              type="button"
                              onClick={() => setJobToDelete(job)}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 dark:border-rose-800 font-bold text-[11px] transition shadow-sm cursor-pointer"
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
              <div className="p-4 border-t border-[#E8DEC8] dark:border-slate-800 flex items-center justify-between text-xs text-[#6C4F3D] dark:text-slate-400">
                <span>
                  صفحة <bdi dir="ltr">{currentPage}</bdi> من <bdi dir="ltr">{totalPages}</bdi>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3.5 py-1.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[#0F172A] dark:text-white hover:bg-[#E8DEC8]/40 dark:hover:bg-slate-700 disabled:opacity-40 font-bold transition shadow-sm cursor-pointer"
                  >
                    السابق
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3.5 py-1.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[#0F172A] dark:text-white hover:bg-[#E8DEC8]/40 dark:hover:bg-slate-700 disabled:opacity-40 font-bold transition shadow-sm cursor-pointer"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            isOpen={Boolean(jobToDelete)}
            title="تأكيد حذف الشاغر الوظيفي"
            message={`هل أنت متأكد من رغبتك في حذف الشاغر (${jobToDelete?.title}) نهائياً؟ سيتم إلغاء الشاغر وحذف كافة سجلات المتقدمين المرتبطة به ولا يمكن التراجع.`}
            confirmLabel="نعم، حذف الشاغر نهائياً"
            cancelLabel="إلغاء التراجع"
            variant="danger"
            isLoading={isDeleting}
            onConfirm={handleConfirmDelete}
            onCancel={() => setJobToDelete(null)}
          />
        </main>
      </div>
    </div>
  )
}

export default AdminJobsManagementPage
