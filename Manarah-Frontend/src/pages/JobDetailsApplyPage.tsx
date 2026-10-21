import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { ApplyConfirmationModal } from '../components/ApplyConfirmationModal'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { useProfile } from '../context/ProfileContext'
import { api } from '../services/api'
import type { Job, JobApplication } from '../types'

export const JobDetailsApplyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const jobId = Number(id)
  const navigate = useNavigate()
  const { isAuthenticated } = useProfile()

  const [job, setJob] = useState<Job | null>(null)
  const [myApplications, setMyApplications] = useState<JobApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const loadData = useCallback(async () => {
    if (!jobId) {
      setError('معرّف الوظيفة غير صحيح')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const [jobData, apps] = await Promise.all([
        api.getJobDetails(jobId),
        api.getMyApplications().catch(() => []),
      ])
      setJob(jobData)
      setMyApplications(apps)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      setError(msg || 'فشل تحميل تفاصيل الوظيفة')
    } finally {
      setIsLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const existingApplication = myApplications.find(
    (app) => app.job === jobId || (typeof app.job === 'object' && (app.job as { id: number }).id === jobId)
  )

  const handleConfirmApply = async () => {
    if (!job) return
    try {
      setIsApplying(true)
      await api.applyForJob(job.id)
      setShowConfirmModal(false)
      setFeedback({ text: 'تم إرسال طلب التوظيف بنجاح ✓', type: 'success' })
      loadData()
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      setFeedback({ text: msg || 'فشل إرسال طلب التوظيف', type: 'error' })
    } finally {
      setIsApplying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] flex flex-col font-['Cairo'] text-start transition-colors" dir="rtl">
        <Navbar />
        <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 flex-1">
          <LoadingState message="جاري تحميل تفاصيل الوظيفة وشروط المطابقة..." />
        </main>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] flex flex-col font-['Cairo'] text-start transition-colors" dir="rtl">
        <Navbar />
        <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 flex-1">
          <ErrorState message={error || 'تعذر العثور على الوظيفة المطلوبة'} onRetry={loadData} />
          <div className="text-center mt-6">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white text-xs font-black shadow-sm transition"
            >
              ← العودة لقائمة الفرص الوظيفية
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const matchPct = job.match_score !== undefined && job.match_score !== null
    ? Math.round(job.match_score * 100)
    : null

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] flex flex-col font-['Cairo'] text-start text-[#0F172A] dark:text-slate-100 transition-colors duration-300" dir="rtl">
      <Navbar />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6 flex-1">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] dark:text-slate-400 hover:text-[#0284C7] dark:hover:text-sky-400 transition"
          >
            <span>←</span>
            <span>العودة إلى الفرص الوظيفية</span>
          </Link>

          <span className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400">
            تاريخ النشر: {new Date(job.created_at).toLocaleDateString('ar-EG')}
          </span>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-xl text-[13px] font-bold flex items-center justify-between shadow-2xs transition ${
              feedback.type === 'success'
                ? 'bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
            }`}
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Job Header Card */}
        <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-[#E8DEC8] dark:border-slate-800 shadow-sm relative overflow-hidden transition-all">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-[22px] sm:text-[24px] font-black text-[#0F172A] dark:text-white leading-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#64748B] dark:text-slate-400">
                <span className="font-bold text-[#0F172A] dark:text-slate-200 text-[13px]">{job.company_name}</span>
                <span>•</span>
                <span>📍 {job.location}</span>
                <span>•</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] dark:bg-slate-800 font-bold text-[#475569] dark:text-slate-300 border border-[#E8DEC8] dark:border-slate-700">
                  {job.job_type === 'FULL_TIME' ? 'دوام كامل' : job.job_type === 'HYBRID' ? 'عمل هجين' : 'عن بعد'}
                </span>
                <span>•</span>
                <span className="text-[#64748B] dark:text-slate-400 font-semibold">
                  حالة الشاغر: {job.status === 'OPEN' ? 'مفتوح للتقديم' : 'مغلق'}
                </span>
              </div>
            </div>

            {/* Match Score Badge */}
            {matchPct !== null && (
              <div className="self-start px-4 py-2.5 rounded-2xl bg-[#E0F2FE] dark:bg-sky-950/60 border border-[#BAE6FD] dark:border-sky-800 text-[#0284C7] dark:text-sky-300 text-center">
                <span className="block text-[11px] font-bold text-[#0284C7] dark:text-sky-300">نسبة التوافق مع ملفك</span>
                <span className="text-[20px] font-black font-mono">
                  <bdi dir="ltr">{matchPct}%</bdi>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 2 Columns: Job Info & Application Status / Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Right 2 cols: Job Requirements & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 border border-[#E8DEC8] dark:border-slate-800 shadow-sm space-y-3 transition-all">
              <h2 className="text-[15px] font-black text-[#0F172A] dark:text-white border-b border-[#E8DEC8]/60 dark:border-slate-800 pb-3">
                الوصف الوظيفي والمسؤوليات
              </h2>
              <div className="text-[13px] text-[#475569] dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 border border-[#E8DEC8] dark:border-slate-800 shadow-sm space-y-3 transition-all">
                <h2 className="text-[15px] font-black text-[#0F172A] dark:text-white border-b border-[#E8DEC8]/60 dark:border-slate-800 pb-3">
                  المتطلبات والشروط
                </h2>
                <div className="text-[13px] text-[#475569] dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {job.requirements}
                </div>
              </div>
            )}

            {/* Required Skills */}
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 border border-[#E8DEC8] dark:border-slate-800 shadow-sm space-y-4 transition-all">
              <h2 className="text-[15px] font-black text-[#0F172A] dark:text-white border-b border-[#E8DEC8]/60 dark:border-slate-800 pb-3">
                المهارات المطلوبة للوظيفة
              </h2>

              {job.required_skills && job.required_skills.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {job.required_skills.map((sk) => (
                    <div
                      key={sk.id}
                      className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[13px] font-bold text-[#0F172A] dark:text-white block">{sk.skill_name}</span>
                        <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-semibold">
                          المستوى المطلوب: {sk.required_level || 'متقدم'}
                        </span>
                      </div>
                      {sk.is_required && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800">
                          أساسية
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[#64748B] dark:text-slate-400">المهارات المحددة في معايير التخصص العام.</p>
              )}
            </div>

            {/* Matching Weights Breakdown */}
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 border border-[#E8DEC8] dark:border-slate-800 shadow-sm space-y-4 transition-all">
              <h2 className="text-[15px] font-black text-[#0F172A] dark:text-white border-b border-[#E8DEC8]/60 dark:border-slate-800 pb-3">
                أوزان معايير التوافق المعتمدة للشاغر
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-[#E0F2FE] dark:bg-sky-950/60 border border-[#BAE6FD] dark:border-sky-800">
                  <span className="text-[11px] font-bold text-[#0284C7] dark:text-sky-300 block">المهارات</span>
                  <span className="text-[16px] font-black text-[#0284C7] dark:text-sky-300 font-mono">
                    <bdi dir="ltr">{Math.round((job.skills_weight || 0.45) * 100)}%</bdi>
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8DEC8] dark:border-slate-700">
                  <span className="text-[11px] font-bold text-[#0F172A] dark:text-slate-200 block">التخصص</span>
                  <span className="text-[16px] font-black text-[#0284C7] dark:text-sky-400 font-mono">
                    <bdi dir="ltr">{Math.round((job.specialization_weight || 0.25) * 100)}%</bdi>
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8DEC8] dark:border-slate-700">
                  <span className="text-[11px] font-bold text-[#475569] dark:text-slate-300 block">الخبرة</span>
                  <span className="text-[16px] font-black text-[#0F172A] dark:text-white font-mono">
                    <bdi dir="ltr">{Math.round((job.experience_weight || 0.20) * 100)}%</bdi>
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#E0F2FE] dark:bg-sky-950/60 border border-[#BAE6FD] dark:border-sky-800">
                  <span className="text-[11px] font-bold text-[#0284C7] dark:text-sky-300 block">المؤهل</span>
                  <span className="text-[16px] font-black text-[#0284C7] dark:text-sky-300 font-mono">
                    <bdi dir="ltr">{Math.round((job.qualification_weight || 0.10) * 100)}%</bdi>
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 text-center">
                يتم احتساب درجة التوافق آلياً وفق الأوزان المحددة أعلاه ومقارنتها ببيانات ملفك المهني.
              </p>
            </div>
          </div>

          {/* Left Column: Apply Box & Application Status */}
          <div className="space-y-6">
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 border border-[#E8DEC8] dark:border-slate-800 shadow-sm space-y-4 transition-all">
              <h3 className="text-[15px] font-black text-[#0F172A] dark:text-white">حالة التقديم</h3>

              {existingApplication ? (
                /* Already Applied State */
                <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[#475569] dark:text-slate-300">حالة طلبك:</span>
                    <StatusBadge status={existingApplication.status} />
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium pt-2 border-t border-[#E8DEC8]/60 dark:border-slate-700">
                    تاريخ التقديم: {new Date(existingApplication.applied_at).toLocaleDateString('ar-EG')}
                  </div>
                  <div className="pt-2">
                    <Link
                      to="/applications"
                      className="w-full py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 hover:bg-[#E5D7C3]/50 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white border border-[#E8DEC8] dark:border-slate-700 text-[12px] font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <span>عرض الطلب في سجل «طلباتي»</span>
                      <span>←</span>
                    </Link>
                  </div>
                </div>
              ) : (
                /* Not yet applied */
                <div className="space-y-4">
                  <p className="text-[12px] text-[#475569] dark:text-slate-300 leading-relaxed">
                    بالضغط على زر التقديم سيتم إرفاق ملفك المهني المعتمد والمشاريع والمهارات تلقائياً إلى إدارة توظيف الشركة.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login')
                        return
                      }
                      setShowConfirmModal(true)
                    }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white text-[13px] font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99]"
                  >
                    <span>تأكيد وإرسال طلب التوظيف</span>
                    <span>✓</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Meta Card */}
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 border border-[#E8DEC8] dark:border-slate-800 shadow-sm space-y-3 text-[12px] transition-all">
              <h4 className="font-bold text-[#0F172A] dark:text-white mb-2">معلومات إضافية</h4>
              <div className="flex justify-between py-1.5 border-b border-[#E8DEC8]/60 dark:border-slate-800">
                <span className="text-[#64748B] dark:text-slate-400">التخصص المطلوب:</span>
                <span className="font-bold text-[#0F172A] dark:text-slate-200">{job.required_major}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E8DEC8]/60 dark:border-slate-800">
                <span className="text-[#64748B] dark:text-slate-400">المؤهل الأدنى:</span>
                <span className="font-bold text-[#0F172A] dark:text-slate-200">{job.required_qualification || 'بكالوريوس'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E8DEC8]/60 dark:border-slate-800">
                <span className="text-[#64748B] dark:text-slate-400">الخبرة المطلوبة:</span>
                <span className="font-bold text-[#0F172A] dark:text-slate-200">{job.required_exp ? `${job.required_exp} سنوات` : 'حديث التخرج'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <ApplyConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmApply}
        jobTitle={job.title}
        companyName={job.company_name}
        matchScore={job.match_score}
        isApplying={isApplying}
      />
    </div>
  )
}

export default JobDetailsApplyPage
