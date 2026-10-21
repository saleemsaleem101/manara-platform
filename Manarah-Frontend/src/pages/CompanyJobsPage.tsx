import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { StatusBadge } from '../components/StatusBadge'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { api } from '../services/api'
import type { CompanyJob } from '../types'

export const CompanyJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<CompanyJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL')

  // Close Job Confirmation Modal
  const [jobToClose, setJobToClose] = useState<CompanyJob | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await api.getCompanyJobs()
      setJobs(data)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      setError(msg || 'فشل تحميل قائمة شواغر المنشأة')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleConfirmClose = async () => {
    if (!jobToClose) return
    try {
      setIsClosing(true)
      await api.closeCompanyJob(jobToClose.id)
      setFeedback({ text: `تم إغلاق الشاغر الوظيفي «${jobToClose.title}» بنجاح ✓`, type: 'success' })
      setJobToClose(null)
      fetchJobs()
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      setFeedback({ text: msg || 'فشل إغلاق الشاغر الوظيفي', type: 'error' })
    } finally {
      setIsClosing(false)
    }
  }

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === 'ALL') return true
    return job.status === activeTab
  })

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] flex flex-col font-['Cairo'] text-start text-[#0F172A] dark:text-slate-100 transition-colors duration-300" dir="rtl">
      <Navbar />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white">وظائفي (إدارة الشواغر الوظيفية)</h1>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-1 font-medium">
              استعراض شواغر المنشأة، متابعة أعداد المتقدمين، وضبط حالات التقديم
            </p>
          </div>
          <Link
            to="/company/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white text-xs font-black transition self-start sm:self-auto shadow-sm"
          >
            <span>+ نشر شاغر وظيفي جديد</span>
          </Link>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-[13px] font-bold flex items-center justify-between shadow-2xs transition ${
              feedback.type === 'success'
                ? 'bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
            }`}
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tabs: ALL, OPEN, CLOSED */}
        <div className="flex items-center gap-2 border-b border-[#E8DEC8] dark:border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#0284C7] text-white shadow-sm'
                : 'bg-[#FAF7F2] dark:bg-slate-800 text-[#475569] dark:text-slate-300 hover:bg-[#E5D7C3]/50 dark:hover:bg-slate-700 border border-[#E8DEC8] dark:border-slate-700'
            }`}
          >
            جميع الوظائف (<bdi dir="ltr">{jobs.length}</bdi>)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('OPEN')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'OPEN'
                ? 'bg-[#0284C7] text-white shadow-sm'
                : 'bg-[#FAF7F2] dark:bg-slate-800 text-[#475569] dark:text-slate-300 hover:bg-[#E5D7C3]/50 dark:hover:bg-slate-700 border border-[#E8DEC8] dark:border-slate-700'
            }`}
          >
            الوظائف المفتوحة (<bdi dir="ltr">{jobs.filter((j) => j.status === 'OPEN').length}</bdi>)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CLOSED')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'CLOSED'
                ? 'bg-[#475569] text-white shadow-sm'
                : 'bg-[#FAF7F2] dark:bg-slate-800 text-[#475569] dark:text-slate-300 hover:bg-[#E5D7C3]/50 dark:hover:bg-slate-700 border border-[#E8DEC8] dark:border-slate-700'
            }`}
          >
            الوظائف المغلقة (<bdi dir="ltr">{jobs.filter((j) => j.status === 'CLOSED').length}</bdi>)
          </button>
        </div>

        {/* Content Table / Cards */}
        {isLoading ? (
          <LoadingState message="جاري استرجاع شواغر المنشأة..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchJobs} />
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            title="لا توجد شواغر وظيفية حالياً"
            description="يمكنك البدء بنشر أول شاغر وظيفي وتحديد أوزان معايير التوافق لاستقبال المرشحين."
            actionLabel="+ نشر وظيفة جديدة"
            actionTo="/company/jobs/new"
          />
        ) : (
          <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 shadow-sm overflow-hidden transition-all">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-[#FAF7F2] dark:bg-slate-800/80 border-b border-[#E8DEC8] dark:border-slate-800 text-[#475569] dark:text-slate-300 font-black">
                  <tr>
                    <th className="p-4">المسمى الوظيفي</th>
                    <th className="p-4">تاريخ النشر</th>
                    <th className="p-4 text-center">عدد المتقدمين</th>
                    <th className="p-4 text-center">الحد الأدنى للتوافق</th>
                    <th className="p-4 text-center">الحالة</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DEC8]/60 dark:divide-slate-800">
                  {filteredJobs.map((job) => {
                    const applicantsCount = job.applicants_count ?? 0
                    const minScore = job.minimum_match_score !== undefined
                      ? Math.round(job.minimum_match_score <= 1.0 ? job.minimum_match_score * 100 : job.minimum_match_score)
                      : 60

                    return (
                      <tr key={job.id} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-slate-800/50 transition">
                        {/* Title & Type */}
                        <td className="p-4">
                          <span className="font-black text-[#0F172A] dark:text-white block text-[13px]">{job.title}</span>
                          <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium">
                            {job.required_major} • {job.location}
                          </span>
                        </td>

                        {/* Created At */}
                        <td className="p-4 text-[#64748B] dark:text-slate-400 font-mono">
                          {new Date(job.created_at).toLocaleDateString('ar-EG')}
                        </td>

                        {/* Applicants Count */}
                        <td className="p-4 text-center">
                          <Link
                            to={`/company/jobs/${job.id}/applicants`}
                            className="inline-flex items-center justify-center px-3 py-1 rounded-xl bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800 hover:bg-[#BAE6FD]/40 font-bold font-mono transition"
                            title="عرض قائمة المتقدمين"
                          >
                            <bdi dir="ltr">{applicantsCount}</bdi> متقدم
                          </Link>
                        </td>

                        {/* Minimum Match Score */}
                        <td className="p-4 text-center font-bold text-[#0F172A] dark:text-white font-mono">
                          <bdi dir="ltr">{minScore}%</bdi>
                        </td>

                        {/* Status */}
                        <td className="p-4 text-center">
                          <StatusBadge status={job.status} />
                        </td>

                        {/* Actions */}
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* Applicants Link */}
                            <Link
                              to={`/company/jobs/${job.id}/applicants`}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white font-black text-[11px] transition shadow-2xs"
                            >
                              المتقدمون
                            </Link>

                            {/* Edit Link */}
                            <Link
                              to={`/company/jobs/${job.id}/edit`}
                              className="px-3 py-1.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 hover:bg-[#E5D7C3]/50 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white font-bold text-[11px] transition shadow-2xs"
                            >
                              تعديل
                            </Link>

                            {/* Close Job Button (If OPEN) */}
                            {job.status === 'OPEN' && (
                              <button
                                type="button"
                                onClick={() => setJobToClose(job)}
                                className="px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-[11px] transition cursor-pointer"
                                title="إغلاق الشاغر"
                              >
                                إغلاق
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Close Job Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(jobToClose)}
        title="تأكيد إغلاق الشاغر الوظيفي"
        message={`هل أنت متأكد من رغبتك في إغلاق الشاغر الوظيفي «${jobToClose?.title}»؟ لن يتمكن خريجون جدد من التقديم عليه.`}
        confirmLabel="إغلاق الشاغر"
        cancelLabel="إلغاء"
        variant="warning"
        isLoading={isClosing}
        onConfirm={handleConfirmClose}
        onCancel={() => setJobToClose(null)}
      />
    </div>
  )
}

export default CompanyJobsPage
