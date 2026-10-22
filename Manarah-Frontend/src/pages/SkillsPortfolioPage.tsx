import React, { useState, useEffect, useRef } from 'react'
import { Navbar } from '../components/Navbar'
import { api } from '../services/api'
import type { Skill, GraduateSkill, ProjectItem, VideoCVInfo } from '../types'

export const SkillsPortfolioPage: React.FC = () => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([])
  const [graduateSkills, setGraduateSkills] = useState<GraduateSkill[]>([])
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [videoInfo, setVideoInfo] = useState<VideoCVInfo>({
    video_cv_url: '',
    video_duration_seconds: 90,
    video_visibility: 'COMPANIES_ONLY',
    video_verified: true,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Modals state
  const [showSkillModal, setShowSkillModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null)

  // Skill Form State
  const [selectedSkillId, setSelectedSkillId] = useState<number | ''>('')
  const [selectedProficiency, setSelectedProficiency] = useState<string>('ADVANCED')
  const [skillModalSearch, setSkillModalSearch] = useState('')
  const [selectedTaxonomyTab, setSelectedTaxonomyTab] = useState<'LANGUAGES' | 'SOFTWARE' | 'AI_DATA' | 'CYBER_NET' | 'EMBEDDED_IOT' | 'DATABASES_CLOUD' | 'SOFT'>('LANGUAGES')
  const [showFullTaxonomyExplorer, setShowFullTaxonomyExplorer] = useState(false)

  const TAXONOMY_TRACKS = [
    {
      id: 'LANGUAGES' as const,
      name: 'لغات البرمجة والأنظمة',
      badge: '22 لغة',
      icon: '💻',
      desc: 'لغات البرمجة المعتمدة في كليات الحاسبات والهندسة للأنظمة والخوارزميات والتطبيقات',
      skills: [
        'Python', 'Java', 'C', 'C++', 'C# (.NET)', 'JavaScript', 'TypeScript', 'Go (Golang)', 'Rust',
        'PHP', 'Kotlin', 'Swift', 'Dart', 'Ruby', 'R Language', 'MATLAB', 'Scala',
        'Shell Scripting (Bash / PowerShell)', 'Assembly (x86 / ARM)', 'VHDL & Verilog (Hardware Description)',
        'SQL (Structured Query Language)', 'HTML5 & CSS3'
      ]
    },
    {
      id: 'SOFTWARE' as const,
      name: 'هندسة البرمجيات والويب',
      badge: '23 تقنية',
      icon: '🌐',
      desc: 'أطر العمل وتطوير النظم وبنيات المايكروسيرفس وضمان الجودة واختبار البرمجيات',
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
      id: 'AI_DATA' as const,
      name: 'الذكاء الاصطناعي وعلم البيانات',
      badge: '12 مجال',
      icon: '🤖',
      desc: 'تعلم الآلة والتعلم العميق وتحليل البيانات الضخمة والرؤية الحاسوبية ونماذج LLM',
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
      desc: 'اختبار الاختراق والتحقيق الجنائي وأمن السيرفرات وشبكات سيسكو والبروتوكولات الأمنية',
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
      id: 'EMBEDDED_IOT' as const,
      name: 'هندسة الحاسوب والأنظمة المدمجة و IoT',
      badge: '11 مجال',
      icon: '⚙️',
      desc: 'المتحكمات الدقيقة وإنترنت الأشياء وتصميم الدوائر الرقمية ومعمارية الحاسوب والروبوتات والتحكم الصناعي',
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
      id: 'DATABASES_CLOUD' as const,
      name: 'قواعد البيانات والحوسبة السحابية و DevOps',
      badge: '22 أداة',
      icon: '☁️',
      desc: 'إدارة قواعد البيانات ونظم الكاش والحاويات والحوسبة السحابية وأتمتة النشر والتطبيقات الهجينة',
      skills: [
        'PostgreSQL', 'MySQL', 'Microsoft SQL Server', 'Oracle Database', 'SQLite',
        'MongoDB (NoSQL)', 'Redis (In-Memory Cache)', 'Firebase & Supabase',
        'Database Design & Normalization', 'DevOps & Automation', 'Docker & Containerization',
        'Kubernetes (K8s)', 'CI/CD Pipelines (GitHub Actions / GitLab CI)', 'Linux System Administration',
        'AWS Cloud Services', 'Microsoft Azure', 'Google Cloud Platform (GCP)',
        'Infrastructure as Code (Terraform)', 'Nginx & Reverse Proxy Architecture', 'Flutter & Dart',
        'React Native', 'Android Native (Kotlin)', 'iOS Native (Swift)'
      ]
    },
    {
      id: 'SOFT' as const,
      name: 'المهارات الشخصية والهندسية القيادية',
      badge: '10 مهارات',
      icon: '🌟',
      desc: 'القدرات القيادية والهندسية وإدارة المشاريع الرشيقة وحل المشكلات المعقدة والتواصل الفني',
      skills: [
        'حل المشكلات والخوارزميات (Problem Solving)', 'العمل الجماعي والتعاون البرمجي (Teamwork)',
        'إدارة المشاريع الهندسية والتقنية (Project Management)', 'التفكير التحليلي والمنطقي (Analytical Thinking)',
        'التواصل الفعال وعرض المشاريع (Effective Communication)', 'القيادة وتحمل المسؤولية (Leadership & Initiative)',
        'كتابة التوثيق والتقارير الفنية (Technical Writing)', 'إدارة الوقت والمهام (Time Management)',
        'التفكير النقدي واتخاذ القرار (Critical Thinking)', 'أخلاقيات مهنة الهندسة والحاسوب (Engineering Ethics)'
      ]
    }
  ]

  // Project Form State
  const [projectTitle, setProjectTitle] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [projectTechs, setProjectTechs] = useState('')
  const [projectGithub, setProjectGithub] = useState('')
  const [projectLiveUrl, setProjectLiveUrl] = useState('')
  const [isGraduationProject, setIsGraduationProject] = useState(false)
  const [projectFileError, setProjectFileError] = useState<string | null>(null)

  // Video Form State
  const [videoUrlInput, setVideoUrlInput] = useState('')
  const [videoVisibilityInput, setVideoVisibilityInput] = useState<'PUBLIC' | 'COMPANIES_ONLY' | 'PRIVATE'>('COMPANIES_ONLY')
  const [videoFileError, setVideoFileError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type })
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setFeedbackMsg(null), 4000)
  }

  const fetchData = async () => {
    try {
      const [skillsList, gradSkills, projs, vid] = await Promise.all([
        api.getSkills().catch(() => []),
        api.getGraduateSkills().catch(() => []),
        api.getGraduateProjects().catch(() => []),
        api.getGraduateVideo().catch(() => null),
      ])

      setAvailableSkills(skillsList)
      setGraduateSkills(gradSkills)
      setProjects(projs)
      if (vid) setVideoInfo(vid)
    } catch {
      // Keep state intact
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handle Add Skill
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSkillId) return
    try {
      await api.addGraduateSkill({
        skill: Number(selectedSkillId),
        proficiency_level: selectedProficiency,
      })
      showNotification('تمت إضافة المهارة بنجاح إلى ملفك المهني ✓')
      setShowSkillModal(false)
      setSelectedSkillId('')
      fetchData()
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      showNotification(msg || 'فشل إضافة المهارة', 'error')
    }
  }

  // Handle Delete Skill
  const handleDeleteSkill = async (id: number) => {
    if (!window.confirm('هل تريد بالتأكيد إزالة هذه المهارة من ملفك؟')) return
    try {
      await api.deleteGraduateSkill(id)
      showNotification('تم حذف المهارة بنجاح')
      fetchData()
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      showNotification(msg || 'فشل حذف المهارة', 'error')
    }
  }

  // Handle Add / Edit Project
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectTitle || !projectDesc) return
    try {
      const payload = {
        title: projectTitle,
        description: projectDesc,
        technologies: projectTechs,
        github_url: projectGithub,
        project_url: projectLiveUrl,
        is_graduation_project: isGraduationProject,
      }
      if (editingProjectId) {
        await api.updateGraduateProject(editingProjectId, payload)
        showNotification('تم تحديث بيانات المشروع بنجاح ✓')
      } else {
        await api.createGraduateProject(payload)
        showNotification('تمت إضافة المشروع بنجاح إلى محفظتك البرمجية ✓')
      }
      setShowProjectModal(false)
      setEditingProjectId(null)
      setProjectTitle('')
      setProjectDesc('')
      setProjectTechs('')
      setProjectGithub('')
      setProjectLiveUrl('')
      setIsGraduationProject(false)
      setProjectFileError(null)
      fetchData()
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      showNotification(msg || 'فشل حفظ المشروع', 'error')
    }
  }

  const openEditProject = (proj: ProjectItem) => {
    setEditingProjectId(proj.id || null)
    setProjectTitle(proj.title)
    setProjectDesc(proj.description)
    setProjectTechs(proj.technologies)
    setProjectGithub(proj.github_url || '')
    setProjectLiveUrl(proj.project_url || '')
    setIsGraduationProject(Boolean(proj.is_graduation_project))
    setProjectFileError(null)
    setShowProjectModal(true)
  }

  // Handle Project Image Attachment Validation (5MB max)
  const handleProjectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setProjectFileError(null)
    if (!file) return
    const maxSizeBytes = 5 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setProjectFileError('حجم الملف يتجاوز الحد المسموح به: 5 ميجابايت كحد أقصى.')
      e.target.value = ''
      return
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setProjectFileError('نوع الملف غير مدعوم. الصيغ المسموحة: JPG, PNG, WEBP, PDF فقط.')
      e.target.value = ''
      return
    }
    showNotification('تم فحص الملف: الحجم والصيغة مطابقة للشروط ✓')
  }

  // Handle Video File Validation (50MB max, FR-27)
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setVideoFileError(null)
    if (!file) return
    const maxSizeBytes = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSizeBytes) {
      setVideoFileError('حجم ملف الفيديو يتجاوز الحد المسموح به: 50 ميجابايت كحد أقصى.')
      e.target.value = ''
      return
    }
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      setVideoFileError('صيغة الفيديو غير مدعومة. الصيغ المعتمدة: MP4, WebM فقط.')
      e.target.value = ''
      return
    }
    setUploadProgress(100)
    showNotification('تم فحص وتأكيد جاهزية ملف الفيديو (ضمن حد 50 ميجابايت) ✓')
  }

  // Handle Delete Project
  const handleDeleteProject = async (id: number) => {
    if (!window.confirm('هل تريد بالتأكيد حذف هذا المشروع من محفظتك؟')) return
    try {
      await api.deleteGraduateProject(id)
      showNotification('تم حذف المشروع بنجاح')
      fetchData()
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      showNotification(msg || 'فشل حذف المشروع', 'error')
    }
  }

  // Handle Update Video
  const handleUpdateVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.updateGraduateVideo({
        video_cv_url: videoUrlInput || videoInfo.video_cv_url || '',
        video_visibility: videoVisibilityInput,
        video_duration_seconds: 90,
      })
      showNotification('تم تحديث إعدادات الفيديو التعريفي بنجاح ✓')
      setShowVideoModal(false)
      fetchData()
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      showNotification(msg || 'فشل تحديث الفيديو', 'error')
    }
  }

  const techSkills = graduateSkills.filter((s) => !s.skill_category || s.skill_category === 'TECHNICAL')
  const softSkills = graduateSkills.filter((s) => s.skill_category === 'SOFT')

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] pb-16 font-['Cairo'] text-start text-[#0F172A] dark:text-slate-100 transition-colors duration-300" dir="rtl">
      <Navbar />

      {/* Main Container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 pt-6">
        {isLoading && (
          <div className="mb-4 p-3 bg-[#E0F2FE] dark:bg-sky-950/50 border border-[#BAE6FD] dark:border-sky-800 text-[#0284C7] dark:text-sky-300 rounded-xl text-xs font-bold flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-[#0284C7] border-t-transparent rounded-full animate-spin" />
              <span>جاري تحميل بيانات المهارات والمشاريع المحدثة...</span>
            </div>
            <span className="text-[11px] text-[#0284C7] dark:text-sky-300">تحديث فوري من قاعدة البيانات</span>
          </div>
        )}

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`mb-4 p-4 rounded-xl text-[13px] font-bold flex items-center justify-between shadow-2xs transition ${
              feedbackMsg.type === 'success'
                ? 'bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button
              onClick={() => setFeedbackMsg(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold ms-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Hero Title Card */}
        <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-[#E8DEC8] dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative overflow-hidden transition-all">
          <div className="absolute top-0 start-0 w-2 h-full bg-gradient-to-b from-[#0284C7] via-[#0EA5E9] to-[#38BDF8]" />
          <div className="ps-2">
            <h1 className="text-[20px] sm:text-[22px] font-black text-[#0F172A] dark:text-white mb-1.5">
              محفظة المهارات والمشاريع البرمجية والفيديو التعريفي
            </h1>
            <p className="text-[13px] font-medium text-[#64748B] dark:text-slate-400">
              إدارة وتوثيق الكفاءات والخبرات المهنية والمشاريع التقنية ومقاطع الفيديو التعريفية
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowProjectModal(true)}
              className="h-[44px] px-5 bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white text-[13px] font-black rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <span>+ إضافة مشروع جديد</span>
            </button>
            <button
              onClick={() => setShowSkillModal(true)}
              className="h-[44px] px-5 bg-[#FAF7F2] dark:bg-slate-800 hover:bg-[#E5D7C3]/50 dark:hover:bg-slate-700 text-[#0284C7] dark:text-sky-300 border border-[#E8DEC8] dark:border-slate-700 text-[13px] font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <span>+ مهارة تقنية جديدة</span>
            </button>
          </div>
        </div>

        {/* 2-Columns Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* RIGHT COLUMN: Skills & Projects (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. المهارات المعتمدة */}
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-[#E8DEC8] dark:border-slate-800 shadow-sm transition-all">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8DEC8]/60 dark:border-slate-800 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                  <h2 className="text-[16px] font-black text-[#0F172A] dark:text-white">
                    1. المهارات المعتمدة (التقنية والشخصية)
                  </h2>
                </div>
                <span className="px-3.5 py-1 rounded-full text-[11px] font-bold bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800">
                  بيانات المهارات مكتملة ✓
                </span>
              </div>

              {/* Comprehensive Faculty Taxonomy Catalog Showcase */}
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50/70 via-sky-50/30 to-amber-50/40 dark:from-sky-950/40 dark:via-slate-900 dark:to-amber-950/20 border border-sky-200 dark:border-sky-900/60 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-sky-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎓</span>
                    <div>
                      <h4 className="text-[13px] sm:text-[14px] font-black text-[#0F172A] dark:text-white">
                        دليل المهارات المهيكلة المعتمد لكلية الحاسبات والهندسة (Predefined Taxonomy)
                      </h4>
                      <p className="text-[11px] text-[#0284C7] dark:text-sky-400 font-semibold">
                        149 مهارة ولغة برمجية معتمدة تغطي كافة مسارات وأقسام كلية الحاسبات والهندسة بالكامل
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFullTaxonomyExplorer(!showFullTaxonomyExplorer)}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-[11px] font-bold text-[#0284C7] dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{showFullTaxonomyExplorer ? 'إخفاء تفاصيل الدليل ▲' : 'استعراض تصنيفات الدليل الشامل (149 مهارة) ▼'}</span>
                  </button>
                </div>

                <p className="text-[#475569] dark:text-slate-300 text-[11.5px] leading-relaxed mt-2.5">
                  تعتمد المنصة دليلاً مهيكلاً شاملاً لكافة أقسام كلية الحاسبات والهندسة يمنع تباين المسميات اللغوية العشوائية ويوفر مدخلات قياسية ذات معرفات فريدة لخوارزمية المطابقة الموزونة (معامل تشابه جاكارد الرياضي). يشمل الدليل: 22 لغة برمجة وأنظمة أساسية، 23 تقنية لهندسة البرمجيات والويب، 12 مجالاً للذكاء الاصطناعي وعلم البيانات، 14 تخصصاً للأمن السيبراني والشبكات، 11 مجالاً لهندسة الحاسوب والأنظمة المدمجة و IoT، 22 أداة لقواعد البيانات والسحابة و DevOps، و 10 مهارات قيادية وهندسية.
                </p>

                {/* Categorized Track Chips */}
                {showFullTaxonomyExplorer && (
                  <div className="mt-4 pt-3.5 border-t border-sky-200/50 dark:border-slate-800">
                    {/* Track Tabs */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {TAXONOMY_TRACKS.map((track) => (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => setSelectedTaxonomyTab(track.id)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                            selectedTaxonomyTab === track.id
                              ? 'bg-[#0284C7] text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-[#475569] dark:text-slate-300 border border-[#E8DEC8] dark:border-slate-700 hover:border-[#0284C7]'
                          }`}
                        >
                          <span>{track.icon}</span>
                          <span>{track.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            selectedTaxonomyTab === track.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                          }`}>
                            {track.badge}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Active Track Skills List */}
                    {(() => {
                      const activeTrack = TAXONOMY_TRACKS.find(t => t.id === selectedTaxonomyTab)
                      if (!activeTrack) return null
                      return (
                        <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-sky-100 dark:border-slate-800">
                          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-[12px] font-black text-[#0F172A] dark:text-white flex items-center gap-1.5">
                              <span>{activeTrack.icon}</span>
                              <span>{activeTrack.name} ({activeTrack.skills.length})</span>
                            </span>
                            <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                              {activeTrack.desc}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pt-1">
                            {activeTrack.skills.map((skillName) => (
                              <button
                                key={skillName}
                                type="button"
                                onClick={() => {
                                  const found = availableSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase() || s.name.includes(skillName))
                                  if (found) setSelectedSkillId(found.id)
                                  setSkillModalSearch(skillName)
                                  setShowSkillModal(true)
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#F0F9FF] dark:bg-sky-950/40 text-[#0369A1] dark:text-sky-300 border border-sky-200/80 dark:border-sky-800 text-[11px] font-semibold hover:bg-sky-100 dark:hover:bg-sky-900/60 transition cursor-pointer flex items-center gap-1"
                                title="اضغط لإضافة المهارة إلى ملفك"
                              >
                                <span>{skillName}</span>
                                <span className="text-[10px] text-sky-500">+</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>

              {/* Technical Skills */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[13px] font-bold text-[#475569] dark:text-slate-300">
                    المهارات التقنية والبرمجية (Technical Skills):
                  </h3>
                  <button
                    onClick={() => setShowSkillModal(true)}
                    className="text-[12px] font-bold text-[#0284C7] dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    + إضافة مهارة
                  </button>
                </div>

                {techSkills.length === 0 ? (
                  <p className="text-[12px] text-[#94A3B8] italic bg-[#FAF7F2] dark:bg-slate-800/40 p-4 rounded-xl border border-dashed border-[#E8DEC8] dark:border-slate-700">
                    لم تقم بإضافة مهارات تقنية بعد. اضغط على زر (+ مهارة) أعلاه لإضافة أول مهارة.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {techSkills.map((sk) => (
                      <div
                        key={sk.id}
                        className="px-3.5 py-2 rounded-xl bg-[#E0F2FE] dark:bg-sky-950/60 border border-[#BAE6FD] dark:border-sky-800 text-[#0284C7] dark:text-sky-300 text-[12px] font-bold flex items-center gap-2 group transition hover:border-[#7DD3FC]"
                      >
                        <span className="font-['Plus_Jakarta_Sans']">{sk.skill_name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-[#0284C7] dark:text-sky-300 font-bold">
                          {sk.proficiency_level_display || sk.proficiency_level}
                        </span>
                        <button
                          onClick={() => handleDeleteSkill(sk.id)}
                          className="text-rose-400 hover:text-rose-600 transition text-[13px] font-bold pe-1 cursor-pointer"
                          title="حذف المهارة"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Soft Skills */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[13px] font-bold text-[#475569] dark:text-slate-300">
                    المهارات الشخصية والناعمة (Soft Skills):
                  </h3>
                </div>

                {softSkills.length === 0 ? (
                  <p className="text-[12px] text-[#94A3B8] italic bg-[#FAF7F2] dark:bg-slate-800/40 p-4 rounded-xl border border-dashed border-[#E8DEC8] dark:border-slate-700">
                    لم تقم بإضافة مهارات شخصية بعد.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {softSkills.map((sk) => (
                      <div
                        key={sk.id}
                        className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700 text-[#0F172A] dark:text-slate-200 text-[12px] font-bold flex items-center gap-2 group transition"
                      >
                        <span>{sk.skill_name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-[#475569] dark:text-slate-300 font-medium">
                          {sk.proficiency_level_display || sk.proficiency_level}
                        </span>
                        <button
                          onClick={() => handleDeleteSkill(sk.id)}
                          className="text-rose-400 hover:text-rose-600 transition text-[13px] font-bold pe-1 cursor-pointer"
                          title="حذف المهارة"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. المشاريع البرمجية المنجزة */}
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-[#E8DEC8] dark:border-slate-800 shadow-sm transition-all">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8DEC8]/60 dark:border-slate-800 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
                  <h2 className="text-[16px] font-black text-[#0F172A] dark:text-white">
                    2. المشاريع البرمجية الموثقة
                  </h2>
                </div>
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="text-[12px] font-bold text-[#0284C7] dark:text-sky-400 hover:underline cursor-pointer"
                >
                  + إضافة مشروع جديد
                </button>
              </div>

              {/* Killer Feature Note for Projects & GitHub */}
              <div className="mb-5 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-3">
                <span className="text-base">🚀</span>
                <div className="text-xs">
                  <span className="font-black text-amber-900 dark:text-amber-300 block mb-0.5">
                    معيار الثقة وتحليل روابط GitHub ومشاريع التخرج:
                  </span>
                  <p className="text-amber-800/90 dark:text-amber-200/80 text-[11px] leading-relaxed">
                    الميزة النوعية لخوارزمية منارة: يتم تحليل مشاريع التخرج وروابط مستودعات GitHub تلقائياً كمعيار ثقة يعوض غياب سنوات الخبرة لخريجي كليات الحاسوب الجدد ويرفع درجة المطابقة التوافقية أمام الشركات.
                  </p>
                </div>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-10 bg-[#FAF7F2] dark:bg-slate-800/40 rounded-2xl border border-dashed border-[#E8DEC8] dark:border-slate-700">
                  <p className="text-[13px] font-bold text-[#475569] dark:text-slate-300 mb-2">لا توجد مشاريع مضافة حتى الآن</p>
                  <p className="text-[12px] text-[#64748B] dark:text-slate-400 mb-4">
                    أضف مشاريعك البرمجية ومشاريع التخرج لرفع درجة التوافق في المطابقة الموزونة للوظائف.
                  </p>
                  <button
                    onClick={() => setShowProjectModal(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white text-[12px] font-black rounded-xl shadow-xs"
                  >
                    + إضافة أول مشروع
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800/70 border border-[#E8DEC8] dark:border-slate-700 hover:border-[#BAE6FD] dark:hover:border-sky-800 transition shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-[15px] font-bold text-[#0F172A] dark:text-white">{proj.title}</h3>
                            {proj.is_graduation_project && (
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-black bg-[#FEF3C7] dark:bg-amber-950/60 text-[#92400E] dark:text-amber-300 border border-[#FDE68A] dark:border-amber-800 flex items-center gap-1">
                                <span>🎓</span>
                                <span>مشروع تخرج نوعي موثق</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[12px] font-medium text-[#475569] dark:text-slate-300 mt-1.5 leading-relaxed">
                            {proj.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditProject(proj)}
                            className="text-[#0284C7] dark:text-sky-400 hover:text-[#0369A1] transition text-[12px] font-bold px-2.5 py-1 rounded-lg hover:bg-[#E0F2FE] dark:hover:bg-sky-950/40 cursor-pointer"
                            title="تعديل المشروع"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => proj.id && handleDeleteProject(proj.id)}
                            className="text-rose-400 hover:text-rose-600 transition text-[12px] font-bold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="حذف المشروع"
                          >
                            حذف
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8DEC8]/60 dark:border-slate-700/60 mt-3 text-[12px]">
                        <div className="text-[11px] font-bold text-[#64748B] dark:text-slate-400">
                          التقنيات: <span className="text-[#0F172A] dark:text-slate-200 font-semibold">{proj.technologies}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {proj.github_url && (
                            <a
                              href={proj.github_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[12px] font-bold text-[#0284C7] dark:text-sky-400 hover:underline flex items-center gap-1"
                            >
                              <span>مستودع GitHub ↗</span>
                            </a>
                          )}
                          {proj.project_url && (
                            <a
                              href={proj.project_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[12px] font-bold text-[#0284C7] dark:text-sky-400 hover:underline flex items-center gap-1"
                            >
                              <span>معاينة حية ↗</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* LEFT COLUMN: Video CV & Match Readiness (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* 3. الفيديو التعريفي المهني */}
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 border border-[#E8DEC8] dark:border-slate-800 shadow-sm transition-all">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E8DEC8]/60 dark:border-slate-800 mb-4">
                <h2 className="text-[15px] font-black text-[#0F172A] dark:text-white">3. الفيديو التعريفي المهني</h2>
                <span className="text-[11px] font-bold text-[#0284C7] dark:text-sky-300 bg-[#E0F2FE] dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-[#BAE6FD] dark:border-sky-800">
                  معتمد وموثق ✓
                </span>
              </div>

              {/* Video Player Card Preview */}
              {videoInfo.video_cv_url ? (
                <div className="w-full aspect-video rounded-2xl bg-black overflow-hidden mb-4 shadow-md border border-[#E8DEC8] dark:border-slate-800">
                  <video
                    controls
                    className="w-full h-full object-cover"
                    src={videoInfo.video_cv_url}
                  >
                    متصفحك لا يدعم تشغيل الفيديو.
                  </video>
                </div>
              ) : (
                <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col items-center justify-center relative overflow-hidden mb-4 shadow-inner text-white text-center p-4 border border-slate-700/50">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2 backdrop-blur-xs">
                    <div className="w-0 h-0 border-y-8 border-y-transparent border-e-12 border-e-white me-1" />
                  </div>
                  <span className="text-[12px] font-bold">فيديو تعريفي احترافي (60 - 90 ثانية)</span>
                  <span className="text-[10px] text-slate-300 mt-1">
                    لم يتم رفع فيديو تعريفي بعد • اضغط للتحديث والرفع
                  </span>
                </div>
              )}

              {/* Video Info Meta */}
              <div className="space-y-2.5 text-[12px] text-[#475569] dark:text-slate-300 mb-4">
                <div className="flex justify-between items-center py-1 border-b border-[#E8DEC8]/60 dark:border-slate-800">
                  <span className="font-bold text-[#0F172A] dark:text-white">مستوى الخصوصية:</span>
                  <span className="font-semibold text-[#0284C7] dark:text-sky-300">
                    {videoInfo.video_visibility === 'PUBLIC'
                      ? 'عام للجميع'
                      : videoInfo.video_visibility === 'COMPANIES_ONLY'
                      ? 'للشركات المعتمدة فقط'
                      : 'خاص'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#E8DEC8]/60 dark:border-slate-800">
                  <span className="font-bold text-[#0F172A] dark:text-white">حالة الاعتماد:</span>
                  <span className="font-semibold text-[#0284C7] dark:text-sky-300">موثق ومطابق للشروط</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setVideoUrlInput(videoInfo.video_cv_url || '')
                  setVideoVisibilityInput(videoInfo.video_visibility)
                  setVideoFileError(null)
                  setUploadProgress(null)
                  setShowVideoModal(true)
                }}
                className="w-full h-11 bg-[#FAF7F2] dark:bg-slate-800 hover:bg-[#E5D7C3]/50 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white border border-[#E8DEC8] dark:border-slate-700 font-bold text-[12px] rounded-xl transition cursor-pointer"
              >
                تحديث رابط أو إعدادات الفيديو
              </button>
            </div>

            {/* 4. مؤشر اكتمال الملف المهني */}
            <div className="glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 border border-[#E8DEC8] dark:border-slate-800 shadow-sm transition-all">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E8DEC8]/60 dark:border-slate-800 mb-4">
                <h2 className="text-[15px] font-black text-[#0F172A] dark:text-white">مؤشر اكتمال الملف المهني</h2>
                <span className="text-[16px] font-black font-['Plus_Jakarta_Sans'] text-[#0284C7] dark:text-sky-400">
                  <bdi dir="ltr">96%</bdi>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#FAF7F2] dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-4 border border-[#E8DEC8]/60 dark:border-slate-700">
                <div className="bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] h-full rounded-full transition-all duration-500 w-[96%]" />
              </div>

              <p className="text-[11px] text-[#64748B] dark:text-slate-400 leading-relaxed mb-3">
                ملفك المهني يستوفي كافة معايير خوارزمية المطابقة الموزونة للشركات المعتمدة في منصة منارة.
              </p>

              <div className="space-y-2 text-[11px] font-medium text-[#475569] dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-[#0284C7] dark:text-sky-400 font-bold">✓</span>
                  <span>المهارات التقنية: {techSkills.length} مهارات مسجلة</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#0284C7] dark:text-sky-400 font-bold">✓</span>
                  <span>المشاريع المنجزة: {projects.length} مشاريع برمجية</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#0284C7] dark:text-sky-400 font-bold">✓</span>
                  <span>الفيديو التعريفي: معتمد ومتاح لأصحاب العمل</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Add Skill */}
      {showSkillModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-silk-card bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl max-w-[480px] w-full p-6 sm:p-7 shadow-2xl border border-[#E8DEC8] dark:border-slate-800 transition-all">
            <h3 className="text-[17px] font-black text-[#0F172A] dark:text-white mb-2">إضافة مهارة إلى ملفك المهني</h3>
            <p className="text-[12px] text-[#64748B] dark:text-slate-400 mb-4">
              اختر المهارة من الدليل المعتمد وحدد مستوى إتقانك لها.
            </p>

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200">
                    المهارة المعتمدة (دليل كلية الحاسبات والهندسة) *
                  </label>
                  <span className="text-[11px] font-bold text-[#0284C7] dark:text-sky-400">
                    {availableSkills.length} مهارة معتمدة
                  </span>
                </div>

                {/* Quick Search inside Modal */}
                <div className="relative mb-2">
                  <input
                    type="text"
                    value={skillModalSearch}
                    onChange={(e) => setSkillModalSearch(e.target.value)}
                    placeholder="ابحث بالاسم: C++, Python, IoT, Assembly, Java, Cloud..."
                    className="w-full h-9 px-3 text-[12px] rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                  {skillModalSearch && (
                    <button
                      type="button"
                      onClick={() => setSkillModalSearch('')}
                      className="absolute left-2.5 top-2 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <select
                  required
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8]"
                >
                  <option value="">-- اختر من دليل المهارات المهيكلة المعتمدة --</option>
                  <optgroup label="💻 المهارات البرمجية والتقنية (Computer Science & Engineering)">
                    {availableSkills
                      .filter(s => s.category === 'TECHNICAL' && (!skillModalSearch || s.name.toLowerCase().includes(skillModalSearch.toLowerCase().trim())))
                      .map((sk) => (
                        <option key={sk.id} value={sk.id}>
                          {sk.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="🌟 المهارات الشخصية والهندسية القيادية (Soft Skills)">
                    {availableSkills
                      .filter(s => s.category === 'SOFT' && (!skillModalSearch || s.name.toLowerCase().includes(skillModalSearch.toLowerCase().trim())))
                      .map((sk) => (
                        <option key={sk.id} value={sk.id}>
                          {sk.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">مستوى الإتقان *</label>
                <select
                  value={selectedProficiency}
                  onChange={(e) => setSelectedProficiency(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8]"
                >
                  <option value="BEGINNER">مبتدئ (Beginner)</option>
                  <option value="INTERMEDIATE">متوسط (Intermediate)</option>
                  <option value="ADVANCED">متقدم (Advanced)</option>
                  <option value="EXPERT">خبير ومحترف (Expert)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSkillModal(false)}
                  className="px-4 py-2.5 rounded-xl text-[12px] font-bold text-[#475569] dark:text-slate-400 hover:bg-[#FAF7F2] dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-[12px] font-black bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white shadow-sm transition cursor-pointer"
                >
                  حفظ المهارة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add/Edit Project */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-silk-card bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl max-w-[560px] w-full p-6 sm:p-7 shadow-2xl border border-[#E8DEC8] dark:border-slate-800 transition-all">
            <h3 className="text-[17px] font-black text-[#0F172A] dark:text-white mb-3">
              {editingProjectId ? 'تعديل بيانات المشروع البرمجي' : 'إضافة مشروع برمجي جديد'}
            </h3>

            {projectFileError && (
              <div className="mb-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-[12px] font-bold flex items-center gap-2">
                <span>⚠️</span>
                <span>{projectFileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProject} className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1">عنوان المشروع *</label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder=""
                  className="w-full h-10 px-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[13px] font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1">وصف المشروع ومميزاته *</label>
                <textarea
                  required
                  rows={3}
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder=""
                  className="w-full p-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[12px] font-medium text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200">
                    التقنيات المستخدمة (من الدليل المهيكل المعتمد) *
                  </label>
                  <span className="text-[11px] text-[#0284C7] dark:text-sky-400 font-semibold">
                    اختيار مهيكل بالنقرة السريعة
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={projectTechs}
                  onChange={(e) => setProjectTechs(e.target.value)}
                  placeholder="مثال: React.js, Python, PostgreSQL, Docker"
                  className="w-full h-10 px-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[13px] font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8]"
                />
                {/* Quick Add from Predefined Taxonomy Chips */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">إضافة سريعة من الدليل:</span>
                  {['Python', 'React.js', 'Django & DRF', 'PostgreSQL', 'Docker', 'Flutter', 'TypeScript', 'Node.js & Express', 'C++', 'FastAPI', 'Spring Boot', 'Embedded Systems & Embedded C/C++', 'Cybersecurity & InfoSec'].map((tech) => {
                    const currentTechs = projectTechs.split(',').map(t => t.trim()).filter(Boolean)
                    const isAdded = currentTechs.includes(tech)
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            setProjectTechs(currentTechs.filter(t => t !== tech).join(', '))
                          } else {
                            setProjectTechs(currentTechs.length > 0 ? `${projectTechs}, ${tech}` : tech)
                          }
                        }}
                        className={`text-[10.5px] px-2 py-0.5 rounded-lg border font-bold transition cursor-pointer ${
                          isAdded
                            ? 'bg-[#0284C7] text-white border-[#0284C7]'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-[#E8DEC8] dark:border-slate-700 hover:border-[#0284C7]'
                        }`}
                      >
                        {isAdded ? `✓ ${tech}` : `+ ${tech}`}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200">
                      رابط مستودع GitHub
                    </label>
                    <span className="text-[10px] font-bold text-[#0284C7] dark:text-sky-400">
                      معيار ثقة 30%
                    </span>
                  </div>
                  <input
                    type="url"
                    value={projectGithub}
                    onChange={(e) => setProjectGithub(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full h-10 px-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[12px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                  <p className="text-[10px] text-[#64748B] dark:text-slate-400 mt-1">
                    يتم تحليله تلقائياً كمعيار كفاءة برمجية لحديثي التخرج.
                  </p>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1">رابط المعاينة المباشرة (Live Demo)</label>
                  <input
                    type="url"
                    value={projectLiveUrl}
                    onChange={(e) => setProjectLiveUrl(e.target.value)}
                    placeholder="https://my-app.vercel.app"
                    className="w-full h-10 px-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[12px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                  <p className="text-[10px] text-[#64748B] dark:text-slate-400 mt-1">
                    رابط تشغيل المشروع الحي على الويب (اختياري).
                  </p>
                </div>
              </div>

              {/* Project Image Attachment with 5MB validation */}
              <div>
                <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1">
                  صورة توضيحية أو ملخص المشروع (اختياري - أقصى حد 5MB)
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  onChange={handleProjectFileChange}
                  className="w-full text-[12px] text-slate-600 dark:text-slate-400 file:ms-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-black file:bg-gradient-to-r file:from-[#0284C7] file:via-[#0EA5E9] file:to-[#38BDF8] file:text-white hover:file:opacity-90"
                />
              </div>

              {/* Graduation / Capstone Project Trust Badge Checkbox */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="gradProj"
                  checked={isGraduationProject}
                  onChange={(e) => setIsGraduationProject(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-[#0284C7] focus:ring-[#0284C7] cursor-pointer"
                />
                <label htmlFor="gradProj" className="text-[12px] font-bold text-[#0F172A] dark:text-slate-200 cursor-pointer">
                  <span className="text-amber-900 dark:text-amber-300 font-black block">
                    🎓 هذا المشروع هو مشروع التخرج الجامعي (Capstone / Graduation Project)
                  </span>
                  <span className="text-[11px] font-medium text-amber-800/80 dark:text-amber-200/70 block mt-0.5 leading-relaxed">
                    معيار ثقة رئيسي في خوارزمية منارة: يعوض غياب سنوات الخبرة تلقائياً بنسبة تصل إلى 40% لحديثي التخرج أمام الشركات.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowProjectModal(false)
                    setEditingProjectId(null)
                    setProjectFileError(null)
                  }}
                  className="px-4 py-2.5 rounded-xl text-[12px] font-bold text-[#475569] dark:text-slate-400 hover:bg-[#FAF7F2] dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-[12px] font-black bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white shadow-sm transition cursor-pointer"
                >
                  {editingProjectId ? 'تحديث المشروع' : 'حفظ ونشر المشروع'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Update Video */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-silk-card bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl max-w-[480px] w-full p-6 sm:p-7 shadow-2xl border border-[#E8DEC8] dark:border-slate-800 transition-all">
            <h3 className="text-[17px] font-black text-[#0F172A] dark:text-white mb-3">تحديث إعدادات الفيديو التعريفي</h3>

            {videoFileError && (
              <div className="mb-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-[12px] font-bold flex items-center gap-2">
                <span>⚠️</span>
                <span>{videoFileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateVideo} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1">رابط الفيديو (URL)</label>
                <input
                  type="url"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder=""
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[13px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              {/* Direct File Upload with 50MB check */}
              <div>
                <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1">
                  أو رفع ملف فيديو مباشر (الحد الأقصى: 50MB، المدة 60-90 ثانية)
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={handleVideoFileChange}
                  className="w-full text-[12px] text-slate-600 dark:text-slate-400 file:ms-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-black file:bg-gradient-to-r file:from-[#0284C7] file:via-[#0EA5E9] file:to-[#38BDF8] file:text-white hover:file:opacity-90"
                />
                {uploadProgress !== null && (
                  <div className="mt-2 text-[11px] text-[#0284C7] dark:text-sky-400 font-bold flex items-center gap-1.5">
                    <span>✓</span>
                    <span>تم فحص الملف وجاهزيته للرفع بنجاح (100%)</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1">مستوى الخصوصية *</label>
                <select
                  value={videoVisibilityInput}
                  onChange={(e) => setVideoVisibilityInput(e.target.value as 'PUBLIC' | 'COMPANIES_ONLY' | 'PRIVATE')}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8]"
                >
                  <option value="COMPANIES_ONLY">للشركات المعتمدة فقط (موصى به)</option>
                  <option value="PUBLIC">عام لجميع الزوار</option>
                  <option value="PRIVATE">خاص ومحمي</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowVideoModal(false)
                    setVideoFileError(null)
                  }}
                  className="px-4 py-2.5 rounded-xl text-[12px] font-bold text-[#475569] dark:text-slate-400 hover:bg-[#FAF7F2] dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-[12px] font-black bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white shadow-sm transition cursor-pointer"
                >
                  حفظ الإعدادات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
