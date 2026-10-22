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
  const [rangeFilter, setRangeFilter] = useState<'ALL' | 'RECOMMENDED' | 'BELOW'>('ALL')
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

  const recommendedCandidates = applications.filter((app) => {
    const raw = app.matching_score ?? app.match_score ?? 0
    const pct = raw <= 1.0 ? Math.round(raw * 100) : Math.round(raw)
    return pct >= 60
  })

  const belowRangeCandidates = applications.filter((app) => {
    const raw = app.matching_score ?? app.match_score ?? 0
    const pct = raw <= 1.0 ? Math.round(raw * 100) : Math.round(raw)
    return pct < 60
  })

  // Filter & Sort Applications
  const filteredApplications = applications
    .filter((app) => {
      // 1. Status Filter
      if (statusFilter !== 'الكل') {
        if (statusFilter === 'UNDER_REVIEW') {
          if (app.status !== 'UNDER_REVIEW' && app.status !== 'SUBMITTED') return false
        } else if (app.status !== statusFilter) {
          return false
        }
      }
      // 2. Standard Score Range Filter (60% standard)
      const raw = app.matching_score ?? app.match_score ?? 0
      const pct = raw <= 1.0 ? Math.round(raw * 100) : Math.round(raw)
      if (rangeFilter === 'RECOMMENDED') return pct >= 60
      if (rangeFilter === 'BELOW') return pct < 60
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'MATCH_SCORE') {
        const scoreA = a.matching_score ?? a.match_score ?? 0
        const scoreB = b.matching_score ?? b.match_score ?? 0
        return scoreB - scoreA
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
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] text-[#0F172A] dark:text-slate-100 font-sans transition-colors duration-300" dir="rtl">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Breadcrumbs */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400 mb-2 font-medium">
            <Link to="/company/jobs" className="hover:text-[#0284C7] dark:hover:text-sky-400 transition">
              وظائفي
            </Link>
            <span>/</span>
            <span className="text-[#0284C7] dark:text-sky-400 font-bold">المتقدمون وفرز التوافق</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white">
                المتقدمون وترتيب التوافق الموزون
              </h1>
              <p className="text-[#64748B] dark:text-slate-400 text-xs sm:text-sm mt-1">
                فرز وترتيب المتقدمين وفق درجات التطابق الموزونة وسجل القرارات
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/company/jobs/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white font-black text-xs transition shadow-sm"
              >
                + نشر شاغر جديد
              </Link>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-sm font-bold shadow-2xs ${
              feedbackMsg.type === 'success'
                ? 'bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-normal px-2 py-1 cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* Top Filter & Job Switcher */}
        <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-6 shadow-sm mb-8 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Job Select Dropdown */}
            <div className="md:col-span-5">
              <label htmlFor="job-select-dropdown" className="block text-xs font-bold text-[#475569] dark:text-slate-300 mb-1.5">
                الشاغر الوظيفي المستهدف:
              </label>
              <select
                id="job-select-dropdown"
                value={selectedJobId || ''}
                onChange={(e) => setSelectedJobId(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-sm font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] transition"
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
              <label htmlFor="sort-by-select" className="block text-xs font-bold text-[#475569] dark:text-slate-300 mb-1.5">
                ترتيب المتقدمين:
              </label>
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'MATCH_SCORE' | 'NEWEST')}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] transition"
              >
                <option value="MATCH_SCORE">الأعلى نسبة توافق (تنازلياً)</option>
                <option value="NEWEST">الأحدث تقديماً</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="md:col-span-3">
              <label htmlFor="status-filter-select" className="block text-xs font-bold text-[#475569] dark:text-slate-300 mb-1.5">
                تصفية الحالة:
              </label>
              <select
                id="status-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] transition"
              >
                <option value="الكل">الكل ({applications.length})</option>
                <option value="UNDER_REVIEW">قيد المراجعة</option>
                <option value="ACCEPTED">مقبول</option>
                <option value="REJECTED">مرفوض</option>
              </select>
            </div>
          </div>
        </div>

        {/* Score Range Tabs (الرنغ القياسي المعتمد: 0% إلى 100% مع فرز تنازلي) */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-[#E8DEC8] dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setRangeFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              rangeFilter === 'ALL'
                ? 'bg-[#0284C7] text-white shadow-xs font-black'
                : 'bg-white dark:bg-slate-800 text-[#475569] dark:text-slate-300 border border-[#E8DEC8] dark:border-slate-700 hover:border-[#0284C7]'
            }`}
          >
            <span>جميع المتقدمين (مرتبون تنازلياً 100% - 0%)</span>
            <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
              rangeFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
              {applications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRangeFilter('RECOMMENDED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              rangeFilter === 'RECOMMENDED'
                ? 'bg-emerald-600 text-white shadow-xs font-black'
                : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-500'
            }`}
          >
            <span>⭐ المرشحون الموصى بهم (رنغ 60% إلى 100%)</span>
            <span className={`text-[10px] px-2 py-0.2 rounded-full font-black ${
              rangeFilter === 'RECOMMENDED' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
            }`}>
              {recommendedCandidates.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRangeFilter('BELOW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              rangeFilter === 'BELOW'
                ? 'bg-slate-700 text-white shadow-xs font-black'
                : 'bg-white dark:bg-slate-800 text-[#64748B] dark:text-slate-400 border border-[#E8DEC8] dark:border-slate-700 hover:border-slate-400'
            }`}
          >
            <span>قائمة المتقدمين دون الحد الموصى به (أقل من 60%)</span>
            <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
              rangeFilter === 'BELOW' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
              {belowRangeCandidates.length}
            </span>
          </button>
        </div>

        {/* Candidates List */}
        <div className="space-y-4 mb-12">
          {isLoading ? (
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-12 text-center shadow-sm">
              <LoadingState message="جاري تحميل وترتيب المتقدمين وفق درجات التوافق..." />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-12 text-center shadow-sm">
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

              // النطاق القياسي الموحد (Standard Score Range 0% - 100%)
              const rangeInfo = scorePct >= 60
                ? { label: 'مرشح موصى به (Highly Recommended)', badge: '⭐ موصى به (60% - 100%)', color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 font-bold' }
                : { label: 'دون النطاق الموصى به (Below Range)', badge: 'دون النطاق الموصى به (< 60%)', color: 'text-[#64748B] dark:text-slate-400 bg-[#FAF7F2] dark:bg-slate-800 border-[#E8DEC8] dark:border-slate-700' }

              const isZeroExp = !app.applicant_experience || app.applicant_experience === '0' || app.applicant_experience.includes('حديث') || app.applicant_experience.includes('بدون')
              const isAccepted = app.status === 'ACCEPTED'

              return (
                <div
                  key={app.id}
                  className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:border-[#BAE6FD] dark:hover:border-sky-800 transition"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Col 1: Basic Info & Project Strengths (4 cols) */}
                    <div className="lg:col-span-4 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800 font-mono font-black text-lg flex items-center justify-center shrink-0 shadow-2xs">
                        <bdi dir="ltr">#{index + 1}</bdi>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <h3 className="text-base font-black text-[#0F172A] dark:text-white truncate">
                            {app.applicant_name}
                          </h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-black ${rangeInfo.color}`}>
                            {rangeInfo.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium">
                          {app.applicant_specialization} • {app.applicant_university}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-slate-400 mt-2 font-mono">
                          <span>الخبرة: {app.applicant_experience || 'حديث تخرج'}</span>
                          <span>•</span>
                          <span>المعدل: <bdi dir="ltr">{app.applicant_gpa || '90%'}</bdi></span>
                        </div>

                        {/* شارات إثبات القوة العملية ومشاريع GitHub والتخرج */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {(app.has_graduation_project || (app.projects_count && app.projects_count > 0)) && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FEF3C7] dark:bg-amber-950/60 text-[#92400E] dark:text-amber-300 border border-[#FDE68A] dark:border-amber-800 font-bold flex items-center gap-1">
                              <span>🎓</span>
                              <span>{app.graduation_project_title ? `مشروع: ${app.graduation_project_title.slice(0, 22)}...` : 'مشروع تخرج نوعي'}</span>
                            </span>
                          )}

                          {(app.has_github || app.github_url) && (
                            <a
                              href={app.github_url || 'https://github.com'}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-[#0F172A] dark:bg-slate-800 text-white hover:bg-slate-800 font-bold flex items-center gap-1 transition"
                            >
                              <span>💻</span>
                              <span>GitHub ↗</span>
                            </a>
                          )}

                          {app.has_video_cv && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800 font-black flex items-center gap-1">
                              <span>🎥</span>
                              <span>فيديو موثق</span>
                            </span>
                          )}

                          {isZeroExp && (app.has_graduation_project || app.has_github || (app.projects_count && app.projects_count > 0)) && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800 font-bold">
                              ✨ كفاءة مشاريع برمجية
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Col 2: Score Breakdown (4 cols) */}
                    <div className="lg:col-span-4 border-y lg:border-y-0 lg:border-x border-[#E8DEC8] dark:border-slate-800 py-4 lg:py-0 lg:px-6">
                      <div className="flex items-center justify-between text-xs font-bold text-[#475569] dark:text-slate-300 mb-2">
                        <span>تفصيل معايير التوافق (المعادلة الموزونة):</span>
                        <button
                          type="button"
                          onClick={() => setMatchModalApp(app)}
                          className="text-[11px] text-[#0284C7] dark:text-sky-400 hover:text-[#0369A1] font-black cursor-pointer"
                        >
                          المعادلة ↗
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700">
                          <span className="text-[#64748B] dark:text-slate-400 text-[11px] block font-semibold">المهارات:</span>
                          <span className="font-bold text-[#0F172A] dark:text-white font-mono">
                            <bdi dir="ltr">{getBreakdownScore(app.score_breakdown?.skills_score, 45)}/45</bdi>
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700">
                          <span className="text-[#64748B] dark:text-slate-400 text-[11px] block font-semibold">التخصص الأكاديمي:</span>
                          <span className="font-bold text-[#0F172A] dark:text-white font-mono">
                            <bdi dir="ltr">{getBreakdownScore(app.score_breakdown?.specialization_score, 25)}/25</bdi>
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700">
                          <span className="text-[#64748B] dark:text-slate-400 text-[11px] block font-semibold">الخبرة / المشاريع:</span>
                          <span className="font-bold text-[#0F172A] dark:text-white font-mono">
                            <bdi dir="ltr">{getBreakdownScore(app.score_breakdown?.experience_score, 20)}/20</bdi>
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700">
                          <span className="text-[#64748B] dark:text-slate-400 text-[11px] block font-semibold">المؤهل والدرجة:</span>
                          <span className="font-bold text-[#0F172A] dark:text-white font-mono">
                            <bdi dir="ltr">{getBreakdownScore(app.score_breakdown?.qualification_score, 10)}/10</bdi>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Col 3: Total Match Score & Actions (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Overall Match Score */}
                      <div className="text-center sm:text-start">
                        <div className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 mb-1">نسبة التوافق الموزونة:</div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-2xl font-black font-mono ${
                              scorePct >= 80
                                ? 'text-[#0284C7] dark:text-sky-400'
                                : scorePct >= 60
                                ? 'text-[#0284C7] dark:text-sky-400'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <bdi dir="ltr">{scorePct}%</bdi>
                          </span>
                          {isBelowMin ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold">
                              دون الحد الأدنى
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800 font-black">
                              مستوفٍ للشروط
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-medium block mt-1">
                          {rangeInfo.label}
                        </span>
                      </div>

                      {/* Status Selector & Decision */}
                      <div className="space-y-2 w-full sm:w-auto">
                        <select
                          aria-label={`تعديل حالة طلب ${app.applicant_name}`}
                          value={app.status === 'SUBMITTED' ? 'UNDER_REVIEW' : app.status}
                          disabled={isUpdatingStatus === app.id}
                          onChange={(e) => handleStatusChange(app.id, e.target.value as 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED')}
                          className={`w-full text-xs font-black px-3 py-2 rounded-xl border focus:outline-none transition ${
                            app.status === 'ACCEPTED'
                              ? 'bg-[#E0F2FE] dark:bg-sky-950/60 border-[#BAE6FD] dark:border-sky-800 text-[#0284C7] dark:text-sky-300'
                              : app.status === 'REJECTED'
                              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                              : 'bg-[#FAF7F2] dark:bg-slate-800 border-[#E8DEC8] dark:border-slate-700 text-[#0284C7] dark:text-sky-300'
                          }`}
                        >
                          <option value="UNDER_REVIEW">قيد المراجعة ▾</option>
                          <option value="ACCEPTED">مقبول ✓ (فتح التواصل)</option>
                          <option value="REJECTED">مرفوض ✕</option>
                        </select>

                        {/* Direct Contact Button when Accepted */}
                        {isAccepted && (
                          <div className="flex items-center gap-1.5">
                            {app.applicant_phone && (
                              <a
                                href={`https://wa.me/${app.applicant_phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-1 px-2 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11px] font-bold text-center transition flex items-center justify-center gap-1"
                              >
                                <span>واتساب</span>
                              </a>
                            )}
                            {app.applicant_email && (
                              <a
                                href={`mailto:${app.applicant_email}`}
                                className="flex-1 py-1 px-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-[11px] font-bold text-center transition flex items-center justify-center gap-1"
                              >
                                <span>إيميل</span>
                              </a>
                            )}
                          </div>
                        )}

                        {/* Link to Candidate Profile */}
                        <Link
                          to={`/company/applications/${app.id}`}
                          className="w-full text-xs font-bold text-[#0F172A] dark:text-white bg-[#FAF7F2] dark:bg-slate-800 hover:bg-[#E5D7C3]/50 dark:hover:bg-slate-700 border border-[#E8DEC8] dark:border-slate-700 py-1.5 px-3 rounded-xl transition block text-center shadow-2xs"
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

        {/* Audit Log Section */}
        <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-all">
          <div className="flex items-center gap-3 border-b border-[#E8DEC8] dark:border-slate-800 pb-4 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800 flex items-center justify-center text-sm font-black">
              ✓
            </div>
            <div>
              <h2 className="text-base font-black text-[#0F172A] dark:text-white">سجل تحديث حالات المتقدمين</h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">توثيق تاريخي لكل قرار اتخذه مسؤول التوظيف مع التوقيت المعتمد</p>
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
                    className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700 flex items-start gap-3 text-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#0284C7] mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-[#475569] dark:text-slate-300">
                        تم تحديث حالة الطلب <bdi dir="ltr">#{log.application}</bdi> من ({statusLabels[log.previous_status] || log.previous_status}) إلى (
                        <span className="font-black text-[#0F172A] dark:text-white">{statusLabels[log.new_status] || log.new_status}</span>
                        ) بواسطة مسؤول التوظيف <span className="text-[#0F172A] dark:text-white font-black">{log.changed_by_name || 'مسؤول التوظيف'}</span>.
                      </p>
                      <span className="text-[10px] text-[#94A3B8] dark:text-slate-400 font-mono mt-0.5 block">
                        <bdi dir="ltr">{formattedDate}</bdi>
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-xs text-[#64748B] dark:text-slate-400 p-3 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/50 border border-[#E8DEC8] dark:border-slate-700">
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
