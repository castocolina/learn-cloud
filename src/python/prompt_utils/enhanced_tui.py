"""
Enhanced TUI Interface for AI Prompt Executor
===========================================

Provides an improved interactive terminal interface with execution scope filtering,
better display formatting, and advanced execution features.
"""

import asyncio
import logging
from typing import List, Dict, Optional, Any
from datetime import datetime

from .config_manager import ConfigManager, PromptConfig
from .state_manager import StateManager
from .execution_engine import ExecutionEngine
from .agent_handlers import get_agent_handler, AgentExecutionResult
from .utils import detect_units, format_duration, RealTimeMetrics, display_real_time_progress

logger = logging.getLogger(__name__)

class EnhancedPromptExecutorTUI:
    """Enhanced TUI application for prompt execution with advanced features."""
    
    def __init__(self, config_manager: ConfigManager, state_manager: StateManager):
        self.config_manager = config_manager
        self.state_manager = state_manager
        self.execution_engine = ExecutionEngine(config_manager, state_manager)
        self.available_units = detect_units()
        self.selected_agent = None
        self.selected_prompts = []
        self.execution_scope_filter = None  # 'single', 'per-unit', or None for all
        self.include_completed = False  # Whether to include completed prompts
        
    async def run(self) -> int:
        """Run the enhanced TUI application."""
        self._print_header()
        
        # Load prompts
        all_prompts = self.config_manager.load_prompts()
        if not all_prompts:
            print("❌ No prompts found in configuration.")
            return 1
        
        # Agent selection
        if not self._select_agent():
            return 0
        
        # Execution scope filter
        if not self._select_execution_scope():
            return 0
        
        # Get filtered prompts
        filtered_prompts = self._get_filtered_prompts(all_prompts)
        if not filtered_prompts:
            scope_text = self.execution_scope_filter or 'all scopes'
            print(f"\n✅ No prompts match the selected criteria ({self.selected_agent}, {scope_text}).")
            return 0
        
        # Show prompts with proper formatting
        self._display_prompts(filtered_prompts)
        
        # Prompt selection
        if not self._select_prompts(filtered_prompts):
            return 0
        
        # Execute selected prompts
        return await self._execute_prompts()
    
    def _print_header(self):
        """Print application header with proper formatting."""
        print("\n" + "=" * 70)
        print("🚀 AI Prompt Executor - Enhanced Interface")
        print("=" * 70)
        print("Advanced prompt execution with scope filtering and agent features")
        print("=" * 70)
    
    def _select_agent(self) -> bool:
        """Select agent with improved display."""
        available_agents = self.config_manager.get_available_agents()
        
        if not available_agents:
            print("❌ No agents found in configuration.")
            return False
        
        print("\n🤖 Available Agents:")
        for i, agent in enumerate(available_agents, 1):
            pending = len(self.config_manager.get_pending_prompts(agent))
            completed = len(self.config_manager.get_completed_prompts(agent))
            print(f"  {i}. {agent.title()} ({pending} pending, {completed} completed)")
        
        while True:
            try:
                choice = input(f"\nSelect agent (1-{len(available_agents)}) or 'q' to quit: ").strip()
                if choice.lower() == 'q':
                    return False
                    
                agent_index = int(choice) - 1
                if 0 <= agent_index < len(available_agents):
                    self.selected_agent = available_agents[agent_index]
                    print(f"Selected agent: {self.selected_agent.title()}")
                    return True
                else:
                    print("❌ Invalid selection.")
            except ValueError:
                print("❌ Please enter a valid number.")
    
    def _select_execution_scope(self) -> bool:
        """Select execution scope filter with improved UX including completed prompts."""
        print("\n🎯 Execution Scope Filter:")
        print("  1. Pending prompts only [DEFAULT]")
        print("  2. All prompts (including completed)")
        print("  3. Single execution prompts only")
        print("  4. Per-unit execution prompts only")
        
        while True:
            try:
                choice = input("\nSelect scope (1-4) [1] or 'q' to quit: ").strip()
                if choice.lower() == 'q':
                    return False
                
                # Default to option 1 if user just presses enter
                if choice == '':
                    choice = '1'
                
                if choice == '1':
                    self.execution_scope_filter = None
                    self.include_completed = False
                    print("Filter: Pending prompts only")
                    return True
                elif choice == '2':
                    self.execution_scope_filter = None
                    self.include_completed = True
                    print("Filter: All prompts (including completed)")
                    return True
                elif choice == '3':
                    self.execution_scope_filter = 'single'
                    self.include_completed = True
                    print("Filter: Single execution prompts only")
                    return True
                elif choice == '4':
                    self.execution_scope_filter = 'per-unit'
                    self.include_completed = True
                    print("Filter: Per-unit execution prompts only")
                    return True
                else:
                    print("❌ Invalid selection.")
            except ValueError:
                print("❌ Please enter a valid number.")
    
    def _get_filtered_prompts(self, all_prompts: List[PromptConfig]) -> List[PromptConfig]:
        """Get prompts filtered by agent and execution scope."""
        # Filter by agent
        agent_prompts = [p for p in all_prompts if p.agent_name == self.selected_agent and p.is_enabled]
        
        # Filter by execution scope if specified
        if self.execution_scope_filter:
            agent_prompts = [p for p in agent_prompts if p.execution_scope == self.execution_scope_filter]
        
        # Filter completed prompts based on include_completed setting
        filtered_prompts = []
        for prompt in agent_prompts:
            if self.include_completed:
                # Include all prompts (completed and pending)
                filtered_prompts.append(prompt)
            else:
                # Filter out completed prompts (original behavior)
                if prompt.execution_scope == 'per-unit':
                    # Check if all units are completed
                    completed_units = self.state_manager.get_completed_units(prompt.id, self.selected_agent)
                    if len(completed_units) < len(self.available_units):
                        filtered_prompts.append(prompt)
                else:
                    # Check if single execution is completed
                    if not self.state_manager.is_prompt_completed(prompt.id, self.selected_agent):
                        filtered_prompts.append(prompt)
        
        return filtered_prompts
    
    def _display_prompts(self, prompts: List[PromptConfig]):
        """Display prompts with enhanced status information."""
        scope_name = {
            'single': 'Single Execution',
            'per-unit': 'Per-Unit Execution',
            None: 'All Scopes'
        }.get(self.execution_scope_filter, 'All Scopes')
        
        print(f"\n📝 Prompts for {self.selected_agent.title()} ({scope_name}):")
        print("-" * 70)
        
        for i, prompt in enumerate(prompts, 1):
            # Get short name or fallback to truncated user problem
            display_name = prompt.short_name or prompt.user_problem[:50] + ("..." if len(prompt.user_problem) > 50 else "")
            
            # Get execution summary for this prompt
            summary = self.state_manager.get_prompt_execution_summary(prompt.id, self.selected_agent)
            
            # Build scope info with status
            if prompt.execution_scope == 'per-unit':
                total_units = len(self.available_units)
                completed = summary.get('completed_units', 0)
                failed = summary.get('failed_units', 0)
                pending = total_units - completed - failed
                
                status_icon = "✅" if completed == total_units else "🔄" if completed > 0 else "⭕"
                scope_info = f"per-unit ({completed}✅/{failed}❌/{pending}⏳ of {total_units})"
            else:
                last_status = summary.get('last_execution_status', 'never_run')
                status_icon = "✅" if last_status == 'completed' else "❌" if last_status == 'failed' else "⭕"
                scope_info = f"single ({last_status})"
            
            # Build model info with fallback indication
            model_info = prompt.model
            if prompt.fallback_model and self.selected_agent == 'claude':
                model_info += f" (fallback: {prompt.fallback_model})"
            
            # Check for resumption options
            resumption_info = ""
            if summary.get('has_resumption_options', False):
                resumption_info = " 🔄 (resumable)"
            
            print(f"  {i:2d}. {status_icon} [{prompt.id}] {display_name}{resumption_info}")
            print(f"      � Scope: {scope_info} | 🎯 Model: {model_info} | 📅 Created: {prompt.created[:10]}")
            
            # Show short description if available
            if prompt.short_description:
                print(f"      💡 {prompt.short_description}")
            
            # Show last execution info if available
            last_execution = summary.get('last_execution_time')
            if last_execution:
                print(f"      🕒 Last executed: {last_execution[:19].replace('T', ' ')}")
            
            print()
    
    def _handle_resumption_choice(self, prompt: PromptConfig) -> str:
        """Handle resumption choice for a prompt with existing execution state.
        
        Returns:
            'restart': Start fresh execution
            'resume': Resume from last state
            'skip': Skip this prompt
        """
        summary = self.state_manager.get_prompt_execution_summary(prompt.id, self.selected_agent)
        resumption_options = self.state_manager.get_resumption_options(prompt.id, self.selected_agent)
        
        if not resumption_options:
            return 'restart'  # No resumption options available
        
        print(f"\n🔄 Resumption Options for [{prompt.id}]:")
        print(f"   📊 Current status: {summary.get('overall_status', 'unknown')}")
        
        if prompt.execution_scope == 'per-unit':
            completed = summary.get('completed_units', 0)
            failed = summary.get('failed_units', 0)
            total = len(self.available_units)
            print(f"   📈 Progress: {completed} completed, {failed} failed, {total - completed - failed} pending")
        
        print("\nChoose action:")
        print("  1. 🔄 Restart (clear all state and start fresh)")
        print("  2. ▶️  Resume (continue from last state)")
        print("  3. 🔁 Force Re-execute (ignore completion status)")
        print("  4. ⏭️  Skip (skip this prompt)")
        
        while True:
            choice = input("\n> ").strip()
            
            if choice == '1':
                return 'restart'
            elif choice == '2':
                return 'resume'
            elif choice == '3':
                return 'force'
            elif choice == '4':
                return 'skip'
            else:
                print("❌ Invalid choice. Please enter 1, 2, 3, or 4.")
    
    
    def _select_prompts(self, prompts: List[PromptConfig]) -> bool:
        """Select prompts to execute."""
        if not prompts:
            print("No prompts available for selection.")
            return False
        
        print("Selection options:")
        print("  • Enter numbers (comma-separated): e.g., '1,3,5'")
        print("  • Enter 'all' to select all prompts")
        print("  • Enter 'q' to quit")
        
        while True:
            selection = input("\n> ").strip()
            
            if selection.lower() == 'q':
                return False
            elif selection.lower() == 'all':
                self.selected_prompts = prompts
                print(f"Selected all {len(prompts)} prompts")
                return True
            else:
                try:
                    indices = [int(x.strip()) - 1 for x in selection.split(',')]
                    selected = []
                    
                    for idx in indices:
                        if 0 <= idx < len(prompts):
                            selected.append(prompts[idx])
                        else:
                            print(f"❌ Invalid index: {idx + 1}")
                            selected = []
                            break
                    
                    if selected:
                        self.selected_prompts = selected
                        print(f"Selected {len(selected)} prompts: {[p.id for p in selected]}")
                        return True
                        
                except ValueError:
                    print("❌ Invalid selection format. Use numbers separated by commas.")
    
    async def _execute_prompts(self) -> int:
        """Execute selected prompts using the enhanced ExecutionEngine."""
        if not self.selected_prompts:
            return 1
        
        print(f"\n🚀 Starting execution of {len(self.selected_prompts)} prompts...")
        
        # Prepare resumption choices for prompts that have existing state
        resumption_choices = {}
        
        for prompt in self.selected_prompts:
            summary = self.state_manager.get_prompt_execution_summary(prompt.id, self.selected_agent)
            
            # Check if prompt has resumption options
            if summary.get('has_resumption_options', False):
                choice = self._handle_resumption_choice(prompt)
                resumption_choices[prompt.id] = choice
                
                if choice == 'skip':
                    print(f"⏭️ Skipping [{prompt.id}]")
                    continue
                elif choice == 'force':
                    print(f"🔁 Force re-executing [{prompt.id}]")
            else:
                resumption_choices[prompt.id] = 'restart'
        
        # Filter out skipped prompts
        prompts_to_execute = [p for p in self.selected_prompts if resumption_choices.get(p.id) != 'skip']
        
        if not prompts_to_execute:
            print("ℹ️ No prompts to execute (all skipped)")
            return 0
        
        # Calculate total executions for metrics
        total_executions = 0
        for prompt in prompts_to_execute:
            if prompt.execution_scope == 'per-unit':
                # Count remaining units for per-unit prompts (refresh units list)
                self.available_units = detect_units()  # Refresh units list
                completed_units = self.state_manager.get_completed_units(prompt.id, self.selected_agent)
                remaining_units = [u for u in self.available_units if u not in completed_units]
                total_executions += len(remaining_units)
            else:
                # Single execution prompt
                if not self.state_manager.is_prompt_completed(prompt.id, self.selected_agent):
                    total_executions += 1
        
        if total_executions == 0:
            print("ℹ️ All selected prompts are already completed")
            return 0
            
        # Initialize real-time metrics
        metrics = RealTimeMetrics(total_executions)
        
        print(f"\n🚀 Starting execution of {len(prompts_to_execute)} prompts ({total_executions} total executions)...")
        print(f"📊 Real-time progress will be displayed below:")
        print()  # Extra line for progress display
        
        # Create progress callback
        async def progress_callback(prompt_name: str = "", unit: str = "", duration: float = 0, success: bool = True):
            if duration > 0:  # Task completed
                metrics.add_task_completion(duration, success)
            # Always update the display, regardless of whether task is completed or ongoing
            display_real_time_progress(metrics, prompt_name, unit)
        
        # Start a background task to update elapsed time every few seconds
        update_task = None
        current_prompt_name = ""
        current_unit = ""
        
        async def periodic_update():
            """Update the progress display periodically to show elapsed time updates."""
            while True:
                await asyncio.sleep(2)  # Update every 2 seconds
                if metrics:
                    display_real_time_progress(metrics, current_prompt_name, current_unit)
        
        # Track streaming output
        current_agent_output = ""
        
        # Streaming callback for real-time agent output
        async def streaming_callback(chunk: str, stream_type: str):
            nonlocal current_agent_output
            if stream_type == 'stdout':
                current_agent_output = chunk  # Keep only latest chunk for clean display
        
        # Enhanced progress callback that tracks current status
        async def enhanced_progress_callback(prompt_name: str = "", unit: str = "", duration: float = 0, success: bool = True):
            nonlocal current_prompt_name, current_unit, current_agent_output
            
            # Update current status for periodic updates
            if prompt_name:
                current_prompt_name = prompt_name
            if unit:
                current_unit = unit
            elif duration > 0:  # Task completed, clear unit
                current_unit = ""
                current_agent_output = ""  # Clear agent output on completion
            
            # Call original progress callback with agent output
            await progress_callback(prompt_name, unit, duration, success)
        
        # Use ExecutionEngine for actual execution with progress callback
        try:
            # Start periodic update task
            update_task = asyncio.create_task(periodic_update())
            results = await self.execution_engine.execute_prompts(
                agent=self.selected_agent,
                prompts=prompts_to_execute,
                resumption_choices=resumption_choices,
                progress_callback=enhanced_progress_callback
            )
            
            # Stop the periodic update task
            if update_task:
                update_task.cancel()
                try:
                    await update_task
                except asyncio.CancelledError:
                    pass
            
            # Clear the progress line and add final summary
            print("\n")  # Clear the real-time progress line
            
            # Display execution summary
            total_executions = sum(len(r.get('executions', [])) for r in results.values())
            completed_executions = sum(
                1 for r in results.values() 
                for exec_result in r.get('executions', []) 
                if exec_result.get('status') == 'completed'
            )
            failed_executions = total_executions - completed_executions
            
            # Final metrics display
            final_summary = metrics.get_progress_summary()
            
            print(f"🏁 Execution Complete!")
            print(f"   ⏱️  Total time: {final_summary['elapsed_time']}")
            print(f"   📊 Total executions: {total_executions}")
            print(f"   ✅ Completed: {completed_executions}")
            print(f"   ❌ Failed: {failed_executions}")
            
            if total_executions > 0:
                success_rate = (completed_executions / total_executions) * 100
                print(f"   🎯 Success rate: {success_rate:.1f}%")
            
            # Display per-prompt status
            print(f"\n📊 Per-Prompt Results:")
            for prompt_id, result in results.items():
                prompt = next((p for p in prompts_to_execute if p.id == prompt_id), None)
                if prompt:
                    status = result.get('status', 'unknown')
                    status_icon = "✅" if status == 'completed' else "❌" if status == 'failed' else "🔄"
                    
                    print(f"   {status_icon} [{prompt_id}] {status}")
                    
                    if result.get('executions'):
                        exec_count = len(result['executions'])
                        completed_count = sum(1 for e in result['executions'] if e.get('status') == 'completed')
                        print(f"      📈 Executions: {completed_count}/{exec_count} completed")
            
            return 0 if failed_executions == 0 else 1
            
        except Exception as e:
            # Stop the periodic update task
            if update_task:
                update_task.cancel()
                try:
                    await update_task
                except asyncio.CancelledError:
                    pass
            
            print(f"❌ Execution failed: {str(e)}")
            logger.exception("Execution failed")
            return 1