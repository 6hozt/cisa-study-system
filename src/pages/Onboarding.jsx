import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CERTIFICATIONS } from '../lib/certifications'
import { createExamPlan, upsertUserProfile } from '../lib/database'

const STEPS = ['Certification', 'Experience', 'Exam Date', 'Schedule']

const EXPERIENCE_LEVELS = [
  {
    id: 'beginner',
    label: 'Beginner',
    description: 'Little to no background in this domain',
    multiplier: 1.0,
    icon: '🌱',
    color: 'emerald',
    badge: '100% of recommended hours',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    description: 'Some relevant experience or coursework',
    multiplier: 0.7,
    icon: '📘',
    color: 'indigo',
    badge: '70% of recommended hours',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Working in the field with strong foundational knowledge',
    multiplier: 0.5,
    icon: '⚡',
    color: 'violet',
    badge: '50% of recommended hours',
  },
]

const COLOR_STYLES = {
  emerald: {
    selected: 'border-emerald-500/70 bg-emerald-600/10 shadow-lg shadow-emerald-500/10',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
    check: 'bg-emerald-500',
    hours: 'text-emerald-400',
  },
  indigo: {
    selected: 'border-indigo-500/70 bg-indigo-600/10 shadow-lg shadow-indigo-500/10',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    dot: 'bg-indigo-400',
    check: 'bg-indigo-500',
    hours: 'text-indigo-400',
  },
  violet: {
    selected: 'border-violet-500/70 bg-violet-600/10 shadow-lg shadow-violet-500/10',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    dot: 'bg-violet-400',
    check: 'bg-violet-500',
    hours: 'text-violet-400',
  },
}

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState(null)
  const [custom, setCustom] = useState({ name: '', totalHours: '', sections: '' })
  const [isCustom, setIsCustom] = useState(false)
  const [experienceLevel, setExperienceLevel] = useState(null)
  const [examDate, setExamDate] = useState('')
  const [weeklyHours, setWeeklyHours] = useState(10)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 7)
  const minDateStr = minDate.toISOString().split('T')[0]

  // Derived: base hours before multiplier
  const baseHours = isCustom
    ? Number(custom.totalHours) || 0
    : selected?.totalHours || 0

  // Derived: multiplier from selected experience level
  const multiplier = EXPERIENCE_LEVELS.find((l) => l.id === experienceLevel)?.multiplier ?? 1.0

  // Derived: adjusted total hours
  const adjustedHours = Math.round(baseHours * multiplier)

  const handleCertSelect = (cert) => {
    setSelected(cert)
    setIsCustom(false)
  }

  const canProceedStep0 = isCustom
    ? custom.name && custom.totalHours && custom.sections
    : selected !== null
  const canProceedStep1 = experienceLevel !== null
  const canProceedStep2 = examDate !== ''

  const applyMultiplierToSections = (sections) =>
    sections.map((s) => ({
      ...s,
      recommendedHours: Math.max(1, Math.round(s.recommendedHours * multiplier)),
    }))

  const handleFinish = async () => {
    if (!user) return
    setSaving(true)
    setError('')

    let certData
    if (isCustom) {
      const sectionNames = custom.sections.split(',').map((s) => s.trim()).filter(Boolean)
      const hoursEach = Math.max(1, Math.floor(adjustedHours / sectionNames.length))
      certData = {
        certification_id: 'custom',
        certification_name: custom.name,
        total_recommended_hours: adjustedHours,
        sections: sectionNames.map((name, i) => ({
          name,
          fullName: name,
          recommendedHours: hoursEach,
          order: i + 1,
        })),
      }
    } else {
      certData = {
        certification_id: selected.id,
        certification_name: selected.name,
        total_recommended_hours: adjustedHours,
        sections: applyMultiplierToSections(selected.sections),
      }
    }

    const { error: planError } = await createExamPlan({
      user_id: user.id,
      ...certData,
      exam_date: examDate,
      weekly_hours: weeklyHours,
    })

    if (planError) {
      setError(planError.message)
      setSaving(false)
      return
    }

    await upsertUserProfile({ id: user.id, onboarding_complete: true }).catch(() => {})
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-3xl animate-slide-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4 shadow-lg shadow-indigo-500/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Let's set up your study plan</h1>
          <p className="text-slate-400 mt-2">Takes about 60 seconds</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center justify-center gap-1.5 mb-10 flex-wrap">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${i === step ? 'bg-indigo-600 text-white' : i < step ? 'bg-indigo-600/30 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs shrink-0
                  ${i < step ? 'bg-indigo-400 text-white' : ''}`}>
                  {i < step ? '✓' : i + 1}
                </span>
                {label}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-px ${i < step ? 'bg-indigo-500' : 'bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 0: Choose certification ─────────────────────────────────── */}
        {step === 0 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">Which exam are you preparing for?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {CERTIFICATIONS.map((cert) => (
                <button
                  key={cert.id}
                  onClick={() => handleCertSelect(cert)}
                  className={`glass glass-hover p-4 rounded-xl text-left transition-all duration-200 group
                    ${selected?.id === cert.id && !isCustom
                      ? 'border-indigo-500/70 bg-indigo-600/10 shadow-lg shadow-indigo-500/10'
                      : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{cert.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white text-sm">{cert.short}</span>
                        <span className="text-xs text-slate-400 shrink-0">{cert.totalHours}hrs</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{cert.name}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {cert.sections.slice(0, 3).map((s) => (
                          <span key={s.name} className="text-xs bg-slate-700/60 text-slate-300 px-1.5 py-0.5 rounded">
                            {s.name}
                          </span>
                        ))}
                        {cert.sections.length > 3 && (
                          <span className="text-xs text-slate-500">+{cert.sections.length - 3}</span>
                        )}
                      </div>
                    </div>
                    {selected?.id === cert.id && !isCustom && (
                      <div className="shrink-0 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {/* Custom option */}
              <button
                onClick={() => { setIsCustom(true); setSelected(null) }}
                className={`glass glass-hover p-4 rounded-xl text-left transition-all duration-200
                  ${isCustom ? 'border-violet-500/70 bg-violet-600/10 shadow-lg shadow-violet-500/10' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✏️</span>
                  <div>
                    <span className="font-semibold text-white text-sm">Custom Certification</span>
                    <p className="text-xs text-slate-400 mt-0.5">Create your own study plan</p>
                  </div>
                </div>
              </button>
            </div>

            {isCustom && (
              <div className="glass rounded-xl p-5 space-y-4 animate-fade-in mb-6">
                <h3 className="font-medium text-white">Custom Certification Details</h3>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Certification Name</label>
                  <input
                    type="text"
                    value={custom.name}
                    onChange={(e) => setCustom({ ...custom, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="e.g. Google Cloud Professional"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Total Recommended Study Hours</label>
                  <input
                    type="number"
                    min="1"
                    value={custom.totalHours}
                    onChange={(e) => setCustom({ ...custom, totalHours: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="e.g. 150"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Sections (comma-separated)</label>
                  <input
                    type="text"
                    value={custom.sections}
                    onChange={(e) => setCustom({ ...custom, sections: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="e.g. Core Concepts, Security, Networking"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setStep(1)}
                disabled={!canProceedStep0}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1: Experience level ──────────────────────────────────────── */}
        {step === 1 && (
          <div className="animate-fade-in max-w-xl mx-auto">
            <h2 className="text-xl font-semibold text-white mb-2 text-center">What's your experience level?</h2>
            <p className="text-slate-400 text-center text-sm mb-8">
              We'll calibrate your recommended study hours based on what you already know.
            </p>

            <div className="space-y-3 mb-8">
              {EXPERIENCE_LEVELS.map((level) => {
                const isSelected = experienceLevel === level.id
                const styles = COLOR_STYLES[level.color]
                const hoursForLevel = baseHours > 0 ? Math.round(baseHours * level.multiplier) : null

                return (
                  <button
                    key={level.id}
                    onClick={() => setExperienceLevel(level.id)}
                    className={`w-full glass glass-hover p-5 rounded-2xl text-left transition-all duration-200
                      ${isSelected ? styles.selected : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl mt-0.5">{level.icon}</span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-semibold text-white">{level.label}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${styles.badge}`}>
                            {level.badge}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{level.description}</p>

                        {/* Live hour estimate */}
                        {hoursForLevel !== null && (
                          <div className="flex items-center gap-2 mt-3">
                            <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                            <span className="text-xs text-slate-500">
                              Your adjusted plan:{' '}
                              <span className={`font-semibold ${styles.hours}`}>
                                {hoursForLevel} hours
                              </span>
                              {level.multiplier < 1 && (
                                <span className="text-slate-500">
                                  {' '}(vs {baseHours}h default)
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Selection indicator */}
                      <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                        ${isSelected
                          ? `${styles.check} border-transparent`
                          : 'border-slate-600 bg-transparent'}`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Hour reduction bar — only visible when selected and there's a reduction */}
                    {isSelected && level.multiplier < 1 && baseHours > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                          <span>Hours saved by your experience</span>
                          <span className="text-emerald-400 font-medium">−{baseHours - hoursForLevel}h</span>
                        </div>
                        <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${level.multiplier * 100}%`,
                              background: level.color === 'indigo'
                                ? 'linear-gradient(to right, #6366f1, #8b5cf6)'
                                : 'linear-gradient(to right, #8b5cf6, #a855f7)',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(0)} className="text-slate-400 hover:text-white py-3 px-6 rounded-xl transition-colors">
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Exam date ─────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="animate-fade-in max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-white mb-2 text-center">When is your exam?</h2>
            <p className="text-slate-400 text-center text-sm mb-8">We'll build your study schedule around this date.</p>

            <div className="glass rounded-2xl p-8 mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">Exam Date</label>
              <input
                type="date"
                min={minDateStr}
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              />
              {examDate && (
                <div className="mt-4 p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-lg">
                  <p className="text-indigo-300 text-sm text-center">
                    {Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24))} days until your exam
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white py-3 px-6 rounded-xl transition-colors">
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Weekly hours & summary ───────────────────────────────── */}
        {step === 3 && (
          <div className="animate-fade-in max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-white mb-2 text-center">How many hours per week can you study?</h2>
            <p className="text-slate-400 text-center text-sm mb-8">We'll adapt your daily targets as you go.</p>

            <div className="glass rounded-2xl p-8 mb-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-300">Weekly Study Hours</label>
                  <span className="text-2xl font-bold text-indigo-400">{weeklyHours}h</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1hr</span>
                  <span>60hrs</span>
                </div>
              </div>

              {/* Summary card */}
              {examDate && (
                <div className="bg-slate-900/60 rounded-xl p-4 space-y-2.5">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Your Study Plan Summary</h3>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Exam</span>
                    <span className="text-white font-medium">{isCustom ? custom.name : selected?.short}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Experience</span>
                    <span className="text-white font-medium capitalize">{experienceLevel}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Exam Date</span>
                    <span className="text-white font-medium">
                      {new Date(examDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Days Remaining</span>
                    <span className="text-white font-medium">
                      {Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>

                  <div className="border-t border-slate-800 pt-2.5 mt-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Default Hours</span>
                      <span className="text-slate-400 line-through">{baseHours}h</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-slate-300 font-medium">Adjusted Study Hours</span>
                      <span className="text-indigo-300 font-semibold">
                        {adjustedHours}h
                        {multiplier < 1 && (
                          <span className="text-emerald-400 text-xs ml-1">
                            (−{baseHours - adjustedHours}h)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm pt-1">
                    <span className="text-slate-400">Daily Target</span>
                    <span className="text-indigo-400 font-semibold">
                      {(weeklyHours / 7).toFixed(1)}hrs/day
                    </span>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white py-3 px-6 rounded-xl transition-colors">
                ← Back
              </button>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Building your plan...
                  </span>
                ) : 'Launch Dashboard 🚀'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
