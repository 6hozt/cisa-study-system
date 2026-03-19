import { supabase } from './supabase'

// ─── User Profile ───────────────────────────────────────────────────────────

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function upsertUserProfile(profile) {
  // The trigger already inserts the row on signup, so we only need to UPDATE.
  // Using upsert with RLS requires both INSERT + SELECT simultaneously which
  // fails in Supabase — a plain update avoids that entirely.
  const { id, ...fields } = profile
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

// ─── User Exam Plan ──────────────────────────────────────────────────────────

export async function getUserExamPlan(userId) {
  const { data, error } = await supabase
    .from('exam_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return { data, error }
}

export async function createExamPlan(plan) {
  const { data, error } = await supabase
    .from('exam_plans')
    .insert(plan)
    .select()
    .single()
  return { data, error }
}

export async function updateExamPlan(planId, updates) {
  const { data, error } = await supabase
    .from('exam_plans')
    .update(updates)
    .eq('id', planId)
    .select()
    .single()
  return { data, error }
}

// ─── Study Sessions ──────────────────────────────────────────────────────────

export async function getStudySessions(planId) {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('plan_id', planId)
    .order('session_date', { ascending: false })
  return { data, error }
}

export async function logStudySession(session) {
  const { data, error } = await supabase
    .from('study_sessions')
    .insert(session)
    .select()
    .single()
  return { data, error }
}

export async function deleteStudySession(sessionId) {
  const { error } = await supabase
    .from('study_sessions')
    .delete()
    .eq('id', sessionId)
  return { error }
}

// ─── Section Progress ────────────────────────────────────────────────────────

export async function getSectionProgress(planId) {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('section_name, hours_spent')
    .eq('plan_id', planId)
  if (error) return { data: null, error }

  // Aggregate by section
  const aggregated = {}
  for (const session of data || []) {
    if (!aggregated[session.section_name]) {
      aggregated[session.section_name] = 0
    }
    aggregated[session.section_name] += session.hours_spent
  }
  return { data: aggregated, error: null }
}

// ─── Heatmap Data ────────────────────────────────────────────────────────────

export async function getHeatmapData(planId, daysBack = 84) {
  const since = new Date()
  since.setDate(since.getDate() - daysBack)

  const { data, error } = await supabase
    .from('study_sessions')
    .select('session_date, hours_spent')
    .eq('plan_id', planId)
    .gte('session_date', since.toISOString().split('T')[0])

  if (error) return { data: null, error }

  const heatmap = {}
  for (const session of data || []) {
    const date = session.session_date
    heatmap[date] = (heatmap[date] || 0) + session.hours_spent
  }
  return { data: heatmap, error: null }
}
