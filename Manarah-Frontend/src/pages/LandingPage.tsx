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
      className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] text-[#1E293B] dark:text-[#F8FAFC] font-sans selection:bg-[#BAE6FD] selection:text-[#0369A1] relative overflow-x-hidden transition-colors duration-300"
      dir="rtl"
    >
      {/* ==========================================================
          1. Dynamic Ambient Background Meshes & Silk Texture
          Colors: Light Sky Blue (#BAE6FD), Sukari Cream (#FAF7F2),
          Warm Champagne Beige (#E5D7C3), and Pure White Glass
          ========================================================== */}
      {/* Luxury Silk Background Texture with soft overlay */}
      <div
        className="absolute inset-0 bg-top bg-no-repeat bg-cover pointer-events-none opacity-65 dark:opacity-20 transition-opacity duration-500"
        style={{ backgroundImage: `url('/manarah_silk_bg.jpg')` }}
      />

      {/* Floating Silk Ambient Radial Flares: Sky Blue & Champagne Beige */}
      <div className="absolute top-0 right-0 w-[640px] h-[640px] bg-gradient-to-br from-[#BAE6FD]/60 via-[#E0F2FE]/40 to-transparent rounded-full blur-3xl pointer-events-none -mr-36 -mt-20" />
      <div className="absolute top-52 left-0 w-[680px] h-[680px] bg-gradient-to-tr from-[#E5D7C3]/65 via-[#FAF7F2]/75 to-transparent rounded-full blur-3xl pointer-events-none -ml-44" />
      <div className="absolute top-[1200px] right-1/4 w-[750px] h-[750px] bg-gradient-to-r from-[#BAE6FD]/40 via-[#E5D7C3]/45 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Scattered Crystal Sparkles (✦, ✧, ✨) */}
      <div className="absolute top-28 right-[12%] text-[#38BDF8] text-xl animate-twinkle pointer-events-none select-none">✦</div>
      <div className="absolute top-44 left-[15%] text-[#8C6D53] text-lg animate-twinkle pointer-events-none select-none delay-500">✧</div>
      <div className="absolute top-[520px] right-[8%] text-[#BAE6FD] text-2xl animate-twinkle pointer-events-none select-none delay-1000">✨</div>
      <div className="absolute top-[680px] left-[10%] text-[#38BDF8] text-xl animate-twinkle pointer-events-none select-none delay-700">✦</div>
      <div className="absolute top-[1400px] left-[8%] text-[#8C6D53] text-xl animate-twinkle pointer-events-none select-none">✧</div>
      <div className="absolute top-[1600px] right-[10%] text-[#38BDF8] text-2xl animate-twinkle pointer-events-none select-none delay-300">✨</div>

      {/* ==========================================================
          2. Header / Navigation (Frosted Glass + Silk Palette)
          ========================================================== */}
      <header className="sticky top-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border-b border-[#E8DEC8]/80 dark:border-slate-800 shadow-[0_4px_25px_rgba(200,180,150,0.08)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo with Sky Blue & Champagne Glow */}
          <BrandLogo />

          {/* Center Navigation Links in Creamy Beige Capsule */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-[#FAF7F2]/90 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-[#E8DEC8] dark:border-slate-700 text-xs font-bold text-[#5C5046] dark:text-slate-300 shadow-2xs">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-[#0284C7] font-black shadow-xs border border-[#BAE6FD]/80 dark:border-slate-700"
            >
              الرئيسية
            </Link>
            <a
              href="#bento-demo"
              className="px-4 py-2 rounded-xl hover:text-[#0284C7] hover:bg-white/80 dark:hover:bg-slate-700/60 transition"
            >
              نظام المطابقة
            </a>
            <a
              href="#pillars"
              className="px-4 py-2 rounded-xl hover:text-[#0284C7] hover:bg-white/80 dark:hover:bg-slate-700/60 transition"
            >
              المميزات
            </a>
            <Link
              to="/jobs"
              className="px-4 py-2 rounded-xl hover:text-[#0284C7] hover:bg-white/80 dark:hover:bg-slate-700/60 transition"
            >
              الوظائف المتاحة
            </Link>
            <a
              href="#enterprise-trust"
              className="px-4 py-2 rounded-xl hover:text-[#0284C7] hover:bg-white/80 dark:hover:bg-slate-700/60 transition"
            >
              للشركات المعتمدة
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#60A5FA] via-[#38BDF8] to-[#0284C7] hover:from-[#38BDF8] hover:to-[#0284C7] text-white font-black text-xs transition-all duration-200 shadow-[0_8px_20px_rgba(56,189,248,0.35)] hover:shadow-[0_12px_28px_rgba(56,189,248,0.45)] hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>لوحة التحكم</span>
                <span>➔</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6C4F3D] dark:text-slate-200 hover:text-[#0284C7] hover:bg-[#FAF7F2] dark:hover:bg-slate-800 border border-[#E5D7C3] dark:border-slate-700 transition"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/register"
                  className="relative group px-5 py-2.5 rounded-xl text-white font-black text-xs transition-all duration-300 shadow-[0_8px_24px_rgba(56,189,248,0.38)] hover:shadow-[0_12px_32px_rgba(56,189,248,0.5)] hover:scale-[1.03]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#60A5FA] via-[#38BDF8] to-[#0284C7] rounded-xl transition-all duration-300" />
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

      {/* ==========================================================
          3. Hero Section (Headline, CTAs, and Centerpiece Showcase)
          ========================================================== */}
      <section className="relative pt-14 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Status Pill in Frosted Cream & Sky Blue */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FDFBF7]/95 dark:bg-slate-800/95 backdrop-blur-md border border-[#E8DEC8] dark:border-slate-700 text-[#6C4F3D] dark:text-sky-300 text-xs font-bold mb-8 shadow-xs hover:border-[#BAE6FD] transition-all duration-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38BDF8] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0284C7]" />
            </span>
            <span className="font-bold">✦ المنظومة الوطنية المعتمدة للتوظيف والربط الخوارزمي الذكي ✦</span>
          </div>

          {/* Main Hero Headline in Sky Blue + Mocha Gradient */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#1E293B] dark:text-white tracking-tight leading-[1.18] mb-8 max-w-5xl mx-auto">
            جسر التلاقي المباشر بين{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#0284C7] via-[#38BDF8] to-[#8C6D53] bg-clip-text text-transparent">
                الكفاءات المتميزة
              </span>
              <span className="absolute bottom-2 left-0 right-0 h-3 bg-[#BAE6FD]/50 rounded-full -rotate-1 -z-0" />
            </span>{' '}
            وكبرى منشآت الأعمال
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-[#5C5046] dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
            منصة مَنَارَة تجمع بين <strong className="font-bold text-[#0284C7]">الملف المهني الرقمي المتكامل (GitHub + Video CV)</strong> و<strong className="font-bold text-[#6C4F3D] dark:text-[#E5D7C3]">خوارزمية مطابقة رياضية موزونة</strong> تقضي على الوساطة وتضمن الشفافية والعدالة وسرعة التوظيف.
          </p>

          {/* Action CTAs in Silk Sky Blue and Champagne Beige */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 max-w-md mx-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#60A5FA] via-[#38BDF8] to-[#0284C7] hover:from-[#38BDF8] hover:to-[#0369A1] text-white font-black text-sm transition-all duration-300 shadow-[0_14px_36px_rgba(56,189,248,0.42)] hover:shadow-[0_18px_44px_rgba(56,189,248,0.52)] hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
            >
              <span>انضم الآن كباحث عن عمل</span>
              <span className="group-hover:translate-x-1 transition-transform">⚡</span>
            </Link>
            <Link
              to="/company/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#FDFBF7]/95 dark:bg-slate-800/95 hover:bg-white dark:hover:bg-slate-750 text-[#6C4F3D] dark:text-slate-100 font-black text-sm border border-[#E5D7C3] dark:border-slate-700 shadow-[0_8px_20px_rgba(200,180,155,0.15)] hover:shadow-md hover:border-[#BAE6FD] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>تسجيل منشأة أعمال</span>
              <span>🏢</span>
            </Link>
          </div>

          {/* ==========================================================
              SHOWSTOPPER CENTERPIECE CARD: Frosted Glassmorphism Showcase
              Inspired directly by the user's reference image:
              Glassmorphism, soft silk wave backdrop, warm mocha title,
              sky blue pill buttons, and crystal sparkles!
              ========================================================== */}
          <div className="glass-silk-card rounded-3xl p-6 sm:p-10 max-w-4xl mx-auto my-14 relative overflow-hidden border border-white/90 dark:border-slate-700 text-start">
            {/* Soft decorative silk accents in corners */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#BAE6FD]/40 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#E5D7C3]/50 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Card Header matching the reference image */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-5 border-b border-[#E8DEC8]/70 dark:border-slate-700">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#38BDF8] via-[#BAE6FD] to-[#E5D7C3] p-0.5 shadow-sm">
                  <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center text-xl font-black text-[#0284C7]">
                    ✦
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#0284C7] dark:text-sky-300 block mb-0.5">
                    بوابة التوظيف والربط الخوارزمي
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#6C4F3D] dark:text-white">
                    مرحباً بك في منصة مَنَارَة
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-3.5 py-1.5 rounded-full bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-ping" />
                  مطابقة فورية في الزمن الحقيقي
                </span>
              </div>
            </div>

            {/* Dual Live Preview Panels: Graduate Profile vs Verified Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {/* Panel 1: Candidate Card */}
              <div className="bg-white/90 dark:bg-slate-800/90 rounded-2xl p-5 border border-[#E8DEC8] dark:border-slate-700 shadow-2xs hover:border-[#BAE6FD] transition duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#60A5FA] to-[#38BDF8] text-white font-black flex items-center justify-center text-xs shadow-xs">
                      أ.س
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#1E293B] dark:text-white">أحمد علي سالم</h4>
                      <span className="text-[11px] text-[#64748B] dark:text-slate-400">مهندس برمجيات • خريج حاسوب</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-[#E0F2FE] text-[#0284C7] text-[11px] font-black border border-[#BAE6FD]">
                    ⭐ ممتاز (94.2%)
                  </span>
                </div>

                {/* Candidate Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3 text-[11px] font-bold">
                  <span className="px-2.5 py-1 rounded-md bg-[#FAF7F2] dark:bg-slate-700 text-[#8C6D53] dark:text-amber-300 border border-[#E8DEC8] dark:border-slate-600">
                    🎓 مشروع تخرج معتمد
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#FAF7F2] dark:bg-slate-700 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD]">
                    💻 GitHub Repo
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#FAF7F2] dark:bg-slate-700 text-[#6C4F3D] dark:text-amber-200 border border-[#E8DEC8]">
                    🎥 Video CV (60 ثانية)
                  </span>
                </div>

                {/* Skills Chips */}
                <div className="flex flex-wrap gap-1 pt-2 border-t border-[#F4EFE6] dark:border-slate-700/60">
                  {['Python', 'React.js', 'PostgreSQL', 'Docker'].map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded bg-[#FAF7F2] dark:bg-slate-900 text-[#5C5046] dark:text-slate-300 text-[10px] font-mono border border-[#E8DEC8]/60 dark:border-slate-800"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Panel 2: Verified Enterprise Card */}
              <div className="bg-white/90 dark:bg-slate-800/90 rounded-2xl p-5 border border-[#E8DEC8] dark:border-slate-700 shadow-2xs hover:border-[#BAE6FD] transition duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8C6D53] to-[#E5D7C3] text-white font-black flex items-center justify-center text-xs shadow-xs">
                      ي.ت
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#1E293B] dark:text-white">مجموعة يمن تك المعتمدة</h4>
                      <span className="text-[11px] text-[#64748B] dark:text-slate-400">سجل تجاري موثق 100% 🛡️</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] dark:bg-slate-700 text-[#8C6D53] dark:text-amber-300 text-[11px] font-black border border-[#E8DEC8]">
                    ✓ منشأة موثقة
                  </span>
                </div>

                {/* Job Offer Snapshot */}
                <div className="bg-[#FAF7F2] dark:bg-slate-900/80 p-3 rounded-xl border border-[#E8DEC8]/80 dark:border-slate-700 mb-3">
                  <span className="text-[10px] font-bold text-[#0284C7] block mb-0.5">الشاغر النشط:</span>
                  <div className="text-xs font-black text-[#1E293B] dark:text-white">
                    مهندس برمجيات سحابية وتطبيقات ذكية
                  </div>
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400">صنعاء • دوام كامل • مطابقة موزونة</span>
                </div>

                {/* Weights Preview */}
                <div className="text-[11px] text-[#6C4F3D] dark:text-slate-300 font-bold flex items-center justify-between pt-1">
                  <span>معايير التقييم:</span>
                  <span className="text-[#0284C7] font-mono">65% مهارات • 25% تخصص • 10% مؤهل</span>
                </div>
              </div>
            </div>

            {/* Bottom Controls matching reference image style */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E8DEC8]/70 dark:border-slate-700 text-xs">
              <span className="text-[#64748B] dark:text-slate-400 font-normal">
                هل ترغب في تجربة خوارزمية المطابقة فوراً؟
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="#bento-demo"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#60A5FA] to-[#0284C7] text-white font-black shadow-xs hover:shadow-md transition duration-200 flex items-center gap-1.5"
                >
                  <span>اختبر محاكاة المطابقة</span>
                  <span>⚙️</span>
                </a>
              </div>
            </div>
          </div>

          {/* Trust Metrics Bar in Frosted Cream & Champagne Beige */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/95 dark:bg-slate-800/90 backdrop-blur-md p-5 rounded-2xl border border-[#E8DEC8] dark:border-slate-700 shadow-2xs hover:border-[#BAE6FD] transition">
              <div className="text-2xl sm:text-3xl font-black text-[#0284C7]">
                96.4%
              </div>
              <div className="text-xs font-bold text-[#64748B] dark:text-slate-400 mt-1">دقة المطابقة والتوافق</div>
            </div>
            <div className="bg-white/95 dark:bg-slate-800/90 backdrop-blur-md p-5 rounded-2xl border border-[#E8DEC8] dark:border-slate-700 shadow-2xs hover:border-[#E5D7C3] transition">
              <div className="text-2xl sm:text-3xl font-black text-[#8C6D53] dark:text-amber-400">
                100%
              </div>
              <div className="text-xs font-bold text-[#64748B] dark:text-slate-400 mt-1">سجلات تجارية موثقة</div>
            </div>
            <div className="bg-white/95 dark:bg-slate-800/90 backdrop-blur-md p-5 rounded-2xl border border-[#E8DEC8] dark:border-slate-700 shadow-2xs hover:border-[#BAE6FD] transition">
              <div className="text-2xl sm:text-3xl font-black text-[#38BDF8]">
                60 ثانية
              </div>
              <div className="text-xs font-bold text-[#64748B] dark:text-slate-400 mt-1">فيديو المصافحة الرقمية</div>
            </div>
            <div className="bg-white/95 dark:bg-slate-800/90 backdrop-blur-md p-5 rounded-2xl border border-[#E8DEC8] dark:border-slate-700 shadow-2xs hover:border-[#E5D7C3] transition">
              <div className="text-2xl sm:text-3xl font-black text-[#6C4F3D] dark:text-amber-200">
                0 وساطة
              </div>
              <div className="text-xs font-bold text-[#64748B] dark:text-slate-400 mt-1">ترتيب خوارزمي تنازلي</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          4. SHOWSTOPPER BENTO GRID & INTERACTIVE JACCARD SIMULATOR
          Updated with Light Sky Blue, Sukari Cream, and Warm Beige
          ========================================================== */}
      <section id="bento-demo" className="py-20 bg-gradient-to-b from-[#FDFBF7] via-[#FAF7F2] to-white dark:from-[#0B1120] dark:via-slate-900 dark:to-[#0B1120] border-y border-[#E8DEC8] dark:border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E0F2FE] dark:bg-sky-950/60 border border-[#BAE6FD] dark:border-sky-800 text-[#0284C7] dark:text-sky-300 text-xs font-bold mb-3">
              <span>✦ نظام المطابقة الموزونة الذكي (Weighted Matching) ✦</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] dark:text-white mb-4">
              كيف تختار المنشآت أفضل المرشحين بدقة وموضوعية؟
            </h2>
            <p className="text-sm sm:text-base text-[#5C5046] dark:text-slate-400 leading-relaxed">
              تعمل خوارزمية جاكارد الرياضية الموزونة على مقارنة متطلبات الشاغر مع بيانات المرشح واحتساب درجة التوافق في الزمن الحقيقي
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bento Card 1: Interactive Match Calculator (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#FAF7F2] dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-[#E0F2FE] dark:bg-sky-950 text-[#0284C7] flex items-center justify-center font-black text-lg border border-[#BAE6FD]">
                      ⚙️
                    </span>
                    <div>
                      <h3 className="text-base font-black text-[#1E293B] dark:text-white">
                        محاكاة احتساب درجة المطابقة
                      </h3>
                      <p className="text-xs text-[#64748B] dark:text-slate-400">اختر الوظيفة لمشاهدة توزيع المعايير والنسب الموزونة</p>
                    </div>
                  </div>

                  {/* Switch between 3 jobs */}
                  <div className="flex bg-[#FAF7F2] dark:bg-slate-800 p-1 rounded-xl text-xs font-bold text-[#5C5046] dark:text-slate-300 border border-[#E8DEC8] dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setActiveTab('job1')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        activeTab === 'job1'
                          ? 'bg-[#0284C7] text-white shadow-2xs'
                          : 'hover:text-[#1E293B] dark:hover:text-white'
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
                          : 'hover:text-[#1E293B] dark:hover:text-white'
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
                          : 'hover:text-[#1E293B] dark:hover:text-white'
                      }`}
                    >
                      أمن سيبراني
                    </button>
                  </div>
                </div>

                {/* Job Title & Corporate Details */}
                <div className="bg-gradient-to-r from-[#FDFBF7] via-[#E0F2FE]/50 to-[#FAF7F2] dark:from-slate-800/80 dark:via-sky-950/40 dark:to-slate-800/80 p-4 rounded-2xl border border-[#E8DEC8] dark:border-slate-700 mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#0284C7] dark:text-sky-300 block mb-0.5">الشاغر المعروض:</span>
                    <h4 className="text-sm font-black text-[#1E293B] dark:text-white">{currentJob.title}</h4>
                    <span className="text-xs text-[#64748B] dark:text-slate-400">{currentJob.company} • {currentJob.location}</span>
                  </div>

                  <div className="text-center px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-[#BAE6FD] dark:border-slate-700 shadow-2xs">
                    <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 block">درجة التوافق النهائية</span>
                    <span className="text-2xl font-black bg-gradient-to-r from-[#0284C7] to-[#38BDF8] bg-clip-text text-transparent">
                      {currentJob.totalScore}%
                    </span>
                  </div>
                </div>

                {/* The 4 Criteria Progress Bars */}
                <div className="space-y-4">
                  {/* Criterion 1: Skills Jaccard (45%) */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                      <span className="text-[#1E293B] dark:text-white flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
                        <span>معيار المهارات التقنية (مؤشر جاكارد Jaccard) - الوزن: 45%</span>
                      </span>
                      <span className="text-[#0284C7] font-mono font-black">{currentJob.skillsScore}%</span>
                    </div>
                    <div className="w-full bg-[#E0F2FE] dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#0284C7] to-[#38BDF8] h-full rounded-full transition-all duration-700"
                        style={{ width: `${currentJob.skillsScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Criterion 2: Major (25%) */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                      <span className="text-[#1E293B] dark:text-white flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#8C6D53]" />
                        <span>معيار التخصص المهني والأكاديمي - الوزن: 25%</span>
                      </span>
                      <span className="text-[#8C6D53] dark:text-amber-300 font-mono font-black">{currentJob.majorScore}%</span>
                    </div>
                    <div className="w-full bg-[#FAF7F2] dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-[#E8DEC8]/50 dark:border-slate-700">
                      <div
                        className="bg-gradient-to-r from-[#8C6D53] to-[#C4AB8E] h-full rounded-full transition-all duration-700"
                        style={{ width: `${currentJob.majorScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Criterion 3: Experience (20%) */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                      <span className="text-[#1E293B] dark:text-white flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                        <span>معيار الخبرة العملية والمشاريع المنجزة - الوزن: 20%</span>
                      </span>
                      <span className="text-[#0284C7] dark:text-sky-300 font-mono font-black">{currentJob.expScore}%</span>
                    </div>
                    <div className="w-full bg-[#E0F2FE] dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#38BDF8] to-[#7DD3FC] h-full rounded-full transition-all duration-700"
                        style={{ width: `${currentJob.expScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Criterion 4: Qualification (10%) */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                      <span className="text-[#1E293B] dark:text-white flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#6C4F3D]" />
                        <span>معيار المؤهل العلمي والمعدل - الوزن: 10%</span>
                      </span>
                      <span className="text-[#6C4F3D] dark:text-amber-200 font-mono font-black">{currentJob.qualScore}%</span>
                    </div>
                    <div className="w-full bg-[#FAF7F2] dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-[#E8DEC8]/50 dark:border-slate-700">
                      <div
                        className="bg-gradient-to-r from-[#6C4F3D] to-[#A88B70] h-full rounded-full transition-all duration-700"
                        style={{ width: `${currentJob.qualScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Formula Footer */}
              <div className="mt-6 pt-4 border-t border-[#FAF7F2] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#64748B] dark:text-slate-400 font-mono">
                <span>المعادلة المعتمدة: Score = (0.45×S) + (0.25×M) + (0.20×E) + (0.10×Q)</span>
                <span className="text-[#0284C7] font-bold bg-[#E0F2FE] dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-[#BAE6FD]">
                  ✓ متوافق مع متطلبات الشاغر
                </span>
              </div>
            </div>

            {/* Bento Card 2: Candidate Live Profile Showcase (5 cols) in Royal Azure & Mocha Glass */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#0B1E36] via-[#142D4D] to-[#251D17] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col justify-between relative overflow-hidden border border-[#D4C3A3]/40">
              <div className="absolute top-0 right-0 w-60 h-60 bg-[#38BDF8]/15 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#60A5FA] via-[#38BDF8] to-[#E5D7C3] text-white font-black flex items-center justify-center text-base shadow-sm">
                      أ.س
                    </div>
                    <div>
                      <h4 className="text-base font-black flex items-center gap-2">
                        <span>أحمد علي سالم</span>
                        <span className="text-xs text-[#38BDF8] bg-[#0284C7]/30 px-2.5 py-0.5 rounded-full border border-[#38BDF8]/40">
                          ملف موثق ✓
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300">مهندس برمجيات • تخصص أنظمة سحابية وتطبيقات ويب</p>
                    </div>
                  </div>
                </div>

                {/* 60s Video CV Mockup inside Bento */}
                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700/70 mb-5 relative group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#FDE68A] flex items-center gap-1.5">
                      <span>🎥</span>
                      <span>فيديو المصافحة الرقمية (60 ثانية)</span>
                    </span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">01:00 دقيقة</span>
                  </div>
                  <div className="h-24 bg-[#081320] rounded-xl flex items-center justify-center relative overflow-hidden border border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-6 bg-[#38BDF8] animate-pulse rounded-full" />
                      <span className="w-1 h-10 bg-[#60A5FA] animate-pulse rounded-full" />
                      <span className="w-1 h-4 bg-[#FDE68A] animate-pulse rounded-full" />
                      <span className="w-1 h-12 bg-[#BAE6FD] animate-pulse rounded-full" />
                      <span className="w-1 h-7 bg-[#38BDF8] animate-pulse rounded-full" />
                      <span className="w-1 h-3 bg-[#E5D7C3] rounded-full" />
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
                        className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-[#BAE6FD] border border-[#38BDF8]/40 text-xs font-bold font-mono"
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
                  <span>💻</span>
                  <span>معرض المشاريع: github.com/ahmed-salem</span>
                </span>
                <span className="text-[#FDE68A] font-bold">⭐ تقييم ممتاز (94%)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          5. CORE SYSTEM PILLARS (Pillars in Luxury Silk Palette)
          ========================================================== */}
      <section id="pillars" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-wider text-[#0284C7] dark:text-sky-300 block mb-2">
            KEY INNOVATIONS • ركائز المنظومة
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] dark:text-white mb-4">
            أربع ركائز تميز منصة "منارة" عن منصات التوظيف التقليدية
          </h2>
          <p className="text-sm sm:text-base text-[#5C5046] dark:text-slate-400">
            حلول رقمية متكاملة مصممة لرفع كفاءة عمليات التوظيف وربط المهارات الحقيقية بالفرص الموثقة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-8 shadow-2xs hover:border-[#BAE6FD] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-[#E0F2FE] dark:bg-sky-950 text-[#0284C7] border border-[#BAE6FD] flex items-center justify-center text-2xl mb-6 shadow-2xs group-hover:scale-110 transition duration-300">
              ⚡
            </div>
            <h3 className="text-lg font-black text-[#1E293B] dark:text-white mb-2">الملف المهني الهجين</h3>
            <span className="text-[10px] font-black text-[#0284C7] dark:text-sky-300 block mb-3 font-mono">HYBRID DIGITAL CV</span>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              تجاوز السير الورقية التقليدية؛ ملف رقمي شامل يربط مشاريع GitHub الحية وتطبيقات الويب والمؤهلات في واجهة موحدة.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-8 shadow-2xs hover:border-[#E5D7C3] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800 text-[#8C6D53] dark:text-amber-300 border border-[#E8DEC8] dark:border-slate-700 flex items-center justify-center text-2xl mb-6 shadow-2xs group-hover:scale-110 transition duration-300">
              🎥
            </div>
            <h3 className="text-lg font-black text-[#1E293B] dark:text-white mb-2">فيديو المصافحة الرقمية</h3>
            <span className="text-[10px] font-black text-[#8C6D53] dark:text-amber-300 block mb-3 font-mono">60-SEC VIDEO CV</span>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              مقطع فيديو تعريفي احترافي مدته 60 ثانية يبرز مهارات التواصل والثقة بالنفس مباشرة لمسؤولي التوظيف مع خيارات خصوصية آمنة.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-8 shadow-2xs hover:border-[#BAE6FD] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-[#E0F2FE] dark:bg-sky-950 text-[#0284C7] border border-[#BAE6FD] flex items-center justify-center text-2xl mb-6 shadow-2xs group-hover:scale-110 transition duration-300">
              📐
            </div>
            <h3 className="text-lg font-black text-[#1E293B] dark:text-white mb-2">المطابقة الرياضية الموزونة</h3>
            <span className="text-[10px] font-black text-[#0284C7] dark:text-sky-300 block mb-3 font-mono">WEIGHTED JACCARD SIMILARITY</span>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              استبعاد الفرز اليدوي والانحياز البشري؛ يتم احتساب التوافق تلقائياً وترتيب المرشحين تنازلياً وفق معايير موضوعية.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-8 shadow-2xs hover:border-[#E5D7C3] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800 text-[#6C4F3D] dark:text-amber-200 border border-[#E8DEC8] dark:border-slate-700 flex items-center justify-center text-2xl mb-6 shadow-2xs group-hover:scale-110 transition duration-300">
              🛡️
            </div>
            <h3 className="text-lg font-black text-[#1E293B] dark:text-white mb-2">توثيق المنشآت والشركات</h3>
            <span className="text-[10px] font-black text-[#6C4F3D] dark:text-amber-200 block mb-3 font-mono">ENTERPRISE VERIFICATION</span>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              بيئة عمل موثوقة 100%؛ تخضع كل منشأة لتدقيق إلزامي لوثيقة السجل التجاري قبل منحها صلاحية نشر الوظائف أو استعراض الكفاءات.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================================
          6. ENTERPRISE TRUST & SECURITY SECTION
          Royal Azure Satin Banner with Champagne Gold Accents
          ========================================================== */}
      <section id="enterprise-trust" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0B1E36] via-[#142F4D] to-[#251D17] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-[#D4C3A3]/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#38BDF8]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center lg:text-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#BAE6FD]/15 border border-[#38BDF8]/30 text-[#BAE6FD] text-xs font-bold">
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
                <span>✦ قاعدة بيانات موثوقة PostgreSQL (manarah_db1)</span>
                <span>✦ تشفير الملفات والاتصال الآمن HTTPS</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center min-w-[260px]">
              <span className="text-[11px] font-bold text-[#BAE6FD] block mb-1">بيئة توظيف موثوقة</span>
              <span className="text-3xl font-black text-white block mb-2">100% تدقيق</span>
              <p className="text-xs text-slate-300">
                حماية شاملة للمرشحين والمنشآت من الإعلانات العشوائية والحسابات غير الموثقة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          7. FEATURED JOBS WITH LIVE CATEGORY FILTER
          ========================================================== */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#0284C7] dark:text-sky-300 block mb-2">
              OPPORTUNITIES RADAR • رادار الفرص
            </span>
            <h2 className="text-3xl font-black text-[#1E293B] dark:text-white">
              أحدث الشواغر المطروحة في الشركات المعتمدة
            </h2>
            <p className="text-sm text-[#5C5046] dark:text-slate-400 mt-1">
              شواغر نشطة تخضع مباشرة لخوارزمية المطابقة الموزونة
            </p>
          </div>

          {/* Category Chips in Cream-Beige Capsule */}
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
                    : 'bg-white dark:bg-slate-800 text-[#5C5046] dark:text-slate-300 border border-[#E8DEC8] dark:border-slate-700 hover:bg-[#FAF7F2]'
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-6 shadow-2xs hover:border-[#BAE6FD] hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] dark:bg-sky-950 text-[#0284C7] font-black flex items-center justify-center text-sm border border-[#BAE6FD]">
                    YT
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#1E293B] dark:text-white leading-tight">مهندس برمجيات سحابية وتطبيقات</h3>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">مجموعة يمن تك • دوام كامل</p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#0284C7] bg-[#E0F2FE] dark:bg-sky-950/60 px-2.5 py-1 rounded-xl border border-[#BAE6FD]">
                  مطابقة 94%
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-6">
                <span className="text-[10px] font-bold text-[#5C5046] dark:text-slate-300 bg-[#FAF7F2] dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-[#E8DEC8]/50 dark:border-slate-700">React.js</span>
                <span className="text-[10px] font-bold text-[#5C5046] dark:text-slate-300 bg-[#FAF7F2] dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-[#E8DEC8]/50 dark:border-slate-700">Python</span>
                <span className="text-[10px] font-bold text-[#5C5046] dark:text-slate-300 bg-[#FAF7F2] dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-[#E8DEC8]/50 dark:border-slate-700">PostgreSQL</span>
              </div>
            </div>

            <Link
              to="/jobs"
              className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-[#60A5FA] via-[#38BDF8] to-[#0284C7] hover:from-[#38BDF8] hover:to-[#0284C7] text-white font-black text-xs transition shadow-2xs flex items-center justify-center gap-1.5"
            >
              <span>تقديم مباشر بنسبة التوافق</span>
              <span>➔</span>
            </Link>
          </div>

          {/* Job Card 2 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-6 shadow-2xs hover:border-[#E5D7C3] hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800 text-[#8C6D53] dark:text-amber-300 font-black flex items-center justify-center text-sm border border-[#E8DEC8] dark:border-slate-700">
                    YS
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#1E293B] dark:text-white leading-tight">مطور واجهات وتجربة مستخدم</h3>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">مجموعة يمن سوفت • هجين</p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#8C6D53] dark:text-amber-300 bg-[#FAF7F2] dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-[#E8DEC8] dark:border-slate-700">
                  مطابقة 91%
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-6">
                <span className="text-[10px] font-bold text-[#5C5046] dark:text-slate-300 bg-[#FAF7F2] dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-[#E8DEC8]/50 dark:border-slate-700">TypeScript</span>
                <span className="text-[10px] font-bold text-[#5C5046] dark:text-slate-300 bg-[#FAF7F2] dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-[#E8DEC8]/50 dark:border-slate-700">Next.js</span>
                <span className="text-[10px] font-bold text-[#5C5046] dark:text-slate-300 bg-[#FAF7F2] dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-[#E8DEC8]/50 dark:border-slate-700">Tailwind</span>
              </div>
            </div>

            <Link
              to="/jobs"
              className="w-full text-center py-3 rounded-xl bg-[#1E293B] dark:bg-slate-800 hover:bg-slate-800 text-white font-black text-xs transition shadow-2xs flex items-center justify-center gap-1.5"
            >
              <span>تقديم مباشر بنسبة التوافق</span>
              <span>➔</span>
            </Link>
          </div>

          {/* Job Card 3 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-6 shadow-2xs hover:border-[#BAE6FD] hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] dark:bg-sky-950 text-[#0284C7] font-black flex items-center justify-center text-sm border border-[#BAE6FD]">
                    KB
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#1E293B] dark:text-white leading-tight">مهندس أمن سيبراني واختبار اختراق</h3>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">بنك الكريمي للتمويل • حضوري</p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#0284C7] bg-[#E0F2FE] dark:bg-sky-950/60 px-2.5 py-1 rounded-xl border border-[#BAE6FD]">
                  مطابقة 88%
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-6">
                <span className="text-[10px] font-bold text-[#5C5046] dark:text-slate-300 bg-[#FAF7F2] dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-[#E8DEC8]/50 dark:border-slate-700">Security</span>
                <span className="text-[10px] font-bold text-[#5C5046] dark:text-slate-300 bg-[#FAF7F2] dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-[#E8DEC8]/50 dark:border-slate-700">SOC</span>
                <span className="text-[10px] font-bold text-[#5C5046] dark:text-slate-300 bg-[#FAF7F2] dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-[#E8DEC8]/50 dark:border-slate-700">Linux</span>
              </div>
            </div>

            <Link
              to="/jobs"
              className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-[#60A5FA] via-[#38BDF8] to-[#0284C7] hover:from-[#38BDF8] hover:to-[#0284C7] text-white font-black text-xs transition shadow-2xs flex items-center justify-center gap-1.5"
            >
              <span>تقديم مباشر بنسبة التوافق</span>
              <span>➔</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================================
          8. FREQUENTLY ASKED QUESTIONS (FAQ)
          ========================================================== */}
      <section className="py-20 bg-[#FAF7F2]/60 dark:bg-slate-900/60 border-t border-[#E8DEC8] dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-black text-[#0284C7] dark:text-sky-300 block mb-2">FAQ & INFORMATION • الأسئلة الشائعة</span>
            <h2 className="text-3xl font-black text-[#1E293B] dark:text-white mb-3">الأسئلة الشائعة</h2>
            <p className="text-sm text-[#5C5046] dark:text-slate-400">إجابات شاملة حول آلية عمل المنصة وخدماتها الذكية</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'كيف تضمن خوارزمية جاكارد الموزونة العدالة في الاختيار؟',
                a: 'تقوم الخوارزمية بمقارنة المهارات التقنية والمهنية للمرشح مع متطلبات الوظيفة بصورة آلية بنسبة 45% عبر معامل تشابه جاكارد الرياضي، مع دمج 25% للتخصص، و20% لسنوات الخبرة (مع تعويض حديثي التخرج عبر مشاريع التخرج وروابط GitHub)، و10% للمؤهل، مما يعطي كل متقدم درجة دقيقة من 100% بدون أي تدخل يدوي.',
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
                className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E8DEC8] dark:border-slate-800 overflow-hidden transition shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-start font-black text-sm text-[#1E293B] dark:text-white flex items-center justify-between gap-4 hover:text-[#0284C7] transition"
                >
                  <span>{faq.q}</span>
                  <span className={`text-base font-mono transition-transform duration-200 ${activeFaq === idx ? 'rotate-180 text-[#0284C7]' : 'text-[#8C6D53]'}`}>
                    ▾
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#5C5046] dark:text-slate-300 leading-relaxed border-t border-[#FAF7F2] dark:border-slate-800">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================
          9. HIGH-CONVERSION CTA BANNER
          ========================================================== */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-10 sm:p-16 text-white overflow-hidden shadow-xl bg-gradient-to-r from-[#0B1E36] via-[#142F4D] to-[#251D17] border border-[#D4C3A3]/50">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#38BDF8]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E5D7C3]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-start space-y-3 max-w-2xl">
              <span className="text-xs font-black uppercase tracking-wider text-[#BAE6FD]">
                START YOUR CAREER TODAY • ابدأ اليوم
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
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#60A5FA] via-[#38BDF8] to-[#0284C7] hover:from-[#38BDF8] hover:to-[#0284C7] text-white font-black text-sm transition shadow-[0_10px_28px_rgba(56,189,248,0.4)] hover:shadow-xl hover:-translate-y-0.5 text-center"
              >
                إنشاء حساب مجاناً ⚡
              </Link>
              <Link
                to="/company/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-sm transition text-center backdrop-blur-md"
              >
                تسجيل شركة معتمدة 🏢
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          10. Production Footer (Deep Royal Navy-Azure & Silk Accents)
          ========================================================== */}
      <footer className="bg-[#0B1524] text-white pt-16 pb-12 border-t border-slate-800">
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
                    MANARAH EMPLOYMENT & SMART MATCHING PLATFORM
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
              <span className="text-xs font-black text-[#E5D7C3] tracking-wider block">الخصوصية والأمان</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                تلتزم منصة منارة بحماية بيانات المستخدمين وسرية الملفات والتحقق الإلزامي من كافة المنشآت لضمان بيئة عمل آمنة وموثوقة.
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-[11px] font-bold text-[#BAE6FD] border border-slate-700">
                قاعدة بيانات معتمدة: manarah_db1
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
