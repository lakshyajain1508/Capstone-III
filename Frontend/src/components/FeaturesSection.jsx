import { motion } from 'framer-motion'
import { BarChart3, Cpu, Leaf } from 'lucide-react'

const MotionArticle = motion.article

const features = [
  {
    title: 'CPU Scheduling Simulation',
    description: 'Model realtime process execution across classic and energy-aware dispatch strategies.',
    icon: Cpu,
  },
  {
    title: 'Energy Consumption Analysis',
    description: 'Track power usage, CPU frequency impact, and efficiency gains in a single view.',
    icon: Leaf,
  },
  {
    title: 'Algorithm Performance Comparison',
    description: 'Benchmark waiting time, turnaround, utilization, and energy metrics side by side.',
    icon: BarChart3,
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="section-shell pt-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="data-pill">Feature Overview</span>
        <h2 className="mt-6 font-['Sora'] text-4xl font-bold text-slate-950 sm:text-5xl">
          Everything needed for a professional scheduling demo
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Built to present scheduling behaviour, energy impact, and performance tradeoffs with a polished product feel.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <MotionArticle
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10, scale: 1.01 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              viewport={{ once: true, amount: 0.35 }}
              className="glass-panel neon-border group rounded-[1.75rem] p-7"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-purple-500 text-white shadow-neon transition duration-300 group-hover:scale-110">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-['Sora'] text-2xl font-semibold text-slate-950">{feature.title}</h3>
              <p className="mt-3 text-base leading-7 text-slate-600">{feature.description}</p>
              <div className="mt-6 h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 opacity-70" />
            </MotionArticle>
          )
        })}
      </div>
    </section>
  )
}
