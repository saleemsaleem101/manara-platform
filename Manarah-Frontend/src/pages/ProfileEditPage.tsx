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
    name: profile.name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    city: profile.city || '',
    university: profile.university || '',
    major: profile.major || '',
    graduationYear: profile.graduationYear || 2026,
    gpa: profile.gpa || '',
    experienceYears: profile.experienceYears || '',
    bio: profile.bio || '',
  })

  // مزامنة النموذج تلقائياً عند اكتمال جلب البيانات من الخادم
  useEffect(() => {
    if (profile.name || profile.email) {
      setForm((prev) => ({
        ...prev,
        name: profile.name || prev.name,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
        city: profile.city || prev.city,
        university: profile.university || prev.university,
        major: profile.major || prev.major,
        graduationYear: profile.graduationYear || prev.graduationYear,
        gpa: profile.gpa || prev.gpa,
        experienceYears: profile.experienceYears || prev.experienceYears,
        bio: profile.bio || prev.bio,
      }))
    }
  }, [profile])

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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Cairo']">
      <Navbar />

      <main className="max-w-[1120px] mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Saved Success Toast */}
        {savedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <span>✓ تم حفظ وتحديث بيانات الملف المهني بنجاح! جاري تحويلك إلى صفحة الملف...</span>
          </div>
        )}

        {/* Error Banner */}
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
                  الاسم الكامل (رباعي على الأقل) *
                </label>
                <input
                  type="text"
                  required
                  id="input-fullname"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: سليم شايف علي سليمان"
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-bold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>

              {/* Email (Readonly) */}
              <div className="text-start">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-bold text-[#0F1E36]">البريد الإلكتروني 🔒</label>
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">
                    حساب موثق
                  </span>
                </div>
                <input
                  type="email"
                  disabled
                  value={form.email}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#E2E8F0] bg-[#F1F5F9] text-[13px] font-semibold text-[#64748B] font-mono cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                  رقم الهاتف / واتساب *
                </label>
                <input
                  type="tel"
                  required
                  id="input-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="مثال: 771234567"
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-semibold text-[#0F1E36] font-mono focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>

              {/* City */}
              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                  المدينة والإقامة الحالية *
                </label>
                <select
                  required
                  id="input-city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-semibold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                >
                  <option value="">اختر المدينة</option>
                  <option value="صنعاء">صنعاء</option>
                  <option value="عدن">عدن</option>
                  <option value="تعز">تعز</option>
                  <option value="الحديدة">الحديدة</option>
                  <option value="حضرموت (المكلا)">حضرموت (المكلا)</option>
                  <option value="إب">إب</option>
                  <option value="ذمار">ذمار</option>
                  <option value="مأرب">مأرب</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
            </div>
          </div>

          {/* ================= SECTION 2: ACADEMIC DETAILS ================= */}
          <div className="bg-white border border-[#E2E8F0] rounded-[22px] p-6 sm:p-8 shadow-[0_4px_12px_rgba(15,30,54,0.05)] space-y-5">
            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F1E36]" />
              <h2 className="text-[15px] font-black text-[#0F1E36]">
                2. المؤهل الأكاديمي والجامعة
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* University */}
              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">الجامعة *</label>
                <select
                  required
                  id="input-university"
                  value={form.university}
                  onChange={(e) => setForm({ ...form, university: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-bold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                >
                  <option value="">اختر الجامعة</option>
                  <option value="جامعة صنعاء">جامعة صنعاء</option>
                  <option value="جامعة عدن">جامعة عدن</option>
                  <option value="جامعة تعز">جامعة تعز</option>
                  <option value="جامعة ذمار">جامعة ذمار</option>
                  <option value="جامعة العلوم والتكنولوجيا">جامعة العلوم والتكنولوجيا</option>
                  <option value="الجامعة اللبنانية الدولية">الجامعة اللبنانية الدولية</option>
                  <option value="جامعة سبأ">جامعة سبأ</option>
                  <option value="جامعة إب">جامعة إب</option>
                  <option value="جامعة حضرموت">جامعة حضرموت</option>
                  <option value="أخرى">جامعة أخرى</option>
                </select>
              </div>

              {/* Major */}
              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                  التخصص الأكاديمي *
                </label>
                <select
                  required
                  id="input-major"
                  value={form.major}
                  onChange={(e) => setForm({ ...form, major: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-bold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                >
                  <option value="">اختر التخصص الأكاديمي</option>
                  <option value="هندسة البرمجيات">هندسة البرمجيات</option>
                  <option value="علوم الحاسوب">علوم الحاسوب</option>
                  <option value="تكنولوجيا المعلومات">تكنولوجيا المعلومات</option>
                  <option value="نظم المعلومات الحاسوبية">نظم المعلومات الحاسوبية</option>
                  <option value="الأمن السيبراني">الأمن السيبراني</option>
                  <option value="هندسة الشبكات والاتصالات">هندسة الشبكات والاتصالات</option>
                  <option value="علوم البيانات">علوم البيانات والتحليل الرقمي</option>
                  <option value="أخرى">تخصص آخر</option>
                </select>
              </div>
            </div>

            {/* 3 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-1">
              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">سنة التخرج *</label>
                <select
                  required
                  id="input-gradyear"
                  value={form.graduationYear}
                  onChange={(e) =>
                    setForm({ ...form, graduationYear: parseInt(e.target.value) || 2026 })
                  }
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-bold text-[#0F1E36] font-mono focus:outline-none focus:border-amber-500 focus:bg-white transition"
                >
                  {[2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                  المعدل التراكمي (%) *
                </label>
                <input
                  type="text"
                  required
                  id="input-gpa"
                  placeholder="مثال: 92%"
                  value={form.gpa}
                  onChange={(e) => setForm({ ...form, gpa: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-bold text-[#0F1E36] font-mono focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>

              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                  سنوات الخبرة المهنية *
                </label>
                <select
                  required
                  id="input-experience"
                  value={form.experienceYears}
                  onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-semibold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                >
                  <option value="">اختر سنوات الخبرة</option>
                  <option value="حديث التخرج (0 - 1 سنة)">حديث التخرج (0 - 1 سنة)</option>
                  <option value="1 - 2 سنوات">1 - 2 سنوات</option>
                  <option value="3 - 5 سنوات">3 - 5 سنوات</option>
                  <option value="أكثر من 5 سنوات">أكثر من 5 سنوات</option>
                </select>
              </div>
            </div>
          </div>

          {/* ================= SECTION 3: BIO ================= */}
          <div className="bg-white border border-[#E2E8F0] rounded-[22px] p-6 sm:p-8 shadow-[0_4px_12px_rgba(15,30,54,0.05)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F1E36]" />
                <h2 className="text-[15px] font-black text-[#0F1E36]">
                  3. النبذة التعريفية والهدف الوظيفي
                </h2>
              </div>
              <span className="px-3 py-1 rounded-[8px] bg-[#F1F5F9] text-[#64748B] text-[11px] font-bold font-mono">
                <bdi dir="ltr">{wordCount}</bdi> / 150 كلمة
              </span>
            </div>

            <div className="text-start">
              <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                اكتب نبذة مهنية مختصرة تبرز مهاراتك وشغفك وأهدافك الوظيفية
              </label>
              <textarea
                rows={4}
                id="input-bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="اكتب نبذة مختصرة عن مهاراتك وشغفك وأهدافك الوظيفية..."
                className="w-full p-4 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] text-[#0F1E36] leading-relaxed focus:outline-none focus:border-amber-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* ================= BOTTOM ACTION BUTTONS ================= */}
          <div className="flex items-center justify-end gap-3 pt-3 pb-8">
            <button
              type="submit"
              id="submit-save-profile"
              disabled={isSaving}
              className="px-6 py-3 rounded-[12px] bg-[#F59E0B] hover:bg-amber-600 disabled:opacity-60 text-[#0F1E36] text-[13px] font-black shadow-sm transition transform active:scale-[0.99] cursor-pointer flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0F1E36] border-t-transparent rounded-full animate-spin" />
                  <span>جاري الحفظ في الخادم...</span>
                </>
              ) : (
                <>
                  <span>حفظ البيانات الأساسية</span>
                  <span>✓</span>
                </>
              )}
            </button>
            <Link
              to="/profile"
              className="px-5 py-3 rounded-[12px] bg-white border border-[#CBD5E1] text-[#475569] text-[12px] font-bold hover:bg-slate-50 transition"
            >
              إلغاء التغييرات
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}

export default ProfileEditPage
