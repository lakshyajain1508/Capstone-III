import { useId } from 'react'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const MotionDiv = motion.div

const chartStyle = {
  fontSize: 11,
  fill: '#475569',
}

const algoShortNames = {
  'FCFS': 'FCFS',
  'SJF': 'SJF',
  'Round Robin': 'R.Robin',
  'Energy Aware Scheduler': 'EA Sched.',
}

export default function EnergyChart({ energySeries = [], utilizationSeries = [] }) {
  const uid = useId().replace(/:/g, '')
  const barGradId = `bar${uid}`
  const areaGradId = `area${uid}`

  return (
    <div className="glass-panel neon-border rounded-[2rem] p-4 sm:p-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-600">Energy graph</p>
        <h3 className="mt-2 font-['Sora'] text-xl sm:text-2xl font-bold text-slate-950">Consumption &amp; utilization</h3>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <MotionDiv initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[1.75rem] bg-white/70 p-3 sm:p-4">
          <p className="mb-3 text-sm font-medium text-slate-700">Energy per algorithm (Joules)</p>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={energySeries} margin={{ top: 8, right: 12, left: -10, bottom: 56 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis
                  dataKey="algorithm"
                  tick={chartStyle}
                  angle={-32}
                  textAnchor="end"
                  interval={0}
                  tickFormatter={(v) => algoShortNames[v] ?? v}
                  height={68}
                />
                <YAxis tick={chartStyle} width={36} />
                <Tooltip formatter={(value) => [`${value} J`, 'Energy']} labelFormatter={(l) => l} />
                <defs>
                  <linearGradient id={barGradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="55%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <Bar dataKey="energy" radius={[10, 10, 4, 4]} fill={`url(#${barGradId})`} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MotionDiv>

        <MotionDiv initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[1.75rem] bg-white/70 p-3 sm:p-4">
          <p className="mb-3 text-sm font-medium text-slate-700">CPU utilization over time (%)</p>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={utilizationSeries} margin={{ top: 8, right: 12, left: -10, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="time" tick={chartStyle} />
                <YAxis tick={chartStyle} domain={[0, 100]} width={36} />
                <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                <defs>
                  <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="utilization"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  fill={`url(#${areaGradId})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </MotionDiv>
      </div>
    </div>
  )
}
