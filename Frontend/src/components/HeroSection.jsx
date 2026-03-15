import { motion } from 'framer-motion'
import { ArrowRight, CircuitBoard, Gauge, Leaf, Sparkles, Zap } from 'lucide-react'

const MotionDiv = motion.div

const floatingCards = [
  {
    title: 'Energy Optimized',
    value: '18.4% lower power',
    icon: Leaf,
    className: 'left-2 top-12 md:left-12',
  },
  {
    title: 'CPU Monitor',
    value: '94% utilization',
    icon: Gauge,
    className: 'right-4 top-6 md:right-16',
  },
  {
    title: 'Smart Dispatch',
    value: 'Realtime kernel timeline',
    icon: CircuitBoard,
    className: 'bottom-6 left-8 md:left-24',
  },
]

export default function HeroSection({ onRunSimulation }) {
  return (
    <section id="home" className="section-shell relative pt-10 sm:pt-16 lg:pt-20">
      <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
        <MotionDiv
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <span className="data-pill mb-6">
            <Sparkles className="h-4 w-4 text-fuchsia-500" />
            Bright AI-inspired scheduling interface
          </span>
          <h1 className="max-w-3xl font-['Sora'] text-5xl font-extrabold leading-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Energy Aware <span className="text-gradient">CPU Scheduling</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            A smart CPU scheduling simulator that compares traditional algorithms with
            energy-efficient optimization techniques.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button type="button" onClick={onRunSimulation} className="glow-button gap-2 text-base">
              Run Simulation
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="glow-button-secondary gap-2 text-base"
            >
              Explore Features
              <Zap className="h-5 w-5 text-cyan-500" />
            </button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Algorithms', value: '4' },
              { label: 'Energy Savings', value: 'Up to 24%' },
              { label: 'Simulation Ready', value: 'Live dashboard' },
            ].map((item) => (
              <div key={item.label} className="glass-panel rounded-3xl px-5 py-4">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 font-['Sora'] text-xl font-bold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative"
        >
          <div className="glass-panel neon-border relative overflow-hidden rounded-[2rem] p-6 shadow-glow">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-cyan-300/10 to-purple-400/10" />
            <div className="relative rounded-[1.75rem] bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Kernel monitor</p>
                  <p className="mt-1 font-['Sora'] text-lg font-semibold">Adaptive scheduler core</p>
                </div>
                <div className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs text-emerald-300">
                  Active
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Frequency', value: '2.4 GHz', color: 'from-cyan-400 to-blue-500' },
                  { label: 'Processes', value: '12 queued', color: 'from-fuchsia-400 to-pink-500' },
                  { label: 'Eco Score', value: '92 / 100', color: 'from-emerald-400 to-lime-400' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className={`h-1.5 rounded-full bg-gradient-to-r ${item.color}`} />
                    <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-400">{item.label}</p>
                    <p className="mt-2 font-['Sora'] text-lg font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-200">Execution pulse</p>
                  <span className="text-xs text-slate-400">Round Robin vs Energy Aware</span>
                </div>
                <div className="mt-5 grid grid-cols-10 gap-2">
                  {[...Array(10)].map((_, index) => (
                    <MotionDiv
                      key={index}
                      className="h-20 rounded-2xl bg-gradient-to-t from-blue-500 via-cyan-400 to-purple-500"
                      animate={{ opacity: [0.45, 1, 0.45], scaleY: [0.7, 1, 0.8] }}
                      transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.08 }}
                      style={{ transformOrigin: 'bottom' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {floatingCards.map((card, index) => {
            const Icon = card.icon
            return (
              <MotionDiv
                key={card.title}
                className={`glass-panel float-card absolute hidden rounded-2xl px-4 py-3 shadow-glow lg:block ${card.className}`}
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4.4 + index, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-purple-500 p-2 text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{card.title}</p>
                    <p className="font-medium text-slate-900">{card.value}</p>
                  </div>
                </div>
              </MotionDiv>
            )
          })}
        </MotionDiv>
      </div>
    </section>
  )
}
