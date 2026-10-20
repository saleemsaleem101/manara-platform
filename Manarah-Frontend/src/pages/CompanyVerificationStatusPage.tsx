import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { api } from '../services/api'
import { useProfile } from '../context/ProfileContext'
import type { CompanyProfile } from '../types'

export const CompanyVerificationStatusPage: React.FC = () => {
  const { refreshProfile } = useProfile()
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Resubmission State for REJECTED status
  const [resubmitCR, setResubmitCR] = useState('')
  const [resubmitDocUrl, setResubmitDocUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await api.getCompanyProfile()
      setProfile(data)
      setResubmitCR(data.commercial_reg || '')
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      setError(msg || 'فشل جلب بيانات حالة اعتماد المنشأة')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resubmitCR) return

    try {
      setIsSubmitting(true)
      await api.submitCompanyVerification({
        commercial_reg: resubmitCR,
        cr_document_url: resubmitDocUrl || undefined,
      })
      setFeedback({ text: 'تمت إعادة تقديم وثائق السجل التجاري للمراجعة بنجاح ✓', type: 'success' })
      await refreshProfile()
      fetchStatus()
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      setFeedback({ text: msg || 'فشل إعادة إرسال طلب الاعتماد', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ text: 'حجم الوثيقة يتجاوز الحد المسموح به: 5 ميجابايت كحد أقصى.', type: 'error' })
      return
    }

    try {
      setIsSubmitting(true)
      const formData = new FormData()
      formData.append('document', file)
      const res = await api.uploadCRDocument(formData)
      if (res.cr_document_url) {
        setResubmitDocUrl(res.cr_document_url)
        setFeedback({ text: 'تم رفع وثيقة السجل التجاري بنجاح ✓', type: 'success' })
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      setFeedback({ text: msg || 'فشل رفع الوثيقة', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const status = profile?.verification_status || 'PENDING'

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Cairo'] text-start" dir="rtl">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6 flex-1">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-black text-[#0F1E36]">لوحة حالة اعتماد وتوثيق المنشأة</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            متابعة حالة التدقيق الإداري للسجل التجاري وصلاحيات نشر الوظائف
          </p>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-xl text-[13px] font-bold flex items-center justify-between shadow-sm transition ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {isLoading ? (
          <LoadingState message="جاري التحقق من حالة اعتماد المنشأة..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchStatus} />
        ) : (
          <div className="space-y-6">
            {/* ================= STATE 1: APPROVED ================= */}
            {status === 'APPROVED' && (
              <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-emerald-200 shadow-sm space-y-6">
                <div className="flex items-center gap-4 border-b border-emerald-100 pb-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-black shrink-0">
                    ✓
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-[18px] font-black text-[#0F1E36]">
                        تم اعتماد وتوثيق حساب المنشأة بنجاح
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        معتمد رسمي ✓
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      حساب {profile?.company_name || 'المنشأة'} معتمد بكامل الصلاحيات لنشر الشواغر الوظيفية واستقبال طلبات المرشحين.
                    </p>
                  </div>
                </div>

                {/* Company Details Read-Only Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">اسم المنشأة:</span>
                    <span className="font-bold text-[#0F1E36]">{profile?.company_name}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">رقم السجل التجاري:</span>
                    <span className="font-bold text-[#0F1E36] font-mono"><bdi dir="ltr">{profile?.commercial_reg}</bdi></span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">المجال / القطاع:</span>
                    <span className="font-bold text-[#0F1E36]">{profile?.industry || 'تقنية المعلومات'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/company/jobs/new"
                    className="px-6 py-3 rounded-xl bg-[#0F1E36] hover:bg-[#1E293B] text-white text-xs font-black transition flex items-center gap-2 shadow-sm"
                  >
                    <span>نشر شاغر وظيفي جديد</span>
                    <span>←</span>
                  </Link>
                  <Link
                    to="/company/jobs"
                    className="px-5 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                  >
                    إدارة الوظائف الحالية
                  </Link>
                  <Link
                    to="/company/profile"
                    className="px-5 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                  >
                    تعديل ملف المنشأة
                  </Link>
                </div>
              </div>
            )}

            {/* ================= STATE 2: PENDING ================= */}
            {status === 'PENDING' && (
              <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-amber-200 shadow-sm space-y-6">
                <div className="flex items-center gap-4 border-b border-amber-100 pb-5">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl font-black shrink-0">
                    ⏳
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-[18px] font-black text-[#0F1E36]">
                        طلب الاعتماد قيد المراجعة والتدقيق الإداري
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                        قيد التدقيق
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      يجري حالياً مراجعة وتدقيق بيانات السجل التجاري لمنشأة «{profile?.company_name}» من قِبل إدارة منصة منارة.
                    </p>
                  </div>
                </div>

                {/* 5-Stages Tracker */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-[#0F1E36]">مراحل دورة اعتماد المنشأة:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                      <span className="block text-emerald-600 text-base mb-1">✓</span>
                      <span>1. إنشاء الحساب</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                      <span className="block text-emerald-600 text-base mb-1">✓</span>
                      <span>2. تفعيل البريد</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                      <span className="block text-emerald-600 text-base mb-1">✓</span>
                      <span>3. رفع السجل التجاري</span>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-black ring-2 ring-amber-400">
                      <span className="block text-amber-700 text-base mb-1">⏳</span>
                      <span>4. تدقيق الإدارة</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 font-semibold">
                      <span className="block text-slate-400 text-base mb-1">🔒</span>
                      <span>5. نشر الوظائف</span>
                    </div>
                  </div>
                </div>

                {/* Restricted Publishing Notice */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
                  <div className="font-bold text-[#0F1E36]">⚠️ تنبيه الصلاحيات النظامية:</div>
                  <p>
                    نشر الشواغر الوظيفية والاطلاع على بيانات التواصل الخاصة بالمرشحين غير متاح حتى استكمال الاعتماد والتحقق من السجل التجاري. ستتلقى إشعاراً فور انتهاء التدقيق.
                  </p>
                </div>

                {/* Company Details Read-Only Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">رقم السجل التجاري المسجل:</span>
                    <span className="font-bold text-[#0F1E36] font-mono"><bdi dir="ltr">{profile?.commercial_reg || 'غير مدخل'}</bdi></span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">وثيقة السجل التجاري:</span>
                    <span className="font-bold text-slate-700">
                      {profile?.cr_document_url ? 'مرفوعة وبانتظار المراجعة ✓' : 'لم يتم إرفاق ملف'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/company/profile"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                  >
                    <span>استكمال وتعديل ملف المنشأة</span>
                    <span>←</span>
                  </Link>
                </div>
              </div>
            )}

            {/* ================= STATE 3: REJECTED ================= */}
            {status === 'REJECTED' && (
              <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-rose-200 shadow-sm space-y-6">
                <div className="flex items-center gap-4 border-b border-rose-100 pb-5">
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl font-black shrink-0">
                    ✕
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-[18px] font-black text-[#0F1E36]">
                        تم رفض طلب اعتماد السجل التجاري
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                        مرفوض
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      تعذر اعتماد بيانات السجل التجاري. يمكنك تصحيح البيانات وإعادة رفع الوثيقة المطلوبة أدناه.
                    </p>
                  </div>
                </div>

                {/* Rejection Note */}
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 leading-relaxed space-y-1">
                  <div className="font-bold text-rose-950">سبب الرفض المسجل من الإدارة:</div>
                  <p className="font-medium">
                    يرجى التأكد من وضوح صورة السجل التجاري وسريان صلاحيته ومطابقة الاسم التجاري للبيانات المدخلة في المنصة.
                  </p>
                </div>

                {/* Resubmission Form */}
                <form onSubmit={handleResubmit} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <h3 className="text-xs font-black text-[#0F1E36]">
                    إعادة رفع الوثائق وتحديث السجل التجاري
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        رقم السجل التجاري المصحح *
                      </label>
                      <input
                        type="text"
                        required
                        value={resubmitCR}
                        onChange={(e) => setResubmitCR(e.target.value)}
                        placeholder="مثال: 1010203040"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        رفع وثيقة السجل التجاري الجديدة (PDF/صورة)
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={handleFileUpload}
                        className="w-full text-xs text-slate-600 file:ms-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-[#0F1E36] file:text-white hover:file:bg-[#1E293B]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E293B] disabled:opacity-60 text-white text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>جاري الإرسال...</span>
                        </>
                      ) : (
                        <>
                          <span>إعادة تقديم طلب الاعتماد</span>
                          <span>✓</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default CompanyVerificationStatusPage
