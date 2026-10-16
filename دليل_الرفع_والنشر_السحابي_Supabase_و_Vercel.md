# 🚀 الدليل الشامل لهندسة النشر السحابي لمنصة منارة (Manara Platform)
## التوثيق التقني لربط قاعدة البيانات Supabase ونشر الباك إند والفرونت إند على Vercel مع خط النشر التلقائي (CI/CD)

---

## 📌 فهرس المحتويات
1. [المقدمة والمعمارية السحابية للمشروع (Architecture Overview)](#1-المقدمة-والمعمارية-السحابية-للمشروع)
2. [المرحلة الأولى: إعداد وتهيئة قاعدة البيانات السحابية (Supabase PostgreSQL)](#2-المرحلة-الأولى-إعداد-وتهيئة-قاعدة-البيانات-السحابية-supabase-postgresql)
3. [المرحلة الثانية: إعداد ونشر الواجهة الخلفية (Django Backend على Vercel)](#3-المرحلة-الثانية-إعداد-ونشر-الواجهة-الخلفية-django-backend-على-vercel)
4. [المرحلة الثالثة: إعداد ونشر الواجهة الأمامية (React Vite Frontend على Vercel)](#4-المرحلة-الثالثة-إعداد-ونشر-الواجهة-الأمامية-react-vite-frontend-على-vercel)
5. [المرحلة الرابعة: خط النشر المستمر والتحديث التلقائي (CI/CD Pipeline)](#5-المرحلة-الرابعة-خط-النشر-المستمر-والتحديث-التلقائي-cicd-pipeline)
6. [بيانات الدخول والروابط الحية للاختبار والمناقشة](#6-بيانات-الدخول-والروابط-الحية-للاختبار-والمناقشة)

---

## 1. المقدمة والمعمارية السحابية للمشروع
تم بناء البنية التحتية لمنصة **منارة (Manara)** وفق أفضل الممارسات والمعايير السحابية العالمية (Cloud-Native Architecture):
* **الواجهة الأمامية (Frontend):** React 19 + TypeScript + Vite + Tailwind CSS مستضافة على شبكة Vercel Edge CDN.
* **الواجهة الخلفية (Backend API):** Django 5 + Django REST Framework مستضافة عبر دوال Vercel Serverless (WSGI).
* **قاعدة البيانات (Database):** Supabase PostgreSQL 17 في منطقة غرب أوروبا (eu-west-1).

---

## 2. المرحلة الأولى: إعداد وتهيئة قاعدة البيانات السحابية (Supabase PostgreSQL)
* **المشروع:** `manarah-db1`
* **المنطقة الجغرافية:** `eu-west-1` (West EU - Ireland)
* **Host:** `aws-0-eu-west-1.pooler.supabase.com`
* **Port:** `5432`
* **Database Name:** `postgres`
* **User:** `postgres.fkgyihcgkbumqanvmqvg`
* **Password:** `Manara@2026Secure`

---

## 3. المرحلة الثانية: إعداد ونشر الواجهة الخلفية (Django Backend على Vercel)
* **Root Directory:** `manara-backend`
* **Framework Preset:** `Other`
* **دوال الخادم:** ملف `manara-backend/vercel.json` وملف `manara_backend/wsgi.py` مع `app = application`.
* **متغيرات البيئة:** `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `SECRET_KEY`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`.

---

## 4. المرحلة الثالثة: إعداد ونشر الواجهة الأمامية (React Vite Frontend على Vercel)
* **Root Directory:** `Manarah-Frontend`
* **Framework Preset:** `Vite`
* **متغير البيئة:** `VITE_API_BASE_URL=https://manara-platform-gules.vercel.app/api`
* **توجيه الروابط:** ملف `Manarah-Frontend/vercel.json` لمعالجة الـ SPA Routing ومنع الخطأ 404.

---

## 5. المرحلة الرابعة: خط النشر المستمر (CI/CD Pipeline)
أي تعديل برمجي يتم دفعه عبر `git push` إلى GitHub يتم استلامه فورياً عبر Vercel Webhook ويعاد بناء وتحديث الموقع الحي تلقائياً.

---

## 6. بيانات الدخول والروابط الحية للاختبار والمناقشة
* **رابط المنصة الحي:** `https://manarah-platform.vercel.app` (أو رابط مشروع Vercel)
* **رابط الباك إند API:** `https://manara-platform-gules.vercel.app/api`
* **حساب خريج موثق:** `graduate@manara.edu.ye` / `Password@2026`
* **حساب يحتاج تفعيل:** `unverified@manara.edu.ye` / `Password@2026` (رمز OTP: `452729`)
