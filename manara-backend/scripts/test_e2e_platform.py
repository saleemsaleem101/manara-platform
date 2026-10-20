import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'manara_backend.settings')
django.setup()

import unittest
from decimal import Decimal
from django.db import models
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from profiles.models import GraduateProfile, Company, Skill, GraduateSkill, Project, VideoCV
from jobs.models import Job, Application, ApplicationStatusHistory
from matching.models import MatchingResult
from notifications.models import Notification

User = get_user_model()

def run_e2e_verification():
    print("=" * 60)
    print("بدء الفحص الشامل لمنظومة منارة (الواجهات الخلفية والأمامية وقاعدة البيانات)")
    print("=" * 60)
    client = APIClient()

    errors = []
    successes = []

    def check(name, condition, msg=""):
        if condition:
            print(f"  [PASS] {name}")
            successes.append(name)
        else:
            print(f"  [FAIL] {name}: {msg}")
            errors.append(f"{name}: {msg}")

    # 1. Cleanup old test users
    test_emails = [
        "grad_e2e@test.com", "comp_e2e@test.com", "admin_e2e@test.com", "test_reset@test.com"
    ]
    test_users = User.objects.filter(email__in=test_emails)
    test_grad_profiles = GraduateProfile.objects.filter(user__in=test_users)
    test_companies = Company.objects.filter(user__in=test_users)
    ApplicationStatusHistory.objects.filter(models.Q(application__profile__in=test_grad_profiles) | models.Q(application__job__company__in=test_companies)).delete()
    MatchingResult.objects.filter(models.Q(graduate__in=test_grad_profiles) | models.Q(job__company__in=test_companies)).delete()
    Application.objects.filter(models.Q(profile__in=test_grad_profiles) | models.Q(job__company__in=test_companies)).delete()
    Job.objects.filter(company__in=test_companies).delete()
    VideoCV.objects.filter(graduate__in=test_grad_profiles).delete()
    test_grad_profiles.delete()
    test_companies.delete()
    test_users.delete()

    # 2. Test FR-01: Graduate Registration
    print("\n--- 1. اختبار تسجيل الخريج (FR-01, FR-26) ---")
    reg_res = client.post('/api/auth/register/', {
        "name": "خريج تجريبي محمد أحمد",
        "email": "grad_e2e@test.com",
        "phone": "777111222",
        "password": "Password123!",
        "role": "GRADUATE"
    }, format='json')
    check("تسجيل حساب خريج", reg_res.status_code == 201, f"Status: {reg_res.status_code}, {reg_res.data}")
    grad_user = User.objects.filter(email="grad_e2e@test.com").first()
    check("وجود مستخدم الخريج في DB", grad_user is not None)
    check("وجود ملف خريج GraduateProfile تلقائياً", hasattr(grad_user, 'graduate_profile') and grad_user.graduate_profile is not None)

    # 3. Test FR-26: Email Verification (OTP & Direct Token)
    print("\n--- 2. اختبار التحقق من البريد (FR-26) ---")
    otp_code = grad_user.get_verification_code()
    verify_res = client.post('/api/auth/verify-email/', {
        "email": "grad_e2e@test.com",
        "code": otp_code
    }, format='json')
    check("تفعيل الحساب برمز OTP", verify_res.status_code == 200, f"Status: {verify_res.status_code}, {verify_res.data}")
    grad_user.refresh_from_db()
    check("تحديث حالة الحساب إلى email_verified=True", grad_user.email_verified is True)

    # 4. Test FR-03: Login
    print("\n--- 3. اختبار تسجيل الدخول (FR-03) ---")
    login_res = client.post('/api/auth/login/', {
        "email": "grad_e2e@test.com",
        "password": "Password123!"
    }, format='json')
    check("تسجيل دخول الخريج بنجاح", login_res.status_code == 200 and 'token' in login_res.data, f"Status: {login_res.status_code}")
    grad_token = login_res.data.get('token')
    grad_client = APIClient()
    grad_client.credentials(HTTP_AUTHORIZATION=f'Token {grad_token}')

    # 5. Test FR-05, FR-06, FR-07, FR-08, FR-09: Profile, Skills, Projects, VideoCV
    print("\n--- 4. اختبار الملف المهني للخريج والمهارات والمشاريع والفيديو (FR-05..FR-09) ---")
    prof_update_res = grad_client.put('/api/profiles/graduate/me/', {
        "university": "جامعة العلوم والتكنولوجيا",
        "specialization": "تقنية معلومات",
        "graduation_year": 2024,
        "gpa": "3.85",
        "years_of_experience": "1",
        "bio": "مهندس برمجيات متخصص في تطوير الويب والواجهات الأمامية والخلفية."
    }, format='json')
    check("تحديث الملف المهني للخريج", prof_update_res.status_code == 200, f"Status: {prof_update_res.status_code}")

    # Skills
    skill_py, _ = Skill.objects.get_or_create(name="Python", category="TECHNICAL")
    skill_react, _ = Skill.objects.get_or_create(name="React", category="TECHNICAL")
    skill_comm, _ = Skill.objects.get_or_create(name="التواصل الفعال", category="SOFT")

    add_skill_res = grad_client.post('/api/profiles/graduate/skills/', {
        "skill_id": skill_py.id,
        "proficiency_level": "ADVANCED"
    }, format='json')
    check("إضافة مهارة تقنية للخريج", add_skill_res.status_code in [200, 201], f"Status: {add_skill_res.status_code}")

    # Project
    add_proj_res = grad_client.post('/api/profiles/graduate/projects/', {
        "title": "نظام إدارة الموارد",
        "description": "نظام متكامل لتنظيم المهام والموارد للشركات الناشئة",
        "technologies": "Django, React, PostgreSQL",
        "github_url": "https://github.com/grad/erp-system",
        "is_graduation_project": True
    }, format='json')
    check("إضافة مشروع برمجي مع رابط GitHub", add_proj_res.status_code in [200, 201], f"Status: {add_proj_res.status_code}")

    # Video CV: أولاً رفع وتخزين فيديو حقيقي ثم تحديث إعدادات الخصوصية والمسار الداخلي
    dummy_video_bytes = b"\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00mp42isom" + b"\x00" * 1024
    dummy_video = SimpleUploadedFile("grad_cv.mp4", dummy_video_bytes, content_type="video/mp4")
    upload_video_res = grad_client.post('/api/profiles/graduate/video/upload/', {
        "video": dummy_video,
        "duration_seconds": 90
    }, format='multipart')
    check("رفع وتخزين الفيديو التعريفي محلياً", upload_video_res.status_code in [200, 201], f"Status: {upload_video_res.status_code}")

    grad_prof = GraduateProfile.objects.filter(user=grad_user).first()
    stream_url = upload_video_res.data.get("video_url") or f"/api/profiles/graduate/video/stream/{grad_prof.id}"

    patch_video_res = grad_client.patch('/api/profiles/graduate/video/', {
        "video_cv_url": stream_url,
        "video_duration_seconds": 90,
        "video_visibility": "COMPANIES_ONLY"
    }, format='json')
    check("تحديث إعدادات وخصوصية الفيديو التعريفي داخلياً", patch_video_res.status_code == 200, f"Status: {patch_video_res.status_code}")

    # 6. Test FR-02, FR-23: Company Registration & Verification
    print("\n--- 5. اختبار تسجيل الشركة وطلب الاعتماد (FR-02, FR-23) ---")
    comp_reg_res = client.post('/api/auth/register/', {
        "name": "م. أحمد باحث التوظيف",
        "email": "comp_e2e@test.com",
        "phone": "777888999",
        "password": "Password123!",
        "role": "COMPANY",
        "company_name": "شركة التقنية المتقدمة المحدودة",
        "commercial_reg": "CR-998877",
        "industry": "تكنولوجيا المعلومات",
        "location": "صنعاء",
        "website": "https://adv-tech.ye"
    }, format='json')
    check("تسجيل حساب شركة", comp_reg_res.status_code == 201, f"Status: {comp_reg_res.status_code}, {comp_reg_res.data}")
    comp_user = User.objects.filter(email="comp_e2e@test.com").first()
    check("وجود مستخدم الشركة في DB", comp_user is not None)
    comp_user.email_verified = True
    comp_user.save()

    comp_login = client.post('/api/auth/login/', {
        "email": "comp_e2e@test.com",
        "password": "Password123!"
    }, format='json')
    comp_token = comp_login.data.get('token')
    comp_client = APIClient()
    comp_client.credentials(HTTP_AUTHORIZATION=f'Token {comp_token}')

    # 5.1 رفع وثيقة السجل التجاري داخلياً عبر multipart (FR-27)
    dummy_pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
    dummy_cr_doc = SimpleUploadedFile("cr_998877.pdf", dummy_pdf_bytes, content_type="application/pdf")
    upload_cr_res = comp_client.post('/api/profiles/company/upload-cr/', {
        "cr_document": dummy_cr_doc
    }, format='multipart')
    check("رفع وثيقة السجل التجاري داخلياً", upload_cr_res.status_code == 200, f"Status: {upload_cr_res.status_code}")
    cr_doc_url = upload_cr_res.data.get('cr_document_url') or "/media/cr_docs/cr_998877.pdf"

    # Submit verification
    submit_vr_res = comp_client.post('/api/profiles/company/submit-verification/', {
        "commercial_reg": "CR-998877",
        "cr_document_url": cr_doc_url
    }, format='json')
    check("تقديم طلب اعتماد السجل التجاري", submit_vr_res.status_code == 200, f"Status: {submit_vr_res.status_code}")

    # 7. Test Admin Approval (UC-08, FR-04, FR-23)
    print("\n--- 6. اختبار لوحة الأدمن واعتماد الشركة (UC-08, FR-04, FR-23) ---")
    admin_user = User.objects.filter(role="ADMIN").first()
    if not admin_user:
        admin_user = User.objects.create_superuser(
            email="admin_e2e@test.com",
            name="مدير النظام الرئيسي",
            password="AdminPassword123!"
        )
    else:
        admin_user.set_password("AdminPassword123!")
        admin_user.save()

    admin_login = client.post('/api/auth/login/', {
        "email": admin_user.email,
        "password": "AdminPassword123!"
    }, format='json')
    admin_token = admin_login.data.get('token')
    admin_client = APIClient()
    admin_client.credentials(HTTP_AUTHORIZATION=f'Token {admin_token}')

    comp_profile = Company.objects.filter(user=comp_user).first()
    approve_res = admin_client.post(f'/api/admin-panel/companies/{comp_profile.id}/verify/', {
        "status": "APPROVED"
    }, format='json')
    check("اعتماد الشركة من قبل مدير النظام", approve_res.status_code == 200, f"Status: {approve_res.status_code}")
    comp_profile.refresh_from_db()
    check("تأكيد حالة اعتماد الشركة في DB (is_verified=True)", comp_profile.is_verified is True or comp_profile.verification_status == 'APPROVED')

    # 8. Test FR-10, FR-11, FR-18: Post Job with Matching Weights
    print("\n--- 7. اختبار نشر وظيفة مع الأوزان الرسمية (FR-10, FR-11, FR-18) ---")
    # First: test validation of weights sum = 1.0
    bad_weights_res = comp_client.post('/api/jobs/', {
        "title": "مطور Full Stack غير متزن",
        "description": "وصف تجريبي",
        "required_skills": "Python, React",
        "required_major": "تقنية معلومات",
        "required_exp": 1,
        "required_qualification": "BACHELOR",
        "skills_weight": 0.40,
        "specialization_weight": 0.40,
        "experience_weight": 0.20,
        "qualification_weight": 0.20, # sum = 1.20 -> must fail
        "minimum_match_score": 60
    }, format='json')
    check("رفض نشر الوظيفة عند عدم مساواة مجموع الأوزان لـ 1.0", bad_weights_res.status_code == 400, f"Status: {bad_weights_res.status_code}")

    # Official SRS Paragraph 593 weights: 0.45, 0.25, 0.20, 0.10
    create_job_res = comp_client.post('/api/jobs/', {
        "title": "مطور Full Stack (Python / React)",
        "description": "مطلوب مطور واجهات خلفية وأمامية للانضمام للفريق",
        "required_skills": "Python, React",
        "required_major": "تقنية معلومات",
        "required_exp": 1,
        "required_qualification": "BACHELOR",
        "location": "صنعاء",
        "job_type": "FULL_TIME",
        "skills_weight": 0.45,
        "specialization_weight": 0.25,
        "experience_weight": 0.20,
        "qualification_weight": 0.10,
        "minimum_match_score": 60
    }, format='json')
    check("نشر وظيفة بالأوزان الرسمية 45% / 25% / 20% / 10%", create_job_res.status_code in [200, 201], f"Status: {create_job_res.status_code}, {create_job_res.data}")
    job_id = create_job_res.data.get('id') or create_job_res.data.get('job_id')

    # 9. Test FR-12, FR-30: Job Browse & Search
    print("\n--- 8. اختبار استعراض وبحث الوظائف (FR-12, FR-30) ---")
    browse_res = grad_client.get(f'/api/jobs/?search=Full%20Stack')
    check("بحث واستعراض الوظائف للخريج", browse_res.status_code == 200 and len(browse_res.data) > 0, f"Status: {browse_res.status_code}")

    # 10. Test FR-13, FR-15, FR-16, FR-28: Apply for Job & Weighted Matching & Anti-Duplicate
    print("\n--- 9. اختبار التقديم والمطابقة الموزونة ومنع التكرار (FR-13, 15, 16, 28) ---")
    apply_res = grad_client.post('/api/jobs/apply/', {
        "job": job_id
    }, format='json')
    check("تقديم الخريج على الوظيفة بنجاح", apply_res.status_code in [200, 201], f"Status: {apply_res.status_code}, {apply_res.data}")
    app_id = apply_res.data.get('id') or apply_res.data.get('application_id')

    # Check anti-duplicate (FR-28)
    dup_apply_res = grad_client.post('/api/jobs/apply/', {
        "job": job_id
    }, format='json')
    check("منع تكرار التقديم على نفس الوظيفة (FR-28)", dup_apply_res.status_code == 400, f"Status: {dup_apply_res.status_code}")

    # Check match result
    match_res = grad_client.get(f'/api/matching/application/{app_id}/')
    check("احتساب درجات المطابقة الموزونة للطلب", match_res.status_code == 200, f"Status: {match_res.status_code}")
    if match_res.status_code == 200:
        score_val = match_res.data.get('final_score') or match_res.data.get('score')
        print(f"    -> الدرجة النهائية المحسوبة: {score_val}%")

    # 11. Test FR-14, FR-17, FR-29: Review Candidates, Update Status & Status History
    print("\n--- 10. اختبار مراجعة المتقدمين وسجل الحالات التاريخي (FR-14, 17, 29) ---")
    applicants_res = comp_client.get(f'/api/jobs/{job_id}/applicants/')
    check("استعراض قائمة المتقدمين مصنفة تنازلياً للشركة (FR-17)", applicants_res.status_code == 200 and len(applicants_res.data) > 0)

    # Update status to UNDER_REVIEW
    update_st1 = comp_client.patch(f'/api/jobs/applications/{app_id}/status/', {
        "status": "UNDER_REVIEW"
    }, format='json')
    check("تحديث حالة الطلب إلى UNDER_REVIEW (FR-14)", update_st1.status_code == 200)

    # Update status to ACCEPTED
    update_st2 = comp_client.patch(f'/api/jobs/applications/{app_id}/status/', {
        "status": "ACCEPTED"
    }, format='json')
    check("تحديث حالة الطلب إلى ACCEPTED (FR-14)", update_st2.status_code == 200)

    # Check Status History (FR-29)
    hist_res = comp_client.get(f'/api/jobs/applications/{app_id}/history/')
    check("استرجاع سجل الحالات التاريخي للطلب (FR-29)", hist_res.status_code == 200 and len(hist_res.data) >= 2, f"Count: {len(hist_res.data) if hist_res.status_code == 200 else 0}")

    # 12. Test FR-22: Notifications to Graduate & Company
    print("\n--- 11. اختبار الإشعارات (FR-22) ---")
    grad_notifs = grad_client.get('/api/notifications/')
    check("وصول إشعار للخريج عند تحديث حالة طلبه (FR-22)", grad_notifs.status_code == 200 and len(grad_notifs.data) > 0)

    # 13. Test FR-21: Admin Reports (JSON & CSV)
    print("\n--- 12. اختبار استخراج تقارير النظام (FR-21) ---")
    rep_jobs_json = admin_client.get('/api/admin-panel/reports/?type=jobs&format=json')
    check("استخراج تقرير الوظائف بصيغة JSON", rep_jobs_json.status_code == 200)
    rep_jobs_csv = admin_client.get('/api/admin-panel/reports/?type=jobs&format=csv')
    check("استخراج تقرير الوظائف بصيغة CSV", rep_jobs_csv.status_code == 200 and 'text/csv' in rep_jobs_csv.get('Content-Type', ''))

    # 14. Test FR-25: Password Reset
    print("\n--- 13. اختبار استعادة كلمة المرور (FR-25) ---")
    req_reset = client.post('/api/auth/password-reset-request/', {
        "email": "grad_e2e@test.com"
    }, format='json')
    check("طلب استعادة كلمة المرور", req_reset.status_code == 200, f"Status: {req_reset.status_code}")

    print("\n" + "=" * 60)
    print(f"نتيجة الفحص الشامل: {len(successes)} نجاح | {len(errors)} فشل")
    print("=" * 60)
    if errors:
        for err in errors:
            print(" - FAIL:", err)
    return len(errors) == 0

if __name__ == '__main__':
    run_e2e_verification()
