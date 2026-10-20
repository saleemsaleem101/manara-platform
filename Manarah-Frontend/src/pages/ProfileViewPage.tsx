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
                    {profile.university || 'الجامعة غير محددة'}
                  </span>
                </div>

                {/* Line 3: Meta Details */}
                <p className="text-[12px] font-medium text-[#64748B]">
                  {profile.city || 'المدينة غير محددة'}  •  دفعة <bdi dir="ltr">{profile.graduationYear || '—'}</bdi>  •  المعدل التراكمي: <bdi dir="ltr">{profile.gpa || '—'}</bdi>  •  الخبرة: {profile.experienceYears ? `${profile.experienceYears} سنوات` : 'حديث التخرج'}
                </p>
              </div>
            </div>

            {/* Left in RTL: Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 self-center md:self-center">
              <Link
                to="/portfolio"
                className="w-full sm:w-auto px-5 h-[44px] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F1E36] border border-[#CBD5E1] text-[12px] font-bold rounded-[12px] shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📂</span>
                <span>المهارات والمشاريع</span>
              </Link>
              <Link
                to="/profile/edit"
                className="w-full sm:w-auto px-5 h-[44px] bg-[#0F1E36] hover:bg-[#1E293B] text-white text-[12px] font-bold rounded-[12px] shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>✏️</span>
                <span>تعديل البيانات الأساسية</span>
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
                <p className="whitespace-pre-line">{profile.bio || 'لم يتم إضافة نبذة مهنية بعد. يمكنك إضافة نبذة تعريفية من صفحة تعديل الملف.'}</p>
              </div>

              {/* Specialization Field */}
              {profile.major && (
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-[#0F1E36] mb-2 text-start">
                    مجال التخصص الأساسي:
                  </div>
                  <div className="flex flex-wrap gap-2 justify-start">
                    <span className="px-3.5 py-1.5 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F1E36] text-[11px] font-semibold">
                      {profile.major}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Academic Qualifications */}
            <div className="bg-white border border-[#E2E8F0] rounded-[22px] p-6 shadow-[0_4px_12px_rgba(15,30,54,0.05)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0F1E36]" />
                  <h2 className="text-[15px] font-black text-[#0F1E36]">المؤهل الأكاديمي والجامعة</h2>
                </div>
              </div>

              <div className="text-start">
                <div className="text-[14px] font-bold text-[#0F1E36]">
                  بكالوريوس {profile.major || 'غير محدد'}
                </div>
                <div className="text-[12px] text-[#64748B] mt-0.5">
                  {profile.university || 'الجامعة غير محددة'}
                </div>
              </div>

              {/* Metrics Badges (3 items) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] text-start">
                  <span className="text-[11px] text-[#64748B] font-semibold">سنة التخرج: </span>
                  <span className="text-[12px] text-[#0F1E36] font-bold"><bdi dir="ltr">{profile.graduationYear || '—'}</bdi></span>
                </div>

                <div className="p-2.5 rounded-[10px] bg-[#FEF3C7] border border-[#FDE68A] text-start">
                  <span className="text-[11px] text-[#92400E] font-bold">المعدل التراكمي: </span>
                  <span className="text-[12px] text-[#B45309] font-black"><bdi dir="ltr">{profile.gpa || '—'}</bdi></span>
                </div>

                <div className="p-2.5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] text-start">
                  <span className="text-[11px] text-[#64748B] font-semibold">الخبرة: </span>
                  <span className="text-[12px] text-[#0F1E36] font-bold">{profile.experienceYears ? `${profile.experienceYears} سنوات` : 'حديث التخرج'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= LEFT COLUMN (in RTL) ================= */}
          <div className="space-y-6">
            {/* Card 3: Contact Information */}
            <div className="bg-white border border-[#E2E8F0] rounded-[22px] p-6 shadow-[0_4px_12px_rgba(15,30,54,0.05)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0F1E36]" />
                  <h2 className="text-[15px] font-black text-[#0F1E36]">بيانات التواصل</h2>
                </div>
              </div>

              {/* Rows */}
              <div className="space-y-3">
                {/* Row 1: Email */}
                <div className="p-2.5 px-3.5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[13px] font-bold text-[#0F1E36]">@</span>
                    <span className="text-[12px] font-semibold text-[#0F1E36] font-mono">{profile.email || 'لم يسجل بريد'}</span>
                  </div>
                </div>

                {/* Row 2: Phone */}
                <div className="p-2.5 px-3.5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[13px] font-bold text-[#0F1E36]">📞</span>
                    <span className="text-[12px] font-semibold text-[#0F1E36] font-mono" dir="ltr">{profile.phone || '+967 770 000 000'}</span>
                  </div>
                </div>

                {/* Row 3: City */}
                <div className="p-2.5 px-3.5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2.5">
                  <span className="text-[13px] font-bold text-[#0F1E36]">📍</span>
                  <span className="text-[12px] font-semibold text-[#0F1E36]">{profile.city || 'اليمن - صنعاء'}</span>
                </div>
              </div>

              {/* Privacy Note */}
              <div className="text-[11px] font-medium text-[#94A3B8] text-start pt-2 border-t border-[#F1F5F9]">
                🔒 تظهر بيانات التواصل فقط للشركات والمؤسسات المعتمدة في منصة منارة
              </div>
            </div>

            {/* Quick Link Card to Portfolio */}
            <div className="bg-gradient-to-br from-[#0F1E36] to-[#1E293B] text-white rounded-[22px] p-6 shadow-sm space-y-3 text-start">
              <h3 className="text-[15px] font-bold text-amber-400">ملف المهارات والمشاريع والفيديو التعريفي</h3>
              <p className="text-[12px] text-slate-300 leading-relaxed">
                استكمل معرض مهاراتك التقنية ومشاريعك العملية والفيديو التقديمي لتحسين مطابقة ملفك مع متطلبات سوق العمل.
              </p>
              <div className="pt-2">
                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-amber-400 text-[#0F1E36] text-[12px] font-bold hover:bg-amber-300 transition"
                >
                  <span>إدارة المهارات والمشاريع</span>
                  <span>←</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
