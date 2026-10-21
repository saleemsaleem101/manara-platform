import React from 'react'

export interface MatchBreakdownData {
  skills_score?: number
  specialization_score?: number
  experience_score?: number
  qualification_score?: number
  final_score?: number
}

export interface MatchWeightsData {
  skills_weight?: number
  specialization_weight?: number
  experience_weight?: number
  qualification_weight?: number
  min_score?: number
}

interface GraduateMatchBreakdownModalProps {
  isOpen: boolean
  onClose: () => void
  jobTitle: string
  companyName: string
  applicationId?: number
  matchScore: number
  status?: string
  scoreBreakdown?: MatchBreakdownData
  weights?: MatchWeightsData
  onViewJobDetails?: () => void
}

export const GraduateMatchBreakdownModal: React.FC<GraduateMatchBreakdownModalProps> = ({
  isOpen,
  onClose,
  jobTitle,
  companyName,
  applicationId,
  matchScore,
  status = 'UNDER_REVIEW',
  scoreBreakdown,
  weights,
  onViewJobDetails,
}) => {
  if (!isOpen) return null

  // Normalization: if score is 0.88 -> 88%
  const normalizedScore = matchScore <= 1.0 ? Math.round(matchScore * 100) : Math.round(matchScore)

  // Default standard weights per platform specifications (Document paragraph 593: 45% / 25% / 20% / 10%)
  const ws = Math.round((weights?.skills_weight ?? 0.45) * 100)
  const wm = Math.round((weights?.specialization_weight ?? 0.25) * 100)
  const we = Math.round((weights?.experience_weight ?? 0.20) * 100)
  const wq = Math.round((weights?.qualification_weight ?? 0.10) * 100)
  const minThreshold = Math.round((weights?.min_score ?? 0.6) * 100)

  // Safe normalization helper (prevents explosion if value is already 0-100 or 0-1)
  const toPercentage = (val: number | undefined, defaultRatio: number) => {
    if (val === undefined || val === null) return Math.round(defaultRatio * 100)
    if (val > 1.0) {
      return Math.min(100, Math.max(0, Math.round(val)))
    }
    return Math.min(100, Math.max(0, Math.round(val * 100)))
  }

  // Normalized criteria scores (0 to 100)
  const sSkills = toPercentage(scoreBreakdown?.skills_score, 0.833)
  const sMajor = toPercentage(scoreBreakdown?.specialization_score, 1.0)
  const sExp = toPercentage(scoreBreakdown?.experience_score, 1.0)
  const sQual = toPercentage(scoreBreakdown?.qualification_score, 1.0)

  // Earned points for each criterion
  const earnedSkills = Math.round((sSkills * ws) / 100 * 10) / 10
  const earnedMajor = Math.round((sMajor * wm) / 100 * 10) / 10
  const earnedExp = Math.round((sExp * we) / 100 * 10) / 10
  const earnedQual = Math.round((sQual * wq) / 100 * 10) / 10

  const isPassing = normalizedScore >= minThreshold

  const statusArabic =
    status === 'ACCEPTED'
      ? 'مقبول'
      : status === 'REJECTED'
      ? 'مرفوض'
      : 'قيد المراجعة'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md font-['Cairo'] text-start animate-fadeIn"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-[#E8DEC8] dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Banner */}
        <div className="bg-[#FAF7F2] dark:bg-slate-950/80 px-6 py-5 rounded-t-3xl border-b border-[#E8DEC8] dark:border-slate-800 flex items-start justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white">
              تفاصيل نتيجة المطابقة مع متطلبات الوظيفة
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 font-medium">
              وظيفة: {jobTitle} • {companyName} {applicationId ? `(طلب التوظيف #${applicationId})` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] dark:bg-slate-800 hover:bg-[#E8DEC8] dark:hover:bg-slate-700 text-[#475569] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white flex items-center justify-center transition cursor-pointer border border-[#E8DEC8] dark:border-slate-700"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* SECTION 1: OVERALL SCORE SUMMARY */}
          <div className="p-5 rounded-2xl bg-[#E0F2FE]/50 dark:bg-sky-950/40 border border-[#BAE6FD] dark:border-sky-500/40 flex flex-col md:flex-row items-center gap-6">
            {/* Score Ring */}
            <div className="shrink-0 flex flex-col items-center justify-center w-28 h-28 rounded-full bg-white dark:bg-slate-900 border-4 border-[#0284C7] dark:border-[#38BDF8] shadow-md shadow-sky-500/20">
              <span className="text-3xl font-black text-[#0284C7] dark:text-[#38BDF8] font-mono">
                <bdi dir="ltr">{normalizedScore}%</bdi>
              </span>
              <span className="text-[11px] font-bold text-[#64748B] dark:text-slate-400">درجة التوافق</span>
            </div>

            {/* Score Details & Multi-Row Formula */}
            <div className="flex-1 space-y-2 w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isPassing
                      ? 'bg-[#E8F8F2] dark:bg-emerald-950/60 text-[#0D6E44] dark:text-[#34D399] border border-[#BDE8D2] dark:border-emerald-500/40'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
                  }`}
                >
                  {isPassing ? 'مستوفٍ لمعايير التوافق والحد الأدنى ✓' : 'أقل من الحد الأدنى المشترط'}
                </span>
                <span className="text-xs text-[#64748B] dark:text-slate-400 font-medium">
                  الحد الأدنى المشترط: <bdi dir="ltr">{minThreshold}%</bdi>
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-xs text-[#64748B] dark:text-slate-400 font-medium">حالة الطلب: {statusArabic}</span>
              </div>

              {/* Formula Badge */}
              <div className="p-3 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-[#BAE6FD] dark:border-slate-700 text-xs shadow-xs space-y-1.5">
                <div className="font-bold text-[#0F172A] dark:text-white">
                  صيغة احتساب التوافق الموزون: <bdi dir="ltr" className="font-mono text-[#0284C7] dark:text-[#38BDF8]">Score = ws·Ss + wm·Sm + we·Se + wq·Sq</bdi>
                </div>
                <div className="text-[#475569] dark:text-slate-300 text-[11px] leading-relaxed">
                  المهارات (<bdi dir="ltr">{ws}%</bdi>) + التخصص الأكاديمي (<bdi dir="ltr">{wm}%</bdi>) + الخبرة (<bdi dir="ltr">{we}%</bdi>) + المؤهل (<bdi dir="ltr">{wq}%</bdi>) ={' '}
                  <span className="text-[#0D6E44] dark:text-[#34D399] font-black font-mono"><bdi dir="ltr">{normalizedScore}%</bdi></span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: 4 MATCHING CRITERIA BREAKDOWN */}
          <div>
            <h4 className="text-sm font-black text-[#0F172A] dark:text-white mb-3">
              تفصيل المعايير الأربعة المعتمدة وفق شروط الوظيفة المعلنة
            </h4>

            <div className="space-y-3">
              {/* Criterion 1: Skills */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/80 border border-[#E8DEC8] dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] dark:bg-sky-950/60 border border-[#BAE6FD] dark:border-sky-500/40 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#0284C7] dark:text-[#38BDF8]" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12,2 22,12 12,22 2,12" opacity="0.8" />
                      <circle cx="12" cy="12" r="3" fill="#ffffff" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                      1. نسبة تشابه المهارات (معامل Jaccard)
                    </h5>
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                      احتساب تشابه المهارات: <bdi dir="ltr">Ss = |A ∩ B| / |A ∪ B|</bdi> لمطابقة المهارات المشتركة مع الاتحاد الكلي
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-[#E8DEC8] dark:border-slate-700 text-center min-w-[120px]">
                    <span className="text-[10px] text-[#64748B] dark:text-slate-400 block font-medium">الوزن: <bdi dir="ltr">{ws}%</bdi></span>
                    <span className="text-xs font-black text-[#0D6E44] dark:text-[#34D399] font-mono">المكتسب: <bdi dir="ltr">{earnedSkills}%</bdi></span>
                  </div>
                  <div className="w-24 text-start">
                    <div className="w-full bg-[#E8DEC8] dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-[#0284C7] to-[#38BDF8] h-2 rounded-full" style={{ width: `${sSkills}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-[#0284C7] dark:text-[#38BDF8] block mt-1 font-mono"><bdi dir="ltr">{sSkills}%</bdi></span>
                  </div>
                </div>
              </div>

              {/* Criterion 2: Major */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/80 border border-[#E8DEC8] dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] dark:bg-sky-950/60 border border-[#BAE6FD] dark:border-sky-500/40 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#0284C7] dark:text-[#38BDF8]" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12,3 22,8 12,13 2,8" />
                      <path d="M5 11v6c0 3 7 5 7 5s7-2 7-5v-6" opacity="0.8" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                      2. ملاءمة التخصص والمجال الدراسي الأكاديمي
                    </h5>
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                      مطابقة المؤهل الجامعي والكلية والقسم مع المجال المطلوب
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-[#E8DEC8] dark:border-slate-700 text-center min-w-[120px]">
                    <span className="text-[10px] text-[#64748B] dark:text-slate-400 block font-medium">الوزن: <bdi dir="ltr">{wm}%</bdi></span>
                    <span className="text-xs font-black text-[#0284C7] dark:text-[#38BDF8] font-mono">المكتسب: <bdi dir="ltr">{earnedMajor}%</bdi></span>
                  </div>
                  <div className="w-24 text-start">
                    <div className="w-full bg-[#E8DEC8] dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-[#0284C7] to-[#38BDF8] h-2 rounded-full" style={{ width: `${sMajor}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-[#0284C7] dark:text-[#38BDF8] block mt-1 font-mono"><bdi dir="ltr">{sMajor}%</bdi></span>
                  </div>
                </div>
              </div>

              {/* Criterion 3: Experience */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/80 border border-[#E8DEC8] dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8DEC8] dark:border-slate-700 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#8C6D53] dark:text-[#FDE68A]" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="14" width="5" height="7" rx="1" />
                      <rect x="9" y="9" width="5" height="12" rx="1" />
                      <rect x="15" y="4" width="5" height="17" rx="1" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                      3. سنوات الخبرة العملية والمشاريع التطبيقية
                    </h5>
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                      تقييم سنوات الخبرة العملية والمشاريع والتدريب الميداني
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-[#E8DEC8] dark:border-slate-700 text-center min-w-[120px]">
                    <span className="text-[10px] text-[#64748B] dark:text-slate-400 block font-medium">الوزن: <bdi dir="ltr">{we}%</bdi></span>
                    <span className="text-xs font-black text-[#8C6D53] dark:text-[#FDE68A] font-mono">المكتسب: <bdi dir="ltr">{earnedExp}%</bdi></span>
                  </div>
                  <div className="w-24 text-start">
                    <div className="w-full bg-[#E8DEC8] dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-[#8C6D53] to-[#D4C3A3] h-2 rounded-full" style={{ width: `${sExp}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-[#8C6D53] dark:text-[#FDE68A] block mt-1 font-mono"><bdi dir="ltr">{sExp}%</bdi></span>
                  </div>
                </div>
              </div>

              {/* Criterion 4: Qualification */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/80 border border-[#E8DEC8] dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F8F2] dark:bg-emerald-950/60 border border-[#BDE8D2] dark:border-emerald-500/40 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#0D6E44] dark:text-[#34D399]" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="10" r="7" />
                      <polygon points="12,17 7,22 9,15" opacity="0.8" />
                      <polygon points="12,17 17,22 15,15" opacity="0.8" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                      4. المؤهل العلمي والدرجة الأكاديمية
                    </h5>
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                      التحقق من الدرجة الأكاديمية والمعدل وسجل التخرج المعتمد
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-[#E8DEC8] dark:border-slate-700 text-center min-w-[120px]">
                    <span className="text-[10px] text-[#64748B] dark:text-slate-400 block font-medium">الوزن: <bdi dir="ltr">{wq}%</bdi></span>
                    <span className="text-xs font-black text-[#0D6E44] dark:text-[#34D399] font-mono">المكتسب: <bdi dir="ltr">{earnedQual}%</bdi></span>
                  </div>
                  <div className="w-24 text-start">
                    <div className="w-full bg-[#E8DEC8] dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-[#10B981] h-2 rounded-full" style={{ width: `${sQual}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-[#0D6E44] dark:text-[#34D399] block mt-1 font-mono"><bdi dir="ltr">{sQual}%</bdi></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-[#E8DEC8] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 hover:bg-[#E8DEC8] dark:hover:bg-slate-700 text-[#475569] dark:text-slate-300 border border-[#E8DEC8] dark:border-slate-700 text-xs font-bold transition cursor-pointer"
              >
                إغلاق النافذة
              </button>
              {onViewJobDetails && (
                <button
                  type="button"
                  onClick={onViewJobDetails}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:brightness-105 text-white text-xs font-black transition cursor-pointer shadow-xs"
                >
                  عرض تفاصيل الوظيفة الكاملة
                </button>
              )}
            </div>

            <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-semibold">
              تم احتساب النتيجة آلياً وفق أوزان الوظيفة
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
