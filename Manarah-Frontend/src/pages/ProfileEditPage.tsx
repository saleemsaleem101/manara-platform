import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { useProfile } from '../context/ProfileContext'

export const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate()
  const { profile, updateProfile } = useProfile()

  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    city: profile.city,
    university: profile.university,
    major: profile.major,
    graduationYear: profile.graduationYear,
    gpa: profile.gpa || '92% (ممتاز مع مرتبة الشرف)',
    experienceYears: profile.experienceYears || 'حديث التخرج (0 - 1 سنة)',
    bio:
      profile.bio ||
      'مهندس برمجيات خريج جامعة العلوم والتكنولوجيا لعام 2026 بمعدل ممتاز (92%). متخصص في بناء وتطوير تطبيقات الويب الحديثة وحلول الأعمال الرقمية، أمتلك شغفاً كبيراً بالابتكار البرمجي والعمل الجماعي ضمن بيئات تقنية رائدة تسعى لتمكين الشباب وإحداث أثر حقيقي في سوق العمل. أجيد تحليل متطلبات الأنظمة، هندسة قواعد البيانات، وتطوير الواجهات المعتمدة على أحدث المعايير البرمجية.',
  })

  const [savedSuccess, setSavedSuccess] = useState(false)

  const wordCount = form.bio.trim() ? form.bio.trim().split(/\s+/).length : 0

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile(form)
    setSavedSuccess(true)
    setTimeout(() => {
      navigate('/profile')
    }, 800)
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
              <div className="text-right">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                  الاسم الكامل (رباعي) *
                </label>
                <input
                  type="text"
                  required
                  id="input-fullname"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-bold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>

              {/* Email (Readonly) */}
              <div className="text-right">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                  البريد الإلكتروني (محمي وموثق) 🔒
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={form.email}
                    className="w-full px-4 py-2.5 rounded-[10px] border border-[#E2E8F0] bg-[#F1F5F9] text-[13px] font-semibold text-[#64748B] font-mono cursor-not-allowed"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded-[6px] bg-[#ECFDF5] text-[#059669] text-[10px] font-bold">
                    موثق ✓
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div className="text-right">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                  رقم الهاتف / واتساب *
                </label>
                <input
                  type="text"
                  required
                  id="input-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-semibold text-[#0F1E36] font-mono focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>

              {/* City */}
              <div className="text-right">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                  المدينة والإقامة الحالية *
                </label>
                <input
                  type="text"
                  required
                  id="input-city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-semibold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* ================= SECTION 2: ACADEMIC QUALIFICATIONS ================= */}
          <div className="bg-white border border-[#E2E8F0] rounded-[22px] p-6 sm:p-8 shadow-[0_4px_12px_rgba(15,30,54,0.05)] space-y-5">
            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F1E36]" />
              <h2 className="text-[15px] font-black text-[#0F1E36]">
                2. المؤهل الأكاديمي والجامعة
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="text-right">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">الجامعة *</label>
                <input
                  type="text"
                  required
                  id="input-university"
                  value={form.university}
                  onChange={(e) => setForm({ ...form, university: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-bold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>

              <div className="text-right">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                  التخصص الأكاديمي *
                </label>
                <input
                  type="text"
                  required
                  id="input-major"
                  value={form.major}
                  onChange={(e) => setForm({ ...form, major: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-bold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* 3 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-1">
              <div className="text-right">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">سنة التخرج *</label>
                <input
                  type="number"
                  required
                  id="input-gradyear"
                  value={form.graduationYear}
                  onChange={(e) =>
                    setForm({ ...form, graduationYear: parseInt(e.target.value) || 2026 })
                  }
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-bold text-[#0F1E36] font-mono focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>

              <div className="text-right">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                  المعدل التراكمي *
                </label>
                <input
                  type="text"
                  required
                  id="input-gpa"
                  value={form.gpa}
                  onChange={(e) => setForm({ ...form, gpa: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-bold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>

              <div className="text-right">
                <label className="block text-[12px] font-bold text-[#0F1E36] mb-1.5">
                  سنوات الخبرة المهنية *
                </label>
                <input
                  type="text"
                  required
                  id="input-experience"
                  value={form.experienceYears}
                  onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] font-semibold text-[#0F1E36] focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* ================= SECTION 3: BIO & OBJECTIVE ================= */}
          <div className="bg-white border border-[#E2E8F0] rounded-[22px] p-6 sm:p-8 shadow-[0_4px_12px_rgba(15,30,54,0.05)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F1E36]" />
                <h2 className="text-[15px] font-black text-[#0F1E36]">
                  3. النبذة التعريفية والهدف الوظيفي
                </h2>
              </div>
              <span className="px-3 py-1 rounded-[8px] bg-[#F1F5F9] text-[#64748B] text-[11px] font-bold font-mono">
                {wordCount} words / 150 max
              </span>
            </div>

            <textarea
              rows={4}
              required
              id="input-bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full p-4 rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[13px] text-[#0F1E36] leading-relaxed focus:outline-none focus:border-amber-500 focus:bg-white transition"
              placeholder="اكتب نبذة مختصرة عن مهاراتك وشغفك وأهدافك الوظيفية..."
            />

            {/* Smart Advice Bar */}
            <div className="p-3 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A] text-right">
              <span className="text-[11px] font-bold text-[#B45309]">
                💡 نصيحة مهنية: النبذة التعريفية الواضحة والدقيقة تزيد من فرصة تواصل مسؤولي التوظيف والشركات معك بنسبة 40%
              </span>
            </div>
          </div>

          {/* ================= BOTTOM ACTION BUTTONS ================= */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="submit"
              id="submit-save-profile"
              className="px-6 py-3 rounded-[12px] bg-[#F59E0B] hover:bg-amber-600 text-[#0F1E36] text-[13px] font-black shadow-sm transition transform active:scale-[0.99] cursor-pointer flex items-center gap-2"
            >
              <span>حفظ البيانات الأساسية</span>
              <span>✓</span>
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
