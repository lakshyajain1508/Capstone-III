import { useState } from 'react'
import { Activity, Clock3, Gauge, Leaf } from 'lucide-react'
import AlgorithmSelector from '../components/AlgorithmSelector'
import ComparisonTable from '../components/ComparisonTable'
import EnergyChart from '../components/EnergyChart'
import Footer from '../components/Footer'
import GanttChart from '../components/GanttChart'
import MetricsCard from '../components/MetricsCard'
import Navbar from '../components/Navbar'
import ProcessForm from '../components/ProcessForm'
import SimulationButton from '../components/SimulationButton'
import { createDemoSimulation, defaultProcesses, simulateScheduling } from '../services/api'

const algorithms = ['FCFS', 'SJF', 'Round Robin', 'Energy Aware Scheduler']

export default function Dashboard({ onBackHome }) {
  const [processes, setProcesses] = useState(defaultProcesses)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('Energy Aware Scheduler')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(() => createDemoSimulation(defaultProcesses, 'Energy Aware Scheduler'))

  const handleAddProcess = (process) => {
    setProcesses((current) => [...current, process])
  }

  const handleClearProcesses = () => {
    setProcesses([])
    setResults(null)
  }

  const handleRunSimulation = async () => {
    if (!processes.length) {
      return
    }

    setLoading(true)
    const nextResults = await simulateScheduling(processes, selectedAlgorithm)
    setResults(nextResults)
    setLoading(false)
  }

  const metricCards = results
    ? [
        {
          label: 'Average Waiting Time',
          value: results.metrics.averageWaitingTime,
          icon: Clock3,
          accent: 'from-blue-500 to-cyan-400',
        },
        {
          label: 'Turnaround Time',
          value: results.metrics.turnaroundTime,
          icon: Activity,
          accent: 'from-purple-500 to-pink-500',
        },
        {
          label: 'CPU Utilization',
          value: results.metrics.cpuUtilization,
          icon: Gauge,
          accent: 'from-sky-500 to-indigo-500',
        },
        {
          label: 'Energy Consumption',
          value: results.metrics.energyConsumption,
          icon: Leaf,
          accent: 'from-emerald-400 to-lime-400',
        },
      ]
    : []

  return (
    <div>
      <Navbar mode="dashboard" onBackHome={onBackHome} />

      <main className="section-shell pt-10">
        <section id="dashboard" className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <ProcessForm
            processes={processes}
            onAddProcess={handleAddProcess}
            onClearProcesses={handleClearProcesses}
          />

          <div className="space-y-6">
            <div className="glass-panel neon-border rounded-[2rem] p-6 lg:p-7">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-600">Dashboard overview</p>
              <h1 className="mt-2 font-['Sora'] text-3xl font-bold text-slate-950 sm:text-4xl">
                Scheduler simulator dashboard
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Compare scheduling algorithms, review execution order, and surface efficiency gains in a single monitoring workspace.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-white/80 p-5">
                  <p className="text-sm text-slate-500">Active algorithm</p>
                  <p className="mt-2 font-['Sora'] text-lg font-semibold text-slate-950">{selectedAlgorithm}</p>
                </div>
                <div className="rounded-[1.5rem] bg-white/80 p-5">
                  <p className="text-sm text-slate-500">Current best energy score</p>
                  <p className="mt-2 font-['Sora'] text-lg font-semibold text-slate-950">
                    {results ? results.summary.greenest : 'Run simulation'}
                  </p>
                </div>
              </div>
            </div>

            <SimulationButton loading={loading} onRun={handleRunSimulation} disabled={!processes.length || loading} />
          </div>
        </section>

        <section id="algorithms" className="pt-8">
          <AlgorithmSelector
            algorithms={algorithms}
            selectedAlgorithm={selectedAlgorithm}
            onSelect={setSelectedAlgorithm}
          />
        </section>

        <section id="results" className="pt-8">
          <div className="space-y-6">
            <GanttChart segments={results?.segments || []} />
            <EnergyChart
              energySeries={results?.energySeries || []}
              utilizationSeries={results?.utilizationSeries || []}
            />
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((metric) => (
              <MetricsCard
                key={metric.label}
                icon={metric.icon}
                label={metric.label}
                value={metric.value}
                accent={metric.accent}
              />
            ))}
          </div>

          <div className="mt-6">
            <ComparisonTable rows={results?.comparisonRows || []} />
          </div>
        </section>

        <section id="about" className="pt-8">
          <div className="glass-panel rounded-[2rem] p-8 lg:p-10">
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-600">Simulator insight</p>
                <h2 className="mt-3 font-['Sora'] text-3xl font-bold text-slate-950">
                  Compare algorithm quality through both speed and energy cost
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-white/80 p-5">
                  <p className="text-sm text-slate-500">Fastest queue handling</p>
                  <p className="mt-2 font-['Sora'] text-lg font-semibold text-slate-950">
                    {results ? results.summary.fastest : 'N/A'}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-white/80 p-5">
                  <p className="text-sm text-slate-500">Lowest energy usage</p>
                  <p className="mt-2 font-['Sora'] text-lg font-semibold text-slate-950">
                    {results ? results.summary.greenest : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
