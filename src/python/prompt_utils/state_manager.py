"""
State Manager for AI Prompt Executor

Handles persistence of execution states, progress tracking, and session management.
Integrates with unified prompt schema for consistent data handling.
"""

import logging
from pathlib import Path
from typing import Dict, List, Optional, Any, Set
from datetime import datetime, date
import json
from dataclasses import dataclass, asdict
from .utils import load_json_safe, save_json_safe
from .unified_schema import UnifiedPrompt, ExecutionResult, ExecutionMetadata

logger = logging.getLogger(__name__)

@dataclass
class ExecutionState:
    """State of a single prompt execution."""
    prompt_id: str
    agent_name: str
    unit: Optional[str]
    status: str  # 'pending', 'running', 'completed', 'failed'
    start_time: Optional[str]
    end_time: Optional[str]
    duration: Optional[int]  # seconds
    result: Optional[str]
    error_message: Optional[str]
    retry_count: int = 0

@dataclass  
class AgentLimitState:
    """State of agent limits and quotas."""
    agent_name: str
    limit_type: str  # '5h_cycle' for Claude, 'daily' for Gemini
    current_usage: int
    limit_reached: bool
    reset_time: Optional[str]
    last_reset: Optional[str]
    session_id: Optional[str] = None

@dataclass
class ProgressState:
    """Overall progress state for an execution session."""
    selected_prompts: List[str]
    agent_name: str
    total_executions: int
    completed_executions: int
    failed_executions: int
    start_time: str
    estimated_completion: Optional[str] = None
    current_prompt: Optional[str] = None

class StateManager:
    """Manages execution state persistence across sessions."""
    
    def __init__(self, state_dir: str = "tmp/states"):
        self.state_dir = Path(state_dir)
        self.state_dir.mkdir(parents=True, exist_ok=True)
        
    def _get_agent_state_file(self, agent_name: str) -> Path:
        """Get state file path for specific agent."""
        return self.state_dir / f"{agent_name}_state.json"
        
    def _get_execution_state_file(self, agent_name: str) -> Path:
        """Get execution state file path for specific agent."""
        return self.state_dir / f"{agent_name}_executions.json"
        
    def _get_progress_state_file(self) -> Path:
        """Get progress state file path."""
        return self.state_dir / "progress_state.json"
    
    def load_agent_state(self, agent_name: str) -> Optional[AgentLimitState]:
        """Load agent limit state from disk."""
        state_file = self._get_agent_state_file(agent_name)
        data = load_json_safe(state_file)
        
        if data:
            try:
                return AgentLimitState(**data)
            except Exception as e:
                logger.warning(f"Failed to parse agent state for {agent_name}: {e}")
                
        return None
    
    def save_agent_state(self, state: AgentLimitState) -> bool:
        """Save agent limit state to disk."""
        state_file = self._get_agent_state_file(state.agent_name)
        return save_json_safe(state_file, asdict(state))
    
    def load_execution_states(self, agent_name: str) -> List[ExecutionState]:
        """Load execution states for an agent."""
        state_file = self._get_execution_state_file(agent_name)
        data = load_json_safe(state_file)
        
        states = []
        for state_data in data.get('executions', []):
            try:
                states.append(ExecutionState(**state_data))
            except Exception as e:
                logger.warning(f"Failed to parse execution state: {e}")
                
        return states
    
    def save_execution_states(self, agent_name: str, states: List[ExecutionState]) -> bool:
        """Save execution states for an agent."""
        state_file = self._get_execution_state_file(agent_name)
        data = {
            'agent_name': agent_name,
            'last_updated': datetime.now().isoformat(),
            'executions': [asdict(state) for state in states]
        }
        return save_json_safe(state_file, data)
    
    def add_execution_state(self, state: ExecutionState) -> bool:
        """Add a new execution state."""
        states = self.load_execution_states(state.agent_name)
        
        # Remove any existing state for the same prompt/unit combination
        states = [s for s in states if not (s.prompt_id == state.prompt_id and s.unit == state.unit)]
        
        # Add the new state
        states.append(state)
        
        return self.save_execution_states(state.agent_name, states)
    
    def update_unified_prompt_execution(self, prompt_data: dict, execution_result: ExecutionResult) -> dict:
        """Update unified prompt structure with execution results."""
        try:
            # Create unified prompt from data
            unified_prompt = UnifiedPrompt.from_dict(prompt_data)
            
            # Update execution metadata with new result
            exec_meta = unified_prompt.execution_metadata
            exec_meta.add_result(execution_result)
            unified_prompt.execution_metadata = exec_meta
            
            return unified_prompt.to_dict()
        except Exception as e:
            logger.warning(f"Failed to update unified prompt execution: {e}")
            return prompt_data
    
    def update_execution_state(self, prompt_id: str, agent_name: str, unit: Optional[str], **updates) -> bool:
        """Update an existing execution state."""
        states = self.load_execution_states(agent_name)
        
        for state in states:
            if state.prompt_id == prompt_id and state.unit == unit:
                for key, value in updates.items():
                    if hasattr(state, key):
                        setattr(state, key, value)
                return self.save_execution_states(agent_name, states)
                
        # If not found, create new state
        state = ExecutionState(
            prompt_id=prompt_id,
            agent_name=agent_name,
            unit=unit,
            status='pending',
            start_time=None,
            end_time=None,
            duration=None,
            result=None,
            error_message=None
        )
        
        for key, value in updates.items():
            if hasattr(state, key):
                setattr(state, key, value)
                
        return self.add_execution_state(state)
    
    def get_execution_state(self, prompt_id: str, agent_name: str, unit: Optional[str] = None) -> Optional[ExecutionState]:
        """Get execution state for a specific prompt/unit combination."""
        states = self.load_execution_states(agent_name)
        
        for state in states:
            if state.prompt_id == prompt_id and state.unit == unit:
                return state
                
        return None
    
    def get_completed_units(self, prompt_id: str, agent_name: str) -> Set[str]:
        """Get set of completed units for a per-unit prompt."""
        states = self.load_execution_states(agent_name)
        
        completed_units = set()
        for state in states:
            if state.prompt_id == prompt_id and state.status == 'completed' and state.unit:
                completed_units.add(state.unit)
                
        return completed_units
    
    def get_prompt_execution_summary(self, prompt_id: str, agent_name: str) -> Dict[str, Any]:
        """Get comprehensive execution summary for a prompt."""
        states = self.load_execution_states(agent_name)
        prompt_states = [s for s in states if s.prompt_id == prompt_id]
        
        if not prompt_states:
            return {
                'status': 'not_started',
                'total_executions': 0,
                'completed_executions': 0,
                'failed_executions': 0,
                'units': {}
            }
        
        summary = {
            'status': 'in_progress',
            'total_executions': len(prompt_states),
            'completed_executions': len([s for s in prompt_states if s.status == 'completed']),
            'failed_executions': len([s for s in prompt_states if s.status == 'failed']),
            'units': {}
        }
        
        # Analyze unit-specific states
        for state in prompt_states:
            unit_key = state.unit or 'global'
            summary['units'][unit_key] = {
                'status': state.status,
                'start_time': state.start_time,
                'end_time': state.end_time,
                'duration': state.duration,
                'error_message': state.error_message,
                'retry_count': state.retry_count
            }
        
        # Determine overall status
        if summary['completed_executions'] == 0:
            summary['status'] = 'not_started' if summary['failed_executions'] == 0 else 'failed'
        elif summary['failed_executions'] == 0:
            summary['status'] = 'completed'
        else:
            summary['status'] = 'partial'
            
        return summary
    
    def get_resumption_options(self, prompt_id: str, agent_name: str, available_units: List[str]) -> Dict[str, Any]:
        """Get resumption options for a partially completed per-unit prompt."""
        from .utils import detect_units
        
        if not available_units:
            available_units = detect_units()
            
        completed_units = self.get_completed_units(prompt_id, agent_name)
        failed_units = set()
        pending_units = set()
        
        # Analyze execution states
        states = self.load_execution_states(agent_name)
        for state in states:
            if state.prompt_id == prompt_id and state.unit:
                if state.status == 'failed':
                    failed_units.add(state.unit)
                elif state.status in ['pending', 'running']:
                    pending_units.add(state.unit)
        
        # Calculate remaining units
        remaining_units = [u for u in available_units if u not in completed_units]
        
        return {
            'available_units': available_units,
            'completed_units': list(completed_units),
            'failed_units': list(failed_units),
            'pending_units': list(pending_units),
            'remaining_units': remaining_units,
            'can_resume': len(remaining_units) > 0,
            'completion_percentage': (len(completed_units) / len(available_units)) * 100 if available_units else 0
        }
    
    def clear_prompt_execution_state(self, prompt_id: str, agent_name: str, units_to_clear: Optional[List[str]] = None) -> bool:
        """Clear execution state for a prompt, optionally for specific units only."""
        states = self.load_execution_states(agent_name)
        
        if units_to_clear is None:
            # Clear all states for this prompt
            filtered_states = [s for s in states if s.prompt_id != prompt_id]
        else:
            # Clear only specified units
            filtered_states = []
            for state in states:
                if state.prompt_id == prompt_id and state.unit in units_to_clear:
                    continue  # Skip (remove) this state
                filtered_states.append(state)
        
        return self.save_execution_states(agent_name, filtered_states)

    def is_prompt_completed(self, prompt_id: str, agent_name: str, available_units: List[str] = None) -> bool:
        """Check if a prompt is fully completed."""
        states = self.load_execution_states(agent_name)
        prompt_states = [s for s in states if s.prompt_id == prompt_id]
        
        if not prompt_states:
            return False
            
        # For single-execution prompts
        if not available_units or len(available_units) == 0:
            return any(s.status == 'completed' and s.unit is None for s in prompt_states)
        
        # For per-unit prompts, check all units are completed
        completed_units = {s.unit for s in prompt_states if s.status == 'completed' and s.unit}
        return len(completed_units) == len(available_units)
    
    def save_progress_state(self, progress: ProgressState) -> bool:
        """Save overall progress state."""
        progress_file = self._get_progress_state_file()
        return save_json_safe(progress_file, asdict(progress))
    
    def load_progress_state(self) -> Optional[ProgressState]:
        """Load overall progress state."""
        progress_file = self._get_progress_state_file()
        data = load_json_safe(progress_file)
        
        if data:
            try:
                return ProgressState(**data)
            except Exception as e:
                logger.warning(f"Failed to parse progress state: {e}")
                
        return None
    
    def clear_progress_state(self) -> bool:
        """Clear the current progress state."""
        progress_file = self._get_progress_state_file()
        try:
            if progress_file.exists():
                progress_file.unlink()
            return True
        except Exception as e:
            logger.error(f"Failed to clear progress state: {e}")
            return False
    
    def get_agent_stats(self, agent_name: str) -> Dict[str, Any]:
        """Get execution statistics for an agent."""
        states = self.load_execution_states(agent_name)
        
        stats = {
            'total_executions': len(states),
            'completed': len([s for s in states if s.status == 'completed']),
            'failed': len([s for s in states if s.status == 'failed']),
            'pending': len([s for s in states if s.status == 'pending']),
            'running': len([s for s in states if s.status == 'running']),
            'total_duration': sum(s.duration or 0 for s in states),
            'last_execution': None
        }
        
        # Find last execution time
        last_times = [s.end_time or s.start_time for s in states if s.end_time or s.start_time]
        if last_times:
            stats['last_execution'] = max(last_times)
            
        return stats
    
    def cleanup_old_states(self, days: int = 30) -> int:
        """Clean up execution states older than specified days."""
        cutoff_date = datetime.now().timestamp() - (days * 24 * 60 * 60)
        cleaned_count = 0
        
        for agent_file in self.state_dir.glob("*_executions.json"):
            try:
                states = []
                data = load_json_safe(agent_file)
                
                for state_data in data.get('executions', []):
                    state = ExecutionState(**state_data)
                    
                    # Keep state if it's recent or still pending/running
                    keep_state = True
                    if state.end_time:
                        end_timestamp = datetime.fromisoformat(state.end_time).timestamp()
                        if end_timestamp < cutoff_date and state.status in ['completed', 'failed']:
                            keep_state = False
                            cleaned_count += 1
                    
                    if keep_state:
                        states.append(state)
                
                # Save cleaned states
                agent_name = agent_file.stem.replace('_executions', '')
                self.save_execution_states(agent_name, states)
                
            except Exception as e:
                logger.warning(f"Failed to clean up {agent_file}: {e}")
                
        logger.info(f"Cleaned up {cleaned_count} old execution states")
        return cleaned_count
    
    def reset_agent_state(self, agent_name: str) -> bool:
        """Reset all state for an agent (use with caution)."""
        try:
            agent_state_file = self._get_agent_state_file(agent_name)
            execution_state_file = self._get_execution_state_file(agent_name)
            
            if agent_state_file.exists():
                agent_state_file.unlink()
            if execution_state_file.exists():
                execution_state_file.unlink()
                
            logger.info(f"Reset all state for agent {agent_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to reset state for agent {agent_name}: {e}")
            return False
    
    def get_unified_execution_status(self, prompt_data: dict, available_units: List[str] = None) -> str:
        """Get execution status from unified prompt structure."""
        try:
            unified_prompt = UnifiedPrompt.from_dict(prompt_data)
            exec_meta = unified_prompt.execution_metadata
            
            # For single execution prompts
            if unified_prompt.execution_scope == 'single':
                if exec_meta.results:
                    latest_result = exec_meta.results[-1]
                    return latest_result.status
                return 'pending'
            
            # For per-unit execution prompts
            if available_units:
                completed_units = set()
                failed_units = set()
                pending_units = set(available_units)
                
                for result in exec_meta.results:
                    if result.unit in available_units:
                        pending_units.discard(result.unit)
                        if result.status == 'completed':
                            completed_units.add(result.unit)
                        elif result.status == 'failed':
                            failed_units.add(result.unit)
                
                if len(completed_units) == len(available_units):
                    return 'completed'
                elif len(completed_units) > 0:
                    return 'partial'
                elif len(failed_units) > 0:
                    return 'failed'
                else:
                    return 'pending'
            
            return exec_meta.execution_status
        except Exception as e:
            logger.warning(f"Failed to get unified execution status: {e}")
            return 'unknown'
    
    def migrate_legacy_execution_to_unified(self, prompt_data: dict) -> dict:
        """Migrate legacy execution data to unified schema."""
        try:
            # Check if already using unified schema
            if 'metadata' in prompt_data and 'execution' in prompt_data.get('metadata', {}):
                return prompt_data
            
            # Convert legacy data to unified format
            unified_prompt = UnifiedPrompt.from_legacy_prompt(prompt_data)
            return unified_prompt.to_dict()
            
        except Exception as e:
            logger.warning(f"Failed to migrate prompt {prompt_data.get('id', 'unknown')} to unified schema: {e}")
            return prompt_data