export default function ComparisonTable({ rows = [] }) {
  return (
    <div className="glass-panel neon-border rounded-[2rem] p-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-600">Algorithm comparison</p>
        <h3 className="mt-2 font-['Sora'] text-2xl font-bold text-slate-950">Performance summary table</h3>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/60">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white/70 text-left text-sm text-slate-700">
            <thead className="bg-slate-950 text-xs uppercase tracking-[0.22em] text-slate-200">
              <tr>
                <th className="px-4 py-4 font-medium">Algorithm</th>
                <th className="px-4 py-4 font-medium">Average Waiting Time</th>
                <th className="px-4 py-4 font-medium">Turnaround Time</th>
                <th className="px-4 py-4 font-medium">Energy Usage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.algorithm} className="border-t border-white/60 transition hover:bg-cyan-50/80">
                  <td className="px-4 py-4 font-semibold text-slate-950">{row.algorithm}</td>
                  <td className="px-4 py-4">{row.averageWaitingTime} ms</td>
                  <td className="px-4 py-4">{row.turnaroundTime} ms</td>
                  <td className="px-4 py-4 text-cyan-700">{row.energyUsage} J</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
