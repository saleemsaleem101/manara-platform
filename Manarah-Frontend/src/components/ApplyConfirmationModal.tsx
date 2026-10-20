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
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-[520px] bg-white rounded-[24px] shadow-2xl border border-slate-200 overflow-hidden text-start transition-all duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h3 className="text-[18px] font-black text-[#0F1E36]">تأكيد تقديم طلب التوظيف</h3>
            <p className="text-[12px] text-slate-500 mt-1">
              مراجعة البيانات التي ستُرسل إلى جهة التوظيف
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Job & Company summary card */}
          <div className="p-4 rounded-[16px] bg-[#F8FAFC] border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-[15px] font-black text-[#0F1E36]">{jobTitle}</h4>
              <p className="text-[12px] text-slate-600 font-semibold mt-0.5">{companyName}</p>
            </div>
            {pct !== null && (
              <div className="px-3 py-1.5 rounded-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] font-black font-mono">
                نسبة التوافق: <bdi dir="ltr">{pct}%</bdi>
              </div>
            )}
          </div>

          {/* Included Data Checklist */}
          <div className="space-y-2.5">
            <h5 className="text-[12px] font-black text-[#0F1E36]">
              سيتم إرفاق البيانات التالية تلقائياً من ملفك المهني:
            </h5>

            <div className="space-y-2 text-[12px] text-slate-700 font-medium">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>بياناتك الشخصية والأكاديمية (الجامعة، التخصص، المعدل، سنة التخرج)</span>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>قائمة المهارات المعتمدة ومستويات الإتقان المسجلة</span>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>المشاريع البرمجية ومشاريع التخرج وروابط الاستعراض</span>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>الفيديو التعريفي (وفق مستوى الخصوصية المحدد من قِبلك)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold leading-relaxed">
            ℹ️ تنبيه: لا يمكن تقديم أكثر من طلب لنفس الوظيفة، وستتمكن من تتبع حالة الطلب من صفحة «طلباتي».
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="px-4 py-2.5 rounded-[12px] border border-slate-300 bg-white text-slate-700 text-[12px] font-bold hover:bg-slate-100 transition cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isApplying}
            className="px-5 py-2.5 rounded-[12px] bg-[#0F1E36] hover:bg-[#1E293B] disabled:opacity-60 text-white text-[12px] font-black transition flex items-center gap-2 cursor-pointer shadow-sm"
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
