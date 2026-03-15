import { motion } from 'framer-motion'
import { LoaderCircle, Play } from 'lucide-react'

const MotionButton = motion.button

export default function SimulationButton({ loading, onRun, disabled }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] bg-slate-950 px-6 py-8 text-center text-white shadow-[0_25px_60px_rgba(15,23,42,0.26)]">
      <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Simulation control</p>
      <h3 className="mt-3 font-['Sora'] text-2xl font-bold">Run Scheduling Simulation</h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
        Execute the selected algorithm, animate the timeline, and update all energy and performance panels.
      </p>
      <MotionButton
        type="button"
        whileHover={{ scale: disabled ? 1 : 1.03 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onClick={onRun}
        disabled={disabled}
        className="mt-6 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-8 py-4 font-semibold text-white shadow-[0_18px_45px_rgba(168,85,247,0.32)] transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
        {loading ? 'Running Simulation...' : 'Run Scheduling Simulation'}
      </MotionButton>
    </div>
  )
}
