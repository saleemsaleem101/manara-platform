import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { StatusBadge } from '../components/StatusBadge'
import { api } from '../services/api'
import type { CandidateProfile, ApplicationStatusHistoryItem } from '../types'

export const CompanyCandidateProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const applicationId = Number(id)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null)
  const [statusHistory, setStatusHistory] = useState<ApplicationStatusHistoryItem[]>([])
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    async function loadCandidateData() {
      try {
        setIsLoading(true)
        setError(null)

        // 1. Candidate Application Profile
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
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] text-[#0F172A] dark:text-white transition-colors duration-300" dir="rtl">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-20">
          <LoadingState message="جاري استرجاع ملف المرشح وتفاصيل التوافق الموزونة..." />
        </div>
      </div>
    )
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] text-[#0F172A] dark:text-white transition-colors duration-300" dir="rtl">
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

  const rawScore = candidate.match_score || 0
  const scorePct = rawScore <= 1.0 ? Math.round(rawScore * 100) : Math.round(rawScore)

  const getScoreNumber = (val?: number, max: number = 45) => {
    if (val === undefined || val === null) return '0'
    const res = (val <= 1.0 ? val * max : val).toFixed(1)
    return res.endsWith('.0') ? res.slice(0, -2) : res
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] text-[#0F172A] dark:text-white font-sans transition-colors duration-300 selection:bg-[#BAE6FD] selection:text-[#0284C7]" dir="rtl">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#6C4F3D] dark:text-slate-400 mb-6 font-medium">
          <Link to="/company/jobs" className="hover:text-[#0284C7] dark:hover:text-[#38BDF8] transition">
            وظائفي
          </Link>
          <span>/</span>
          <Link to="/company/applicants" className="hover:text-[#0284C7] dark:hover:text-[#38BDF8] transition">
            المتقدمون
          </Link>
          <span>/</span>
          <span className="text-[#0284C7] dark:text-[#38BDF8] font-bold">ملف المرشح #{applicationId}</span>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-sm font-bold shadow-sm ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
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

        {/* Top Header Card */}
        <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white text-xl font-black flex items-center justify-center shrink-0 shadow-md">
                {candidate.full_name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-2xl font-black text-[#0F172A] dark:text-white">{candidate.full_name}</h1>
                  <StatusBadge status={candidate.status} />
                </div>
                <p className="text-xs text-[#6C4F3D] dark:text-slate-400 font-medium">
                  {candidate.major} • {candidate.university} (دفعة <bdi dir="ltr">{candidate.graduation_year}</bdi>)
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#6C4F3D] dark:text-slate-400 mt-2 font-mono">
                  <span>المدينة: {candidate.city || 'صنعاء'}</span>
                  <span>•</span>
                  <span>سنوات الخبرة: {candidate.experience_years}</span>
                  <span>•</span>
                  <span>المعدل الأكاديمي: <bdi dir="ltr">{candidate.gpa}</bdi></span>
                </div>
              </div>
            </div>

            {/* Overall Match Badge */}
            <div className="bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700 rounded-2xl p-4 text-center sm:text-start shrink-0 min-w-44">
              <span className="text-xs font-bold text-[#6C4F3D] dark:text-slate-400 block mb-1">نسبة التوافق الموزونة</span>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span
                  className={`text-3xl font-black font-mono ${
                    scorePct >= 85
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : scorePct >= 70
                      ? 'text-[#0284C7] dark:text-[#38BDF8]'
                      : 'text-[#6C4F3D] dark:text-slate-300'
                  }`}
                >
                  <bdi dir="ltr">{scorePct}%</bdi>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#E0F2FE]/70 dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8] border border-[#BAE6FD] dark:border-sky-800 font-black">
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
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E8DEC8] dark:border-slate-800 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-black text-[#0F172A] dark:text-white">تفاصيل المطابقة الموزونة (Jaccard Match)</h2>
                  <p className="text-xs text-[#6C4F3D] dark:text-slate-400">الدرجات المحققة عبر الأوزان المعتمدة للوظيفة</p>
                </div>
                <span className="text-xs font-mono font-black text-[#0284C7] dark:text-[#38BDF8] bg-[#E0F2FE]/70 dark:bg-sky-950/60 border border-[#BAE6FD] dark:border-sky-800 px-2.5 py-1 rounded-xl">
                  ∑ الأوزان = 1.00
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-center">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block mb-1">المهارات (جاكارد)</span>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                    <bdi dir="ltr">{getScoreNumber(candidate.score_breakdown?.skills_score, 45)}/45</bdi>
                  </div>
                  <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 font-medium mt-1 block">|A∩B| / |A∪B|</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#E0F2FE]/60 dark:bg-sky-950/40 border border-[#BAE6FD] dark:border-sky-800 text-center">
                  <span className="text-xs font-bold text-[#0284C7] dark:text-[#38BDF8] block mb-1">التخصص الأكاديمي</span>
                  <div className="text-2xl font-black text-[#0284C7] dark:text-[#38BDF8] font-mono">
                    <bdi dir="ltr">{getScoreNumber(candidate.score_breakdown?.specialization_score, 25)}/25</bdi>
                  </div>
                  <span className="text-[10px] text-[#0284C7]/80 dark:text-[#38BDF8]/80 font-medium mt-1 block">مطابقة التخصص</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700 text-center">
                  <span className="text-xs font-bold text-[#6C4F3D] dark:text-slate-400 block mb-1">سنوات الخبرة</span>
                  <div className="text-2xl font-black text-[#0F172A] dark:text-white font-mono">
                    <bdi dir="ltr">{getScoreNumber(candidate.score_breakdown?.experience_score, 20)}/20</bdi>
                  </div>
                  <span className="text-[10px] text-[#6C4F3D] dark:text-slate-400 font-medium mt-1 block">معيار الخبرة</span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-center">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block mb-1">المؤهل والدرجة</span>
                  <div className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono">
                    <bdi dir="ltr">{getScoreNumber(candidate.score_breakdown?.qualification_score, 10)}/10</bdi>
                  </div>
                  <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 font-medium mt-1 block">الحد الأدنى للمؤهل</span>
                </div>
              </div>
            </div>

            {/* 2. Skills Portfolio */}
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-black text-[#0F172A] dark:text-white mb-4">المهارات المعتمدة</h2>
              {candidate.skills && candidate.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((sk) => (
                    <span
                      key={sk.id}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAF7F2] dark:bg-slate-800/80 border border-[#E8DEC8] dark:border-slate-700 text-[#0F172A] dark:text-white flex items-center gap-2 shadow-xs"
                    >
                      <span>{sk.name}</span>
                      <span className="text-[10px] text-[#0284C7] dark:text-[#38BDF8] bg-[#E0F2FE]/70 dark:bg-sky-950/60 px-1.5 py-0.5 rounded-md font-bold">
                        {sk.category === 'TECHNICAL' ? 'تقنية' : 'ناعمة'}
                      </span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6C4F3D] dark:text-slate-400">لم يتم تسجيل مهارات إضافية في هذا الملف.</p>
              )}
            </div>

            {/* 3. Projects Portfolio */}
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-black text-[#0F172A] dark:text-white mb-4">المشاريع البرمجية والنماذج العملية</h2>
              {candidate.projects && candidate.projects.length > 0 ? (
                <div className="space-y-4">
                  {candidate.projects.map((proj, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700/80">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-[#0F172A] dark:text-white">{proj.title}</h3>
                          {proj.is_graduation_project && (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-black flex items-center gap-1">
                              <span>🎓</span>
                              <span>مشروع تخرج نوعي موثق</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-[#6C4F3D] dark:text-slate-300 mb-3 leading-relaxed">{proj.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="text-[11px] text-[#6C4F3D] dark:text-slate-400 font-mono">
                          التقنيات: {proj.technologies}
                        </span>
                        {proj.github_url && (
                          <a
                            href={proj.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-[#0284C7] dark:text-[#38BDF8] hover:underline flex items-center gap-1"
                          >
                            <span>💻</span>
                            <span>مستودع GitHub ↗</span>
                          </a>
                        )}
                        {proj.project_url && (
                          <a
                            href={proj.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            معاينة حية للمشروع ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6C4F3D] dark:text-slate-400">لا توجد مشاريع مرفقة في ملف المرشح.</p>
              )}
            </div>

            {/* 4. Video CV */}
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-black text-[#0F172A] dark:text-white mb-4">الفيديو التعريفي (Video CV)</h2>
              {candidate.video_cv_url && candidate.video_visibility !== 'PRIVATE' ? (
                <div>
                  <video
                    controls
                    className="w-full max-h-80 rounded-2xl bg-black shadow-inner"
                    src={candidate.video_cv_url}
                  >
                    متصفحك لا يدعم تشغيل الفيديو.
                  </video>
                  <p className="text-[11px] text-[#6C4F3D] dark:text-slate-400 mt-2">
                    المدة: <bdi dir="ltr">{candidate.video_duration_seconds || 60} ثانية</bdi> • متاح للمنشآت المعتمدة
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700 text-xs text-[#6C4F3D] dark:text-slate-400">
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
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-6 shadow-sm sticky top-24">
              <h2 className="text-base font-black text-[#0F172A] dark:text-white mb-1">قرار التوظيف بشأن الطلب</h2>
              <p className="text-xs text-[#6C4F3D] dark:text-slate-400 mb-5">
                تحديث حالة الطلب وإرسال إشعار رسمي فوري للمرشح
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  disabled={isUpdatingStatus || candidate.status === 'ACCEPTED'}
                  onClick={() => handleUpdateStatus('ACCEPTED')}
                  className={`w-full py-3 px-4 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                    candidate.status === 'ACCEPTED'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-default'
                      : 'bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white shadow-md hover:shadow-sky-500/20'
                  }`}
                >
                  <span>{candidate.status === 'ACCEPTED' ? '✓ تم قبول الطلب (التواصل مفتوح)' : 'قبول الطلب'}</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdatingStatus || candidate.status === 'UNDER_REVIEW'}
                  onClick={() => handleUpdateStatus('UNDER_REVIEW')}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                    candidate.status === 'UNDER_REVIEW'
                      ? 'bg-[#E0F2FE]/70 dark:bg-sky-950/50 text-[#0284C7] dark:text-[#38BDF8] border border-[#BAE6FD] dark:border-sky-800 cursor-default'
                      : 'bg-[#FAF7F2] dark:bg-slate-800 hover:bg-[#E8DEC8]/30 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white border border-[#E8DEC8] dark:border-slate-700'
                  }`}
                >
                  <span>قيد المراجعة</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdatingStatus || candidate.status === 'REJECTED'}
                  onClick={() => handleUpdateStatus('REJECTED')}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                    candidate.status === 'REJECTED'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 cursor-default'
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                  }`}
                >
                  <span>رفض الطلب</span>
                </button>
              </div>

              {/* Contact Information (Gated by acceptance status) */}
              <div className="mt-6 pt-6 border-t border-[#E8DEC8] dark:border-slate-800">
                <h3 className="text-xs font-black text-[#0F172A] dark:text-white mb-3">بيانات التواصل المباشر</h3>
                {candidate.status === 'ACCEPTED' ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">قناة التواصل مفتوحة وموثقة:</span>
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">مقبول ✓</span>
                      </div>
                      <div className="space-y-2 mt-2">
                        {candidate.phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-[#6C4F3D] dark:text-slate-400 font-medium">رقم الهاتف / واتساب:</span>
                            <span className="font-bold text-[#0F172A] dark:text-white font-mono" dir="ltr">{candidate.phone}</span>
                          </div>
                        )}
                        {candidate.email && (
                          <div className="flex items-center justify-between">
                            <span className="text-[#6C4F3D] dark:text-slate-400 font-medium">البريد المهني:</span>
                            <span className="font-bold text-[#0F172A] dark:text-white font-mono" dir="ltr">{candidate.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-emerald-200/60 dark:border-emerald-850">
                        {candidate.phone && (
                          <a
                            href={`https://wa.me/${candidate.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-center transition flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <span>مراسلة واتساب</span>
                          </a>
                        )}
                        {candidate.email && (
                          <a
                            href={`mailto:${candidate.email}`}
                            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] hover:from-[#0369A1] hover:to-[#0284C7] text-white font-bold text-center transition flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <span>إرسال بريد</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700 text-xs leading-relaxed text-[#6C4F3D] dark:text-slate-300">
                    <div className="flex items-center gap-1.5 font-bold text-[#0F172A] dark:text-white mb-1.5">
                      <span>🔒</span>
                      <span>بيانات التواصل محمية</span>
                    </div>
                    <p className="text-[11px]">
                      تظهر بيانات الاتصال المباشر (رقم الواتساب، الهاتف، والبريد المهني) للمنشأة فقط عند قبول الطلب وتحديد موعد المقابلة، حمايةً لخصوصية المرشح وتنظيماً لعملية التوظيف.
                    </p>
                  </div>
                )}
              </div>

              {/* Status Change Audit Log */}
              <div className="mt-6 pt-6 border-t border-[#E8DEC8] dark:border-slate-800">
                <h3 className="text-xs font-black text-[#0F172A] dark:text-white mb-3">سجل القرارات التاريخي</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {statusHistory.length > 0 ? (
                    statusHistory.map((item) => (
                      <div key={item.history_id} className="text-[11px] p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700">
                        <div className="font-bold text-[#0F172A] dark:text-white">
                          {item.new_status === 'ACCEPTED' ? 'قبول' : item.new_status === 'REJECTED' ? 'رفض' : 'قيد المراجعة'}
                        </div>
                        <div className="text-[#6C4F3D] dark:text-slate-400 font-mono text-[10px] mt-0.5">
                          <bdi dir="ltr">{new Date(item.changed_at).toLocaleString('ar-YE')}</bdi>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-[11px] text-[#6C4F3D] dark:text-slate-400">لا توجد تحديثات سابقة مسجلة.</span>
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
