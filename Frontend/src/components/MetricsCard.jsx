import { motion } from 'framer-motion'

const MotionDiv = motion.div

export default function MetricsCard({ icon, label, value, accent }) {
  const Icon = icon

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true }}
      className="glass-panel rounded-[1.75rem] p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <div className={`rounded-2xl bg-gradient-to-br ${accent} p-3 text-white shadow-lg`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-6 font-['Sora'] text-3xl font-bold text-slate-950">{value}</p>
    </MotionDiv>
  )
}
