import React from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { useProfile } from '../context/ProfileContext'

export const ProfileViewPage: React.FC = () => {
  const { profile } = useProfile()

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
        {/* ================= HERO PROFILE CARD ================= */}
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 sm:p-8 shadow-[0_4px_12px_rgba(15,30,54,0.05)] relative overflow-hidden">
          {/* Subtle Top Gradient Banner */}
          <div className="absolute top-0 right-0 left-0 h-10 bg-gradient-to-l from-[#FEF3C7]/90 via-[#FFFBEB]/50 to-white pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
            {/* Right in RTL: Avatar & Identity Block */}
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5">
              <div className="relative shrink-0">
                <div className="w-[85px] h-[85px] rounded-[20px] bg-[#0F1E36] text-white text-[28px] font-black flex items-center justify-center shadow-sm">
                  ج.ص
                </div>
                {/* Verified Badge */}
                <span
                  className="absolute -bottom-1 -left-1 w-[26px] h-[26px] rounded-full bg-[#10B981] border-[3px] border-white text-white text-[11px] font-bold flex items-center justify-center shadow-sm"
                  title="سجل موثق رسمياً"
                >
                  ✓
                </span>
              </div>

              <div className="text-center sm:text-right space-y-2">
                {/* Line 1: Name */}
                <h1 className="text-[22px] font-black text-[#0F1E36] leading-tight">
                  {profile.name}
                </h1>

                {/* Line 2: Role Badge & University */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <span className="px-3 py-1 rounded-[6px] bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-[11px] font-bold">
                    مهندس برمجيات
                  </span>
                  <span className="text-[12px] font-semibold text-[#475569]">
                    {profile.university} • كلية الحاسبات وتكنولوجيا المعلومات
                  </span>
                </div>

                {/* Line 3: Meta Details */}
                <p className="text-[12px] font-medium text-[#64748B]">
                  صنعاء، اليمن  •  دفعة {profile.graduationYear}  •  المعدل التراكمي: {profile.gpa}  •  الخبرة: {profile.experienceYears}
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
                <span>تعديل البيانات الأساسية</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ================= BENTO GRID: 2 COLUMNS EXACT FIGMA ================= */}
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
                <span className="px-2.5 py-1 rounded-[6px] bg-[#ECFDF5] text-[#059669] text-[10px] font-bold">
                  مكتمل ✓
                </span>
              </div>

              <div className="text-[12px] font-medium text-[#334155] leading-relaxed space-y-1 text-right">
                <p>مهندس برمجيات خريج جامعة العلوم والتكنولوجيا لعام 2026 بمعدل ممتاز (92%).</p>
                <p>متخصص في بناء وتطوير تطبيقات الويب الحديثة وحلول الأعمال الرقمية، أمتلك شغفاً</p>
                <p>كبيراً بالابتكار البرمجي والعمل ضمن بيئات تقنية رائدة تسعى لإحداث أثر حقيقي في سوق العمل.</p>
              </div>

              {/* Key Focus Tags */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-[#0F1E36] mb-2 text-right">
                  الاهتمامات المهنية الأساسية:
                </div>
                <div className="flex flex-wrap gap-2 justify-start">
                  <span className="px-3.5 py-2 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F1E36] text-[11px] font-semibold">
                    تطوير واجهات المستخدم
                  </span>
                  <span className="px-3.5 py-2 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F1E36] text-[11px] font-semibold">
                    هندسة البرمجيات
                  </span>
                  <span className="px-3.5 py-2 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F1E36] text-[11px] font-semibold">
                    تحليل وهندسة النظم
                  </span>
                  <span className="px-3.5 py-2 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F1E36] text-[11px] font-semibold">
                    حلول الويب الحديثة
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Academic Qualifications */}
            <div className="bg-white border border-[#E2E8F0] rounded-[22px] p-6 shadow-[0_4px_12px_rgba(15,30,54,0.05)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0F1E36]" />
                  <h2 className="text-[15px] font-black text-[#0F1E36]">المؤهل الأكاديمي والجامعة</h2>
                </div>
                <span className="px-3 py-1 rounded-[6px] bg-[#ECFDF5] text-[#059669] text-[10px] font-bold">
                  سجل موثق أكاديمياً ✓
                </span>
              </div>

              <div className="text-right">
                <div className="text-[14px] font-bold text-[#0F1E36]">
                  بكالوريوس هندسة البرمجيات — مرتبة الشرف
                </div>
                <div className="text-[12px] text-[#64748B] mt-0.5">
                  {profile.university} • كلية الحاسبات وتكنولوجيا المعلومات
                </div>
              </div>

              {/* Metrics Badges (3 items) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] text-right">
                  <span className="text-[11px] text-[#64748B] font-semibold">سنة التخرج: </span>
                  <span className="text-[12px] text-[#0F1E36] font-bold">{profile.graduationYear}</span>
                </div>

                <div className="p-2.5 rounded-[10px] bg-[#FEF3C7] border border-[#FDE68A] text-right">
                  <span className="text-[11px] text-[#92400E] font-bold">المعدل التراكمي: </span>
                  <span className="text-[12px] text-[#B45309] font-black">{profile.gpa}</span>
                </div>

                <div className="p-2.5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] text-right">
                  <span className="text-[11px] text-[#64748B] font-semibold">الخبرة: </span>
                  <span className="text-[12px] text-[#0F1E36] font-bold">0 - 1 سنة</span>
                </div>
              </div>

              {/* Approved Thesis Banner */}
              <div className="p-3.5 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] text-right space-y-0.5">
                <div className="text-[11px] font-bold text-[#B45309]">مشروع التخرج المعتمد (1):</div>
                <div className="text-[12px] font-bold text-[#0F1E36]">
                  منصة منارة لربط الخريجين بسوق العمل — قسم هندسة البرمجيات
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
                  <h2 className="text-[15px] font-black text-[#0F1E36]">بيانات التواصل المعتمدة</h2>
                </div>
                <span className="px-3 py-1 rounded-[6px] bg-[#EFF6FF] text-[#1D4ED8] text-[10px] font-bold">
                  تم التحقق ✓
                </span>
              </div>

              {/* Rows */}
              <div className="space-y-3">
                {/* Row 1: Email */}
                <div className="p-2.5 px-3.5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[13px] font-bold text-[#0F1E36]">@</span>
                    <span className="text-[12px] font-semibold text-[#0F1E36] font-mono">{profile.email}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-[6px] bg-[#ECFDF5] text-[#059669] text-[10px] font-bold">
                    موثق ✓
                  </span>
                </div>

                {/* Row 2: Phone */}
                <div className="p-2.5 px-3.5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[13px] font-bold text-[#0F1E36]">📞</span>
                    <span className="text-[12px] font-semibold text-[#0F1E36] font-mono" dir="ltr">{profile.phone}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-[6px] bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold">
                    واتساب نشط
                  </span>
                </div>

                {/* Row 3: City */}
                <div className="p-2.5 px-3.5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2.5">
                  <span className="text-[13px] font-bold text-[#0F1E36]">📍</span>
                  <span className="text-[12px] font-semibold text-[#0F1E36]">صنعاء — الجمهورية اليمنية</span>
                </div>
              </div>

              {/* Privacy Note */}
              <div className="text-[11px] font-medium text-[#94A3B8] text-right pt-2 border-t border-[#F1F5F9]">
                🔒 تظهر بيانات التواصل فقط للشركات والمؤسسات المعتمدة في منصة منارة
              </div>
            </div>

            {/* Card 4: Audit & Completion Checklist */}
            <div className="bg-white border border-[#E2E8F0] rounded-[22px] p-6 shadow-[0_4px_12px_rgba(15,30,54,0.05)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <h2 className="text-[15px] font-black text-[#0F1E36]">حالة تدقيق البيانات الأساسية والاعتماد</h2>
                </div>
                <span className="px-2.5 py-1 rounded-[6px] bg-[#ECFDF5] text-[#059669] text-[10px] font-bold">
                  نشط ومعتمد
                </span>
              </div>

              <p className="text-[11px] font-semibold text-[#64748B] text-right">
                مؤشرات التحقق والجاهزية للمطابقة المهنية مع سوق العمل:
              </p>

              {/* Checklist 2x2 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2.5">
                  <span className="text-[12px] font-bold text-[#059669]">✓</span>
                  <span className="text-[11px] font-bold text-[#0F1E36]">البيانات الشخصية: مكتملة ومدققة</span>
                </div>

                <div className="p-3 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2.5">
                  <span className="text-[12px] font-bold text-[#059669]">✓</span>
                  <span className="text-[11px] font-bold text-[#0F1E36]">بيانات الاتصال: موثقة عبر البريد والهاتف</span>
                </div>

                <div className="p-3 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2.5">
                  <span className="text-[12px] font-bold text-[#059669]">✓</span>
                  <span className="text-[11px] font-bold text-[#0F1E36]">المؤهل الأكاديمي: مطابق لسجل الجامعة</span>
                </div>

                <div className="p-3 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2.5">
                  <span className="text-[12px] font-bold text-[#059669]">✓</span>
                  <span className="text-[11px] font-bold text-[#0F1E36]">النبذة المهنية: مستوفية للمعايير المهنية</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
