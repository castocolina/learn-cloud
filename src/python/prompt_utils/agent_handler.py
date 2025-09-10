"""
Centralized Agent Handler for AI Prompt Management
==================================================

Unified module for handling agent command construction and execution across
prompt_manager.py and prompt_executor.py systems. This handler manages agent
configuration, builds appropriate commands, and handles execution with proper
differentiation between plan mode and execution mode.

Key Features:
- Unified command construction for Claude and Gemini agents
- Dynamic integration of param_yolo_mode, edition_available, and param_continue
- Context-aware behavior (plan mode vs execution mode)  
- Robust error handling with detailed logging
- Timeout management for prompt manager
- Streaming support for prompt executor
"""

import subprocess
import asyncio
import threading
import time
import logging
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass
from datetime import datetime

# Import existing utilities for consistency
from .config_manager import ConfigManager

logger = logging.getLogger(__name__)

@dataclass 
class AgentExecutionResult:
    """Structured result from agent execution."""
    success: bool
    output: str
    error: Optional[str] = None
    duration: int = 0  # seconds
    timeout_occurred: bool = False
    fallback_used: bool = False
    model_used: Optional[str] = None
    command_executed: Optional[str] = None

class UnifiedAgentHandler:
    """
    Centralized handler for all agent operations.
    
    Manages command construction and execution for both prompt_manager 
    (plan mode) and prompt_executor (execution mode) with appropriate
    behavior differentiation.
    """
    
    def __init__(self):
        self.config_manager = ConfigManager()
        self.logger = logging.getLogger(__name__)
        
    def execute_agent_prompt(
        self, 
        prompt: str,
        agent_config: Dict[str, Any],
        yolo_run: bool = False,
        timeout: Optional[int] = None,
        streaming_callback: Optional[Callable] = None,
        unit: Optional[str] = None
    ) -> AgentExecutionResult:
        """
        Execute a prompt with the specified agent configuration.
        
        Args:
            prompt: The prompt content to send to the agent
            agent_config: Agent configuration from agents.yaml
            yolo_run: If True, enables param_yolo_mode/edition_available for execution mode.
                     If False, forces plan mode regardless of agent config.
            timeout: Execution timeout in seconds (only applied when yolo_run=False)
            streaming_callback: Optional callback for real-time output (execution mode only)
            unit: Optional unit identifier for context
            
        Returns:
            AgentExecutionResult with execution details and output
        """
        start_time = time.time()
        
        try:
            # Build command based on agent configuration and execution mode
            cmd = self._build_agent_command(agent_config, prompt, yolo_run)
            
            # Create command display string for logging/display
            cmd_display = self._build_command_display_string(agent_config, yolo_run)
            
            self.logger.info(f"Executing {agent_config.get('agent_name', 'unknown')} "
                           f"agent {'(execution mode)' if yolo_run else '(plan mode)'}: {cmd_display}")
            
            # Execute with appropriate method based on mode
            if yolo_run and streaming_callback:
                # Execution mode with streaming
                return self._execute_with_streaming(cmd, cmd_display, start_time, agent_config, streaming_callback)
            elif not yolo_run and timeout:
                # Plan mode with timeout
                return self._execute_with_timeout(cmd, cmd_display, start_time, agent_config, timeout)
            else:
                # Standard execution 
                return self._execute_standard(cmd, cmd_display, start_time, agent_config)
                
        except Exception as e:
            duration = int(time.time() - start_time)
            self.logger.error(f"Agent execution failed: {e}")
            
            return AgentExecutionResult(
                success=False,
                output="",
                error=f"Execution failed: {str(e)}",
                duration=duration
            )
    
    def _build_agent_command(self, agent_config: Dict[str, Any], prompt: str, yolo_run: bool) -> List[str]:
        """Build command list based on agent configuration and execution mode."""
        agent_name = agent_config.get('agent_name', 'unknown')
        
        if agent_name == 'claude':
            return self._build_claude_command(agent_config, prompt, yolo_run)
        elif agent_name == 'gemini':
            return self._build_gemini_command(agent_config, prompt, yolo_run)
        else:
            raise ValueError(f"Unsupported agent: {agent_name}")
    
    def _build_claude_command(self, agent_config: Dict[str, Any], prompt: str, yolo_run: bool) -> List[str]:
        """Build Claude-specific command."""
        cmd = ["claude"]
        
        # Model selection
        model = agent_config.get('model')
        if model:
            cmd.extend(["--model", model])
        
        # Fallback model (Claude-specific feature)
        fallback_model = agent_config.get('fallback_model')
        if fallback_model:
            cmd.extend(["--fallback-model", fallback_model])
        
        # YOLO mode and edition permissions (only in execution mode)
        if yolo_run:
            param_yolo_mode = agent_config.get('param_yolo_mode')
            edition_available = agent_config.get('edition_available', False)
            
            if edition_available and param_yolo_mode:
                cmd.append(param_yolo_mode)  # Should be "--dangerously-skip-permissions"
                
            # Continue parameter for session continuation
            param_continue = agent_config.get('param_continue')
            if param_continue:
                cmd.append(param_continue)  # Should be "--continue"
        
        # Add prompt
        cmd.extend(["-p", prompt])
        
        return cmd
    
    def _build_gemini_command(self, agent_config: Dict[str, Any], prompt: str, yolo_run: bool) -> List[str]:
        """Build Gemini-specific command."""
        cmd = ["gemini"]
        
        # Model selection
        model = agent_config.get('model')
        if model:
            cmd.extend(["-m", model])
        
        # YOLO mode (only in execution mode) 
        if yolo_run:
            param_yolo_mode = agent_config.get('param_yolo_mode')
            edition_available = agent_config.get('edition_available', False)
            
            if edition_available and param_yolo_mode:
                cmd.append(param_yolo_mode)  # Should be "--yolo"
        
        # Gemini always uses -a flag
        cmd.extend(["-a", "-p", prompt])
        
        return cmd
    
    def _build_command_display_string(self, agent_config: Dict[str, Any], yolo_run: bool) -> str:
        """Build command display string for logging (with prompt placeholder)."""
        agent_name = agent_config.get('agent_name', 'unknown')
        
        if agent_name == 'claude':
            base = f"claude --model {agent_config.get('model', 'unknown')}"
            
            fallback = agent_config.get('fallback_model')
            if fallback:
                base += f" --fallback-model {fallback}"
            
            if yolo_run:
                param_yolo_mode = agent_config.get('param_yolo_mode')
                edition_available = agent_config.get('edition_available', False)
                param_continue = agent_config.get('param_continue')
                
                if edition_available and param_yolo_mode:
                    base += f" {param_yolo_mode}"
                if param_continue:
                    base += f" {param_continue}"
            
            return f"{base} -p \"[PROMPT_CONTENT]\""
            
        elif agent_name == 'gemini':
            base = f"gemini -m {agent_config.get('model', 'unknown')}"
            
            if yolo_run:
                param_yolo_mode = agent_config.get('param_yolo_mode')
                edition_available = agent_config.get('edition_available', False)
                
                if edition_available and param_yolo_mode:
                    base += f" {param_yolo_mode}"
            
            return f"{base} -a -p \"[PROMPT_CONTENT]\""
        
        return f"{agent_name} -p \"[PROMPT_CONTENT]\""
    
    def _execute_standard(self, cmd: List[str], cmd_display: str, start_time: float, 
                         agent_config: Dict[str, Any]) -> AgentExecutionResult:
        """Standard synchronous execution."""
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            duration = int(time.time() - start_time)
            
            if result.returncode == 0:
                return AgentExecutionResult(
                    success=True,
                    output=result.stdout.strip(),
                    duration=duration,
                    model_used=agent_config.get('model'),
                    command_executed=cmd_display
                )
            else:
                return AgentExecutionResult(
                    success=False,
                    output=result.stdout.strip(),
                    error=result.stderr.strip(),
                    duration=duration,
                    model_used=agent_config.get('model'),
                    command_executed=cmd_display
                )
                
        except Exception as e:
            duration = int(time.time() - start_time)
            return AgentExecutionResult(
                success=False,
                output="",
                error=str(e),
                duration=duration,
                command_executed=cmd_display
            )
    
    def _execute_with_timeout(self, cmd: List[str], cmd_display: str, start_time: float,
                             agent_config: Dict[str, Any], timeout: int) -> AgentExecutionResult:
        """Execute with timeout and fallback support (for prompt_manager plan mode)."""
        agent_name = agent_config.get('agent_name')
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
            duration = int(time.time() - start_time)
            
            if result.returncode == 0:
                # Filter output for clean response (especially for Gemini)
                filtered_output = self._filter_agent_output(result.stdout, agent_name)
                
                return AgentExecutionResult(
                    success=True,
                    output=filtered_output,
                    duration=duration,
                    model_used=agent_config.get('model'),
                    command_executed=cmd_display
                )
            else:
                return AgentExecutionResult(
                    success=False,
                    output=result.stdout.strip(),
                    error=result.stderr.strip(),
                    duration=duration,
                    model_used=agent_config.get('model'),
                    command_executed=cmd_display
                )
                
        except subprocess.TimeoutExpired:
            duration = int(time.time() - start_time)
            
            # Try fallback model if available and not Claude (Claude handles fallback internally)
            fallback_model = agent_config.get('fallback_model')
            if fallback_model and agent_name != 'claude':
                self.logger.info(f"Timeout occurred, trying fallback model: {fallback_model}")
                
                return self._execute_fallback(cmd, cmd_display, agent_config, fallback_model, timeout, start_time)
            
            return AgentExecutionResult(
                success=False,
                output="",
                error=f"Timeout after {timeout}s waiting for {agent_config.get('model', 'unknown')} response",
                duration=duration,
                timeout_occurred=True,
                command_executed=cmd_display
            )
            
        except Exception as e:
            duration = int(time.time() - start_time)
            return AgentExecutionResult(
                success=False,
                output="",
                error=str(e),
                duration=duration,
                command_executed=cmd_display
            )
    
    def _execute_fallback(self, original_cmd: List[str], original_cmd_display: str,
                         agent_config: Dict[str, Any], fallback_model: str,
                         timeout: int, original_start_time: float) -> AgentExecutionResult:
        """Execute with fallback model."""
        agent_name = agent_config.get('agent_name')
        
        # Build fallback command by replacing the model
        fallback_cmd = original_cmd.copy()
        if agent_name == 'gemini':
            # For Gemini: replace -m model_name with -m fallback_model  
            try:
                model_index = fallback_cmd.index('-m')
                fallback_cmd[model_index + 1] = fallback_model
            except ValueError:
                self.logger.error("Could not find -m parameter for fallback")
                return AgentExecutionResult(
                    success=False,
                    output="",
                    error="Fallback command construction failed",
                    duration=int(time.time() - original_start_time)
                )
        
        fallback_cmd_display = original_cmd_display.replace(
            agent_config.get('model', 'unknown'), fallback_model
        )
        
        try:
            fallback_start = time.time()
            result = subprocess.run(fallback_cmd, capture_output=True, text=True, timeout=timeout)
            duration = int(time.time() - original_start_time)  # Total duration from original start
            
            if result.returncode == 0:
                filtered_output = self._filter_agent_output(result.stdout, agent_name)
                
                return AgentExecutionResult(
                    success=True,
                    output=filtered_output,
                    duration=duration,
                    fallback_used=True,
                    model_used=f"{agent_config.get('model')} → {fallback_model}",
                    command_executed=fallback_cmd_display
                )
            else:
                return AgentExecutionResult(
                    success=False,
                    output=result.stdout.strip(),
                    error=f"Fallback model error: {result.stderr.strip()}",
                    duration=duration,
                    fallback_used=True,
                    model_used=fallback_model,
                    command_executed=fallback_cmd_display
                )
                
        except subprocess.TimeoutExpired:
            duration = int(time.time() - original_start_time)
            return AgentExecutionResult(
                success=False,
                output="",
                error=f"Fallback model also timed out after {timeout}s",
                duration=duration,
                timeout_occurred=True,
                fallback_used=True,
                command_executed=fallback_cmd_display
            )
            
        except Exception as e:
            duration = int(time.time() - original_start_time)
            return AgentExecutionResult(
                success=False,
                output="",
                error=f"Fallback execution failed: {str(e)}",
                duration=duration,
                fallback_used=True,
                command_executed=fallback_cmd_display
            )
    
    def _execute_with_streaming(self, cmd: List[str], cmd_display: str, start_time: float,
                               agent_config: Dict[str, Any], streaming_callback: Callable) -> AgentExecutionResult:
        """Execute with streaming support (for prompt_executor execution mode)."""
        # This is a placeholder for async streaming support
        # For now, fall back to standard execution
        return self._execute_standard(cmd, cmd_display, start_time, agent_config)
    
    def _filter_agent_output(self, output: str, agent_name: str) -> str:
        """Filter agent output to remove CLI noise and extract clean response."""
        if not output:
            return ""
            
        if agent_name == 'gemini':
            # Filter out gemini CLI messages and extract YAML blocks
            output_lines = output.strip().split('\n')
            filtered_lines = []
            yaml_started = False
            
            for line in output_lines:
                if line.strip().startswith('```yaml'):
                    yaml_started = True
                    filtered_lines.append(line)
                elif line.strip().startswith('```') and yaml_started:
                    filtered_lines.append(line)
                    break
                elif yaml_started:
                    filtered_lines.append(line)
            
            if filtered_lines:
                return '\n'.join(filtered_lines)
        
        # For Claude or unfiltered output, return as-is
        return output.strip()

# Convenience function for easy imports
def execute_agent_prompt(
    prompt: str,
    agent_config: Dict[str, Any], 
    yolo_run: bool = False,
    timeout: Optional[int] = None,
    streaming_callback: Optional[Callable] = None,
    unit: Optional[str] = None
) -> AgentExecutionResult:
    """
    Convenience function to execute an agent prompt.
    
    Args:
        prompt: The prompt content to send to the agent
        agent_config: Agent configuration from agents.yaml
        yolo_run: If True, enables execution mode with param_yolo_mode/edition_available.
                 If False, forces plan mode regardless of agent config.
        timeout: Execution timeout in seconds (plan mode only)
        streaming_callback: Optional callback for real-time output (execution mode only)
        unit: Optional unit identifier for context
        
    Returns:
        AgentExecutionResult with execution details and output
    """
    handler = UnifiedAgentHandler()
    return handler.execute_agent_prompt(
        prompt=prompt,
        agent_config=agent_config,
        yolo_run=yolo_run,
        timeout=timeout,
        streaming_callback=streaming_callback,
        unit=unit
    )