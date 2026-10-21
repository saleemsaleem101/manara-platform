import React, { useState } from 'react'

export interface TargetCompanyData {
  id: number
  company_name: string
  commercial_reg?: string
  industry?: string
  email?: string
  created_at?: string
}

interface AdminCompanyRejectModalProps {
  isOpen: boolean
  onClose: () => void
  company: TargetCompanyData | null
  onConfirmReject: (companyId: number, reason: string) => Promise<void>
  isSubmitting?: boolean
}

export const AdminCompanyRejectModal: React.FC<AdminCompanyRejectModalProps> = ({
  isOpen,
  onClose,
  company,
  onConfirmReject,
  isSubmitting = false,
}) => {
  const [reason, setReason] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen || !company) return null

  const handleConfirm = async () => {
    const trimmed = reason.trim()
    if (!trimmed) {
      setErrorMsg('يرجى إدخال سبب الرفض وملاحظات التوجيه (هذا الحقل إلزامي).')
      return
    }
    if (trimmed.length < 10) {
      setErrorMsg('يرجى تقديم سبب واضح وتفصيلي (10 أحرف على الأقل).')
      return
    }

    setErrorMsg(null)
    await onConfirmReject(company.id, trimmed)
    setReason('')
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('')
      setErrorMsg(null)
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-xs font-['Cairo'] text-start animate-fadeIn"
      dir="rtl"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-[#EAE4D9]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner - Crimson Tone */}
        <div className="bg-[#991B1B] px-6 py-5 rounded-t-3xl text-white flex items-start justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-black">رفض طلب توثيق واعتماد الشركة</h3>
            <p className="text-xs text-rose-200 mt-1 font-medium">
              لوحة الإدارة المركزية • مراجعة وتدقيق بيانات الشركات والمؤسسات
            </p>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-rose-950/70 hover:bg-rose-950 text-rose-200 hover:text-white flex items-center justify-center transition cursor-pointer disabled:opacity-50"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Section 1: Target Company Summary */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex items-start gap-4">
            {/* Custom Corporate Shield Icon */}
            <div className="w-12 h-12 rounded-xl bg-white border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-2xs">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L21 6v6c0 6-9 10-9 10S3 18 3 12V6l9-4z" opacity="0.8" />
                <path d="M12 7l4 4h-3v4h-2v-4H8l4-4z" fill="#ffffff" />
              </svg>
            </div>

            <div className="space-y-1 text-xs">
              <h4 className="font-black text-sm text-[#0F172A]">{company.company_name}</h4>
              <p className="text-slate-600">
                السجل التجاري:{' '}
                <span className="font-mono font-bold text-slate-800">
                  {company.commercial_reg || 'غير مدخل'}
                </span>{' '}
                • القطاع: {company.industry || 'عام'}
              </p>
              {company.email && (
                <p className="text-slate-500 text-[11px]">البريد الإلكتروني للشركة: {company.email}</p>
              )}
            </div>
          </div>

          {/* Section 2: Rejection Reason Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-[#0F172A]">
                سبب الرفض والملاحظات التوجيهية للشركة (إلزامي) *
              </label>
              <span className="text-[11px] text-slate-400 font-mono">{reason.length} / 500 حرف</span>
            </div>

            <p className="text-[11px] text-slate-500">
              يرجى كتابة سبب دقيق ومفصل ليتمكن مسؤولو الشركة من استيفاء المتطلبات وإعادة التقديم.
            </p>

            <textarea
              value={reason}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setReason(e.target.value)
                  if (errorMsg) setErrorMsg(null)
                }
              }}
              rows={4}
              placeholder="مثال: وثيقة السجل التجاري المرفقة غير واضحة أو منتهية الصلاحية. يرجى إعادة رفع نسخة سارية ومختومة..."
              className="w-full p-3.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition leading-relaxed resize-none"
            />

            {errorMsg && <p className="text-xs font-bold text-rose-600">{errorMsg}</p>}

            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 pt-1">
              <span>✓</span>
              <span>سيتم إرسال هذا الإشعار تلقائياً إلى بريد ومسؤولي الشركة</span>
            </div>
          </div>

          {/* Section 3: Warning & Policy Alert */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/90 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 text-sm font-black">
              ⚠
            </div>
            <div className="text-[11px] text-amber-900 leading-relaxed space-y-1">
              <div className="font-bold">التوجيهات والسياسة النظامية لإجراء الرفض:</div>
              <p>
                تنويه: يتم إيقاف صلاحية نشر الوظائف لهذه الشركة، ولن تظهر إعلاناتها للخريجين في المنصة
                إلا بعد قيام مسؤولي الشركة بإعادة تقديم طلب التحقق وموافاة الإدارة بالوثائق السليمة
                واعتمادها.
              </p>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                تراجع وإلغاء
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirm}
                className="px-6 py-2.5 rounded-xl bg-[#DC2626] hover:bg-rose-700 text-white text-xs font-black transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري إرسال القرار...</span>
                  </>
                ) : (
                  <>
                    <span>✕</span>
                    <span>تأكيد رفض الاعتماد وإرسال الإشعار</span>
                  </>
                )}
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              إجراء خاضع لتوثيق وتدقيق إدارة النظام
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
