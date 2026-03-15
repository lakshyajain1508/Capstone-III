import { motion } from 'framer-motion'
import { Cpu } from 'lucide-react'

const MotionDiv = motion.div

export default function GanttChart({ segments = [] }) {
  return (
    <div className="glass-panel neon-border rounded-[2rem] p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-600">Gantt chart monitor</p>
          <h3 className="mt-2 font-['Sora'] text-2xl font-bold text-slate-950">OS kernel timeline</h3>
        </div>
        <div className="rounded-2xl bg-slate-950 p-3 text-cyan-300">
          <Cpu className="h-5 w-5" />
        </div>
      </div>

      <div className="monitor-grid mt-6 rounded-[1.75rem] bg-slate-950 p-4 sm:p-5 text-white">
        {segments.length ? (
          <>
            <p className="mb-2 text-right text-[11px] text-slate-500 sm:hidden">← swipe to scroll →</p>
            <div className="overflow-x-auto pb-2">
              <div style={{ minWidth: Math.max(segments.length * 80, 300) + 'px' }}>
                <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  {segments.map((segment, index) => (
                    <MotionDiv
                      key={`${segment.processId}-${segment.start}-${segment.end}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{ flex: Math.max(segment.duration, 1) }}
                      className={`relative border-r border-slate-900/40 px-2 sm:px-3 py-3 sm:py-5 ${
                        segment.processId === 'IDLE'
                          ? 'bg-slate-800 text-slate-300'
                          : `bg-gradient-to-r ${segment.color} shadow-[0_0_20px_rgba(34,211,238,0.14)]`
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-['Sora'] text-sm font-semibold leading-none">{segment.processId}</span>
                        {segment.processId !== 'IDLE' && segment.duration > 1 ? (
                          <span className="hidden sm:inline rounded-full bg-black/20 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em]">
                            {segment.frequency}GHz
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-[10px] text-white/60">
                        {segment.duration}u
                      </p>
                    </MotionDiv>
                  ))}
                </div>

                <div className="mt-3 flex text-[11px] text-cyan-100/80">
                  {segments.map((segment, index) => (
                    <div key={`${segment.start}-${segment.end}-${index}`} style={{ flex: Math.max(segment.duration, 1) }} className="relative">
                      <span>{segment.start}</span>
                      {index === segments.length - 1 ? <span className="absolute right-0">{segment.end}</span> : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 px-5 py-12 text-center text-slate-300">
            Add processes and run a simulation to render the execution timeline.
          </div>
        )}
      </div>
    </div>
  )
}
