export default function Footer() {
  return (
    <footer className="section-shell pb-10 pt-16">
      <div className="h-px w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500" />
      <div className="mt-6 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-['Sora'] text-base font-semibold text-slate-900">Energy Aware CPU Scheduling</p>
          <p>Capstone Project - Operating Systems & Analysis of Algorithms</p>
        </div>
        <p>Bright scheduling intelligence for modern systems demos.</p>
      </div>
    </footer>
  )
}
