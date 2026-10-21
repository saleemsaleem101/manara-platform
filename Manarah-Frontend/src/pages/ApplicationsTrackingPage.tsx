import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { StatusBadge } from '../components/StatusBadge'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { GraduateMatchBreakdownModal } from '../components/GraduateMatchBreakdownModal'
import { api } from '../services/api'
import type { JobApplication } from '../types'

export const ApplicationsTrackingPage: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Tabs: ALL, UNDER_REVIEW (includes SUBMITTED), ACCEPTED, REJECTED
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED'>('ALL')

  // Selected App for Modal 13
  const [selectedMatchApp, setSelectedMatchApp] = useState<JobApplication | null>(null)

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await api.getMyApplications()
      setApplications(data)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      setError(msg || 'فشل تحميل قائمة طلبات التوظيف')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  // Filter applications by tab
  const filteredApps = applications.filter((app) => {
    if (activeTab === 'ALL') return true
    if (activeTab === 'UNDER_REVIEW') {
      return app.status === 'UNDER_REVIEW' || app.status === 'SUBMITTED'
    }
    return app.status === activeTab
  })

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] flex flex-col font-['Cairo'] text-start text-[#0F172A] dark:text-slate-100 transition-colors duration-300" dir="rtl">
      <Navbar />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#0F172A] dark:text-white">طلباتي وسجل المتابعة</h1>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 font-medium">
              متابعة حالة طلبات التوظيف المقدمة، وسجل التحديثات، وتفاصيل درجات التوافق
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white text-xs font-black transition self-start sm:self-auto shadow-sm"
          >
            <span>استكشاف فرص وظيفية جديدة</span>
            <span>←</span>
          </Link>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E8DEC8] dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white shadow-sm font-black'
                : 'bg-[#FAF7F2] dark:bg-slate-800 text-[#475569] dark:text-slate-300 hover:bg-[#E5D7C3]/50 dark:hover:bg-slate-700 border border-[#E8DEC8] dark:border-slate-700'
            }`}
          >
            جميع الطلبات (<bdi dir="ltr">{applications.length}</bdi>)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('UNDER_REVIEW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'UNDER_REVIEW'
                ? 'bg-[#0284C7] text-white shadow-sm font-black'
                : 'bg-[#FAF7F2] dark:bg-slate-800 text-[#475569] dark:text-slate-300 hover:bg-[#E5D7C3]/50 dark:hover:bg-slate-700 border border-[#E8DEC8] dark:border-slate-700'
            }`}
          >
            قيد المراجعة (
            <bdi dir="ltr">
              {applications.filter((a) => a.status === 'UNDER_REVIEW' || a.status === 'SUBMITTED').length}
            </bdi>
            )
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ACCEPTED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'ACCEPTED'
                ? 'bg-[#0284C7] text-white shadow-sm font-black'
                : 'bg-[#FAF7F2] dark:bg-slate-800 text-[#475569] dark:text-slate-300 hover:bg-[#E5D7C3]/50 dark:hover:bg-slate-700 border border-[#E8DEC8] dark:border-slate-700'
            }`}
          >
            مقبول (
            <bdi dir="ltr">
              {applications.filter((a) => a.status === 'ACCEPTED').length}
            </bdi>
            )
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('REJECTED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-sm font-black'
                : 'bg-[#FAF7F2] dark:bg-slate-800 text-[#475569] dark:text-slate-300 hover:bg-[#E5D7C3]/50 dark:hover:bg-slate-700 border border-[#E8DEC8] dark:border-slate-700'
            }`}
          >
            مرفوض (
            <bdi dir="ltr">
              {applications.filter((a) => a.status === 'REJECTED').length}
            </bdi>
            )
          </button>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <LoadingState message="جاري استرجاع سجل طلبات التوظيف..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchApplications} />
        ) : filteredApps.length === 0 ? (
          <EmptyState
            title="لم تقدّم على أي وظيفة بعد"
            description="يمكنك تصفح الفرص الوظيفية الشاغرة والتقديم المباشر بملفك المهني المعتمد."
            actionLabel="استعراض الفرص الوظيفية"
            actionTo="/jobs"
          />
        ) : (
          <div className="space-y-4">
            {filteredApps.map((app) => {
              const scorePct =
                app.matching_score !== undefined && app.matching_score !== null
                  ? Math.round(app.matching_score * 100)
                  : app.match_score !== undefined && app.match_score !== null
                  ? Math.round(app.match_score * 100)
                  : null

              return (
                <div
                  key={app.id}
                  className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 border border-[#E8DEC8] dark:border-slate-800 shadow-sm hover:border-[#BAE6FD] dark:hover:border-sky-800 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-black text-[#0F172A] dark:text-white">{app.job_title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] dark:text-slate-400 mt-1">
                        <span className="font-bold text-[#475569] dark:text-slate-300">{app.company_name}</span>
                        <span>•</span>
                        <span>
                          تاريخ التقديم: {new Date(app.applied_at).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {scorePct !== null && (
                        <div className="px-3 py-1 rounded-xl bg-[#E0F2FE] dark:bg-sky-950/60 border border-[#BAE6FD] dark:border-sky-800 text-xs font-black text-[#0284C7] dark:text-sky-300 font-mono">
                          التوافق: <bdi dir="ltr">{scorePct}%</bdi>
                        </div>
                      )}
                      <StatusBadge status={app.status} />
                    </div>
                  </div>

                  {/* Status History Timeline */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700 text-xs text-[#475569] dark:text-slate-300 space-y-1.5">
                    <div className="font-bold text-[#0F172A] dark:text-white text-[11px]">سجل ومسار الطلب:</div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="text-[#0284C7] dark:text-sky-300 font-bold">1. تم إرسال الطلب</span>
                      <span>➔</span>
                      {app.status === 'UNDER_REVIEW' || app.status === 'SUBMITTED' ? (
                        <span className="text-[#0284C7] dark:text-sky-300 font-bold">2. قيد مراجعة بيانات المرشح</span>
                      ) : app.status === 'ACCEPTED' ? (
                        <span className="text-[#0284C7] dark:text-sky-300 font-black">2. تم القبول بنجاح ✓ (تم فتح التواصل المباشر)</span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-bold">2. تم الاعتذار عن القبول</span>
                      )}
                    </div>
                    {app.status === 'ACCEPTED' && (
                      <div className="mt-2 pt-2 border-t border-[#BAE6FD] dark:border-sky-900 text-[#0284C7] dark:text-sky-300 font-bold text-[11px] flex items-center gap-1.5">
                        <span>🎉</span>
                        <span>تهانينا! وافقت المنشأة على طلبك وستتواصل معك لتحديد موعد المقابلة المباشرة.</span>
                      </div>
                    )}
                  </div>

                  {/* Action Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E8DEC8]/60 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelectedMatchApp(app)}
                      className="px-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 hover:bg-[#E5D7C3]/50 dark:hover:bg-slate-700 text-[#0284C7] dark:text-sky-300 border border-[#E8DEC8] dark:border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>تفاصيل المطابقة</span>
                      {scorePct !== null && (
                        <span className="text-[#0284C7] dark:text-sky-300 font-black font-mono">(<bdi dir="ltr">{scorePct}%</bdi>)</span>
                      )}
                    </button>

                    <Link
                      to={`/jobs/${app.job}`}
                      className="text-xs font-bold text-[#64748B] dark:text-slate-400 hover:text-[#0284C7] dark:hover:text-sky-400 underline underline-offset-4"
                    >
                      عرض الشاغر الأصلي
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Graduate Match Breakdown Modal (Screen 13) */}
      {selectedMatchApp && (
        <GraduateMatchBreakdownModal
          isOpen={Boolean(selectedMatchApp)}
          onClose={() => setSelectedMatchApp(null)}
          jobTitle={selectedMatchApp.job_title}
          companyName={selectedMatchApp.company_name}
          applicationId={selectedMatchApp.id}
          matchScore={selectedMatchApp.matching_score ?? selectedMatchApp.match_score ?? 0}
          status={selectedMatchApp.status}
          scoreBreakdown={selectedMatchApp.score_breakdown}
        />
      )}
    </div>
  )
}

export default ApplicationsTrackingPage
