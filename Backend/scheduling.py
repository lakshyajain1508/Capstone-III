"""
CPU Scheduling Algorithms
Implements FCFS, SJF, Round Robin, and Energy-Aware scheduling
"""

class FCFS:
    """First Come First Served Scheduling"""
    
    @staticmethod
    def schedule(processes):
        """
        FCFS: Execute processes in order of arrival
        Simple but can lead to long waiting times
        """
        # Sort by arrival time
        sorted_procs = sorted(processes, key=lambda x: x.get('arrival', 0))
        
        gantt_chart = []
        current_time = 0
        waiting_times = []
        turnaround_times = []
        
        for proc in sorted_procs:
            arrival = proc.get('arrival', 0)
            burst = proc.get('burst', 1)
            
            # Wait if process hasn't arrived yet
            if current_time < arrival:
                current_time = arrival
            
            # Calculate metrics
            waiting_time = current_time - arrival
            waiting_times.append(waiting_time)
            
            # Add to Gantt chart
            gantt_chart.append({
                'process': proc['id'],
                'start': current_time,
                'end': current_time + burst,
                'color': f'hsl({hash(proc["id"]) % 360}, 70%, 60%)'
            })
            
            current_time += burst
            turnaround = current_time - arrival
            turnaround_times.append(turnaround)
        
        return {
            'gantt_chart': gantt_chart,
            'avg_waiting_time': sum(waiting_times) / len(waiting_times) if waiting_times else 0,
            'avg_turnaround_time': sum(turnaround_times) / len(turnaround_times) if turnaround_times else 0,
            'cpu_utilization': 100 - (0 if current_time > 0 else 100)
        }


class SJF:
    """Shortest Job First Scheduling"""
    
    @staticmethod
    def schedule(processes):
        """
        SJF: Execute shortest jobs first (non-preemptive)
        Minimizes average waiting time but requires knowing job length
        """
        # Sort by burst time
        sorted_procs = sorted(processes, key=lambda x: x.get('burst', 1))
        
        gantt_chart = []
        current_time = 0
        waiting_times = []
        turnaround_times = []
        
        for proc in sorted_procs:
            arrival = proc.get('arrival', 0)
            burst = proc.get('burst', 1)
            
            # Wait if process hasn't arrived yet
            if current_time < arrival:
                current_time = arrival
            
            # Calculate metrics
            waiting_time = current_time - arrival
            waiting_times.append(waiting_time)
            
            # Add to Gantt chart
            gantt_chart.append({
                'process': proc['id'],
                'start': current_time,
                'end': current_time + burst,
                'color': f'hsl({hash(proc["id"]) % 360}, 70%, 60%)'
            })
            
            current_time += burst
            turnaround = current_time - arrival
            turnaround_times.append(turnaround)
        
        return {
            'gantt_chart': gantt_chart,
            'avg_waiting_time': sum(waiting_times) / len(waiting_times) if waiting_times else 0,
            'avg_turnaround_time': sum(turnaround_times) / len(turnaround_times) if turnaround_times else 0,
            'cpu_utilization': 100 - (0 if current_time > 0 else 100)
        }


class RoundRobin:
    """Round Robin Scheduling"""
    
    @staticmethod
    def schedule(processes, time_quantum=2):
        """
        Round Robin: Each process gets equal time quantum
        Preemptive, ensures fair distribution, good for interactive systems
        """
        from collections import deque
        
        queue = deque([(p, p.get('burst', 1)) for p in processes])
        gantt_chart = []
        current_time = 0
        waiting_times = {p['id']: 0 for p in processes}
        turnaround_times = []
        
        while queue:
            proc, remaining = queue.popleft()
            
            burst = min(remaining, time_quantum)
            
            # Add to Gantt chart
            gantt_chart.append({
                'process': proc['id'],
                'start': current_time,
                'end': current_time + burst,
                'color': f'hsl({hash(proc["id"]) % 360}, 70%, 60%)'
            })
            
            current_time += burst
            remaining -= burst
            
            if remaining > 0:
                queue.append((proc, remaining))
            else:
                turnaround_times.append(current_time - proc.get('arrival', 0))
        
        return {
            'gantt_chart': gantt_chart,
            'avg_waiting_time': sum(waiting_times.values()) / len(waiting_times) if waiting_times else 0,
            'avg_turnaround_time': sum(turnaround_times) / len(turnaround_times) if turnaround_times else 0,
            'cpu_utilization': 100 - (0 if current_time > 0 else 100)
        }


class EnergyAware:
    """Energy-Aware CPU Scheduling"""
    
    @staticmethod
    def schedule(processes):
        """
        Energy-Aware: Minimize energy consumption while maintaining performance
        Considers both CPU time and idle time
        """
        # Sort by energy efficiency (burst time / power consumption)
        sorted_procs = sorted(
            processes,
            key=lambda x: x.get('burst', 1) / (x.get('priority', 1) + 1)
        )
        
        gantt_chart = []
        current_time = 0
        waiting_times = []
        turnaround_times = []
        total_energy = 0
        
        for proc in sorted_procs:
            arrival = proc.get('arrival', 0)
            burst = proc.get('burst', 1)
            
            # Wait if process hasn't arrived yet
            if current_time < arrival:
                current_time = arrival
            
            # Calculate metrics
            waiting_time = current_time - arrival
            waiting_times.append(waiting_time)
            
            # Energy = Execution time * Power consumption
            power = burst * (proc.get('priority', 1) * 0.5)
            total_energy += power
            
            # Add to Gantt chart
            gantt_chart.append({
                'process': proc['id'],
                'start': current_time,
                'end': current_time + burst,
                'color': f'hsl({hash(proc["id"]) % 360}, 70%, 60%)',
                'energy': power
            })
            
            current_time += burst
            turnaround = current_time - arrival
            turnaround_times.append(turnaround)
        
        return {
            'gantt_chart': gantt_chart,
            'avg_waiting_time': sum(waiting_times) / len(waiting_times) if waiting_times else 0,
            'avg_turnaround_time': sum(turnaround_times) / len(turnaround_times) if turnaround_times else 0,
            'cpu_utilization': 100 - (0 if current_time > 0 else 100),
            'total_energy': total_energy,
            'energy_efficiency': 100 - (total_energy / 100)  # Percentage efficiency
        }
