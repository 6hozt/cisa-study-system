import { useEffect, useState } from 'react'

export default function CircularProgress({ percentage = 0, size = 220, strokeWidth = 14, color = '#6366f1' }) {
  const [animated, setAnimated] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (animated / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])

  const trackColor = '#1e293b'
  const glowId = `glow-${Math.random().toString(36).slice(2, 7)}`

  const statusColor =
    percentage >= 80 ? '#10b981' :
    percentage >= 40 ? color :
    percentage >= 20 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={`gradient-${glowId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${glowId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter={`url(#${glowId})`}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-white tabular-nums leading-none">
          {Math.round(animated)}
        </span>
        <span className="text-lg text-slate-400 font-medium mt-1">%</span>
        <span className="text-xs text-slate-500 mt-1 font-medium">complete</span>
      </div>
    </div>
  )
}
