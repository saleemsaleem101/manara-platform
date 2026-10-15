import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { useProfile } from '../context/ProfileContext'

export const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate()
  const { profile, updateProfile } = useProfile()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    city: profile.city || 'اليمن - صنعاء',
    university: profile.university || 'جامعة العلوم والتكنولوجيا',
    major: profile.major || 'هندسة البرمجيات',
    graduationYear: profile.graduationYear || 2026,
    gpa: profile.gpa || '92% (ممتاز مع مرتبة الشرف)',
    experienceYears: profile.experienceYears || 'حديث التخرج (0 - 1 سنة)',
    bio:
      profile.bio ||
      'مهندس برمجيات خريج جامعة العلوم والتكنولوجيا لعام 2026 بمعدل ممتاز (92%). متخصص في بناء وتطوير تطبيقات الويب الحديثة وحلول الأعمال الرقمية، أمتلك شغفاً كبيراً بالابتكار البرمجي والعمل الجماعي ضمن بيئات تقنية رائدة تسعى لتمكين الشباب وإحداث أثر حقيقي في سوق العمل. أجيد تحليل متطلبات الأنظمة، هندسة قواعد البيانات، وتطوير الواجهات المعتمدة على أحدث المعايير البرمجية.',
  })

  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const wordCount = form.bio.trim() ? form.bio.trim().split(/\s+/).length : 0

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      await updateProfile(form)
      setSavedSuccess(true)
      timeoutRef.current = setTimeout(() => {
        navigate('/profile')
      }, 800)
    } catch (err: unknown) {
      const errorObj = err as { message?: string } | undefined
      setError(errorObj?.message || 'فشل حفظ وتحديث البيانات الأساسية للخريج.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navbar />

      <main className="max-w-[1120px] mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Saved Success Toast */}
        {savedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <span>✓ تم حفظ وتحديث بيانات الملف المهني بنجاح! جاري تحويلك...</span>
          </div>
        )}

        {/* Error Banner (MNRA-68) */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* ================= TOP ACTION BAR ================= */}
          <div className="bg-white border border-[#E2E8F0] p-6 sm:p-7 rounded-[20px] shadow-[0_4px_12px_rgba(15,30,54,0.05)] text-center">
            <h1 className="text-[18px] sm:text-[20px] font-black text-[#0F1E36]">
              تعديل واستكمال البيانات الأساسية للخريج
            </h1>
            <p className="text-[12px] sm:text-[13px] text-[#64748B] mt-1.5">
              قم بتحديث وتدقيق بياناتك الشخصية والأكاديمية ونبذتك المهنية لزيادة فرص مطابقتك مع الوظائف
            </p>
          </div>

          {/* ================= SECTION 1: PERSONAL DETAILS ================= */}
          <div className="bg-white border border-[#E2E8F0] rounded-[22px] p-6 sm:p-8 shadow-[0_4px_12px_rgba(15,30,54,0.05)] space-y-5">
            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F1E36]" />
              <h2 className="text-[15px] font-black text-[#0F1E36]">
                1. البيانات الشخصية ومعلومات الاتصال
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                  الاسم الكامل (رباعي) *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-bold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>

              {/* Email (Readonly) */}
              <div className="text-start">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-bold text-[#0F1E36]">البريد الإلكتروني</label>
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">
                    حساب موثق
                  </span>
                </div>
                <input
                  type="email"
                  disabled
                  value={form.email}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#E2E8F0] bg-slate-50 text-[13px] font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                  رقم الهاتف / واتساب
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+967 770 000 000"
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-bold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>

              {/* City */}
              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                  المدينة والإقامة الحالية
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="صنعاء، اليمن"
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-bold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* ================= SECTION 2: ACADEMIC DETAILS ================= */}
          <div className="bg-white border border-[#E2E8F0] rounded-[22px] p-6 sm:p-8 shadow-[0_4px_12px_rgba(15,30,54,0.05)] space-y-5">
            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <h2 className="text-[15px] font-black text-[#0F1E36]">
                2. المؤهل الأكاديمي والجامعة
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* University */}
              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">الجامعة *</label>
                <input
                  type="text"
                  required
                  value={form.university}
                  onChange={(e) => setForm({ ...form, university: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-bold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>

              {/* Major */}
              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">التخصص الأكاديمي *</label>
                <input
                  type="text"
                  required
                  value={form.major}
                  onChange={(e) => setForm({ ...form, major: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-bold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>

              {/* Graduation Year */}
              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">سنة التخرج *</label>
                <input
                  type="number"
                  required
                  min={1990}
                  max={2035}
                  value={form.graduationYear}
                  onChange={(e) => setForm({ ...form, graduationYear: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-bold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>

              {/* GPA */}
              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">المعدل التراكمي والتقدير</label>
                <input
                  type="text"
                  value={form.gpa}
                  onChange={(e) => setForm({ ...form, gpa: e.target.value })}
                  placeholder="92% (ممتاز مع مرتبة الشرف)"
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-bold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>

              {/* Experience */}
              <div className="sm:col-span-2 text-start">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">سنوات الخبرة المهنية</label>
                <input
                  type="text"
                  value={form.experienceYears}
                  onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                  placeholder="حديث التخرج (0 - 1 سنة)"
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-bold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* ================= SECTION 3: BIO ================= */}
          <div className="bg-white border border-[#E2E8F0] rounded-[22px] p-6 sm:p-8 shadow-[0_4px_12px_rgba(15,30,54,0.05)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <h2 className="text-[15px] font-black text-[#0F1E36]">
                  3. النبذة التعريفية والهدف الوظيفي
                </h2>
              </div>
              <span className="text-[11px] font-bold text-[#64748B]">
                {wordCount} كلمة
              </span>
            </div>

            <div className="text-start">
              <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                اكتب نبذة مهنية مختصرة تبرز مهاراتك وشغفك التقني
              </label>
              <textarea
                rows={5}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="اكتب نبذتك التعريفية هنا..."
                className="w-full p-4 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-semibold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition leading-relaxed"
              />
            </div>
          </div>

          {/* ================= BOTTOM ACTION BUTTONS ================= */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/profile"
              className="px-6 h-[46px] rounded-[12px] border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#0F1E36] text-[13px] font-bold transition flex items-center justify-center cursor-pointer"
            >
              إلغاء والعودة
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 h-[46px] rounded-[12px] bg-[#0F1E36] hover:bg-[#1E293B] text-white text-[13px] font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <span>حفظ التعديلات</span>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default ProfileEditPage
