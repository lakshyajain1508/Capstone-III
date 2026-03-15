import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api',
  timeout: 4000,
})

const ALGORITHMS = ['FCFS', 'SJF', 'Round Robin', 'Energy Aware Scheduler']
const ENERGY_FACTORS = {
  FCFS: 1.08,
  SJF: 0.96,
  'Round Robin': 1.12,
  'Energy Aware Scheduler': 0.8,
}
const COLORS = [
  'from-blue-500 to-cyan-400',
  'from-purple-500 to-pink-500',
  'from-emerald-400 to-lime-400',
  'from-fuchsia-500 to-rose-400',
  'from-sky-500 to-indigo-500',
  'from-orange-400 to-pink-400',
]

export const defaultProcesses = [
  { processId: 'P1', arrivalTime: 0, burstTime: 5, priority: 2, cpuFrequency: 2.2 },
  { processId: 'P2', arrivalTime: 1, burstTime: 3, priority: 1, cpuFrequency: 1.8 },
  { processId: 'P3', arrivalTime: 2, burstTime: 4, priority: 3, cpuFrequency: 2.5 },
  { processId: 'P4', arrivalTime: 4, burstTime: 2, priority: 2, cpuFrequency: 1.6 },
]

function toNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeProcesses(processes) {
  const source = Array.isArray(processes) && processes.length ? processes : defaultProcesses

  return source.map((process, index) => ({
    processId: process.processId || `P${index + 1}`,
    arrivalTime: Math.max(0, toNumber(process.arrivalTime, 0)),
    burstTime: Math.max(1, toNumber(process.burstTime, 1)),
    priority: Math.max(1, toNumber(process.priority, 1)),
    cpuFrequency: Math.max(0.8, Number(toNumber(process.cpuFrequency, 2.0).toFixed(1))),
    order: index,
  }))
}

function pushSegment(segments, processId, start, end, frequency) {
  if (end <= start) {
    return
  }

  const lastSegment = segments[segments.length - 1]
  if (lastSegment && lastSegment.processId === processId && lastSegment.end === start) {
    lastSegment.end = end
    lastSegment.duration = end - lastSegment.start
    return
  }

  segments.push({ processId, start, end, duration: end - start, frequency })
}

function decorateSegments(segments) {
  return segments.map((segment, index) => ({
    ...segment,
    color: segment.processId === 'IDLE' ? 'from-slate-700 to-slate-800' : COLORS[index % COLORS.length],
  }))
}

function summarize(processes, segments, completionTimes, algorithm) {
  const totalBurst = processes.reduce((sum, process) => sum + process.burstTime, 0)
  const totalDuration = segments.length ? segments[segments.length - 1].end : 0

  const avgWaitingTime =
    processes.reduce((sum, process) => {
      const turnaround = completionTimes[process.processId] - process.arrivalTime
      return sum + (turnaround - process.burstTime)
    }, 0) / processes.length

  const avgTurnaroundTime =
    processes.reduce((sum, process) => sum + (completionTimes[process.processId] - process.arrivalTime), 0) /
    processes.length

  const baseEnergy = segments.reduce((sum, segment) => {
    if (segment.processId === 'IDLE') {
      return sum
    }

    return sum + segment.duration * ((segment.frequency ** 2) * 7.8 + 3.2)
  }, 0)

  const energyUsage = Number((baseEnergy * ENERGY_FACTORS[algorithm]).toFixed(1))
  const cpuUtilization = totalDuration ? Number(((totalBurst / totalDuration) * 100).toFixed(1)) : 0

  return {
    algorithm,
    segments: decorateSegments(segments),
    totalDuration,
    avgWaitingTime: Number(avgWaitingTime.toFixed(2)),
    avgTurnaroundTime: Number(avgTurnaroundTime.toFixed(2)),
    cpuUtilization,
    energyUsage,
  }
}

function runFcfs(processes) {
  const sorted = [...processes].sort((left, right) => left.arrivalTime - right.arrivalTime || left.order - right.order)
  const segments = []
  const completionTimes = {}
  let time = 0

  sorted.forEach((process) => {
    if (time < process.arrivalTime) {
      pushSegment(segments, 'IDLE', time, process.arrivalTime, 0)
      time = process.arrivalTime
    }

    const end = time + process.burstTime
    pushSegment(segments, process.processId, time, end, process.cpuFrequency)
    completionTimes[process.processId] = end
    time = end
  })

  return summarize(processes, segments, completionTimes, 'FCFS')
}

function runSjf(processes) {
  const pending = [...processes]
  const segments = []
  const completionTimes = {}
  let time = 0

  while (pending.length) {
    const available = pending.filter((process) => process.arrivalTime <= time)

    if (!available.length) {
      const nextArrival = Math.min(...pending.map((process) => process.arrivalTime))
      pushSegment(segments, 'IDLE', time, nextArrival, 0)
      time = nextArrival
      continue
    }

    const selected = available.sort(
      (left, right) =>
        left.burstTime - right.burstTime || left.arrivalTime - right.arrivalTime || left.order - right.order,
    )[0]

    pending.splice(
      pending.findIndex((process) => process.processId === selected.processId),
      1,
    )

    const end = time + selected.burstTime
    pushSegment(segments, selected.processId, time, end, selected.cpuFrequency)
    completionTimes[selected.processId] = end
    time = end
  }

  return summarize(processes, segments, completionTimes, 'SJF')
}

function runRoundRobin(processes, quantum = 2) {
  const sorted = [...processes].sort((left, right) => left.arrivalTime - right.arrivalTime || left.order - right.order)
  const queue = []
  const segments = []
  const completionTimes = {}
  const remaining = Object.fromEntries(sorted.map((process) => [process.processId, process.burstTime]))
  let time = 0
  let index = 0

  while (index < sorted.length || queue.length) {
    while (index < sorted.length && sorted[index].arrivalTime <= time) {
      queue.push(sorted[index])
      index += 1
    }

    if (!queue.length) {
      const nextArrival = sorted[index].arrivalTime
      pushSegment(segments, 'IDLE', time, nextArrival, 0)
      time = nextArrival
      continue
    }

    const current = queue.shift()
    const slice = Math.min(quantum, remaining[current.processId])
    const end = time + slice

    pushSegment(segments, current.processId, time, end, current.cpuFrequency)
    remaining[current.processId] -= slice
    time = end

    while (index < sorted.length && sorted[index].arrivalTime <= time) {
      queue.push(sorted[index])
      index += 1
    }

    if (remaining[current.processId] > 0) {
      queue.push(current)
    } else {
      completionTimes[current.processId] = time
    }
  }

  return summarize(processes, segments, completionTimes, 'Round Robin')
}

function runEnergyAware(processes) {
  const pending = [...processes]
  const segments = []
  const completionTimes = {}
  let time = 0

  while (pending.length) {
    const available = pending.filter((process) => process.arrivalTime <= time)

    if (!available.length) {
      const nextArrival = Math.min(...pending.map((process) => process.arrivalTime))
      pushSegment(segments, 'IDLE', time, nextArrival, 0)
      time = nextArrival
      continue
    }

    const selected = available.sort((left, right) => {
      const leftScore = left.burstTime * left.cpuFrequency * left.cpuFrequency
      const rightScore = right.burstTime * right.cpuFrequency * right.cpuFrequency
      return leftScore - rightScore || left.priority - right.priority || left.arrivalTime - right.arrivalTime
    })[0]

    pending.splice(
      pending.findIndex((process) => process.processId === selected.processId),
      1,
    )

    const adaptiveFrequency = Number(Math.max(1.2, selected.cpuFrequency - 0.2).toFixed(1))
    const end = time + selected.burstTime
    pushSegment(segments, selected.processId, time, end, adaptiveFrequency)
    completionTimes[selected.processId] = end
    time = end
  }

  return summarize(processes, segments, completionTimes, 'Energy Aware Scheduler')
}

function buildUtilizationSeries(segments, totalDuration) {
  const series = []

  for (let tick = 0; tick <= Math.max(totalDuration, 1); tick += 1) {
    const activeSegment = segments.find((segment) => tick >= segment.start && tick < segment.end)

    series.push({
      time: tick,
      utilization: activeSegment && activeSegment.processId !== 'IDLE' ? 100 : 0,
    })
  }

  return series
}

function runAlgorithm(algorithm, processes) {
  switch (algorithm) {
    case 'FCFS':
      return runFcfs(processes)
    case 'SJF':
      return runSjf(processes)
    case 'Round Robin':
      return runRoundRobin(processes)
    default:
      return runEnergyAware(processes)
  }
}

export function createDemoSimulation(processes = defaultProcesses, selectedAlgorithm = 'Energy Aware Scheduler') {
  const normalized = normalizeProcesses(processes)
  const comparison = ALGORITHMS.map((algorithm) => runAlgorithm(algorithm, normalized))
  const activeResult = comparison.find((item) => item.algorithm === selectedAlgorithm) || comparison[0]

  return {
    algorithm: activeResult.algorithm,
    segments: activeResult.segments,
    metrics: {
      averageWaitingTime: `${activeResult.avgWaitingTime} ms`,
      turnaroundTime: `${activeResult.avgTurnaroundTime} ms`,
      cpuUtilization: `${activeResult.cpuUtilization}%`,
      energyConsumption: `${activeResult.energyUsage} J`,
    },
    energySeries: comparison.map((item) => ({
      algorithm: item.algorithm,
      energy: item.energyUsage,
    })),
    utilizationSeries: buildUtilizationSeries(activeResult.segments, activeResult.totalDuration),
    comparisonRows: comparison.map((item) => ({
      algorithm: item.algorithm,
      averageWaitingTime: item.avgWaitingTime,
      turnaroundTime: item.avgTurnaroundTime,
      energyUsage: item.energyUsage,
    })),
    summary: {
      fastest: [...comparison].sort((left, right) => left.avgWaitingTime - right.avgWaitingTime)[0].algorithm,
      greenest: [...comparison].sort((left, right) => left.energyUsage - right.energyUsage)[0].algorithm,
    },
  }
}

export async function simulateScheduling(processes, algorithm) {
  try {
    const response = await api.post('/simulate', { processes, algorithm })
    return response.data
  } catch {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        resolve(createDemoSimulation(processes, algorithm))
      }, 900)
    })
  }
}

export default api
