#!/usr/bin/env python3
"""
AI Prompt Manager - Complete Prompt Management System
====================================================

A comprehensive CLI tool for generating, listing, validating, and formatting
AI prompts with YAML configuration management and interactive menu system.
"""

import yaml
import json
import subprocess
import sys
import os
import textwrap
import random
import string
import readline  # For better input editing
import threading
import time
from datetime import datetime
from typing import Dict, List, Any, Tuple

# Add path for local imports
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

# Import shared YAML utilities and ConfigManager
from prompt_utils import save_yaml_multiline, load_yaml_safe
from prompt_utils.config_manager import ConfigManager, PromptConfig
from prompt_utils.unified_schema import UnifiedPrompt, EditMetadata, ExecutionMetadata
from prompt_utils.agent_handler import execute_agent_prompt
from prompt_utils.audit_logger import AuditLogger, ExecutionLogEntry

# Global default timeout for agent responses (in seconds)
DEFAULT_AGENT_TIMEOUT = 60

# YAML formatting configuration
DEFAULT_YAML_LINE_WIDTH = 120  # Maximum column width for YAML prompt formatting

# ANSI color codes for better visual feedback
class Colors:
    RESET = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    
    # Foreground colors
    BLACK = '\033[30m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    WHITE = '\033[37m'
    
    # Background colors
    BG_BLACK = '\033[40m'
    BG_RED = '\033[41m'
    BG_GREEN = '\033[42m'
    BG_YELLOW = '\033[43m'
    BG_BLUE = '\033[44m'
    BG_MAGENTA = '\033[45m'
    BG_CYAN = '\033[46m'
    BG_WHITE = '\033[47m'
    BG_GRAY = '\033[100m'

# Prompt state definitions and visual indicators
class PromptStates:
    """Centralized prompt state management with visual indicators."""
    
    # State definitions
    DRAFT = 'draft'
    ENABLED = 'enabled' 
    NEEDS_REFINEMENT = 'needs_refinement'
    DISABLED = 'disabled'
    
    # Execution state mapping (derived from actual execution status)
    EXECUTED = 'executed'  # Virtual state - has execution results
    NOT_EXECUTED = 'not_executed'  # Virtual state - no execution yet
    
    @classmethod
    def get_state_info(cls, prompt, state_manager=None):
        """Get state info with icon, color, and description."""
        status = prompt.status.lower()
        
        # Check execution status if state_manager provided
        has_executions = cls._check_execution_status(prompt, state_manager)
        
        # State mapping with icons and colors
        state_map = {
            cls.DRAFT: {
                'icon': '📝',
                'color': Colors.YELLOW,
                'name': 'DRAFT',
                'description': 'Edited manually, needs review'
            },
            cls.ENABLED: {
                'icon': '✅' if has_executions else '🔄',
                'color': Colors.GREEN if has_executions else Colors.CYAN,
                'name': 'EXECUTED' if has_executions else 'READY',
                'description': 'Successfully executed' if has_executions else 'Ready for execution'
            },
            cls.NEEDS_REFINEMENT: {
                'icon': '⚠️',
                'color': Colors.YELLOW,
                'name': 'INCOMPLETE',
                'description': 'Needs refinement before execution'
            },
            cls.DISABLED: {
                'icon': '⏸️',
                'color': Colors.DIM,
                'name': 'DISABLED',
                'description': 'Disabled, will not execute'
            }
        }
        
        return state_map.get(status, {
            'icon': '❓',
            'color': Colors.DIM,
            'name': 'UNKNOWN',
            'description': f'Unknown status: {status}'
        })
    
    @classmethod
    def _check_execution_status(cls, prompt, state_manager):
        """Helper method to check if a prompt has execution history."""
        if not state_manager:
            return False
            
        try:
            if prompt.execution_scope == 'per-unit':
                completed_units = state_manager.get_completed_units(prompt.id, prompt.agent_name)
                return len(completed_units) > 0
            else:
                execution_state = state_manager.get_execution_state(prompt.id, prompt.agent_name)
                return execution_state and execution_state.status == 'completed'
        except Exception as e:
            # Log error but don't break the UI
            import logging
            logger = logging.getLogger(__name__)
            logger.debug(f"Error checking execution status for prompt {prompt.id}: {e}")
            return False
    
    @classmethod
    def get_execution_progress(cls, prompt, state_manager):
        """Get execution progress information for display."""
        if not state_manager or prompt.execution_scope != 'per-unit':
            return ""
            
        try:
            from prompt_utils.utils import detect_units
            units = detect_units()
            completed_units = state_manager.get_completed_units(prompt.id, prompt.agent_name)
            return f" ({len(completed_units)}/{len(units)} units)"
        except Exception:
            return ""
    
    @classmethod
    def get_filter_options(cls):
        """Get available filter options for prompt states."""
        return {
            'all': {'name': 'All prompts', 'icon': '📋'},
            'draft': {'name': 'Draft (needs review)', 'icon': '📝'},
            'ready': {'name': 'Ready to execute', 'icon': '🔄'},
            'executed': {'name': 'Successfully executed', 'icon': '✅'},
            'incomplete': {'name': 'Needs refinement', 'icon': '⚠️'},
            'disabled': {'name': 'Disabled prompts', 'icon': '⏸️'}
        }

class PromptManagerCLI:
    def __init__(self, agents_file: str = None):
        self.show_strategist_prompt = False  # Toggle for showing strategist prompt
        # Auto-detect correct paths based on current working directory
        if agents_file is None:
            if os.path.exists("../conf/agents.yaml"):  # Running from src/python/
                self.agents_file = "../conf/agents.yaml"
                prompts_file = "../conf/agent_prompts.yaml"
            elif os.path.exists("src/conf/agents.yaml"):  # Running from project root
                self.agents_file = "src/conf/agents.yaml"
                prompts_file = "src/conf/agent_prompts.yaml"
            else:
                raise FileNotFoundError("Cannot find agents.yaml - please run from project root or src/python directory")
        else:
            self.agents_file = agents_file
            # Set prompts file relative to agents file location
            agents_dir = os.path.dirname(agents_file)
            prompts_file = os.path.join(agents_dir, "agent_prompts.yaml")
        
        # Initialize ConfigManager for shared YAML handling
        self.prompts_file = prompts_file  # Store for compatibility with existing methods
        self.config_manager = ConfigManager(prompts_file)
        self.agents = self.load_agents()
        
        # Initialize StateManager for execution status tracking
        try:
            from prompt_utils.state_manager import StateManager
            self.state_manager = StateManager()
        except ImportError:
            self.state_manager = None  # Fallback if state manager not available
        
    def generate_prompt_id(self) -> str:
        """Generate a unique 3-5 character alphanumeric ID"""
        length = random.randint(3, 5)
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
    
    def load_existing_prompts(self) -> List[Dict[str, Any]]:
        """Load existing prompts from YAML file"""
        try:
            if os.path.exists(self.prompts_file):
                with open(self.prompts_file, 'r', encoding='utf-8') as file:
                    data = yaml.safe_load(file)
                    # Handle case where file is empty or contains only None/null
                    if data is None:
                        return []
                    if isinstance(data, dict):
                        prompts = data.get('prompts', [])
                        # Ensure prompts is always a list
                        return prompts if isinstance(prompts, list) else []
                    return []
            return []
        except (FileNotFoundError, yaml.YAMLError) as e:
            print(f"⚠️  Warning: Could not load existing prompts: {e}")
            return []
    
    def save_prompt_entry(self, user_problem: str, decision: Dict[str, Any], 
                         satisfied: bool, additional_context: str = "", execution_scope: str = 'single') -> str:
        """Save a new prompt entry to the prompts YAML file using unified schema"""
        # Generate unique ID
        prompt_id = self.generate_prompt_id()
        existing_prompts = self.load_existing_prompts()
        
        # Ensure ID is unique
        existing_ids = [p.get('id', '') for p in existing_prompts]
        while prompt_id in existing_ids:
            prompt_id = self.generate_prompt_id()
        
        # Check decision content
        if not decision:
            print(f"❌ Error: decision is None or empty")
            return ""
        
        # Get agent details
        agent_id = decision.get('agent_id', 'Unknown')
        selected_agent = next((agent for agent in self.agents if agent['id'] == agent_id), None)
        
        # Use the prompt as generated by Solution Strategist (should already include role)
        # Prefer the raw format with preserved line breaks for better markdown formatting
        final_prompt = decision.get('draft_prompt_raw', decision.get('draft_prompt', 'No prompt provided'))
        
        # Determine final status based on Strategy Agent completion and user choice
        strategy_complete = decision.get('complete', False)
        has_questions = len(decision.get('questions', [])) > 0
        
        # Force needs_refinement if Strategy Agent marked as incomplete or has questions
        if not strategy_complete or has_questions:
            final_status = 'needs_refinement'
        else:
            final_status = 'enabled' if satisfied else 'needs_refinement'
        
        # Create unified prompt structure
        unified_prompt = UnifiedPrompt(
            id=prompt_id,
            short_name=decision.get('short_name', user_problem[:30] + '...' if len(user_problem) > 30 else user_problem),
            short_description=decision.get('short_description', user_problem[:100] + '...' if len(user_problem) > 100 else user_problem),
            prompt=final_prompt,
            execution_scope=decision.get('execution_scope', execution_scope),
            agent_id=agent_id,
            agent_name=selected_agent['agent_name'] if selected_agent else 'unknown',
            agent_role=selected_agent['description'] if selected_agent else 'Unknown',
            model=selected_agent['model'] if selected_agent else 'unknown',
            framework=selected_agent['framework'] if selected_agent else 'Unknown',
            fallback_model=selected_agent.get('fallback_model') if selected_agent else None,
            status=final_status
        )
        
        # Set edit metadata
        edit_metadata = EditMetadata(
            user_problem=user_problem,
            additional_context=additional_context if additional_context else None,
            improved_problem=decision.get('improved_problem', user_problem),
            improved_context=decision.get('improved_context', additional_context if additional_context else None),
            questions_asked=decision.get('questions', []),
            generation_complete=decision.get('complete', False),
            router_command=""  # Will be set after command generation
        )
        # Generate router and execution commands using unified handler
        from prompt_utils.agent_handler import UnifiedAgentHandler
        handler = UnifiedAgentHandler()
        
        # Update router_command for plan mode (yolo_run=False)
        edit_metadata.router_command = handler._build_command_display_string(selected_agent, yolo_run=False)
        unified_prompt.edit_metadata = edit_metadata
        
        # Build execution command for execution mode (yolo_run=True) 
        execution_cmd = handler._build_command_display_string(selected_agent, yolo_run=True).replace("[PROMPT_CONTENT]", "{prompt}")
        
        # Set execution metadata
        execution_metadata = ExecutionMetadata(
            execution_command=execution_cmd,
            scope_type=decision.get('execution_scope', execution_scope),
            total_iterations=1
        )
        unified_prompt.execution_metadata = execution_metadata
        
        # Convert to dictionary for YAML storage
        prompt_entry = unified_prompt.to_dict()
        
        # Add to existing prompts
        existing_prompts.append(prompt_entry)
        
        # Save to file with proper formatting (120 column limit)
        try:
            # Create directory based on prompts file path
            prompts_dir = os.path.dirname(self.prompts_file)
            os.makedirs(prompts_dir, exist_ok=True)
            
            # Use save_yaml_multiline for proper formatting with configurable column limit
            save_yaml_multiline({'prompts': existing_prompts}, file_path=self.prompts_file, max_line_width=DEFAULT_YAML_LINE_WIDTH)
            return prompt_id
        except IOError as e:
            print(f"❌ Error saving prompt: {e}")
            return ""
    
    def load_agents(self):
        """Load agents configuration from YAML file"""
        try:
            with open(self.agents_file, 'r', encoding='utf-8') as file:
                data = yaml.safe_load(file)
                return data.get('agents', [])
        except FileNotFoundError:
            print(f"❌ Error: {self.agents_file} not found!")
            sys.exit(1)
        except yaml.YAMLError as e:
            print(f"❌ Error parsing YAML: {e}")
            sys.exit(1)
    
    def print_header(self):
        """Print the application header"""
        print("\n" + "="*70)
        print("🤖 AI Prompt Manager - Complete Prompt Management System")
        print("="*70)
        print("Interactive prompt generation for specialized AI agents")
        print("="*70)
    
    def configure_readline_for_input(self):
        """Configure readline for better text input behavior with comprehensive wrapping fix"""
        try:
            # Clear any existing problematic state
            readline.clear_history()
            readline.set_completer(None)
            readline.set_completer_delims(' \t\n`@#$%^&*()=+[{]}\\|;:\'\"<>?')
            
            # Critical settings to prevent text wrapping issues
            readline.parse_and_bind("set horizontal-scroll-mode off")  # CRITICAL: Prevents cursor return to start
            readline.parse_and_bind("set enable-keypad on")           # Better arrow key handling
            readline.parse_and_bind("set editing-mode emacs")         # Consistent editing mode
            readline.parse_and_bind("set bell-style none")            # Disable annoying bell
            readline.parse_and_bind("set show-all-if-ambiguous on")   # Better completion
            readline.parse_and_bind("set completion-ignore-case on")  # Case insensitive
            readline.parse_and_bind("set skip-completed-text on")     # Better completion behavior
            
            # Display and wrapping related settings
            readline.parse_and_bind("set mark-directories on")
            readline.parse_and_bind("set mark-symlinked-directories on") 
            readline.parse_and_bind("set match-hidden-files off")
            
            # Clear hooks that might interfere with display
            readline.set_completion_display_matches_hook(None)
            readline.set_pre_input_hook(None)
            readline.set_startup_hook(None)
            
            # Force terminal-aware settings (screenwidth is not supported in all readline versions)
            import os, shutil
            terminal_width = shutil.get_terminal_size().columns
            if terminal_width > 40:  # Only if we have reasonable width
                # Note: screenwidth is not universally supported, so we skip it
                pass
            
        except Exception as e:
            # Fallback to minimal configuration if anything fails
            try:
                readline.parse_and_bind("set horizontal-scroll-mode off")
                readline.parse_and_bind("set editing-mode emacs")
                print(f"Warning: Limited readline configuration applied: {e}")
            except Exception:
                print("Warning: Readline configuration failed entirely - text editing may be limited")
    
    def detect_multiline_paste(self, input_text: str) -> bool:
        """Detect if input has more than 5 consecutive empty lines (blank lines)"""
        lines = input_text.split('\n')
        consecutive_empty = 0
        max_consecutive_empty = 0
        
        for line in lines:
            if not line.strip():  # Empty or whitespace-only line
                consecutive_empty += 1
                max_consecutive_empty = max(max_consecutive_empty, consecutive_empty)
            else:
                consecutive_empty = 0
        
        return max_consecutive_empty > 5

    def get_multiline_input(self, prompt: str) -> str:
        """Get multiline input from user with enhanced editing capabilities and paste detection"""
        # Configure readline for better behavior
        self.configure_readline_for_input()
        
        print(f"\n{prompt}")
        print("=" * len(prompt))
        print("💡 Enhanced editing tips:")
        print("  - Use arrow keys to navigate and edit text")
        print("  - Use Home/End to jump to beginning/end of line")  
        print("  - Use Ctrl+A/E for line beginning/end (alternative)")
        print("  - Type multiple lines - press Enter for new line")
        print("  - Paste detection: >5 consecutive blank lines will prompt for confirmation")
        current_status = "ON" if self.show_strategist_prompt else "OFF"
        print(f"  - Type {Colors.YELLOW}/tp{Colors.RESET} to toggle Solution Strategist prompt (currently {Colors.BOLD}{current_status}{Colors.RESET})")
        print(f"  - Type {Colors.YELLOW}/help{Colors.RESET} for special commands")
        print("  - Press Ctrl+D when done or Ctrl+C to cancel")
        print("-" * 50)
        
        lines = []
        line_number = 1
        
        try:
            while True:
                try:
                    # Set readline prompt with line number
                    readline.set_startup_hook(None)
                    line_prompt = f"{Colors.DIM}[{line_number:2d}] {Colors.RESET}"
                    line = input(line_prompt)
                    
                    # Handle special commands
                    if line.strip().lower() in ['/toggle-prompt', '/tp']:
                        self.show_strategist_prompt = not self.show_strategist_prompt
                        status = "ON" if self.show_strategist_prompt else "OFF"
                        print(f"{Colors.GREEN}✅ Solution Strategist prompt visibility: {status}{Colors.RESET}")
                        continue
                    elif line.strip().lower() == '/help':
                        print(f"{Colors.CYAN}📋 Special commands:{Colors.RESET}")
                        print("  /toggle-prompt, /tp - Toggle Solution Strategist prompt visibility")
                        print("  /help - Show this help")
                        continue
                    
                    # Detect multiline paste with too many blank lines
                    if self.detect_multiline_paste(line):
                        lines_in_paste = line.split('\n')
                        empty_lines = sum(1 for l in lines_in_paste if not l.strip())
                        print(f"\n{Colors.YELLOW}📋 Paste detected with many blank lines ({empty_lines} empty lines)!{Colors.RESET}")
                        print(f"Content preview: {repr(line[:100])}...")
                        confirm = input(f"{Colors.CYAN}Accept this paste? (y/N): {Colors.RESET}").strip().lower()
                        if confirm not in ['y', 'yes']:
                            print(f"{Colors.RED}❌ Paste rejected. Please enter text manually or paste with fewer blank lines.{Colors.RESET}")
                            continue
                        else:
                            print(f"{Colors.GREEN}✅ Paste accepted{Colors.RESET}")
                    
                    if line.strip():  # Non-empty line
                        # Split pasted content into lines if it contains newlines
                        if '\n' in line:
                            pasted_lines = line.split('\n')
                            lines.extend(pasted_lines)
                            line_number += len(pasted_lines)
                        else:
                            lines.append(line)
                            line_number += 1
                    else:  # Empty line - just add it and continue (removed problematic confirmation)
                        lines.append("")
                        line_number += 1
                        
                except EOFError:
                    # Ctrl+D pressed
                    break
        except KeyboardInterrupt:
            print(f"\n{Colors.RED}❌ Operation cancelled by user{Colors.RESET}")
            return ""
        
        result = '\n'.join(lines).strip()
        if result:
            print(f"{Colors.GREEN}✅ Input captured ({len(lines)} lines){Colors.RESET}")
        return result
    
    def display_results(self, decision: Dict[str, Any], user_problem: str) -> bool:
        """Display results and get user feedback"""
        # Null safety check
        if not decision or not isinstance(decision, dict):
            print(f"\n{Colors.RED}❌ Error: Invalid or empty response from Solution Strategist{Colors.RESET}")
            print("The system received an invalid response. Please try again.")
            return False
        
        print("\n" + "="*70)
        print("🎯 SOLUTION STRATEGIST RECOMMENDATION")
        print("="*70)
        
        # Show enhanced problem analysis with null safety
        short_name = decision.get('short_name', 'Task')
        short_description = decision.get('short_description', user_problem[:100] if user_problem else 'No description available')
        improved_problem = decision.get('improved_problem', user_problem if user_problem else 'No problem description')
        execution_scope = decision.get('execution_scope', 'single')
        
        print(f"📝 Task Name: {Colors.BOLD}{short_name}{Colors.RESET}")
        print(f"📄 Description: {short_description}")
        scope_display = f"{Colors.YELLOW}PER-UNIT{Colors.RESET}" if execution_scope == "per-unit" else f"{Colors.GREEN}SINGLE{Colors.RESET}"
        print(f"🎯 Execution Scope: {scope_display}")
        print()
        
        # Show improved problem if different from original
        if improved_problem != user_problem:
            print(f"{Colors.BOLD}✨ Refined Problem Description:{Colors.RESET}")
            print(textwrap.fill(improved_problem, width=66, initial_indent="   ", subsequent_indent="   "))
            print()
        
        # Get selected agent info
        agent_id = decision.get('agent_id', 'Unknown')
        selected_agent = next((agent for agent in self.agents if agent['id'] == agent_id), None)
        
        # Agent info
        if selected_agent:
            print(f"🤖 Recommended Agent: {selected_agent['name']} ({agent_id})")
            print(f"🛠️  Framework: {selected_agent['framework']}")
            print(f"📋 Agent Role: {selected_agent['description']}")
            print()
        
        # Draft prompt (show more for agent 01O, truncated for others) - use raw version with preserved line breaks
        draft_prompt_raw = decision.get('draft_prompt_raw', decision.get('draft_prompt', 'No prompt provided'))
        # Ensure we have a string to work with
        if not draft_prompt_raw or draft_prompt_raw is None:
            draft_prompt_raw = 'No prompt provided'
        elif not isinstance(draft_prompt_raw, str):
            draft_prompt_raw = str(draft_prompt_raw)
            
        print("📝 Generated Prompt:")
        print("-" * 50)
        
        # Show complete prompt without truncation
        try:
            prompt_lines = draft_prompt_raw.split('\n')
            for line in prompt_lines:
                # Handle empty lines (preserve spacing)
                if not line.strip():
                    print()
                else:
                    # Wrap long lines but preserve structure
                    wrapped = textwrap.fill(line, width=66, initial_indent="   ", subsequent_indent="   ")
                    print(wrapped)
        except AttributeError as e:
            print(f"   Error displaying prompt: {e}")
            print(f"   Raw prompt data: {draft_prompt_raw}")
        print("-" * 50)
        
        # Status
        is_complete = decision.get('complete', False)
        status = "✅ Complete" if is_complete else "⏳ Needs refinement"
        print(f"📊 Status: {status}")
        
        # Questions at the end (most important info last) - with null safety
        questions = decision.get('questions', [])
        # Ensure questions is a list and not None
        if questions is None:
            questions = []
        elif not isinstance(questions, list):
            questions = []  # Handle case where questions is not a list
            
        if questions and len(questions) > 0:
            print(f"\n❓ {Colors.BOLD}Outstanding Questions:{Colors.RESET}")
            for i, question in enumerate(questions, 1):
                # Null safety for individual questions
                safe_question = str(question) if question is not None else "No question text"
                wrapped = textwrap.fill(f"{i}. {safe_question}", width=66, initial_indent="   ", subsequent_indent="      ")
                print(wrapped)
        
        # Get feedback with corrected logic
        print(f"\n💬 {Colors.BOLD}What would you like to do?{Colors.RESET}")
        print(f"   {Colors.GREEN}y/Y{Colors.RESET} = Accept this prompt (save and use)")
        print(f"   {Colors.YELLOW}n/N{Colors.RESET} = Need refinement (re-consult Solution Strategist)")
        print(f"   {Colors.RED}m/M{Colors.RESET} = Manual context only (add context without re-consulting)")
        
        # Show warning if prompt is incomplete - with null safety
        is_complete = decision.get('complete', False)
        has_questions = isinstance(questions, list) and len(questions) > 0
        if not is_complete or has_questions:
            print(f"\n{Colors.YELLOW}⚠️  WARNING:{Colors.RESET} This prompt is marked as incomplete by the Solution Strategist.")
            if has_questions:
                question_count = len(questions) if isinstance(questions, list) else 0
                print(f"   There are {question_count} unanswered question(s) above.")
            print(f"   {Colors.BOLD}Even if you choose 'Accept', it will be saved as 'needs_refinement'.{Colors.RESET}")
        
        while True:
            try:
                response = input(f"\n{Colors.CYAN}Your choice (y/n/m): {Colors.RESET}").strip().lower()
                if response in ['y', 'yes']:
                    return True  # Accept prompt
                elif response in ['n', 'no']:
                    return 'modify'  # Re-consult Solution Strategist
                elif response in ['m', 'modify', 'manual']:
                    return False  # Manual context only, don't re-consult
                else:
                    print(f"{Colors.RED}❌ Please enter 'y' to accept, 'n' to refine, or 'm' for manual context{Colors.RESET}")
            except (EOFError, KeyboardInterrupt):
                print(f"\n{Colors.YELLOW}👋 Exiting...{Colors.RESET}")
                return None  # Return None to indicate cancellation
    
    def display_strategist_response(self, decision: Dict[str, Any], user_problem: str) -> bool:
        """Display strategist response for re-evaluation (without interactive choices)"""
        # Null safety check
        if not decision or not isinstance(decision, dict):
            print(f"\n{Colors.RED}❌ Error: Invalid or empty response from Solution Strategist{Colors.RESET}")
            return False
        
        # Show enhanced problem analysis with null safety
        short_name = decision.get('short_name', 'Task')
        short_description = decision.get('short_description', user_problem[:100] if user_problem else 'No description available')
        improved_problem = decision.get('improved_problem', user_problem if user_problem else 'No problem description')
        execution_scope = decision.get('execution_scope', 'single')
        
        print(f"📝 Task Name: {Colors.BOLD}{short_name}{Colors.RESET}")
        print(f"📄 Description: {short_description}")
        scope_display = f"{Colors.YELLOW}PER-UNIT{Colors.RESET}" if execution_scope == "per-unit" else f"{Colors.GREEN}SINGLE{Colors.RESET}"
        print(f"🎯 Execution Scope: {scope_display}")
        print()
        
        # Show improved problem if different from original
        if improved_problem != user_problem:
            print(f"{Colors.BOLD}✨ Refined Problem Description:{Colors.RESET}")
            print(textwrap.fill(improved_problem, width=66, initial_indent="   ", subsequent_indent="   "))
            print()
        
        # Get selected agent info
        agent_id = decision.get('agent_id', 'Unknown')
        selected_agent = next((agent for agent in self.agents if agent['id'] == agent_id), None)
        
        # Agent info
        if selected_agent:
            print(f"🤖 Recommended Agent: {selected_agent['name']} ({agent_id})")
            print(f"🛠️  Framework: {selected_agent['framework']}")
            print(f"📋 Agent Role: {selected_agent['description']}")
            print()
        
        # Draft prompt - show complete prompt
        draft_prompt_raw = decision.get('draft_prompt_raw', decision.get('draft_prompt', 'No prompt provided'))
        if not draft_prompt_raw or draft_prompt_raw is None:
            draft_prompt_raw = 'No prompt provided'
        elif not isinstance(draft_prompt_raw, str):
            draft_prompt_raw = str(draft_prompt_raw)
            
        print("📝 Generated Prompt:")
        print("-" * 50)
        
        try:
            prompt_lines = draft_prompt_raw.split('\n')
            for line in prompt_lines:
                if not line.strip():
                    print()
                else:
                    wrapped = textwrap.fill(line, width=66, initial_indent="   ", subsequent_indent="   ")
                    print(wrapped)
        except AttributeError as e:
            print(f"   Error displaying prompt: {e}")
            print(f"   Raw prompt data: {draft_prompt_raw}")
        print("-" * 50)
        
        # Status
        is_complete = decision.get('complete', False)
        status = "✅ Complete" if is_complete else "⏳ Needs refinement"
        print(f"📊 Status: {status}")
        
        # Questions - with null safety
        questions = decision.get('questions', [])
        if questions is None:
            questions = []
        elif not isinstance(questions, list):
            questions = []
            
        if questions and len(questions) > 0:
            print(f"\n❓ {Colors.BOLD}Outstanding Questions:{Colors.RESET}")
            for i, question in enumerate(questions, 1):
                safe_question = str(question) if question is not None else "No question text"
                wrapped = textwrap.fill(f"{i}. {safe_question}", width=66, initial_indent="   ", subsequent_indent="      ")
                print(wrapped)
        
        print("="*70)
        return True
    
    def format_agents_for_prompt(self) -> str:
        """Format agents list for the router prompt with complete information"""
        agents_list = []
        for agent in self.agents:
            if agent['id'] != 'SS01':  # Exclude the router itself
                agents_list.append(
                    f"- ID: {agent['id']}\n"
                    f"  Name: {agent['name']}\n"
                    f"  Description/Role: {agent['description']}\n"
                    f"  Framework: {agent['framework']}\n"
                    f"  Agent Command: {agent['agent_name']}\n"
                    f"  Model: {agent['model']}"
                )
        return "\n\n".join(agents_list)
    
    def get_scope_instructions(self, execution_scope: str) -> str:
        """Generate scope-specific instructions for the router agent"""
        if execution_scope == 'per-unit':
            return """
IMPORTANT: This prompt will be executed individually for each unit of the book. Therefore:

1. The generated prompt MUST use "Unit X" as a placeholder that will be replaced with actual unit numbers (Unit 1, Unit 2, etc.)
2. Specify paths using "src/book/unitX/" as the base directory for unit-specific files
3. The agent should ONLY modify files in Unit X or general resources (index.html, main CSS/JS) if strictly necessary
4. The agent CAN consult other units for consistency and structure understanding, but should NOT modify them
5. Emphasize that this is a template that will be applied to multiple units

Include this emphasis in your generated prompt: "CRITICAL: You are working on Unit X. Use 'Unit X' and 'src/book/unitX/' in all references. Only modify Unit X files or global resources if absolutely necessary."
"""
        else:
            return """
This is a single execution that affects the entire project. The agent can modify files as needed including:
- index.html (main entry point)
- src/book/style.css and src/book/app.js (global resources)
- Any unit directories (src/book/unit1/, src/book/unit2/, etc.) as needed
- Other project files if required

IMPORTANT GUIDELINES:
1. If editing specific unit files, clearly specify WHICH files are being modified and WHY
2. Consider the impact on ALL units when making changes to unit-specific files
3. Prefer modifying global resources (CSS, JS, index.html) over individual unit files when possible
4. If unit-specific changes are needed, provide clear rationale and ensure consistency across units

Focus on a comprehensive solution that addresses the problem globally while being precise about any unit-specific modifications.
"""
    
    def call_router_agent(self, user_problem: str, execution_scope: str = 'single') -> str:
        """Call the Solution Strategist (router) agent"""
        router_agent = next((agent for agent in self.agents if agent['id'] == 'SS01'), None)
        
        if not router_agent:
            print("❌ Router agent (SS01) not found!")
            return ""
        
        agents_info = self.format_agents_for_prompt()
        
        # Add scope-specific instructions
        scope_instructions = self.get_scope_instructions(execution_scope)
        
        # Use multiline YAML format without escaping
        prompt = f"""CRITICAL: You are ONLY a prompt generator and problem analyst. You must NOT generate any solutions, code, or content. Your ONLY job is to analyze the problem and generate an optimized prompt for another agent.

The user has a problem with the current project:
"{user_problem}"

EXECUTION SCOPE: {execution_scope.upper()}
{scope_instructions}

Evaluate using the framework "{router_agent['framework']}" (Reason + Act approach).

I have several agents and one of them might be able to generate the solution:

{agents_info}

IMPORTANT: Your role is EXCLUSIVELY to:
1. Analyze and determine the optimal execution scope (single vs per-unit)
2. Generate a short name and description for the problem
3. Improve the problem redaction for clarity
4. Recommend which agent should handle this task
5. Ask clarifying questions if needed
6. Generate an optimized prompt for that agent
7. You must NOT provide any solutions yourself

You must indicate in a structured YAML format using multiline syntax:
- agent_id: ID of the recommended agent
- execution_scope: >-
    Analyze the problem and determine if it should be:
    "single" - Applied once to the entire project (global changes, routing, main CSS, index.html)
    "per-unit" - Applied to each unit individually (unit-specific content, individual page improvements)
    Choose the most appropriate scope based on the nature of the problem.
- short_name: >-
    A concise name for this problem (maximum 30 characters).
    Example: "Fix mobile navigation menu"
- short_description: >-
    A brief description of the problem (maximum 100 characters).
    Example: "Navigation menu doesn't work properly on mobile devices with hamburger functionality"
- improved_problem: >-
    Rewrite the user's problem description with better clarity, grammar, and technical precision.
    Maintain the original intent but improve the language, structure, and technical accuracy.
    Make it more professional and comprehensive while keeping the same core meaning.
- improved_context: >-
    If additional context was provided in iterations, improve its redaction as well.
    If no additional context exists, set this to null.
- questions: list of questions you need answered to complete the framework (if any)
- draft_prompt: >-
    A complete, optimized prompt for the selected agent.
    CRITICAL: The prompt MUST start with the agent's role/persona definition.
    Use the agent's description as their persona, then include their framework and the task.
    Use YAML multiline format (>-) to avoid escaping quotes and special characters.
    
    MANDATORY FORMAT:
    draft_prompt: >-
      You are [AGENT_DESCRIPTION_HERE].
      
      Framework: [AGENT_FRAMEWORK_HERE]
      
      Your task is to help solve the following problem:
      [USE_IMPROVED_PROBLEM_DESCRIPTION_HERE]
      
      [Additional instructions based on the framework]
      
    Example:
    draft_prompt: >-
      You are an expert software engineer specializing in modern web development with React, Vue, and Node.js.
      
      Framework: Component-Based Development
      
      Your task is to help solve the following problem:
      Create a responsive navigation component with mobile hamburger menu that works seamlessly across all devices
      
      Please provide a complete solution following component-based architecture principles.
- complete: true/false indicating if the prompt is complete or if questions need to be answered

Wrap your YAML response between ```yaml and ``` markers. Do not include any other text outside these markers.
"""
        
        print("🔄 Consulting Solution Strategist...")
        print()
        
        # Show the full prompt being sent (toggleable with Ctrl+P)
        if self.show_strategist_prompt:
            print("📤 Prompt sent to Solution Strategist:")
            print("=" * 70)
            print(prompt)
            print("=" * 70)
            print()
        
        # Get agent timeout (use global default if not specified)
        agent_timeout = router_agent.get('timeout', DEFAULT_AGENT_TIMEOUT)
        if agent_timeout is None:
            agent_timeout = DEFAULT_AGENT_TIMEOUT
        
        # Show command preview using unified handler logic  
        from prompt_utils.agent_handler import UnifiedAgentHandler
        handler = UnifiedAgentHandler()
        cmd_display = handler._build_command_display_string(router_agent, yolo_run=False)
        highlighted_cmd = f"{Colors.BG_GRAY}{Colors.BLUE}{Colors.BOLD} {cmd_display} {Colors.RESET}"
        print(f"🖥️  Command: {highlighted_cmd}")
        
        # Show description of what we're doing
        print(f"📋 Description: Analyzing problem and generating optimized prompt")
        print(f"🎯 Problem: {user_problem[:80]}{'...' if len(user_problem) > 80 else ''}")
        print()  # Add spacing
        
        # Get full command string for audit logging
        full_command = handler.get_full_command_string(router_agent, prompt, yolo_run=False)
        
        # Start counter for timing
        counter_stop = threading.Event()
        counter_data = {'final_time': None}  # Shared data for final time
        counter_thread = threading.Thread(target=self.show_waiting_counter, args=(counter_stop, agent_timeout, counter_data))
        counter_thread.start()
        
        try:
            # Log execution start with full command
            audit_logger = AuditLogger()
            audit_logger.log_execution_start(
                prompt_id="router_prompt",
                agent_name=router_agent.get('agent_name', 'unknown'),
                command=full_command,
                full_prompt=prompt
            )
            
            # Execute with unified agent handler in plan mode (yolo_run=False)
            result = execute_agent_prompt(
                prompt=prompt,
                agent_config=router_agent,
                yolo_run=False,  # CRITICAL: Always plan mode for prompt_manager
                timeout=agent_timeout
            )
            
            # Stop counter and show timing
            counter_stop.set()
            counter_thread.join()
            
            if counter_data['final_time']:
                elapsed_minutes = counter_data['final_time'] // 60
                elapsed_seconds = counter_data['final_time'] % 60
                if elapsed_minutes > 0:
                    time_str = f"{elapsed_minutes}m {elapsed_seconds:02d}s"
                else:
                    time_str = f"{elapsed_seconds:02d}s"
                print(f"\r✅ Agent responded in {Colors.GREEN}{Colors.BOLD}{time_str}{Colors.RESET}")
            
            # Handle successful execution
            if result.success:
                if result.fallback_used:
                    print(f"ℹ️  Fallback model used: {result.model_used}")
                return result.output
            else:
                # Handle errors with proper user messaging
                if result.timeout_occurred:
                    print(f"\n❌ Timeout after {agent_timeout}s waiting for {router_agent.get('model', 'unknown model')} response")
                    if result.fallback_used:
                        print(f"❌ Fallback model also timed out")
                    elif router_agent.get('agent_name') == 'claude':
                        print("ℹ️  Claude automatically tried fallback model internally")
                    else:
                        print("⚠️  No fallback model configured")
                elif "not found" in result.error.lower() or "command not found" in result.error.lower():
                    agent_name = router_agent.get('agent_name', 'unknown')
                    print(f"❌ '{agent_name}' command not found. Please install {agent_name} CLI.")
                else:
                    print(f"❌ Error calling {router_agent.get('agent_name', 'unknown')}: {result.error}")
                
                return ""
                
        except Exception as e:
            # Ensure counter is stopped on any unexpected error
            counter_stop.set()
            counter_thread.join()
            print(f"❌ Unexpected error during agent execution: {e}")
            return ""
    
    def parse_router_response(self, response: str) -> Dict[str, Any]:
        """Parse the YAML response from the router"""
        try:
            # Extract YAML content between markers
            yaml_start = response.find('```yaml')
            yaml_end = response.find('```', yaml_start + 7)
            
            if yaml_start == -1 or yaml_end == -1:
                raise ValueError("No YAML markers found in response")
            
            yaml_content = response[yaml_start + 7:yaml_end].strip()
            
            # Parse YAML but also extract raw draft_prompt to preserve formatting
            parsed = yaml.safe_load(yaml_content)
            
            # Extract the raw draft_prompt with preserved line breaks
            if parsed and 'draft_prompt' in parsed:
                # Find the draft_prompt section in the raw YAML
                draft_start = yaml_content.find('draft_prompt:')
                if draft_start != -1:
                    # Find the content after the >- marker
                    content_start = yaml_content.find('>-', draft_start)
                    if content_start != -1:
                        content_start = yaml_content.find('\n', content_start) + 1
                        
                        # Find the end (next YAML key or end of content)
                        lines = yaml_content[content_start:].split('\n')
                        prompt_lines = []
                        
                        for line in lines:
                            # If line doesn't start with spaces, it's a new YAML key
                            if line.strip() and not line.startswith('  '):
                                break
                            # Remove the indentation (first 2 spaces) and add to prompt
                            if line.startswith('  '):
                                prompt_lines.append(line[2:])
                            elif not line.strip():  # Empty line
                                prompt_lines.append('')
                        
                        # Join with actual line breaks
                        raw_prompt = '\n'.join(prompt_lines).strip()
                        if raw_prompt:
                            parsed['draft_prompt_raw'] = raw_prompt
            
            return parsed
            
        except (yaml.YAMLError, ValueError) as e:
            print(f"❌ Error parsing router response: {e}")
            print("📝 This usually indicates the Solution Strategist provided an invalid YAML format.")
            print("💡 The system will retry with a new request.")
            return {}
        except Exception as e:
            print(f"❌ Unexpected error parsing router response: {e}")
            print("🔧 This may indicate a system issue. Please check logs for details.")
            return {}
    
    def show_iteration_context(self, user_problem: str, additional_context: str, iteration: int):
        """Show current session context to the user"""
        print(f"\n{Colors.BOLD}📋 CURRENT SESSION CONTEXT{Colors.RESET}")
        print("="*70)
        print(f"{Colors.BOLD}🎯 Original Problem:{Colors.RESET}")
        print(f"   {user_problem}")
        
        if additional_context:
            print(f"\n{Colors.BOLD}🔄 Accumulated Refinements:{Colors.RESET}")
            context_lines = additional_context.split('\n')
            for line in context_lines:
                if line.strip():
                    print(f"   {line}")
        
        print(f"\n{Colors.BOLD}📊 Current Iteration:{Colors.RESET} {iteration}")
        print("="*70)
    
    def get_additional_feedback_with_context(self) -> str:
        """Get additional feedback from user with better guidance and enhanced text wrapping"""
        print(f"\n{Colors.YELLOW}💡 REFINEMENT GUIDANCE{Colors.RESET}")
        print("What you provide here will be ADDED to your original problem.")
        print("You can:")
        print("  • Add new requirements or constraints")
        print("  • Clarify existing requirements") 
        print("  • Specify what you didn't like about the current solution")
        print("  • Request different approaches or technologies")
        print("")
        print("Examples:")
        print("  - 'Make it more mobile-friendly'")
        print("  - 'Use hash routing instead of path routing'")
        print("  - 'Add error handling for network failures'")
        print("  - 'Focus more on performance optimization'")
        print("")
        
        # Force readline reconfiguration specifically for iteration feedback
        print(f"{Colors.DIM}🔧 Configuring text input for optimal wrapping...{Colors.RESET}")
        self.configure_readline_for_input()
        
        return self.get_multiline_input("📝 What refinements do you want to add?")
    
    def preview_strategist_input(self, enhanced_problem: str) -> bool:
        """Show user what will be sent to Solution Strategist"""
        print(f"\n{Colors.YELLOW}🔍 PREVIEW: What will be sent to Solution Strategist{Colors.RESET}")
        print("="*70)
        print(enhanced_problem)
        print("="*70)
        
        # Ask for confirmation
        while True:
            choice = input(f"\n{Colors.CYAN}Proceed with this input? (y/n): {Colors.RESET}").lower().strip()
            if choice in ['y', 'yes', '']:
                return True
            elif choice in ['n', 'no']:
                print("❌ Operation cancelled.")
                return False
            else:
                print("Please enter 'y' for yes or 'n' for no.")
    
    def confirm_execution_scope(self, recommended_scope: str) -> str:
        """Confirm execution scope with user, using strategist recommendation as default"""
        print(f"\n{Colors.BOLD}🎯 EXECUTION SCOPE CONFIRMATION{Colors.RESET}")
        print("The Solution Strategist has analyzed your problem and recommended an execution scope.")
        print("You can accept the recommendation or choose a different scope.")
        print()
        print("Scope Options:")
        print("• Single execution: Global routing system, main CSS changes, index.html updates")
        print("• Per-unit execution: Unit-specific content fixes, individual page improvements")
        print()
        
        # Show recommended scope prominently
        scope_display = f"{Colors.GREEN}SINGLE{Colors.RESET}" if recommended_scope == 'single' else f"{Colors.YELLOW}PER-UNIT{Colors.RESET}"
        print(f"📋 Recommended: {scope_display}")
        print()
        
        while True:
            default_option = 's' if recommended_scope == 'single' else 'u'
            default_display = 'Single' if recommended_scope == 'single' else 'Per-unit'
            
            scope_input = input(f"{Colors.GREEN}s{Colors.RESET} = Single execution (entire project)\n{Colors.YELLOW}u{Colors.RESET} = Per-unit execution (template with Unit X placeholder)\n{Colors.CYAN}Enter{Colors.RESET} = Accept recommendation ({default_display})\n\n{Colors.CYAN}Execution scope (s/u/Enter): {Colors.RESET}")
            
            # If empty, use recommendation
            if scope_input.strip() == "":
                return recommended_scope
            elif scope_input.lower() in ['s', 'single']:
                return 'single'
            elif scope_input.lower() in ['u', 'unit', 'per-unit']:
                return 'per-unit'
            elif scope_input.lower() in ['q', 'quit', 'exit']:
                return None
            else:
                print(f"{Colors.RED}❌ Please enter 's' for single, 'u' for per-unit, Enter for recommendation, or 'q' to quit{Colors.RESET}")
                continue

    def get_execution_scope(self) -> str:
        """Ask user about execution scope: single vs per-unit"""
        print(f"\n{Colors.BOLD}🎯 EXECUTION SCOPE{Colors.RESET}")
        print("Will this solution be applied once to the entire project, or should it")
        print("be executed individually for each unit of the book?")
        print("")
        print("Examples:")
        print("• Single execution: Global routing system, main CSS changes, index.html updates")
        print("• Per-unit execution: Unit-specific content fixes, individual page improvements")
        print("")
        print(f"{Colors.GREEN}s{Colors.RESET} = Single execution (entire project)")
        print(f"{Colors.YELLOW}u{Colors.RESET} = Per-unit execution (template with Unit X placeholder)")
        
        while True:
            try:
                choice = input(f"\n{Colors.CYAN}Execution scope (s/u): {Colors.RESET}").strip().lower()
                if choice in ['s', 'single']:
                    return 'single'
                elif choice in ['u', 'unit', 'per-unit']:
                    return 'per-unit'
                else:
                    print(f"{Colors.RED}❌ Please enter 's' for single or 'u' for per-unit execution{Colors.RESET}")
            except (EOFError, KeyboardInterrupt):
                print(f"\n{Colors.YELLOW}👋 Exiting...{Colors.RESET}")
                return None
    
    def show_waiting_counter(self, stop_event: threading.Event, timeout_seconds: int = 60, counter_data: Dict = None):
        """Show a visual counter while waiting for agent response with timeout display"""
        start_time = time.time()
        last_message_length = 0
        
        while not stop_event.is_set():
            elapsed = int(time.time() - start_time)
            remaining = max(0, timeout_seconds - elapsed)
            minutes = elapsed // 60
            seconds = elapsed % 60
            
            # Create animated waiting message
            dots = '.' * ((elapsed % 3) + 1)
            if minutes > 0:
                time_str = f"{minutes}m {seconds:02d}s"
            else:
                time_str = f"{seconds:02d}s"
            
            # Show timeout information
            remaining_minutes = remaining // 60
            remaining_seconds = remaining % 60
            if remaining_minutes > 0:
                timeout_str = f"{remaining_minutes}m {remaining_seconds:02d}s left"
            else:
                timeout_str = f"{remaining_seconds}s left"
            
            message = f"⏳ Waiting for response{dots} [{time_str}] (timeout: {timeout_str})"
            
            # Always clear more space than needed to handle dots changing from 3 to 1
            clear_space = max(last_message_length, len(message), 70)  # Ensure enough space for timeout
            clear_line = '\r' + ' ' * clear_space + '\r'
            print(clear_line + message, end='', flush=True)
            last_message_length = len(message)
            
            time.sleep(1)
        
        # Clear the counter line before exiting - ensure enough space to clear longest possible message
        clear_space = max(last_message_length, 100)  # Use at least 100 chars to be safe
        clear_line = '\r' + ' ' * clear_space + '\r'
        print(clear_line, end='', flush=True)
        
        # Store final elapsed time for caller to use
        final_elapsed = int(time.time() - start_time)
        if counter_data is not None:
            counter_data['final_time'] = final_elapsed
    
    def get_additional_feedback(self) -> str:
        """Legacy method - kept for compatibility"""
        return self.get_additional_feedback_with_context()
    
    def show_final_message(self, satisfied: bool, prompt_id: str, decision: Dict[str, Any] = None):
        """Show final success/completion message with status explanation"""
        print("\n" + "="*70)
        
        # Determine if prompt was forced to needs_refinement due to incomplete status
        forced_incomplete = False
        if decision:
            strategy_complete = decision.get('complete', False)
            has_questions = len(decision.get('questions', [])) > 0
            forced_incomplete = (not strategy_complete or has_questions) and satisfied
        
        if satisfied and not forced_incomplete:
            print("✅ PROMPT GENERATED SUCCESSFULLY!")
            print(f"📁 Prompt saved with ID: {prompt_id}")
            print(f"📂 Location: src/conf/agent_prompts.yaml")
            print(f"📊 Status: enabled (ready for execution)")
        elif forced_incomplete:
            print("⚠️  PROMPT SAVED BUT NEEDS REFINEMENT")
            print(f"📁 Prompt saved with ID: {prompt_id}")
            print(f"📂 Location: src/conf/agent_prompts.yaml")
            print(f"📊 Status: needs_refinement (Solution Strategist marked as incomplete)")
            if decision and decision.get('questions'):
                print(f"❓ Reason: {len(decision.get('questions', []))} unanswered question(s)")
        else:
            print("🔄 PROMPT SAVED FOR REFINEMENT")
            print(f"📁 Prompt saved with ID: {prompt_id}")
            print(f"📂 Location: src/conf/agent_prompts.yaml")
            print(f"📊 Status: needs_refinement")
        print("="*70)
    
    # YAML Configuration Editor Methods
    
    def show_main_menu(self) -> str:
        """Show main menu and get user choice."""
        print("\n" + "="*70)
        print("🤖 AI Prompt Manager - Main Menu")
        print("="*70)
        print("1. 📝 Generate new AI prompt (default)")
        print("2. 📋 List existing prompts")
        print("3. 👀 Show specific prompt details")
        print("4. ✏️  Edit existing prompt (draft mode)")
        print("5. 🗑️  Delete prompt")
        print("6. 🎨 Format YAML configuration")
        print("7. ✅ Validate YAML configuration")
        print("8. 🚪 Exit")
        print("="*70)
        
        while True:
            choice = input("\nSelect option (1-8) [1]: ").strip() or "1"
            if choice in ["1", "2", "3", "4", "5", "6", "7", "8"]:
                return choice
            print("❌ Invalid choice. Please select 1-8.")
    
    def list_existing_prompts(self):
        """List all existing prompts with state filtering."""
        prompts = self.config_manager.load_prompts()
        
        if not prompts:
            print("📋 No prompts found in configuration.")
            return
        
        # Show filter options
        filter_choice = self.show_state_filter_menu()
        
        # Apply filter
        filtered_prompts = self.filter_prompts_by_state(prompts, filter_choice)
        
        if not filtered_prompts:
            filter_name = PromptStates.get_filter_options().get(filter_choice, {}).get('name', filter_choice)
            print(f"\n📋 No prompts found matching filter: {filter_name}")
            return
        
        # Display filtered prompts
        filter_name = PromptStates.get_filter_options().get(filter_choice, {}).get('name', 'All prompts')
        print(f"\n📋 {filter_name} ({len(filtered_prompts)}/{len(prompts)} prompts):")
        print("="*80)
        
        for prompt in filtered_prompts:
            self.display_prompt_summary(prompt)
        
        # Show summary statistics if showing all prompts
        if filter_choice == 'all' and len(prompts) > 1:
            self._show_prompt_statistics(prompts)
    
    def _show_prompt_statistics(self, prompts):
        """Show summary statistics of all prompts by state."""
        print("="*80)
        print("📊 Summary Statistics:")
        
        # Count prompts by state
        state_counts = {
            'draft': 0,
            'ready': 0, 
            'executed': 0,
            'incomplete': 0,
            'disabled': 0
        }
        
        for prompt in prompts:
            status = prompt.status.lower()
            has_executions = PromptStates._check_execution_status(prompt, self.state_manager)
            
            if status == PromptStates.DRAFT:
                state_counts['draft'] += 1
            elif status == PromptStates.ENABLED and has_executions:
                state_counts['executed'] += 1
            elif status == PromptStates.ENABLED and not has_executions:
                state_counts['ready'] += 1
            elif status == PromptStates.NEEDS_REFINEMENT:
                state_counts['incomplete'] += 1
            elif status == PromptStates.DISABLED:
                state_counts['disabled'] += 1
        
        # Display counts
        filter_options = PromptStates.get_filter_options()
        for key, count in state_counts.items():
            if count > 0:
                info = filter_options.get(key, {})
                icon = info.get('icon', '📋')
                name = info.get('name', key.title())
                print(f"   {icon} {name}: {count}")
        
        print()
    
    def show_state_filter_menu(self):
        """Show filter options and get user choice."""
        print("\n🔍 Filter Prompts by State:")
        print("="*50)
        
        filter_options = PromptStates.get_filter_options()
        options_list = list(filter_options.keys())
        
        # Count prompts for each filter to provide better UX
        prompts = self.config_manager.load_prompts()
        filter_counts = {}
        
        for key in options_list:
            if key == 'all':
                filter_counts[key] = len(prompts)
            else:
                filtered = self.filter_prompts_by_state(prompts, key)
                filter_counts[key] = len(filtered)
        
        for i, (key, info) in enumerate(filter_options.items(), 1):
            count = filter_counts.get(key, 0)
            count_display = f"({count})" if count > 0 else f"{Colors.DIM}(0){Colors.RESET}"
            print(f"  {i}. {info['icon']} {info['name']} {count_display}")
        
        while True:
            choice = input(f"\nSelect filter (1-{len(options_list)}) [1]: ").strip() or "1"
            try:
                index = int(choice) - 1
                if 0 <= index < len(options_list):
                    return options_list[index]
                else:
                    print(f"❌ Invalid choice. Please select 1-{len(options_list)}.")
            except ValueError:
                print("❌ Please enter a valid number.")
    
    def filter_prompts_by_state(self, prompts, filter_choice):
        """Filter prompts based on state choice."""
        if filter_choice == 'all':
            return prompts
        
        filtered = []
        
        for prompt in prompts:
            status = prompt.status.lower()
            has_executions = PromptStates._check_execution_status(prompt, self.state_manager)
            
            # Apply filters based on the derived state
            include = False
            
            if filter_choice == 'draft' and status == PromptStates.DRAFT:
                include = True
            elif filter_choice == 'ready' and status == PromptStates.ENABLED and not has_executions:
                include = True
            elif filter_choice == 'executed' and status == PromptStates.ENABLED and has_executions:
                include = True
            elif filter_choice == 'incomplete' and status == PromptStates.NEEDS_REFINEMENT:
                include = True
            elif filter_choice == 'disabled' and status == PromptStates.DISABLED:
                include = True
            
            if include:
                filtered.append(prompt)
        
        return filtered
    
    def display_prompt_summary(self, prompt):
        """Display a single prompt summary with enhanced state info."""
        # Get state information
        state_info = PromptStates.get_state_info(prompt, self.state_manager)
        
        # Scope information
        scope_icon = "🔄" if prompt.execution_scope == "per-unit" else "1️⃣"
        scope_display = f"{Colors.YELLOW}PER-UNIT{Colors.RESET}" if prompt.execution_scope == "per-unit" else f"{Colors.GREEN}SINGLE{Colors.RESET}"
        
        # Enhanced execution status for per-unit prompts
        execution_info = PromptStates.get_execution_progress(prompt, self.state_manager)
        
        # Get display name and description
        short_name = getattr(prompt, 'short_name', None) or prompt.id
        
        # Handle potential missing attributes gracefully
        if hasattr(prompt, 'short_description'):
            short_description = prompt.short_description
        elif hasattr(prompt, 'user_problem'):
            short_description = prompt.user_problem[:80] + '...' if len(prompt.user_problem) > 80 else prompt.user_problem
        else:
            short_description = "No description available"
        
        # Ensure short_name is not too long
        if len(short_name) > 35:
            short_name = short_name[:35] + "..."
        
        # Format main line
        state_colored = f"{state_info['color']}{state_info['name']}{Colors.RESET}"
        
        print(f"{state_info['icon']} {scope_icon} [{Colors.CYAN}{prompt.id}{Colors.RESET}] {Colors.BOLD}{short_name}{Colors.RESET}")
        print(f"    📊 Status: {state_colored} | 🎯 Scope: {scope_display}{execution_info}")
        
        # Handle agent information gracefully
        agent_name = getattr(prompt, 'agent_name', 'unknown')
        model = getattr(prompt, 'model', 'unknown')
        created = getattr(prompt, 'created', 'unknown')[:10] if hasattr(prompt, 'created') else 'unknown'
        
        print(f"    🤖 Agent: {agent_name} ({model}) | 📅 Created: {created}")
        
        # Show fallback model if available
        if hasattr(prompt, 'fallback_model') and prompt.fallback_model:
            print(f"    🔄 Fallback: {prompt.fallback_model}")
        
        # Show brief description if available
        if short_description and short_description != prompt.id:
            print(f"    📝 {Colors.DIM}{short_description}{Colors.RESET}")
        
        print()  # Add spacing between prompts
        
        print(f"    💡 {Colors.DIM}{short_description}{Colors.RESET}")
        print()
    
    def show_prompt_details(self):
        """Show details for a specific prompt using ConfigManager."""
        prompt_id = input("\n🔍 Enter prompt ID to show: ").strip()
        if not prompt_id:
            print("❌ No prompt ID provided.")
            return
            
        prompts = self.config_manager.load_prompts()
        found_prompt = None
        
        for prompt in prompts:
            if prompt.id == prompt_id:
                found_prompt = prompt
                break
        
        if not found_prompt:
            print(f"❌ Prompt not found: {prompt_id}")
            return
        
        # Get enhanced fields from the prompt data
        prompt_data = found_prompt.__dict__
        short_name = prompt_data.get('short_name', prompt_id)
        short_description = prompt_data.get('short_description', found_prompt.user_problem[:100])
        improved_problem = prompt_data.get('improved_problem', found_prompt.user_problem)
        improved_context = prompt_data.get('improved_context', getattr(found_prompt, 'additional_context', None))
        
        scope_display = f"{Colors.YELLOW}PER-UNIT{Colors.RESET}" if found_prompt.execution_scope == "per-unit" else f"{Colors.GREEN}SINGLE{Colors.RESET}"
        status_display = f"{Colors.GREEN}✅ COMPLETED{Colors.RESET}" if found_prompt.is_completed else f"{Colors.YELLOW}⏳ PENDING{Colors.RESET}"
        
        print(f"\n📝 {Colors.BOLD}Prompt Details: [{Colors.CYAN}{prompt_id}{Colors.RESET}]{Colors.RESET}")
        print("="*70)
        print(f"📋 Short Name: {Colors.BOLD}{short_name}{Colors.RESET}")
        print(f"📄 Description: {short_description}")
        print(f"🤖 Agent: {found_prompt.agent_name} ({found_prompt.model})")
        print(f"📊 Status: {status_display}")
        print(f"🎯 Scope: {scope_display}")
        print(f"⚖️  Framework: {getattr(found_prompt, 'framework', 'Unknown')}")
        print(f"📅 Created: {found_prompt.created}")
        print()
        
        print(f"{Colors.BOLD}📝 Original User Problem:{Colors.RESET}")
        print(textwrap.fill(found_prompt.user_problem, width=100, initial_indent="  ", subsequent_indent="  "))
        print()
        
        if improved_problem != found_prompt.user_problem:
            print(f"{Colors.BOLD}✨ Improved Problem Description:{Colors.RESET}")
            print(textwrap.fill(improved_problem, width=100, initial_indent="  ", subsequent_indent="  "))
            print()
        
        if improved_context:
            print(f"{Colors.BOLD}📋 Additional Context:{Colors.RESET}")
            print(textwrap.fill(improved_context, width=100, initial_indent="  ", subsequent_indent="  "))
            print()
        
        # Show questions asked during router process
        questions = prompt_data.get('metadata', {}).get('questions_asked', [])
        if questions:
            print(f"{Colors.BOLD}❓ Questions Asked:{Colors.RESET}")
            for i, question in enumerate(questions, 1):
                print(f"  {i}. {question}")
            print()
        
        print(f"{Colors.BOLD}🤖 Complete Generated Prompt:{Colors.RESET}")
        print("=" * 70)
        # Wrap the full prompt text for better readability
        wrapped_prompt = textwrap.fill(found_prompt.prompt, width=100, initial_indent="", subsequent_indent="")
        print(wrapped_prompt)
        print("=" * 70)
        
        # Show execution command
        execution_command = prompt_data.get('metadata', {}).get('execution_command', 'Unknown')
        print(f"\n{Colors.BOLD}⚡ Execution Command:{Colors.RESET}")
        print(f"  {execution_command}")
        print()
    
    def format_yaml_config(self):
        """Format the YAML configuration file with multiline support using ConfigManager."""
        config_path = self.config_manager.config_path
        
        if not os.path.exists(config_path):
            print(f"❌ Configuration file not found: {config_path}")
            return
        
        try:
            # Load current configuration
            config_data = load_yaml_safe(config_path)
            if not config_data:
                print("❌ Could not load configuration data.")
                return
            
            # Create backup
            backup_path = f"{config_path}.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            with open(backup_path, 'w', encoding='utf-8') as backup_file:
                yaml.dump(config_data, backup_file, default_flow_style=False)
            
            print(f"📦 Backup created: {backup_path}")
            
            # Save with multiline formatting
            save_yaml_multiline(config_data, file_path=config_path, max_line_width=DEFAULT_YAML_LINE_WIDTH)
            
            print("✅ Configuration file reformatted with multiline formatting!")
            
        except Exception as e:
            print(f"❌ Failed to format configuration: {e}")
    
    def validate_yaml_config(self):
        """Validate the YAML configuration file using ConfigManager."""
        config_path = self.config_manager.config_path
        
        if not os.path.exists(config_path):
            print(f"❌ Configuration file not found: {config_path}")
            return
        
        try:
            # Load prompts first to populate the ConfigManager
            self.config_manager.load_prompts()
            
            # Use ConfigManager's built-in validation
            issues = self.config_manager.validate_configuration()
            
            if issues:
                print("❌ Configuration validation failed:")
                for issue in issues:
                    print(f"  • {issue}")
            else:
                print("✅ Configuration is valid!")
                
        except Exception as e:
            print(f"❌ Validation failed: {e}")
    
    def run_prompt_generation(self):
        """Run the original prompt generation flow"""
        try:
            # Step 1: Get user problem
            user_problem = self.get_multiline_input("Describe your problem or task:")
            if not user_problem:
                print("👋 Session cancelled by user.")
                return
            
            # Step 2: Call router agent with initial scope to get analysis
            print("🔄 Analyzing problem to determine optimal execution scope...")
            initial_router_response = self.call_router_agent(user_problem, 'single')  # Use 'single' as initial scope
            if not initial_router_response:
                print("❌ Failed to get router response.")
                return
            
            # Parse initial response to get the strategist's scope recommendation
            initial_decision = self.parse_router_response(initial_router_response)
            if not initial_decision:
                print("❌ Failed to parse router response.")
                return
            
            # Get the strategist's recommended scope
            recommended_scope = initial_decision.get('execution_scope', 'single')
            short_name = initial_decision.get('short_name', 'Task')
            short_description = initial_decision.get('short_description', user_problem[:100])
            
            print(f"\n🎯 {Colors.BOLD}Problem Analysis Complete:{Colors.RESET}")
            print(f"📝 Short Name: {Colors.CYAN}{short_name}{Colors.RESET}")
            print(f"📄 Description: {short_description}")
            print(f"🔧 Recommended Scope: {Colors.YELLOW}{recommended_scope.upper()}{Colors.RESET}")
            
            # Step 2.5: Confirm execution scope with user
            execution_scope = self.confirm_execution_scope(recommended_scope)
            if execution_scope is None:
                print("👋 Session cancelled by user.")
                return
            
            # Step 3: If scope changed, re-consult router agent
            if execution_scope != recommended_scope:
                print(f"🔄 Re-analyzing with {execution_scope.upper()} scope...")
                router_response = self.call_router_agent(user_problem, execution_scope)
                if not router_response:
                    print("❌ Failed to get router response.")
                    return
            else:
                router_response = initial_router_response
            
            # Step 3: Parse response
            decision = self.parse_router_response(router_response)
            if not decision:
                print("❌ Failed to parse router response.")
                return
            
            # Step 4: Interactive loop with Solution Strategist
            satisfied = None
            additional_context = ""
            iteration = 1
            
            while True:
                print(f"\n{Colors.BOLD}{'='*70}")
                print(f"ITERATION {iteration}")
                print(f"{'='*70}{Colors.RESET}")
                
                # Display results and get feedback
                satisfied = self.display_results(decision, user_problem)
                
                # Handle different responses
                if satisfied is None:  # Cancellation
                    print("👋 Session cancelled by user.")
                    return
                elif satisfied == 'modify':  # Interactive mode
                    print(f"\n{Colors.CYAN}🔄 Entering interactive refinement mode...{Colors.RESET}")
                    
                    # Show current context to user
                    self.show_iteration_context(user_problem, additional_context, iteration)
                    
                    # Get additional context from user with better guidance
                    additional_feedback = self.get_additional_feedback_with_context()
                    if not additional_feedback:
                        print("👋 Session cancelled by user.")
                        return
                    
                    # Add this feedback to accumulated context
                    if additional_context:
                        additional_context += f"\n\nIteration {iteration}: {additional_feedback}"
                    else:
                        additional_context = additional_feedback
                    
                    # Create enhanced problem description with context
                    enhanced_problem = f"{user_problem}\n\nAdditional context and refinements:\n{additional_context}"
                    
                    # Show what will be sent to Solution Strategist and get confirmation
                    if not self.preview_strategist_input(enhanced_problem):
                        print("👋 Session cancelled by user.")
                        return
                    
                    # Call Solution Strategist again with enhanced problem
                    router_response = self.call_router_agent(enhanced_problem, execution_scope)
                    if not router_response:
                        print("❌ Failed to get router response.")
                        return
                    
                    # Parse new response
                    decision = self.parse_router_response(router_response)
                    if not decision:
                        print("❌ Failed to parse router response.")
                        return
                    
                    iteration += 1
                    satisfied = None  # Continue the loop
                elif satisfied == False:  # Not satisfied but don't want to interact
                    # Get final feedback and exit loop
                    final_feedback = self.get_additional_feedback()
                    if final_feedback:
                        additional_context += f"\nFinal feedback: {final_feedback}"
                    break
                else:  # satisfied == True
                    break
            
            # Step 5: Save prompt
            final_satisfied = satisfied if satisfied is not None and satisfied != 'modify' else False
            print(f"\n{Colors.CYAN}💾 Saving prompt...{Colors.RESET}")
            prompt_id = self.save_prompt_entry(user_problem, decision, final_satisfied, additional_context, execution_scope)
            
            # Step 6: Show final message
            if prompt_id:
                self.show_final_message(final_satisfied, prompt_id, decision)
                
        except KeyboardInterrupt:
            print("\n👋 Session cancelled by user.")
        except Exception as e:
            print(f"\n❌ Unexpected error: {e}")
            print("\n🔍 Stack trace (last 3 calls from our code):")
            import traceback
            tb_lines = traceback.format_exc().split('\n')
            # Filter for lines that contain our code (not system/library code)
            our_code_lines = [line for line in tb_lines if 'prompt_manager' in line or 'learn-cloud' in line]
            for line in our_code_lines[-6:]:  # Show last 6 relevant lines
                if line.strip():
                    print(f"    {line}")
    
    def run(self):
        """Main CLI execution flow with persistent menu system"""
        try:
            self.print_header()
            
            while True:
                choice = self.show_main_menu()
                
                if choice == "1":
                    # Generate new AI prompt (original functionality)
                    self.run_prompt_generation()
                    self._prompt_continue()
                    
                elif choice == "2":
                    # List existing prompts
                    self.list_existing_prompts()
                    self._prompt_continue()
                    
                elif choice == "3":
                    # Show specific prompt details
                    self.show_prompt_details()
                    self._prompt_continue()
                    
                elif choice == "4":
                    # Edit existing prompt
                    self.edit_prompt_menu()
                    self._prompt_continue()
                    
                elif choice == "5":
                    # Delete prompt
                    self.delete_prompt_menu()
                    self._prompt_continue()
                    
                elif choice == "6":
                    # Format YAML configuration
                    self.format_yaml_config()
                    self._prompt_continue()
                    
                elif choice == "7":
                    # Validate YAML configuration
                    self.validate_yaml_config()
                    self._prompt_continue()
                    
                elif choice == "8":
                    # Exit
                    print(f"\n{Colors.GREEN}👋 Thank you for using AI Prompt Manager! Goodbye!{Colors.RESET}")
                    break
                    
        except KeyboardInterrupt:
            print(f"\n{Colors.YELLOW}👋 Session cancelled by user.{Colors.RESET}")
        except Exception as e:
            print(f"\n❌ Unexpected error: {e}")
            print("\n🔍 Stack trace (last 3 calls from our code):")
            import traceback
            tb_lines = traceback.format_exc().split('\n')
            # Filter for lines that contain our code (not system/library code)
            our_code_lines = [line for line in tb_lines if 'prompt_manager' in line or 'learn-cloud' in line]
            for line in our_code_lines[-6:]:  # Show last 6 relevant lines
                if line.strip():
                    print(f"    {line}")
    
    def _prompt_continue(self):
        """Prompt user to continue and provide visual separation."""
        print(f"\n{Colors.DIM}{'─' * 70}{Colors.RESET}")
        try:
            input(f"{Colors.CYAN}📋 Press Enter to return to main menu...{Colors.RESET}")
        except KeyboardInterrupt:
            # If user presses Ctrl+C, just continue - don't exit the whole program
            print(f"\n{Colors.YELLOW}⏩ Returning to main menu...{Colors.RESET}")
        print()  # Add some spacing before showing menu again

    def delete_prompt_menu(self):
        """Delete an existing prompt with confirmation."""
        print("\n🗑️  Delete Prompt")
        print("=" * 50)
        
        # Show available prompts
        prompts = self.config_manager.load_prompts()
        if not prompts:
            print("📋 No prompts found to delete.")
            return
        
        print("Available prompts:")
        for i, prompt in enumerate(prompts, 1):
            status_icon = "✅" if prompt.is_completed else "⏳"
            scope_icon = "🔄" if prompt.scope_type == "per-unit" else "1️⃣"
            short_name = getattr(prompt, 'short_name', None) or prompt.user_problem[:40] + "..."
            print(f"  {i}. {status_icon} {scope_icon} [{prompt.id}] {short_name}")
        
        # Get prompt selection
        while True:
            selection = input(f"\nSelect prompt to delete (1-{len(prompts)}) or 'q' to cancel: ").strip()
            if selection.lower() == 'q':
                print("🚫 Delete cancelled.")
                return
            
            try:
                index = int(selection) - 1
                if 0 <= index < len(prompts):
                    break
                else:
                    print(f"❌ Invalid selection. Please choose 1-{len(prompts)}.")
            except ValueError:
                print("❌ Please enter a valid number or 'q' to cancel.")
        
        selected_prompt = prompts[index]
        
        # Show prompt details and confirm deletion
        print(f"\n🚨 You are about to delete:")
        print(f"   ID: {selected_prompt.id}")
        print(f"   Name: {getattr(selected_prompt, 'short_name', None) or 'Unnamed'}")
        print(f"   Agent: {selected_prompt.agent_name}")
        print(f"   Scope: {selected_prompt.execution_scope}")
        print(f"   Status: {selected_prompt.status}")
        
        # Final confirmation
        while True:
            confirm = input("\n⚠️  Are you sure you want to delete this prompt? Type 'DELETE' to confirm or 'cancel': ").strip()
            if confirm == 'DELETE':
                break
            elif confirm.lower() in ['cancel', 'c', 'n', 'no']:
                print("🚫 Delete cancelled.")
                return
            else:
                print("❌ Please type 'DELETE' to confirm or 'cancel' to abort.")
        
        # Perform deletion
        try:
            # Remove from list
            prompts.pop(index)
            
            # Convert prompts to dictionaries for saving
            prompts_data = []
            for p in prompts:
                if hasattr(p, 'to_dict'):
                    prompts_data.append(p.to_dict())
                else:
                    prompts_data.append(p.__dict__)
            
            # Save updated list
            save_yaml_multiline({'prompts': prompts_data}, 
                               file_path=self.prompts_file, max_line_width=DEFAULT_YAML_LINE_WIDTH)
            
            print(f"\n✅ Prompt [{selected_prompt.id}] successfully deleted!")
            
        except Exception as e:
            print(f"\n❌ Error deleting prompt: {e}")
    
    def edit_prompt_menu(self):
        """Edit an existing prompt with various options."""
        print("\n✏️  Edit Prompt")
        print("=" * 50)
        
        # Show available prompts
        prompts = self.config_manager.load_prompts()
        if not prompts:
            print("📋 No prompts found to edit.")
            return
        
        print("Available prompts:")
        for i, prompt in enumerate(prompts, 1):
            status_icon = "✅" if prompt.is_completed else "⏳"
            scope_icon = "🔄" if prompt.scope_type == "per-unit" else "1️⃣"
            short_name = getattr(prompt, 'short_name', None) or prompt.user_problem[:40] + "..."
            print(f"  {i}. {status_icon} {scope_icon} [{prompt.id}] {short_name}")
        
        # Get prompt selection
        while True:
            selection = input(f"\nSelect prompt to edit (1-{len(prompts)}) or 'q' to cancel: ").strip()
            if selection.lower() == 'q':
                print("🚫 Edit cancelled.")
                return
            
            try:
                index = int(selection) - 1
                if 0 <= index < len(prompts):
                    break
                else:
                    print(f"❌ Invalid selection. Please choose 1-{len(prompts)}.")
            except ValueError:
                print("❌ Please enter a valid number or 'q' to cancel.")
        
        selected_prompt = prompts[index]
        self.edit_prompt_options(selected_prompt, prompts, index)
    
    def edit_prompt_options(self, prompt, all_prompts, prompt_index):
        """Show edit options for a selected prompt."""
        print(f"\n✏️  Editing Prompt [{prompt.id}]")
        print("=" * 60)
        
        while True:
            short_name = getattr(prompt, 'short_name', None) or prompt.user_problem[:50] + "..."
            print(f"\nCurrent prompt: {short_name}")
            print(f"Status: {prompt.status} | Scope: {prompt.execution_scope} | Agent: {prompt.agent_name}")
            
            print("\nEdit Options:")
            print("1. 📝 Add additional context (draft mode)")
            print("2. 🤖 Re-evaluate with Solution Strategist")
            print("3. 🔄 Change execution scope (single ↔ per-unit)")
            print("4. 👀 View full prompt details")
            print("5. ⬅️  Back to main menu")
            
            choice = input("\nSelect edit option (1-5): ").strip()
            
            if choice == "1":
                self.add_context_to_prompt(prompt, all_prompts, prompt_index)
                break
            elif choice == "2":
                self.reevaluate_with_strategist(prompt, all_prompts, prompt_index)
                break
            elif choice == "3":
                self.change_execution_scope(prompt, all_prompts, prompt_index)
                break
            elif choice == "4":
                self.show_full_prompt_details(prompt)
            elif choice == "5":
                break
            else:
                print("❌ Invalid choice. Please select 1-5.")
    
    def add_context_to_prompt(self, prompt, all_prompts, prompt_index):
        """Add additional context to a prompt without strategist (draft mode)."""
        print(f"\n📝 Adding Context to [{prompt.id}]")
        print("=" * 50)
        
        print("Current additional context:")
        current_context = getattr(prompt, 'additional_context', None) or "(No additional context)"
        print(f"📋 {current_context}")
        
        print("\nEnter additional context to append:")
        additional_context = self.get_multiline_input("Additional context:")
        
        if not additional_context:
            print("🚫 No context added.")
            return
        
        # Combine contexts
        if hasattr(prompt, 'additional_context') and prompt.additional_context:
            combined_context = f"{prompt.additional_context}\n\n--- Added Context ---\n{additional_context}"
        else:
            combined_context = additional_context
        
        # Update prompt - set to draft mode
        prompt.additional_context = combined_context
        prompt.status = 'draft'  # Set to draft since not re-evaluated by strategist
        
        # Save changes
        self._save_prompt_changes(all_prompts, f"Context added to prompt [{prompt.id}] and status set to 'draft'!")
    
    def reevaluate_with_strategist(self, prompt, all_prompts, prompt_index):
        """Re-evaluate prompt with Solution Strategist."""
        print(f"\n🤖 Re-evaluating [{prompt.id}] with Solution Strategist")
        print("=" * 60)
        
        # Get current problem and context
        current_problem = getattr(prompt, 'user_problem', '') or getattr(prompt, 'improved_problem', '')
        current_context = getattr(prompt, 'additional_context', '')
        
        print("Current problem:")
        print(f"📋 {current_problem}")
        
        if current_context:
            print("\nCurrent additional context:")
            print(f"📋 {current_context}")
        
        # Ask if user wants to modify before sending to strategist
        print("\nOptions:")
        print("1. Re-evaluate as-is")
        print("2. Add more context before re-evaluation")
        print("3. Cancel")
        
        choice = input("Select option (1-3): ").strip()
        
        if choice == "3":
            print("🚫 Re-evaluation cancelled.")
            return
        elif choice == "2":
            additional_context = self.get_multiline_input("Additional context for re-evaluation:")
            if additional_context:
                if current_context:
                    current_context = f"{current_context}\n\n--- For Re-evaluation ---\n{additional_context}"
                else:
                    current_context = additional_context
        
        # Call Solution Strategist with enhanced problem (combine problem + context)
        print("\n🔄 Consulting Solution Strategist...")
        if current_context:
            enhanced_problem = f"{current_problem}\n\nAdditional context and refinements:\n{current_context}"
        else:
            enhanced_problem = current_problem
        router_response = self.call_router_agent(enhanced_problem, prompt.execution_scope)
        
        if not router_response:
            print("❌ Failed to get strategist response.")
            return
        
        decision = self.parse_router_response(router_response)
        if not decision:
            print("❌ Failed to parse strategist response.")
            return
        
        # Display the complete strategist response using the same format as main generation
        print("\n" + "="*70)
        print("🎯 SOLUTION STRATEGIST RE-EVALUATION RESULTS")
        print("="*70)
        
        # Show the response similar to display_results but without interactive choices
        satisfied = self.display_strategist_response(decision, enhanced_problem)
        
        if not satisfied:
            print("❌ Invalid response from strategist.")
            return
        
        # Confirm application with clear explanation
        print(f"\n{Colors.CYAN}💡 CONFIRMATION REQUIRED{Colors.RESET}")
        print("The Solution Strategist has provided new recommendations above.")
        print("Applying these changes will update the prompt with:")
        print("  • New task name and description")
        print("  • Refined problem statement") 
        print("  • Updated prompt content")
        print("  • Appropriate agent assignment")
        print()
        
        confirm = input(f"{Colors.BOLD}Apply these strategist recommendations? (y/N): {Colors.RESET}").strip().lower()
        if confirm not in ['y', 'yes']:
            print(f"\n{Colors.YELLOW}🚫 Changes not applied. Prompt remains unchanged.{Colors.RESET}")
            return
        
        # Apply changes using unified schema if available
        if hasattr(prompt, 'short_name'):
            prompt.short_name = decision.get('short_name', getattr(prompt, 'short_name', ''))
        if hasattr(prompt, 'short_description'):    
            prompt.short_description = decision.get('short_description', getattr(prompt, 'short_description', ''))
        if hasattr(prompt, 'improved_problem'):
            prompt.improved_problem = decision.get('improved_problem', getattr(prompt, 'improved_problem', ''))
        if hasattr(prompt, 'improved_context'):
            prompt.improved_context = decision.get('improved_context', current_context)
        
        prompt.execution_scope = decision.get('execution_scope', prompt.execution_scope)
        prompt.additional_context = current_context
        prompt.status = 'enabled' if decision.get('complete', False) else 'needs_refinement'
        
        # Update the actual prompt text if provided
        if decision.get('draft_prompt'):
            prompt.prompt = decision.get('draft_prompt_raw', decision.get('draft_prompt'))
        
        print(f"\n{Colors.GREEN}✅ CHANGES APPLIED SUCCESSFULLY{Colors.RESET}")
        print(f"📝 Prompt [{prompt.id}] has been updated with strategist recommendations")
        print(f"📊 Status: {'enabled' if decision.get('complete', False) else 'needs_refinement'}")
        
        # Save changes
        self._save_prompt_changes(all_prompts, f"Prompt [{prompt.id}] successfully re-evaluated and updated!")
    
    def change_execution_scope(self, prompt, all_prompts, prompt_index):
        """Change execution scope between single and per-unit."""
        print(f"\n🔄 Change Execution Scope for [{prompt.id}]")
        print("=" * 60)
        
        current_scope = prompt.execution_scope
        new_scope = 'per-unit' if current_scope == 'single' else 'single'
        
        print(f"Current scope: {current_scope}")
        print(f"New scope: {new_scope}")
        
        print(f"\n📝 Scope Change Impact:")
        if new_scope == 'per-unit':
            print("• Prompt will be executed for each unit individually")
            print("• Allows unit-specific customizations and fixes")
            print("• Takes longer but more targeted")
        else:
            print("• Prompt will be executed once for the entire project")
            print("• Faster execution, global changes")
            print("• Better for project-wide modifications")
        
        confirm = input(f"\nChange scope from '{current_scope}' to '{new_scope}'? (y/N): ").strip().lower()
        if confirm not in ['y', 'yes']:
            print("🚫 Scope change cancelled.")
            return
        
        # Apply change and set to draft mode (requires re-evaluation)
        prompt.execution_scope = new_scope
        prompt.status = 'draft'  # Set to draft since scope change may affect prompt content
        
        # Save changes
        self._save_prompt_changes(all_prompts, f"Execution scope changed to '{new_scope}' and status set to 'draft'!\n📝 Recommendation: Re-evaluate with Solution Strategist to optimize prompt for new scope.")
    
    def show_full_prompt_details(self, prompt):
        """Show complete details of a prompt."""
        print(f"\n👀 Full Details for [{prompt.id}]")
        print("=" * 60)
        
        print(f"ID: {prompt.id}")
        print(f"Short Name: {getattr(prompt, 'short_name', 'Not set')}")
        print(f"Short Description: {getattr(prompt, 'short_description', 'Not set')}")
        print(f"Status: {prompt.status}")
        print(f"Agent: {prompt.agent_name} ({prompt.model})")
        if hasattr(prompt, 'fallback_model') and prompt.fallback_model:
            print(f"Fallback Model: {prompt.fallback_model}")
        print(f"Execution Scope: {prompt.execution_scope}")
        print(f"Framework: {prompt.framework}")
        print(f"Created: {prompt.created}")
        
        print(f"\nUser Problem:")
        wrapped_user_problem = textwrap.fill(getattr(prompt, 'user_problem', 'Not set'), width=100, initial_indent="  ", subsequent_indent="  ")
        print(wrapped_user_problem)
        
        if hasattr(prompt, 'additional_context') and prompt.additional_context:
            print(f"\nAdditional Context:")
            wrapped_additional_context = textwrap.fill(prompt.additional_context, width=100, initial_indent="  ", subsequent_indent="  ")
            print(wrapped_additional_context)
        
        if hasattr(prompt, 'improved_problem') and prompt.improved_problem:
            print(f"\nImproved Problem (by Strategist):")
            wrapped_improved_problem = textwrap.fill(prompt.improved_problem, width=100, initial_indent="  ", subsequent_indent="  ")
            print(wrapped_improved_problem)
        
        print(f"\nPrompt Content:")
        print("-" * 40)
        # Wrap the prompt text for better readability
        wrapped_prompt = textwrap.fill(prompt.prompt, width=100, initial_indent="", subsequent_indent="")
        print(wrapped_prompt)
        print("-" * 40)
        
        input("\nPress Enter to continue...")
    
    def _save_prompt_changes(self, all_prompts, success_message):
        """Save changes to prompts with error handling."""
        try:
            # Convert prompts to dictionaries for saving
            prompts_data = []
            for p in all_prompts:
                if hasattr(p, 'to_dict'):
                    prompts_data.append(p.to_dict())
                else:
                    prompts_data.append(p.__dict__)
            
            save_yaml_multiline({'prompts': prompts_data}, 
                               file_path=self.prompts_file, max_line_width=DEFAULT_YAML_LINE_WIDTH)
            print(f"\n✅ {success_message}")
        except Exception as e:
            print(f"\n❌ Error saving changes: {e}")

def main():
    """Entry point with comprehensive logging."""
    # Initialize audit logger and display log locations
    audit_logger = AuditLogger()
    print("🤖 AI Prompt Manager - Comprehensive Logging System")
    print("=" * 60)
    audit_logger.display_log_locations()
    print("=" * 60)
    
    try:
        router = PromptManagerCLI()
        router.run()
        
        # Display final log summary
        print("\n🎯 Prompt Manager Session Complete")
        print("=" * 40)
        locations = audit_logger.get_current_log_locations()
        print(f"📋 All execution logs: {locations['logs_base_dir']}")
        print(f"🔍 Session details: {locations['main_audit_log']}")
        
    except KeyboardInterrupt:
        print("\n⏹️  Session interrupted by user")
        locations = audit_logger.get_current_log_locations()
        print(f"📋 Logs preserved at: {locations['logs_base_dir']}")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        locations = audit_logger.get_current_log_locations()
        print(f"🚨 Error details in: {locations['error_logs_dir']}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")

if __name__ == "__main__":
    main()