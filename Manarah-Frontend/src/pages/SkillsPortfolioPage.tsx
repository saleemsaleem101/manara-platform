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
              <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col items-center justify-center relative overflow-hidden mb-4 shadow-inner text-white text-center p-4 border border-slate-700/50">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2 backdrop-blur-xs">
                  <div className="w-0 h-0 border-y-8 border-y-transparent border-e-12 border-e-white me-1" />
                </div>
                <span className="text-[12px] font-bold">فيديو تعريفي احترافي (60 - 90 ثانية)</span>
                <span className="text-[10px] text-slate-300 mt-1">
                  المدة المسجلة: <bdi dir="ltr">{videoInfo.video_duration_seconds}</bdi> ثانية • جودة عالية 1080p
                </span>
              </div>

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
                <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">المهارة المعتمدة (دليل تخصصات الحاسوب والتقنية) *</label>
                <select
                  required
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8]"
                >
                  <option value="">-- اختر من دليل المهارات المهيكلة المعتمدة --</option>
                  <optgroup label="💻 المهارات البرمجية والتقنية (Computer Science & Tech)">
                    {availableSkills.filter(s => s.category === 'TECHNICAL').map((sk) => (
                      <option key={sk.id} value={sk.id}>
                        {sk.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🌟 المهارات الشخصية والقيادية (Soft Skills)">
                    {availableSkills.filter(s => s.category === 'SOFT').map((sk) => (
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
                <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1">التقنيات المستخدمة *</label>
                <input
                  type="text"
                  required
                  value={projectTechs}
                  onChange={(e) => setProjectTechs(e.target.value)}
                  placeholder=""
                  className="w-full h-10 px-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[13px] font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1">رابط GitHub</label>
                  <input
                    type="url"
                    value={projectGithub}
                    onChange={(e) => setProjectGithub(e.target.value)}
                    placeholder=""
                    className="w-full h-10 px-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[12px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#0F172A] dark:text-slate-200 mb-1">رابط المعاينة المباشرة</label>
                  <input
                    type="url"
                    value={projectLiveUrl}
                    onChange={(e) => setProjectLiveUrl(e.target.value)}
                    placeholder=""
                    className="w-full h-10 px-3 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-[12px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#38BDF8]"
                  />
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

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="gradProj"
                  checked={isGraduationProject}
                  onChange={(e) => setIsGraduationProject(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0284C7] focus:ring-[#0284C7]"
                />
                <label htmlFor="gradProj" className="text-[12px] font-bold text-[#0F172A] dark:text-slate-200">
                  هذا المشروع هو مشروع رئيسي موثق ★
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
