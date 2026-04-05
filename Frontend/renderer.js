const BASE_URL = 'http://127.0.0.1:5000/api';
const API_BASE = BASE_URL;
const BACKEND_RETRY_MS = 3000;
const CPU_FETCH_MS = 2000;
const PROCESS_FETCH_MS = 3000;
const ENERGY_FETCH_MS = 3000;
const HISTORY_POINTS = 60;

const state = {
  algorithm: 'FCFS',
  polling: false,
  backendReady: false,
  backendCheckRunning: false,
  dataFetchingStarted: false,
  backendRetryId: null,
  cpuFetchId: null,
  processFetchId: null,
  energyFetchId: null,
  cpuFetchInFlight: false,
  processFetchInFlight: false,
  energyFetchInFlight: false,
  simulationRunning: false,
  cpu: { total_usage: 0, per_core: [], frequency: 0 },
  energyApi: null,
  processes: [],
  cpuHistory: [],
  comparison: {},
  errorMessage: '',
  cache: {
    coreSignature: '',
    processSignature: '',
    comparisonSignature: ''
  }
};

const algorithmMap = {
  FCFS: 'fcfs',
  SJF: 'sjf',
  'Round Robin': 'round-robin',
  'Energy Aware': 'energy-aware'
};

const algorithmKeys = ['fcfs', 'sjf', 'round_robin', 'energy_aware'];
const algorithmTitles = {
  fcfs: 'FCFS',
  sjf: 'SJF',
  round_robin: 'Round Robin',
  energy_aware: 'Energy Aware'
};

const algorithmControl = document.getElementById('algorithmControl');
const runBtn = document.getElementById('runBtn');
const simulationStatusEl = document.getElementById('simulationStatus');
const openConnectionStatusBtn = document.getElementById('openConnectionStatus');

const cpuUsageEl = document.getElementById('cpuUsage');
const cpuFrequencyEl = document.getElementById('cpuFrequency');
const cpuStatusEl = document.getElementById('cpuStatus');
const coreBarsEl = document.getElementById('coreBars');
const processBodyEl = document.getElementById('processBody');
const totalEnergyEl = document.getElementById('totalEnergy');
const energyPerProcessEl = document.getElementById('energyPerProcess');
const ganttChartEl = document.getElementById('ganttChart');
const activeAlgorithmEl = document.getElementById('activeAlgorithm');
const comparisonBodyEl = document.getElementById('comparisonBody');
const suggestionsListEl = document.getElementById('suggestionsList');
const apiErrorEl = document.getElementById('apiError');

const waitingTimeEl = document.getElementById('waitingTime');
const turnaroundTimeEl = document.getElementById('turnaroundTime');
const utilizationEl = document.getElementById('utilization');
const energyConsumptionEl = document.getElementById('energyConsumption');

const cpuLineChart = document.getElementById('cpuLineChart');
const energyBarChart = document.getElementById('energyBarChart');
const performanceBarChart = document.getElementById('performanceBarChart');

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function toGHz(frequencyMHz) {
  if (!frequencyMHz) return 0;
  return frequencyMHz / 1000;
}

function computeEnergy(cpuPercent, frequencyGHz) {
  return (cpuPercent / 100) * (frequencyGHz * frequencyGHz);
}

async function safeFetch(url, options = {}) {
  const timeoutMs = options.timeoutMs ?? 5000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      const fallbackMessage = `Request failed (${response.status})`;
      let errorMessage = fallbackMessage;
      try {
        const body = await response.json();
        if (body?.error) {
          errorMessage = body.error;
        }
      } catch {
        errorMessage = fallbackMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('[API OK]', url, data);
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Connection timeout');
    }
    console.error('[API ERROR]', url, error);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function stopDataFetching() {
  if (state.cpuFetchId) {
    clearInterval(state.cpuFetchId);
    state.cpuFetchId = null;
  }
  if (state.processFetchId) {
    clearInterval(state.processFetchId);
    state.processFetchId = null;
  }
  if (state.energyFetchId) {
    clearInterval(state.energyFetchId);
    state.energyFetchId = null;
  }
  state.dataFetchingStarted = false;
}

async function checkBackend() {
  if (state.backendCheckRunning) return state.backendReady;
  state.backendCheckRunning = true;

  try {
    const health = await safeFetch(`${API_BASE}/health`, { timeoutMs: 3000 });
    const ok = health?.status === 'ok';
    state.backendReady = ok;

    if (!ok) {
      showApiError('Data unavailable: backend health check failed.');
      stopDataFetching();
      return false;
    }

    clearApiError();
    return true;
  } catch (error) {
    state.backendReady = false;
    stopDataFetching();
    showApiError(`Backend not running or not reachable. (${error.message})`);
    return false;
  } finally {
    state.backendCheckRunning = false;
  }
}

async function fetchCPU() {
  if (state.cpuFetchInFlight) return;
  state.cpuFetchInFlight = true;

  try {
    const cpuPayload = await safeFetch(`${API_BASE}/cpu`, { timeoutMs: 6000 });
    state.cpu = normalizeCpuData(cpuPayload);
    updateCpuPanel(state.cpu);
    updateCpuUsageGraph(state.cpu.total_usage);
    clearApiError();
  } catch (error) {
    showApiError(`CPU data unavailable. (${error.message})`);
  } finally {
    state.cpuFetchInFlight = false;
  }
}

async function fetchProcesses() {
  if (state.processFetchInFlight) return;
  state.processFetchInFlight = true;

  try {
    const processPayload = await safeFetch(`${API_BASE}/processes?limit=15&sort_by=cpu`, { timeoutMs: 12000 });
    state.processes = normalizeProcesses(processPayload);
    const frequencyGHz = toGHz(state.cpu.frequency);
    updateProcessTable(state.processes, frequencyGHz);
    renderSuggestions(state.processes, frequencyGHz);
    renderLiveSimulationPreview();
    clearApiError();
  } catch (error) {
    showApiError(`Process data unavailable. (${error.message})`);
  } finally {
    state.processFetchInFlight = false;
  }
}

function renderLiveSimulationPreview() {
  const scheduleInput = toSchedulableProcesses(state.processes);
  if (!scheduleInput.length) return;

  const algorithmKey = algorithmMap[state.algorithm] || 'fcfs';
  let scheduleResult;

  if (algorithmKey === 'sjf') {
    scheduleResult = sjfSchedule(scheduleInput);
  } else if (algorithmKey === 'round-robin') {
    scheduleResult = roundRobinSchedule(scheduleInput);
  } else if (algorithmKey === 'energy-aware') {
    scheduleResult = energyAwareSchedule(scheduleInput);
  } else {
    scheduleResult = fcfsSchedule(scheduleInput);
  }

  const comparison = compareAlgorithmsLocal(scheduleInput);
  const computedEnergy = computeEnergy(state.cpu.total_usage || 0, toGHz(state.cpu.frequency));
  renderSimulationResults(scheduleResult, comparison, computedEnergy);

  if (!state.simulationRunning) {
    simulationStatusEl.textContent = `${state.algorithm} preview updated from live system data.`;
  }
}

async function fetchEnergy() {
  if (state.energyFetchInFlight) return;
  state.energyFetchInFlight = true;

  try {
    const energyPayload = await safeFetch(`${API_BASE}/energy`, { timeoutMs: 6000 });
    state.energyApi = energyPayload;
    updateEnergyPanel(state.cpu, state.processes);
    clearApiError();
  } catch (error) {
    showApiError(`Energy data unavailable. (${error.message})`);
  } finally {
    state.energyFetchInFlight = false;
  }
}

function startDataFetching() {
  if (state.dataFetchingStarted) return;
  state.dataFetchingStarted = true;

  fetchCPU();
  fetchProcesses();
  fetchEnergy();

  state.cpuFetchId = setInterval(fetchCPU, CPU_FETCH_MS);
  state.processFetchId = setInterval(fetchProcesses, PROCESS_FETCH_MS);
  state.energyFetchId = setInterval(fetchEnergy, ENERGY_FETCH_MS);
}

function showApiError(message) {
  if (state.errorMessage === message) return;
  state.errorMessage = message;
  apiErrorEl.textContent = message;
  apiErrorEl.classList.remove('hidden');
}

function clearApiError() {
  if (!state.errorMessage) return;
  state.errorMessage = '';
  apiErrorEl.textContent = '';
  apiErrorEl.classList.add('hidden');
}

function normalizeCpuData(payload) {
  if (!payload || typeof payload !== 'object') {
    return { total_usage: 0, per_core: [], frequency: 0 };
  }

  const totalUsage = payload.total_usage ?? payload.usage ?? 0;
  const perCore = payload.per_core ?? payload.cores ?? [];
  const frequencyValue = payload.frequency ?? payload.freq ?? 0;

  return {
    total_usage: Number(totalUsage || 0),
    per_core: Array.isArray(perCore) ? perCore.map((v) => Number(v || 0)) : [],
    frequency: Number(frequencyValue || 0) >= 0 && Number(frequencyValue || 0) < 100 ? Number(frequencyValue || 0) * 1000 : Number(frequencyValue || 0)
  };
}

function normalizeProcesses(payload) {
  const list = Array.isArray(payload) ? payload : Array.isArray(payload?.processes) ? payload.processes : [];
  return list
    .map((process) => ({
      pid: Number(process.pid || 0),
      name: process.name || 'Unknown',
      cpu: Number(process.cpu || 0),
      memory: Number(process.memory || 0),
      energy: Number(process.energy || 0)
    }))
    .sort((a, b) => b.cpu - a.cpu)
    .slice(0, 15);
}

function updateCpuPanel(cpu) {
  const usage = Number(cpu.total_usage || 0);
  const frequencyGHz = toGHz(cpu.frequency);

  cpuUsageEl.textContent = `${usage.toFixed(1)}%`;
  cpuFrequencyEl.textContent = `${frequencyGHz.toFixed(2)} GHz`;

  if (usage >= 85) {
    cpuStatusEl.textContent = 'High Load';
    cpuStatusEl.classList.add('warning');
  } else if (usage >= 60) {
    cpuStatusEl.textContent = 'Moderate';
    cpuStatusEl.classList.remove('warning');
  } else {
    cpuStatusEl.textContent = 'Healthy';
    cpuStatusEl.classList.remove('warning');
  }

  const signature = cpu.per_core.join('|');
  if (signature === state.cache.coreSignature) return;
  state.cache.coreSignature = signature;

  if (!cpu.per_core.length) {
    coreBarsEl.innerHTML = '<p class="muted">No per-core data available.</p>';
    return;
  }

  coreBarsEl.innerHTML = cpu.per_core
    .map((value, index) => {
      const safeValue = Math.max(0, Math.min(100, Number(value || 0)));
      return `
        <div class="core-row">
          <span>Core ${index + 1}</span>
          <div class="progress"><span style="width: ${safeValue.toFixed(1)}%"></span></div>
          <strong>${safeValue.toFixed(1)}%</strong>
        </div>
      `;
    })
    .join('');
}

function updateProcessTable(processes, frequencyGHz) {
  const signature = processes.map((p) => `${p.pid}:${p.cpu.toFixed(2)}:${p.energy.toFixed(2)}`).join('|');
  if (signature === state.cache.processSignature) return;
  state.cache.processSignature = signature;

  if (!processes.length) {
    processBodyEl.innerHTML = '<tr><td colspan="4" class="muted">No process data available.</td></tr>';
    return;
  }

  processBodyEl.innerHTML = processes
    .map((process) => {
      const computedEnergy = computeEnergy(process.cpu, frequencyGHz);
      const rowClass = process.cpu >= 20 ? 'high-cpu-row' : '';
      return `
        <tr class="${rowClass}">
          <td>${process.pid}</td>
          <td title="${escapeHtml(process.name)}">${escapeHtml(process.name)}</td>
          <td>${process.cpu.toFixed(2)}%</td>
          <td>${computedEnergy.toFixed(3)}</td>
        </tr>
      `;
    })
    .join('');
}

function updateEnergyPanel(cpu, processes) {
  const frequencyGHz = toGHz(cpu.frequency);
  const totalEnergy = computeEnergy(cpu.total_usage, frequencyGHz);
  const processEnergies = processes.map((process) => computeEnergy(process.cpu, frequencyGHz));
  const avgProcessEnergy = processEnergies.length
    ? processEnergies.reduce((sum, value) => sum + value, 0) / processEnergies.length
    : 0;

  totalEnergyEl.textContent = `${totalEnergy.toFixed(3)} units`;
  energyPerProcessEl.textContent = `${avgProcessEnergy.toFixed(3)} units`;
  energyConsumptionEl.textContent = `${totalEnergy.toFixed(3)} units`;

  return { totalEnergy, avgProcessEnergy, processEnergies };
}

function drawAxis(ctx, width, height, padding) {
  ctx.strokeStyle = '#b8c7dc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
}

function drawLineChart(canvas, values, color) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 24;

  ctx.clearRect(0, 0, width, height);
  drawAxis(ctx, width, height, padding);

  if (!values.length) return;

  const xStep = (width - padding * 2) / Math.max(values.length - 1, 1);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.beginPath();

  values.forEach((value, index) => {
    const clamped = Math.max(0, Math.min(100, value));
    const x = padding + index * xStep;
    const y = height - padding - (clamped / 100) * (height - padding * 2);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  ctx.fillStyle = '#173153';
  ctx.font = '12px Segoe UI';
  ctx.fillText('100%', 2, padding + 4);
  ctx.fillText('0%', 8, height - padding + 4);
}

function drawBarChart(canvas, labels, values, options = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 30;

  ctx.clearRect(0, 0, width, height);
  drawAxis(ctx, width, height, padding);

  if (!labels.length || !values.length) return;

  const maxValue = Math.max(...values, 1);
  const barGap = 12;
  const barWidth = (width - padding * 2 - barGap * (values.length - 1)) / values.length;
  const palette = options.palette || ['#3a90ff', '#50c5e7', '#6cd89e', '#f7b267'];

  values.forEach((value, index) => {
    const normalized = Math.max(0, value) / maxValue;
    const barHeight = normalized * (height - padding * 2);
    const x = padding + index * (barWidth + barGap);
    const y = height - padding - barHeight;

    ctx.fillStyle = palette[index % palette.length];
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = '#334258';
    ctx.font = '11px Segoe UI';
    ctx.fillText(labels[index], x, height - 12);
    ctx.fillText(value.toFixed(2), x, y - 6);
  });
}

function updateCpuUsageGraph(usageValue) {
  state.cpuHistory.push(Number(usageValue || 0));
  if (state.cpuHistory.length > HISTORY_POINTS) {
    state.cpuHistory.shift();
  }
  drawLineChart(cpuLineChart, state.cpuHistory, '#0b84ff');
}

function renderGanttChart(gantt) {
  if (!Array.isArray(gantt) || gantt.length === 0) {
    ganttChartEl.innerHTML = '<p class="muted">Run simulation to render Gantt chart.</p>';
    return;
  }

  ganttChartEl.innerHTML = gantt
    .map((segment, index) => {
      const duration = Math.max(1, Number(segment.duration || 1));
      const width = Math.max(58, duration * 24);
      const start = Number(segment.start || 0);
      const end = Number(segment.end || start + duration);
      return `
        <div class="gantt-block" style="min-width:${width}px;animation-delay:${index * 50}ms;background:${segment.color || 'linear-gradient(145deg, #8bc2ff, #6da9ee)'}">
          <span class="g-id">${escapeHtml(segment.id || 'P')}</span>
          <span class="g-time">${start} - ${end}</span>
        </div>
      `;
    })
    .join('');
}

function updateMetrics(metrics, energyValue) {
  waitingTimeEl.textContent = `${Number(metrics.avg_waiting_time || 0).toFixed(2)} ms`;
  turnaroundTimeEl.textContent = `${Number(metrics.avg_turnaround_time || 0).toFixed(2)} ms`;
  utilizationEl.textContent = `${Number(metrics.cpu_utilization || 0).toFixed(2)}%`;
  energyConsumptionEl.textContent = `${Number(energyValue || metrics.total_energy || 0).toFixed(3)} units`;
}

function renderComparisonTable(comparison) {
  const signature = JSON.stringify(comparison || {});
  if (signature === state.cache.comparisonSignature) return;
  state.cache.comparisonSignature = signature;

  const rows = algorithmKeys
    .map((key) => {
      const item = comparison?.[key];
      if (!item?.metrics) return null;
      return {
        key,
        label: algorithmTitles[key],
        waiting: Number(item.metrics.avg_waiting_time || 0),
        turnaround: Number(item.metrics.avg_turnaround_time || 0),
        energy: Number(item.metrics.total_energy || 0)
      };
    })
    .filter(Boolean);

  if (!rows.length) {
    comparisonBodyEl.innerHTML = '<tr><td colspan="4" class="muted">No comparison results yet.</td></tr>';
    return;
  }

  const best = rows.reduce((winner, current) => (current.energy < winner.energy ? current : winner), rows[0]);

  comparisonBodyEl.innerHTML = rows
    .map((row) => {
      const rowClass = row.key === best.key ? 'best-algo-row' : '';
      return `
        <tr class="${rowClass}">
          <td>${row.label}</td>
          <td>${row.waiting.toFixed(2)} ms</td>
          <td>${row.turnaround.toFixed(2)} ms</td>
          <td>${row.energy.toFixed(2)}</td>
        </tr>
      `;
    })
    .join('');

  const energyLabels = rows.map((row) => row.label);
  const energyValues = rows.map((row) => row.energy);
  drawBarChart(energyBarChart, energyLabels, energyValues, {
    palette: ['#2f8eff', '#50c5e7', '#73d3a0', '#f5a86f']
  });

  const performanceScore = rows.map((row) => row.waiting + row.turnaround);
  drawBarChart(performanceBarChart, energyLabels, performanceScore, {
    palette: ['#386fa4', '#59a5d8', '#84d2f6', '#f0b67f']
  });
}

function renderSuggestions(processes, frequencyGHz) {
  const highCpu = processes.filter((process) => process.cpu >= 20).slice(0, 3);
  const highEnergy = processes
    .map((process) => ({
      ...process,
      computedEnergy: computeEnergy(process.cpu, frequencyGHz)
    }))
    .filter((process) => process.computedEnergy >= 1)
    .sort((a, b) => b.computedEnergy - a.computedEnergy)
    .slice(0, 3);

  const suggestions = [];
  highCpu.forEach((process) => {
    suggestions.push(`${process.name} is using ${process.cpu.toFixed(1)}% CPU. Consider lowering priority.`);
  });
  highEnergy.forEach((process) => {
    suggestions.push(`${process.name} has high energy score (${process.computedEnergy.toFixed(3)}). Consider optimizing workload.`);
  });

  if (!suggestions.length) {
    suggestions.push('System is balanced. No high CPU or high energy process detected.');
  }

  suggestionsListEl.innerHTML = suggestions
    .slice(0, 6)
    .map((message) => `<li>${escapeHtml(message)}</li>`)
    .join('');
}

function toSchedulableProcesses(processes) {
  return processes.slice(0, 10).map((process, index) => ({
    id: `P${index + 1}`,
    arrival: index,
    burst: Math.max(1, Math.round(process.cpu / 8) + 1),
    cpu: Number(process.cpu || 0),
    pid: process.pid,
    name: process.name
  }));
}

function buildComparisonSet(scheduleResultByAlgorithm) {
  return Object.fromEntries(
    Object.entries(scheduleResultByAlgorithm).map(([key, value]) => [key, value])
  );
}

function fcfsSchedule(processes) {
  const ganttChart = [];
  let currentTime = 0;
  const waitingTimes = {};
  const turnaroundTimes = {};
  const processesSorted = [...processes].sort((a, b) => a.arrival - b.arrival);

  processesSorted.forEach((process) => {
    const startTime = Math.max(currentTime, process.arrival);
    const endTime = startTime + process.burst;

    ganttChart.push({
      id: process.id,
      start: startTime,
      end: endTime,
      duration: process.burst,
      color: 'linear-gradient(145deg, #8bc2ff, #6da9ee)'
    });

    waitingTimes[process.id] = Math.max(0, startTime - process.arrival);
    turnaroundTimes[process.id] = endTime - process.arrival;
    currentTime = endTime;
  });

  const avgWaiting = Object.values(waitingTimes).reduce((sum, value) => sum + value, 0) / processesSorted.length;
  const avgTurnaround = Object.values(turnaroundTimes).reduce((sum, value) => sum + value, 0) / processesSorted.length;

  return {
    algorithm: 'FCFS',
    gantt_chart: ganttChart,
    metrics: {
      avg_waiting_time: Number.isFinite(avgWaiting) ? Number(avgWaiting.toFixed(2)) : 0,
      avg_turnaround_time: Number.isFinite(avgTurnaround) ? Number(avgTurnaround.toFixed(2)) : 0,
      cpu_utilization: currentTime > 0 ? Number(((currentTime / (currentTime + 10)) * 100).toFixed(2)) : 0,
      total_time: currentTime,
      total_energy: Number((processesSorted.reduce((sum, process) => sum + process.burst, 0) * 0.5).toFixed(2))
    }
  };
}

function sjfSchedule(processes) {
  const ganttChart = [];
  let currentTime = 0;
  const waitingTimes = {};
  const turnaroundTimes = {};
  const processesCopy = processes.map((process) => ({ ...process }));
  const completed = new Set();

  while (completed.size < processesCopy.length) {
    let available = processesCopy.filter((process) => process.arrival <= currentTime && !completed.has(process.id));

    if (!available.length) {
      currentTime = Math.min(...processesCopy.filter((process) => !completed.has(process.id)).map((process) => process.arrival));
      available = processesCopy.filter((process) => process.arrival <= currentTime && !completed.has(process.id));
    }

    const nextProcess = available.sort((a, b) => a.burst - b.burst)[0];
    const startTime = currentTime;
    const endTime = startTime + nextProcess.burst;

    ganttChart.push({
      id: nextProcess.id,
      start: startTime,
      end: endTime,
      duration: nextProcess.burst,
      color: 'linear-gradient(145deg, #c2b8ff, #a9a2ff)'
    });

    waitingTimes[nextProcess.id] = Math.max(0, startTime - nextProcess.arrival);
    turnaroundTimes[nextProcess.id] = endTime - nextProcess.arrival;
    completed.add(nextProcess.id);
    currentTime = endTime;
  }

  const avgWaiting = Object.values(waitingTimes).reduce((sum, value) => sum + value, 0) / processesCopy.length;
  const avgTurnaround = Object.values(turnaroundTimes).reduce((sum, value) => sum + value, 0) / processesCopy.length;

  return {
    algorithm: 'SJF',
    gantt_chart: ganttChart,
    metrics: {
      avg_waiting_time: Number.isFinite(avgWaiting) ? Number(avgWaiting.toFixed(2)) : 0,
      avg_turnaround_time: Number.isFinite(avgTurnaround) ? Number(avgTurnaround.toFixed(2)) : 0,
      cpu_utilization: currentTime > 0 ? Number(((currentTime / (currentTime + 10)) * 100).toFixed(2)) : 0,
      total_time: currentTime,
      total_energy: Number((processesCopy.reduce((sum, process) => sum + process.burst, 0) * 0.5).toFixed(2))
    }
  };
}

function roundRobinSchedule(processes, quantum = 4) {
  const ganttChart = [];
  const queue = processes.map((process) => ({ ...process }));
  const currentTime = { value: 0 };
  const waitingTimes = {};
  const turnaroundTimes = {};
  const arrivalTimes = Object.fromEntries(processes.map((process) => [process.id, process.arrival]));
  const remainingBurst = Object.fromEntries(processes.map((process) => [process.id, process.burst]));

  while (queue.length) {
    const process = queue.shift();
    const executionTime = Math.min(remainingBurst[process.id], quantum);

    ganttChart.push({
      id: process.id,
      start: currentTime.value,
      end: currentTime.value + executionTime,
      duration: executionTime,
      color: 'linear-gradient(145deg, #b0e7ff, #98dbff)'
    });

    remainingBurst[process.id] -= executionTime;
    currentTime.value += executionTime;

    if (remainingBurst[process.id] > 0) {
      queue.push(process);
    } else {
      turnaroundTimes[process.id] = currentTime.value - arrivalTimes[process.id];
      waitingTimes[process.id] = turnaroundTimes[process.id] - process.burst;
    }
  }

  const avgWaiting = Object.values(waitingTimes).reduce((sum, value) => sum + value, 0) / processes.length;
  const avgTurnaround = Object.values(turnaroundTimes).reduce((sum, value) => sum + value, 0) / processes.length;

  return {
    algorithm: 'Round Robin',
    gantt_chart: ganttChart,
    metrics: {
      avg_waiting_time: Number.isFinite(avgWaiting) ? Number(avgWaiting.toFixed(2)) : 0,
      avg_turnaround_time: Number.isFinite(avgTurnaround) ? Number(avgTurnaround.toFixed(2)) : 0,
      cpu_utilization: currentTime.value > 0 ? Number(((currentTime.value / (currentTime.value + 10)) * 100).toFixed(2)) : 0,
      total_time: currentTime.value,
      time_quantum: quantum,
      total_energy: Number((processes.reduce((sum, process) => sum + process.burst, 0) * 0.5).toFixed(2))
    }
  };
}

function energyAwareSchedule(processes) {
  const processesCopy = processes.map((process) => ({
    ...process,
    energy_score: process.cpu * process.burst
  }));

  const ganttChart = [];
  let currentTime = 0;
  const waitingTimes = {};
  const turnaroundTimes = {};

  processesCopy.sort((a, b) => a.energy_score - b.energy_score).forEach((process) => {
    const startTime = Math.max(currentTime, process.arrival);
    const endTime = startTime + process.burst;

    ganttChart.push({
      id: process.id,
      start: startTime,
      end: endTime,
      duration: process.burst,
      color: 'linear-gradient(145deg, #d9ccff, #c3b4ff)'
    });

    waitingTimes[process.id] = Math.max(0, startTime - process.arrival);
    turnaroundTimes[process.id] = endTime - process.arrival;
    currentTime = endTime;
  });

  const avgWaiting = Object.values(waitingTimes).reduce((sum, value) => sum + value, 0) / processesCopy.length;
  const avgTurnaround = Object.values(turnaroundTimes).reduce((sum, value) => sum + value, 0) / processesCopy.length;
  const totalEnergy = processesCopy.reduce((sum, process) => sum + process.energy_score, 0);

  return {
    algorithm: 'Energy-Aware',
    gantt_chart: ganttChart,
    metrics: {
      avg_waiting_time: Number.isFinite(avgWaiting) ? Number(avgWaiting.toFixed(2)) : 0,
      avg_turnaround_time: Number.isFinite(avgTurnaround) ? Number(avgTurnaround.toFixed(2)) : 0,
      cpu_utilization: currentTime > 0 ? Number(((currentTime / (currentTime + 10)) * 100).toFixed(2)) : 0,
      total_time: currentTime,
      total_energy: Number((totalEnergy * 0.5).toFixed(2)),
      energy_efficiency: processesCopy.length ? Number((100 - (totalEnergy / (processesCopy.length * 100) * 100)).toFixed(2)) : 0
    }
  };
}

function compareAlgorithmsLocal(processes) {
  return buildComparisonSet({
    fcfs: fcfsSchedule(processes),
    sjf: sjfSchedule(processes),
    round_robin: roundRobinSchedule(processes),
    energy_aware: energyAwareSchedule(processes)
  });
}

function renderSimulationResults(scheduleResult, comparisonResult, computedEnergy) {
  state.comparison = comparisonResult || {};
  renderGanttChart(scheduleResult?.gantt_chart || []);
  renderComparisonTable(state.comparison);
  updateMetrics(scheduleResult?.metrics || {}, computedEnergy);
}

async function runSimulation() {
  if (state.simulationRunning) return;

  state.simulationRunning = true;
  runBtn.disabled = true;
  runBtn.textContent = 'Running...';
  simulationStatusEl.textContent = 'Simulation in progress...';

  try {
    const processes = state.processes.length
      ? state.processes
      : normalizeProcesses(await safeFetch(`${API_BASE}/processes?limit=15&sort_by=cpu`));

    if (!processes.length) {
      throw new Error('No process data available for scheduling simulation.');
    }

    const scheduleInput = toSchedulableProcesses(processes);
    const algorithmKey = algorithmMap[state.algorithm] || 'fcfs';
    const frequencyGHz = toGHz(state.cpu.frequency);
    const computedEnergy = computeEnergy(state.cpu.total_usage || 0, frequencyGHz);

    const [scheduleResult, comparisonResult] = await Promise.all([
      safeFetch(`${API_BASE}/scheduler/schedule`, {
        method: 'POST',
        timeoutMs: 10000,
        body: JSON.stringify({ algorithm: algorithmKey, processes: scheduleInput })
      }),
      safeFetch(`${API_BASE}/scheduler/compare`, {
        method: 'POST',
        timeoutMs: 10000,
        body: JSON.stringify({ processes: scheduleInput })
      })
    ]);

    renderSimulationResults(scheduleResult, comparisonResult?.comparison || {}, computedEnergy);
    updateCpuUsageGraph(state.cpu.total_usage);

    simulationStatusEl.textContent = `${scheduleResult?.algorithm || state.algorithm} simulation completed.`;
    clearApiError();
  } catch (error) {
    console.error('Simulation error:', error);
    try {
      const fallbackProcesses = state.processes.length ? state.processes : normalizeProcesses(await safeFetch(`${API_BASE}/processes?limit=15&sort_by=cpu`, { timeoutMs: 3000 }));
      const scheduleInput = toSchedulableProcesses(fallbackProcesses);
      const algorithmKey = algorithmMap[state.algorithm] || 'fcfs';
      let localScheduleResult;

      if (algorithmKey === 'sjf') {
        localScheduleResult = sjfSchedule(scheduleInput);
      } else if (algorithmKey === 'round-robin') {
        localScheduleResult = roundRobinSchedule(scheduleInput);
      } else if (algorithmKey === 'energy-aware') {
        localScheduleResult = energyAwareSchedule(scheduleInput);
      } else {
        localScheduleResult = fcfsSchedule(scheduleInput);
      }

      renderSimulationResults(localScheduleResult, compareAlgorithmsLocal(scheduleInput), computeEnergy(state.cpu.total_usage || 0, toGHz(state.cpu.frequency)));
      simulationStatusEl.textContent = 'Backend was slow, rendered local simulation output.';
      showApiError(`Backend delay detected: ${error.message}`);
    } catch (fallbackError) {
      simulationStatusEl.textContent = `Simulation failed: ${fallbackError.message}`;
      showApiError(`Simulation error: ${fallbackError.message}`);
    }
  } finally {
    state.simulationRunning = false;
    runBtn.disabled = false;
    runBtn.textContent = 'Run Scheduling Simulation';
  }
}

async function bootstrap() {
  const ok = await checkBackend();
  if (ok) {
    startDataFetching();
  } else {
    showApiError('Backend not running. Waiting to reconnect...');
  }

  state.backendRetryId = setInterval(async () => {
    if (state.backendReady && state.dataFetchingStarted) return;

    const healthy = await checkBackend();
    if (healthy) {
      startDataFetching();
    }
  }, BACKEND_RETRY_MS);
}

algorithmControl.addEventListener('click', (event) => {
  const target = event.target.closest('.segment');
  if (!target) return;

  algorithmControl.querySelectorAll('.segment').forEach((button) => button.classList.remove('active'));
  target.classList.add('active');

  state.algorithm = target.dataset.algorithm;
  activeAlgorithmEl.textContent = state.algorithm;
});

runBtn.addEventListener('click', runSimulation);

if (openConnectionStatusBtn) {
  openConnectionStatusBtn.addEventListener('click', () => {
    window.open('backend-connection-status.html', '_blank');
  });
}

bootstrap();
