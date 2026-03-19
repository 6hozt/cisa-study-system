import { useMemo } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getIntensityClass(hours) {
  if (!hours || hours === 0) return 'bg-slate-800/80 border-slate-700/40'
  if (hours < 1) return 'bg-indigo-900/70 border-indigo-800/60'
  if (hours < 2) return 'bg-indigo-700/80 border-indigo-600/60'
  if (hours < 4) return 'bg-indigo-500/90 border-indigo-400/60'
  return 'bg-indigo-400 border-indigo-300/60 shadow-sm shadow-indigo-500/40'
}

export default function StudyHeatmap({ heatmapData = {} }) {
  const weeks = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Build 13 weeks of cells (most recent on right)
    const cells = []
    const startDay = new Date(today)
    startDay.setDate(today.getDate() - 12 * 7 - today.getDay()) // start on a Sunday

    for (let w = 0; w < 13; w++) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDay)
        date.setDate(startDay.getDate() + w * 7 + d)
        const dateStr = date.toISOString().split('T')[0]
        const isFuture = date > today
        week.push({ date, dateStr, hours: isFuture ? null : (heatmapData[dateStr] || 0), isFuture, isToday: dateStr === today.toISOString().split('T')[0] })
      }
      cells.push(week)
    }
    return cells
  }, [heatmapData])

  // Month labels
  const monthLabels = useMemo(() => {
    const labels = []
    let lastMonth = -1
    weeks.forEach((week, wi) => {
      const month = week[0].date.getMonth()
      if (month !== lastMonth) {
        labels.push({ wi, label: week[0].date.toLocaleString('default', { month: 'short' }) })
        lastMonth = month
      }
    })
    return labels
  }, [weeks])

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-flex flex-col gap-1 min-w-max">
        {/* Month labels */}
        <div className="flex gap-1 mb-1 ml-8">
          {weeks.map((week, wi) => {
            const ml = monthLabels.find((m) => m.wi === wi)
            return (
              <div key={wi} className="w-3.5 text-xs text-slate-500 font-medium">
                {ml ? ml.label : ''}
              </div>
            )
          })}
        </div>

        {/* Grid */}
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1">
            {DAYS.map((d, i) => (
              <div key={d} className={`w-7 h-3.5 text-xs text-slate-500 flex items-center ${i % 2 === 0 ? '' : 'opacity-0'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map(({ dateStr, hours, isFuture, isToday }) => (
                <div
                  key={dateStr}
                  title={isFuture ? dateStr : `${dateStr}: ${hours || 0}h studied`}
                  className={`w-3.5 h-3.5 rounded-sm border transition-all duration-150 cursor-default
                    ${isFuture
                      ? 'bg-slate-900/40 border-slate-800/30 opacity-40'
                      : getIntensityClass(hours)}
                    ${isToday ? 'ring-1 ring-indigo-400 ring-offset-1 ring-offset-slate-900' : ''}
                  `}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-2 ml-8">
          <span className="text-xs text-slate-500">Less</span>
          {['bg-slate-800/80', 'bg-indigo-900/70', 'bg-indigo-700/80', 'bg-indigo-500/90', 'bg-indigo-400'].map((cls, i) => (
            <div key={i} className={`w-3.5 h-3.5 rounded-sm border border-slate-700/40 ${cls}`} />
          ))}
          <span className="text-xs text-slate-500">More</span>
        </div>
      </div>
    </div>
  )
}
