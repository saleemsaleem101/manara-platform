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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Cairo'] text-start" dir="rtl">
      <Navbar />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#0F1E36]">طلباتي وسجل المتابعة</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              متابعة حالة طلبات التوظيف المقدمة، وسجل التحديثات، وتفاصيل درجات التوافق
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F1E36] text-white text-xs font-bold hover:bg-[#1E293B] transition self-start sm:self-auto"
          >
            <span>استكشاف فرص وظيفية جديدة</span>
            <span>←</span>
          </Link>
        </div>

        {/* Status Tabs (3 strictly required states: Under Review, Accepted, Rejected) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#0F1E36] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            جميع الطلبات (<bdi dir="ltr">{applications.length}</bdi>)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('UNDER_REVIEW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'UNDER_REVIEW'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-black text-[#0F1E36]">{app.job_title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="font-bold text-slate-700">{app.company_name}</span>
                        <span>•</span>
                        <span>
                          تاريخ التقديم: {new Date(app.applied_at).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {scorePct !== null && (
                        <div className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-[#0F1E36]">
                          التوافق: <bdi dir="ltr">{scorePct}%</bdi>
                        </div>
                      )}
                      <StatusBadge status={app.status} />
                    </div>
                  </div>

                  {/* Status History Timeline */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1.5">
                    <div className="font-bold text-[#0F1E36] text-[11px]">سجل ومسار الطلب:</div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="text-emerald-700 font-bold">1. تم إرسال الطلب</span>
                      <span>➔</span>
                      {app.status === 'UNDER_REVIEW' || app.status === 'SUBMITTED' ? (
                        <span className="text-amber-700 font-bold">2. قيد مراجعة بيانات المرشح</span>
                      ) : app.status === 'ACCEPTED' ? (
                        <span className="text-emerald-700 font-bold">2. تم القبول بنجاح ✓</span>
                      ) : (
                        <span className="text-rose-700 font-bold">2. تم الاعتذار عن القبول</span>
                      )}
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedMatchApp(app)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E293B] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>تفاصيل المطابقة</span>
                      {scorePct !== null && (
                        <span className="text-amber-400 font-mono">(<bdi dir="ltr">{scorePct}%</bdi>)</span>
                      )}
                    </button>

                    <Link
                      to={`/jobs/${app.job}`}
                      className="text-xs font-bold text-slate-600 hover:text-[#0F1E36] underline underline-offset-4"
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
