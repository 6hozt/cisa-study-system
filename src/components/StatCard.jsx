export default function StatCard({ label, value, sub, icon, color = 'indigo', trend }) {
  const colorMap = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  }
  const cls = colorMap[color] || colorMap.indigo

  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-3 hover:bg-slate-800/60 transition-all duration-200">
      {icon && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cls} text-lg`}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${cls.split(' ')[0]}`}>{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={`text-xs font-medium flex items-center gap-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs last week
        </div>
      )}
    </div>
  )
}
