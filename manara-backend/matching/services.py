from .models import MatchingResult


class MatchingService:
    """
    خدمة المطابقة الذكية وفق مخطط الأصناف UML (Class Diagram الشكل 3-4)
    والمعادلة الرسمية المعتمدة في وثيقة الفصل الثالث (الفقرات 131-135):
    Score = ws*Ss + wm*Sm + we*Se + wq*Sq
    sum(weights) = 1
    """

    LEVEL_RANKS = {
        'BEGINNER': 1,
        'INTERMEDIATE': 2,
        'ADVANCED': 3,
        'EXPERT': 4,
    }

    @staticmethod
    def jaccard_similarity(set_a, set_b):
        """
        حساب معامل تشابه Jaccard (+ jaccardSimilarity في مخطط الأصناف):
        J(A, B) = |A ∩ B| / |A ∪ B|
        """
        s_a = set(set_a)
        s_b = set(set_b)
        union = s_a.union(s_b)
        if not union:
            return 1.0
        return len(s_a.intersection(s_b)) / len(union)

    @classmethod
    def jaccardSimilarity(cls, set_a, set_b):
        """الاسم المطابق لـ Class Diagram (الشكل 3-4)."""
        return cls.jaccard_similarity(set_a, set_b)

    # وزن المهارات الإضافية للخريج غير المطلوبة في الوظيفة (0.0 لمنع معاقبة الخريج على امتلاك مهارات إضافية)
    EXTRA_SKILLS_WEIGHT = 0.0

    @classmethod
    def calculate_skills_match(cls, graduate_skills, required_skills):
        r"""
        حساب معامل تشابه Jaccard الموزون بمستويات الإتقان (Weighted Jaccard with Proficiency Levels):
        Ss = (sum_{s in G and R} w_s * level_factor) / (sum_{s in R} w_s + sum_{s in G \ R} w_extra)
        حيث w_extra = 0.0 (قابل للضبط) لمنع معاقبة المرشح على امتلاكه مهارات إضافية.
        وفي حال وجود مهارات إلزامية (is_required=True)، يتم تطبيق نسبة استيفاء المهارات الإلزامية:
        Ss_final = Ss * (mandatory_matched / mandatory_total)
        """
        if not required_skills:
            return 1.0

        grad_map = {gs.skill_id: gs for gs in graduate_skills}
        req_map = {rs.skill_id: rs for rs in required_skills}

        intersection_sum = 0.0
        union_sum = sum(rs.weight for rs in required_skills)

        # المهارات الإلزامية
        mandatory_total = sum(1 for rs in required_skills if rs.is_required)
        mandatory_matched = 0

        for rs in required_skills:
            if rs.skill_id in grad_map:
                gs = grad_map[rs.skill_id]
                grad_lvl = cls.LEVEL_RANKS.get(gs.proficiency_level, 2)
                req_lvl = cls.LEVEL_RANKS.get(rs.required_level, 2)
                level_factor = min(grad_lvl / req_lvl, 1.0) if req_lvl > 0 else 1.0
                intersection_sum += rs.weight * level_factor
                if rs.is_required:
                    mandatory_matched += 1

        # مهارات الخريج الإضافية غير المطلوبة في الوظيفة بوزن قابل للضبط (افتراضياً 0.0)
        extra_skills_count = len(set(grad_map.keys()) - set(req_map.keys()))
        union_sum += extra_skills_count * cls.EXTRA_SKILLS_WEIGHT

        if union_sum == 0:
            base_score = 1.0
        else:
            base_score = intersection_sum / union_sum

        # توحيد خصم المهارات الإلزامية في مكان واحد فقط
        if mandatory_total > 0:
            mandatory_ratio = mandatory_matched / mandatory_total
            base_score *= mandatory_ratio

        return round(min(max(base_score, 0.0), 1.0), 4)

    @staticmethod
    def calculate_score(skills_score, spec_score, exp_score, qual_score, job):
        """
        حساب الدرجة النهائية للمطابقة (+ calculateScore في مخطط الأصناف):
        Final = Ws × Ss + Wm × Sm + We × Se + Wq × Sq
        """
        final_score = (
            (skills_score * job.skills_weight) +
            (spec_score * job.specialization_weight) +
            (exp_score * job.experience_weight) +
            (qual_score * job.qualification_weight)
        )
        return round(min(max(final_score, 0.0), 1.0), 4)

    @classmethod
    def calculateScore(cls, *args, **kwargs):
        """الاسم المطابق لـ Class Diagram (الشكل 3-4)."""
        return cls.calculate_score(*args, **kwargs)

    @classmethod
    def calculate_match_scores(cls, profile, job):
        """
        حساب معايير التوافق الأربعة بين الخريج والوظيفة وفق الفصل الثاني (11.2.2 و 12.2.2):
        1. مطابقة المهارات Ss باستخدام معامل Jaccard Similarity
        2. مطابقة التخصص Sm
        3. مطابقة سنوات الخبرة Se
        4. مطابقة المؤهل العلمي Sq
        5. الدرجة النهائية Score = ws*Ss + wm*Sm + we*Se + wq*Sq
        """
        # 1. حساب مطابقة المهارات (Skills Score) باستخدام Jaccard الموزون (P132)
        if hasattr(job, 'required_skills_set') and hasattr(job.required_skills_set, 'all'):
            required_skills = list(job.required_skills_set.all())
        elif hasattr(job, 'required_skills') and hasattr(job.required_skills, 'all'):
            required_skills = list(job.required_skills.all())
        else:
            required_skills = []
        graduate_skills = list(profile.skills.all())
        skills_score = cls.calculate_skills_match(graduate_skills, required_skills)

        # 2. حساب مطابقة التخصص (Specialization Score)
        # توثيق: مطابقة التخصص تعتمد أولاً على الربط العلائقي مع Major، ثم المطابقة النصية بـ icontains لمرونة الصيغ العربية
        p_spec = (profile.specialization or '').strip().lower()
        j_spec = (getattr(job, 'specialization_required', '') or getattr(job, 'required_major', '') or '').strip().lower()

        major_matched = False
        if getattr(job, 'major_id', None):
            if profile.qualifications.filter(major_id=job.major_id).exists():
                major_matched = True
            elif job.major and (job.major.major_name.strip().lower() in p_spec or p_spec in job.major.major_name.strip().lower()):
                major_matched = True
            elif job.major and profile.qualifications.filter(major__major_name__icontains=job.major.major_name).exists():
                major_matched = True
        elif j_spec:
            if p_spec and (p_spec in j_spec or j_spec in p_spec):
                major_matched = True
            elif profile.qualifications.filter(major__major_name__icontains=j_spec).exists():
                major_matched = True

        specialization_score = 1.0 if major_matched else 0.0

        # 3. حساب مطابقة سنوات الخبرة (Experience Score)
        req_exp = float(getattr(job, 'minimum_experience_years', 0.0) or getattr(job, 'required_exp', 0.0) or 0.0)

        # حساب الخبرة التراكمية من جدول experiences العلائقي
        from django.utils import timezone
        today = timezone.now().date()
        total_exp_days = 0
        for exp in profile.experiences.all():
            start = exp.start_date
            end = exp.end_date or today
            if start and end >= start:
                total_exp_days += (end - start).days

        calculated_years = round(total_exp_days / 365.25, 1)

        # تحليل نص الخبرة باللغة العربية عبر mapping صريح يسبق Regex
        val_str = str(profile.years_of_experience or '').strip()
        EXP_ARABIC_MAPPING = {
            'حديث التخرج': 0.0,
            'حديث تخرج': 0.0,
            'بدون خبرة': 0.0,
            'لا يوجد': 0.0,
            'صفر': 0.0,
            'أقل من سنة': 0.5,
            'سنة': 1.0,
            'سنة واحدة': 1.0,
            'سنتين': 2.0,
            'ثلاث سنوات': 3.0,
            'أربع سنوات': 4.0,
            'خمس سنوات': 5.0,
        }

        grad_exp_val = None
        for arabic_term, mapped_val in EXP_ARABIC_MAPPING.items():
            if arabic_term in val_str:
                grad_exp_val = mapped_val
                break

        if grad_exp_val is None:
            try:
                import re
                m = re.findall(r'\d+\.?\d*', val_str)
                grad_exp_val = float(m[0]) if m else 0.0
            except (ValueError, TypeError):
                grad_exp_val = 0.0

        grad_exp = max(grad_exp_val, calculated_years)
        experience_score = 1.0 if req_exp == 0.0 else min(grad_exp / req_exp, 1.0)

        # 4. حساب مطابقة المؤهل العلمي (Qualification Score)
        qualification_levels = {'DIPLOMA': 1, 'BACHELOR': 2, 'MASTER': 3, 'DOCTORATE': 4}
        qual_records = profile.qualifications.all()
        if qual_records.exists():
            grad_lvl = max(qualification_levels.get(q.degree, 2) for q in qual_records)
        else:
            grad_lvl = qualification_levels.get(profile.qualification_level, 2)
        job_lvl = qualification_levels.get(job.qualification_required, 2)
        qualification_score = min(grad_lvl / job_lvl, 1.0)

        # 5. حساب النتيجة الإجمالية الموزونة (Final Score)
        final_score = cls.calculate_score(
            skills_score, specialization_score, experience_score, qualification_score, job
        )

        return {
            'skills_score': round(skills_score, 4),
            'specialization_score': round(specialization_score, 4),
            'experience_score': round(experience_score, 4),
            'qualification_score': round(qualification_score, 4),
            'final_score': final_score,
        }

    @classmethod
    def compare_profiles(cls, application):
        """
        مقارنة بيانات الخريج مع متطلبات الوظيفة (+ compareProfiles في مخطط الأصناف).
        """
        job = application.job
        profile = application.profile

        scores = cls.calculate_match_scores(profile, job)

        # حفظ أو تحديث النتيجة في قاعدة البيانات
        result, _ = MatchingResult.objects.update_or_create(
            application=application,
            defaults={
                'job': job,
                'graduate': profile,
                **scores
            }
        )

        # تحديث حقل match_score في Application أيضاً وفق مخطط ERD الجديد
        application.match_score = scores['final_score']
        application.save(update_fields=['match_score'])

        return result

    @classmethod
    def calculate_graduate_job_match(cls, graduate, job):
        """حساب المطابقة المباشرة بين خريج ووظيفة وحفظ النتيجة في MATCH_RESULTS."""
        scores = cls.calculate_match_scores(graduate, job)
        result, _ = MatchingResult.objects.update_or_create(
            job=job,
            graduate=graduate,
            application=None,
            defaults=scores
        )
        return result


    @classmethod
    def compareProfiles(cls, application):
        """الاسم المطابق لـ Class Diagram (الشكل 3-4)."""
        return cls.compare_profiles(application)

    @staticmethod
    def rank_candidates(job, applications=None):
        """
        ترتيب المرشحين المتقدمين لوظيفة وفق درجة التوافق (+ rankCandidates في مخطط الأصناف و FR-17).
        تسريع الأداء عبر prefetch للمهارات والمشاريع واستخدام annotate لدرجة المطابقة (NFR-03).
        """
        from jobs.models import Application
        from django.db.models import F

        if applications is None:
            applications = Application.objects.filter(job=job)
        return (
            applications.select_related('profile', 'profile__user', 'matching_result')
            .prefetch_related(
                'profile__skills__skill',
                'profile__projects',
                'profile__qualifications',
                'profile__experiences',
            )
            .annotate(
                ranked_score=F('matching_result__final_score')
            )
            .order_by('-ranked_score', '-applied_at')
        )

    @classmethod
    def rankCandidates(cls, job, applications=None):
        """الاسم المطابق لـ Class Diagram (الشكل 3-4)."""
        return cls.rank_candidates(job, applications)

    @classmethod
    def recalculate_for_job(cls, job):
        """
        إعادة حساب درجات المطابقة لجميع الطلبات النشطة لوظيفة معينة عبر bulk_update ومعاملة ذرية (P2).
        مهيأة للنقل إلى مهمة خلفية غير متزامنة (Celery Task).
        """
        from jobs.models import Application
        from django.db import transaction

        apps = list(
            Application.objects.filter(job=job)
            .exclude(status='WITHDRAWN')
            .select_related('profile', 'matching_result')
            .prefetch_related('profile__skills', 'profile__qualifications', 'profile__experiences')
        )
        if not apps:
            return []

        results = []
        apps_to_update = []
        results_to_update = []
        results_to_create = []

        with transaction.atomic():
            for app in apps:
                scores = cls.calculate_match_scores(app.profile, job)
                app.match_score = scores['final_score']
                apps_to_update.append(app)

                mr = getattr(app, 'matching_result', None)
                if mr:
                    mr.job = job
                    mr.graduate = app.profile
                    mr.skills_score = scores['skills_score']
                    mr.specialization_score = scores['specialization_score']
                    mr.experience_score = scores['experience_score']
                    mr.qualification_score = scores['qualification_score']
                    mr.final_score = scores['final_score']
                    results_to_update.append(mr)
                    results.append(mr)
                else:
                    new_mr = MatchingResult(
                        application=app,
                        job=job,
                        graduate=app.profile,
                        **scores
                    )
                    results_to_create.append(new_mr)
                    results.append(new_mr)

            if apps_to_update:
                Application.objects.bulk_update(apps_to_update, ['match_score'])
            if results_to_update:
                MatchingResult.objects.bulk_update(
                    results_to_update,
                    ['job', 'graduate', 'skills_score', 'specialization_score', 'experience_score', 'qualification_score', 'final_score']
                )
            if results_to_create:
                MatchingResult.objects.bulk_create(results_to_create)

        return results

    @classmethod
    def recalculate_for_profile(cls, profile):
        """
        إعادة حساب درجات المطابقة لجميع طلبات الخريج النشطة عبر bulk_update ومعاملة ذرية (P2).
        مهيأة للنقل إلى مهمة خلفية غير متزامنة (Celery Task).
        """
        from jobs.models import Application
        from django.db import transaction

        apps = list(
            Application.objects.filter(profile=profile)
            .exclude(status='WITHDRAWN')
            .select_related('job', 'matching_result')
            .prefetch_related('job__required_skills__skill')
        )
        if not apps:
            return []

        results = []
        apps_to_update = []
        results_to_update = []
        results_to_create = []

        with transaction.atomic():
            for app in apps:
                scores = cls.calculate_match_scores(profile, app.job)
                app.match_score = scores['final_score']
                apps_to_update.append(app)

                mr = getattr(app, 'matching_result', None)
                if mr:
                    mr.job = app.job
                    mr.graduate = profile
                    mr.skills_score = scores['skills_score']
                    mr.specialization_score = scores['specialization_score']
                    mr.experience_score = scores['experience_score']
                    mr.qualification_score = scores['qualification_score']
                    mr.final_score = scores['final_score']
                    results_to_update.append(mr)
                    results.append(mr)
                else:
                    new_mr = MatchingResult(
                        application=app,
                        job=app.job,
                        graduate=profile,
                        **scores
                    )
                    results_to_create.append(new_mr)
                    results.append(new_mr)

            if apps_to_update:
                Application.objects.bulk_update(apps_to_update, ['match_score'])
            if results_to_update:
                MatchingResult.objects.bulk_update(
                    results_to_update,
                    ['job', 'graduate', 'skills_score', 'specialization_score', 'experience_score', 'qualification_score', 'final_score']
                )
            if results_to_create:
                MatchingResult.objects.bulk_create(results_to_create)

        return results


def calculate_application_match(application):
    """دالة توافقية تستدعي MatchingService.compare_profiles مباشرة."""
    return MatchingService.compare_profiles(application)
