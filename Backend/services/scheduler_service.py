"""CPU scheduling algorithms service"""

from datetime import datetime


class SchedulerService:
    """Service for scheduling algorithms"""
    
    @staticmethod
    def schedule(algorithm, processes):
        """
        Run scheduling algorithm
        
        Args:
            algorithm: Algorithm name ('fcfs', 'sjf', 'round-robin', 'energy-aware')
            processes: List of process dicts with 'id', 'arrival', 'burst'
        
        Returns:
            dict: Schedule result with metrics
        """
        if not processes:
            raise ValueError("No processes provided")
        
        if algorithm == 'fcfs':
            return SchedulerService.fcfs_schedule(processes)
        elif algorithm == 'sjf':
            return SchedulerService.sjf_schedule(processes)
        elif algorithm == 'round-robin':
            quantum = 4  # Default time quantum
            return SchedulerService.round_robin_schedule(processes, quantum)
        elif algorithm == 'energy-aware':
            return SchedulerService.energy_aware_schedule(processes)
        else:
            raise ValueError(f"Unknown algorithm: {algorithm}")
    
    @staticmethod
    def fcfs_schedule(processes):
        """First Come First Served scheduling"""
        gantt_chart = []
        current_time = 0
        waiting_times = {}
        turnaround_times = {}
        processes_sorted = sorted(processes, key=lambda p: p.get('arrival', 0))
        
        for proc in processes_sorted:
            proc_id = proc.get('id', f"P{processes.index(proc)}")
            burst = proc.get('burst', 1)
            arrival = proc.get('arrival', 0)
            
            # Process starts after all previous processes
            start_time = max(current_time, arrival)
            end_time = start_time + burst
            
            gantt_chart.append({
                'id': proc_id,
                'start': start_time,
                'end': end_time,
                'duration': burst,
                'color': f"hsl({len(gantt_chart) * 50}, 70%, 60%)"
            })
            
            waiting_times[proc_id] = max(0, start_time - arrival)
            turnaround_times[proc_id] = end_time - arrival
            current_time = end_time
        
        avg_waiting = sum(waiting_times.values()) / len(waiting_times) if waiting_times else 0
        avg_turnaround = sum(turnaround_times.values()) / len(turnaround_times) if turnaround_times else 0
        cpu_utilization = (current_time / (current_time + 10)) * 100 if current_time > 0 else 0
        
        return {
            'algorithm': 'FCFS',
            'gantt_chart': gantt_chart,
            'metrics': {
                'avg_waiting_time': round(avg_waiting, 2),
                'avg_turnaround_time': round(avg_turnaround, 2),
                'cpu_utilization': round(cpu_utilization, 2),
                'total_time': current_time,
                'total_energy': round(sum(p.get('burst', 1) for p in processes) * 0.5, 2)
            },
            'timestamp': datetime.now().isoformat()
        }
    
    @staticmethod
    def sjf_schedule(processes):
        """Shortest Job First scheduling"""
        gantt_chart = []
        current_time = 0
        waiting_times = {}
        turnaround_times = {}
        processes_copy = [p.copy() for p in processes]
        completed = set()
        
        while len(completed) < len(processes_copy):
            # Find next process that has arrived and is not completed
            available = [p for p in processes_copy 
                        if p.get('arrival', 0) <= current_time and p.get('id') not in completed]
            
            if not available:
                # Jump to next arrival time
                next_arrival = min([p.get('arrival', 0) for p in processes_copy 
                                   if p.get('id') not in completed])
                current_time = next_arrival
                available = [p for p in processes_copy 
                            if p.get('arrival', 0) <= current_time and p.get('id') not in completed]
            
            # Select shortest burst time
            next_proc = min(available, key=lambda p: p.get('burst', 1))
            proc_id = next_proc.get('id')
            burst = next_proc.get('burst', 1)
            start_time = current_time
            end_time = start_time + burst
            
            gantt_chart.append({
                'id': proc_id,
                'start': start_time,
                'end': end_time,
                'duration': burst,
                'color': f"hsl({len(gantt_chart) * 50}, 70%, 60%)"
            })
            
            waiting_times[proc_id] = max(0, start_time - next_proc.get('arrival', 0))
            turnaround_times[proc_id] = end_time - next_proc.get('arrival', 0)
            completed.add(proc_id)
            current_time = end_time
        
        avg_waiting = sum(waiting_times.values()) / len(waiting_times) if waiting_times else 0
        avg_turnaround = sum(turnaround_times.values()) / len(turnaround_times) if turnaround_times else 0
        cpu_utilization = (current_time / (current_time + 10)) * 100 if current_time > 0 else 0
        
        return {
            'algorithm': 'SJF',
            'gantt_chart': gantt_chart,
            'metrics': {
                'avg_waiting_time': round(avg_waiting, 2),
                'avg_turnaround_time': round(avg_turnaround, 2),
                'cpu_utilization': round(cpu_utilization, 2),
                'total_time': current_time,
                'total_energy': round(sum(p.get('burst', 1) for p in processes) * 0.5, 2)
            },
            'timestamp': datetime.now().isoformat()
        }
    
    @staticmethod
    def round_robin_schedule(processes, quantum=4):
        """Round Robin scheduling with time quantum"""
        gantt_chart = []
        queue = [p.copy() for p in processes]
        current_time = 0
        waiting_times = {}
        turnaround_times = {}
        arrival_times = {p.get('id'): p.get('arrival', 0) for p in processes}
        remaining_burst = {p.get('id'): p.get('burst', 1) for p in processes}
        
        while queue:
            proc = queue.pop(0)
            proc_id = proc.get('id')
            burst = remaining_burst[proc_id]
            
            execution_time = min(burst, quantum)
            remaining_burst[proc_id] -= execution_time
            
            gantt_chart.append({
                'id': proc_id,
                'start': current_time,
                'end': current_time + execution_time,
                'duration': execution_time,
                'color': f"hsl({sum(ord(c) for c in proc_id) % 360}, 70%, 60%)"
            })
            
            current_time += execution_time
            
            if remaining_burst[proc_id] > 0:
                queue.append(proc)
            else:
                turnaround_times[proc_id] = current_time - arrival_times[proc_id]
                waiting_times[proc_id] = turnaround_times[proc_id] - proc.get('burst', 1)
        
        avg_waiting = sum(waiting_times.values()) / len(waiting_times) if waiting_times else 0
        avg_turnaround = sum(turnaround_times.values()) / len(turnaround_times) if turnaround_times else 0
        cpu_utilization = (current_time / (current_time + 10)) * 100 if current_time > 0 else 0
        
        return {
            'algorithm': 'Round Robin',
            'gantt_chart': gantt_chart,
            'metrics': {
                'avg_waiting_time': round(avg_waiting, 2),
                'avg_turnaround_time': round(avg_turnaround, 2),
                'cpu_utilization': round(cpu_utilization, 2),
                'total_time': current_time,
                'time_quantum': quantum,
                'total_energy': round(sum(p.get('burst', 1) for p in processes) * 0.5, 2)
            },
            'timestamp': datetime.now().isoformat()
        }
    
    @staticmethod
    def energy_aware_schedule(processes):
        """Energy-Aware scheduling (prioritize low-energy processes)"""
        gantt_chart = []
        processes_copy = [p.copy() for p in processes]
        
        # Calculate energy score for each process
        for proc in processes_copy:
            cpu = proc.get('cpu', 25)
            burst = proc.get('burst', 1)
            proc['energy_score'] = cpu * burst
        
        # Sort by energy score (ascending - process low energy first)
        processes_sorted = sorted(processes_copy, key=lambda p: p.get('energy_score', 0))
        
        current_time = 0
        waiting_times = {}
        turnaround_times = {}
        
        for proc in processes_sorted:
            proc_id = proc.get('id')
            burst = proc.get('burst', 1)
            arrival = proc.get('arrival', 0)
            start_time = max(current_time, arrival)
            end_time = start_time + burst
            
            gantt_chart.append({
                'id': proc_id,
                'start': start_time,
                'end': end_time,
                'duration': burst,
                'energy_score': proc.get('energy_score', 0),
                'color': f"hsl({(proc.get('energy_score', 0) / 100) * 120}, 70%, 60%)"
            })
            
            waiting_times[proc_id] = max(0, start_time - arrival)
            turnaround_times[proc_id] = end_time - arrival
            current_time = end_time
        
        # Calculate energy efficiency
        total_energy = sum(p.get('energy_score', 0) for p in processes_copy)
        avg_waiting = sum(waiting_times.values()) / len(waiting_times) if waiting_times else 0
        avg_turnaround = sum(turnaround_times.values()) / len(turnaround_times) if turnaround_times else 0
        cpu_utilization = (current_time / (current_time + 10)) * 100 if current_time > 0 else 0
        
        return {
            'algorithm': 'Energy-Aware',
            'gantt_chart': gantt_chart,
            'metrics': {
                'avg_waiting_time': round(avg_waiting, 2),
                'avg_turnaround_time': round(avg_turnaround, 2),
                'cpu_utilization': round(cpu_utilization, 2),
                'total_time': current_time,
                'total_energy': round(total_energy * 0.5, 2),
                'energy_efficiency': round(100 - (total_energy / (len(processes_copy) * 100) * 100), 2)
            },
            'timestamp': datetime.now().isoformat()
        }
    
    @staticmethod
    def compare_algorithms(processes):
        """Compare all scheduling algorithms"""
        results = {}
        
        try:
            results['fcfs'] = SchedulerService.fcfs_schedule(processes)
            results['sjf'] = SchedulerService.sjf_schedule(processes)
            results['round_robin'] = SchedulerService.round_robin_schedule(processes)
            results['energy_aware'] = SchedulerService.energy_aware_schedule(processes)
        except Exception as e:
            raise Exception(f"Error comparing algorithms: {str(e)}")
        
        return {
            'comparison': results,
            'timestamp': datetime.now().isoformat()
        }
