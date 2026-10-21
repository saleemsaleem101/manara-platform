import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { api } from '../services/api'
import type { Job, JobApplication } from '../types'

export const JobsBrowsePage: React.FC = () => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])
  const [jobs, setJobs] = useState<Job[]>([])
  const [myApplications, setMyApplications] = useState<JobApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMajor, setSelectedMajor] = useState('الكل')
  const [selectedExp, setSelectedExp] = useState('الكل')
  const [selectedCity, setSelectedCity] = useState('الكل')
  const [sortBy, setSortBy] = useState('-created_at')

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type })
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setFeedbackMsg(null), 5000)
  }

  const fetchData = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setIsLoading(true)
      const [jobsData, appsData] = await Promise.all([
        api.getJobs({
          search: searchQuery,
          specialization: selectedMajor,
          location: selectedCity,
          experience: selectedExp,
          ordering: sortBy,
        }).catch(() => []),
        api.getMyApplications().catch(() => []),
      ])

      setJobs(jobsData)
      setMyApplications(appsData)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      showNotification(msg || 'فشل تحميل بيانات الوظائف', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, selectedMajor, selectedCity, selectedExp, sortBy])

  useEffect(() => {
    fetchData(false)
  }, [fetchData])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchData()
  }

  const isApplied = (jobId: number) => {
    return myApplications.some((app) => app.job === jobId || (typeof app.job === 'object' && (app.job as { id: number }).id === jobId))
  }

  const getMatchScoreBadge = (score?: number) => {
    if (score === undefined || score === null) {
      return (
        <span className="px-3 py-1 rounded-full bg-[#FAF7F2] dark:bg-slate-800 text-[#64748B] dark:text-slate-400 border border-[#E8DEC8] dark:border-slate-700 text-xs font-semibold">
          غير محسوب بعد
        </span>
      )
    }
    const pct = Math.round(score * 100)
    if (pct >= 90) {
      return (
        <span className="px-3 py-1 rounded-full bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800 text-xs font-black font-mono">
          {pct}% توافق ممتاز
        </span>
      )
    }
    if (pct >= 80) {
      return (
        <span className="px-3 py-1 rounded-full bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800 text-xs font-black font-mono">
          {pct}% توافق مرتفع
        </span>
      )
    }
    return (
      <span className="px-3 py-1 rounded-full bg-[#FAF7F2] dark:bg-slate-800 text-[#475569] dark:text-slate-300 border border-[#E8DEC8] dark:border-slate-700 text-xs font-bold font-mono">
        {pct}% توافق موزون
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] pb-16 font-['Cairo'] text-start text-[#0F172A] dark:text-slate-100 transition-colors duration-300" dir="rtl">
      <Navbar />

      {/* Main Container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 pt-6">
        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`mb-4 p-4 rounded-xl text-[13px] font-bold flex items-center justify-between shadow-2xs transition ${
              feedbackMsg.type === 'success'
                ? 'bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Hero Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#0F172A] dark:text-white">الفرص الوظيفية</h1>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 font-medium">
              استكشاف الوظائف المناسبة، الفلترة حسب المعايير، والتقديم المباشر بملفك المهني
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800 text-xs font-bold">
              مطابقة معايير التوافق المعتمدة ✓
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="glass-silk-card mb-8 p-3 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-[#E8DEC8] dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center transition-all"
        >
          {/* Keyword Search (4 cols) */}
          <div className="lg:col-span-4 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالمسمى الوظيفي، الكلمات المفتاحية، أو اسم الشركة..."
              className="w-full ps-4 pe-10 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 text-xs focus:outline-none focus:border-[#38BDF8] bg-[#FAF7F2] dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-[#0F172A] dark:text-white"
            />
            <div className="absolute end-3.5 top-2.5 text-[#64748B] dark:text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Specialization Filter (2 cols) */}
          <div className="lg:col-span-2">
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 text-xs font-bold bg-[#FAF7F2] dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#38BDF8] text-[#0F172A] dark:text-white"
            >
              <option value="الكل">التخصص: الكل</option>
              <option value="هندسة البرمجيات">هندسة البرمجيات</option>
              <option value="علوم الحاسوب">علوم الحاسوب</option>
              <option value="نظم المعلومات">نظم المعلومات</option>
              <option value="الأمن السيبراني">الأمن السيبراني</option>
            </select>
          </div>

          {/* Experience Filter (2 cols) */}
          <div className="lg:col-span-2">
            <select
              value={selectedExp}
              onChange={(e) => setSelectedExp(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 text-xs font-bold bg-[#FAF7F2] dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#38BDF8] text-[#0F172A] dark:text-white"
            >
              <option value="الكل">الخبرة: الكل</option>
              <option value="0">حديث التخرج (0 - 1 سنة)</option>
              <option value="1">1 - 2 سنوات</option>
              <option value="3">3+ سنوات</option>
            </select>
          </div>

          {/* City Filter (2 cols) */}
          <div className="lg:col-span-2">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 text-xs font-bold bg-[#FAF7F2] dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#38BDF8] text-[#0F172A] dark:text-white"
            >
              <option value="الكل">المدينة: الكل</option>
              <option value="صنعاء">صنعاء</option>
              <option value="عدن">عدن</option>
              <option value="تعز">تعز</option>
              <option value="حضرموت">حضرموت</option>
            </select>
          </div>

          {/* Search Button (2 cols) */}
          <div className="lg:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>تطبيق الفلاتر والبحث</span>
            </button>
          </div>
        </form>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="mb-6 p-3 bg-[#E0F2FE] dark:bg-sky-950/50 border border-[#BAE6FD] dark:border-sky-800 text-[#0284C7] dark:text-sky-300 rounded-xl text-xs font-bold flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-[#0284C7] border-t-transparent rounded-full animate-spin" />
              <span>جاري تحميل أحدث الشواغر والفرص الوظيفية المتاحة...</span>
            </div>
          </div>
        )}

        {/* Full-width Jobs Feed */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-[#0F172A] dark:text-white">
                الشواغر والفرص المتاحة
              </h2>
              <span className="text-xs font-bold text-[#0284C7] dark:text-sky-300 bg-[#E0F2FE] dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-[#BAE6FD] dark:border-sky-800">
                {jobs.length} فرصة نشطة
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 whitespace-nowrap">الترتيب حسب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 text-xs font-bold bg-[#FAF7F2] dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] cursor-pointer shadow-2xs"
              >
                <option value="-created_at">الأحدث نشراً (افتراضي)</option>
                <option value="created_at">الأقدم نشراً</option>
                <option value="-salary_max">الراتب الأعلى</option>
                <option value="title">المسمى الوظيفي (أ-ي)</option>
              </select>
            </div>
          </div>

          {jobs.length === 0 && !isLoading ? (
            <div className="p-8 text-center bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 text-[#64748B] dark:text-slate-400">
              لا توجد وظائف مطابقة للبحث حالياً. جرب تغيير خيارات الفلترة.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => {
                const applied = isApplied(job.id)

                return (
                  <div
                    key={job.id}
                    className="glass-silk-card p-5 sm:p-6 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-[#E8DEC8] dark:border-slate-800 hover:border-[#BAE6FD] dark:hover:border-sky-800 transition shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top Row: Title, Match Score */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-black text-[#0F172A] dark:text-white">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] dark:text-slate-400 mt-1">
                            <span className="font-bold text-[#475569] dark:text-slate-300">{job.company_name}</span>
                            <span>•</span>
                            <span>📍 {job.location}</span>
                            <span>•</span>
                            <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] dark:bg-slate-800 text-[#475569] dark:text-slate-300 font-medium border border-[#E8DEC8] dark:border-slate-700">
                              {job.job_type === 'FULL_TIME' ? 'دوام كامل' : job.job_type === 'HYBRID' ? 'هجين' : 'عن بعد'}
                            </span>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div className="self-start">
                          {getMatchScoreBadge(job.match_score)}
                        </div>
                      </div>

                      {/* Brief Requirements */}
                      <p className="text-xs text-[#475569] dark:text-slate-300 leading-relaxed mt-3 line-clamp-2">
                        {job.requirements || job.description}
                      </p>

                      {/* Skill Tags */}
                      <div className="flex flex-wrap items-center gap-2 pt-3">
                        {job.required_skills && job.required_skills.length > 0 ? (
                          job.required_skills.map((s) => (
                            <span
                              key={s.id}
                              className="px-2.5 py-1 rounded-lg bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800 text-[11px] font-bold"
                            >
                              {s.skill_name}
                            </span>
                          ))
                        ) : (
                          <>
                            <span className="px-2.5 py-1 rounded-lg bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800 text-[11px] font-bold">
                              {job.required_major}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] dark:bg-slate-800 text-[#475569] dark:text-slate-300 border border-[#E8DEC8] dark:border-slate-700 text-[11px] font-bold">
                              حديث التخرج
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#E8DEC8]/60 dark:border-slate-800 mt-auto">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-xs font-bold text-[#64748B] dark:text-slate-400 hover:text-[#0284C7] dark:hover:text-sky-400 transition underline underline-offset-4 cursor-pointer"
                      >
                        تفاصيل الوظيفة والتقديم
                      </Link>

                      <div>
                        {applied ? (
                          <span className="px-3.5 py-1.5 rounded-xl bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800 text-xs font-bold inline-flex items-center gap-1.5 cursor-default">
                            تم التقديم مسبقاً ✓
                          </span>
                        ) : (
                          <Link
                            to={`/jobs/${job.id}`}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <span>تقديم على الوظيفة</span>
                            <span>←</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobsBrowsePage
