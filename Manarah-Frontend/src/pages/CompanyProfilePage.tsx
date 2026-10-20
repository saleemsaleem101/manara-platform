import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { api } from '../services/api'
import type { CompanyProfile } from '../types'

export const CompanyProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const [form, setForm] = useState({
    company_name: '',
    industry: '',
    location: '',
    website: '',
    user_phone: '',
    user_email: '',
    description: '',
  })

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await api.getCompanyProfile()
      setProfile(data)
      setForm({
        company_name: data.company_name || '',
        industry: data.industry || '',
        location: data.location || '',
        website: data.website || '',
        user_phone: data.user_phone || '',
        user_email: data.user_email || '',
        description: data.description || '',
      })
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      setError(msg || 'فشل تحميل بيانات ملف المنشأة')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      setFeedback(null)
      await api.updateCompanyProfile(form)
      setFeedback({ text: 'تم حفظ وتحديث بيانات ملف المنشأة بنجاح ✓', type: 'success' })
      fetchProfile()
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      setFeedback({ text: msg || 'فشل حفظ التعديلات', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Cairo'] text-start" dir="rtl">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6 flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#0F1E36]">ملف المنشأة والبيانات التعريفية</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              إدارة المعلومات الرسمية للمنشأة، بيانات الاتصال، والسجل التجاري المعتمد
            </p>
          </div>
          <Link
            to="/company/status"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F1E36] text-xs font-bold transition self-start sm:self-auto"
          >
            <span>عرض حالة الاعتماد</span>
            <span>←</span>
          </Link>
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
          <LoadingState message="جاري استرجاع بيانات المنشأة..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchProfile} />
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Read-Only Legal CR Card (Screen 16 Requirement) */}
            <div className="bg-white rounded-[22px] p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h2 className="text-[15px] font-black text-[#0F1E36]">
                    بيانات السجل التجاري والتوثيق الرسمي (للقراءة فقط) 🔒
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                  {profile?.verification_status === 'APPROVED'
                    ? 'سجل معتمد رسمياً ✓'
                    : profile?.verification_status === 'PENDING'
                    ? 'قيد التدقيق الإداري ⏳'
                    : 'يتطلب التصحيح ⚠️'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-bold block mb-1">
                    رقم السجل التجاري المعتمد:
                  </span>
                  <span className="text-[13px] font-bold text-[#0F1E36] font-mono">
                    <bdi dir="ltr">{profile?.commercial_reg || '—'}</bdi>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-bold block mb-1">
                      وثيقة السجل التجاري:
                    </span>
                    <span className="text-[12px] font-semibold text-slate-700">
                      {profile?.cr_document_url ? 'مستند مرفق ومحمي' : 'غير متوفر'}
                    </span>
                  </div>
                  {profile?.cr_document_url && (
                    <a
                      href={profile.cr_document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-[#1D4ED8] hover:underline"
                    >
                      معاينة الوثيقة ↗
                    </a>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                لتعديل رقم السجل التجاري أو رفع مستند جديد، يرجى التوجه إلى صفحة «حالة اعتماد المنشأة».
              </p>
            </div>

            {/* Editable Profile Information */}
            <div className="bg-white rounded-[22px] p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F1E36]" />
                <h2 className="text-[15px] font-black text-[#0F1E36]">
                  بيانات المنشأة والتواصل
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Company Name */}
                <div>
                  <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                    اسم المنشأة الرسمي *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-[13px] font-bold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                    مجال العمل والنشاط *
                  </label>
                  <select
                    required
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-[13px] font-bold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                  >
                    <option value="">اختر مجال العمل</option>
                    <option value="تقنية المعلومات والبرمجيات">تقنية المعلومات والبرمجيات</option>
                    <option value="الاتصالات والشبكات">الاتصالات والشبكات</option>
                    <option value="الخدمات المالية والمصرفية">الخدمات المالية والمصرفية</option>
                    <option value="التجارة الإلكترونية واللوجستيات">التجارة الإلكترونية واللوجستيات</option>
                    <option value="التسويق والإعلام الرقمي">التسويق والإعلام الرقمي</option>
                    <option value="التعليم والتدريب">التعليم والتدريب</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                    المدينة والمقر الرئيسي *
                  </label>
                  <select
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-[13px] font-bold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                  >
                    <option value="">اختر المدينة</option>
                    <option value="صنعاء">صنعاء</option>
                    <option value="عدن">عدن</option>
                    <option value="تعز">تعز</option>
                    <option value="حضرموت (المكلا)">حضرموت (المكلا)</option>
                    <option value="الحديدة">الحديدة</option>
                    <option value="إب">إب</option>
                    <option value="مأرب">مأرب</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                    الموقع الإلكتروني (اختياري)
                  </label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-[13px] font-semibold text-[#0F1E36] font-mono focus:outline-none focus:border-amber-500 focus:bg-white transition"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                    رقم هاتف المنشأة / التواصل *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.user_phone}
                    onChange={(e) => setForm({ ...form, user_phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-[13px] font-bold text-[#0F1E36] font-mono focus:outline-none focus:border-amber-500 focus:bg-white transition"
                  />
                </div>

                {/* Email (Readonly) */}
                <div>
                  <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                    البريد الإلكتروني المعتمد 🔒
                  </label>
                  <input
                    type="email"
                    disabled
                    value={form.user_email}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-[13px] font-semibold text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                  نبذة تعريفية عن المنشأة وأنشطتها *
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="اكتب نبذة مختصرة عن رؤية المنشأة وفرص النمو وبيئة العمل..."
                  className="w-full p-4 rounded-xl border border-slate-300 bg-slate-50 text-[13px] text-[#0F1E36] leading-relaxed focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 pb-6">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-[#0F1E36] hover:bg-[#1E293B] disabled:opacity-60 text-white text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-sm active:scale-[0.99]"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري حفظ التعديلات...</span>
                  </>
                ) : (
                  <>
                    <span>حفظ بيانات المنشأة</span>
                    <span>✓</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}

export default CompanyProfilePage
