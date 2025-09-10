"""
Execution Engine for AI Prompt Executor

Handles the core execution logic with unit detection, error handling, and retry mechanisms.
"""

import logging
import asyncio
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime
import time

from .config_manager import ConfigManager, PromptConfig
from .state_manager import StateManager, ProgressState, ExecutionState
from .agent_handler import execute_agent_prompt, AgentExecutionResult, UnifiedAgentHandler
from .utils import detect_units, format_duration

logger = logging.getLogger(__name__)

class ExecutionStats:
    """Statistics for an execution session."""
    
    def __init__(self):
        self.total_executions = 0
        self.completed_executions = 0
        self.failed_executions = 0
        self.skipped_executions = 0
        self.total_duration = 0
        self.start_time = None
        self.end_time = None
        self.limit_hits = 0
        self.retries = 0

    @property
    def success_rate(self) -> float:
        """Calculate success rate percentage."""
        total_attempted = self.completed_executions + self.failed_executions
        return (self.completed_executions / total_attempted * 100) if total_attempted > 0 else 0.0
    
    @property
    def duration(self) -> int:
        """Get total execution duration in seconds."""
        if self.start_time and self.end_time:
            return int((self.end_time - self.start_time).total_seconds())
        return 0

class ExecutionEngine:
    """Core execution engine for running AI prompts."""
    
    def __init__(self, config_manager: ConfigManager, state_manager: StateManager):
        self.config_manager = config_manager
        self.state_manager = state_manager
        self.logger = logging.getLogger(f"{__name__}.ExecutionEngine")
        
        # Initialize unified agent handler and load agent configurations
        self.agent_handler = UnifiedAgentHandler()
        self.agents_config = self.config_manager.load_agents_config()
        
        # Execution state
        self.is_running = False
        self.should_stop = False
        self.current_stats = ExecutionStats()
        
    def get_available_agents(self) -> List[str]:
        """Get list of available agents."""
        agents = list(set(agent.get('agent_name', 'unknown') for agent in self.agents_config.get('agents', [])))
        return sorted(agents)
    
    def get_agent_config(self, agent_name: str) -> Optional[Dict[str, Any]]:
        """Get configuration for specific agent."""
        for agent in self.agents_config.get('agents', []):
            if agent.get('agent_name') == agent_name:
                return agent
        return None
    
    def detect_available_units(self) -> List[str]:
        """Detect available unit directories."""
        units = detect_units()
        self.logger.info(f"Detected {len(units)} units: {units}")
        return units
    
    def calculate_execution_plan(self, prompts: List[PromptConfig], agent_name: str, 
                               force_restart: bool = False) -> Dict[str, Any]:
        """Calculate execution plan for given prompts with resumption support."""
        available_units = self.detect_available_units()
        plan = {
            'agent_name': agent_name,
            'prompts': [],
            'total_executions': 0,
            'estimated_duration': 0,
            'units_detected': len(available_units),
            'available_units': available_units,
            'has_resumable_prompts': False
        }
        
        for prompt in prompts:
            prompt_plan = {
                'prompt_id': prompt.id,
                'scope_type': prompt.scope_type,
                'executions': [],
                'resumption_info': None
            }
            
            if prompt.scope_type == 'per-unit':
                # Get resumption information
                resumption_info = self.state_manager.get_resumption_options(
                    prompt.id, agent_name, available_units
                )
                prompt_plan['resumption_info'] = resumption_info
                
                # Check if this is a resumable prompt
                if resumption_info['can_resume'] and not force_restart:
                    remaining_units = resumption_info['remaining_units']
                    plan['has_resumable_prompts'] = True
                else:
                    remaining_units = available_units
                    
                prompt_plan['execution_count'] = len(remaining_units)
                
                for unit in remaining_units:
                    prompt_plan['executions'].append({
                        'unit': unit,
                        'status': 'pending'
                    })
                    
            else:  # single execution
                if not self.state_manager.is_prompt_completed(prompt.id, agent_name) or force_restart:
                    prompt_plan['execution_count'] = 1
                    prompt_plan['executions'].append({
                        'unit': None,
                        'status': 'pending'
                    })
                else:
                    prompt_plan['execution_count'] = 0
                    prompt_plan['status'] = 'already_completed'
            
            plan['prompts'].append(prompt_plan)
            plan['total_executions'] += prompt_plan.get('execution_count', 0)
        
        # Estimate duration (rough estimate based on average execution time)
        plan['estimated_duration'] = plan['total_executions'] * 120  # 2 minutes per execution
        
        return plan
    
    async def handle_resumption_choice(self, prompt: PromptConfig, agent_name: str, 
                                     choice: str) -> bool:
        """Handle user's resumption choice for a partially completed prompt.
        
        Args:
            prompt: The prompt configuration
            agent_name: The agent name
            choice: 'resume', 'restart', or 'skip'
            
        Returns:
            True if execution should proceed, False if skipped
        """
        if choice == 'skip':
            return False
        elif choice == 'restart':
            # Clear all execution state for this prompt
            success = self.state_manager.clear_prompt_execution_state(prompt.id, agent_name)
            if success:
                self.logger.info(f"Cleared execution state for prompt {prompt.id}")
            else:
                self.logger.warning(f"Failed to clear execution state for prompt {prompt.id}")
            return True
        elif choice == 'resume':
            # Continue from where we left off - no state clearing needed
            return True
        elif choice == 'force':
            # Force re-execution: clear state and continue
            success = self.state_manager.clear_prompt_execution_state(prompt.id, agent_name)
            if success:
                self.logger.info(f"Force re-execution: cleared state for prompt {prompt.id}")
            return True
        else:
            raise ValueError(f"Invalid resumption choice: {choice}")
    
    async def execute_prompts(self, agent: str, prompts: List[PromptConfig], 
                            resumption_choices: Optional[Dict[str, str]] = None,
                            progress_callback: Optional[callable] = None) -> Dict[str, Any]:
        """Execute a list of prompts with the specified agent."""
        if self.is_running:
            raise RuntimeError("Execution already in progress")
        
        agent_name = agent  # For backward compatibility
        
        self.is_running = True
        self.should_stop = False
        self.current_stats = ExecutionStats()
        self.current_stats.start_time = datetime.now()
        
        try:
            agent_config = self.get_agent_config(agent_name)
            if not agent_config:
                raise ValueError(f"No configuration available for agent: {agent_name}")
            
            # Log agent configuration for execution mode
            self.logger.info(f"Using agent configuration: {agent_config.get('name')} ({agent_config.get('id')})")
            if agent_config.get('edit_permissions'):
                self.logger.info(f"YOLO mode enabled: {agent_config.get('yolo_mode')}")
            
            # Calculate execution plan
            execution_plan = self.calculate_execution_plan(prompts, agent_name)
            self.current_stats.total_executions = execution_plan['total_executions']
            
            self.logger.info(f"Starting execution of {len(prompts)} prompts with {agent_name}")
            self.logger.info(f"Total executions needed: {self.current_stats.total_executions}")
            
            # Store results for return
            results = {}
            
            # Execute each prompt
            for prompt in prompts:
                if self.should_stop:
                    self.logger.info("Execution stopped by user request")
                    break
                
                # Handle resumption for per-unit prompts
                if prompt.execution_scope == 'per-unit' and resumption_choices:
                    choice = resumption_choices.get(prompt.id, 'resume')
                    resumption_info = self.handle_resumption_choice(prompt, agent_name, choice)
                    if not resumption_info.get('should_execute', True):
                        self.logger.info(f"Skipping prompt [{prompt.id}] by user choice")
                        continue
                    
                prompt_results = await self._execute_single_prompt(prompt, agent_config, progress_callback)
                results[prompt.id] = prompt_results
                
            self.current_stats.end_time = datetime.now()
            self.logger.info(f"Execution completed in {format_duration(self.current_stats.duration)}")
            
            return results
            
        finally:
            self.is_running = False
    
    async def _execute_single_prompt(self, prompt: PromptConfig, agent_config: Dict[str, Any],
                                   progress_callback: Optional[callable] = None) -> Dict[str, Any]:
        """Execute a single prompt, handling both single and per-unit scopes."""
        self.logger.info(f"Executing prompt [{prompt.id}]: {prompt.short_name or prompt.id}")
        
        if progress_callback:
            await progress_callback(prompt_name=prompt.short_name or prompt.id)
        
        if prompt.execution_scope == 'per-unit':
            return await self._execute_per_unit_prompt(prompt, agent_config, progress_callback)
        else:
            return await self._execute_single_scope_prompt(prompt, agent_config, progress_callback)
    
    async def _execute_per_unit_prompt(self, prompt: PromptConfig, agent_config: Dict[str, Any],
                                     progress_callback: Optional[callable] = None) -> Dict[str, Any]:
        """Execute a prompt for multiple units."""
        agent_name = agent_config.get('agent_name', 'unknown')
        available_units = self.detect_available_units()
        completed_units = self.state_manager.get_completed_units(prompt.id, agent_name)
        remaining_units = [u for u in available_units if u not in completed_units]
        
        self.logger.info(f"Executing for {len(remaining_units)} units: {remaining_units}")
        
        executions = []
        
        for unit in remaining_units:
            if self.should_stop:
                break
                
            self.logger.info(f"  -> Executing for unit: {unit}")
            
            if progress_callback:
                await progress_callback(prompt_name=prompt.short_name or prompt.id, unit=unit)
            
            result = await self._execute_with_retry(prompt, agent_config, unit, progress_callback)
            
            execution_result = {
                'unit': unit,
                'status': 'completed' if result.success else 'failed',
                'duration': result.duration,
                'error': result.error,
                'timestamp': datetime.now().isoformat()
            }
            executions.append(execution_result)
            
            if result.success:
                self.logger.info(f"  ✅ {unit} completed in {format_duration(result.duration)}")
                self.current_stats.completed_executions += 1
                self.current_stats.total_duration += result.duration
                
                # Store result in YAML metadata
                await self._store_execution_result(prompt, unit, result, agent_name)
                
                # Update progress callback with completion info
                if progress_callback:
                    await progress_callback(duration=result.duration, success=True)
                
            else:
                self.logger.error(f"  ❌ {unit} failed: {result.error}")
                self.current_stats.failed_executions += 1
                await self._store_execution_result(prompt, unit, result, handler.agent_name)
                
                # Update progress callback with failure info
                if progress_callback:
                    await progress_callback(duration=result.duration, success=False)
        
        return {
            'status': 'completed' if all(e['status'] == 'completed' for e in executions) else 'partial',
            'executions': executions
        }
    
    async def _execute_single_scope_prompt(self, prompt: PromptConfig, agent_config: Dict[str, Any],
                                         progress_callback: Optional[callable] = None) -> Dict[str, Any]:
        """Execute a prompt with single scope."""
        agent_name = agent_config.get('agent_name', 'unknown')
        if self.state_manager.is_prompt_completed(prompt.id, agent_name):
            self.logger.info(f"  ⏭️ Already completed, skipping...")
            self.current_stats.skipped_executions += 1
            return {
                'status': 'skipped',
                'executions': [{'status': 'skipped', 'reason': 'already_completed'}]
            }
        
        result = await self._execute_with_retry(prompt, agent_config, None, progress_callback)
        
        execution_result = {
            'unit': None,
            'status': 'completed' if result.success else 'failed',
            'duration': result.duration,
            'error': result.error,
            'timestamp': datetime.now().isoformat()
        }
        
        if result.success:
            self.logger.info(f"  ✅ Completed in {format_duration(result.duration)}")
            self.current_stats.completed_executions += 1
            self.current_stats.total_duration += result.duration
            
            # Store result in YAML metadata
            await self._store_execution_result(prompt, None, result, agent_name)
            
            # Update progress callback with completion info
            if progress_callback:
                await progress_callback(duration=result.duration, success=True)
            
        else:
            self.logger.error(f"  ❌ Failed: {result.error}")
            self.current_stats.failed_executions += 1
            await self._store_execution_result(prompt, None, result, handler.agent_name)
            
            # Update progress callback with failure info
            if progress_callback:
                await progress_callback(duration=result.duration, success=False)
        
        return {
            'status': 'completed' if result.success else 'failed',
            'executions': [execution_result]
        }
    
    async def _store_execution_result(self, prompt: PromptConfig, unit: Optional[str], 
                                    result: AgentExecutionResult, agent_name: str):
        """Store execution result in both state manager and YAML metadata."""
        # Store in state manager
        execution_state = ExecutionState(
            prompt_id=prompt.id,
            agent_name=agent_name,
            unit=unit,
            status='completed' if result.success else 'failed',
            start_time=datetime.now().isoformat(),
            end_time=datetime.now().isoformat(),
            duration=result.duration,
            result=result.output[:1000] if result.success else None,
            error_message=result.error if not result.success else None,
            retry_count=0
        )
        
        states = self.state_manager.load_execution_states(agent_name)
        
        # Update existing state or add new one
        updated = False
        for i, state in enumerate(states):
            if state.prompt_id == prompt.id and state.unit == unit:
                states[i] = execution_state
                updated = True
                break
        
        if not updated:
            states.append(execution_state)
            
        self.state_manager.save_execution_states(agent_name, states)
        
        # Store in YAML metadata
        await self._update_yaml_metadata(prompt, unit, result, agent_name)
    
    async def _update_yaml_metadata(self, prompt: PromptConfig, unit: Optional[str], 
                                  result: AgentExecutionResult, agent_name: str):
        """Update the prompt's YAML metadata with execution results."""
        try:
            # Load current prompts
            all_prompts = self.config_manager.load_prompts()
            
            # Find the prompt to update
            for i, p in enumerate(all_prompts):
                if p.id == prompt.id:
                    # Ensure metadata.execution structure exists
                    if not hasattr(p, 'metadata') or not p.metadata:
                        p.metadata = {}
                    if 'execution' not in p.metadata:
                        p.metadata['execution'] = {
                            'execution_command': getattr(p, 'execution_command', ''),
                            'scope_type': p.scope_type,
                            'total_iterations': 1,
                            'results': [],
                            'last_execution': None,
                            'execution_status': 'not_started'
                        }
                    
                    # Add execution result
                    execution_result = {
                        'unit': unit,
                        'timestamp': datetime.now().isoformat(),
                        'duration': result.duration,
                        'success': result.success,
                        'agent_name': agent_name,
                        'output_preview': result.output[:500] if result.success else None,
                        'error_message': result.error if not result.success else None
                    }
                    
                    p.metadata['execution']['results'].append(execution_result)
                    p.metadata['execution']['last_execution'] = datetime.now().isoformat()
                    
                    # Update overall status
                    if prompt.scope_type == 'per-unit':
                        available_units = self.detect_available_units()
                        completed_units = self.state_manager.get_completed_units(prompt.id, agent_name)
                        if len(completed_units) >= len(available_units):
                            p.metadata['execution']['execution_status'] = 'completed'
                        else:
                            p.metadata['execution']['execution_status'] = 'partial'
                    else:
                        p.metadata['execution']['execution_status'] = 'completed' if result.success else 'failed'
                    
                    break
            
            # Save updated prompts back to YAML
            self.config_manager.save_prompts(all_prompts)
            
        except Exception as e:
            self.logger.error(f"Failed to update YAML metadata: {e}")

    async def _execute_with_retry(self, prompt: PromptConfig, agent_config: Dict[str, Any],
                                unit: Optional[str] = None, 
                                progress_callback: Optional[callable] = None,
                                max_retries: int = 3) -> AgentExecutionResult:
        """Execute a prompt with retry logic for limit handling."""
        agent_name = agent_config.get('agent_name', 'unknown')
        
        for attempt in range(max_retries + 1):
            if self.should_stop:
                return AgentExecutionResult(success=False, output="", error="Execution stopped")
            
            # Execute the prompt using unified handler 
            result = await self._run_prompt_async(prompt, agent_config, unit)
            
            if result.success:
                if attempt > 0:
                    self.current_stats.retries += attempt
                return result
            
            if result.limit_hit:
                self.current_stats.limit_hits += 1
                self.logger.warning(f"  ⏰ Limit reached for {agent_name}")
                # For now, don't retry on limits - just return the result
                break
                    
            else:
                # Non-limit error, don't retry
                break
        
        return result
    
    async def _run_prompt_async(self, prompt: PromptConfig, agent_config: Dict[str, Any], 
                              unit: Optional[str] = None) -> AgentExecutionResult:
        """Run a prompt asynchronously using unified agent handler."""
        # Create streaming callback if needed
        streaming_callback = getattr(self, '_streaming_callback', None)
        
        # Execute with unified handler in execution mode (yolo_run=True)
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, 
            execute_agent_prompt,
            prompt.prompt,          # prompt content
            agent_config,           # agent configuration from agents.yaml
            True,                   # yolo_run=True for execution mode
            None,                   # no timeout for execution mode
            streaming_callback,     # streaming callback
            unit                    # unit context
        )
        
        return result
    
    # Note: Removed _wait_for_reset_async as limit handling is now managed by the unified handler
    
    def stop_execution(self):
        """Request to stop the current execution."""
        self.should_stop = True
        self.logger.info("Stop requested - will halt after current prompt completes")
    
    def get_current_stats(self) -> ExecutionStats:
        """Get current execution statistics."""
        return self.current_stats
    
    def validate_execution_plan(self, prompts: List[PromptConfig], agent_name: str) -> List[str]:
        """Validate an execution plan and return any issues."""
        issues = []
        
        if not prompts:
            issues.append("No prompts selected for execution")
            return issues
        
        if agent_name not in self.handlers:
            issues.append(f"Unknown agent: {agent_name}")
            return issues
        
        # Check handler availability
        handler = self.handlers[agent_name]
        try:
            limit_reached, reset_time = handler.check_limits()
            if limit_reached:
                issues.append(f"{agent_name} has reached its limit. Reset at: {reset_time}")
        except Exception as e:
            issues.append(f"Failed to check {agent_name} limits: {e}")
        
        # Validate each prompt
        for prompt in prompts:
            if not prompt.execution_command:
                issues.append(f"Prompt {prompt.id} missing execution command")
                
            if prompt.scope_type not in ['single', 'per-unit']:
                issues.append(f"Prompt {prompt.id} has invalid scope type: {prompt.scope_type}")
        
        # Check unit detection for per-unit prompts
        per_unit_prompts = [p for p in prompts if p.scope_type == 'per-unit']
        if per_unit_prompts:
            available_units = self.detect_available_units()
            if not available_units:
                issues.append("No units detected for per-unit prompts")
        
        return issues