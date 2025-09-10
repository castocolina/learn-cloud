"""
TUI Interface for AI Prompt Executor

Provides an interactive terminal interface for selecting and executing prompts.
"""

import asyncio
import logging
from typing import List, Dict, Optional, Any
from datetime import datetime

try:
    from textual.app import App, ComposeResult
    from textual.containers import Container, Horizontal, Vertical
    from textual.widgets import (
        Header, Footer, Static, Button, Checkbox, 
        Label, ProgressBar, Log, DataTable, Select
    )
    from textual.screen import Screen
    from textual.reactive import reactive
    from rich.text import Text
    from rich.table import Table
    from rich.console import Console
    TEXTUAL_AVAILABLE = True
except ImportError:
    TEXTUAL_AVAILABLE = False
    # Fallback to simple CLI interface

from .config_manager import ConfigManager, PromptConfig
from .state_manager import StateManager, ProgressState
from .agent_handlers import ClaudeHandler, GeminiHandler
from .execution_engine import ExecutionEngine
from .utils import detect_units, format_duration

logger = logging.getLogger(__name__)

class PromptExecutorTUI:
    """Main TUI application for prompt execution."""
    
    def __init__(self, prompts_config: List[PromptConfig], 
                 state_manager: StateManager, 
                 config_manager: ConfigManager,
                 execution_engine: ExecutionEngine):
        self.prompts_config = prompts_config
        self.state_manager = state_manager
        self.config_manager = config_manager
        self.execution_engine = execution_engine
        self.selected_agent = None
        self.selected_prompts = []
        self.available_units = detect_units()
        
        # Get handlers from execution engine
        self.handlers = execution_engine.handlers
        
    async def run(self) -> int:
        """Run the TUI application."""
        if TEXTUAL_AVAILABLE:
            app = PromptExecutorApp(self)
            return await app.run_async()
        else:
            # Fallback to CLI interface
            return self._run_cli_interface()
    
    def _run_cli_interface(self) -> int:
        """Fallback CLI interface when textual is not available."""
        print("📋 AI Prompt Executor")
        print("=" * 50)
        
        # Get available agents
        available_agents = self.config_manager.get_available_agents()
        
        if not available_agents:
            print("❌ No agents found in configuration.")
            return 1
            
        # Agent selection
        print("\\n🤖 Available Agents:")
        for i, agent in enumerate(available_agents, 1):
            pending = len(self.config_manager.get_pending_prompts(agent))
            completed = len(self.config_manager.get_completed_prompts(agent))
            print(f"  {i}. {agent.title()} ({pending} pending, {completed} completed)")
        
        while True:
            try:
                choice = input(f"\\nSelect agent (1-{len(available_agents)}) or 'q' to quit: ").strip()
                if choice.lower() == 'q':
                    return 0
                    
                agent_index = int(choice) - 1
                if 0 <= agent_index < len(available_agents):
                    self.selected_agent = available_agents[agent_index]
                    break
                else:
                    print("❌ Invalid selection.")
            except ValueError:
                print("❌ Please enter a valid number.")
        
        # Get prompts for selected agent
        agent_prompts = self.config_manager.get_pending_prompts(self.selected_agent)
        
        if not agent_prompts:
            print(f"\\n✅ No pending prompts for {self.selected_agent}.")
            return 0
        
        # Show prompts
        print(f"\\n📝 Pending Prompts for {self.selected_agent.title()}:")
        for i, prompt in enumerate(agent_prompts, 1):
            scope_info = f"({prompt.scope_type})"
            if prompt.scope_type == 'per-unit':
                completed_units = self.state_manager.get_completed_units(prompt.id, self.selected_agent)
                scope_info = f"({prompt.scope_type} - {len(completed_units)}/{len(self.available_units)} units)"
            
            print(f"  {i}. [{prompt.id}] {prompt.user_problem[:60]}... {scope_info}")
        
        # Prompt selection
        print(f"\\nSelect prompts to execute (comma-separated numbers, 'all', or 'q' to quit):")
        selection = input("> ").strip()
        
        if selection.lower() == 'q':
            return 0
        elif selection.lower() == 'all':
            self.selected_prompts = agent_prompts
        else:
            try:
                indices = [int(x.strip()) - 1 for x in selection.split(',')]
                self.selected_prompts = [agent_prompts[i] for i in indices if 0 <= i < len(agent_prompts)]
            except ValueError:
                print("❌ Invalid selection format.")
                return 1
        
        if not self.selected_prompts:
            print("❌ No valid prompts selected.")
            return 1
        
        # Execute prompts using execution engine
        return asyncio.run(self._execute_selected_prompts_async())
    
    async def _execute_selected_prompts_async(self) -> int:
        """Execute the selected prompts using the execution engine."""
        print(f"\\n🚀 Starting execution of {len(self.selected_prompts)} prompts with {self.selected_agent}...")
        
        # Validate execution plan
        issues = self.execution_engine.validate_execution_plan(self.selected_prompts, self.selected_agent)
        if issues:
            print(f"\\n❌ Execution plan validation failed:")
            for issue in issues:
                print(f"   • {issue}")
            return 1
        
        # Get execution plan
        execution_plan = self.execution_engine.calculate_execution_plan(self.selected_prompts, self.selected_agent)
        print(f"📊 Total executions needed: {execution_plan['total_executions']}")
        
        if execution_plan['total_executions'] == 0:
            print("✅ All selected prompts are already completed!")
            return 0
        
        # Progress callback for CLI updates
        async def progress_callback(message: str):
            print(f"  🔄 {message}")
        
        try:
            # Execute prompts
            stats = await self.execution_engine.execute_prompts(
                self.selected_prompts, 
                self.selected_agent,
                progress_callback
            )
            
            # Final summary
            print(f"\\n🏁 Execution Summary:")
            print(f"   ✅ Completed: {stats.completed_executions}")
            print(f"   ❌ Failed: {stats.failed_executions}")
            print(f"   ⏭️  Skipped: {stats.skipped_executions}")
            print(f"   📊 Success Rate: {stats.success_rate:.1f}%")
            print(f"   ⏱️  Total Duration: {format_duration(stats.duration)}")
            
            if stats.limit_hits > 0:
                print(f"   ⏰ Limit Hits: {stats.limit_hits}")
            if stats.retries > 0:
                print(f"   🔄 Retries: {stats.retries}")
            
            return 0 if stats.failed_executions == 0 else 1
            
        except Exception as e:
            print(f"\\n❌ Execution failed: {e}")
            return 1

    def _execute_selected_prompts(self) -> int:
        """Execute the selected prompts."""
        handler = self.handlers.get(self.selected_agent)
        if not handler:
            print(f"❌ No handler available for {self.selected_agent}")
            return 1
            
        print(f"\\n🚀 Starting execution of {len(self.selected_prompts)} prompts with {self.selected_agent}...")
        
        total_executions = 0
        completed_executions = 0
        failed_executions = 0
        
        # Calculate total executions needed
        for prompt in self.selected_prompts:
            if prompt.scope_type == 'per-unit':
                completed_units = self.state_manager.get_completed_units(prompt.id, self.selected_agent)
                remaining_units = [u for u in self.available_units if u not in completed_units]
                total_executions += len(remaining_units)
            else:
                if not self.state_manager.is_prompt_completed(prompt.id, self.selected_agent):
                    total_executions += 1
        
        print(f"📊 Total executions needed: {total_executions}")
        
        # Save progress state
        progress = ProgressState(
            selected_prompts=[p.id for p in self.selected_prompts],
            agent_name=self.selected_agent,
            total_executions=total_executions,
            completed_executions=0,
            failed_executions=0,
            start_time=datetime.now().isoformat()
        )
        self.state_manager.save_progress_state(progress)
        
        # Execute prompts
        for prompt in self.selected_prompts:
            print(f"\\n🔄 Processing prompt [{prompt.id}]: {prompt.user_problem[:50]}...")
            
            if prompt.scope_type == 'per-unit':
                # Execute for each unit
                completed_units = self.state_manager.get_completed_units(prompt.id, self.selected_agent)
                remaining_units = [u for u in self.available_units if u not in completed_units]
                
                print(f"   📁 Executing for {len(remaining_units)} units: {', '.join(remaining_units)}")
                
                for unit in remaining_units:
                    print(f"     🎯 Executing for {unit}...")
                    result = handler.execute_prompt(prompt, unit)
                    
                    if result.success:
                        print(f"     ✅ {unit} completed in {format_duration(result.duration)}")
                        completed_executions += 1
                        self.config_manager.update_prompt_completion(prompt.id, unit)
                        self.config_manager.update_prompt_result(prompt.id, result.output[:500], unit)
                    elif result.limit_reached:
                        print(f"     ⏰ Limit reached for {unit}. Waiting for reset...")
                        if handler.wait_for_limit_reset(result.reset_time):
                            print(f"     🔄 Retrying {unit}...")
                            retry_result = handler.execute_prompt(prompt, unit)
                            if retry_result.success:
                                print(f"     ✅ {unit} completed after retry in {format_duration(retry_result.duration)}")
                                completed_executions += 1
                                self.config_manager.update_prompt_completion(prompt.id, unit)
                                self.config_manager.update_prompt_result(prompt.id, retry_result.output[:500], unit)
                            else:
                                print(f"     ❌ {unit} failed after retry: {retry_result.error}")
                                failed_executions += 1
                        else:
                            print(f"     ❌ Failed to wait for limit reset")
                            failed_executions += 1
                    else:
                        print(f"     ❌ {unit} failed: {result.error}")
                        failed_executions += 1
            else:
                # Single execution
                if self.state_manager.is_prompt_completed(prompt.id, self.selected_agent):
                    print(f"   ⏭️  Already completed, skipping...")
                    continue
                    
                result = handler.execute_prompt(prompt)
                
                if result.success:
                    print(f"   ✅ Completed in {format_duration(result.duration)}")
                    completed_executions += 1
                    self.config_manager.update_prompt_completion(prompt.id)
                    self.config_manager.update_prompt_result(prompt.id, result.output[:500])
                elif result.limit_reached:
                    print(f"   ⏰ Limit reached. Waiting for reset...")
                    if handler.wait_for_limit_reset(result.reset_time):
                        print(f"   🔄 Retrying...")
                        retry_result = handler.execute_prompt(prompt)
                        if retry_result.success:
                            print(f"   ✅ Completed after retry in {format_duration(retry_result.duration)}")
                            completed_executions += 1
                            self.config_manager.update_prompt_completion(prompt.id)
                            self.config_manager.update_prompt_result(prompt.id, retry_result.output[:500])
                        else:
                            print(f"   ❌ Failed after retry: {retry_result.error}")
                            failed_executions += 1
                    else:
                        print(f"   ❌ Failed to wait for limit reset")
                        failed_executions += 1
                else:
                    print(f"   ❌ Failed: {result.error}")
                    failed_executions += 1
        
        # Final summary
        print(f"\\n🏁 Execution Summary:")
        print(f"   ✅ Completed: {completed_executions}")
        print(f"   ❌ Failed: {failed_executions}")
        print(f"   📊 Success Rate: {(completed_executions/(completed_executions+failed_executions)*100):.1f}%")
        
        # Clear progress state
        self.state_manager.clear_progress_state()
        
        return 0 if failed_executions == 0 else 1

# Textual-based TUI (if available)
if TEXTUAL_AVAILABLE:
    
    class AgentSelectionScreen(Screen):
        """Screen for selecting which agent to use."""
        
        def __init__(self, executor: PromptExecutorTUI):
            super().__init__()
            self.executor = executor
            
        def compose(self) -> ComposeResult:
            available_agents = self.executor.config_manager.get_available_agents()
            
            yield Header()
            yield Container(
                Static("🤖 Select AI Agent", classes="title"),
                Static("Choose which agent to execute prompts with:", classes="subtitle"),
                *[
                    Button(f"{agent.title()}", id=f"agent_{agent}", classes="agent-button")
                    for agent in available_agents
                ],
                Container(
                    Static("Agent Statistics:", classes="stats-title"),
                    *[
                        Static(self._get_agent_stats(agent), classes="stats")
                        for agent in available_agents
                    ],
                    classes="stats-container"
                ),
                classes="main-container"
            )
            yield Footer()
            
        def _get_agent_stats(self, agent: str) -> str:
            pending = len(self.executor.config_manager.get_pending_prompts(agent))
            completed = len(self.executor.config_manager.get_completed_prompts(agent))
            stats = self.executor.state_manager.get_agent_stats(agent)
            
            return f"{agent.title()}: {pending} pending, {completed} completed, {stats.get('total_executions', 0)} total runs"
            
        def on_button_pressed(self, event: Button.Pressed) -> None:
            if event.button.id and event.button.id.startswith("agent_"):
                agent_name = event.button.id.replace("agent_", "")
                self.executor.selected_agent = agent_name
                self.app.push_screen(PromptSelectionScreen(self.executor))

    class PromptSelectionScreen(Screen):
        """Screen for selecting which prompts to execute."""
        
        def __init__(self, executor: PromptExecutorTUI):
            super().__init__()
            self.executor = executor
            
        def compose(self) -> ComposeResult:
            agent_prompts = self.executor.config_manager.get_pending_prompts(self.executor.selected_agent)
            
            yield Header()
            yield Container(
                Static(f"📝 Select Prompts for {self.executor.selected_agent.title()}", classes="title"),
                *[
                    Horizontal(
                        Checkbox(value=False, id=f"prompt_{prompt.id}"),
                        Static(f"[{prompt.id}] {prompt.user_problem[:60]}... ({prompt.scope_type})"),
                        classes="prompt-item"
                    )
                    for prompt in agent_prompts
                ],
                Horizontal(
                    Button("Select All", id="select_all"),
                    Button("Clear All", id="clear_all"),
                    Button("Execute Selected", id="execute", variant="success"),
                    Button("Back", id="back"),
                    classes="button-bar"
                ),
                classes="main-container"
            )
            yield Footer()
            
        def on_button_pressed(self, event: Button.Pressed) -> None:
            if event.button.id == "select_all":
                for checkbox in self.query(Checkbox):
                    checkbox.value = True
            elif event.button.id == "clear_all":
                for checkbox in self.query(Checkbox):
                    checkbox.value = False
            elif event.button.id == "execute":
                self._execute_selected()
            elif event.button.id == "back":
                self.app.pop_screen()
                
        def _execute_selected(self):
            selected_ids = []
            for checkbox in self.query(Checkbox):
                if checkbox.value and checkbox.id and checkbox.id.startswith("prompt_"):
                    prompt_id = checkbox.id.replace("prompt_", "")
                    selected_ids.append(prompt_id)
                    
            if selected_ids:
                agent_prompts = self.executor.config_manager.get_pending_prompts(self.executor.selected_agent)
                self.executor.selected_prompts = [p for p in agent_prompts if p.id in selected_ids]
                self.app.push_screen(ExecutionScreen(self.executor))

    class ExecutionScreen(Screen):
        """Screen for showing execution progress."""
        
        def __init__(self, executor: PromptExecutorTUI):
            super().__init__()
            self.executor = executor
            
        def compose(self) -> ComposeResult:
            yield Header()
            yield Container(
                Static(f"🚀 Executing {len(self.executor.selected_prompts)} prompts with {self.executor.selected_agent.title()}", classes="title"),
                ProgressBar(id="main_progress"),
                Static("Initializing...", id="status"),
                Log(id="execution_log"),
                Button("Stop", id="stop", variant="error"),
                classes="execution-container"
            )
            yield Footer()
            
        async def on_mount(self) -> None:
            # Start execution
            asyncio.create_task(self._run_execution())
            
        async def _run_execution(self):
            # This would contain the async execution logic
            # For now, redirect to CLI execution
            result = self.executor._execute_selected_prompts()
            self.app.exit(result)

    class PromptExecutorApp(App):
        """Main Textual application."""
        
        CSS = """
        .title {
            text-align: center;
            padding: 1;
            background: $primary;
            color: $text;
        }
        
        .subtitle {
            text-align: center;
            padding: 1;
        }
        
        .agent-button {
            margin: 1;
            min-width: 20;
        }
        
        .stats-container {
            padding: 1;
            border: solid $primary;
        }
        
        .main-container {
            padding: 1;
        }
        
        .prompt-item {
            padding: 0 1;
            margin: 0 0 1 0;
        }
        
        .button-bar {
            padding: 1;
            margin: 1 0 0 0;
        }
        
        .execution-container {
            padding: 1;
        }
        """
        
        def __init__(self, executor: PromptExecutorTUI):
            super().__init__()
            self.executor = executor
            
        def on_mount(self) -> None:
            self.push_screen(AgentSelectionScreen(self.executor))