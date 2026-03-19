/**
 * Generates a day-by-day study schedule from an exam plan.
 *
 * Strategy: distribute days across sections proportionally to their
 * recommended hours, starting from today and stopping at the exam date.
 */

export function generateStudyPlan(plan) {
  if (!plan?.sections?.length || !plan.exam_date) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const examDate = new Date(plan.exam_date + 'T00:00:00')
  const totalDaysAvailable = Math.max(
    1,
    Math.ceil((examDate - today) / (1000 * 60 * 60 * 24))
  )

  const totalRecommendedHours = plan.sections.reduce(
    (sum, s) => sum + s.recommendedHours,
    0
  )

  // Allocate days per section proportionally to recommended hours.
  // Ensure every section gets at least 1 day.
  const rawAllocations = plan.sections.map((s) => ({
    ...s,
    rawDays: (s.recommendedHours / totalRecommendedHours) * totalDaysAvailable,
  }))

  // Floor all, then distribute remaining days to those with largest remainders
  let allocated = rawAllocations.map((s) => ({
    ...s,
    days: Math.max(1, Math.floor(s.rawDays)),
  }))
  let usedDays = allocated.reduce((sum, s) => sum + s.days, 0)
  const remainder = totalDaysAvailable - usedDays

  if (remainder > 0) {
    const sorted = [...allocated]
      .map((s, i) => ({ i, frac: s.rawDays - Math.floor(s.rawDays) }))
      .sort((a, b) => b.frac - a.frac)
    for (let k = 0; k < remainder && k < sorted.length; k++) {
      allocated[sorted[k].i].days += 1
    }
  }

  // Build the flat day list
  const schedule = []
  let currentDate = new Date(today)

  for (const section of allocated) {
    for (let d = 0; d < section.days; d++) {
      if (currentDate >= examDate) break
      schedule.push({
        date: new Date(currentDate),
        dateStr: currentDate.toISOString().split('T')[0],
        section,
        dayNumber: schedule.length + 1,
        isPast: currentDate < today,
        isToday: currentDate.toDateString() === today.toDateString(),
      })
      currentDate = new Date(currentDate)
      currentDate.setDate(currentDate.getDate() + 1)
    }
    if (currentDate >= examDate) break
  }

  return schedule
}

/** Converts a decimal hour count into { video, practice, review } time strings. */
export function getTimeBreakdown(dailyHours) {
  const total = Math.max(0.25, dailyHours)
  const videoMins = Math.round(total * 0.50 * 60)
  const practiceMins = Math.round(total * 0.33 * 60)
  // Review gets whatever is left (avoids rounding gaps summing weirdly)
  const reviewMins = Math.max(5, Math.round(total * 60) - videoMins - practiceMins)

  return {
    video: formatMins(videoMins),
    practice: formatMins(practiceMins),
    review: formatMins(reviewMins),
  }
}

function formatMins(mins) {
  if (mins <= 0) return '5min'
  if (mins < 60) return `${mins}min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}hr ${m}min` : `${h}hr`
}

/** Groups a flat schedule array into chunks of `size` days (for pagination). */
export function chunkSchedule(schedule, size = 14) {
  const chunks = []
  for (let i = 0; i < schedule.length; i += size) {
    chunks.push(schedule.slice(i, i + size))
  }
  return chunks
}

/** Returns the index of the chunk that contains today. */
export function todayChunkIndex(chunks) {
  const todayStr = new Date().toISOString().split('T')[0]
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i].some((d) => d.dateStr === todayStr)) return i
  }
  return 0
}
