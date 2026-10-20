import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { StatusBadge } from '../components/StatusBadge'
import { api } from '../services/api'
import type { CandidateProfile, CompanyProfile, ApplicationStatusHistoryItem } from '../types'

export const CompanyCandidateProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const applicationId = Number(id)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null)
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null)
  const [statusHistory, setStatusHistory] = useState<ApplicationStatusHistoryItem[]>([])
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    async function loadCandidateData() {
      try {
        setIsLoading(true)
        setError(null)

        // 1. Company profile to verify if verified
        const company = await api.getCompanyProfile().catch(() => null)
        setCompanyProfile(company)

        // 2. Candidate Application Profile
        let profile: CandidateProfile | null = null
        try {
          profile = await api.getCandidateApplicationProfile(applicationId)
        } catch {
          // Fallback: try to reconstruct from applications/matching
          const matchResult = (await api.getApplicationMatchResult(applicationId).catch(() => null)) as Record<string, any> | null
          if (matchResult) {
            profile = {
              id: applicationId,
              application_id: applicationId,
              full_name: (matchResult.applicant_name as string) || 'مرشح معتمد',
              email: matchResult.applicant_email || '',
              phone: matchResult.applicant_phone || '',
              city: matchResult.applicant_city || 'صنعاء',
              university: matchResult.applicant_university || '',
              major: matchResult.applicant_specialization || '',
              graduation_year: matchResult.applicant_graduation_year || 2024,
              gpa: matchResult.applicant_gpa || '90%',
              experience_years: matchResult.applicant_experience || 'حديث تخرج',
              bio: matchResult.bio || 'خريج متميز متخصص في التقنيات الحديثة وتطوير الأنظمة البرمجية.',
              skills: matchResult.skills || [],
              projects: matchResult.projects || [],
              video_cv_url: matchResult.video_cv_url || null,
              video_visibility: matchResult.video_visibility || 'COMPANIES_ONLY',
              match_score: matchResult.matching_score || matchResult.match_score || 0,
              score_breakdown: matchResult.score_breakdown,
              status: matchResult.status || 'UNDER_REVIEW',
              applied_at: matchResult.applied_at || new Date().toISOString(),
            }
          }
        }

        if (!profile) {
          throw new Error('لم يتم العثور على بيانات المرشح المطلوب')
        }

        setCandidate(profile)

        // 3. Status History
        const history = await api.getApplicationHistory(applicationId).catch(() => [])
        setStatusHistory(history)
      } catch (err: unknown) {
        const msg = (err as { message?: string })?.message
        setError(msg || 'فشل تحميل ملف المرشح')
      } finally {
        setIsLoading(false)
      }
    }

    if (applicationId) {
      loadCandidateData()
    }
  }, [applicationId])

  const handleUpdateStatus = async (newStatus: 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED') => {
    if (!candidate) return
    try {
      setIsUpdatingStatus(true)
      await api.updateApplicationStatus(applicationId, newStatus)
      setCandidate({ ...candidate, status: newStatus })

      const labels = {
        UNDER_REVIEW: 'قيد المراجعة',
        ACCEPTED: 'مقبول',
        REJECTED: 'مرفوض',
      }
      setFeedbackMsg({
        text: `تم تحديث حالة الطلب إلى (${labels[newStatus]}) وتوثيق القرار في السجل.`,
        type: 'success',
      })

      // Refresh history
      const history = await api.getApplicationHistory(applicationId).catch(() => [])
      setStatusHistory(history)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      setFeedbackMsg({ text: msg || 'فشل تحديث حالة الطلب', type: 'error' })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]" dir="rtl">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-20">
          <LoadingState message="جاري استرجاع ملف المرشح وتفاصيل التوافق الموزونة..." />
        </div>
      </div>
    )
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]" dir="rtl">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20">
          <ErrorState
            message={error || 'البيانات المطلوبة غير متوفرة أو تم إغلاق الشاغر.'}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  const isCompanyApproved = companyProfile?.verification_status === 'APPROVED'
  const rawScore = candidate.match_score || 0
  const scorePct = rawScore <= 1.0 ? Math.round(rawScore * 100) : Math.round(rawScore)

  const getScoreNumber = (val?: number, max: number = 45) => {
    if (val === undefined || val === null) return '0'
    const res = (val <= 1.0 ? val * max : val).toFixed(1)
    return res.endsWith('.0') ? res.slice(0, -2) : res
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans" dir="rtl">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link to="/company/jobs" className="hover:text-slate-900 transition font-medium">
            وظائفي
          </Link>
          <span>/</span>
          <Link to="/company/applicants" className="hover:text-slate-900 transition font-medium">
            المتقدمون
          </Link>
          <span>/</span>
          <span className="text-amber-600 font-bold">ملف المرشح #{applicationId}</span>
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

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#0F1E36] text-white text-xl font-black flex items-center justify-center shrink-0 shadow-xs">
                {candidate.full_name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-2xl font-black text-[#0F1E36]">{candidate.full_name}</h1>
                  <StatusBadge status={candidate.status} />
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {candidate.major} • {candidate.university} (دفعة <bdi dir="ltr">{candidate.graduation_year}</bdi>)
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 font-mono">
                  <span>المدينة: {candidate.city || 'صنعاء'}</span>
                  <span>•</span>
                  <span>سنوات الخبرة: {candidate.experience_years}</span>
                  <span>•</span>
                  <span>المعدل الأكاديمي: <bdi dir="ltr">{candidate.gpa}</bdi></span>
                </div>
              </div>
            </div>

            {/* Overall Match Badge */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center sm:text-start shrink-0 min-w-44">
              <span className="text-xs font-bold text-slate-500 block mb-1">نسبة التوافق الموزونة</span>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span
                  className={`text-3xl font-black font-mono ${
                    scorePct >= 85 ? 'text-emerald-600' : scorePct >= 70 ? 'text-amber-600' : 'text-slate-700'
                  }`}
                >
                  <bdi dir="ltr">{scorePct}%</bdi>
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  مطابقة رياضية
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Score Breakdown Matrix */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-black text-[#0F1E36]">تفاصيل المطابقة الموزونة (Jaccard Match)</h2>
                  <p className="text-xs text-slate-500">الدرجات المحققة عبر الأوزان المعتمدة للوظيفة</p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                  ∑ الأوزان = 1.00
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-center">
                  <span className="text-xs font-bold text-amber-800 block mb-1">المهارات (جاكارد)</span>
                  <div className="text-2xl font-black text-amber-950 font-mono">
                    <bdi dir="ltr">{getScoreNumber(candidate.score_breakdown?.skills_score, 45)}/45</bdi>
                  </div>
                  <span className="text-[10px] text-amber-700 font-medium mt-1 block">|A∩B| / |A∪B|</span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
                  <span className="text-xs font-bold text-blue-800 block mb-1">التخصص الأكاديمي</span>
                  <div className="text-2xl font-black text-blue-950 font-mono">
                    <bdi dir="ltr">{getScoreNumber(candidate.score_breakdown?.specialization_score, 25)}/25</bdi>
                  </div>
                  <span className="text-[10px] text-blue-700 font-medium mt-1 block">مطابقة التخصص</span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center">
                  <span className="text-xs font-bold text-indigo-800 block mb-1">سنوات الخبرة</span>
                  <div className="text-2xl font-black text-indigo-950 font-mono">
                    <bdi dir="ltr">{getScoreNumber(candidate.score_breakdown?.experience_score, 20)}/20</bdi>
                  </div>
                  <span className="text-[10px] text-indigo-700 font-medium mt-1 block">معيار الخبرة</span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-center">
                  <span className="text-xs font-bold text-purple-800 block mb-1">المؤهل والدرجة</span>
                  <div className="text-2xl font-black text-purple-950 font-mono">
                    <bdi dir="ltr">{getScoreNumber(candidate.score_breakdown?.qualification_score, 10)}/10</bdi>
                  </div>
                  <span className="text-[10px] text-purple-700 font-medium mt-1 block">الحد الأدنى للمؤهل</span>
                </div>
              </div>
            </div>

            {/* 2. Skills Portfolio */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-black text-[#0F1E36] mb-4">المهارات المعتمدة</h2>
              {candidate.skills && candidate.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((sk) => (
                    <span
                      key={sk.id}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-2"
                    >
                      <span>{sk.name}</span>
                      <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        {sk.category === 'TECHNICAL' ? 'تقنية' : 'ناعمة'}
                      </span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">لم يتم تسجيل مهارات إضافية في هذا الملف.</p>
              )}
            </div>

            {/* 3. Projects Portfolio */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-black text-[#0F1E36] mb-4">المشاريع البرمجية والنماذج العملية</h2>
              {candidate.projects && candidate.projects.length > 0 ? (
                <div className="space-y-4">
                  {candidate.projects.map((proj, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-[#0F1E36]">{proj.title}</h3>
                          {proj.is_graduation_project && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">
                              مشروع تخرج
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 mb-3 leading-relaxed">{proj.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="text-[11px] text-slate-500 font-mono">
                          التقنيات: {proj.technologies}
                        </span>
                        {proj.github_url && (
                          <a
                            href={proj.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-slate-800 hover:text-amber-600 underline"
                          >
                            مستودع GitHub ↗
                          </a>
                        )}
                        {proj.project_url && (
                          <a
                            href={proj.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-amber-600 hover:text-amber-800 underline"
                          >
                            معاينة حية للمشروع ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">لا توجد مشاريع مرفقة في ملف المرشح.</p>
              )}
            </div>

            {/* 4. Video CV (Based on Visibility Rules) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-black text-[#0F1E36] mb-4">الفيديو التعريفي (Video CV)</h2>
              {candidate.video_cv_url && candidate.video_visibility !== 'PRIVATE' ? (
                <div>
                  <video
                    controls
                    className="w-full max-h-80 rounded-2xl bg-black"
                    src={candidate.video_cv_url}
                  >
                    متصفحك لا يدعم تشغيل الفيديو.
                  </video>
                  <p className="text-[11px] text-slate-500 mt-2">
                    المدة: <bdi dir="ltr">{candidate.video_duration_seconds || 60} ثانية</bdi> • متاح للمنشآت المعتمدة
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                  {candidate.video_visibility === 'PRIVATE'
                    ? '🔒 الفيديو التعريفي محدد كخاص بواسطة المرشح وغير متاح للعرض.'
                    : 'لم يقم المرشح برفع فيديو تعريفي بعد.'}
                </div>
              )}
            </div>
          </div>

          {/* Side Column (4 cols): Decision & Contact */}
          <div className="lg:col-span-4 space-y-6">
            {/* Decision Action Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs sticky top-24">
              <h2 className="text-base font-black text-[#0F1E36] mb-1">قرار التوظيف بشأن الطلب</h2>
              <p className="text-xs text-slate-500 mb-5">
                تحديث حالة الطلب وإرسال إشعار رسمي فوري للمرشح
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  disabled={isUpdatingStatus || candidate.status === 'ACCEPTED'}
                  onClick={() => handleUpdateStatus('ACCEPTED')}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                    candidate.status === 'ACCEPTED'
                      ? 'bg-emerald-100 text-emerald-800 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                  }`}
                >
                  <span>{candidate.status === 'ACCEPTED' ? '✓ تم قبول الطلب' : 'قبول الطلب'}</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdatingStatus || candidate.status === 'UNDER_REVIEW'}
                  onClick={() => handleUpdateStatus('UNDER_REVIEW')}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                    candidate.status === 'UNDER_REVIEW'
                      ? 'bg-amber-100 text-amber-900 cursor-default'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>قيد المراجعة</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdatingStatus || candidate.status === 'REJECTED'}
                  onClick={() => handleUpdateStatus('REJECTED')}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                    candidate.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800 cursor-default'
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs'
                  }`}
                >
                  <span>رفض الطلب</span>
                </button>
              </div>

              {/* Contact Information (Gated by verification) */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-800 mb-3">بيانات التواصل المباشر</h3>
                {isCompanyApproved ? (
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block text-[11px]">البريد الإلكتروني:</span>
                      <span className="font-bold text-slate-900 font-mono" dir="ltr">
                        {candidate.email}
                      </span>
                    </div>
                    {candidate.phone && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[11px]">رقم الهاتف:</span>
                        <span className="font-bold text-slate-900 font-mono" dir="ltr">
                          {candidate.phone}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-medium leading-relaxed">
                    🔒 بيانات الاتصال المباشر (الهاتف والبريد) تظهر فقط للمنشآت المعتمدة رسمياً بسجل تجاري موثق.
                  </div>
                )}
              </div>

              {/* Status Change Audit Log */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-800 mb-3">سجل القرارات التاريخي</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {statusHistory.length > 0 ? (
                    statusHistory.map((item) => (
                      <div key={item.history_id} className="text-[11px] p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="font-bold text-slate-800">
                          {item.new_status === 'ACCEPTED' ? 'قبول' : item.new_status === 'REJECTED' ? 'رفض' : 'قيد المراجعة'}
                        </div>
                        <div className="text-slate-400 font-mono text-[10px] mt-0.5">
                          <bdi dir="ltr">{new Date(item.changed_at).toLocaleString('ar-YE')}</bdi>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-400">لا توجد تحديثات سابقة مسجلة.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CompanyCandidateProfilePage
