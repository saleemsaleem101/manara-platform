import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { BrandLogo } from '../components/BrandLogo'
import { ThemeToggle } from '../components/ThemeToggle'

export const LandingPage: React.FC = () => {
  const { isAuthenticated, role } = useProfile()

  // Interactive Match Simulator State
  const [activeTab, setActiveTab] = useState<'job1' | 'job2' | 'job3'>('job1')
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const getDashboardLink = () => {
    if (role === 'ADMIN') return '/admin'
    if (role === 'COMPANY') return '/company/jobs'
    return '/profile'
  }

  // Simulator Data
  const demoJobs = {
    job1: {
      title: 'مهندس برمجيات وتطبيقات سحابية (Full-Stack Cloud)',
      company: 'مجموعة يمن تك لتقنية المعلومات',
      location: 'صنعاء • دوام كامل',
      skillsScore: 94,
      majorScore: 100,
      expScore: 85,
      qualScore: 90,
      totalScore: 93.3,
      skills: ['Python', 'Django', 'React.js', 'PostgreSQL', 'Docker'],
    },
    job2: {
      title: 'مطور واجهات وتجربة مستخدم (Frontend Engineer)',
      company: 'حلول الرواد الرقمية',
      location: 'صنعاء • هجين',
      skillsScore: 90,
      majorScore: 95,
      expScore: 80,
      qualScore: 90,
      totalScore: 89.2,
      skills: ['React.js', 'TypeScript', 'Tailwind CSS', 'Next.js', 'UI/UX'],
    },
    job3: {
      title: 'أخصائي أمن سيبراني واختبار اختراق',
      company: 'مصرف الأمان الرقمي',
      location: 'صنعاء • حضوري',
      skillsScore: 86,
      majorScore: 90,
      expScore: 80,
      qualScore: 85,
      totalScore: 85.7,
      skills: ['Network Security', 'Linux', 'Ethical Hacking', 'SOC', 'Python'],
    },
  }

  const currentJob = demoJobs[activeTab]

  return (
    <div
      className="min-h-screen bg-[#FBF9F5] text-[#0F172A] font-sans selection:bg-[#BAE6FD] selection:text-[#0369A1] relative overflow-x-hidden"
      dir="rtl"
    >
      {/* Dynamic Ambient Background Meshes: Pure White + Warm Beige + Pale Mint + Light Sky Blue */}
      <div className="absolute top-0 right-0 w-[580px] h-[580px] bg-gradient-to-br from-[#E0F2FE]/70 via-[#BAE6FD]/40 to-transparent rounded-full blur-3xl pointer-events-none -mr-40 -mt-20" />
      <div className="absolute top-48 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#D1FAE5]/60 via-[#F5EFE6]/70 to-transparent rounded-full blur-3xl pointer-events-none -ml-40" />
      <div className="absolute top-[1300px] right-1/4 w-[700px] h-[700px] bg-gradient-to-r from-[#DCFCE7]/50 via-[#E0F2FE]/40 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-50 bg-[#FFFFFF]/90 backdrop-blur-xl border-b border-[#EAE4D9]/80 shadow-2xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <BrandLogo />

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#F4EFE6]/60 p-1.5 rounded-2xl border border-[#EAE4D9] text-xs font-bold text-[#475569]">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl bg-white text-[#0284C7] font-black shadow-xs border border-[#EAE4D9]/70"
            >
              الرئيسية
            </Link>
            <a
              href="#bento-demo"
              className="px-4 py-2 rounded-xl hover:text-[#0284C7] hover:bg-white/70 transition"
            >
              نظام المطابقة
            </a>
            <a
              href="#pillars"
              className="px-4 py-2 rounded-xl hover:text-[#0284C7] hover:bg-white/70 transition"
            >
              المميزات
            </a>
            <Link
              to="/jobs"
              className="px-4 py-2 rounded-xl hover:text-[#0284C7] hover:bg-white/70 transition"
            >
              الوظائف المتاحة
            </Link>
            <a
              href="#enterprise-trust"
              className="px-4 py-2 rounded-xl hover:text-[#0284C7] hover:bg-white/70 transition"
            >
              للشركات
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] hover:from-[#0369A1] hover:to-[#0284C7] text-white font-black text-xs transition-all duration-200 shadow-sm hover:shadow-[#0EA5E9]/25 hover:shadow-md flex items-center gap-2"
              >
                <span>لوحة التحكم</span>
                <span>➔</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#334155] hover:text-[#0284C7] hover:bg-[#F4EFE6]/60 border border-[#EAE4D9] transition"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/register"
                  className="relative group px-5 py-2.5 rounded-xl text-white font-black text-xs transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#10B981] rounded-xl transition-all duration-300 shadow-sm group-hover:shadow-[#0EA5E9]/35 group-hover:shadow-md group-hover:scale-[1.02]" />
                  <span className="relative flex items-center gap-1.5">
                    <span>انضم الآن</span>
                    <span className="text-[#BAE6FD]">✦</span>
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-14 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-[#D1E7DD] text-[#334155] text-xs font-bold mb-8 shadow-xs hover:border-[#BAE6FD] transition-all duration-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]" />
            </span>
            <span className="font-bold text-[#0F172A]">المنظومة الرقمية المعتمدة للتوظيف والربط المهني الذكي</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#0F172A] tracking-tight leading-[1.18] mb-8 max-w-5xl mx-auto">
            جسر التلاقي المباشر بين{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#10B981] bg-clip-text text-transparent">
                الكفاءات المتميزة
              </span>
              <span className="absolute bottom-2 left-0 right-0 h-3 bg-[#BAE6FD]/40 rounded-full -rotate-1 -z-0" />
            </span>{' '}
            وكبرى منشآت الأعمال
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-[#475569] max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
            منصة مَنَارَة تجمع بين <strong className="font-bold text-[#0F172A]">الملف المهني الرقمي المتكامل (GitHub + Video CV)</strong> و<strong className="font-bold text-[#0284C7]">خوارزمية مطابقة رياضية موزونة</strong> تقضي على الوساطة وتضمن الشفافية والعدالة وسرعة التوظيف.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 max-w-md mx-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#10B981] hover:from-[#0369A1] hover:to-[#059669] text-white font-black text-sm transition-all duration-300 shadow-[0_12px_28px_-6px_rgba(14,165,233,0.35)] hover:shadow-[0_16px_36px_-6px_rgba(14,165,233,0.45)] hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
            >
              <span>انضم الآن كباحث عن عمل</span>
              <span className="group-hover:translate-x-1 transition-transform">⚡</span>
            </Link>
            <Link
              to="/company/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-[#FBF9F5] text-[#0F172A] font-black text-sm border border-[#EAE4D9] shadow-xs hover:shadow-md hover:border-[#BAE6FD] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>تسجيل منشأة أعمال</span>
              <span>🏢</span>
            </Link>
          </div>

          {/* Trust Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-[#EAE4D9] shadow-2xs hover:border-[#BAE6FD] transition">
              <div className="text-2xl sm:text-3xl font-black text-[#0284C7]">
                96.4%
              </div>
              <div className="text-xs font-bold text-[#64748B] mt-1">دقة المطابقة والتوافق</div>
            </div>
            <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-[#EAE4D9] shadow-2xs hover:border-[#BDE8D2] transition">
              <div className="text-2xl sm:text-3xl font-black text-[#10B981]">
                100%
              </div>
              <div className="text-xs font-bold text-[#64748B] mt-1">سجلات تجارية موثقة</div>
            </div>
            <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-[#EAE4D9] shadow-2xs hover:border-[#E5DAC8] transition">
              <div className="text-2xl sm:text-3xl font-black text-[#854D0E]">
                60 ثانية
              </div>
              <div className="text-xs font-bold text-[#64748B] mt-1">فيديو المصافحة الرقمية</div>
            </div>
            <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-[#EAE4D9] shadow-2xs hover:border-[#BAE6FD] transition">
              <div className="text-2xl sm:text-3xl font-black text-[#0369A1]">
                0 وساطة
              </div>
              <div className="text-xs font-bold text-[#64748B] mt-1">ترتيب خوارزمي تنازلي</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOWSTOPPER BENTO GRID & INTERACTIVE JACCARD SIMULATOR */}
      <section id="bento-demo" className="py-20 bg-gradient-to-b from-[#FBF9F5] via-[#F4EFE6]/50 to-white border-y border-[#EAE4D9] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F4FC] border border-[#BAE3F9] text-[#0369A1] text-xs font-bold mb-3">
              <span>✦ نظام المطابقة الموزونة الذكي ✦</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] mb-4">
              كيف تختار المنشآت أفضل المرشحين بدقة وموضوعية؟
            </h2>
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
              تعمل خوارزمية جاكارد الرياضية الموزونة على مقارنة متطلبات الشاغر مع بيانات المرشح واحتساب درجة التوافق في الزمن الحقيقي
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bento Card 1: Interactive Match Calculator (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EAE4D9] p-6 sm:p-8 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#F4EFE6]">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-[#E8F4FC] text-[#0284C7] flex items-center justify-center font-black text-lg border border-[#BAE3F9]">
                      ⚙️
                    </span>
                    <div>
                      <h3 className="text-base font-black text-[#0F172A]">
                        محاكاة احتساب درجة المطابقة
                      </h3>
                      <p className="text-xs text-[#64748B]">اختر الوظيفة لمشاهدة توزيع المعايير والنسب الموزونة</p>
                    </div>
                  </div>

                  {/* Switch between 3 jobs */}
                  <div className="flex bg-[#F4EFE6] p-1 rounded-xl text-xs font-bold text-[#475569]">
                    <button
                      type="button"
                      onClick={() => setActiveTab('job1')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        activeTab === 'job1'
                          ? 'bg-[#0284C7] text-white shadow-2xs'
                          : 'hover:text-[#0F172A]'
                      }`}
                    >
                      وظيفة سحابية
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('job2')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        activeTab === 'job2'
                          ? 'bg-[#0284C7] text-white shadow-2xs'
                          : 'hover:text-[#0F172A]'
                      }`}
                    >
                      مطور واجهات
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('job3')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        activeTab === 'job3'
                          ? 'bg-[#0284C7] text-white shadow-2xs'
                          : 'hover:text-[#0F172A]'
                      }`}
                    >
                      أمن سيبراني
                    </button>
                  </div>
                </div>

                {/* Job Title & Corporate Details */}
                <div className="bg-gradient-to-r from-[#FBF9F5] via-[#E8F4FC]/50 to-[#E8F8F2]/40 p-4 rounded-2xl border border-[#EAE4D9] mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#0284C7] block mb-0.5">الشاغر المعروض:</span>
                    <h4 className="text-sm font-black text-[#0F172A]">{currentJob.title}</h4>
                    <span className="text-xs text-[#64748B]">{currentJob.company} • {currentJob.location}</span>
                  </div>

                  <div className="text-center px-4 py-2 bg-white rounded-xl border border-[#BAE3F9] shadow-2xs">
                    <span className="text-[10px] font-bold text-[#64748B] block">درجة التوافق النهائية</span>
                    <span className="text-2xl font-black bg-gradient-to-r from-[#0284C7] to-[#10B981] bg-clip-text text-transparent">
                      {currentJob.totalScore}%
                    </span>
                  </div>
                </div>

                {/* The 4 Criteria Progress Bars */}
                <div className="space-y-4">
                  {/* Criterion 1: Skills Jaccard (45%) */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                      <span className="text-[#0F172A] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
                        <span>معيار المهارات التقنية (مؤشر جاكارد Jaccard) - الوزن: 45%</span>
                      </span>
                      <span className="text-[#0284C7] font-mono font-black">{currentJob.skillsScore}%</span>
                    </div>
                    <div className="w-full bg-[#E0F2FE] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#0284C7] to-[#38BDF8] h-full rounded-full transition-all duration-700"
                        style={{ width: `${currentJob.skillsScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Criterion 2: Major (25%) */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                      <span className="text-[#0F172A] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                        <span>معيار التخصص المهني والأكاديمي - الوزن: 25%</span>
                      </span>
                      <span className="text-[#0D6E44] font-mono font-black">{currentJob.majorScore}%</span>
                    </div>
                    <div className="w-full bg-[#DCFCE7] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#10B981] to-[#34D399] h-full rounded-full transition-all duration-700"
                        style={{ width: `${currentJob.majorScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Criterion 3: Experience (20%) */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                      <span className="text-[#0F172A] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#854D0E]" />
                        <span>معيار الخبرة العملية والمشاريع المنجزة - الوزن: 20%</span>
                      </span>
                      <span className="text-[#854D0E] font-mono font-black">{currentJob.expScore}%</span>
                    </div>
                    <div className="w-full bg-[#FEF3C7] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#D97706] to-[#F59E0B] h-full rounded-full transition-all duration-700"
                        style={{ width: `${currentJob.expScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Criterion 4: Qualification (10%) */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                      <span className="text-[#0F172A] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0891B2]" />
                        <span>معيار المؤهل العلمي والمعدل - الوزن: 10%</span>
                      </span>
                      <span className="text-[#0891B2] font-mono font-black">{currentJob.qualScore}%</span>
                    </div>
                    <div className="w-full bg-[#CFFAFE] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] h-full rounded-full transition-all duration-700"
                        style={{ width: `${currentJob.qualScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Formula Footer */}
              <div className="mt-6 pt-4 border-t border-[#F4EFE6] flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#64748B] font-mono">
                <span>المعادلة المعتمدة: Score = (0.45×S) + (0.25×M) + (0.20×E) + (0.10×Q)</span>
                <span className="text-[#0D6E44] font-bold bg-[#E8F8F2] px-2.5 py-0.5 rounded-full border border-[#BDE8D2]">
                  ✓ متوافق مع متطلبات الشاغر
                </span>
              </div>
            </div>

            {/* Bento Card 2: Candidate Live Profile Showcase (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#0B1528] to-[#1E293B] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-60 h-60 bg-[#0284C7]/15 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0284C7] to-[#10B981] text-white font-black flex items-center justify-center text-base shadow-sm">
                      JS
                    </div>
                    <div>
                      <h4 className="text-base font-black flex items-center gap-2">
                        <span>جلال عبد الملك الصوفي</span>
                        <span className="text-xs text-[#34D399] bg-[#064E3B]/60 px-2.5 py-0.5 rounded-full border border-[#059669]/40">
                          ملف موثق ✓
                        </span>
                      </h4>
                      <p className="text-xs text-[#94A3B8]">مهندس برمجيات • تخصص أنظمة سحابية وتطبيقات ويب</p>
                    </div>
                  </div>
                </div>

                {/* 60s Video CV Mockup inside Bento */}
                <div className="bg-[#1E293B]/90 rounded-2xl p-4 border border-slate-700/70 mb-5 relative group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#FDE047] flex items-center gap-1.5">
                      <span>🎥</span>
                      <span>فيديو المصافحة الرقمية (60 ثانية)</span>
                    </span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">01:00 دقيقة</span>
                  </div>
                  <div className="h-24 bg-[#0B1528] rounded-xl flex items-center justify-center relative overflow-hidden border border-slate-750">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-6 bg-[#38BDF8] animate-pulse rounded-full" />
                      <span className="w-1 h-10 bg-[#0284C7] animate-pulse rounded-full" />
                      <span className="w-1 h-4 bg-[#34D399] animate-pulse rounded-full" />
                      <span className="w-1 h-12 bg-[#FDE047] animate-pulse rounded-full" />
                      <span className="w-1 h-7 bg-[#38BDF8] animate-pulse rounded-full" />
                      <span className="w-1 h-3 bg-[#10B981] rounded-full" />
                    </div>
                    <span className="absolute bottom-2 left-2 text-[9px] bg-black/70 px-2 py-0.5 rounded text-slate-300">
                      متاح حصرياً للشركات المعتمدة
                    </span>
                  </div>
                </div>

                {/* Live Skills Chips */}
                <div className="space-y-2 mb-4">
                  <span className="text-xs font-bold text-slate-300 block">المهارات التقنية المعتمدة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentJob.skills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2.5 py-1 rounded-lg bg-[#0F172A] text-[#BAE6FD] border border-[#0284C7]/40 text-xs font-bold font-mono"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* GitHub Live Link */}
              <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-200">
                  <span>🐙</span>
                  <span>معرض المشاريع: github.com/jalal-alsoufi</span>
                </span>
                <span className="text-[#FDE047] font-bold">تقييم عالي (92%)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE SYSTEM PILLARS */}
      <section id="pillars" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-wider text-[#0284C7] block mb-2">
            KEY INNOVATIONS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] mb-4">
            أربع ركائز تميز منصة "منارة" عن منصات التوظيف التقليدية
          </h2>
          <p className="text-sm sm:text-base text-[#475569]">
            حلول رقمية متكاملة مصممة لرفع كفاءة عمليات التوظيف وربط المهارات الحقيقية بالفرص الموثقة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white rounded-3xl border border-[#EAE4D9] p-8 shadow-2xs hover:border-[#BAE6FD] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-[#E8F4FC] text-[#0284C7] border border-[#BAE3F9] flex items-center justify-center text-2xl mb-6 shadow-2xs group-hover:scale-110 transition duration-300">
              ⚡
            </div>
            <h3 className="text-lg font-black text-[#0F172A] mb-2">الملف المهني الهجين</h3>
            <span className="text-[10px] font-black text-[#0284C7] block mb-3 font-mono">HYBRID DIGITAL CV</span>
            <p className="text-xs text-[#64748B] leading-relaxed">
              تجاوز السير الورقية التقليدية؛ ملف رقمي شامل يربط مشاريع GitHub الحية وتطبيقات الويب والمؤهلات في واجهة موحدة.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-3xl border border-[#EAE4D9] p-8 shadow-2xs hover:border-[#E5DAC8] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-[#F8F4EC] text-[#854D0E] border border-[#E8DDCC] flex items-center justify-center text-2xl mb-6 shadow-2xs group-hover:scale-110 transition duration-300">
              🎥
            </div>
            <h3 className="text-lg font-black text-[#0F172A] mb-2">فيديو المصافحة الرقمية</h3>
            <span className="text-[10px] font-black text-[#854D0E] block mb-3 font-mono">60-SEC VIDEO CV</span>
            <p className="text-xs text-[#64748B] leading-relaxed">
              مقطع فيديو تعريفي احترافي مدته 60 ثانية يبرز مهارات التواصل والثقة بالنفس مباشرة لمسؤولي التوظيف مع خيارات خصوصية آمنة.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-3xl border border-[#EAE4D9] p-8 shadow-2xs hover:border-[#BDE8D2] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-[#E8F8F2] text-[#0D6E44] border border-[#BDE8D2] flex items-center justify-center text-2xl mb-6 shadow-2xs group-hover:scale-110 transition duration-300">
              📐
            </div>
            <h3 className="text-lg font-black text-[#0F172A] mb-2">المطابقة الرياضية الموزونة</h3>
            <span className="text-[10px] font-black text-[#0D6E44] block mb-3 font-mono">WEIGHTED JACCARD SIMILARITY</span>
            <p className="text-xs text-[#64748B] leading-relaxed">
              استبعاد الفرز اليدوي والانحياز البشري؛ يتم احتساب التوافق تلقائياً وترتيب المرشحين تنازلياً وفق معايير موضوعية.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white rounded-3xl border border-[#EAE4D9] p-8 shadow-2xs hover:border-[#BAE6FD] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-[#E6F7FA] text-[#0891B2] border border-[#BCE8EF] flex items-center justify-center text-2xl mb-6 shadow-2xs group-hover:scale-110 transition duration-300">
              🛡️
            </div>
            <h3 className="text-lg font-black text-[#0F172A] mb-2">توثيق المنشآت والشركات</h3>
            <span className="text-[10px] font-black text-[#0891B2] block mb-3 font-mono">ENTERPRISE VERIFICATION</span>
            <p className="text-xs text-[#64748B] leading-relaxed">
              بيئة عمل موثوقة 100%؛ تخضع كل منشأة لتدقيق إلزامي لوثيقة السجل التجاري قبل منحها صلاحية نشر الوظائف أو استعراض الكفاءات.
            </p>
          </div>
        </div>
      </section>

      {/* 5. ENTERPRISE TRUST & SECURITY SECTION */}
      <section id="enterprise-trust" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-700/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0284C7]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center lg:text-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#BAE6FD]/15 border border-[#38BDF8]/30 text-[#BAE6FD] text-xs font-bold">
                <span>🛡️</span>
                <span>بنية رقمية موثوقة بمعايير مؤسسية</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                أمان متقدم، خصوصية محكمة، وتكامل تقني سلس
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                تعتمد منصة منارة على تقنيات برمجية حديثة تضمن استقرار الأداء، وسرعة الاستجابة، وحماية تامة لبيانات الخريجين والمنشآت مع دعم التشفير وحوكمة الصلاحيات.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-[#BAE6FD] justify-center lg:justify-start">
                <span>✦ واجهات برمجية REST APIs مؤمنة</span>
                <span>✦ قاعدة بيانات موثوقة PostgreSQL</span>
                <span>✦ تشفير الملفات والاتصال الآمن HTTPS</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 text-center min-w-[260px]">
              <span className="text-[11px] font-bold text-[#34D399] block mb-1">بيئة توظيف موثوقة</span>
              <span className="text-3xl font-black text-white block mb-2">100% تدقيق</span>
              <p className="text-xs text-slate-300">
                حماية شاملة للمرشحين والمنشآت من الإعلانات العشوائية والحسابات غير الموثقة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FEATURED JOBS WITH LIVE CATEGORY FILTER */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#0284C7] block mb-2">
              OPPORTUNITIES RADAR
            </span>
            <h2 className="text-3xl font-black text-[#0F172A]">
              أحدث الشواغر المطروحة في الشركات المعتمدة
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              شواغر نشطة تخضع مباشرة لخوارزمية المطابقة الموزونة
            </p>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            {[
              { id: 'all', label: 'كافة التخصصات' },
              { id: 'software', label: 'هندسة البرمجيات' },
              { id: 'cloud', label: 'الحوسبة السحابية' },
              { id: 'security', label: 'الأمن السيبراني' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl transition ${
                  selectedCategory === cat.id
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'bg-white text-[#475569] border border-[#EAE4D9] hover:bg-[#FBF9F5]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Job Card 1 */}
          <div className="bg-white rounded-3xl border border-[#EAE4D9] p-6 shadow-2xs hover:border-[#BAE6FD] hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F4FC] text-[#0284C7] font-black flex items-center justify-center text-sm border border-[#BAE3F9]">
                    YT
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#0F172A] leading-tight">مهندس برمجيات سحابية وتطبيقات</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">مجموعة يمن تك • دوام كامل</p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#0284C7] bg-[#E8F4FC] px-2.5 py-1 rounded-xl border border-[#BAE3F9]">
                  مطابقة 94%
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-6">
                <span className="text-[10px] font-bold text-[#334155] bg-[#F4EFE6] px-2.5 py-1 rounded-lg">React.js</span>
                <span className="text-[10px] font-bold text-[#334155] bg-[#F4EFE6] px-2.5 py-1 rounded-lg">Python</span>
                <span className="text-[10px] font-bold text-[#334155] bg-[#F4EFE6] px-2.5 py-1 rounded-lg">PostgreSQL</span>
              </div>
            </div>

            <Link
              to="/jobs"
              className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] hover:from-[#0369A1] hover:to-[#0284C7] text-white font-black text-xs transition shadow-2xs flex items-center justify-center gap-1.5"
            >
              <span>تقديم مباشر بنسبة التوافق</span>
              <span>➔</span>
            </Link>
          </div>

          {/* Job Card 2 */}
          <div className="bg-white rounded-3xl border border-[#EAE4D9] p-6 shadow-2xs hover:border-[#BDE8D2] hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F8F2] text-[#0D6E44] font-black flex items-center justify-center text-sm border border-[#BDE8D2]">
                    YS
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#0F172A] leading-tight">مطور واجهات وتجربة مستخدم</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">مجموعة يمن سوفت • هجين</p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#0D6E44] bg-[#E8F8F2] px-2.5 py-1 rounded-xl border border-[#BDE8D2]">
                  مطابقة 91%
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-6">
                <span className="text-[10px] font-bold text-[#334155] bg-[#F4EFE6] px-2.5 py-1 rounded-lg">TypeScript</span>
                <span className="text-[10px] font-bold text-[#334155] bg-[#F4EFE6] px-2.5 py-1 rounded-lg">Next.js</span>
                <span className="text-[10px] font-bold text-[#334155] bg-[#F4EFE6] px-2.5 py-1 rounded-lg">Tailwind</span>
              </div>
            </div>

            <Link
              to="/jobs"
              className="w-full text-center py-3 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-black text-xs transition shadow-2xs flex items-center justify-center gap-1.5"
            >
              <span>تقديم مباشر بنسبة التوافق</span>
              <span>➔</span>
            </Link>
          </div>

          {/* Job Card 3 */}
          <div className="bg-white rounded-3xl border border-[#EAE4D9] p-6 shadow-2xs hover:border-[#E5DAC8] hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F8F4EC] text-[#854D0E] font-black flex items-center justify-center text-sm border border-[#E8DDCC]">
                    KB
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#0F172A] leading-tight">مهندس أمن سيبراني واختبار اختراق</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">بنك الكريمي للتمويل • حضوري</p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#854D0E] bg-[#F8F4EC] px-2.5 py-1 rounded-xl border border-[#E8DDCC]">
                  مطابقة 88%
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-6">
                <span className="text-[10px] font-bold text-[#334155] bg-[#F4EFE6] px-2.5 py-1 rounded-lg">Security</span>
                <span className="text-[10px] font-bold text-[#334155] bg-[#F4EFE6] px-2.5 py-1 rounded-lg">SOC</span>
                <span className="text-[10px] font-bold text-[#334155] bg-[#F4EFE6] px-2.5 py-1 rounded-lg">Linux</span>
              </div>
            </div>

            <Link
              to="/jobs"
              className="w-full text-center py-3 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-black text-xs transition shadow-2xs flex items-center justify-center gap-1.5"
            >
              <span>تقديم مباشر بنسبة التوافق</span>
              <span>➔</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 bg-[#F4EFE6]/40 border-t border-[#EAE4D9]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-black text-[#0284C7] block mb-2">FAQ & INFORMATION</span>
            <h2 className="text-3xl font-black text-[#0F172A] mb-3">الأسئلة الشائعة</h2>
            <p className="text-sm text-[#64748B]">إجابات شاملة حول آلية عمل المنصة وخدماتها</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'كيف تضمن خوارزمية جاكارد الموزونة العدالة في الاختيار؟',
                a: 'تقوم الخوارزمية بمقارنة المهارات التقنية والمهنية للمرشح مع متطلبات الوظيفة بصورة آلية بنسبة 45% عبر معامل تشابه جاكارد الرياضي، مع دمج 25% للتخصص، و20% لسنوات الخبرة، و10% للمؤهل، مما يعطي كل متقدم درجة دقيقة من 100% بدون أي تدخل أو تفضيل يدوي.',
              },
              {
                q: 'ما هو دور الفيديو التعريفي (Video CV) وكيف تتم حماية خصوصيته؟',
                a: 'هو مقطع فيديو احترافي مدته 60 ثانية يسمح للمرشح بتقديم نفسه ومهاراته اللغوية والتواصلية. لا يُتاح الفيديو للعامة على الإنترنت، بل يقتصر عرضه حصرياً على المنشآت المعتمدة رسمياً والتي تمتلك سجلاً تجارياً سارياً وموثقاً.',
              },
              {
                q: 'كيف يتم التحقق من مصداقية الشركات وجهات التوظيف؟',
                a: 'لا تستطيع أي شركة نشر أي إعلان وظيفي بمجرد التسجيل؛ بل يتطلب ذلك رفع وثيقة السجل التجاري الرسمي، ويقوم فريق إدارة النظام بمراجعتها وتدقيقها في لوحة التحكم واعتمادها قبل تنشيط حساب المنشأة.',
              },
              {
                q: 'هل المنصة مجانية للباحثين عن عمل؟',
                a: 'نعم، التسجيل وإنشاء الملف المهني الهجين ورفع الفيديو التعريفي والتقديم على كافة الوظائف المعتمدة متاح ومجاني بالكامل لكافة الكفاءات والباحثين عن عمل.',
              },
            ].map((faq, idx) => (
              <div
                key={faq.q}
                className="bg-white rounded-2xl border border-[#EAE4D9] overflow-hidden transition shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-start font-black text-sm text-[#0F172A] flex items-center justify-between gap-4 hover:text-[#0284C7] transition"
                >
                  <span>{faq.q}</span>
                  <span className={`text-base font-mono transition-transform duration-200 ${activeFaq === idx ? 'rotate-180 text-[#0284C7]' : 'text-[#94A3B8]'}`}>
                    ▾
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#475569] leading-relaxed border-t border-[#F4EFE6]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. HIGH-CONVERSION CTA BANNER */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-10 sm:p-16 text-white overflow-hidden shadow-xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-slate-700">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0284C7]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-start space-y-3 max-w-2xl">
              <span className="text-xs font-black uppercase tracking-wider text-[#BAE6FD]">
                START YOUR CAREER TODAY
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                ابدأ مسيرتك المهنية بثقة واحترافية مطلقة
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                سجّل حسابك الآن كمرشح لتنشئ سيرتك المهنية المتكاملة، أو انضم كجهة توظيف معتمدة للوصول المباشر إلى أفضل الكفاءات التقنية.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0284C7] to-[#10B981] hover:from-[#0369A1] hover:to-[#059669] text-white font-black text-sm transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-center"
              >
                إنشاء حساب مجاناً ⚡
              </Link>
              <Link
                to="/company/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-sm transition text-center backdrop-blur-md"
              >
                تسجيل شركة معتمدة 🏢
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Commercial Production Footer */}
      <footer className="bg-[#0A101D] text-white pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
            {/* Col 1: Brand */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center">
                  <img src="/logo_trimmed.png" alt="شعار منارة" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-lg font-black tracking-tight block">منصة مَنَارَة</span>
                  <span className="text-[10px] font-bold text-[#BAE6FD] tracking-wider block">
                    MANARA EMPLOYMENT & MATCHING PLATFORM
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                المنصة الوطنية الرائدة لربط الكفاءات باحتياجات سوق العمل، عبر السيرة المهنية الهجينة والمطابقة الرياضية الموزونة لتمكين التوظيف العادل والفعال.
              </p>
            </div>

            {/* Col 2: Navigation */}
            <div className="space-y-3">
              <span className="text-xs font-black text-[#BAE6FD] tracking-wider block">روابط سريعة</span>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><Link to="/" className="hover:text-white transition">الصفحة الرئيسية</Link></li>
                <li><Link to="/jobs" className="hover:text-white transition">استعراض الوظائف</Link></li>
                <li><Link to="/register" className="hover:text-white transition">إنشاء حساب باحث عن عمل</Link></li>
                <li><Link to="/company/register" className="hover:text-white transition">تسجيل جهة توظيف</Link></li>
              </ul>
            </div>

            {/* Col 3: About & Terms */}
            <div className="space-y-3">
              <span className="text-xs font-black text-[#34D399] tracking-wider block">الخصوصية والأمان</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                تلتزم منصة منارة بحماية بيانات المستخدمين وسرية الملفات والتحقق الإلزامي من كافة المنشآت لضمان بيئة عمل آمنة وموثوقة.
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-[11px] font-bold text-[#BAE6FD] border border-slate-700">
                منصة وطنية معتمدة
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © 2026 منصة مَنَارَة للربط المهني والتوظيف الذكي • جميع الحقوق محفوظة
            </div>
            <div className="flex items-center gap-6">
              <Link to="/login" className="hover:text-slate-300 transition">تسجيل الدخول</Link>
              <Link to="/register" className="hover:text-slate-300 transition">إنشاء حساب</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
