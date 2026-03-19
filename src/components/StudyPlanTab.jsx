import { useMemo, useState } from 'react'
import { generateStudyPlan, getTimeBreakdown, chunkSchedule, todayChunkIndex } from '../lib/studyPlan'
import { getResources, getTimeBlocks, hasCertResources } from '../lib/resources'
import { SECTION_COLORS } from '../lib/certifications'

const DAYS_PER_PAGE = 14

// ─── External link icon ───────────────────────────────────────────────────────

function ExternalIcon() {
  return (
    <svg className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

// ─── Time blocks ──────────────────────────────────────────────────────────────

const BLOCK_META = {
  video: { icon: '🎬', type: 'Study / Video' },
  practice: { icon: '📝', type: 'Practice Questions' },
  review: { icon: '🔁', type: 'Review & Notes' },
}

function TimeBlock({ blockKey, time, specific }) {
  const meta = BLOCK_META[blockKey]
  // Fall back to generic label when no specific task is defined
  const label = specific?.label ?? meta.type
  const url = specific?.url ?? null

  return (
    <div className="flex items-start gap-3 bg-slate-900/60 rounded-xl px-4 py-3">
      <span className="text-xl shrink-0 mt-0.5">{meta.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1">
          <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">{meta.type}</span>
          <span className="text-sm font-semibold text-white tabular-nums shrink-0">{time}</span>
        </div>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="group inline-flex items-center gap-1.5 text-sm text-indigo-300 hover:text-indigo-200 transition-colors leading-snug"
          >
            <span className="underline underline-offset-2 decoration-indigo-400/40 hover:decoration-indigo-300">{label}</span>
            <ExternalIcon />
          </a>
        ) : (
          <p className="text-sm text-slate-300 leading-snug">{label}</p>
        )}
      </div>
    </div>
  )
}

// ─── Resource item ────────────────────────────────────────────────────────────

function ResourceItem({ resource, type }) {
  const isFree = type === 'free'
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <span className={`mt-0.5 shrink-0 text-xs ${isFree ? 'text-emerald-400' : 'text-indigo-400'}`}>
        {isFree ? '✦' : '◆'}
      </span>
      <div className="min-w-0">
        {resource.url ? (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 font-medium text-slate-200 hover:text-white transition-colors"
          >
            <span className="underline underline-offset-2 decoration-slate-500/40 hover:decoration-slate-300">{resource.name}</span>
            <ExternalIcon />
          </a>
        ) : (
          <span className="font-medium text-slate-200">{resource.name}</span>
        )}
        {resource.price && (
          <span className="ml-1.5 text-xs text-amber-400 font-medium">{resource.price}</span>
        )}
        {resource.description && (
          <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{resource.description}</p>
        )}
        {(resource.where || resource.publisher) && (
          <p className="text-slate-500 text-xs mt-0.5 italic">
            {resource.where || resource.publisher}
          </p>
        )}
      </div>
    </li>
  )
}

// ─── Resource section ─────────────────────────────────────────────────────────

function ResourceSection({ certificationId, sectionName }) {
  const res = getResources(certificationId, sectionName)
  const hasLibrary = hasCertResources(certificationId)

  if (!hasLibrary) {
    return (
      <div className="mt-4 pt-4 border-t border-slate-700/40">
        <p className="text-xs text-slate-500 italic">
          Detailed study resources for this certification are coming soon.
        </p>
      </div>
    )
  }

  if (!res) {
    return (
      <div className="mt-4 pt-4 border-t border-slate-700/40">
        <p className="text-xs text-slate-500 italic">Resources for this section are coming soon.</p>
      </div>
    )
  }

  const hasFree = res.free?.length > 0
  const hasPaid = res.paid?.length > 0

  return (
    <div className="mt-4 pt-4 border-t border-slate-700/40 space-y-4">
      {hasFree && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Free Resources</span>
          </div>
          <ul className="space-y-2.5">
            {res.free.map((r, i) => <ResourceItem key={i} resource={r} type="free" />)}
          </ul>
        </div>
      )}
      {hasPaid && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Paid Resources</span>
          </div>
          <ul className="space-y-2.5">
            {res.paid.map((r, i) => <ResourceItem key={i} resource={r} type="paid" />)}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Day card ─────────────────────────────────────────────────────────────────

function DayCard({ entry, dailyHours, certificationId, sectionIndex }) {
  const [expanded, setExpanded] = useState(entry.isToday)
  const breakdown = getTimeBreakdown(dailyHours)
  const specificBlocks = getTimeBlocks(certificationId, entry.section.name)
  const color = SECTION_COLORS[sectionIndex % SECTION_COLORS.length]

  return (
    <div
      className={`glass rounded-2xl overflow-hidden transition-all duration-200
        ${entry.isToday ? 'ring-2 ring-indigo-500/60 shadow-lg shadow-indigo-500/10' : ''}
        ${entry.isPast ? 'opacity-50' : ''}
      `}
    >
      {/* Card header — always visible, full row is the toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-700/20 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Date column */}
          <div className="shrink-0 text-center w-12">
            <div className={`text-xs font-medium uppercase leading-none ${entry.isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
              {entry.date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={`text-xl font-bold leading-tight tabular-nums mt-0.5
              ${entry.isToday ? 'text-indigo-300' : entry.isPast ? 'text-slate-500' : 'text-white'}`}>
              {entry.date.getDate()}
            </div>
          </div>

          <div className="w-px h-10 bg-slate-700/60 shrink-0" />

          {/* Section info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${color}25`, border: `1px solid ${color}55`, color }}
              >
                {entry.section.name}
              </span>
              {entry.isToday && (
                <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
              {entry.isPast && (
                <span className="text-xs text-slate-500">Past</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{entry.section.fullName}</p>
          </div>
        </div>

        {/* Time + chevron */}
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className="hidden sm:block text-xs text-slate-500 tabular-nums">
            {dailyHours.toFixed(1)}h
          </span>
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 space-y-2 animate-fade-in">
          {/* Time blocks — now a vertical list with specific task links */}
          <TimeBlock blockKey="video"    time={breakdown.video}    specific={specificBlocks?.video} />
          <TimeBlock blockKey="practice" time={breakdown.practice} specific={specificBlocks?.practice} />
          <TimeBlock blockKey="review"   time={breakdown.review}   specific={specificBlocks?.review} />

          {/* Full resource library */}
          <ResourceSection
            certificationId={certificationId}
            sectionName={entry.section.name}
          />
        </div>
      )}
    </div>
  )
}

// ─── Main tab component ───────────────────────────────────────────────────────

export default function StudyPlanTab({ plan }) {
  const dailyHours = (plan?.weekly_hours ?? 10) / 7

  const schedule = useMemo(() => generateStudyPlan(plan), [plan])
  const chunks   = useMemo(() => chunkSchedule(schedule, DAYS_PER_PAGE), [schedule])
  const defaultChunk = useMemo(() => todayChunkIndex(chunks), [chunks])
  const [pageIndex, setPageIndex] = useState(defaultChunk)

  if (!plan || !schedule.length) {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <div className="text-4xl mb-3">📅</div>
        <p className="text-slate-300 font-medium">No study plan available</p>
        <p className="text-slate-500 text-sm mt-1">Complete onboarding to generate your schedule.</p>
      </div>
    )
  }

  const examDate = new Date(plan.exam_date + 'T00:00:00')
  if (new Date() >= examDate) {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <div className="text-4xl mb-3">🎓</div>
        <p className="text-slate-300 font-medium">Exam date has passed</p>
        <p className="text-slate-500 text-sm mt-1">Start a new exam plan to generate a fresh schedule.</p>
      </div>
    )
  }

  const currentChunk = chunks[pageIndex] ?? []
  const firstDay = currentChunk[0]?.date
  const lastDay  = currentChunk[currentChunk.length - 1]?.date
  const rangeLabel = firstDay && lastDay
    ? `${firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : ''

  const sectionIndexMap = Object.fromEntries(
    (plan.sections ?? []).map((s, i) => [s.name, i])
  )

  const NavBar = ({ scrollTop = false }) => (
    <div className="flex items-center justify-between">
      <button
        onClick={() => { setPageIndex((p) => Math.max(0, p - 1)); if (scrollTop) window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        disabled={pageIndex === 0}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2 rounded-lg hover:bg-slate-800"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>

      <div className="text-center">
        <p className="text-sm font-medium text-white">{rangeLabel}</p>
        <p className="text-xs text-slate-500 mt-0.5">Page {pageIndex + 1} of {chunks.length}</p>
      </div>

      <button
        onClick={() => { setPageIndex((p) => Math.min(chunks.length - 1, p + 1)); if (scrollTop) window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        disabled={pageIndex >= chunks.length - 1}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2 rounded-lg hover:bg-slate-800"
      >
        Next
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="glass rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Day-by-Day Study Plan</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {schedule.length} study days · {dailyHours.toFixed(1)}h/day target · exam{' '}
              {examDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {plan.sections?.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SECTION_COLORS[i % SECTION_COLORS.length] }} />
                <span className="text-xs text-slate-400">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NavBar />

      {/* Jump to today */}
      {pageIndex !== defaultChunk && (
        <div className="flex justify-center">
          <button
            onClick={() => setPageIndex(defaultChunk)}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Jump to today
          </button>
        </div>
      )}

      {/* Day cards */}
      <div className="space-y-2">
        {currentChunk.map((entry) => (
          <DayCard
            key={entry.dateStr}
            entry={entry}
            dailyHours={dailyHours}
            certificationId={plan.certification_id}
            sectionIndex={sectionIndexMap[entry.section.name] ?? 0}
          />
        ))}
      </div>

      {currentChunk.length >= 7 && <NavBar scrollTop />}
    </div>
  )
}
