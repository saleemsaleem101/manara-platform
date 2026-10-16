# 🚀 الدليل الشامل لهندسة النشر السحابي لمنصة منارة (Manara Platform)
## التوثيق التقني لربط قاعدة البيانات Supabase ونشر الباك إند والفرونت إند على Vercel مع خط النشر التلقائي (CI/CD)

---

## 📌 فهرس المحتويات
1. [المقدمة والمعمارية السحابية للمشروع (Architecture Overview)](#1-المقدمة-والمعمارية-السحابية-للمشروع)
2. [المرحلة الأولى: إعداد وتهيئة قاعدة البيانات السحابية (Supabase PostgreSQL)](#2-المرحلة-الأولى-إعداد-وتهيئة-قاعدة-البيانات-السحابية-supabase-postgresql)
   - [2.1 خطوات إنشاء المشروع وضبط الإعدادات](#21-خطوات-إنشاء-المشروع-وضبط-الإعدادات-في-موقع-supabase)
   - [2.2 نصوص وبيانات الاتصال المستخرجة](#22-نصوص-وبيانات-الاتصال-المستخرجة)
   - [2.3 أوامر تهيئة وهجرة الجداول (Migrations & Seeding)](#23-أوامر-تهيئة-وهجرة-الجداول-migrations--seeding)
   - [2.4 الأكواد والملفات المضافة/المعدلة لربط Supabase](#24-الأكواد-والملفات-المضافةالمعدلة-لربط-supabase)
3. [المرحلة الثانية: إعداد ونشر الواجهة الخلفية (Django Backend على Vercel)](#3-المرحلة-الثانية-إعداد-ونشر-الواجهة-الخلفية-django-backend-على-vercel)
   - [3.1 خطوات النشر في لوحة تحكم Vercel](#31-خطوات-النشر-في-لوحة-تحكم-vercel)
   - [3.2 النصوص ومتغيرات البيئة (Environment Variables) المضافة بالتفصيل](#32-النصوص-ومتغيرات-البيئة-environment-variables-المضافة-بالتفصيل)
   - [3.3 الأكواد والملفات المضافة في الباك إند لتمكين تشغيل Vercel](#33-الأكواد-والملفات-المضافة-في-الباك-إند-لتمكين-تشغيل-vercel)
4. [المرحلة الثالثة: إعداد ونشر الواجهة الأمامية (React Vite Frontend على Vercel)](#4-المرحلة-الثالثة-إعداد-ونشر-الواجهة-الأمامية-react-vite-frontend-على-vercel)
   - [4.1 خطوات النشر في لوحة تحكم Vercel](#41-خطوات-النشر-في-لوحة-تحكم-vercel)
   - [4.2 النصوص ومتغيرات البيئة المضافة](#42-النصوص-ومتغيرات-البيئة-المضافة)
   - [4.3 الأكواد والملفات المضافة في الفرونت إند](#43-الأكواد-والملفات-المضافة-في-الفرونت-إند)
5. [المرحلة الرابعة: خط النشر المستمر والتحديث التلقائي (CI/CD Pipeline)](#5-المرحلة-الرابعة-خط-النشر-المستمر-والتحديث-التلقائي-cicd-pipeline)
6. [بيانات الدخول والروابط الحية للاختبار والمناقشة](#6-بيانات-الدخول-والروابط-الحية-للاختبار-والمناقشة)

---

## 1. المقدمة والمعمارية السحابية للمشروع

تم بناء البنية التحتية لمنصة **منارة (Manara)** وفق أفضل الممارسات والمعايير السحابية العالمية (Cloud-Native Architecture)، حيث تم فصل طبقات المنصة بالكامل لضمان الأمان، قابلية التوسع (Scalability)، والأداء العالي:

```text
┌────────────────────────────────────────────────────────┐
│             المستخدم النهائي (Web Browser / Mobile)        │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS
                            ▼
┌────────────────────────────────────────────────────────┐
│             الواجهة الأمامية (Frontend)                │
│       React 19 + TypeScript + Vite + Tailwind CSS      │
│            مستضافة على شبكة Vercel Edge CDN             │
│   رابط: https://manara-frontend-5pt7egdxh-...          │
└───────────────────────────┬────────────────────────────┘
                            │ REST API Calls (CORS Enabled)
                            ▼
┌────────────────────────────────────────────────────────┐
│             الواجهة الخلفية (Backend API)              │
│          Django 5 + Django REST Framework              │
│       مستضافة عبر دوال Vercel Serverless (WSGI)        │
│   رابط: https://manara-platform-gules.vercel.app/api   │
└───────────────────────────┬────────────────────────────┘
                            │ PostgreSQL Protocol (Port 5432)
                            ▼
┌────────────────────────────────────────────────────────┐
│             قاعدة البيانات السحابية (Database)          │
│                 Supabase PostgreSQL 17                 │
│              منطقة غرب أوروبا (eu-west-1)             │
│        Host: aws-0-eu-west-1.pooler.supabase.com       │
└────────────────────────────────────────────────────────┘
```

---

## 2. المرحلة الأولى: إعداد وتهيئة قاعدة البيانات السحابية (Supabase PostgreSQL)

### 2.1 خطوات إنشاء المشروع وضبط الإعدادات في موقع Supabase
1. الدخول لموقع **[Supabase.com](https://supabase.com)** وتسجيل الدخول عبر حساب GitHub للمطور (`jalalmatluq-eng`).
2. إنشاء مؤسسة جديدة باسم: `jalalmatluq-eng's Org`.
3. الضغط على **New Project** وتحديد البيانات التالية:
   - **اسم المشروع (Project Name)**: `manarah-db1`
   - **كلمة مرور قاعدة البيانات (Database Password)**: `Manara@2026Secure`
   - **المنطقة الجغرافية (Region)**: `eu-west-1` (West EU - Ireland)، وتم اختيارها لأنها الأقرب جغرافياً للشرق الأوسط وتوفر أقل معدل تأخير زمني (Lowest Latency)، فضلاً عن توافقها الكامل مع شبكة سيرفرات Vercel الأوروبية.
   - **خطة التسعير (Pricing Plan)**: `Free Tier` (المجانية مدى الحياة).
4. الانتظار حتى أصبحت حالة قاعدة البيانات `Healthy`.

---

### 2.2 نصوص وبيانات الاتصال المستخرجة
تم استخراج بيانات الاتصال من قسم **Connect** في لوحة تحكم Supabase واختيار نمط الـ Connection Pooling لضمان استقرار الاتصالات من الدوال الخادمة (Serverless):

| البند | القيمة المستخدمة | الغرض التقني |
| :--- | :--- | :--- |
| **Host** | `aws-0-eu-west-1.pooler.supabase.com` | عنوان خادم التجميع السحابي من Supabase المتوافق مع بروتوكول IPv4 |
| **Port** | `5432` | منفذ جلسات PostgreSQL القياسي (Session Mode) |
| **Database Name** | `postgres` | اسم قاعدة البيانات الافتراضية للإنتاج |
| **User** | `postgres.fkgyihcgkbumqanvmqvg` | اسم المستخدم المخصص لمشروع `manarah-db1` |
| **Password** | `Manara@2026Secure` | كلمة المرور المشفرة المحمية لقاعدة البيانات |

---

### 2.3 أوامر تهيئة وهجرة الجداول (Migrations & Seeding)
تم تشغيل سكربت هجرة الجداول وبذر البيانات من بيئة التطوير المحلية وتوجيهها مباشرة إلى قاعدة بيانات Supabase عبر تنفيذ الأمر:

```bash
python manage.py migrate
python manage.py seed_sprint1
```

**النتيجة**:
- تطبيق 28 عملية هجرة بنجاح (جداول: `accounts_user`, `profiles_graduateprofile`, `authtoken_token`, `django_session`, `auth_group`, ...).
- إنشاء مستخدم خريج مفعل ومكتمل البيانات (`graduate@manara.edu.ye`).
- إنشاء مستخدم خريج غير مفعل لاختبار رمز التحقق OTP (`unverified@manara.edu.ye` مع الرمز `452729`).

---

### 2.4 الأكواد والملفات المضافة/المعدلة لربط Supabase

#### 1) الملف: `manara-backend/accounts/management/commands/seed_sprint1.py`
- **الموقع**: `manara-backend/accounts/management/commands/seed_sprint1.py`
- **الغرض**: أمر مخصص لإدارة جانغو (Custom Management Command) يتيح زراعة حسابات تجريبية موثوقة ومطابقة لمتطلبات سبرنت 1 بضغطة زر واحدة على أي قاعدة بيانات جديدة.
- **الكود المنفذ**:
```python
from django.core.management.base import BaseCommand
from accounts.models import User
from profiles.models import GraduateProfile

class Command(BaseCommand):
    help = 'بذر بيانات سبرنت 1 التجريبية (Sprint 1 Seed Data)'

    def handle(self, *args, **options):
        # 1. إنشاء حساب الخريج الموثق والمكتمل
        verified_user, _ = User.objects.get_or_create(
            email='graduate@manara.edu.ye',
            defaults={
                'name': 'سليم شايف سليمان',
                'role': User.Role.GRADUATE,
                'email_verified': True,
                'is_active': True,
                'phone': '+967 770 000 001',
            }
        )
        verified_user.set_password('Password@2026')
        verified_user.save()

        # تجهيز الملف المهني الأساسي
        GraduateProfile.objects.get_or_create(
            user=verified_user,
            defaults={
                'first_name': 'سليم',
                'last_name': 'سليمان',
                'city': 'صنعاء',
                'university': 'جامعة صنعاء',
                'specialization': 'هندسة برمجيات',
                'graduation_year': 2025,
                'gpa': '3.85',
                'years_of_experience': '0',
                'bio': 'خريج هندسة برمجيات شغوف بتطوير الويب والأنظمة السحابية.',
            }
        )
```

#### 2) الملف: `manara-backend/manara_backend/settings.py` (إعدادات DATABASES)
- **الموقع**: `manara-backend/manara_backend/settings.py` (الأسطر 85-96)
- **الغرض**: استخدام مكتبة `python-decouple` لقراءة مدخلات قاعدة البيانات من متغيرات البيئة تلقائياً، بحيث تستخدم بيئة Vercel خادم Supabase، بينما تظل بيئة التطوير المحلية مرنة وقابلة للتغيير.
- **الكود**:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME':     config('DB_NAME',     default='manarah_db1'),
        'USER':     config('DB_USER',     default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST':     config('DB_HOST',     default='localhost'),
        'PORT':     config('DB_PORT',     default='5432'),
        'CONN_MAX_AGE': config('DB_CONN_MAX_AGE', default=60, cast=int),
    }
}
```

---

## 3. المرحلة الثانية: إعداد ونشر الواجهة الخلفية (Django Backend على Vercel)

### 3.1 خطوات النشر في لوحة تحكم Vercel
1. تسجيل الدخول إلى **[Vercel](https://vercel.com)** بحساب المطور (`jalalmatluq-eng`).
2. استيراد المستودع `https://github.com/saleemsaleem101/manara-platform`.
3. نسخ المستودع إلى حساب المطور الشخصي ليصبح: `jalalmatluq-eng/manara-platform`.
4. الدخول إلى إعدادات المشروع **Settings** -> **Build and Deployment**:
   - تعيين **Root Directory** على المجلد: `manara-backend`.
   - ضبط **Framework Preset** على: `Other`.
5. الدخول إلى **Settings** -> **Environment Variables** وإدخال متغيرات البيئة.
6. عمل **Redeploy** لبدء تشغيل دوال البايثون الخادمة.

---

### 3.2 النصوص ومتغيرات البيئة (Environment Variables) المضافة بالتفصيل

تمت إضافة المتغيرات التالية داخل Vercel لضمان عمل الباك إند:

```env
# مفتاح التشفير ووضع الإنتاج
SECRET_KEY=django-insecure-ge=x2n=n$@nfd^4rq#k5z*fhsb@ba!_%5cm@m1h_
DEBUG=False
ALLOWED_HOSTS=*
CORS_ALLOW_ALL_ORIGINS=True

# بيانات الاتصال بقاعدة بيانات Supabase PostgreSQL
DB_HOST=aws-0-eu-west-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.fkgyihcgkbumqanvmqvg
DB_PASSWORD=Manara@2026Secure

# إعدادات إرسال البريد الإلكتروني الحقيقي عبر Gmail SMTP (رموز OTP وتأكيد الحساب)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=jalalmatluq@gmail.com
EMAIL_HOST_PASSWORD=tcirbxvtoybxccev
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=منصة منارة <jalalmatluq@gmail.com>
EMAIL_TIMEOUT=20
```

#### جدول شرح عمل كل متغير بيئة:
| اسم المتغير | القيمة | شرح عمله وأهميته التقنية |
| :--- | :--- | :--- |
| `SECRET_KEY` | نص مشفر معقد | مفتاح التشفير الرئيسي لتأمين جلسات المستخدمين وتوقيع الـ Tokens |
| `DEBUG` | `False` | إيقاف وضع التصحيح في بيئة الإنتاج لحماية البيانات الحساسة من الظهور |
| `ALLOWED_HOSTS` | `*` | السماح لنطاقات Vercel السحابية باستقبال وتمرير الطلبات |
| `CORS_ALLOW_ALL_ORIGINS` | `True` | السماح للواجهة الأمامية (React) بإجراء طلبات API دون أن يحجبها المتصفح |
| `DB_HOST` | `aws-0-eu-west-1.pooler.supabase.com` | رابط سيرفر Supabase السحابي |
| `DB_PORT` | `5432` | منفذ اتصال PostgreSQL القياسي |
| `DB_NAME` | `postgres` | اسم قاعدة بيانات الإنتاج |
| `DB_USER` | `postgres.fkgyihcgkbumqanvmqvg` | اسم المستخدم المعتمد لمشروع Supabase |
| `DB_PASSWORD` | `Manara@2026Secure` | كلمة مرور قاعدة بيانات Supabase |
| `EMAIL_BACKEND` | `django.core.mail.backends.smtp.EmailBackend` | تفعيل محرك إرسال الإيميلات الفعلي عبر بروتوكول SMTP |
| `EMAIL_HOST` | `smtp.gmail.com` | خادم بريد Google لإرسال الإيميلات للطلاب والخريجين |
| `EMAIL_PORT` | `587` | منفذ التشفير الآمن لبريد Gmail |
| `EMAIL_HOST_USER` | `jalalmatluq@gmail.com` | حساب البريد الإلكتروني المرسل للإشعارات |
| `EMAIL_HOST_PASSWORD` | كود تطبيق مشفر | كلمة مرور التطبيقات الآمنة (App Password) المصرحة من Google |
| `EMAIL_USE_TLS` | `True` | تشفير الاتصال بين سيرفر Vercel وسيرفر Google عبر TLS |
| `DEFAULT_FROM_EMAIL` | `منصة منارة <jalalmatluq@gmail.com>` | الاسم والبريد الظاهر في صندوق وارد الخريج عند استلام OTP |

---

### 3.3 الأكواد والملفات المضافة في الباك إند لتمكين تشغيل Vercel

#### 1) إنشاء ملف: `manara-backend/vercel.json`
- **الموقع**: `manara-backend/vercel.json`
- **الغرض**: تعريف خادم Vercel بكيفية تحويل مشروع Django إلى دوال سحابية لاخادمة (Serverless Functions) باستخدام معيار WSGI.
- **الكود**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "manara_backend/wsgi.py",
      "use": "@vercel/python",
      "config": {
        "maxLambdaSize": "15mb",
        "runtime": "python3.11"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "manara_backend/wsgi.py"
    }
  ]
}
```
- **شرح عمل الكود**:
  - `builds`: يخبر محرك Vercel باستخدام إضافة `@vercel/python` لبناء تطبيق بايثون من نقطة الدخول `wsgi.py`.
  - `routes`: يقوم بتوجيه كافة طلبات الويب القادمة `/(.*)` إلى تطبيق WSGI لمعالجتها عبر Django REST Framework.

#### 2) تعديل ملف: `manara-backend/manara_backend/wsgi.py`
- **الموقع**: `manara-backend/manara_backend/wsgi.py` (السطر 17)
- **الغرض**: يبحث محرك Vercel السحابي تلقائياً عن متغير باسم `app` لتشغيل خادم الويب، بينما ينشئ جانغو افتراضياً متغيراً باسم `application`.
- **الكود المضاف**:
```python
application = get_wsgi_application()
app = application  # هذا السطر مطلوب لتمكين Vercel من العثور على نقطة تشغيل الخادم
```

#### 3) تعديل ملف: `manara-backend/manara_backend/settings.py`
- **الموقع**: `manara-backend/manara_backend/settings.py`
- **الغرض**: دعم نطاقات Vercel الديناميكية وحل متطلبات CORS وتجميع الملفات الساكنة.
- **الأكواد المضافة**:
```python
# 1. السماح بنطاقات Vercel في الخوادم المصرح بها
ALLOWED_HOSTS: list = config('ALLOWED_HOSTS', default='localhost,127.0.0.1,testserver,.vercel.app', cast=Csv())

# 2. مسار تجميع الملفات الساكنة للإنتاج
STATIC_ROOT = BASE_DIR / 'staticfiles_build' / 'static'

# 3. السماح لأي واجهة أمامية مرفوعة على Vercel بالتواصل مع الـ API
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https:\/\/.*\.vercel\.app$",
]
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='https://*.vercel.app,http://localhost:5173,http://localhost:3000',
    cast=Csv()
)
```

---

## 4. المرحلة الثالثة: إعداد ونشر الواجهة الأمامية (React Vite Frontend على Vercel)

### 4.1 خطوات النشر في لوحة تحكم Vercel
1. من لوحة تحكم Vercel، الضغط على **`Add New...`** -> **`Project`**.
2. اختيار نفس المستودع: `manara-platform` والضغط على **`Import`**.
3. ضبط الإعدادات التالية:
   - **Project Name**: `manara-frontend`
   - **Framework Preset**: `Vite` (يتم التعرف عليه تلقائياً).
   - **Root Directory**: `Manarah-Frontend`.
4. فتح قسم **Environment Variables** وإضافة متغير رابط الـ API.
5. الضغط على زر **`Deploy`**.

---

### 4.2 النصوص ومتغيرات البيئة المضافة
تمت إضافة متغير بيئة واحد للفرونت إند:

| اسم المتغير (Key) | القيمة (Value) | الغرض التقني |
| :--- | :--- | :--- |
| **`VITE_API_BASE_URL`** | `https://manara-platform-gules.vercel.app/api` | يوجه جميع طلبات الواجهة (تسجيل الدخول، استرجاع كلمة المرور، جلب وتحديث الملف الشخصي) إلى خادم الباك إند الحي في Vercel بدلاً من السيرفر المحلي. |

---

### 4.3 الأكواد والملفات المضافة في الفرونت إند

#### 1) إنشاء ملف: `Manarah-Frontend/vercel.json`
- **الموقع**: `Manarah-Frontend/vercel.json`
- **الغرض**: حل مشكلة الـ 404 الشهيرة في تطبيقات الصفحة الواحدة (Single Page Applications - React Router). بدون هذا الملف، إذا قام المستخدم بتحديث الصفحة على مسار مثل `/profile` أو `/login`، سيبحث السيرفر عن ملف باسم `profile.html` ولا يجده ويعطي خطأ 404.
- **الكود**:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
- **شرح عمل الكود**: يوجه السيرفر لتحويل أي مسار يطلبه المتصفح إلى ملف `index.html`، ليقوم كود الـ React Router الداخلي في المتصفح بقراءة المسار وعرض الصفحة المطلوبة بسلاسة ودون انقطاع.

#### 2) ربط عنوان الـ API في: `Manarah-Frontend/src/services/api.ts`
- **الموقع**: `Manarah-Frontend/src/services/api.ts` (السطر 7)
- **الغرض**: قراءة متغير البيئة `VITE_API_BASE_URL` تلقائياً عبر Vite، مع توفير خيار احتياطي في حالة التطوير المحلي.
- **الكود**:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
```

---

## 5. المرحلة الرابعة: خط النشر المستمر والتحديث التلقائي (CI/CD Pipeline)

تم ربط المستودع على GitHub بكلا مشروعي Vercel بنمط التكامل والنشر المستمر (Continuous Integration & Continuous Deployment):

```text
[المطور يجري تعديلاً برمجياً]
             │
             ▼
    git push origin main
             │
             ▼
┌─────────────────────────┐
│     GitHub Webhook      │
└────────────┬────────────┘
             │ إشعار تلقائي فوري
             ▼
┌────────────────────────────────────────────────────────┐
│                      Vercel CI/CD                      │
├──────────────────────────┬─────────────────────────────┤
│ إذا كان التعديل في:     │ إذا كان التعديل في:         │
│     manara-backend       │      Manarah-Frontend       │
│                          │                             │
│ 1. بناء دوال Python      │ 1. تثبيت npm dependencies    │
│ 2. فحص إعدادات WSGI      │ 2. تشغيل vite build         │
│ 3. نشر الـ API الحي      │ 3. توزيع الملفات على الـ CDN│
└──────────────────────────┴─────────────────────────────┘
```

**فائدة هذا النظام**:
أي تحسينات مستقبلية في السبرنتات القادمة (سبرنت 2 وسبرنت 3) يقوم بها أي طالب من أعضاء الفريق، بمجرد دفعها (`git push`) للمستودع ستنعكس مباشرة على المنصة أونلاين دون أي تدخل يدوي!

---

## 6. بيانات الدخول والروابط الحية للاختبار والمناقشة

### 🔗 الروابط الرسمية للمشروع:
* **رابط المنصة الحي (Frontend)**:
  `https://manara-frontend-5pt7egdxh-jalalmatluq-gmailcoms-projects.vercel.app`
* **رابط الواجهة الخلفية (Backend REST API)**:
  `https://manara-platform-gules.vercel.app/api`
* **مستودع الكود المصدري على GitHub**:
  `https://github.com/saleemsaleem101/manara-platform`
* **مشروع قاعدة البيانات على Supabase**:
  مشروع `manarah-db1` في منطقة `eu-west-1`.

---

### 🔑 بيانات الحسابات الجاهزة للاختبار أمام لجنة التحكيم:

| الحساب | البريد الإلكتروني | كلمة المرور | الوظيفة وحالة الحساب | السيناريو التجريبي |
| :--- | :--- | :--- | :--- | :--- |
| **خريج معتمد وموثق** | `graduate@manara.edu.ye` | `Password@2026` | موثق بنسبة 100%، الملف المهني مكتمل | تجربة الدخول المباشر، استعراض بيانات الخريج، تعديل الملف وحفظه فوراً في Supabase |
| **خريج يحتاج تفعيل** | `unverified@manara.edu.ye` | `Password@2026` | غير مفعل (رمز OTP: `452729`) | تجربة شاشة إدخال رمز التحقق وإبراز أمان المنصة |
| **إنشاء حساب خريج جديد** | أي إيميل خريج حقيقي | كلمة مرور جديدة | يتم التحقق من صحة المدخلات | تجربة إرسال رمز OTP حقيقي لبريد الخريج عبر Gmail SMTP |
| **استعادة كلمة المرور** | البريد المسجل | رابط الاستعادة | تشفير الرمز وإرساله بالإيميل | تجربة شاشات استرجاع كلمة السر وتعيين كلمة مرور جديدة |

---

*تم إعداد هذا التوثيق التقني ليكون مرجعاً هندسياً شاملاً للمناقشة الجامعية وتوثيق جهود الفريق.*
