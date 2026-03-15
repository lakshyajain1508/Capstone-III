import { AnimatePresence, motion } from 'framer-motion'
import { Cpu, Menu, X } from 'lucide-react'
import { useState } from 'react'

const MotionDiv = motion.div

const navConfig = {
  landing: [
    { label: 'Home', section: 'home' },
    { label: 'Features', section: 'features' },
    { label: 'Simulator', section: 'simulator' },
    { label: 'About', section: 'about' },
  ],
  dashboard: [
    { label: 'Dashboard', section: 'dashboard' },
    { label: 'Algorithms', section: 'algorithms' },
    { label: 'Results', section: 'results' },
    { label: 'About', section: 'about' },
  ],
}

function scrollToSection(section) {
  document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Navbar({ mode = 'landing', onRunSimulation, onBackHome }) {
  const [isOpen, setIsOpen] = useState(false)
  const items = navConfig[mode]

  const handleNavigate = (item) => {
    if (mode === 'landing' && item.label === 'Simulator' && onRunSimulation) {
      onRunSimulation()
    } else {
      scrollToSection(item.section)
    }

    setIsOpen(false)
  }

  return (
    <div className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <nav className="glass-panel neon-border mx-auto flex max-w-7xl items-center justify-between rounded-full px-5 py-3">
        <button
          type="button"
          onClick={mode === 'dashboard' ? onBackHome : () => scrollToSection('home')}
          className="flex items-center gap-3 text-left"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-purple-500 text-white shadow-lg shadow-cyan-500/20">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <p className="font-['Sora'] text-sm font-semibold tracking-wide text-slate-900 sm:text-base">
              Energy Aware CPU Scheduling
            </p>
            <p className="hidden text-xs text-slate-500 sm:block">
              {mode === 'landing' ? 'Futuristic scheduling simulator' : 'System monitoring dashboard'}
            </p>
          </div>
        </button>

        <div className="hidden items-center gap-7 md:flex">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNavigate(item)}
              className="group relative text-sm font-medium text-slate-700 transition hover:text-slate-950"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </div>

        <div className="hidden md:block">
          <span className="data-pill">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {mode === 'landing' ? 'Live product demo' : 'Realtime simulation'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/70 text-slate-800 md:hidden"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen ? (
          <MotionDiv
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="glass-panel neon-border mx-auto mt-3 max-w-7xl rounded-3xl p-4 md:hidden"
          >
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavigate(item)}
                  className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-white/70 hover:text-slate-950"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </MotionDiv>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
