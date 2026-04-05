"""Data models for processes and scheduling"""


class ProcessInfo:
    """Model representing a process"""
    
    def __init__(self, pid, name, cpu_percent, memory_mb, energy=0):
        """
        Initialize a process
        
        Args:
            pid: Process ID
            name: Process name
            cpu_percent: CPU usage percentage
            memory_mb: Memory usage in MB
            energy: Estimated energy consumption
        """
        self.pid = pid
        self.name = name
        self.cpu_percent = cpu_percent
        self.memory_mb = memory_mb
        self.energy = energy
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'pid': self.pid,
            'name': self.name,
            'cpu': self.cpu_percent,
            'memory': self.memory_mb,
            'energy': self.energy
        }


class CPUStats:
    """Model for CPU statistics"""
    
    def __init__(self, total_usage, per_core, frequency, load_avg):
        """
        Initialize CPU stats
        
        Args:
            total_usage: Total CPU usage percentage
            per_core: List of per-core CPU usage
            frequency: CPU frequency in MHz
            load_avg: Load average (1, 5, 15 min)
        """
        self.total_usage = total_usage
        self.per_core = per_core
        self.frequency = frequency
        self.load_avg = load_avg
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'total_usage': self.total_usage,
            'per_core': self.per_core,
            'frequency': self.frequency,
            'load_average': self.load_avg
        }


class EnergyData:
    """Model for energy consumption data"""
    
    def __init__(self, total_energy, cpu_contribution, memory_contribution, 
                 efficiency, per_process=None):
        """
        Initialize energy data
        
        Args:
            total_energy: Total energy consumption (estimated watts)
            cpu_contribution: CPU energy contribution
            memory_contribution: Memory energy contribution
            efficiency: System efficiency percentage
            per_process: List of energy per process
        """
        self.total_energy = total_energy
        self.cpu_contribution = cpu_contribution
        self.memory_contribution = memory_contribution
        self.efficiency = efficiency
        self.per_process = per_process or []
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'total_energy': self.total_energy,
            'cpu_contribution': self.cpu_contribution,
            'memory_contribution': self.memory_contribution,
            'efficiency': self.efficiency,
            'per_process': self.per_process
        }


class ScheduleResult:
    """Model for scheduling algorithm results"""
    
    def __init__(self, algorithm, gantt_chart, avg_waiting_time, 
                 avg_turnaround_time, cpu_utilization, total_energy=0):
        """
        Initialize schedule result
        
        Args:
            algorithm: Algorithm name
            gantt_chart: List of scheduled processes
            avg_waiting_time: Average waiting time
            avg_turnaround_time: Average turnaround time
            cpu_utilization: CPU utilization percentage
            total_energy: Total energy consumed
        """
        self.algorithm = algorithm
        self.gantt_chart = gantt_chart
        self.avg_waiting_time = avg_waiting_time
        self.avg_turnaround_time = avg_turnaround_time
        self.cpu_utilization = cpu_utilization
        self.total_energy = total_energy
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'algorithm': self.algorithm,
            'gantt_chart': self.gantt_chart,
            'metrics': {
                'avg_waiting_time': self.avg_waiting_time,
                'avg_turnaround_time': self.avg_turnaround_time,
                'cpu_utilization': self.cpu_utilization,
                'total_energy': self.total_energy
            }
        }
