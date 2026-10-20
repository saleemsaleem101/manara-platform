import React, { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { GraduateMatchBreakdownModal } from '../components/GraduateMatchBreakdownModal'
import { LoadingState } from '../components/LoadingState'
import { EmptyState } from '../components/EmptyState'
import { api } from '../services/api'
import type { Job, JobApplication, ApplicationStatusHistoryItem } from '../types'

export const CompanyApplicantsMatchingPage: React.FC = () => {
  const { id: routeJobId } = useParams<{ id: string }>()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  // 1. Data States
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJobId, setSelectedJobId] = useState<number | null>(routeJobId ? Number(routeJobId) : null)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [auditLogs, setAuditLogs] = useState<ApplicationStatusHistoryItem[]>([])

  // 2. UI / Filter States
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('الكل')
  const [sortBy, setSortBy] = useState<'MATCH_SCORE' | 'NEWEST'>('MATCH_SCORE')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<number | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // 3. Modals
  const [matchModalApp, setMatchModalApp] = useState<JobApplication | null>(null)

  const showNotification = (text: string, type: 'success' | 'error') => {
    setFeedbackMsg({ text, type })
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setFeedbackMsg(null), 4000)
  }

  // Initial Load: Company's Jobs
  useEffect(() => {
    async function loadCompanyJobs() {
      try {
        setIsLoading(true)
        const myJobs = await api.getCompanyJobs()
        setJobs(myJobs)

        if (myJobs.length > 0) {
          const currentId = routeJobId && myJobs.some((j) => j.id === Number(routeJobId))
            ? Number(routeJobId)
            : myJobs[0].id
          setSelectedJobId(currentId)
        }
      } catch (err: unknown) {
        const msg = (err as { message?: string })?.message
        showNotification(msg || 'فشل جلب قائمة وظائف المنشأة', 'error')
      } finally {
        setIsLoading(false)
      }
    }

    loadCompanyJobs()
  }, [routeJobId])

  // Load Applicants whenever selectedJobId changes
  useEffect(() => {
    if (!selectedJobId) return

    async function loadJobApplications(jobId: number) {
      try {
        setIsLoading(true)
        const rankedApplicants = await api.getJobRankedCandidates(jobId)
        setApplications(rankedApplicants)

        // Load audit status history for candidates
        const histories: ApplicationStatusHistoryItem[] = []
        for (const app of rankedApplicants) {
          if (app.status_history && app.status_history.length > 0) {
            histories.push(...app.status_history)
          } else {
            const h = await api.getApplicationHistory(app.id).catch(() => [])
            histories.push(...h)
          }
        }
        histories.sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime())
        setAuditLogs(histories)
      } catch (err: unknown) {
        const msg = (err as { message?: string })?.message
        showNotification(msg || 'فشل تحميل المتقدمين للوظيفة', 'error')
      } finally {
        setIsLoading(false)
      }
    }

    loadJobApplications(selectedJobId)
  }, [selectedJobId])

  // Status Change (قيد المراجعة / مقبول / مرفوض)
  const handleStatusChange = async (appId: number, newStatus: 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED') => {
    try {
      setIsUpdatingStatus(appId)
      await api.updateApplicationStatus(appId, newStatus)

      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      )

      const statusLabels = {
        UNDER_REVIEW: 'قيد المراجعة',
        ACCEPTED: 'مقبول',
        REJECTED: 'مرفوض',
      }

      showNotification(`تم تحديث حالة الطلب بنجاح إلى: (${statusLabels[newStatus]}) وتم إرسال إشعار للخريج`, 'success')

      if (selectedJobId) {
        const h = await api.getApplicationHistory(appId).catch(() => [])
        setAuditLogs((prev) => [...h, ...prev.filter((p) => p.application !== appId)].sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()))
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      showNotification(msg || 'فشل تحديث حالة الطلب', 'error')
    } finally {
      setIsUpdatingStatus(null)
    }
  }

  // Filter & Sort Applications
  const filteredApplications = applications
    .filter((app) => {
      if (statusFilter === 'الكل') return true
      if (statusFilter === 'UNDER_REVIEW') return app.status === 'UNDER_REVIEW' || app.status === 'SUBMITTED'
      return app.status === statusFilter
    })
    .sort((a, b) => {
      if (sortBy === 'MATCH_SCORE') {
        return (b.matching_score || b.match_score || 0) - (a.matching_score || a.match_score || 0)
      }
      if (sortBy === 'NEWEST') {
        return new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
      }
      return 0
    })

  const selectedJob = jobs.find((j) => j.id === selectedJobId)

  const getBreakdownScore = (score: number | undefined, max: number): string => {
    if (score === undefined || score === null) return '0'
    const val = (score <= 1.0 ? score * max : score).toFixed(1)
    return val.endsWith('.0') ? val.slice(0, -2) : val
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans" dir="rtl">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Breadcrumbs */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link to="/company/jobs" className="hover:text-slate-900 transition font-medium">
              وظائفي
            </Link>
            <span>/</span>
            <span className="text-amber-600 font-bold">المتقدمون وفرز التوافق</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F1E36]">
                المتقدمون وترتيب التوافق الموزون
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                فرز وترتيب المتقدمين وفق درجات التطابق الموزونة وسجل القرارات
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/company/jobs/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-xs"
              >
                + نشر شاغر جديد
              </Link>
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

        {/* Top Filter & Job Switcher */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Job Select Dropdown */}
            <div className="md:col-span-5">
              <label htmlFor="job-select-dropdown" className="block text-xs font-bold text-slate-700 mb-1.5">
                الشاغر الوظيفي المستهدف:
              </label>
              <select
                id="job-select-dropdown"
                value={selectedJobId || ''}
                onChange={(e) => setSelectedJobId(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} — {j.location || 'حضوري'} ({j.status === 'OPEN' ? 'مفتوحة' : 'مغلقة'})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="md:col-span-4">
              <label htmlFor="sort-by-select" className="block text-xs font-bold text-slate-700 mb-1.5">
                ترتيب المتقدمين:
              </label>
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'MATCH_SCORE' | 'NEWEST')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
              >
                <option value="MATCH_SCORE">الأعلى نسبة توافق (تنازلياً)</option>
                <option value="NEWEST">الأحدث تقديماً</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="md:col-span-3">
              <label htmlFor="status-filter-select" className="block text-xs font-bold text-slate-700 mb-1.5">
                تصفية الحالة:
              </label>
              <select
                id="status-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
              >
                <option value="الكل">الكل ({applications.length})</option>
                <option value="UNDER_REVIEW">قيد المراجعة</option>
                <option value="ACCEPTED">مقبول</option>
                <option value="REJECTED">مرفوض</option>
              </select>
            </div>
          </div>
        </div>

        {/* Candidates List */}
        <div className="space-y-4 mb-12">
          {isLoading ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
              <LoadingState message="جاري تحميل وترتيب المتقدمين وفق درجات التوافق..." />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
              <EmptyState
                title="لا يوجد متقدمون يطابقون المعايير المحددة"
                description="لم يتم تسجيل طلبات تقديم مطابقة لشروط التصفية أو أن الشاغر لم يستقبل متقدمين بعد."
              />
            </div>
          ) : (
            filteredApplications.map((app, index) => {
              const rawScore = app.matching_score ?? app.match_score ?? 0
              const scorePct = rawScore <= 1.0 ? Math.round(rawScore * 100) : Math.round(rawScore)
              const minScore = ((selectedJob?.minimum_match_score || 0.6) * 100)
              const isBelowMin = scorePct < minScore

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:border-amber-300 transition"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Col 1: Basic Info (4 cols) */}
                    <div className="lg:col-span-4 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#0F1E36] text-amber-400 font-mono font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                        <bdi dir="ltr">#{index + 1}</bdi>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-black text-[#0F1E36] truncate">
                            {app.applicant_name}
                          </h3>
                          {app.has_video_cv && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-bold">
                              فيديو
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {app.applicant_specialization} • {app.applicant_university}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono">
                          <span>الخبرة: {app.applicant_experience || 'حديث تخرج'}</span>
                          <span>•</span>
                          <span>المعدل: <bdi dir="ltr">{app.applicant_gpa || '90%'}</bdi></span>
                        </div>
                      </div>
                    </div>

                    {/* Col 2: Score Breakdown (4 cols) */}
                    <div className="lg:col-span-4 border-y lg:border-y-0 lg:border-x border-slate-100 py-4 lg:py-0 lg:px-6">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                        <span>تفصيل معايير التوافق:</span>
                        <button
                          type="button"
                          onClick={() => setMatchModalApp(app)}
                          className="text-[11px] text-amber-600 hover:text-amber-800 font-bold"
                        >
                          معادلة الأوزان ↗
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-500 text-[11px] block">المهارات (جاكارد):</span>
                          <span className="font-bold text-slate-800 font-mono">
                            <bdi dir="ltr">{getBreakdownScore(app.score_breakdown?.skills_score, 45)}/45</bdi>
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-500 text-[11px] block">التخصص الأكاديمي:</span>
                          <span className="font-bold text-slate-800 font-mono">
                            <bdi dir="ltr">{getBreakdownScore(app.score_breakdown?.specialization_score, 25)}/25</bdi>
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-500 text-[11px] block">سنوات الخبرة:</span>
                          <span className="font-bold text-slate-800 font-mono">
                            <bdi dir="ltr">{getBreakdownScore(app.score_breakdown?.experience_score, 20)}/20</bdi>
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-500 text-[11px] block">المؤهل والدرجة:</span>
                          <span className="font-bold text-slate-800 font-mono">
                            <bdi dir="ltr">{getBreakdownScore(app.score_breakdown?.qualification_score, 10)}/10</bdi>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Col 3: Total Match Score & Actions (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Overall Match Score */}
                      <div className="text-center sm:text-start">
                        <div className="text-[11px] font-bold text-slate-400 mb-1">نسبة التوافق:</div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-2xl font-black font-mono ${
                              scorePct >= 85
                                ? 'text-emerald-600'
                                : scorePct >= 70
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            <bdi dir="ltr">{scorePct}%</bdi>
                          </span>
                          {isBelowMin ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold">
                              دون الحد الأدنى
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                              مؤهل
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status Selector & Decision */}
                      <div className="space-y-2 w-full sm:w-auto">
                        <select
                          aria-label={`تعديل حالة طلب ${app.applicant_name}`}
                          value={app.status === 'SUBMITTED' ? 'UNDER_REVIEW' : app.status}
                          disabled={isUpdatingStatus === app.id}
                          onChange={(e) => handleStatusChange(app.id, e.target.value as 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED')}
                          className={`w-full text-xs font-black px-3 py-2 rounded-xl border focus:outline-hidden transition ${
                            app.status === 'ACCEPTED'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : app.status === 'REJECTED'
                              ? 'bg-rose-50 border-rose-300 text-rose-800'
                              : 'bg-amber-50 border-amber-300 text-amber-900'
                          }`}
                        >
                          <option value="UNDER_REVIEW">قيد المراجعة ▾</option>
                          <option value="ACCEPTED">مقبول ✓</option>
                          <option value="REJECTED">مرفوض ✕</option>
                        </select>

                        {/* Link to Screen 21 (Candidate Profile) */}
                        <Link
                          to={`/company/applications/${app.id}`}
                          className="w-full text-xs font-bold text-[#0F1E36] bg-slate-100 hover:bg-slate-200 py-1.5 px-3 rounded-xl transition block text-center shadow-2xs"
                        >
                          عرض الملف الكامل ➔
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Audit Log Section (Screen 20 - Without Bottom Clipping) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center text-sm font-bold">
              ✓
            </div>
            <div>
              <h2 className="text-base font-black text-[#0F1E36]">سجل تحديث حالات المتقدمين</h2>
              <p className="text-xs text-slate-500">توثيق تاريخي لكل قرار اتخذه مسؤول التوظيف مع التوقيت المعتمد</p>
            </div>
          </div>

          <div className="space-y-3">
            {auditLogs.length > 0 ? (
              auditLogs.slice(0, 10).map((log) => {
                const statusLabels: Record<string, string> = {
                  SUBMITTED: 'تقديم الطلب',
                  UNDER_REVIEW: 'قيد المراجعة',
                  ACCEPTED: 'مقبول',
                  REJECTED: 'مرفوض',
                  NONE: 'بداية التسجيل',
                }
                const formattedDate = new Date(log.changed_at).toLocaleString('ar-YE', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })

                return (
                  <div
                    key={log.history_id}
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-start gap-3 text-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-slate-700">
                        تم تحديث حالة الطلب <bdi dir="ltr">#{log.application}</bdi> من ({statusLabels[log.previous_status] || log.previous_status}) إلى (
                        <span className="font-bold text-slate-900">{statusLabels[log.new_status] || log.new_status}</span>
                        ) بواسطة مسؤول التوظيف <span className="text-slate-900 font-bold">{log.changed_by_name || 'مسؤول التوظيف'}</span>.
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        <bdi dir="ltr">{formattedDate}</bdi>
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-xs text-slate-500 p-3 rounded-xl bg-slate-50">
                • يتم توثيق قرارات مسؤولي التوظيف لحظياً في السجل التاريخي للطلبات.
              </div>
            )}
          </div>
        </div>

        {/* Match Breakdown Modal */}
        {matchModalApp && (
          <GraduateMatchBreakdownModal
            isOpen={Boolean(matchModalApp)}
            onClose={() => setMatchModalApp(null)}
            jobTitle={jobs.find((j) => j.id === selectedJobId)?.title || 'الوظيفة الشاغرة'}
            companyName={jobs.find((j) => j.id === selectedJobId)?.company_name || 'جهة العمل'}
            applicationId={matchModalApp.id}
            matchScore={matchModalApp.matching_score || matchModalApp.match_score || 0}
            status={matchModalApp.status}
            scoreBreakdown={matchModalApp.score_breakdown}
            weights={{
              skills_weight: jobs.find((j) => j.id === selectedJobId)?.skills_weight ?? 0.45,
              specialization_weight: jobs.find((j) => j.id === selectedJobId)?.specialization_weight ?? 0.25,
              experience_weight: jobs.find((j) => j.id === selectedJobId)?.experience_weight ?? 0.20,
              qualification_weight: jobs.find((j) => j.id === selectedJobId)?.qualification_weight ?? 0.10,
              min_score: jobs.find((j) => j.id === selectedJobId)?.minimum_match_score ?? 0.6,
            }}
          />
        )}
      </main>
    </div>
  )
}

export default CompanyApplicantsMatchingPage
