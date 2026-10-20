import React from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'

export const LandingPage: React.FC = () => {
  const { isAuthenticated, role } = useProfile()

  const getDashboardLink = () => {
    if (role === 'ADMIN') return '/admin'
    if (role === 'COMPANY') return '/company/jobs'
    return '/profile'
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900" dir="rtl">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo_trimmed.png"
              alt="شعار منصة منارة"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
            <div className="text-start leading-none">
              <span className="text-lg font-black text-[#0F1E36] block tracking-tight">منصة مَنَارَة</span>
              <span className="text-[10px] font-bold text-[#F59E0B] tracking-wider block mt-0.5">MANARA PLATFORM</span>
            </div>
          </Link>

          {/* Center Navigation Links matching Screen 00 */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <Link to="/" className="text-amber-600 font-black">الرئيسية</Link>
            <a href="#features" className="hover:text-amber-600 transition">ركائز المنصة</a>
            <Link to="/jobs" className="hover:text-amber-600 transition">الفرص المتاحة</Link>
            <a href="#how-it-works" className="hover:text-amber-600 transition">كيف تعمل المنصة</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                className="px-5 py-2.5 rounded-xl bg-[#0F1E36] hover:bg-slate-900 text-white font-bold text-xs transition shadow-2xs"
              >
                الدخول للوحة التحكم ➔
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-xs"
                >
                  إنشاء حساب جديد
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold mb-6">
            <span>منظومة التوظيف الأكاديمية والمهنية الموزونة</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F1E36] tracking-tight leading-tight mb-6">
            جسر التلاقي الموثوق بين <span className="text-amber-500">الخريجين المتميزين</span> وسوق العمل
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">
            منصة مَنَارَة تجمع بين ملفات الخريجين التقنية المعتمدة واحتياجات المنشآت الوظيفية، عبر خوارزمية مطابقة رياضية موزونة تضمن تكافؤ الفرص وشفافية الاختيار.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm transition shadow-sm hover:shadow-md"
            >
              انضم كخريج باحث عن عمل ⚡
            </Link>
            <Link
              to="/company/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0F1E36] hover:bg-slate-900 text-white font-black text-sm transition shadow-sm"
            >
              سجّل كجهة توظيف معتمدة 🏢
            </Link>
          </div>
        </div>
      </section>

      {/* Official Weights Formula Ribbon matching Screen 00 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
          <div className="flex items-center gap-2 text-amber-800">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span>معايير التوافق المعتمدة رسمياً (وثيقة المتطلبات):</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-slate-700">
            <span className="bg-amber-50 text-amber-900 px-3 py-1 rounded-lg border border-amber-100">
              ✦ المهارات جاكارد: 45% (0.45)
            </span>
            <span className="bg-blue-50 text-blue-900 px-3 py-1 rounded-lg border border-blue-100">
              ✦ التخصص الأكاديمي: 25% (0.25)
            </span>
            <span className="bg-indigo-50 text-indigo-900 px-3 py-1 rounded-lg border border-indigo-100">
              ✦ سنوات الخبرة: 20% (0.20)
            </span>
            <span className="bg-emerald-50 text-emerald-900 px-3 py-1 rounded-lg border border-emerald-100">
              ✦ المؤهل العلمي: 10% (0.10)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Core Pillars / Features (4 Cards) */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 block mb-1">CORE SYSTEM PILLARS</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F1E36] mb-3">
            لماذا تمثل "منارة" الحل الوطني الأمثل لتوظيف الخريجين؟
          </h2>
          <p className="text-sm text-slate-500">
            أربعة ابتكارات تقنية مصممة خصيصاً لسد الفجوة بين مخرجات الجامعات ومتطلبات سوق العمل
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-7 shadow-xs hover:border-amber-400 transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center mb-5 text-xl">
              📄
            </div>
            <h3 className="text-base font-black text-[#0F1E36] mb-1">السيرة المهنية الهجينة</h3>
            <span className="text-[10px] font-bold text-blue-600 block mb-2 font-mono">HYBRID DIGITAL CV</span>
            <p className="text-xs text-slate-500 leading-relaxed">
              دمج السيرة الأكاديمية مع روابط المشاريع البرمجية الحية (GitHub) وتطبيقات الويب في ملف موحد.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-7 shadow-xs hover:border-amber-400 transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center mb-5 text-xl">
              🎥
            </div>
            <h3 className="text-base font-black text-[#0F1E36] mb-1">فيديو المصافحة الرقمية</h3>
            <span className="text-[10px] font-bold text-amber-600 block mb-2 font-mono">60-SEC VIDEO CV</span>
            <p className="text-xs text-slate-500 leading-relaxed">
              فيديو احترافي مدته 60 ثانية يقدم فيه الخريج مهاراته التواصلية وثقته بنفسه مباشرة لمسؤولي التوظيف.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-7 shadow-xs hover:border-amber-400 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center mb-5 text-xl">
              ⚖️
            </div>
            <h3 className="text-base font-black text-[#0F1E36] mb-1">المطابقة الموزونة</h3>
            <span className="text-[10px] font-bold text-emerald-600 block mb-2 font-mono">WEIGHTED ALGORITHM</span>
            <p className="text-xs text-slate-500 leading-relaxed">
              حساب نسبة التوافق وفق 4 معايير: المهارات 45%، التخصص 25%، والخبرة 20%، والمؤهل 10%.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-7 shadow-xs hover:border-amber-400 transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 font-bold flex items-center justify-center mb-5 text-xl">
              🛡️
            </div>
            <h3 className="text-base font-black text-[#0F1E36] mb-1">شركات موثقة وتوظيف آمن</h3>
            <span className="text-[10px] font-bold text-purple-600 block mb-2 font-mono">CR VERIFICATION</span>
            <p className="text-xs text-slate-500 leading-relaxed">
              حماية تامة من الإعلانات الوهمية عبر التدقيق الإلزامي للسجل التجاري قبل نشر أي شاغر.
            </p>
          </div>
        </div>
      </section>

      {/* 4. How Platform Works (3 Steps) */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-amber-600 block mb-1">HOW IT WORKS</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F1E36] mb-3">
              ثلاث خطوات تفصلك عن وظيفتك القادمة
            </h2>
            <p className="text-sm text-slate-500">مسار رقمي واضح وسلس لربط الموهبة بجهة التوظيف</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-[#0F1E36] text-amber-400 font-black text-xl flex items-center justify-center mx-auto shadow-xs">
                1
              </div>
              <h3 className="text-base font-black text-[#0F1E36]">أنشئ سيرتك الهجينة</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                وثّق معدلك الأكاديمي، أضف مشاريع GitHub الحية، وسجل فيديو المصافحة بدقيقة واحدة.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-[#0F1E36] text-blue-400 font-black text-xl flex items-center justify-center mx-auto shadow-xs">
                2
              </div>
              <h3 className="text-base font-black text-[#0F1E36]">المطابقة الموزونة</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                الخوارزمية تطابق ملفك مع متطلبات الوظائف وتظهر نسبة التوافق الحقيقية بشفافية.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-[#0F1E36] text-emerald-400 font-black text-xl flex items-center justify-center mx-auto shadow-xs">
                3
              </div>
              <h3 className="text-base font-black text-[#0F1E36]">المقابلة والتوظيف</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                استقبل دعوات المقابلات المباشرة من الشركات المعتمدة بدون وسطاء أو إعلانات وهمية.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Opportunities matching Screen 00 */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 block mb-1">FEATURED TECH OPPORTUNITIES</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F1E36] mb-3">
            أحدث الفرص والشواغر في الشركات المعتمدة
          </h2>
          <p className="text-sm text-slate-500">نماذج حية لشواغر وظيفية تطبق خوارزمية المطابقة الموزونة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Job 1 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:border-amber-400 transition flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                    YT
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#0F1E36]">مهندس برمجيات وتطبيقات سحابية</h3>
                    <p className="text-xs text-slate-500">شركة يمن تك • صنعاء • دوام كامل</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  مطابقة 94%
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">React.js</span>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">Node.js</span>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">PostgreSQL</span>
              </div>
            </div>
            <Link
              to="/jobs"
              className="w-full text-center py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition"
            >
              تقديم مباشر بنسبة المطابقة ➔
            </Link>
          </div>

          {/* Job 2 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:border-blue-400 transition flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                    YS
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#0F1E36]">مطور واجهات وتجربة مستخدم</h3>
                    <p className="text-xs text-slate-500">مجموعة يمن سوفت • صنعاء • هجين</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  مطابقة 91%
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">TypeScript</span>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">Next.js</span>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">Tailwind</span>
              </div>
            </div>
            <Link
              to="/jobs"
              className="w-full text-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition"
            >
              تقديم مباشر بنسبة المطابقة ➔
            </Link>
          </div>

          {/* Job 3 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:border-emerald-400 transition flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                    KB
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#0F1E36]">مهندس أمن سيبراني واختبار اختراق</h3>
                    <p className="text-xs text-slate-500">بنك الكريمي للتمويل • صنعاء • دوام كامل</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  مطابقة 88%
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">Security</span>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">SOC</span>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">Linux</span>
              </div>
            </div>
            <Link
              to="/jobs"
              className="w-full text-center py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition"
            >
              تقديم مباشر بنسبة المطابقة ➔
            </Link>
          </div>
        </div>
      </section>

      {/* 6. High-Impact CTA Banner */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0F1E36] to-blue-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black mb-3">
              جاهز لبدء مسيرتك المهنية بثقة ودون وساطة؟
            </h2>
            <p className="text-sm text-blue-200 max-w-2xl leading-relaxed">
              انضم الآن كخريج واستفد من خوارزمية المطابقة الموزونة ومميزات السيرة الهجينة المعتمدة.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition text-center shadow-xs"
            >
              أنشئ سيرتك الهجينة الآن ⚡
            </Link>
            <Link
              to="/company/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-sky-400 font-bold text-xs transition text-center"
            >
              تسجيل جهة توظيف 🏢
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-[#0F1E36] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo_trimmed.png"
              alt="شعار منصة منارة"
              className="h-9 w-auto brightness-0 invert object-contain"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
            <div className="text-start leading-none">
              <span className="text-base font-black block">منصة مَنَارَة</span>
              <span className="text-[9px] font-bold text-amber-400 tracking-wider block mt-0.5">MANARA PLATFORM</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 text-center md:text-start">
            © 2026 منصة مَنَارَة للتوظيف الأكاديمي والمهني 🇾🇪 • مشروع التخرج لقسم تقنية المعلومات • جميع الحقوق محفوظة
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
            <Link to="/login" className="hover:text-amber-400 transition">تسجيل الدخول</Link>
            <span>•</span>
            <Link to="/register" className="hover:text-amber-400 transition">تسجيل خريج</Link>
            <span>•</span>
            <Link to="/company/register" className="hover:text-amber-400 transition">تسجيل منشأة</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
