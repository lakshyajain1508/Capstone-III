import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

const initialForm = {
  processId: 'P5',
  arrivalTime: 0,
  burstTime: 4,
  priority: 2,
  cpuFrequency: 2.1,
}

function InputField({ label, type = 'text', value, onChange, min, step }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        min={min}
        step={step}
        onChange={onChange}
        className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200"
      />
    </label>
  )
}

export default function ProcessForm({ processes, onAddProcess, onClearProcesses }) {
  const [form, setForm] = useState(initialForm)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    onAddProcess({
      processId: form.processId.trim() || `P${processes.length + 1}`,
      arrivalTime: Number(form.arrivalTime),
      burstTime: Number(form.burstTime),
      priority: Number(form.priority),
      cpuFrequency: Number(form.cpuFrequency),
    })

    setForm({
      ...initialForm,
      processId: `P${processes.length + 2}`,
    })
  }

  return (
    <div className="glass-panel neon-border rounded-[2rem] p-6 lg:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-600">Process input panel</p>
          <h2 className="mt-2 font-['Sora'] text-2xl font-bold text-slate-950">Configure workloads</h2>
        </div>
        <span className="data-pill">{processes.length} active processes</span>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <InputField
          label="Process ID"
          value={form.processId}
          onChange={(event) => updateField('processId', event.target.value)}
        />
        <InputField
          label="Arrival Time"
          type="number"
          min="0"
          value={form.arrivalTime}
          onChange={(event) => updateField('arrivalTime', event.target.value)}
        />
        <InputField
          label="Burst Time"
          type="number"
          min="1"
          value={form.burstTime}
          onChange={(event) => updateField('burstTime', event.target.value)}
        />
        <InputField
          label="Priority"
          type="number"
          min="1"
          value={form.priority}
          onChange={(event) => updateField('priority', event.target.value)}
        />
        <InputField
          label="CPU Frequency"
          type="number"
          min="0.8"
          step="0.1"
          value={form.cpuFrequency}
          onChange={(event) => updateField('cpuFrequency', event.target.value)}
        />

        <div className="sm:col-span-2 xl:col-span-5 flex flex-col gap-3 sm:flex-row">
          <button type="submit" className="glow-button gap-2">
            <Plus className="h-4 w-4" />
            Add Process
          </button>
          <button type="button" onClick={onClearProcesses} className="glow-button-secondary gap-2">
            <Trash2 className="h-4 w-4 text-pink-500" />
            Clear Processes
          </button>
        </div>
      </form>

      <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-white/60">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white/65 text-left text-sm text-slate-700">
            <thead className="bg-slate-900 text-xs uppercase tracking-[0.2em] text-slate-200">
              <tr>
                <th className="px-4 py-4 font-medium">Process ID</th>
                <th className="px-4 py-4 font-medium">Arrival Time</th>
                <th className="px-4 py-4 font-medium">Burst Time</th>
                <th className="px-4 py-4 font-medium">Priority</th>
                <th className="px-4 py-4 font-medium">CPU Frequency</th>
              </tr>
            </thead>
            <tbody>
              {processes.length ? (
                processes.map((process) => (
                  <tr key={`${process.processId}-${process.arrivalTime}`} className="border-t border-white/60 transition hover:bg-cyan-50/70">
                    <td className="px-4 py-4 font-semibold text-slate-950">{process.processId}</td>
                    <td className="px-4 py-4">{process.arrivalTime}</td>
                    <td className="px-4 py-4">{process.burstTime}</td>
                    <td className="px-4 py-4">{process.priority}</td>
                    <td className="px-4 py-4 text-cyan-700">{process.cpuFrequency} GHz</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    Add processes to start the simulation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
