import { SECTION_COLORS } from '../lib/certifications'

export default function RecentSessions({ sessions = [], sections = [], onDelete }) {
  const getSectionColor = (sectionName) => {
    const idx = sections.findIndex((s) => s.name === sectionName)
    return SECTION_COLORS[idx >= 0 ? idx % SECTION_COLORS.length : 0]
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl mb-3">📖</div>
        <p className="text-slate-400 font-medium">No sessions logged yet</p>
        <p className="text-slate-500 text-sm mt-1">Click "Log Study Session" to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.slice(0, 10).map((session) => {
        const color = getSectionColor(session.section_name)
        const date = new Date(session.session_date + 'T00:00:00')
        const isToday = new Date().toDateString() === date.toDateString()
        const isYesterday = new Date(Date.now() - 86400000).toDateString() === date.toDateString()
        const dateLabel = isToday ? 'Today' : isYesterday ? 'Yesterday' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

        return (
          <div key={session.id} className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/30 group hover:bg-slate-800/60 transition-all">
            <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-white">{session.section_name}</span>
                <span className="text-xs bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-full">
                  {session.hours_spent}h
                </span>
                <span className="text-xs text-slate-500">{dateLabel}</span>
              </div>
              {session.note && (
                <p className="text-xs text-slate-400 mt-1 truncate">{session.note}</p>
              )}
            </div>
            {onDelete && (
              <button
                onClick={() => onDelete(session.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs transition-all shrink-0 p-1"
                title="Delete session"
              >
                ✕
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
