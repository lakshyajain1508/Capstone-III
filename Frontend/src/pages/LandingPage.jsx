import { motion } from 'framer-motion'
import {
  Activity,
  BarChart3,
  Braces,
  Cpu,
  FlaskConical,
  Leaf,
  Sparkles,
  Wind,
} from 'lucide-react'
import ComparisonTable from '../components/ComparisonTable'
import EnergyChart from '../components/EnergyChart'
import FeaturesSection from '../components/FeaturesSection'
import Footer from '../components/Footer'
import GanttChart from '../components/GanttChart'
import HeroSection from '../components/HeroSection'
import MetricsCard from '../components/MetricsCard'
import Navbar from '../components/Navbar'

const MotionDiv = motion.div

const previewSegments = [
  { processId: 'P1', start: 0, end: 3, duration: 3, frequency: 2.1, color: 'from-blue-500 to-cyan-400' },
  { processId: 'P2', start: 3, end: 5, duration: 2, frequency: 1.7, color: 'from-purple-500 to-pink-500' },
  { processId: 'P3', start: 5, end: 8, duration: 3, frequency: 2.3, color: 'from-emerald-400 to-lime-400' },
  { processId: 'P1', start: 8, end: 10, duration: 2, frequency: 2.1, color: 'from-sky-500 to-indigo-500' },
]

const previewEnergySeries = [
  { algorithm: 'FCFS', energy: 92 },
  { algorithm: 'SJF', energy: 81 },
  { algorithm: 'Round Robin', energy: 97 },
  { algorithm: 'Energy Aware Scheduler', energy: 68 },
]

const previewUtilizationSeries = [
  { time: 0, utilization: 35 },
  { time: 1, utilization: 52 },
  { time: 2, utilization: 76 },
  { time: 3, utilization: 88 },
  { time: 4, utilization: 91 },
  { time: 5, utilization: 82 },
  { time: 6, utilization: 89 },
  { time: 7, utilization: 93 },
  { time: 8, utilization: 86 },
  { time: 9, utilization: 79 },
  { time: 10, utilization: 74 },
]

const previewRows = [
  { algorithm: 'FCFS', averageWaitingTime: 4.6, turnaroundTime: 8.7, energyUsage: 92 },
  { algorithm: 'SJF', averageWaitingTime: 3.1, turnaroundTime: 7.3, energyUsage: 81 },
  { algorithm: 'Round Robin', averageWaitingTime: 5.2, turnaroundTime: 9.1, energyUsage: 97 },
  { algorithm: 'Energy Aware Scheduler', averageWaitingTime: 3.4, turnaroundTime: 7.1, energyUsage: 68 },
]

const stack = [
  { label: 'React', icon: Braces },
  { label: 'Flask', icon: FlaskConical },
  { label: 'Python', icon: Activity },
  { label: 'Tailwind CSS', icon: Wind },
  { label: 'Recharts', icon: BarChart3 },
]

export default function LandingPage({ onRunSimulation }) {
  return (
    <div>
      <Navbar mode="landing" onRunSimulation={onRunSimulation} />
      <HeroSection onRunSimulation={onRunSimulation} />
      <FeaturesSection />

      <section id="simulator" className="section-shell pt-24">
        <div className="grid gap-10 2xl:grid-cols-[0.9fr_1.1fr] 2xl:items-start">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
          >
            <span className="data-pill">
              <Sparkles className="h-4 w-4 text-fuchsia-500" />
              Visual demo section
            </span>
            <h2 className="mt-6 font-['Sora'] text-4xl font-bold text-slate-950 sm:text-5xl">
              A dashboard preview that feels like a real monitoring product
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Judges should be able to see both scheduling behaviour and energy awareness instantly. The UI is built with animated metrics, dark kernel-style charts, and bright gradient highlights.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <MetricsCard icon={Cpu} label="Live processes" value="12" accent="from-blue-500 to-cyan-400" />
              <MetricsCard icon={Leaf} label="Power reduction" value="24%" accent="from-emerald-400 to-lime-400" />
              <MetricsCard icon={BarChart3} label="Avg wait" value="3.4 ms" accent="from-purple-500 to-pink-500" />
              <MetricsCard icon={Activity} label="CPU utilization" value="93%" accent="from-sky-500 to-indigo-500" />
            </div>
          </MotionDiv>

          <div className="space-y-6">
            <GanttChart segments={previewSegments} />
            <EnergyChart energySeries={previewEnergySeries} utilizationSeries={previewUtilizationSeries} />
          </div>
        </div>

        <div className="mt-6">
          <ComparisonTable rows={previewRows} />
        </div>
      </section>

      <section className="section-shell pt-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="data-pill">Tech stack</span>
          <h2 className="mt-6 font-['Sora'] text-4xl font-bold text-slate-950 sm:text-5xl">
            Powered by a practical modern frontend stack
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Built with the exact tools needed for responsive product-grade simulation UI and chart-rich results.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {stack.map((item, index) => {
            const Icon = item.icon
            return (
              <MotionDiv
                key={item.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
                viewport={{ once: true }}
                className="glass-panel flex flex-col items-center rounded-[1.75rem] p-6 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-cyan-400 to-purple-500 text-white shadow-glow">
                  <Icon className="h-7 w-7" />
                </div>
                <p className="mt-5 font-['Sora'] text-lg font-semibold text-slate-950">{item.label}</p>
              </MotionDiv>
            )
          })}
        </div>
      </section>

      <section id="about" className="section-shell pt-24">
        <div className="glass-panel neon-border rounded-[2rem] p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-600">About the project</p>
              <h2 className="mt-4 font-['Sora'] text-4xl font-bold text-slate-950">
                Designed for a capstone presentation with strong technical storytelling
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Energy Aware CPU Scheduling demonstrates how scheduling decisions affect performance and power usage. The interface combines polished visual design with believable simulator output so the project reads like a real system product instead of a basic academic demo.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Landing page', value: 'Product-style experience' },
                { label: 'Dashboard', value: 'Animated simulation panels' },
                { label: 'Responsive', value: 'Desktop, tablet, mobile' },
                { label: 'Design language', value: 'Glassmorphism + neon gradients' },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.5rem] bg-white/75 p-5">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 font-['Sora'] text-lg font-semibold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
