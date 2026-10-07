import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoB64 = fs.readFileSync(path.join(__dirname, '../src/assets/logo_transparent.png')).toString('base64');

// ==========================================
// 1. 04_Profile_View.svg
// ==========================================
const svg04 = `<svg width="1440" height="960" viewBox="0 0 1440 960" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&amp;family=Plus+Jakarta+Sans:wght@500;600;700;800&amp;display=swap');
      * { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; }
      .en { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; direction: ltr; unicode-bidi: embed; }
      .black { font-weight: 900; }
      .bold { font-weight: 700; }
      .semibold { font-weight: 600; }
      .medium { font-weight: 500; }
      .regular { font-weight: 400; }
    </style>
    <filter id="card-shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#0F1E36" flood-opacity="0.05"/>
    </filter>
    <linearGradient id="hero-gradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FEF3C7" stop-opacity="0.85"/>
      <stop offset="50%" stop-color="#FFFBEB" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1440" height="960" fill="#F8FAFC"/>

  <!-- ================= TOP PLATFORM NAVBAR (72px) ================= -->
  <rect x="0" y="0" width="1440" height="72" fill="#FFFFFF"/>
  <line x1="0" y1="72" x2="1440" y2="72" stroke="#E2E8F0"/>

  <!-- Brand Logo & Title (Right) -->
  <image href="data:image/png;base64,${logoB64}" x="1330" y="14" width="44" height="44" preserveAspectRatio="xMidYMid meet"/>
  <text x="1318" y="34" fill="#0F1E36" font-size="16" class="black" text-anchor="end">مَنَارَة</text>
  <text x="1318" y="49" fill="#F59E0B" font-size="9" class="bold en" text-anchor="end">MANARAH PLATFORM</text>

  <!-- Navigation Links (Center Right - Perfectly Spaced, ZERO Overlap!) -->
  <!-- 1. الرئيسية -->
  <text x="1160" y="42" fill="#64748B" font-size="13" class="semibold" text-anchor="middle">الرئيسية</text>

  <!-- 2. ملفي المهني (Active Tab Pill) -->
  <rect x="980" y="19" width="115" height="34" rx="10" fill="#FEF3C7"/>
  <text x="1037" y="41" fill="#B45309" font-size="13" class="bold" text-anchor="middle">ملفي المهني</text>

  <!-- 3. الفرص المتاحة -->
  <text x="880" y="42" fill="#64748B" font-size="13" class="semibold" text-anchor="middle">الفرص المتاحة</text>

  <!-- 4. الشركات الشريكة -->
  <text x="740" y="42" fill="#64748B" font-size="13" class="semibold" text-anchor="middle">الشركات الشريكة</text>

  <!-- User Menu & Alerts (Left) -->
  <circle cx="280" cy="36" r="18" fill="#F1F5F9"/>
  <text x="280" y="41" fill="#64748B" font-size="13" class="bold" text-anchor="middle">🔔</text>

  <circle cx="95" cy="36" r="18" fill="#0F1E36"/>
  <text x="95" y="41" fill="#FFFFFF" font-size="11" class="bold" text-anchor="middle">ج.ص</text>
  <circle cx="108" cy="46" r="5" fill="#10B981" stroke="#FFFFFF" stroke-width="1.5"/>
  <text x="125" y="41" fill="#0F1E36" font-size="13" class="bold">جلال عبد الملك الصوفي</text>

  <!-- ================= HERO PROFILE CARD ================= -->
  <g filter="url(#card-shadow)" transform="translate(80, 95)">
    <rect x="0" y="0" width="1280" height="210" rx="24" fill="#FFFFFF" stroke="#E2E8F0"/>
    <!-- Subtle Top Gradient Banner -->
    <path d="M0 24C0 10.7452 10.7452 0 24 0H1256C1269.3 0 1280 10.7452 1280 24V38H0V24Z" fill="url(#hero-gradient)"/>

    <!-- Avatar Block (Right) -->
    <rect x="1165" y="60" width="85" height="85" rx="20" fill="#0F1E36"/>
    <text x="1207" y="112" fill="#FFFFFF" font-size="28" class="black" text-anchor="middle">ج.ص</text>
    <!-- Verified Badge -->
    <circle cx="1165" cy="140" r="13" fill="#10B981" stroke="#FFFFFF" stroke-width="3"/>
    <text x="1165" y="145" fill="#FFFFFF" font-size="11" class="bold" text-anchor="middle">✓</text>

    <!-- Identity & Academic Title (Middle Right) -->
    <!-- Line 1: Name -->
    <text x="1135" y="85" fill="#0F1E36" font-size="22" class="black" text-anchor="end">جلال عبد الملك الصوفي</text>

    <!-- Line 2: Role Badge & University -->
    <rect x="1040" y="102" width="95" height="26" rx="6" fill="#FEF3C7" stroke="#FDE68A"/>
    <text x="1087" y="119" fill="#92400E" font-size="11" class="bold" text-anchor="middle">مهندس برمجيات</text>

    <text x="1025" y="120" fill="#475569" font-size="12" class="semibold" text-anchor="end">جامعة العلوم والتكنولوجيا • كلية الحاسبات وتكنولوجيا المعلومات</text>

    <!-- Line 3: Meta details -->
    <text x="1135" y="152" fill="#64748B" font-size="12" class="medium" text-anchor="end">صنعاء، اليمن  •  دفعة 2026  •  المعدل التراكمي: 92% (ممتاز)  •  الخبرة: حديث التخرج (0 - 1 سنة)</text>

    <!-- Actions & Completion Gauge (Left) - CLEAN (NO MNRA CODES!) -->
    <!-- Completion Box -->
    <rect x="35" y="65" width="230" height="62" rx="14" fill="#F8FAFC" stroke="#E2E8F0"/>
    <text x="245" y="88" fill="#475569" font-size="11" class="bold" text-anchor="end">نسبة اكتمال البيانات الأساسية:</text>
    <text x="55" y="88" fill="#D97706" font-size="13" class="black" text-anchor="start">85%</text>
    <rect x="55" y="100" width="190" height="8" rx="4" fill="#E2E8F0"/>
    <rect x="83" y="100" width="162" height="8" rx="4" fill="#F59E0B"/>

    <!-- Edit Profile Primary Button -->
    <rect x="35" y="140" width="230" height="44" rx="12" fill="#0F1E36"/>
    <text x="150" y="167" fill="#FFFFFF" font-size="12" class="bold" text-anchor="middle">✏️  تعديل البيانات الأساسية</text>
  </g>

  <!-- ================= BENTO GRID: BASIC PROFILE DATA ================= -->

  <!-- RIGHT COLUMN (x=735, w=625) -->

  <!-- Card 1: Bio & Objective -->
  <g filter="url(#card-shadow)" transform="translate(735, 330)">
    <rect x="0" y="0" width="625" height="275" rx="22" fill="#FFFFFF" stroke="#E2E8F0"/>

    <!-- Header -->
    <circle cx="590" cy="35" r="5" fill="#F59E0B"/>
    <text x="575" y="41" fill="#0F1E36" font-size="15" class="black" text-anchor="end">النبذة المهنية والهدف الوظيفي</text>
    <rect x="30" y="23" width="70" height="24" rx="6" fill="#ECFDF5"/>
    <text x="65" y="39" fill="#059669" font-size="10" class="bold" text-anchor="middle">مكتمل ✓</text>
    <line x1="30" y1="58" x2="595" y2="58" stroke="#F1F5F9"/>

    <!-- Bio Content -->
    <text x="595" y="90" fill="#334155" font-size="12" class="medium" text-anchor="end">مهندس برمجيات خريج جامعة العلوم والتكنولوجيا لعام 2026 بمعدل ممتاز (92%).</text>
    <text x="595" y="115" fill="#334155" font-size="12" class="medium" text-anchor="end">متخصص في بناء وتطوير تطبيقات الويب الحديثة وحلول الأعمال الرقمية، أمتلك شغفاً</text>
    <text x="595" y="140" fill="#334155" font-size="12" class="medium" text-anchor="end">كبيراً بالابتكار البرمجي والعمل ضمن بيئات تقنية رائدة تسعى لإحداث أثر حقيقي في سوق العمل.</text>

    <!-- Key Focus Tags -->
    <g transform="translate(0, 175)">
      <text x="595" y="20" fill="#0F1E36" font-size="11" class="bold" text-anchor="end">الاهتمامات المهنية الأساسية:</text>
      <rect x="440" y="32" width="155" height="30" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="517" y="52" fill="#0F1E36" font-size="11" class="semibold" text-anchor="middle">تطوير واجهات المستخدم</text>

      <rect x="310" y="32" width="120" height="30" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="370" y="52" fill="#0F1E36" font-size="11" class="semibold" text-anchor="middle">هندسة البرمجيات</text>

      <rect x="180" y="32" width="120" height="30" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="240" y="52" fill="#0F1E36" font-size="11" class="semibold" text-anchor="middle">تحليل وهندسة النظم</text>

      <rect x="40" y="32" width="130" height="30" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="105" y="52" fill="#0F1E36" font-size="11" class="semibold" text-anchor="middle">حلول الويب الحديثة</text>
    </g>
  </g>

  <!-- Card 2: Academic Qualification -->
  <g filter="url(#card-shadow)" transform="translate(735, 630)">
    <rect x="0" y="0" width="625" height="280" rx="22" fill="#FFFFFF" stroke="#E2E8F0"/>

    <!-- Header -->
    <circle cx="590" cy="35" r="5" fill="#0F1E36"/>
    <text x="575" y="41" fill="#0F1E36" font-size="15" class="black" text-anchor="end">المؤهل الأكاديمي والجامعة</text>
    <rect x="30" y="23" width="125" height="24" rx="6" fill="#ECFDF5"/>
    <text x="92" y="39" fill="#059669" font-size="10" class="bold" text-anchor="middle">سجل موثق أكاديمياً ✓</text>
    <line x1="30" y1="58" x2="595" y2="58" stroke="#F1F5F9"/>

    <!-- Degree & Faculty -->
    <text x="595" y="88" fill="#0F1E36" font-size="14" class="bold" text-anchor="end">بكالوريوس هندسة البرمجيات — مرتبة الشرف</text>
    <text x="595" y="110" fill="#64748B" font-size="12" class="regular" text-anchor="end">جامعة العلوم والتكنولوجيا • كلية الحاسبات وتكنولوجيا المعلومات</text>

    <!-- Metrics Badges (3 items) -->
    <g transform="translate(30, 130)">
      <rect x="375" y="0" width="190" height="42" rx="10" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="550" y="26" fill="#64748B" font-size="11" class="semibold" text-anchor="end">سنة التخرج: <tspan fill="#0F1E36" class="bold">2026</tspan></text>

      <rect x="180" y="0" width="185" height="42" rx="10" fill="#FEF3C7" stroke="#FDE68A"/>
      <text x="350" y="26" fill="#92400E" font-size="11" class="bold" text-anchor="end">المعدل التراكمي: <tspan fill="#B45309" class="black">92%</tspan></text>

      <rect x="0" y="0" width="170" height="42" rx="10" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="155" y="26" fill="#64748B" font-size="11" class="semibold" text-anchor="end">الخبرة: <tspan fill="#0F1E36" class="bold">0 - 1 سنة</tspan></text>
    </g>

    <!-- Approved Thesis Banner -->
    <g transform="translate(30, 195)">
      <rect x="0" y="0" width="565" height="58" rx="12" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="545" y="24" fill="#B45309" font-size="11" class="bold" text-anchor="end">مشروع التخرج المعتمد (1):</text>
      <text x="545" y="44" fill="#0F1E36" font-size="12" class="bold" text-anchor="end">منصة منارة لربط الخريجين بسوق العمل — قسم هندسة البرمجيات</text>
    </g>
  </g>

  <!-- LEFT COLUMN (x=80, w=625) -->

  <!-- Card 3: Contact Information -->
  <g filter="url(#card-shadow)" transform="translate(80, 330)">
    <rect x="0" y="0" width="625" height="275" rx="22" fill="#FFFFFF" stroke="#E2E8F0"/>

    <!-- Header -->
    <circle cx="590" cy="35" r="5" fill="#0F1E36"/>
    <text x="575" y="41" fill="#0F1E36" font-size="15" class="black" text-anchor="end">بيانات التواصل المعتمدة</text>
    <rect x="30" y="23" width="90" height="24" rx="6" fill="#EFF6FF"/>
    <text x="75" y="39" fill="#1D4ED8" font-size="10" class="bold" text-anchor="middle">تم التحقق ✓</text>
    <line x1="30" y1="58" x2="595" y2="58" stroke="#F1F5F9"/>

    <!-- Contact Rows -->
    <!-- Row 1: Email -->
    <g transform="translate(30, 75)">
      <rect x="0" y="0" width="565" height="42" rx="10" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="540" y="26" fill="#0F1E36" font-size="13" class="bold" text-anchor="end">@</text>
      <text x="515" y="26" fill="#0F1E36" font-size="12" class="semibold en" text-anchor="end">jalal.matluq@gmail.com</text>
      <rect x="15" y="9" width="65" height="24" rx="6" fill="#ECFDF5"/>
      <text x="47" y="25" fill="#059669" font-size="10" class="bold" text-anchor="middle">موثق ✓</text>
    </g>

    <!-- Row 2: Phone -->
    <g transform="translate(30, 127)">
      <rect x="0" y="0" width="565" height="42" rx="10" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="540" y="26" fill="#0F1E36" font-size="13" class="bold" text-anchor="end">📞</text>
      <text x="515" y="26" fill="#0F1E36" font-size="12" class="semibold en" text-anchor="end">+967 770 000 000</text>
      <rect x="15" y="9" width="75" height="24" rx="6" fill="#EFF6FF"/>
      <text x="52" y="25" fill="#2563EB" font-size="10" class="bold" text-anchor="middle">واتساب نشط</text>
    </g>

    <!-- Row 3: City -->
    <g transform="translate(30, 179)">
      <rect x="0" y="0" width="565" height="42" rx="10" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="540" y="26" fill="#0F1E36" font-size="13" class="bold" text-anchor="end">📍</text>
      <text x="515" y="26" fill="#0F1E36" font-size="12" class="semibold" text-anchor="end">صنعاء — الجمهورية اليمنية</text>
    </g>

    <!-- Privacy Note -->
    <text x="595" y="250" fill="#94A3B8" font-size="11" class="medium" text-anchor="end">🔒 تظهر بيانات التواصل فقط للشركات والمؤسسات المعتمدة في منصة منارة</text>
  </g>

  <!-- Card 4: Data Completion & Access Permissions - CLEAN (NO MNRA CODES!) -->
  <g filter="url(#card-shadow)" transform="translate(80, 630)">
    <rect x="0" y="0" width="625" height="280" rx="22" fill="#FFFFFF" stroke="#E2E8F0"/>

    <!-- Header -->
    <circle cx="590" cy="35" r="5" fill="#10B981"/>
    <text x="575" y="41" fill="#0F1E36" font-size="15" class="black" text-anchor="end">حالة تدقيق البيانات الأساسية والاعتماد</text>
    <rect x="30" y="23" width="85" height="24" rx="6" fill="#ECFDF5"/>
    <text x="72" y="39" fill="#059669" font-size="10" class="bold" text-anchor="middle">نشط ومعتمد</text>
    <line x1="30" y1="58" x2="595" y2="58" stroke="#F1F5F9"/>

    <!-- Subtitle (CLEAN) -->
    <text x="595" y="82" fill="#64748B" font-size="11" class="semibold" text-anchor="end">مؤشرات التحقق والجاهزية للمطابقة المهنية مع سوق العمل:</text>

    <!-- Checklist Items (2x2 Grid) -->
    <g transform="translate(30, 105)">
      <!-- Item 1: Personal Data -->
      <rect x="295" y="0" width="270" height="44" rx="10" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="545" y="27" fill="#059669" font-size="12" class="bold" text-anchor="end">✓</text>
      <text x="525" y="27" fill="#0F1E36" font-size="11" class="bold" text-anchor="end">البيانات الشخصية: مكتملة ومدققة</text>

      <!-- Item 2: Contact -->
      <rect x="0" y="0" width="280" height="44" rx="10" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="260" y="27" fill="#059669" font-size="12" class="bold" text-anchor="end">✓</text>
      <text x="240" y="27" fill="#0F1E36" font-size="11" class="bold" text-anchor="end">بيانات الاتصال: موثقة عبر البريد والهاتف</text>

      <!-- Item 3: Academic -->
      <rect x="295" y="56" width="270" height="44" rx="10" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="545" y="83" fill="#059669" font-size="12" class="bold" text-anchor="end">✓</text>
      <text x="525" y="83" fill="#0F1E36" font-size="11" class="bold" text-anchor="end">المؤهل الأكاديمي: مطابق لسجل الجامعة</text>

      <!-- Item 4: Bio -->
      <rect x="0" y="56" width="280" height="44" rx="10" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="260" y="83" fill="#059669" font-size="12" class="bold" text-anchor="end">✓</text>
      <text x="240" y="83" fill="#0F1E36" font-size="11" class="bold" text-anchor="end">النبذة المهنية: مستوفية للمعايير المهنية</text>
    </g>
  </g>
</svg>`;

// ==========================================
// 2. 05_Profile_Edit.svg
// ==========================================
const svg05 = `<svg width="1440" height="1020" viewBox="0 0 1440 1020" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&amp;family=Plus+Jakarta+Sans:wght@500;600;700;800&amp;display=swap');
      * { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; }
      .en { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; direction: ltr; unicode-bidi: embed; }
      .black { font-weight: 900; }
      .bold { font-weight: 700; }
      .semibold { font-weight: 600; }
      .medium { font-weight: 500; }
      .regular { font-weight: 400; }
    </style>
    <filter id="card-shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#0F1E36" flood-opacity="0.05"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1440" height="1020" fill="#F8FAFC"/>

  <!-- Top Platform Navbar (72px) -->
  <rect x="0" y="0" width="1440" height="72" fill="#FFFFFF"/>
  <line x1="0" y1="72" x2="1440" y2="72" stroke="#E2E8F0"/>

  <!-- Brand Logo & Title (Right) -->
  <image href="data:image/png;base64,${logoB64}" x="1330" y="14" width="44" height="44" preserveAspectRatio="xMidYMid meet"/>
  <text x="1318" y="34" fill="#0F1E36" font-size="16" class="black" text-anchor="end">مَنَارَة</text>
  <text x="1318" y="49" fill="#F59E0B" font-size="9" class="bold en" text-anchor="end">MANARAH PLATFORM</text>

  <!-- Breadcrumbs (CLEAN, NO MNRA CODES!) -->
  <text x="1100" y="42" fill="#64748B" font-size="13" class="semibold" text-anchor="end">الرئيسية  /  الملف المهني  /</text>
  <text x="915" y="42" fill="#0F1E36" font-size="13" class="bold" text-anchor="end">تعديل واستكمال البيانات الأساسية</text>

  <!-- User Avatar (Left) -->
  <circle cx="95" cy="36" r="18" fill="#0F1E36"/>
  <text x="95" y="41" fill="#FFFFFF" font-size="11" class="bold" text-anchor="middle">ج.ص</text>
  <circle cx="108" cy="46" r="5" fill="#10B981" stroke="#FFFFFF" stroke-width="1.5"/>
  <text x="125" y="41" fill="#0F1E36" font-size="13" class="bold">جلال عبد الملك الصوفي</text>

  <!-- ================= TOP ACTION BAR ================= -->
  <g filter="url(#card-shadow)" transform="translate(160, 90)">
    <rect x="0" y="0" width="1120" height="76" rx="20" fill="#FFFFFF" stroke="#E2E8F0"/>
    <text x="1080" y="35" fill="#0F1E36" font-size="17" class="black" text-anchor="end">تعديل واستكمال البيانات الأساسية للخريج</text>
    <text x="1080" y="58" fill="#64748B" font-size="12" class="regular" text-anchor="end">قم بتحديث وتدقيق بياناتك الشخصية والأكاديمية ونبذتك المهنية لزيادة فرص مطابقتك مع الوظائف</text>

    <!-- Cancel Button -->
    <rect x="180" y="19" width="120" height="38" rx="10" fill="#F1F5F9" stroke="#E2E8F0"/>
    <text x="240" y="43" fill="#475569" font-size="12" class="bold" text-anchor="middle">إلغاء التغييرات</text>

    <!-- Save Button -->
    <rect x="35" y="19" width="135" height="38" rx="10" fill="#F59E0B"/>
    <text x="102" y="43" fill="#0F1E36" font-size="13" class="black" text-anchor="middle">حفظ التعديلات ✓</text>
  </g>

  <!-- ================= SECTION 1: PERSONAL DETAILS ================= -->
  <g filter="url(#card-shadow)" transform="translate(160, 185)">
    <rect x="0" y="0" width="1120" height="225" rx="22" fill="#FFFFFF" stroke="#E2E8F0"/>
    <circle cx="1075" cy="36" r="5" fill="#0F1E36"/>
    <text x="1060" y="42" fill="#0F1E36" font-size="15" class="black" text-anchor="end">1. البيانات الشخصية ومعلومات الاتصال</text>
    <line x1="40" y1="60" x2="1080" y2="60" stroke="#F1F5F9"/>

    <!-- Row 1: Full Name & Email -->
    <text x="1080" y="94" fill="#0F1E36" font-size="12" class="bold" text-anchor="end">الاسم الكامل (رباعي) *</text>
    <rect x="580" y="106" width="500" height="42" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="1060" y="132" fill="#0F1E36" font-size="13" class="bold" text-anchor="end">جلال عبد الملك الصوفي</text>

    <text x="540" y="94" fill="#0F1E36" font-size="12" class="bold" text-anchor="end">البريد الإلكتروني (محمي وموثق) 🔒</text>
    <rect x="40" y="106" width="500" height="42" rx="10" fill="#F1F5F9" stroke="#E2E8F0"/>
    <text x="520" y="132" fill="#64748B" font-size="13" class="semibold en" text-anchor="end">jalal.matluq@gmail.com</text>
    <rect x="55" y="114" width="70" height="26" rx="6" fill="#ECFDF5"/>
    <text x="90" y="131" fill="#059669" font-size="10" class="bold" text-anchor="middle">موثق ✓</text>

    <!-- Row 2: Phone & City -->
    <text x="1080" y="174" fill="#0F1E36" font-size="12" class="bold" text-anchor="end">رقم الهاتف / واتساب *</text>
    <rect x="580" y="186" width="500" height="42" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="1060" y="212" fill="#0F1E36" font-size="13" class="semibold en" text-anchor="end">+967 770 000 000</text>

    <text x="540" y="174" fill="#0F1E36" font-size="12" class="bold" text-anchor="end">المدينة والإقامة الحالية *</text>
    <rect x="40" y="186" width="500" height="42" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="520" y="212" fill="#0F1E36" font-size="13" class="semibold" text-anchor="end">اليمن - صنعاء</text>
  </g>

  <!-- ================= SECTION 2: ACADEMIC QUALIFICATIONS ================= -->
  <g filter="url(#card-shadow)" transform="translate(160, 430)">
    <rect x="0" y="0" width="1120" height="225" rx="22" fill="#FFFFFF" stroke="#E2E8F0"/>
    <circle cx="1075" cy="36" r="5" fill="#0F1E36"/>
    <text x="1060" y="42" fill="#0F1E36" font-size="15" class="black" text-anchor="end">2. المؤهل الأكاديمي والجامعة</text>
    <line x1="40" y1="60" x2="1080" y2="60" stroke="#F1F5F9"/>

    <!-- Row 1: University & Major -->
    <text x="1080" y="94" fill="#0F1E36" font-size="12" class="bold" text-anchor="end">الجامعة *</text>
    <rect x="580" y="106" width="500" height="42" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="1060" y="132" fill="#0F1E36" font-size="13" class="bold" text-anchor="end">جامعة العلوم والتكنولوجيا</text>

    <text x="540" y="94" fill="#0F1E36" font-size="12" class="bold" text-anchor="end">التخصص الأكاديمي *</text>
    <rect x="40" y="106" width="500" height="42" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="520" y="132" fill="#0F1E36" font-size="13" class="bold" text-anchor="end">هندسة البرمجيات</text>

    <!-- Row 2: Grad Year, GPA, Experience (3 Columns) -->
    <text x="1080" y="174" fill="#0F1E36" font-size="12" class="bold" text-anchor="end">سنة التخرج *</text>
    <rect x="760" y="186" width="320" height="42" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="1060" y="212" fill="#0F1E36" font-size="13" class="bold en" text-anchor="end">2026</text>

    <text x="720" y="174" fill="#0F1E36" font-size="12" class="bold" text-anchor="end">المعدل التراكمي *</text>
    <rect x="400" y="186" width="320" height="42" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="700" y="212" fill="#0F1E36" font-size="13" class="bold" text-anchor="end">92% (ممتاز مع مرتبة الشرف)</text>

    <text x="360" y="174" fill="#0F1E36" font-size="12" class="bold" text-anchor="end">سنوات الخبرة المهنية *</text>
    <rect x="40" y="186" width="320" height="42" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="340" y="212" fill="#0F1E36" font-size="13" class="semibold" text-anchor="end">حديث التخرج (0 - 1 سنة)</text>
  </g>

  <!-- ================= SECTION 3: BIO & OBJECTIVE ================= -->
  <g filter="url(#card-shadow)" transform="translate(160, 675)">
    <rect x="0" y="0" width="1120" height="235" rx="22" fill="#FFFFFF" stroke="#E2E8F0"/>
    <circle cx="1075" cy="36" r="5" fill="#0F1E36"/>
    <text x="1060" y="42" fill="#0F1E36" font-size="15" class="black" text-anchor="end">3. النبذة التعريفية والهدف الوظيفي</text>
    <rect x="40" y="24" width="170" height="28" rx="8" fill="#F1F5F9"/>
    <text x="125" y="42" fill="#64748B" font-size="11" class="bold en" text-anchor="middle">72 words / 150 max</text>
    <line x1="40" y1="60" x2="1080" y2="60" stroke="#F1F5F9"/>

    <!-- Textarea Box -->
    <rect x="40" y="75" width="1040" height="105" rx="12" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="1060" y="105" fill="#0F1E36" font-size="13" class="medium" text-anchor="end">مهندس برمجيات خريج جامعة العلوم والتكنولوجيا لعام 2026 بمعدل ممتاز (92%). متخصص في بناء وتطوير تطبيقات الويب الحديثة وحلول</text>
    <text x="1060" y="130" fill="#0F1E36" font-size="13" class="medium" text-anchor="end">الأعمال الرقمية، أمتلك شغفاً كبيراً بالابتكار البرمجي والعمل الجماعي ضمن بيئات تقنية رائدة تسعى لتمكين الشباب وإحداث أثر حقيقي في سوق العمل.</text>
    <text x="1060" y="155" fill="#64748B" font-size="12" class="regular" text-anchor="end">أجيد تحليل متطلبات الأنظمة، هندسة قواعد البيانات، وتطوير الواجهات المعتمدة على أحدث المعايير البرمجية.</text>

    <!-- Smart Advice Bar -->
    <rect x="40" y="190" width="1040" height="32" rx="8" fill="#FFFBEB" stroke="#FDE68A"/>
    <text x="1060" y="211" fill="#B45309" font-size="11" class="bold" text-anchor="end">💡 نصيحة مهنية: النبذة التعريفية الواضحة والدقيقة تزيد من فرصة تواصل مسؤولي التوظيف والشركات معك بنسبة 40%</text>
  </g>

  <!-- ================= BOTTOM ACTION BUTTONS ================= -->
  <g transform="translate(160, 930)">
    <!-- Cancel & Save Buttons -->
    <rect x="180" y="0" width="130" height="46" rx="12" fill="#FFFFFF" stroke="#CBD5E1"/>
    <text x="245" y="28" fill="#475569" font-size="12" class="bold" text-anchor="middle">إلغاء التغييرات</text>

    <rect x="35" y="0" width="135" height="46" rx="12" fill="#F59E0B"/>
    <text x="102" y="28" fill="#0F1E36" font-size="13" class="black" text-anchor="middle">حفظ التعديلات ✓</text>
  </g>
</svg>`;

const exportDir = path.join(__dirname, '../figma_exports');
fs.writeFileSync(path.join(exportDir, '04_Profile_View.svg'), svg04, 'utf8');
fs.writeFileSync(path.join(exportDir, '05_Profile_Edit.svg'), svg05, 'utf8');

console.log('Successfully written both 04_Profile_View.svg and 05_Profile_Edit.svg');
