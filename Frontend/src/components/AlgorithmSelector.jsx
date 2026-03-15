import { motion } from 'framer-motion'
import { Activity, Cpu, Leaf, Shuffle } from 'lucide-react'

const MotionButton = motion.button

const iconMap = {
  FCFS: Activity,
  SJF: Shuffle,
  'Round Robin': Cpu,
  'Energy Aware Scheduler': Leaf,
}

export default function AlgorithmSelector({ algorithms, selectedAlgorithm, onSelect }) {
  return (
    <div className="glass-panel neon-border rounded-[2rem] p-6 lg:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-600">Algorithm selection</p>
          <h2 className="mt-2 font-['Sora'] text-2xl font-bold text-slate-950">Choose scheduling logic</h2>
        </div>
        <span className="data-pill">Selected: {selectedAlgorithm}</span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {algorithms.map((algorithm, index) => {
          const Icon = iconMap[algorithm] || Cpu
          const isSelected = algorithm === selectedAlgorithm

          return (
            <MotionButton
              key={algorithm}
              type="button"
              onClick={() => onSelect(algorithm)}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
              viewport={{ once: true }}
              className={`relative overflow-hidden rounded-[1.75rem] border px-5 py-6 text-left transition ${
                isSelected
                  ? 'border-transparent bg-slate-950 text-white shadow-[0_16px_40px_rgba(15,23,42,0.22)]'
                  : 'border-white/60 bg-white/70 text-slate-900 hover:border-cyan-200 hover:bg-white'
              }`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400'
                    : 'bg-gradient-to-r from-blue-200 via-cyan-200 to-purple-200'
                }`}
              />
              <div className="flex items-start justify-between gap-3">
                <div className={`rounded-2xl p-3 ${isSelected ? 'bg-white/10' : 'bg-slate-900 text-white'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                {isSelected ? (
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-medium text-emerald-300">
                    Active
                  </span>
                ) : null}
              </div>
              <h3 className="mt-5 font-['Sora'] text-lg font-semibold">{algorithm}</h3>
              <p className={`mt-2 text-sm ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                {algorithm === 'Energy Aware Scheduler'
                  ? 'Balances waiting time with lower CPU energy cost.'
                  : 'Run this strategy to compare scheduling behavior and efficiency.'}
              </p>
              {isSelected ? <div className="pulse-glow absolute inset-0 rounded-[1.75rem] border border-cyan-300/40" /> : null}
            </MotionButton>
          )
        })}
      </div>
    </div>
  )
}
