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
    city: profile.city,
    university: profile.university,
    major: profile.major,
    graduationYear: profile.graduationYear,
    gpa: profile.gpa || '',
    experienceYears: profile.experienceYears || '',
    bio: profile.bio || '',
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
      const msg = (err as { message?: string })?.message
      setError(msg || 'فشل حفظ وتحديث البيانات الأساسية للخريج.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] flex flex-col font-['Cairo'] text-[#0F172A] dark:text-slate-100 transition-colors duration-300" dir="rtl">
      <Navbar />

      <main className="max-w-[1120px] mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Saved Success Toast */}
        {savedSuccess && (
          <div className="p-4 bg-[#E0F2FE] dark:bg-sky-950/60 border border-[#BAE6FD] dark:border-sky-800 text-[#0284C7] dark:text-sky-300 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-2xs transition-all duration-200">
            <span>✓ تم حفظ وتحديث بيانات الملف المهني بنجاح! جاري تحويلك...</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xs">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* ================= TOP ACTION BAR ================= */}
          <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-[#E8DEC8] dark:border-slate-800 p-6 sm:p-7 rounded-3xl shadow-sm text-center transition-all">
            <h1 className="text-[18px] sm:text-[20px] font-black text-[#0F172A] dark:text-white">
              تعديل واستكمال البيانات الأساسية للخريج
            </h1>
            <p className="text-[12px] sm:text-[13px] text-[#64748B] dark:text-slate-400 mt-1.5">
              قم بتحديث وتدقيق بياناتك الشخصية والأكاديمية ونبذتك المهنية لزيادة فرص مطابقتك مع الوظائف
            </p>
          </div>

          {/* ================= SECTION 1: PERSONAL DETAILS ================= */}
          <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-[#E8DEC8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 transition-all">
            <div className="flex items-center gap-2 border-b border-[#E8DEC8]/60 dark:border-slate-800 pb-3.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
              <h2 className="text-[15px] font-black text-[#0F172A] dark:text-white">
                1. البيانات الشخصية ومعلومات الاتصال
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">
                  الاسم الكامل (رباعي) *
                </label>
                <input
                  type="text"
                  required
                  id="input-fullname"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] transition"
                />
              </div>

              {/* Email (Readonly) */}
              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">
                  البريد الإلكتروني 🔒
                </label>
                <input
                  type="email"
                  disabled
                  value={form.email}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2]/60 dark:bg-slate-800/60 text-[13px] font-semibold text-[#64748B] dark:text-slate-400 font-mono cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">
                  رقم الهاتف / واتساب *
                </label>
                <input
                  type="text"
                  required
                  id="input-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[13px] font-semibold text-[#0F172A] dark:text-white font-mono focus:outline-none focus:border-[#38BDF8] transition"
                />
              </div>

              {/* City */}
              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">
                  المدينة والإقامة الحالية *
                </label>
                <select
                  required
                  id="input-city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[13px] font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] transition"
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

          {/* ================= SECTION 2: ACADEMIC QUALIFICATIONS ================= */}
          <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-[#E8DEC8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 transition-all">
            <div className="flex items-center gap-2 border-b border-[#E8DEC8]/60 dark:border-slate-800 pb-3.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
              <h2 className="text-[15px] font-black text-[#0F172A] dark:text-white">
                2. المؤهل الأكاديمي والجامعة
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">الجامعة *</label>
                <select
                  required
                  id="input-university"
                  value={form.university}
                  onChange={(e) => setForm({ ...form, university: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] transition"
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

              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">
                  التخصص الأكاديمي *
                </label>
                <select
                  required
                  id="input-major"
                  value={form.major}
                  onChange={(e) => setForm({ ...form, major: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] transition"
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
                <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">سنة التخرج *</label>
                <select
                  required
                  id="input-gradyear"
                  value={form.graduationYear}
                  onChange={(e) =>
                    setForm({ ...form, graduationYear: parseInt(e.target.value) || 2026 })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[13px] font-bold text-[#0F172A] dark:text-white font-mono focus:outline-none focus:border-[#38BDF8] transition"
                >
                  {[2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">
                  المعدل التراكمي (%) *
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  step="0.1"
                  required
                  id="input-gpa"
                  placeholder=""
                  value={form.gpa ? form.gpa.toString().replace(/[^0-9.]/g, '') : ''}
                  onChange={(e) => setForm({ ...form, gpa: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[13px] font-bold text-[#0F172A] dark:text-white font-mono focus:outline-none focus:border-[#38BDF8] transition"
                />
              </div>

              <div className="text-start">
                <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">
                  سنوات الخبرة المهنية (أرقام) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  required
                  id="input-experience"
                  placeholder="0 للحديث التخرج"
                  value={form.experienceYears}
                  onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[13px] font-semibold text-[#0F172A] dark:text-white font-mono focus:outline-none focus:border-[#38BDF8] transition"
                />
              </div>
            </div>
          </div>

          {/* ================= SECTION 3: BIO & OBJECTIVE ================= */}
          <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-[#E8DEC8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 transition-all">
            <div className="flex items-center justify-between border-b border-[#E8DEC8]/60 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
                <h2 className="text-[15px] font-black text-[#0F172A] dark:text-white">
                  3. النبذة التعريفية والهدف الوظيفي
                </h2>
              </div>
              <span className="px-3 py-1 rounded-lg bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8DEC8] dark:border-slate-700 text-[#475569] dark:text-slate-300 text-[11px] font-bold font-mono">
                <bdi dir="ltr">{wordCount}</bdi> / 150 كلمة
              </span>
            </div>

            <textarea
              rows={4}
              required
              id="input-bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full p-4 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[13px] text-[#0F172A] dark:text-white leading-relaxed focus:outline-none focus:border-[#38BDF8] transition"
              placeholder="اكتب نبذة مختصرة عن مهاراتك وشغفك وأهدافك الوظيفية..."
            />
          </div>

          {/* ================= BOTTOM ACTION BUTTONS ================= */}
          <div className="flex items-center justify-end gap-3 pt-3 pb-8">
            <button
              type="submit"
              id="submit-save-profile"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] disabled:opacity-60 text-white text-[13px] font-black shadow-sm transition transform active:scale-[0.99] cursor-pointer flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
              className="px-5 py-3 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8DEC8] dark:border-slate-700 text-[#475569] dark:text-slate-300 text-[12px] font-bold hover:bg-[#E5D7C3]/50 dark:hover:bg-slate-700 transition"
            >
              إلغاء التغييرات
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
