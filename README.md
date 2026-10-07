# 🎓 منصة منارة لربط الخريجين بسوق العمل (Manara Platform)

مشروع تخرج لنيل درجة البكالوريوس في **هندسة البرمجيات** - جامعة العلوم والتكنولوجيا (2026).

---

## 📌 نطاق المرحلة الحالية: Sprint 1 (حساب الخريج والملف المهني الأساسي)
تم إنجاز وتجهيز متطلبات **Sprint 1** بالكامل وفق وثيقة التحليل ومخططات النظام (Use Case, Activity, Sequence, Class, ERD) وتوزيع المهام في **Jira**:

### 👥 توزيع الأدوار والمهام المنجزة في Sprint 1:
1. **سليم شايف سليمان (Scrum Master & Backend Lead)**:
   - إعداد البنية الأساسية لمشروع Django و Django REST Framework (`MNRA-36`, `MNRA-38`).
   - تطوير APIs المصادقة والحسابات: التسجيل، تسجيل الدخول، تسجيل الخروج، وتأكيد البريد (`MNRA-46`, `MNRA-51`, `MNRA-57`).
   - إدارة جلسات المستخدم وحماية المسارات والتحقق من التوكن الصالح (`MNRA-54`, `MNRA-60`).
   - تطوير APIs إنشاء واسترجاع وتعديل البيانات الأساسية للملف المهني وتطبيق الصلاحيات (`MNRA-64`, `MNRA-65`, `MNRA-73`).

2. **عبدالرزاق (Database & System Engineer)**:
   - إعداد وربط قاعدة بيانات PostgreSQL مع المشروع (`MNRA-39`).
   - تأمين وحماية متغيرات البيئة في ملف `.env` (`MNRA-42`).
   - تصميم نموذج المستخدم `User` وصلاحيات الخريج (`MNRA-45`).
   - تصميم وتطبيق نموذج الملف المهني الأساسي للخريج `GraduateProfile` في قاعدة البيانات وفق ERD (`MNRA-63`).

3. **عبدالرحمن فارع (Integration & QA / Testing Lead)**:
   - تجهيز طبقة الاتصال بين React و Django REST Framework وإعداد CORS (`MNRA-41`).
   - ربط واجهات تسجيل الدخول وإنشاء الحساب والملف المهني مع الـ APIs (`MNRA-48`, `MNRA-53`, `MNRA-67`, `MNRA-71`).
   - توجيه المستخدم حسب نوع الحساب وإدارة مسح الجلسة عند تسجيل الخروج (`MNRA-55`, `MNRA-59`).
   - اختبار حالات الإدخال الخاطئة، معالجة أخطاء الشبكة، وشاشات التحميل (`MNRA-49`, `MNRA-56`, `MNRA-61`, `MNRA-68`, `MNRA-72`, `MNRA-74`).
   - إعداد وتوثيق دليل تشغيل مكونات المشروع (`MNRA-43`).

4. **جلال عبد الملك الصوفي (UI/UX & Frontend Developer)**:
   - تصميم واجهات المستخدم المتطابقة مع معايير فيجما (الواجهات 1 إلى 5).
   - تطوير مكونات الواجهة باستخدام React و Tailwind CSS.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)
- **الواجهة الأمامية (Frontend):** React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons.
- **الواجهة الخلفية (Backend):** Python 3.13, Django 5.0, Django REST Framework, Django CORS Headers.
- **قاعدة البيانات (Database):** PostgreSQL (psycopg2-binary).
- **التوثيق وإدارة المشروع:** Jira Cloud, Agile/Scrum.

---

## 🚀 دليل تشغيل المشروع محلياً

### 1. تشغيل الواجهة الخلفية (Django Backend):
```bash
# الانتقال لمجلد الباك إند
cd manara-backend

# تفعيل البيئة الافتراضية (Windows)
.\venv\Scripts\activate

# التأكد من متغيرات البيئة في .env وتطبيق الهجرات
python manage.py migrate

# تشغيل خادم التطوير
python manage.py runserver 8000
```
> الخادم سيعمل على: `http://127.0.0.1:8000/`

### 2. تشغيل الواجهة الأمامية (React Frontend):
```bash
# الانتقال لمجلد الفرونت إند
cd Manarah-Frontend

# تثبيت الحزم (إن لم تكن مثبتة)
npm install

# تشغيل خادم التطوير
npm run dev
```
> التطبيق سيعمل على: `http://localhost:5173/`

---

## 🔗 نقاط النهاية للـ API (Sprint 1 Endpoints):
- `POST /api/auth/register/` - إنشاء حساب خريج جديد.
- `POST /api/auth/login/` - تسجيل الدخول وإصدار التوكن.
- `POST /api/auth/logout/` - تسجيل الخروج وإبطال التوكن.
- `POST /api/auth/verify-email/` - تأكيد البريد الإلكتروني.
- `GET /api/profiles/graduate/me/` - استرجاع بيانات الملف المهني الأساسي للخريج المسجّل.
- `PUT /api/profiles/graduate/me/` - تحديث وحفظ البيانات الأساسية للخريج.
