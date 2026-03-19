import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUserExamPlan, getStudySessions, getSectionProgress, getHeatmapData, deleteStudySession } from '../lib/database'
import CircularProgress from '../components/CircularProgress'
import SectionProgress from '../components/SectionProgress'
import StatCard from '../components/StatCard'
import StudyHeatmap from '../components/StudyHeatmap'
import LogSessionModal from '../components/LogSessionModal'
import RecentSessions from '../components/RecentSessions'
import StudyPlanTab from '../components/StudyPlanTab'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { SECTION_COLORS } from '../lib/certifications'

function computeMetrics(plan, sectionTotals) {
  if (!plan) return {}

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const examDate = new Date(plan.exam_date + 'T00:00:00')
  const daysRemaining = Math.max(0, Math.ceil((examDate - today) / (1000 * 60 * 60 * 24)))

  const totalHours = plan.total_recommended_hours
  const studiedHours = Object.values(sectionTotals).reduce((a, b) => a + b, 0)
  const remainingHours = Math.max(0, totalHours - studiedHours)
  const pctComplete = Math.min(100, (studiedHours / totalHours) * 100)

  // Adaptive daily target: remaining hours ÷ remaining days
  const dailyTarget = daysRemaining > 0 ? remainingHours / daysRemaining : 0

  // Status
  const expectedStudied = totalHours - (plan.weekly_hours / 7) * daysRemaining
  const delta = studiedHours - expectedStudied
  const status = delta >= 0 ? 'on_track' : delta >= -plan.weekly_hours ? 'slightly_behind' : 'behind'

  return { daysRemaining, totalHours, studiedHours, remainingHours, pctComplete, dailyTarget, status, delta }
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [sessions, setSessions] = useState([])
  const [sectionTotals, setSectionTotals] = useState({})
  const [heatmapData, setHeatmapData] = useState({})
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const loadData = useCallback(async () => {
    if (!user) return
    const { data: planData } = await getUserExamPlan(user.id)
    if (!planData) {
      navigate('/onboarding')
      return
    }
    setPlan(planData)

    const [{ data: sess }, { data: totals }, { data: heatmap }] = await Promise.all([
      getStudySessions(planData.id),
      getSectionProgress(planData.id),
      getHeatmapData(planData.id),
    ])

    setSessions(sess || [])
    setSectionTotals(totals || {})
    setHeatmapData(heatmap || {})
    setLoading(false)
  }, [user, navigate])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async (sessionId) => {
    await deleteStudySession(sessionId)
    loadData()
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const metrics = computeMetrics(plan, sectionTotals)

  const statusConfig = {
    on_track: { label: 'On Track', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
    slightly_behind: { label: 'Slightly Behind', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' },
    behind: { label: 'Behind Schedule', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-400' },
  }
  const status = statusConfig[metrics.status] || statusConfig.on_track

  // Bar chart data for sections
  const chartData = plan?.sections?.map((s, i) => ({
    name: s.name,
    studied: sectionTotals[s.name] || 0,
    target: s.recommendedHours,
    color: SECTION_COLORS[i % SECTION_COLORS.length],
  })) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-bold text-white text-lg">StudyTracker</span>
              {plan && (
                <span className="hidden sm:block text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
                  {plan.certification_name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:block">Log Session</span>
              </button>

              <div className="relative group">
                <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm px-3 py-2 rounded-xl transition-all">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block truncate max-w-24">{user?.email?.split('@')[0]}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button
                    onClick={() => navigate('/onboarding')}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded-t-xl transition-colors"
                  >
                    New Exam Plan
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700 rounded-b-xl transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Top hero section */}
        <div className="glass rounded-3xl p-6 lg:p-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Circular progress */}
            <div className="shrink-0 flex flex-col items-center">
              <CircularProgress percentage={metrics.pctComplete || 0} size={220} />
              <div className={`mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium ${status.bg} ${status.color}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${status.dot}`} />
                {status.label}
              </div>
            </div>

            {/* Right side info */}
            <div className="flex-1 w-full">
              <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  {plan?.certification_name}
                </h1>
                <p className="text-slate-400 mt-1">
                  Exam: {new Date(plan?.exam_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Key metrics grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Days remaining */}
                <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Days Left</p>
                  <p className={`text-3xl font-bold mt-1 tabular-nums ${
                    metrics.daysRemaining <= 14 ? 'text-red-400' :
                    metrics.daysRemaining <= 30 ? 'text-amber-400' : 'text-white'
                  }`}>
                    {metrics.daysRemaining}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">until exam</p>
                </div>

                {/* Hours studied */}
                <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Hours Done</p>
                  <p className="text-3xl font-bold mt-1 text-indigo-400 tabular-nums">
                    {(metrics.studiedHours || 0).toFixed(0)}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">of {metrics.totalHours} total</p>
                </div>

                {/* Hours remaining */}
                <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Hrs Remaining</p>
                  <p className="text-3xl font-bold mt-1 text-violet-400 tabular-nums">
                    {(metrics.remainingHours || 0).toFixed(0)}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">hours to go</p>
                </div>

                {/* Daily target */}
                <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Daily Target</p>
                  <p className={`text-3xl font-bold mt-1 tabular-nums ${
                    metrics.dailyTarget > plan?.weekly_hours / 5 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {(metrics.dailyTarget || 0).toFixed(1)}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">hrs/day needed</p>
                </div>
              </div>

              {/* Hours progress bar */}
              <div className="mt-5">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>{(metrics.studiedHours || 0).toFixed(1)} hours studied</span>
                  <span>{metrics.totalHours} hours total</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${metrics.pctComplete || 0}%`,
                      background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
                      boxShadow: '0 0 12px rgba(99,102,241,0.5)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 rounded-xl p-1 w-fit">
          {['overview', 'sections', 'plan', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
                ${activeTab === tab
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Section bars */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Section Progress</h2>
                <span className="text-xs text-slate-500">{plan?.sections?.length} sections</span>
              </div>
              <SectionProgress sections={plan?.sections || []} sessionTotals={sectionTotals} />
            </div>

            {/* Heatmap + Recent sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-5">Study Activity</h2>
                <StudyHeatmap heatmapData={heatmapData} />
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-white">Recent Sessions</h2>
                  <span className="text-xs text-slate-500">{sessions.length} total</span>
                </div>
                <RecentSessions sessions={sessions} sections={plan?.sections || []} onDelete={handleDelete} />
              </div>
            </div>
          </div>
        )}

        {/* Sections tab */}
        {activeTab === 'sections' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Hours by Section</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#f8fafc' }}
                      cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                      formatter={(val, name) => [`${val.toFixed(1)}h`, name === 'studied' ? 'Studied' : 'Target']}
                    />
                    <Bar dataKey="target" fill="#1e293b" radius={[4, 4, 0, 0]} name="Target" />
                    <Bar dataKey="studied" radius={[4, 4, 0, 0]} name="Studied">
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan?.sections?.map((s, i) => {
                const studied = sectionTotals[s.name] || 0
                const pct = Math.min(100, (studied / s.recommendedHours) * 100)
                const color = SECTION_COLORS[i % SECTION_COLORS.length]
                return (
                  <div key={s.name} className="glass glass-hover rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-semibold text-white">{s.name}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{s.fullName}</p>
                    <div className="h-1.5 bg-slate-700/50 rounded-full mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{studied.toFixed(1)}h done</span>
                      <span className="text-slate-500">{s.recommendedHours}h total</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Study Plan tab */}
        {activeTab === 'plan' && (
          <StudyPlanTab plan={plan} />
        )}

        {/* History tab */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-fade-in">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">All Study Sessions</h2>
                <span className="text-xs text-slate-500">{sessions.length} sessions • {(metrics.studiedHours || 0).toFixed(1)}h total</span>
              </div>
              {sessions.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-400">No sessions yet. Log your first study session!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => {
                    const idx = plan?.sections?.findIndex((s) => s.name === session.section_name) ?? 0
                    const color = SECTION_COLORS[idx >= 0 ? idx % SECTION_COLORS.length : 0]
                    const date = new Date(session.session_date + 'T00:00:00')
                    return (
                      <div key={session.id} className="flex items-start gap-4 p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl group hover:bg-slate-800/50 transition-all">
                        <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-medium text-white text-sm">{session.section_name}</span>
                            <span className="text-xs text-slate-300 bg-slate-700/60 px-2 py-0.5 rounded-full">{session.hours_spent}h</span>
                            <span className="text-xs text-slate-500">
                              {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          {session.note && <p className="text-sm text-slate-400 mt-1">{session.note}</p>}
                        </div>
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs transition-all shrink-0 p-1 rounded"
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating log button (mobile) */}
        <div className="fixed bottom-6 right-6 sm:hidden z-30">
          <button
            onClick={() => setShowModal(true)}
            className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-2xl shadow-2xl shadow-indigo-500/40 flex items-center justify-center transition-all active:scale-95"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </main>

      {/* Log Session Modal */}
      {showModal && (
        <LogSessionModal
          plan={plan}
          onClose={() => setShowModal(false)}
          onLogged={loadData}
        />
      )}
    </div>
  )
}
