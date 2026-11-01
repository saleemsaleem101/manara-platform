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

  // Skills from catalog (Structured by Academic Taxonomy)
  const [catalogSkills, setCatalogSkills] = useState<Skill[]>([])
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([])
  const [skillSearch, setSkillSearch] = useState('')
  const [selectedTrackTab, setSelectedTrackTab] = useState<string>('ALL')

  const TAXONOMY_TRACKS = [
    {
      id: 'SOFTWARE' as const,
      name: 'هندسة البرمجيات والويب',
      badge: '23 تقنية',
      icon: '🌐',
      skills: [
        'React.js', 'Next.js', 'Vue.js', 'Angular', 'Node.js & Express', 'Django & DRF',
        'FastAPI', 'Flask', 'ASP.NET Core', 'Spring Boot', 'Laravel (PHP)', 'Tailwind CSS',
        'Bootstrap', 'GraphQL', 'RESTful APIs', 'WebSockets', 'Microservices Architecture',
        'Design Patterns & SOLID Principles', 'Clean Code & Software Architecture',
        'Software Testing & QA (Unit/Integration)', 'Automated Testing (Selenium / Cypress)',
        'Agile & Scrum Methodologies', 'Git & GitHub Version Control'
      ]
    },
    {
      id: 'LANGUAGES' as const,
      name: 'لغات البرمجة والأنظمة',
      badge: '22 لغة',
      icon: '💻',
      skills: [
        'Python', 'Java', 'C', 'C++', 'C# (.NET)', 'JavaScript', 'TypeScript', 'Go (Golang)', 'Rust',
        'PHP', 'Kotlin', 'Swift', 'Dart', 'Ruby', 'R Language', 'MATLAB', 'Scala',
        'Shell Scripting (Bash / PowerShell)', 'Assembly (x86 / ARM)', 'VHDL & Verilog (Hardware Description)',
        'SQL (Structured Query Language)', 'HTML5 & CSS3'
      ]
    },
    {
      id: 'AI_DATA' as const,
      name: 'الذكاء الاصطناعي وعلم البيانات',
      badge: '12 مجال',
      icon: '🤖',
      skills: [
        'Machine Learning (ML)', 'Deep Learning (DL)', 'Artificial Intelligence (AI)',
        'Natural Language Processing (NLP)', 'Computer Vision (OpenCV)', 'TensorFlow & PyTorch',
        'Scikit-Learn', 'Data Analysis (Pandas & NumPy)', 'Big Data Analytics (Spark & Hadoop)',
        'Business Intelligence & Power BI', 'Data Mining & Warehousing', 'Large Language Models (LLMs) & Prompting'
      ]
    },
    {
      id: 'CYBER_NET' as const,
      name: 'الأمن السيبراني والشبكات',
      badge: '14 تخصص',
      icon: '🛡️',
      skills: [
        'Cybersecurity & InfoSec', 'Penetration Testing & Ethical Hacking', 'Network Security & Firewalls',
        'Web Application Security (OWASP Top 10)', 'Cryptography & Encryption Protocols',
        'SOC & Incident Response', 'Vulnerability Assessment & Nessus', 'Digital Forensics',
        'Kali Linux & Penetration Tools', 'Computer Networking (TCP/IP & OSI)',
        'Cisco Networking (CCNA / CCNP Routing & Switching)', 'Network Administration & Wireshark',
        'VPN & Remote Access Technologies', 'VoIP & Telecommunication Systems'
      ]
    },
    {
      id: 'DATABASES_CLOUD' as const,
      name: 'قواعد البيانات والحوسبة السحابية و DevOps',
      badge: '22 أداة',
      icon: '☁️',
      skills: [
        'PostgreSQL', 'MySQL', 'Oracle Database', 'Microsoft SQL Server', 'MongoDB (NoSQL)',
        'Redis (In-Memory Caching)', 'Firebase / Supabase', 'Database Design & Normalization',
        'Amazon Web Services (AWS)', 'Microsoft Azure', 'Google Cloud Platform (GCP)',
        'Docker & Containerization', 'Kubernetes (K8s)', 'CI/CD Pipelines (GitHub Actions / GitLab)',
        'Linux Server Administration', 'Nginx & Web Servers', 'Terraform (IaC)',
        'DevOps Practices', 'Cloud Architecture', 'Serverless Computing',
        'API Gateway & Microservices Mgmt', 'Monitoring & Logging (Prometheus / Grafana)'
      ]
    },
    {
      id: 'EMBEDDED_IOT' as const,
      name: 'هندسة الحاسوب والأنظمة المدمجة و IoT',
      badge: '11 مجال',
      icon: '🔌',
      skills: [
        'Embedded Systems & Embedded C/C++', 'Internet of Things (IoT & Protocols MQTT/CoAP)',
        'Microcontrollers (Arduino, STM32, PIC, ESP32)', 'Single-Board Computers (Raspberry Pi)',
        'RTOS (Real-Time Operating Systems)', 'Digital Logic Design & Circuits',
        'Computer Organization & Architecture', 'FPGA & Digital Systems Design',
        'Robotics & Control Systems (ROS)', 'Industrial Automation (PLC & SCADA)',
        'Sensors, Actuators & Signal Processing'
      ]
    },
    {
      id: 'SOFT' as const,
      name: 'المهارات الشخصية والهندسية القيادية',
      badge: '10 مهارات',
      icon: '🌟',
      skills: [
        'Problem Solving & Critical Thinking', 'Team Collaboration & Communication',
        'Leadership & Mentorship', 'Time Management & Organization',
        'Adaptability & Fast Learning', 'Technical Writing & Documentation',
        'Presentation & Public Speaking', 'Analytical Thinking',
        'Negotiation & Conflict Resolution', 'Work Ethics & Professionalism'
      ]
    }
  ]

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

  const toggleTrackSkills = (trackSkills: string[]) => {
    const trackSkillIds = catalogSkills
      .filter((cs) => trackSkills.some((ts) => ts.toLowerCase() === cs.name.toLowerCase()))
      .map((cs) => cs.id)
    const allSelected = trackSkillIds.every((id) => selectedSkillIds.includes(id))
    if (allSelected) {
      setSelectedSkillIds(selectedSkillIds.filter((id) => !trackSkillIds.includes(id)))
    } else {
      const missing = trackSkillIds.filter((id) => !selectedSkillIds.includes(id))
      setSelectedSkillIds([...selectedSkillIds, ...missing])
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

    if (selectedSkillIds.length === 0) {
      setFeedbackMsg({
        text: 'يرجى تحديد مهارة واحدة على الأقل من دليل المهارات المعتمد لتمكين خوارزمية المطابقة الموزونة.',
        type: 'error',
      })
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
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] text-[#0F172A] dark:text-white transition-colors duration-300" dir="rtl">
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
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] text-[#0F172A] dark:text-white transition-colors duration-300" dir="rtl">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#BAE6FD] dark:border-sky-900/50 p-8 sm:p-10 shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#E0F2FE]/70 dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8] border border-[#BAE6FD] dark:border-sky-800 flex items-center justify-center mx-auto mb-6 text-2xl font-black shadow-inner">
              ℹ
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] dark:text-white mb-3">
              نشر الوظائف غير متاح حالياً
            </h1>
            <p className="text-sm text-[#6C4F3D] dark:text-slate-300 max-w-lg mx-auto mb-8 leading-relaxed">
              وفقاً لضوابط واعتمادات المنصة، لا يمكن للمنشأة نشر شواغر وظيفية جديدة أو تعديل الشواغر حتى يتم التحقق من السجل التجاري واعتماد الحساب رسمياً من قبل الإدارة.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/company/status"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white font-black text-sm transition shadow-md hover:shadow-sky-500/20"
              >
                متابعة حالة اعتماد المنشأة
              </Link>
              <Link
                to="/company/jobs"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 hover:bg-[#E8DEC8]/30 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white font-bold text-sm transition"
              >
                العودة لوظائفي
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const filteredSkills = catalogSkills.filter((sk) => {
    const matchesSearch = !skillSearch.trim() || sk.name.toLowerCase().includes(skillSearch.toLowerCase().trim())
    if (!matchesSearch) return false

    if (selectedTrackTab === 'ALL') return true
    const currentTrack = TAXONOMY_TRACKS.find((t) => t.id === selectedTrackTab)
    if (!currentTrack) return true
    return currentTrack.skills.some((name) => name.toLowerCase() === sk.name.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] text-[#0F172A] dark:text-white font-sans transition-colors duration-300 selection:bg-[#BAE6FD] selection:text-[#0284C7]" dir="rtl">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Breadcrumbs */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-[#6C4F3D] dark:text-slate-400 mb-2 font-medium">
            <Link to="/company/jobs" className="hover:text-[#0284C7] dark:hover:text-[#38BDF8] transition">
              وظائفي
            </Link>
            <span>/</span>
            <span className="text-[#0284C7] dark:text-[#38BDF8] font-bold">
              {isEditMode ? 'تعديل وظيفة وتحديد أوزان المطابقة' : 'نشر شاغر جديد وضبط أوزان المطابقة'}
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white">
                {isEditMode ? 'تعديل بيانات الوظيفة وأوزان المطابقة' : 'نشر وظيفة جديدة وتحديد أوزان المطابقة'}
              </h1>
              <p className="text-[#6C4F3D] dark:text-slate-400 text-xs sm:text-sm mt-1">
                تحديد متطلبات الشاغر وضبط أوزان معايير التوافق الموزونة لحساب درجة التطابق بدقة
              </p>
            </div>
            <Link
              to="/company/jobs"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 hover:bg-[#E8DEC8]/30 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white text-xs font-bold transition shadow-xs self-start"
            >
              العودة لقائمة وظائفي
            </Link>
          </div>
        </div>

        {/* Feedback message banner */}
        {feedbackMsg && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-sm font-bold shadow-sm ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-normal px-2 py-1 cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Section 1: تفاصيل الوظيفة والشروط (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 border-b border-[#E8DEC8] dark:border-slate-800 pb-4 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white font-black flex items-center justify-center text-base shadow-sm">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#0F172A] dark:text-white">تفاصيل الشاغر الوظيفي</h2>
                  <p className="text-xs text-[#6C4F3D] dark:text-slate-400">المعلومات الأساسية ومتطلبات التأهيل والشروط الأكاديمية</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor={titleInputId} className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-1.5">
                    المسمى الوظيفي <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id={titleInputId}
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder=""
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 transition shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={majorSelectId} className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-1.5">
                      التخصص المطلوب <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id={majorSelectId}
                      required
                      value={requiredMajor}
                      onChange={(e) => setRequiredMajor(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 transition shadow-xs cursor-pointer"
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
                    <label htmlFor={expSelectId} className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-1.5">
                      سنوات الخبرة المطلوبة <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id={expSelectId}
                      value={requiredExp}
                      onChange={(e) => setRequiredExp(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 transition shadow-xs cursor-pointer"
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
                    <label htmlFor={qualSelectId} className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-1.5">
                      المؤهل التعليمي الأدنى <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id={qualSelectId}
                      value={requiredQualification}
                      onChange={(e) => setRequiredQualification(e.target.value as 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'DOCTORATE')}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 transition shadow-xs cursor-pointer"
                    >
                      <option value="DIPLOMA">دبلوم متوسط</option>
                      <option value="BACHELOR">بكالوريوس</option>
                      <option value="MASTER">ماجستير</option>
                      <option value="DOCTORATE">دكتوراه</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor={locationInputId} className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-1.5">
                      المدينة / مقر العمل
                    </label>
                    <input
                      id={locationInputId}
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder=""
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 transition shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={jobTypeSelectId} className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-1.5">
                      نمط ونوع العمل
                    </label>
                    <select
                      id={jobTypeSelectId}
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value as 'FULL_TIME' | 'PART_TIME' | 'REMOTE' | 'HYBRID')}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 transition shadow-xs cursor-pointer"
                    >
                      <option value="FULL_TIME">دوام كامل (حضوري)</option>
                      <option value="PART_TIME">دوام جزئي</option>
                      <option value="REMOTE">عن بُعد بالكامل</option>
                      <option value="HYBRID">هجين (حضوري وعن بُعد)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor={deadlineInputId} className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-1.5">
                      آخر موعد لاستقبال الطلبات
                    </label>
                    <input
                      id={deadlineInputId}
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 transition shadow-xs"
                    />
                  </div>
                </div>

                {/* Skills Picker from Catalog (Structured by Academic Taxonomy) */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label htmlFor={skillSearchInputId} className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300">
                        المهارات والتقنيات المطلوبة (دليل كلية الحاسبات والهندسة) <span className="text-rose-500">*</span>
                      </label>
                      <p className="text-[11px] text-[#6C4F3D] dark:text-slate-400 mt-0.5">
                        حدد المهارات المطلوبة بدقة من التخصصات أدناه لتفعيل المطابقة الموزونة التلقائية (معامل تشابه جاكارد الرياضي).
                      </p>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 font-black border border-sky-200 dark:border-sky-800 shadow-2xs">
                      المحدد: <bdi dir="ltr">{selectedSkillIds.length}</bdi> مهارات
                    </span>
                  </div>

                  {/* 1. Selected Skills Tray (سلة المهارات المحددة للوظيفة) */}
                  {selectedSkillIds.length > 0 ? (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50/50 to-indigo-50/40 dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-900/50 border border-sky-200/90 dark:border-sky-800 shadow-2xs mb-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] font-black text-[#0284C7] dark:text-sky-300 flex items-center gap-1.5">
                          <span>✨</span>
                          <span>المهارات المطلوبة للوظيفة ({selectedSkillIds.length}):</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedSkillIds([])}
                          className="text-[11px] font-bold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
                        >
                          مسح الكل ↺
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                        {selectedSkillIds.map((sid) => {
                          const skObj = catalogSkills.find((s) => s.id === sid)
                          if (!skObj) return null
                          return (
                            <span
                              key={sid}
                              className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-sky-300 dark:border-slate-700 text-[11.5px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 shadow-2xs group"
                            >
                              <span>{skObj.name}</span>
                              <button
                                type="button"
                                onClick={() => toggleSkill(sid)}
                                className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:text-rose-600 text-slate-400 text-[10px] flex items-center justify-center cursor-pointer transition"
                                title="إزالة"
                              >
                                ✕
                              </button>
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 mb-3.5 flex items-center gap-2.5">
                      <span className="text-amber-500 text-base">💡</span>
                      <span className="text-[11.5px] font-medium text-amber-900 dark:text-amber-200">
                        اختر التخصص أدناه أو استخدم البحث لتحديد المهارات المطلوبة. كلما حددت المهارات بدقة، كلما رشحت الخوارزمية الخريجين الأنسب تلقائياً.
                      </span>
                    </div>
                  )}

                  {/* 2. Search & Track Filter Tabs */}
                  <div className="space-y-2 mb-3">
                    {/* Search Input */}
                    <div className="relative">
                      <input
                        id={skillSearchInputId}
                        type="text"
                        value={skillSearch}
                        onChange={(e) => setSkillSearch(e.target.value)}
                        placeholder="🔍 ابحث بالاسم: React, Python, Docker, Flutter, C++, Security..."
                        className="w-full h-10 px-4 pe-9 rounded-xl border border-[#E8DEC8] dark:border-slate-700 text-xs font-semibold bg-[#FAF7F2] dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#0284C7] focus:bg-white dark:focus:bg-slate-900 transition shadow-2xs"
                      />
                      {skillSearch && (
                        <button
                          type="button"
                          onClick={() => setSkillSearch('')}
                          className="absolute left-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Taxonomy Track Filter Tabs */}
                    <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/80 border border-[#E8DEC8] dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setSelectedTrackTab('ALL')}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition cursor-pointer flex items-center gap-1.5 ${
                          selectedTrackTab === 'ALL'
                            ? 'bg-[#0284C7] text-white shadow-2xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#0284C7]'
                        }`}
                      >
                        <span>🌐</span>
                        <span>كافة التخصصات ({catalogSkills.length})</span>
                      </button>

                      {TAXONOMY_TRACKS.map((t) => {
                        const isCurrent = selectedTrackTab === t.id
                        const countInTrack = catalogSkills.filter((cs) => t.skills.some((n) => n.toLowerCase() === cs.name.toLowerCase()) && selectedSkillIds.includes(cs.id)).length
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSelectedTrackTab(t.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              isCurrent
                                ? 'bg-[#0284C7] text-white shadow-2xs font-black'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#0284C7] border border-slate-100 dark:border-slate-700'
                            }`}
                          >
                            <span>{t.icon}</span>
                            <span>{t.name}</span>
                            {countInTrack > 0 && (
                              <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-black ${
                                isCurrent ? 'bg-white/20 text-white' : 'bg-sky-100 dark:bg-sky-900/60 text-[#0284C7] dark:text-sky-300'
                              }`}>
                                ✓ {countInTrack}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 3. Skills Catalog Chips Grid */}
                  <div className="p-3 rounded-2xl border border-sky-100 dark:border-slate-700 bg-white dark:bg-slate-900/60 shadow-2xs">
                    {selectedTrackTab !== 'ALL' && (() => {
                      const activeTrackObj = TAXONOMY_TRACKS.find((t) => t.id === selectedTrackTab)
                      if (!activeTrackObj) return null
                      return (
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-[11.5px] font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <span>{activeTrackObj.icon}</span>
                            <span>{activeTrackObj.name} ({filteredSkills.length} مهارة)</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleTrackSkills(activeTrackObj.skills)}
                            className="text-[10.5px] font-bold text-[#0284C7] dark:text-sky-400 hover:underline cursor-pointer"
                          >
                            تحديد / إلغاء تحديد الكل في هذا التخصص
                          </button>
                        </div>
                      )
                    })()}

                    <div className="max-h-56 overflow-y-auto flex flex-wrap gap-1.5 pt-1">
                      {filteredSkills.map((sk) => {
                        const isSelected = selectedSkillIds.includes(sk.id)
                        return (
                          <button
                            key={sk.id}
                            type="button"
                            onClick={() => toggleSkill(sk.id)}
                            className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                              isSelected
                                ? 'bg-[#0284C7] text-white border-[#0284C7] font-black shadow-xs ring-2 ring-sky-300 dark:ring-sky-600'
                                : 'bg-[#FAF7F2] dark:bg-slate-800 text-[#0F172A] dark:text-slate-200 border-[#E8DEC8] dark:border-slate-700 hover:border-[#0284C7] hover:bg-sky-50 dark:hover:bg-slate-700'
                            }`}
                          >
                            <span>{sk.name}</span>
                            <span className={isSelected ? 'text-white font-black' : 'text-sky-600 font-black'}>
                              {isSelected ? '✓' : '+'}
                            </span>
                          </button>
                        )
                      })}
                      {filteredSkills.length === 0 && (
                        <div className="w-full text-center py-4 text-xs text-slate-500 dark:text-slate-400">
                          لا توجد مهارات مطابقة في هذا التصنيف
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Algorithm explanation tip */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/40 flex items-center justify-between text-[11px] text-[#0369A1] dark:text-sky-300">
                    <span className="flex items-center gap-1.5">
                      <span>📐</span>
                      <span>معيار المهارات يمثل <strong>45%</strong> من إجمالي درجة التوافق التلقائي للمرشحين (معامل تشابه جاكارد الرياضي).</span>
                    </span>
                    <span className="font-mono font-bold text-[10px] bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                      Ss = |Job ∩ Cand| / |Job ∪ Cand|
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor={descTextareaId} className="block text-xs font-bold text-[#6C4F3D] dark:text-slate-300 mb-1.5">
                    الوصف الوظيفي والمسؤوليات الأساسية <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id={descTextareaId}
                    rows={5}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="اكتب وصفاً مفصلاً للمهام والمسؤوليات ومواصفات المرشح..."
                    className="w-full px-4 py-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8] focus:bg-white dark:focus:bg-slate-900 transition leading-relaxed shadow-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: أوزان معايير التوافق (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-[#E8DEC8] dark:border-slate-800 p-6 sm:p-8 shadow-sm sticky top-24">
              <div className="flex items-center gap-3 border-b border-[#E8DEC8] dark:border-slate-800 pb-4 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-white font-black flex items-center justify-center text-base shadow-sm">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#0F172A] dark:text-white">أوزان معايير التوافق</h2>
                  <p className="text-xs text-[#6C4F3D] dark:text-slate-400">حدد أوزان العوامل الأربعة بشرط: المجموع = 1.0 (100%) تماماً</p>
                </div>
              </div>

              {/* Formula Badge */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8DEC8] dark:border-slate-700 mb-4 text-xs">
                <div className="flex items-center justify-between font-black mb-2">
                  <span className="text-[#0284C7] dark:text-[#38BDF8]">صيغة التوافق الموزونة:</span>
                  <span className="font-mono text-[#0284C7] dark:text-[#38BDF8] bg-[#E0F2FE]/70 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-[#BAE6FD] dark:border-sky-800">
                    ∑w = 1.00 (100%)
                  </span>
                </div>
                <p className="text-[#6C4F3D] dark:text-slate-300 text-[11px] leading-relaxed font-mono" dir="ltr">
                  Score = (ws × Ss) + (wm × Sm) + (we × Se) + (wq × Sq)
                </p>
              </div>

              {/* Quick Weight Presets */}
              <div className="mb-5 space-y-2">
                <span className="text-[11px] font-bold text-[#6C4F3D] dark:text-slate-400 block">أنماط الأوزان السريعة والمخصصة:</span>
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
                        ? 'bg-[#E0F2FE]/70 dark:bg-sky-950/60 border-[#BAE6FD] dark:border-sky-800 text-[#0284C7] dark:text-[#38BDF8]'
                        : 'bg-[#FAF7F2] dark:bg-slate-800 border-[#E8DEC8] dark:border-slate-700 text-[#0F172A] dark:text-white hover:border-[#38BDF8]'
                    }`}
                  >
                    <div className="font-black flex items-center gap-1 mb-0.5">
                      <span>🎓</span>
                      <span>نمط خريجي الحاسوب الجدد</span>
                    </div>
                    <span className="text-[10px] text-[#6C4F3D] dark:text-slate-400 block">
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
                        ? 'bg-[#E0F2FE]/70 dark:bg-sky-950/60 border-[#BAE6FD] dark:border-sky-800 text-[#0284C7] dark:text-[#38BDF8]'
                        : 'bg-[#FAF7F2] dark:bg-slate-800 border-[#E8DEC8] dark:border-slate-700 text-[#0F172A] dark:text-white hover:border-[#38BDF8]'
                    }`}
                  >
                    <div className="font-black flex items-center gap-1 mb-0.5">
                      <span>⚖️</span>
                      <span>النمط الموزون القياسي</span>
                    </div>
                    <span className="text-[10px] text-[#6C4F3D] dark:text-slate-400 block">
                      45% مهارات • 25% تخصص • 20% خبرة • 10% مؤهل
                    </span>
                  </button>
                </div>
              </div>

              {/* 4 Weights Sliders */}
              <div className="space-y-4">
                {/* Weight 1: Skills */}
                <div className="p-3.5 rounded-2xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2]/80 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <label htmlFor={skillsWeightSliderId} className="text-[#0F172A] dark:text-white">وزن المهارات (تشابه جاكارد)</label>
                    <span className="font-mono text-[#0284C7] dark:text-[#38BDF8] bg-[#E0F2FE]/70 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-[#BAE6FD] dark:border-sky-800">
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
                    className="w-full accent-[#0284C7] dark:accent-[#38BDF8] cursor-pointer"
                  />
                </div>

                {/* Weight 2: Major */}
                <div className="p-3.5 rounded-2xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2]/80 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <label htmlFor={majorWeightSliderId} className="text-[#0F172A] dark:text-white">وزن التخصص الأكاديمي</label>
                    <span className="font-mono text-[#0284C7] dark:text-[#38BDF8] bg-[#E0F2FE]/70 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-[#BAE6FD] dark:border-sky-800">
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
                    className="w-full accent-[#0284C7] dark:accent-[#38BDF8] cursor-pointer"
                  />
                </div>

                {/* Weight 3: Experience */}
                <div className="p-3.5 rounded-2xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2]/80 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <label htmlFor={expWeightSliderId} className="text-[#0F172A] dark:text-white">وزن سنوات الخبرة العملية</label>
                    <span className="font-mono text-[#0284C7] dark:text-[#38BDF8] bg-[#E0F2FE]/70 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-[#BAE6FD] dark:border-sky-800">
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
                    className="w-full accent-[#0284C7] dark:accent-[#38BDF8] cursor-pointer"
                  />
                </div>

                {/* Weight 4: Qualification */}
                <div className="p-3.5 rounded-2xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2]/80 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <label htmlFor={qualWeightSliderId} className="text-[#0F172A] dark:text-white">وزن المؤهل التعليمي</label>
                    <span className="font-mono text-[#0284C7] dark:text-[#38BDF8] bg-[#E0F2FE]/70 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-[#BAE6FD] dark:border-sky-800">
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
                    className="w-full accent-[#0284C7] dark:accent-[#38BDF8] cursor-pointer"
                  />
                </div>

                {/* Total Weight Verification Badge */}
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-black transition ${
                    isWeightsValid
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
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
                    <label htmlFor={minScoreSliderId} className="text-[#0F172A] dark:text-white">الحد الأدنى لنسبة التوافق للظهور</label>
                    <span className="font-mono text-[#0F172A] dark:text-white bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8DEC8] dark:border-slate-700 px-2 py-0.5 rounded-md">
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
                    className="w-full accent-[#0284C7] dark:accent-[#38BDF8] cursor-pointer"
                  />
                  <p className="text-[11px] text-[#6C4F3D] dark:text-slate-400 mt-1">
                    المرشحون الحاصلون على درجة أقل من هذا الحد لن يظهروا في قوائم الترشيح المباشرة.
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-[#E8DEC8] dark:border-slate-800 space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !isWeightsValid}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm transition shadow-md hover:shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{isEditMode ? 'حفظ تعديلات الوظيفة والأوزان' : 'نشر الوظيفة واعتماد الأوزان'}</span>
                  )}
                </button>

                <Link
                  to="/company/jobs"
                  className="block text-center py-2.5 text-xs font-bold text-[#6C4F3D] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition"
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
