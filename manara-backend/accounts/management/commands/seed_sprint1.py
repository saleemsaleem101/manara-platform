import os
from django.core.management.base import BaseCommand
from rest_framework.authtoken.models import Token
from accounts.models import User
from profiles.models import GraduateProfile


class Command(BaseCommand):
    help = "بذر بيانات تجريبية معتمدة لسبرنت 1 (حسابات الخريجين والملف المهني) لتسهيل العرض والمناقشة"

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("=== بذر بيانات سبرنت 1 (Sprint 1 Seed Data) ==="))

        # 1. إنشاء خريج رئيسي مكتمل البيانات ومؤكد البريد جاهز لتسجيل الدخول فوراً
        email1 = "graduate@manara.edu.ye"
        user1, created1 = User.objects.get_or_create(
            email=email1,
            defaults={
                "name": "سليم شايف سليمان",
                "phone": "+967 770 000 001",
                "role": "GRADUATE",
                "email_verified": True,
                "is_active": True,
            }
        )
        user1.set_password("Password@2026")
        user1.email_verified = True
        user1.save()
        token1, _ = Token.objects.get_or_create(user=user1)

        profile1, _ = GraduateProfile.objects.get_or_create(
            user=user1,
            defaults={
                "first_name": "سليم",
                "last_name": "سليمان",
                "phone": "+967 770 000 001",
                "city": "اليمن - صنعاء",
                "university": "جامعة العلوم والتكنولوجيا",
                "specialization": "هندسة البرمجيات",
                "graduation_year": 2026,
                "gpa": "94% (امتياز مع مرتبة الشرف الأولى)",
                "years_of_experience": "حديث التخرج (0 - 1 سنة)",
                "bio": (
                    "مهندس برمجيات خريج جامعة العلوم والتكنولوجيا لعام 2026 بمعدل امتياز مع مرتبة الشرف الأولى (94%). "
                    "متخصص في بناء وتطوير الأنظمة السحابية والواجهات الخلفية الحديثة، أمتلك شغفاً بالهندسة البرمجية "
                    "وتصميم قواعد البيانات وحلول الأعمال الرقمية المبتكرة."
                ),
            }
        )
        self.stdout.write(self.style.SUCCESS(f"✔ تم تجهيز الحساب الموثق: {email1} (كلمة المرور: Password@2026)"))

        # 2. إنشاء خريج تجريبي ثانٍ غير مؤكد البريد لتجربة شاشة تفعيل البريد الرقمي (OTP / FR-26)
        email2 = "unverified@manara.edu.ye"
        user2, created2 = User.objects.get_or_create(
            email=email2,
            defaults={
                "name": "جلال عبد الملك الصوفي",
                "phone": "+967 770 000 002",
                "role": "GRADUATE",
                "email_verified": False,
                "is_active": True,
            }
        )
        user2.set_password("Password@2026")
        user2.email_verified = False
        user2.save()
        otp2 = user2.get_verification_code()

        profile2, _ = GraduateProfile.objects.get_or_create(
            user=user2,
            defaults={
                "first_name": "جلال",
                "last_name": "الصوفي",
                "phone": "+967 770 000 002",
                "city": "اليمن - صنعاء",
                "university": "جامعة العلوم والتكنولوجيا",
                "specialization": "هندسة البرمجيات",
                "graduation_year": 2026,
                "gpa": "92% (ممتاز مع مرتبة الشرف)",
                "years_of_experience": "حديث التخرج (0 - 1 سنة)",
                "bio": "مهندس برمجيات متخصص في بناء واجهات الويب التفاعلية وتطوير تجربة المستخدم الحديثة.",
            }
        )
        self.stdout.write(self.style.SUCCESS(f"✔ تم تجهيز الحساب غير المؤكد: {email2} (رمز OTP: {otp2})"))

        self.stdout.write(self.style.MIGRATE_LABEL("\nبيانات الاعتماد الجاهزة للتجربة في المتصفح:"))
        self.stdout.write(f"1) الدخول المباشر: البريد: {email1} | كلمة المرور: Password@2026")
        self.stdout.write(f"2) تجربة التفعيل: البريد: {email2} | كلمة المرور: Password@2026 | رمز التفعيل: {otp2}\n")
