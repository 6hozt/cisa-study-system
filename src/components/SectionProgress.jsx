import { SECTION_COLORS } from '../lib/certifications'

export default function SectionProgress({ sections = [], sessionTotals = {} }) {
  return (
    <div className="space-y-4">
      {sections.map((section, i) => {
        const studied = sessionTotals[section.name] || 0
        const pct = Math.min(100, (studied / section.recommendedHours) * 100)
        const color = SECTION_COLORS[i % SECTION_COLORS.length]

        const statusLabel =
          pct >= 100 ? 'Complete' :
          pct >= 66 ? 'On Track' :
          pct >= 33 ? 'In Progress' : 'Not Started'

        const statusColor =
          pct >= 100 ? 'text-emerald-400' :
          pct >= 66 ? 'text-indigo-400' :
          pct >= 33 ? 'text-amber-400' : 'text-slate-500'

        return (
          <div key={section.name} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-sm font-medium text-slate-200 truncate">{section.name}</span>
                <span className="text-xs text-slate-500 hidden sm:block truncate">— {section.fullName}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
                <span className="text-xs text-slate-400 tabular-nums">
                  {studied.toFixed(1)} / {section.recommendedHours}h
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  backgroundColor: color,
                  boxShadow: `0 0 8px ${color}60`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
