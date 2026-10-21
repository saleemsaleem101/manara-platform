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
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] flex flex-col font-['Cairo'] text-[#0F172A] dark:text-slate-100 transition-colors duration-300" dir="rtl">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
        {/* Loading Skeleton if backend fetching */}
        {isLoading && (
          <div className="w-full bg-[#E0F2FE] dark:bg-sky-950/50 border border-[#BAE6FD] dark:border-sky-800 text-[#0284C7] dark:text-sky-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-[#0284C7] border-t-transparent rounded-full animate-spin" />
            <span>جاري مزامنة بيانات الملف المهني من الخادم...</span>
          </div>
        )}

        {/* ================= HERO PROFILE CARD ================= */}
        <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-[#E8DEC8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden transition-all">
          {/* Subtle Top Gradient Banner */}
          <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-l from-[#BAE6FD]/40 via-[#E8DEC8]/30 to-transparent dark:from-sky-900/30 dark:via-slate-800/20 dark:to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
            {/* Right in RTL: Avatar & Identity Block */}
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5">
              <div className="relative shrink-0">
                <div className="w-[85px] h-[85px] rounded-2xl bg-gradient-to-br from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white text-[28px] font-black flex items-center justify-center shadow-md shadow-sky-500/20">
                  {initials}
                </div>
              </div>

              <div className="text-center sm:text-start space-y-2">
                {/* Line 1: Name */}
                <h1 className="text-[22px] font-black text-[#0F172A] dark:text-white leading-tight">
                  {profile.name || 'خريج جديد'}
                </h1>

                {/* Line 2: Role Badge & University */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <span className="px-3.5 py-1 rounded-full bg-[#E0F2FE] dark:bg-sky-950/60 border border-[#BAE6FD] dark:border-sky-800 text-[#0284C7] dark:text-sky-300 text-[11px] font-bold">
                    {profile.major || 'هندسة البرمجيات'}
                  </span>
                  <span className="text-[12px] font-semibold text-[#475569] dark:text-slate-300">
                    {profile.university || 'الجامعة غير محددة'}
                  </span>
                </div>

                {/* Line 3: Meta Details */}
                <p className="text-[12px] font-medium text-[#64748B] dark:text-slate-400">
                  {profile.city || 'المدينة غير محددة'}  •  دفعة <bdi dir="ltr">{profile.graduationYear || '—'}</bdi>  •  المعدل التراكمي: <bdi dir="ltr">{profile.gpa || '—'}</bdi>  •  الخبرة: {profile.experienceYears ? `${profile.experienceYears} سنوات` : 'حديث التخرج'}
                </p>
              </div>
            </div>

            {/* Left in RTL: Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 self-center md:self-center">
              <Link
                to="/portfolio"
                className="w-full sm:w-auto px-5 h-[44px] bg-[#FAF7F2] dark:bg-slate-800 hover:bg-[#E5D7C3]/50 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white border border-[#E8DEC8] dark:border-slate-700 text-[12px] font-bold rounded-xl shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📂</span>
                <span>المهارات والمشاريع</span>
              </Link>
              <Link
                to="/profile/edit"
                className="w-full sm:w-auto px-5 h-[44px] bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white text-[12px] font-black rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
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
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-[#E8DEC8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 transition-all">
              <div className="flex items-center justify-between border-b border-[#E8DEC8]/60 dark:border-slate-800 pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                  <h2 className="text-[15px] font-black text-[#0F172A] dark:text-white">النبذة المهنية والهدف الوظيفي</h2>
                </div>
              </div>

              <div className="text-[12px] font-medium text-[#475569] dark:text-slate-300 leading-relaxed text-start">
                <p className="whitespace-pre-line">{profile.bio || 'لم يتم إضافة نبذة مهنية بعد. يمكنك إضافة نبذة تعريفية من صفحة تعديل الملف.'}</p>
              </div>

              {/* Specialization Field */}
              {profile.major && (
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-[#0F172A] dark:text-white mb-2 text-start">
                    مجال التخصص الأساسي:
                  </div>
                  <div className="flex flex-wrap gap-2 justify-start">
                    <span className="px-3.5 py-1.5 rounded-lg bg-[#E0F2FE] dark:bg-sky-950/60 border border-[#BAE6FD] dark:border-sky-800 text-[#0284C7] dark:text-sky-300 text-[11px] font-bold">
                      {profile.major}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Academic Qualifications */}
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-[#E8DEC8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 transition-all">
              <div className="flex items-center justify-between border-b border-[#E8DEC8]/60 dark:border-slate-800 pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
                  <h2 className="text-[15px] font-black text-[#0F172A] dark:text-white">المؤهل الأكاديمي والجامعة</h2>
                </div>
              </div>

              <div className="text-start">
                <div className="text-[14px] font-bold text-[#0F172A] dark:text-white">
                  بكالوريوس {profile.major || 'غير محدد'}
                </div>
                <div className="text-[12px] text-[#64748B] dark:text-slate-400 mt-0.5">
                  {profile.university || 'الجامعة غير محددة'}
                </div>
              </div>

              {/* Metrics Badges (3 items) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700 text-start">
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-semibold">سنة التخرج: </span>
                  <span className="text-[12px] text-[#0F172A] dark:text-white font-bold"><bdi dir="ltr">{profile.graduationYear || '—'}</bdi></span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#E0F2FE] dark:bg-sky-950/50 border border-[#BAE6FD] dark:border-sky-800 text-start">
                  <span className="text-[11px] text-[#0284C7] dark:text-sky-300 font-bold">المعدل التراكمي: </span>
                  <span className="text-[12px] text-[#0284C7] dark:text-sky-300 font-black"><bdi dir="ltr">{profile.gpa || '—'}</bdi></span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700 text-start">
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-semibold">الخبرة: </span>
                  <span className="text-[12px] text-[#0F172A] dark:text-white font-bold">{profile.experienceYears ? `${profile.experienceYears} سنوات` : 'حديث التخرج'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= LEFT COLUMN (in RTL) ================= */}
          <div className="space-y-6">
            {/* Card 3: Contact Information */}
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-[#E8DEC8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 transition-all">
              <div className="flex items-center justify-between border-b border-[#E8DEC8]/60 dark:border-slate-800 pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
                  <h2 className="text-[15px] font-black text-[#0F172A] dark:text-white">بيانات التواصل</h2>
                </div>
              </div>

              {/* Rows */}
              <div className="space-y-3">
                {/* Row 1: Email */}
                <div className="p-2.5 px-3.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[13px] font-bold text-[#0284C7]">@</span>
                    <span className="text-[12px] font-semibold text-[#0F172A] dark:text-slate-200 font-mono">{profile.email || 'لم يسجل بريد'}</span>
                  </div>
                </div>

                {/* Row 2: Phone */}
                <div className="p-2.5 px-3.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[13px] font-bold text-[#38BDF8]">📞</span>
                    <span className="text-[12px] font-semibold text-[#0F172A] dark:text-slate-200 font-mono" dir="ltr">{profile.phone || '+967 770 000 000'}</span>
                  </div>
                </div>

                {/* Row 3: City */}
                <div className="p-2.5 px-3.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700 flex items-center gap-2.5">
                  <span className="text-[13px] font-bold text-[#0284C7]">📍</span>
                  <span className="text-[12px] font-semibold text-[#0F172A] dark:text-slate-200">{profile.city || 'اليمن - صنعاء'}</span>
                </div>
              </div>

              {/* Privacy Note */}
              <div className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 text-start pt-2 border-t border-[#E8DEC8]/60 dark:border-slate-800">
                🔒 تظهر بيانات التواصل فقط للشركات والمؤسسات المعتمدة في منصة منارة
              </div>
            </div>

            {/* Quick Link Card to Portfolio */}
            <div className="bg-gradient-to-br from-[#FAF7F2] via-[#E0F2FE]/40 to-[#FDFBF7] dark:from-slate-900 dark:via-sky-950/40 dark:to-slate-900 border border-[#BAE6FD]/80 dark:border-sky-900/60 rounded-3xl p-6 shadow-sm space-y-3 text-start transition-all">
              <h3 className="text-[15px] font-black text-[#0F172A] dark:text-white">ملف المهارات والمشاريع والفيديو التعريفي</h3>
              <p className="text-[12px] text-[#475569] dark:text-slate-300 leading-relaxed">
                استكمل معرض مهاراتك التقنية ومشاريعك العملية والفيديو التقديمي لتحسين مطابقة ملفك مع متطلبات سوق العمل.
              </p>
              <div className="pt-2">
                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white text-[12px] font-black transition shadow-xs"
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
