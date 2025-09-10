"""
Agent Handlers for AI Prompt Executor
=====================================

Handles execution of prompts for different AI agents (Claude, Gemini)
with specific features and capabilities for each agent.
"""

import subprocess
import asyncio
import logging
import time
import json
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class AgentExecutionResult:
    """Result from executing a prompt with an agent."""
    success: bool
    output: str
    error: Optional[str] = None
    duration: int = 0  # seconds
    retry_count: int = 0
    limit_hit: bool = False
    model_used: Optional[str] = None

class BaseAgentHandler:
    """Base class for agent handlers."""
    
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.logger = logging.getLogger(f"{__name__}.{agent_name}")
    
    async def execute_prompt(self, prompt: str, unit: Optional[str] = None, 
                           context: Dict[str, Any] = None) -> AgentExecutionResult:
        """Execute a prompt with this agent."""
        raise NotImplementedError("Subclasses must implement execute_prompt")
    
    def build_command(self, prompt: str, unit: Optional[str] = None, 
                     context: Dict[str, Any] = None) -> List[str]:
        """Build the command line for executing this prompt."""
        raise NotImplementedError("Subclasses must implement build_command")

class ClaudeHandler(BaseAgentHandler):
    """Handler for Claude agent with advanced features."""
    
    def __init__(self):
        super().__init__("claude")
        self.conversation_context = {}  # Track conversations for --continue
    
    def initialize_session(self):
        """Initialize Claude session for execution."""
        # Reset conversation context for new session
        self.conversation_context.clear()
        self.logger.info("Claude session initialized - conversation context cleared")
    
    async def execute_prompt(self, prompt: str, unit: Optional[str] = None, 
                           context: Dict[str, Any] = None) -> AgentExecutionResult:
        """Execute a prompt with Claude, supporting advanced features and streaming."""
        start_time = time.time()
        context = context or {}
        
        # Build command with Claude-specific features
        cmd = self.build_command(prompt, unit, context)
        
        try:
            # Show command structure without the full prompt content
            cmd_preview = cmd[:-1] + ['[PROMPT_CONTENT]']  # Replace prompt with placeholder
            self.logger.info(f"Executing Claude command for unit {unit or 'global'}: {' '.join(cmd_preview)}")
            
            # Execute command with streaming support
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            # Capture output with streaming callback if provided
            streaming_callback = context.get('streaming_callback')
            full_output = ""
            full_error = ""
            
            # Read stdout and stderr concurrently
            async def read_stdout():
                nonlocal full_output
                while True:
                    chunk = await process.stdout.read(1024)
                    if not chunk:
                        break
                    chunk_text = chunk.decode('utf-8', errors='replace')
                    full_output += chunk_text
                    if streaming_callback:
                        await streaming_callback(chunk_text, 'stdout')
            
            async def read_stderr():
                nonlocal full_error
                while True:
                    chunk = await process.stderr.read(1024)
                    if not chunk:
                        break
                    chunk_text = chunk.decode('utf-8', errors='replace')
                    full_error += chunk_text
                    if streaming_callback:
                        await streaming_callback(chunk_text, 'stderr')
            
            # Wait for both streams and process completion
            await asyncio.gather(read_stdout(), read_stderr())
            await process.wait()
            
            duration = int(time.time() - start_time)
            
            if process.returncode == 0:
                output = full_output.strip()
                
                # Update conversation context for --continue feature
                if unit and context.get('execution_scope') == 'per-unit':
                    self.conversation_context[unit] = {
                        'last_prompt': prompt,
                        'last_output': output,
                        'timestamp': datetime.now().isoformat()
                    }
                
                # Determine which model was actually used
                model_used = context.get('model', 'sonnet')
                if 'fallback' in output.lower() or 'switched to' in output.lower():
                    # Indicate fallback was used if detected in output
                    model_used = f"{model_used} → {context.get('fallback_model', 'fallback')}"
                
                return AgentExecutionResult(
                    success=True,
                    output=output,
                    duration=duration,
                    model_used=model_used
                )
            else:
                error_msg = full_error.strip()
                
                # Check for limit hits
                limit_hit = 'limit' in error_msg.lower() or 'quota' in error_msg.lower()
                
                return AgentExecutionResult(
                    success=False,
                    output=full_output.strip(),
                    error=error_msg,
                    duration=duration,
                    limit_hit=limit_hit,
                    model_used=context.get('model', 'sonnet')
                )
                
        except Exception as e:
            duration = int(time.time() - start_time)
            self.logger.error(f"Claude execution failed: {e}")
            
            return AgentExecutionResult(
                success=False,
                output="",
                error=str(e),
                duration=duration
            )
    
    def build_command(self, prompt: str, unit: Optional[str] = None, 
                     context: Dict[str, Any] = None) -> List[str]:
        """Build Claude command with advanced features."""
        context = context or {}
        
        cmd = ["claude"]
        
        # Model selection
        if context.get('model'):
            cmd.extend(["--model", context['model']])
        
        # Fallback model for reliability - critical for complex Claude tasks
        fallback_model = context.get('fallback_model')
        if fallback_model:
            cmd.extend(["--fallback-model", fallback_model])
            self.logger.info(f"Configured fallback model: {fallback_model}")
        
        # Continue conversation for iterative per-unit prompts
        if (unit and context.get('execution_scope') == 'per-unit' and 
            context.get('iteration', 1) > 1 and unit in self.conversation_context):
            cmd.append("--continue")
            self.logger.info(f"Using --continue for unit {unit} (iteration {context.get('iteration', 1)})")
        
        # Output format for structured responses
        output_format = context.get('output_format')
        if output_format:
            cmd.extend(["--output-format", output_format])
            
            # Enable partial messages for streaming JSON
            if output_format == 'json' and context.get('enable_streaming'):
                cmd.append("--include-partial-messages")
                self.logger.info("Enabled JSON streaming with partial messages")
        
        # Add prompt
        cmd.extend(["-p", prompt])
        
        return cmd

class GeminiHandler(BaseAgentHandler):
    """Handler for Gemini agent with checkpointing and YOLO features."""
    
    def __init__(self):
        super().__init__("gemini")
    
    async def execute_prompt(self, prompt: str, unit: Optional[str] = None, 
                           context: Dict[str, Any] = None) -> AgentExecutionResult:
        """Execute a prompt with Gemini, supporting checkpointing and YOLO."""
        start_time = time.time()
        context = context or {}
        
        # Build command with Gemini-specific features
        cmd = self.build_command(prompt, unit, context)
        
        try:
            self.logger.info(f"Executing Gemini command for unit {unit or 'global'}")
            
            # Execute command
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            duration = int(time.time() - start_time)
            
            if process.returncode == 0:
                output = stdout.decode('utf-8').strip()
                
                return AgentExecutionResult(
                    success=True,
                    output=output,
                    duration=duration,
                    model_used=context.get('model', 'gemini-2.0-flash-exp')
                )
            else:
                error_msg = stderr.decode('utf-8').strip()
                
                # Check for limit hits
                limit_hit = ('quota' in error_msg.lower() or 
                           'limit' in error_msg.lower() or
                           'rate limit' in error_msg.lower())
                
                return AgentExecutionResult(
                    success=False,
                    output=stdout.decode('utf-8').strip(),
                    error=error_msg,
                    duration=duration,
                    limit_hit=limit_hit,
                    model_used=context.get('model', 'gemini-2.0-flash-exp')
                )
                
        except Exception as e:
            duration = int(time.time() - start_time)
            self.logger.error(f"Gemini execution failed: {e}")
            
            return AgentExecutionResult(
                success=False,
                output="",
                error=str(e),
                duration=duration
            )
    
    def build_command(self, prompt: str, unit: Optional[str] = None, 
                     context: Dict[str, Any] = None) -> List[str]:
        """Build Gemini command with checkpointing and YOLO features."""
        context = context or {}
        
        cmd = ["gemini"]
        
        # Model selection
        if context.get('model'):
            cmd.extend(["-m", context['model']])
        
        # Enable checkpointing for reliable execution
        if context.get('enable_checkpointing', True):
            cmd.append("--checkpointing")
            self.logger.info("Enabled checkpointing for reliable execution")
        
        # Enable YOLO mode for unattended execution
        if context.get('enable_yolo', True):
            cmd.append("--yolo")
            self.logger.info("Enabled YOLO mode for unattended execution")
        
        # Add prompt
        cmd.extend(["-a", "-p", prompt])
        
        return cmd

def get_agent_handler(agent_name: str) -> Optional[BaseAgentHandler]:
    """Get the appropriate handler for an agent."""
    handlers = {
        'claude': ClaudeHandler,
        'gemini': GeminiHandler
    }
    
    handler_class = handlers.get(agent_name.lower())
    if handler_class:
        return handler_class()
    
    logger.warning(f"No handler found for agent: {agent_name}")
    return None