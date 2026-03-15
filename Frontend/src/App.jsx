import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import LandingPage from './pages/LandingPage'

const MotionDiv = motion.div

const pageTransition = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -24,
    transition: { duration: 0.32, ease: [0.4, 0, 1, 1] },
  },
}

function AmbientBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-[-8rem] top-[10rem] h-72 w-72 rounded-full bg-blue-400/25 blur-3xl" />
      <div className="absolute right-[-5rem] top-[8rem] h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="absolute bottom-[-10rem] left-1/3 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl" />
      <div className="absolute inset-0 bg-hero-grid bg-[size:42px_42px] opacity-40" />
    </div>
  )
}

export default function App() {
  const [activePage, setActivePage] = useState('landing')

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AmbientBackdrop />
      <AnimatePresence mode="wait">
        <MotionDiv
          key={activePage}
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative z-10"
        >
          {activePage === 'landing' ? (
            <LandingPage onRunSimulation={() => setActivePage('dashboard')} />
          ) : (
            <Dashboard onBackHome={() => setActivePage('landing')} />
          )}
        </MotionDiv>
      </AnimatePresence>
    </div>
  )
}
