import { useState } from 'react'
import { logStudySession } from '../lib/database'
import { useAuth } from '../contexts/AuthContext'

export default function LogSessionModal({ plan, onClose, onLogged }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    section: plan?.sections?.[0]?.name || '',
    hours: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.hours || Number(form.hours) <= 0) {
      setError('Please enter a valid number of hours.')
      return
    }
    if (!form.section) {
      setError('Please select a section.')
      return
    }
    setSaving(true)
    setError('')

    const { error: dbError } = await logStudySession({
      plan_id: plan.id,
      user_id: user.id,
      section_name: form.section,
      hours_spent: Number(form.hours),
      session_date: form.date,
      note: form.note || null,
    })

    setSaving(false)
    if (dbError) {
      setError(dbError.message)
    } else {
      onLogged()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-white">Log Study Session</h2>
            <p className="text-slate-400 text-sm mt-0.5">{plan?.certification_name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Section */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Section</label>
            <select
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {plan?.sections?.map((s) => (
                <option key={s.name} value={s.name}>{s.name} — {s.fullName}</option>
              ))}
            </select>
          </div>

          {/* Hours */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Hours Studied</label>
            <div className="relative">
              <input
                type="number"
                min="0.25"
                max="24"
                step="0.25"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. 2.5"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">hrs</span>
            </div>
            {/* Quick-select buttons */}
            <div className="flex gap-2 mt-2">
              {[0.5, 1, 1.5, 2, 3, 4].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setForm({ ...form, hours: String(h) })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${form.hours === String(h)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
            <input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Note <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="What did you focus on? Any breakthroughs?"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-semibold transition-all shadow-lg shadow-indigo-500/20 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : '+ Log Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
