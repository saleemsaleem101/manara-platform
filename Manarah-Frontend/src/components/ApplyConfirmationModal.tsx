import React from 'react'

interface ApplyConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  jobTitle: string
  companyName: string
  matchScore?: number
  isApplying?: boolean
}

export const ApplyConfirmationModal: React.FC<ApplyConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  jobTitle,
  companyName,
  matchScore,
  isApplying = false,
}) => {
  if (!isOpen) return null

  const pct = matchScore !== undefined && matchScore !== null ? Math.round(matchScore * 100) : null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 font-['Cairo'] text-start animate-fadeIn" dir="rtl">
      <div className="w-full max-w-[520px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-[#E8DEC8] dark:border-slate-800 overflow-hidden text-start transition-all duration-150">
        {/* Header */}
        <div className="p-6 border-b border-[#E8DEC8] dark:border-slate-800 bg-[#FAF7F2] dark:bg-slate-950/80 flex items-start justify-between">
          <div>
            <h3 className="text-[18px] font-black text-[#0F172A] dark:text-white">تأكيد تقديم طلب التوظيف</h3>
            <p className="text-[12px] text-[#64748B] dark:text-slate-400 mt-1">
              مراجعة البيانات التي ستُرسل إلى جهة التوظيف
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] dark:bg-slate-800 hover:bg-[#E8DEC8] dark:hover:bg-slate-700 flex items-center justify-center text-[#475569] dark:text-slate-300 font-bold transition cursor-pointer border border-[#E8DEC8] dark:border-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Job & Company summary card */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800/80 border border-[#E8DEC8] dark:border-slate-700 flex items-center justify-between">
            <div>
              <h4 className="text-[15px] font-black text-[#0F172A] dark:text-white">{jobTitle}</h4>
              <p className="text-[12px] text-[#475569] dark:text-slate-300 font-semibold mt-0.5">{companyName}</p>
            </div>
            {pct !== null && (
              <div className="px-3 py-1.5 rounded-xl bg-[#E8F8F2] dark:bg-emerald-950/60 border border-[#BDE8D2] dark:border-emerald-500/40 text-[#0D6E44] dark:text-[#34D399] text-[12px] font-black font-mono">
                نسبة التوافق: <bdi dir="ltr">{pct}%</bdi>
              </div>
            )}
          </div>

          {/* Included Data Checklist */}
          <div className="space-y-2.5">
            <h5 className="text-[12px] font-black text-[#0F172A] dark:text-white">
              سيتم إرفاق البيانات التالية تلقائياً من ملفك المهني:
            </h5>

            <div className="space-y-2 text-[12px] text-[#475569] dark:text-slate-300 font-medium">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700">
                <span className="text-[#0D6E44] dark:text-[#34D399] font-bold">✓</span>
                <span>بياناتك الشخصية والأكاديمية (الجامعة، التخصص، المعدل، سنة التخرج)</span>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700">
                <span className="text-[#0D6E44] dark:text-[#34D399] font-bold">✓</span>
                <span>قائمة المهارات المعتمدة ومستويات الإتقان المسجلة</span>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700">
                <span className="text-[#0D6E44] dark:text-[#34D399] font-bold">✓</span>
                <span>المشاريع البرمجية ومشاريع التخرج وروابط الاستعراض</span>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700">
                <span className="text-[#0D6E44] dark:text-[#34D399] font-bold">✓</span>
                <span>الفيديو التعريفي (وفق مستوى الخصوصية المحدد من قِبلك)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#E0F2FE]/50 dark:bg-sky-950/40 border border-[#BAE6FD] dark:border-sky-500/40 text-[#0284C7] dark:text-[#38BDF8] text-[11px] font-semibold leading-relaxed">
            ℹ️ تنبيه: لا يمكن تقديم أكثر من طلب لنفس الوظيفة، وستتمكن من تتبع حالة الطلب من صفحة «طلباتي».
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-[#FAF7F2] dark:bg-slate-950/80 border-t border-[#E8DEC8] dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#475569] dark:text-slate-300 text-[12px] font-bold hover:bg-[#FAF7F2] dark:hover:bg-slate-700 transition cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isApplying}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:brightness-105 disabled:opacity-60 text-white text-[12px] font-black transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            {isApplying ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري الإرسال...</span>
              </>
            ) : (
              <>
                <span>تأكيد وإرسال طلب التوظيف</span>
                <span>✓</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
