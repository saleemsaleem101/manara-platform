import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { useProfile } from '../context/ProfileContext'

export const ProfileViewPage: React.FC = () => {
  const { profile, isLoading, refreshProfile } = useProfile()

  useEffect(() => {
    refreshProfile()
  }, [refreshProfile])

  const initials = profile.name
    ? profile.name
        .trim()
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('.')
    : 'خ.م'

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
        {/* Loading Skeleton if backend fetching */}
        {isLoading && (
          <div className="w-full bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-amber-800 border-t-transparent rounded-full animate-spin" />
            <span>جاري مزامنة بيانات الملف المهني من الخادم...</span>
          </div>
        )}

        {/* ================= HERO PROFILE CARD ================= */}
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 sm:p-8 shadow-[0_4px_12px_rgba(15,30,54,0.05)] relative overflow-hidden">
          {/* Subtle Top Gradient Banner */}
          <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-l from-[#FEF3C7]/90 via-[#FFFBEB]/50 to-white pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
            {/* Right in RTL: Avatar & Identity Block */}
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5">
              <div className="relative shrink-0">
                <div className="w-[85px] h-[85px] rounded-[20px] bg-[#0F1E36] text-white text-[28px] font-black flex items-center justify-center shadow-sm">
                  {initials}
                </div>
                {/* Verified Badge */}
                {profile.isVerified && (
                  <span
                    className="absolute -bottom-1 -left-1 w-[26px] h-[26px] rounded-full bg-[#10B981] border-[3px] border-white text-white text-[11px] font-bold flex items-center justify-center shadow-sm"
                    title="سجل موثق رسمياً"
                  >
                    ✓
                  </span>
                )}
              </div>

              <div className="text-center sm:text-start space-y-2">
                {/* Line 1: Name */}
                <h1 className="text-[22px] font-black text-[#0F1E36] leading-tight">
                  {profile.name || 'خريج جديد'}
                </h1>

                {/* Line 2: Role Badge & University */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <span className="px-3 py-1 rounded-[6px] bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-[11px] font-bold">
                    {profile.major || 'هندسة البرمجيات'}
                  </span>
                  <span className="text-[12px] font-semibold text-[#475569]">
                    {profile.university || 'جامعة العلوم والتكنولوجيا'} • كلية الحاسبات وتكنولوجيا المعلومات
                  </span>
                </div>

                {/* Line 3: Meta Details */}
                <p className="text-[12px] font-medium text-[#64748B]">
                  {profile.city || 'صنعاء، اليمن'}  •  دفعة <bdi dir="ltr">{profile.graduationYear || 2026}</bdi>  •  المعدل التراكمي: <bdi dir="ltr">{profile.gpa || '92%'}</bdi>  •  الخبرة: {profile.experienceYears || 'حديث التخرج (0 - 1 سنة)'}
                </p>
              </div>
            </div>

            {/* Left in RTL: Actions & Completion Gauge */}
            <div className="flex flex-col sm:flex-row items-center gap-4 self-center md:self-center">
              {/* Completion Box */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2.5 rounded-[14px] text-center w-[230px]">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-bold text-[#475569]">نسبة اكتمال البيانات الأساسية:</span>
                  <span className="font-black text-[#D97706] text-[13px]">{profile.completionPercentage}%</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#F59E0B] h-full rounded-full transition-all duration-500"
                    style={{ width: `${profile.completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Edit Profile Primary Button */}
              <Link
                to="/profile/edit"
                className="w-full sm:w-[230px] h-[44px] bg-[#0F1E36] hover:bg-[#1E293B] text-white text-[12px] font-bold rounded-[12px] shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>✏️</span>
                <span>تعديل واستكمال البيانات الأساسية</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ================= BENTO GRID: 2 COLUMNS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ================= RIGHT COLUMN (in RTL) ================= */}
          <div className="space-y-6">
            {/* Card 1: Bio & Career Objective */}
            <div className="bg-white border border-[#E2E8F0] rounded-[22px] p-6 shadow-[0_4px_12px_rgba(15,30,54,0.05)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <h2 className="text-[15px] font-black text-[#0F1E36]">النبذة المهنية والهدف الوظيفي</h2>
                </div>
              </div>

              <div className="text-[12px] font-medium text-[#334155] leading-relaxed text-start">
                <p className="whitespace-pre-line">{profile.bio || 'لم يتم إضافة نبذة مهنية بعد.'}</p>
              </div>

              <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-[#64748B]">
                <span className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
                  💼 باحث عن فرص تقنية واعدة
                </span>
                <span className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
                  🚀 شغوف بتطوير الويب الحديث
                </span>
                <span className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
                  🤝 منفتح على العمل الجماعي
                </span>
              </div>
            </div>

            {/* Card 2: Contact Details */}
            <div className="bg-white border border-[#E2E8F0] rounded-[22px] p-6 shadow-[0_4px_12px_rgba(15,30,54,0.05)] space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F1E36]" />
                <h2 className="text-[15px] font-black text-[#0F1E36]">معلومات الاتصال والإقامة</h2>
              </div>

              <div className="space-y-3 text-[12px]">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-bold">البريد الإلكتروني</span>
                  <span className="text-slate-900 font-mono font-bold" dir="ltr">{profile.email || '—'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-bold">رقم الهاتف / واتساب</span>
                  <span className="text-slate-900 font-mono font-bold" dir="ltr">{profile.phone || 'غير محدد'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-bold">المدينة الحالية</span>
                  <span className="text-slate-900 font-bold">{profile.city || 'صنعاء، اليمن'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= LEFT COLUMN (in RTL) ================= */}
          <div className="space-y-6">
            {/* Card 3: Academic Qualifications */}
            <div className="bg-white border border-[#E2E8F0] rounded-[22px] p-6 shadow-[0_4px_12px_rgba(15,30,54,0.05)] space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <h2 className="text-[15px] font-black text-[#0F1E36]">المؤهل الأكاديمي والجامعة</h2>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-black text-[#0F1E36]">{profile.university || 'جامعة العلوم والتكنولوجيا'}</h3>
                    <p className="text-[12px] font-bold text-amber-800 mt-0.5">{profile.major || 'هندسة البرمجيات'}</p>
                  </div>
                  <span className="text-[11px] font-black bg-white px-3 py-1 rounded-full border border-amber-200 text-amber-900">
                    بكالوريوس
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-200/60 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">سنة التخرج:</span>
                    <span className="font-bold text-slate-800" dir="ltr">{profile.graduationYear || 2026}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">المعدل التراكمي:</span>
                    <span className="font-bold text-slate-800" dir="ltr">{profile.gpa || '92%'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[12px]">
                <span className="text-slate-500 font-bold">سنوات الخبرة المهنية</span>
                <span className="text-slate-900 font-bold">{profile.experienceYears || 'حديث التخرج (0 - 1 سنة)'}</span>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

export default ProfileViewPage
