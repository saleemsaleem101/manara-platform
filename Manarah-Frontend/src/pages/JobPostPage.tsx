import React, { useState, useEffect, useRef, useId } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { LoadingState } from '../components/LoadingState'
import { api } from '../services/api'
import type { CreateJobPayload, Skill, CompanyProfile } from '../types'

export const JobPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Company verification state
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null)

  // Form Fields
  const [title, setTitle] = useState('')
  const [requiredMajor, setRequiredMajor] = useState('')
  const [requiredExp, setRequiredExp] = useState(0)
  const [requiredQualification, setRequiredQualification] = useState<'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'DOCTORATE'>('BACHELOR')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState<'FULL_TIME' | 'PART_TIME' | 'REMOTE' | 'HYBRID'>('FULL_TIME')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')

  // Skills from catalog
  const [catalogSkills, setCatalogSkills] = useState<Skill[]>([])
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([])
  const [skillSearch, setSkillSearch] = useState('')

  // Matching Weights: ∑w = 1.0 (Official Document Paragraph 593: 45% / 25% / 20% / 10%)
  const [skillsWeight, setSkillsWeight] = useState(0.45)
  const [majorWeight, setMajorWeight] = useState(0.25)
  const [expWeight, setExpWeight] = useState(0.20)
  const [qualWeight, setQualWeight] = useState(0.10)
  const [minMatchScore, setMinMatchScore] = useState(0.60)

  const totalWeight = Math.round((skillsWeight + majorWeight + expWeight + qualWeight) * 100) / 100
  const isWeightsValid = Math.abs(totalWeight - 1.0) < 0.001

  // Unique IDs for form controls
  const titleInputId = useId()
  const majorSelectId = useId()
  const expSelectId = useId()
  const qualSelectId = useId()
  const locationInputId = useId()
  const jobTypeSelectId = useId()
  const deadlineInputId = useId()
  const skillSearchInputId = useId()
  const descTextareaId = useId()
  const skillsWeightSliderId = useId()
  const majorWeightSliderId = useId()
  const expWeightSliderId = useId()
  const qualWeightSliderId = useId()
  const minScoreSliderId = useId()

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        // 1. Check Company Status
        const company = await api.getCompanyProfile().catch(() => null)
        setCompanyProfile(company)

        // 2. Load Skills Catalog
        const skillsList = await api.getSkills().catch(() => [])
        setCatalogSkills(skillsList)

        // 3. If Edit Mode, load job details
        if (isEditMode && id) {
          const job = await api.getJobDetails(Number(id))
          setTitle(job.title)
          setRequiredMajor(job.required_major)
          setRequiredExp(job.required_exp || 0)
          setRequiredQualification(job.required_qualification || 'BACHELOR')
          setLocation(job.location || '')
          setJobType(job.job_type || 'FULL_TIME')
          setDescription(job.description || '')
          if (job.deadline) {
            setDeadline(job.deadline.split('T')[0])
          }
          if (job.skills_weight !== undefined) setSkillsWeight(job.skills_weight)
          if (job.specialization_weight !== undefined) setMajorWeight(job.specialization_weight)
          if (job.experience_weight !== undefined) setExpWeight(job.experience_weight)
          if (job.qualification_weight !== undefined) setQualWeight(job.qualification_weight)
          if (job.minimum_match_score !== undefined) setMinMatchScore(job.minimum_match_score)

          if (job.required_skills && job.required_skills.length > 0) {
            setSelectedSkillIds(job.required_skills.map((s) => s.skill))
          }
        }
      } catch (err: unknown) {
        const msg = (err as { message?: string })?.message
        setFeedbackMsg({ text: msg || 'فشل تحميل بيانات الصفحة', type: 'error' })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id, isEditMode])

  const toggleSkill = (skillId: number) => {
    if (selectedSkillIds.includes(skillId)) {
      setSelectedSkillIds(selectedSkillIds.filter((sid) => sid !== skillId))
    } else {
      setSelectedSkillIds([...selectedSkillIds, skillId])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isWeightsValid) {
      setFeedbackMsg({
        text: `مجموع أوزان المعايير يجب أن يساوي 100% (1.00) تماماً. المجموع الحالي: ${(totalWeight * 100).toFixed(0)}%`,
        type: 'error',
      })
      return
    }

    if (!title.trim() || !requiredMajor.trim() || !description.trim()) {
      setFeedbackMsg({ text: 'يرجى استكمال جميع الحقول الإلزامية المميزة بنجمة (*)', type: 'error' })
      return
    }

    try {
      setIsSubmitting(true)
      const payload: CreateJobPayload = {
        title,
        description,
        required_major: requiredMajor,
        required_exp: Number(requiredExp) || 0,
        required_qualification: requiredQualification,
        location,
        job_type: jobType,
        deadline: deadline || undefined,
        skills_weight: skillsWeight,
        specialization_weight: majorWeight,
        experience_weight: expWeight,
        qualification_weight: qualWeight,
        minimum_match_score: minMatchScore,
        skills: selectedSkillIds.map((skillId) => {
          const matched = catalogSkills.find((s) => s.id === skillId)
          return {
            skill: skillId,
            name: matched?.name || '',
            is_required: true,
            required_level: 'INTERMEDIATE',
            weight: 1.0,
          }
        }),
      }

      if (isEditMode && id) {
        await api.updateJob(Number(id), payload)
        setFeedbackMsg({
          text: 'تم تحديث بيانات الوظيفة وأوزان المطابقة بنجاح',
          type: 'success',
        })
      } else {
        await api.createJob(payload)
        setFeedbackMsg({
          text: 'تم نشر الوظيفة بنجاح وتفعيل معايير التوافق الموزونة',
          type: 'success',
        })
      }

      timeoutRef.current = setTimeout(() => {
        navigate('/company/jobs')
      }, 1500)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      setFeedbackMsg({ text: msg || 'فشل حفظ الوظيفة، يرجى المحاولة لاحقاً', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5]" dir="rtl">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <LoadingState message="جاري تحميل بيانات الوظيفة ودليل المهارات..." />
        </div>
      </div>
    )
  }

  // Blocked State for unverified company (FR-23)
  const isApproved = companyProfile?.verification_status === 'APPROVED'
  if (!isApproved) {
    return (
      <div className="min-h-screen bg-[#FBF9F5]" dir="rtl">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <div className="bg-white rounded-3xl border border-[#BAE6FD] p-8 sm:p-10 shadow-2xs text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F4FC] text-[#0284C7] border border-[#BAE6FD] flex items-center justify-center mx-auto mb-6 text-2xl font-black">
              ℹ
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] mb-3">
              نشر الوظائف غير متاح حالياً
            </h1>
            <p className="text-sm text-[#475569] max-w-lg mx-auto mb-8 leading-relaxed">
              وفقاً لضوابط واعتمادات المنصة، لا يمكن للمنشأة نشر شواغر وظيفية جديدة أو تعديل الشواغر حتى يتم التحقق من السجل التجاري واعتماد الحساب رسمياً من قبل الإدارة.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/company/status"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#10B981] hover:from-[#0369A1] hover:to-[#059669] text-white font-black text-sm transition shadow-xs"
              >
                متابعة حالة اعتماد المنشأة
              </Link>
              <Link
                to="/company/jobs"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#EAE4D9] bg-white hover:bg-[#F4EFE6]/60 text-[#0F172A] font-bold text-sm transition"
              >
                العودة لوظائفي
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const filteredSkills = catalogSkills.filter((s) =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#0F172A] font-sans" dir="rtl">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Breadcrumbs */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-2 font-medium">
            <Link to="/company/jobs" className="hover:text-[#0284C7] transition">
              وظائفي
            </Link>
            <span>/</span>
            <span className="text-[#0284C7] font-bold">
              {isEditMode ? 'تعديل وظيفة وتحديد أوزان المطابقة' : 'نشر شاغر جديد وضبط أوزان المطابقة'}
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
                {isEditMode ? 'تعديل بيانات الوظيفة وأوزان المطابقة' : 'نشر وظيفة جديدة وتحديد أوزان المطابقة'}
              </h1>
              <p className="text-[#64748B] text-xs sm:text-sm mt-1">
                تحديد متطلبات الشاغر وضبط أوزان معايير التوافق الموزونة لحساب درجة التطابق بدقة
              </p>
            </div>
            <Link
              to="/company/jobs"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EAE4D9] bg-white hover:bg-[#F4EFE6]/60 text-[#0F172A] text-xs font-bold transition shadow-2xs self-start"
            >
              العودة لقائمة وظائفي
            </Link>
          </div>
        </div>

        {/* Feedback message banner */}
        {feedbackMsg && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-sm font-bold shadow-2xs ${
              feedbackMsg.type === 'success'
                ? 'bg-[#E8F8F2] text-[#0D6E44] border border-[#BDE8D2]'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="text-xs text-slate-400 hover:text-slate-700 font-normal px-2 py-1 cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Section 1: تفاصيل الوظيفة والشروط (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-[#EAE4D9] p-6 sm:p-8 shadow-2xs">
              <div className="flex items-center gap-3 border-b border-[#EAE4D9] pb-4 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-[#0284C7] text-white font-black flex items-center justify-center text-base shadow-xs">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#0F172A]">تفاصيل الشاغر الوظيفي</h2>
                  <p className="text-xs text-[#64748B]">المعلومات الأساسية ومتطلبات التأهيل والشروط الأكاديمية</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor={titleInputId} className="block text-xs font-bold text-[#475569] mb-1.5">
                    المسمى الوظيفي <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id={titleInputId}
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder=""
                    className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#FBF9F5] text-xs sm:text-sm font-semibold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={majorSelectId} className="block text-xs font-bold text-[#475569] mb-1.5">
                      التخصص المطلوب <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id={majorSelectId}
                      required
                      value={requiredMajor}
                      onChange={(e) => setRequiredMajor(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#FBF9F5] text-xs sm:text-sm font-semibold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition"
                    >
                      <option value="">اختر التخصص الأكاديمي المطلوب</option>
                      <option value="علوم الحاسب">علوم الحاسب</option>
                      <option value="هندسة البرمجيات">هندسة البرمجيات</option>
                      <option value="تقنية المعلومات">تقنية المعلومات</option>
                      <option value="نظم المعلومات الحاسوبية">نظم المعلومات الحاسوبية</option>
                      <option value="علم البيانات">علم البيانات والتحليل الرقمي</option>
                      <option value="الأمن السيبراني">الأمن السيبراني</option>
                      <option value="هندسة الحاسب">هندسة الحاسب</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor={expSelectId} className="block text-xs font-bold text-[#475569] mb-1.5">
                      سنوات الخبرة المطلوبة <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id={expSelectId}
                      value={requiredExp}
                      onChange={(e) => setRequiredExp(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#FBF9F5] text-xs sm:text-sm font-semibold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition"
                    >
                      <option value={0}>حديث تخرج (بدون خبرة سابقة)</option>
                      <option value={1}>سنة واحدة</option>
                      <option value={2}>سنتان</option>
                      <option value={3}>3 سنوات</option>
                      <option value={4}>4 سنوات</option>
                      <option value={5}>5 سنوات فأكثر</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={qualSelectId} className="block text-xs font-bold text-[#475569] mb-1.5">
                      المؤهل التعليمي الأدنى <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id={qualSelectId}
                      value={requiredQualification}
                      onChange={(e) => setRequiredQualification(e.target.value as 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'DOCTORATE')}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#FBF9F5] text-xs sm:text-sm font-semibold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition"
                    >
                      <option value="DIPLOMA">دبلوم متوسط</option>
                      <option value="BACHELOR">بكالوريوس</option>
                      <option value="MASTER">ماجستير</option>
                      <option value="DOCTORATE">دكتوراه</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor={locationInputId} className="block text-xs font-bold text-[#475569] mb-1.5">
                      المدينة / مقر العمل
                    </label>
                    <input
                      id={locationInputId}
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder=""
                      className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#FBF9F5] text-xs sm:text-sm font-semibold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={jobTypeSelectId} className="block text-xs font-bold text-[#475569] mb-1.5">
                      نمط ونوع العمل
                    </label>
                    <select
                      id={jobTypeSelectId}
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value as 'FULL_TIME' | 'PART_TIME' | 'REMOTE' | 'HYBRID')}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#FBF9F5] text-xs sm:text-sm font-semibold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition"
                    >
                      <option value="FULL_TIME">دوام كامل (حضوري)</option>
                      <option value="PART_TIME">دوام جزئي</option>
                      <option value="REMOTE">عن بُعد بالكامل</option>
                      <option value="HYBRID">هجين (حضوري وعن بُعد)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor={deadlineInputId} className="block text-xs font-bold text-[#475569] mb-1.5">
                      آخر موعد لاستقبال الطلبات
                    </label>
                    <input
                      id={deadlineInputId}
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#FBF9F5] text-xs sm:text-sm font-semibold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Skills Picker from Catalog */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor={skillSearchInputId} className="block text-xs font-bold text-[#475569]">
                      المهارات المطلوبة (من دليل المنصة المعتمد) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-[#0284C7] font-bold">
                      المحدد: <bdi dir="ltr">{selectedSkillIds.length}</bdi> مهارات
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mb-3">
                    يتم اختيار المهارات من الدليل الموحد لضمان دقة حساب تشابه جاكارد الرياضي.
                  </p>

                  <input
                    id={skillSearchInputId}
                    type="text"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    placeholder="ابحث في دليل المهارات..."
                    className="w-full px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-medium mb-3 bg-[#FBF9F5] text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition"
                  />

                  {/* Skills Catalog Chips */}
                  <div className="max-h-40 overflow-y-auto p-3 rounded-xl border border-[#EAE4D9] bg-[#FBF9F5]/60 flex flex-wrap gap-1.5">
                    {filteredSkills.map((sk) => {
                      const isSelected = selectedSkillIds.includes(sk.id)
                      return (
                        <button
                          key={sk.id}
                          type="button"
                          onClick={() => toggleSkill(sk.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-[#E8F8F2] text-[#0D6E44] border border-[#BDE8D2] font-black'
                              : 'bg-white text-[#475569] border border-[#EAE4D9] hover:border-[#BAE6FD]'
                          }`}
                        >
                          <span>{sk.name}</span>
                          <span>{isSelected ? '✓' : '+'}</span>
                        </button>
                      )
                    })}
                    {filteredSkills.length === 0 && (
                      <span className="text-xs text-[#94A3B8] p-2">لا توجد مهارات مطابقة للبحث</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor={descTextareaId} className="block text-xs font-bold text-[#475569] mb-1.5">
                    الوصف الوظيفي والمسؤوليات الأساسية <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id={descTextareaId}
                    rows={5}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="اكتب وصفاً مفصلاً للمهام والمسؤوليات ومواصفات المرشح..."
                    className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] bg-[#FBF9F5] text-xs sm:text-sm font-semibold text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: أوزان معايير التوافق (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-[#EAE4D9] p-6 sm:p-8 shadow-2xs sticky top-24">
              <div className="flex items-center gap-3 border-b border-[#EAE4D9] pb-4 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-[#10B981] text-white font-black flex items-center justify-center text-base shadow-xs">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#0F172A]">أوزان معايير التوافق</h2>
                  <p className="text-xs text-[#64748B]">حدد أوزان العوامل الأربعة بشرط: المجموع = 1.0 (100%) تماماً</p>
                </div>
              </div>

              {/* Formula Badge */}
              <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#EAE4D9] mb-4 text-xs">
                <div className="flex items-center justify-between font-black mb-2">
                  <span className="text-[#0284C7]">صيغة التوافق الموزونة:</span>
                  <span className="font-mono text-[#0D6E44] bg-[#E8F8F2] px-2 py-0.5 rounded-md border border-[#BDE8D2]">
                    ∑w = 1.00 (100%)
                  </span>
                </div>
                <p className="text-[#475569] text-[11px] leading-relaxed font-mono" dir="ltr">
                  Score = (ws × Ss) + (wm × Sm) + (we × Se) + (wq × Sq)
                </p>
              </div>

              {/* Quick Weight Presets */}
              <div className="mb-5 space-y-2">
                <span className="text-[11px] font-bold text-[#64748B] block">أنماط الأوزان السريعة والمخصصة:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSkillsWeight(0.65)
                      setMajorWeight(0.25)
                      setExpWeight(0.0)
                      setQualWeight(0.10)
                    }}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold text-start transition cursor-pointer ${
                      expWeight === 0.0 && skillsWeight === 0.65
                        ? 'bg-[#E8F8F2] border-[#BDE8D2] text-[#0D6E44]'
                        : 'bg-[#FBF9F5] border-[#EAE4D9] text-[#0F172A] hover:border-[#BAE6FD]'
                    }`}
                  >
                    <div className="font-black flex items-center gap-1 mb-0.5">
                      <span>🎓</span>
                      <span>نمط خريجي الحاسوب الجدد</span>
                    </div>
                    <span className="text-[10px] text-[#64748B] block">
                      خبرة 0% • تركيز كلي على المشاريع والمهارات
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSkillsWeight(0.45)
                      setMajorWeight(0.25)
                      setExpWeight(0.20)
                      setQualWeight(0.10)
                    }}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold text-start transition cursor-pointer ${
                      expWeight === 0.20 && skillsWeight === 0.45
                        ? 'bg-[#E8F4FC] border-[#BAE6FD] text-[#0284C7]'
                        : 'bg-[#FBF9F5] border-[#EAE4D9] text-[#0F172A] hover:border-[#BAE6FD]'
                    }`}
                  >
                    <div className="font-black flex items-center gap-1 mb-0.5">
                      <span>⚖️</span>
                      <span>النمط الموزون القياسي</span>
                    </div>
                    <span className="text-[10px] text-[#64748B] block">
                      45% مهارات • 25% تخصص • 20% خبرة • 10% مؤهل
                    </span>
                  </button>
                </div>
              </div>

              {/* 4 Weights Sliders */}
              <div className="space-y-4">
                {/* Weight 1: Skills */}
                <div className="p-3.5 rounded-2xl border border-[#EAE4D9] bg-[#FBF9F5]/70">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <label htmlFor={skillsWeightSliderId} className="text-[#0F172A]">وزن المهارات (تشابه جاكارد)</label>
                    <span className="font-mono text-[#0284C7] bg-[#E8F4FC] px-2 py-0.5 rounded-md border border-[#BAE6FD]">
                      <bdi dir="ltr">{(skillsWeight * 100).toFixed(0)}% ({skillsWeight.toFixed(2)})</bdi>
                    </span>
                  </div>
                  <input
                    id={skillsWeightSliderId}
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={skillsWeight}
                    onChange={(e) => setSkillsWeight(parseFloat(e.target.value))}
                    className="w-full accent-[#0284C7] cursor-pointer"
                  />
                </div>

                {/* Weight 2: Major */}
                <div className="p-3.5 rounded-2xl border border-[#EAE4D9] bg-[#FBF9F5]/70">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <label htmlFor={majorWeightSliderId} className="text-[#0F172A]">وزن التخصص الأكاديمي</label>
                    <span className="font-mono text-[#0284C7] bg-[#E8F4FC] px-2 py-0.5 rounded-md border border-[#BAE6FD]">
                      <bdi dir="ltr">{(majorWeight * 100).toFixed(0)}% ({majorWeight.toFixed(2)})</bdi>
                    </span>
                  </div>
                  <input
                    id={majorWeightSliderId}
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={majorWeight}
                    onChange={(e) => setMajorWeight(parseFloat(e.target.value))}
                    className="w-full accent-[#0284C7] cursor-pointer"
                  />
                </div>

                {/* Weight 3: Experience */}
                <div className="p-3.5 rounded-2xl border border-[#EAE4D9] bg-[#FBF9F5]/70">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <label htmlFor={expWeightSliderId} className="text-[#0F172A]">وزن سنوات الخبرة العملية</label>
                    <span className="font-mono text-[#0284C7] bg-[#E8F4FC] px-2 py-0.5 rounded-md border border-[#BAE6FD]">
                      <bdi dir="ltr">{(expWeight * 100).toFixed(0)}% ({expWeight.toFixed(2)})</bdi>
                    </span>
                  </div>
                  <input
                    id={expWeightSliderId}
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={expWeight}
                    onChange={(e) => setExpWeight(parseFloat(e.target.value))}
                    className="w-full accent-[#0284C7] cursor-pointer"
                  />
                </div>

                {/* Weight 4: Qualification */}
                <div className="p-3.5 rounded-2xl border border-[#EAE4D9] bg-[#FBF9F5]/70">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <label htmlFor={qualWeightSliderId} className="text-[#0F172A]">وزن المؤهل التعليمي</label>
                    <span className="font-mono text-[#0284C7] bg-[#E8F4FC] px-2 py-0.5 rounded-md border border-[#BAE6FD]">
                      <bdi dir="ltr">{(qualWeight * 100).toFixed(0)}% ({qualWeight.toFixed(2)})</bdi>
                    </span>
                  </div>
                  <input
                    id={qualWeightSliderId}
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={qualWeight}
                    onChange={(e) => setQualWeight(parseFloat(e.target.value))}
                    className="w-full accent-[#0284C7] cursor-pointer"
                  />
                </div>

                {/* Total Weight Verification Badge */}
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-black transition ${
                    isWeightsValid
                      ? 'bg-[#E8F8F2] border-[#BDE8D2] text-[#0D6E44]'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{isWeightsValid ? '✓' : '⚠'}</span>
                    <span>إجمالي مجموع الأوزان:</span>
                  </div>
                  <span className="font-mono text-sm">
                    <bdi dir="ltr">{(totalWeight * 100).toFixed(0)}% / 100%</bdi>
                  </span>
                </div>

                {/* Minimum Threshold */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <label htmlFor={minScoreSliderId} className="text-[#0F172A]">الحد الأدنى لنسبة التوافق للظهور</label>
                    <span className="font-mono text-[#0F172A] bg-[#FBF9F5] border border-[#EAE4D9] px-2 py-0.5 rounded-md">
                      <bdi dir="ltr">{(minMatchScore * 100).toFixed(0)}%</bdi>
                    </span>
                  </div>
                  <input
                    id={minScoreSliderId}
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={minMatchScore}
                    onChange={(e) => setMinMatchScore(parseFloat(e.target.value))}
                    className="w-full accent-[#0284C7] cursor-pointer"
                  />
                  <p className="text-[11px] text-[#64748B] mt-1">
                    المرشحون الحاصلون على درجة أقل من هذا الحد لن يظهروا في قوائم الترشيح المباشرة.
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-[#EAE4D9] space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !isWeightsValid}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#10B981] hover:from-[#0369A1] hover:to-[#059669] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{isEditMode ? 'حفظ تعديلات الوظيفة والأوزان' : 'نشر الوظيفة واعتماد الأوزان'}</span>
                  )}
                </button>

                <Link
                  to="/company/jobs"
                  className="block text-center py-2.5 text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition"
                >
                  إلغاء والعودة
                </Link>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}

export default JobPostPage
