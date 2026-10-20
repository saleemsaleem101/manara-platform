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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Cairo'] text-start" dir="rtl">
      <Navbar />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#0F1E36]">وظائفي (إدارة الشواغر الوظيفية)</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              استعراض شواغر المنشأة، متابعة أعداد المتقدمين، وضبط حالات التقديم
            </p>
          </div>
          <Link
            to="/company/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E293B] text-white text-xs font-black transition self-start sm:self-auto shadow-sm"
          >
            <span>+ نشر وظيفة جديدة</span>
          </Link>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-xl text-[13px] font-bold flex items-center justify-between shadow-sm transition ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tabs: ALL, OPEN, CLOSED */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#0F1E36] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            جميع الوظائف (<bdi dir="ltr">{jobs.length}</bdi>)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('OPEN')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'OPEN'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            الوظائف المفتوحة (<bdi dir="ltr">{jobs.filter((j) => j.status === 'OPEN').length}</bdi>)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CLOSED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'CLOSED'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-4">المسمى الوظيفي</th>
                    <th className="p-4">تاريخ النشر</th>
                    <th className="p-4 text-center">عدد المتقدمين</th>
                    <th className="p-4 text-center">الحد الأدنى للتوافق</th>
                    <th className="p-4 text-center">الحالة</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredJobs.map((job) => {
                    const applicantsCount = job.applicants_count ?? 0
                    const minScore = job.minimum_match_score !== undefined
                      ? Math.round(job.minimum_match_score <= 1.0 ? job.minimum_match_score * 100 : job.minimum_match_score)
                      : 60

                    return (
                      <tr key={job.id} className="hover:bg-slate-50/70 transition">
                        {/* Title & Type */}
                        <td className="p-4">
                          <span className="font-bold text-[#0F1E36] block text-[13px]">{job.title}</span>
                          <span className="text-[11px] text-slate-500">
                            {job.required_major} • {job.location}
                          </span>
                        </td>

                        {/* Created At */}
                        <td className="p-4 text-slate-600 font-mono">
                          {new Date(job.created_at).toLocaleDateString('ar-EG')}
                        </td>

                        {/* Applicants Count */}
                        <td className="p-4 text-center">
                          <Link
                            to={`/company/jobs/${job.id}/applicants`}
                            className="inline-flex items-center justify-center px-3 py-1 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold font-mono transition"
                            title="عرض قائمة المتقدمين"
                          >
                            <bdi dir="ltr">{applicantsCount}</bdi> متقدم
                          </Link>
                        </td>

                        {/* Minimum Match Score */}
                        <td className="p-4 text-center font-bold text-slate-700 font-mono">
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
                              className="px-3 py-1.5 rounded-lg bg-[#0F1E36] hover:bg-[#1E293B] text-white font-bold text-[11px] transition shadow-xs"
                            >
                              المتقدمون
                            </Link>

                            {/* Edit Link */}
                            <Link
                              to={`/company/jobs/${job.id}/edit`}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] transition"
                            >
                              تعديل
                            </Link>

                            {/* Close Job Button (If OPEN) */}
                            {job.status === 'OPEN' && (
                              <button
                                type="button"
                                onClick={() => setJobToClose(job)}
                                className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-bold text-[11px] transition cursor-pointer"
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
