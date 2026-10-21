import os
import sys
import django

# Setup Django Environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'manara_backend.settings')
django.setup()

from accounts.models import User
from profiles.models import GraduateProfile, Company, Skill, GraduateSkill, Major
from django.db import transaction

def run():
    print("=" * 60)
    print("🚀 بدء اختبار التطبيق المحلي وإنشاء حسابات الخريجين والشركات")
    print("=" * 60)

    with transaction.atomic():
        # 1. Admin Verification / Creation
        admin_user, created_admin = User.objects.get_or_create(
            email='admin@manarah.ye',
            defaults={
                'name': 'مدير منصة منارة',
                'role': 'ADMIN',
                'is_staff': True,
                'is_superuser': True,
                'email_verified': True,
            }
        )
        admin_user.set_password('Admin@123456')
        admin_user.role = 'ADMIN'
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.email_verified = True
        admin_user.save()
        print(f"✓ حساب مدير النظام (Admin): {admin_user.email} (تم {'إنشاؤه' if created_admin else 'تحديثه وتأكيده'})")

        # 2. Pre-requisite Skills
        skill_python, _ = Skill.objects.get_or_create(name='Python', defaults={'category': 'TECHNICAL'})
        skill_django, _ = Skill.objects.get_or_create(name='Django', defaults={'category': 'TECHNICAL'})
        skill_react, _ = Skill.objects.get_or_create(name='React.js', defaults={'category': 'TECHNICAL'})
        skill_ts, _ = Skill.objects.get_or_create(name='TypeScript', defaults={'category': 'TECHNICAL'})

        # 3. Create Graduate 1: أحمد علي سالم
        grad1_user, created_g1 = User.objects.get_or_create(
            email='ahmed.salem@manarah.ye',
            defaults={
                'name': 'أحمد علي سالم',
                'role': 'GRADUATE',
                'phone': '+967771234567',
                'email_verified': True,
            }
        )
        grad1_user.set_password('Password@123')
        grad1_user.email_verified = True
        grad1_user.save()

        grad1_profile, _ = GraduateProfile.objects.get_or_create(user=grad1_user)
        grad1_profile.first_name = 'أحمد'
        grad1_profile.last_name = 'سالم'
        grad1_profile.university = 'جامعة صنعاء'
        grad1_profile.specialization = 'هندسة البرمجيات'
        grad1_profile.qualification_level = 'BACHELOR'
        grad1_profile.graduation_year = 2024
        grad1_profile.gpa = '91.5'
        grad1_profile.years_of_experience = '1'
        grad1_profile.bio = 'مهندس برمجيات متخصص في بناء تطبيقات الويب السحابية وقواعد البيانات الحديثة.'
        grad1_profile.save()

        GraduateSkill.objects.update_or_create(profile=grad1_profile, skill=skill_python, defaults={'proficiency_level': 'EXPERT'})
        GraduateSkill.objects.update_or_create(profile=grad1_profile, skill=skill_django, defaults={'proficiency_level': 'EXPERT'})
        GraduateSkill.objects.update_or_create(profile=grad1_profile, skill=skill_react, defaults={'proficiency_level': 'INTERMEDIATE'})
        print(f"✓ الخريج 1: {grad1_user.name} ({grad1_user.email}) - تخصص {grad1_profile.specialization} بمعدل {grad1_profile.gpa}%")

        # 4. Create Graduate 2: فاطمة محمد العريقي
        grad2_user, created_g2 = User.objects.get_or_create(
            email='fatima.ariqi@manarah.ye',
            defaults={
                'name': 'فاطمة محمد العريقي',
                'role': 'GRADUATE',
                'phone': '+967772345678',
                'email_verified': True,
            }
        )
        grad2_user.set_password('Password@123')
        grad2_user.email_verified = True
        grad2_user.save()

        grad2_profile, _ = GraduateProfile.objects.get_or_create(user=grad2_user)
        grad2_profile.first_name = 'فاطمة'
        grad2_profile.last_name = 'العريقي'
        grad2_profile.university = 'جامعة العلوم والتكنولوجيا'
        grad2_profile.specialization = 'علوم الحاسوب'
        grad2_profile.qualification_level = 'BACHELOR'
        grad2_profile.graduation_year = 2025
        grad2_profile.gpa = '94.2'
        grad2_profile.years_of_experience = '0'
        grad2_profile.bio = 'مطورة واجهات أمامية وتجربة مستخدم متميزة ذات شغف بتصميم المنصات التفاعلية الحديثة.'
        grad2_profile.save()

        GraduateSkill.objects.update_or_create(profile=grad2_profile, skill=skill_react, defaults={'proficiency_level': 'EXPERT'})
        GraduateSkill.objects.update_or_create(profile=grad2_profile, skill=skill_ts, defaults={'proficiency_level': 'EXPERT'})
        print(f"✓ الخريج 2: {grad2_user.name} ({grad2_user.email}) - تخصص {grad2_profile.specialization} بمعدل {grad2_profile.gpa}%")

        # 5. Create Company 1: مجموعة يمن تك الرقمية (معتمدة Approved)
        comp1_user, created_c1 = User.objects.get_or_create(
            email='info@yemen-tech.ye',
            defaults={
                'name': 'م. عبدالله محمد العريقي',
                'role': 'COMPANY',
                'phone': '+9671456789',
                'email_verified': True,
            }
        )
        comp1_user.set_password('Password@123')
        comp1_user.email_verified = True
        comp1_user.save()

        comp1_profile, _ = Company.objects.get_or_create(user=comp1_user)
        comp1_profile.company_name = 'مجموعة يمن تك الرقمية'
        comp1_profile.commercial_reg = 'CR-10293847'
        comp1_profile.industry = 'تكنولوجيا المعلومات والبرمجيات'
        comp1_profile.location = 'اليمن - صنعاء (حدة)'
        comp1_profile.website = 'https://yemen-tech.ye'
        comp1_profile.verification_status = 'APPROVED'
        comp1_profile.description = 'مجموعة رائدة في تقديم الحلول الرقمية، وتطوير الأنظمة السحابية والتحول الرقمي للمؤسسات.'
        comp1_profile.save()
        print(f"✓ الشركة 1: {comp1_profile.company_name} ({comp1_user.email}) - السجل: {comp1_profile.commercial_reg} [الحالة: {comp1_profile.verification_status}]")

        # 6. Create Company 2: شركة الرواد للحلول المؤسسية (قيد المراجعة Pending ليرى الأدمن طلب الاعتماد)
        comp2_user, created_c2 = User.objects.get_or_create(
            email='contact@alrowwad-solutions.ye',
            defaults={
                'name': 'أ. خالد باوزير',
                'role': 'COMPANY',
                'phone': '+9672234567',
                'email_verified': True,
            }
        )
        comp2_user.set_password('Password@123')
        comp2_user.email_verified = True
        comp2_user.save()

        comp2_profile, _ = Company.objects.get_or_create(user=comp2_user)
        comp2_profile.company_name = 'شركة الرواد للحلول المؤسسية'
        comp2_profile.commercial_reg = 'CR-55443322'
        comp2_profile.industry = 'الاستشارات والحلول المؤسسية'
        comp2_profile.location = 'اليمن - عدن (المعلا)'
        comp2_profile.website = 'https://alrowwad.ye'
        comp2_profile.verification_status = 'PENDING'
        comp2_profile.description = 'شركة متخصصة في الاستشارات الإدارية والتقنية واستقطاب الكفاءات الجامعية.'
        comp2_profile.save()
        print(f"✓ الشركة 2: {comp2_profile.company_name} ({comp2_user.email}) - السجل: {comp2_profile.commercial_reg} [الحالة: {comp2_profile.verification_status}]")

    print("\n" + "=" * 60)
    print("📊 التحقق الإداري وفحص قاعدة البيانات من جهة الأدمن:")
    print("=" * 60)

    total_users = User.objects.count()
    graduates_count = User.objects.filter(role='GRADUATE').count()
    companies_count = User.objects.filter(role='COMPANY').count()
    pending_companies = Company.objects.filter(verification_status='PENDING').count()
    approved_companies = Company.objects.filter(verification_status='APPROVED').count()

    print(f"• إجمالي المستخدمين المسجلين في النظام: {total_users}")
    print(f"• إجمالي حسابات الخريجين: {graduates_count}")
    print(f"• إجمالي حسابات الشركات: {companies_count}")
    print(f"• طلبات الاعتماد التجاري المعلقة في لوحة الأدمن: {pending_companies}")
    print(f"• المنشآت المعتمدة رسمياً: {approved_companies}")

    print("\n✓ قائمة المستخدمين كما تظهر في لوحة إدارة الأدمن (/admin/users):")
    for u in User.objects.all().order_by('-id')[:6]:
        print(f"   [ID: {u.id}] {u.name} | {u.email} | دور: {u.role} | موثق: {'نعم' if u.email_verified else 'لا'}")

    print("\n✓ قائمة الشركات كما تظهر في لوحة تدقيق الاعتماد (/admin#approvals):")
    for c in Company.objects.all().order_by('-id'):
        print(f"   [Company ID: {c.id}] {c.company_name} | سجل: {c.commercial_reg} | حالة: {c.verification_status}")

    print("\n✅ تم الحفظ بنجاح تام واكتمال الفحص المحلي لقاعدة البيانات!")

if __name__ == '__main__':
    run()
