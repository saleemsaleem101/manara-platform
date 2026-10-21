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
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] flex flex-col font-sans text-start text-[#0F172A] dark:text-white transition-colors duration-300 selection:bg-[#BAE6FD] selection:text-[#0284C7]" dir="rtl">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6 flex-1">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white">لوحة اعتماد وتوثيق المنشأة</h1>
          <p className="text-xs sm:text-sm text-[#6C4F3D] dark:text-slate-400 mt-1 font-medium">
            متابعة حالة التدقيق الإداري للسجل التجاري وصلاحيات نشر الشواغر الوظيفية
          </p>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-[13px] font-bold flex items-center justify-between shadow-sm transition ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer"
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
              <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm space-y-6">
                <div className="flex items-center gap-4 border-b border-[#E8DEC8] dark:border-slate-800 pb-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-2xl font-black shrink-0 shadow-inner">
                    ✓
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-[18px] sm:text-xl font-black text-[#0F172A] dark:text-white">
                        تم اعتماد وتوثيق حساب المنشأة بنجاح
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-black shadow-xs">
                        معتمد رسمي ✓
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#6C4F3D] dark:text-slate-300 mt-1">
                      حساب {profile?.company_name || 'المنشأة'} معتمد بكامل الصلاحيات لنشر الشواغر واستقبال ترشيحات الكفاءات.
                    </p>
                  </div>
                </div>

                {/* Company Details Read-Only Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700">
                    <span className="text-[#6C4F3D] dark:text-slate-400 block mb-1 font-semibold">اسم المنشأة:</span>
                    <span className="font-black text-[#0F172A] dark:text-white">{profile?.company_name}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700">
                    <span className="text-[#6C4F3D] dark:text-slate-400 block mb-1 font-semibold">رقم السجل التجاري:</span>
                    <span className="font-black text-[#0F172A] dark:text-white font-mono"><bdi dir="ltr">{profile?.commercial_reg}</bdi></span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700">
                    <span className="text-[#6C4F3D] dark:text-slate-400 block mb-1 font-semibold">المجال / القطاع:</span>
                    <span className="font-black text-[#0F172A] dark:text-white">{profile?.industry || 'تقنية المعلومات'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/company/jobs/new"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white text-xs font-black transition flex items-center gap-2 shadow-md hover:shadow-sky-500/20"
                  >
                    <span>نشر شاغر وظيفي جديد</span>
                    <span>←</span>
                  </Link>
                  <Link
                    to="/company/jobs"
                    className="px-5 py-3 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8DEC8] dark:border-slate-700 text-[#0F172A] dark:text-white text-xs font-bold hover:bg-[#E8DEC8]/30 dark:hover:bg-slate-700 transition"
                  >
                    إدارة الوظائف الحالية
                  </Link>
                  <Link
                    to="/company/profile"
                    className="px-5 py-3 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8DEC8] dark:border-slate-700 text-[#0F172A] dark:text-white text-xs font-bold hover:bg-[#E8DEC8]/30 dark:hover:bg-slate-700 transition"
                  >
                    تعديل ملف المنشأة
                  </Link>
                </div>
              </div>
            )}

            {/* ================= STATE 2: PENDING ================= */}
            {status === 'PENDING' && (
              <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-[#BAE6FD] dark:border-sky-900/50 shadow-sm space-y-6">
                <div className="flex items-center gap-4 border-b border-[#E8DEC8] dark:border-slate-800 pb-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#E0F2FE]/70 dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8] border border-[#BAE6FD] dark:border-sky-800 flex items-center justify-center text-2xl font-black shrink-0 shadow-inner">
                    ⏳
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-[18px] sm:text-xl font-black text-[#0F172A] dark:text-white">
                        طلب الاعتماد قيد المراجعة والتدقيق الإداري
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E0F2FE]/70 dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8] border border-[#BAE6FD] dark:border-sky-800 text-[11px] font-black shadow-xs">
                        قيد التدقيق
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#6C4F3D] dark:text-slate-300 mt-1">
                      يجري حالياً مراجعة وتدقيق بيانات السجل التجاري لمنشأة «{profile?.company_name}» من قِبل إدارة المنصة.
                    </p>
                  </div>
                </div>

                {/* 5-Stages Tracker */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-[#0F172A] dark:text-white">مراحل دورة اعتماد المنشأة:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-center text-xs">
                    <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-black">
                      <span className="block text-emerald-600 dark:text-emerald-400 text-base mb-1">✓</span>
                      <span>1. إنشاء الحساب</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-black">
                      <span className="block text-emerald-600 dark:text-emerald-400 text-base mb-1">✓</span>
                      <span>2. تفعيل البريد</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-black">
                      <span className="block text-emerald-600 dark:text-emerald-400 text-base mb-1">✓</span>
                      <span>3. رفع السجل التجاري</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#E0F2FE]/70 dark:bg-sky-950/60 border border-[#0284C7] dark:border-[#38BDF8] text-[#0284C7] dark:text-[#38BDF8] font-black ring-2 ring-[#BAE6FD] dark:ring-sky-800">
                      <span className="block text-[#0284C7] dark:text-[#38BDF8] text-base mb-1">⏳</span>
                      <span>4. تدقيق الإدارة</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700 text-[#6C4F3D] dark:text-slate-500 font-bold">
                      <span className="block text-[#6C4F3D] dark:text-slate-500 text-base mb-1">🔒</span>
                      <span>5. نشر الوظائف</span>
                    </div>
                  </div>
                </div>

                {/* Restricted Publishing Notice */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700 text-xs text-[#6C4F3D] dark:text-slate-300 leading-relaxed space-y-1">
                  <div className="font-black text-[#0F172A] dark:text-white flex items-center gap-1.5">
                    <span className="text-[#0284C7] dark:text-[#38BDF8]">ℹ️</span>
                    <span>تنبيه الصلاحيات التشغيلية:</span>
                  </div>
                  <p>
                    نشر الشواغر الوظيفية والاطلاع على بيانات التواصل الخاصة بالمرشحين غير متاح حتى استكمال الاعتماد والتحقق من السجل التجاري. ستتلقى إشعاراً فور انتهاء التدقيق.
                  </p>
                </div>

                {/* Company Details Read-Only Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700">
                    <span className="text-[#6C4F3D] dark:text-slate-400 block mb-1 font-semibold">رقم السجل التجاري المسجل:</span>
                    <span className="font-black text-[#0F172A] dark:text-white font-mono"><bdi dir="ltr">{profile?.commercial_reg || 'غير مدخل'}</bdi></span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700">
                    <span className="text-[#6C4F3D] dark:text-slate-400 block mb-1 font-semibold">وثيقة السجل التجاري:</span>
                    <span className="font-black text-[#0284C7] dark:text-[#38BDF8]">
                      {profile?.cr_document_url ? 'مرفوعة وبانتظار المراجعة ✓' : 'لم يتم إرفاق ملف'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/company/profile"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8DEC8] dark:border-slate-700 text-[#0F172A] dark:text-white text-xs font-bold hover:bg-[#E8DEC8]/30 dark:hover:bg-slate-700 transition"
                  >
                    <span>استكمال وتعديل ملف المنشأة</span>
                    <span>←</span>
                  </Link>
                </div>
              </div>
            )}

            {/* ================= STATE 3: REJECTED ================= */}
            {status === 'REJECTED' && (
              <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-rose-200 dark:border-rose-900/50 shadow-sm space-y-6">
                <div className="flex items-center gap-4 border-b border-rose-100 dark:border-rose-950 pb-5">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-2xl font-black shrink-0 shadow-inner">
                    ✕
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-[18px] sm:text-xl font-black text-[#0F172A] dark:text-white">
                        تم رفض طلب اعتماد السجل التجاري
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-bold shadow-xs">
                        مرفوض
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#6C4F3D] dark:text-slate-300 mt-1">
                      تعذر اعتماد بيانات السجل التجاري. يمكنك تصحيح البيانات وإعادة رفع الوثيقة المطلوبة أدناه.
                    </p>
                  </div>
                </div>

                {/* Rejection Note */}
                <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-200 leading-relaxed space-y-1">
                  <div className="font-bold text-rose-950 dark:text-rose-100">سبب الرفض المسجل من الإدارة:</div>
                  <p className="font-medium">
                    يرجى التأكد من وضوح صورة السجل التجاري وسريان مفعوله ومطابقة الاسم التجاري للبيانات المدخلة في المنصة.
                  </p>
                </div>

                {/* Resubmission Form */}
                <form onSubmit={handleResubmit} className="p-5 sm:p-6 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700 space-y-4">
                  <h3 className="text-xs sm:text-sm font-black text-[#0F172A] dark:text-white">
                    إعادة رفع الوثائق وتحديث السجل التجاري
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-1.5">
                        رقم السجل التجاري المصحح *
                      </label>
                      <input
                        type="text"
                        required
                        value={resubmitCR}
                        onChange={(e) => setResubmitCR(e.target.value)}
                        placeholder=""
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] transition shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-1.5">
                        رفع وثيقة السجل التجاري الجديدة (PDF/صورة)
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={handleFileUpload}
                        className="w-full text-xs text-[#6C4F3D] dark:text-slate-400 file:ms-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-black file:bg-[#0284C7] dark:file:bg-[#0284C7] file:text-white hover:file:bg-[#0369A1] transition cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] disabled:opacity-60 text-white text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md hover:shadow-sky-500/20"
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
