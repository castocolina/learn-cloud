#!/usr/bin/env python3
"""
AI Prompt Executor - Unified Script for Claude and Gemini Agent Management

This script provides a TUI interface for executing AI agent prompts with 
intelligent limit management and state persistence.
"""

import sys
import asyncio
from pathlib import Path
from typing import Optional

# Add src/python to path for local imports
sys.path.insert(0, str(Path(__file__).parent))

from prompt_utils.config_manager import ConfigManager
from prompt_utils.enhanced_tui import EnhancedPromptExecutorTUI
from prompt_utils.state_manager import StateManager
from prompt_utils.utils import setup_logging, ensure_directories
from prompt_utils.audit_logger import AuditLogger
import logging

def main():
    """Main entry point for the prompt executor."""
    # Setup logging and directories
    ensure_directories()
    logger = setup_logging(console_level=logging.WARNING)
    
    # Initialize audit logger and display log locations
    audit_logger = AuditLogger()
    print("🔍 AI Prompt Executor - Comprehensive Logging System")
    print("=" * 60)
    audit_logger.display_log_locations()
    print("=" * 60)
    
    try:
        # Initialize components
        config_manager = ConfigManager()
        state_manager = StateManager()
        
        # Initialize and run enhanced TUI
        tui = EnhancedPromptExecutorTUI(
            config_manager=config_manager,
            state_manager=state_manager
        )
        
        result = asyncio.run(tui.run())
        
        # Display final log summary
        print("\n🎯 Session Complete")
        print("=" * 40)
        locations = audit_logger.get_current_log_locations()
        print(f"📋 All execution logs: {locations['logs_base_dir']}")
        print(f"🔍 Session details: {locations['main_audit_log']}")
        
        return result
        
    except KeyboardInterrupt:
        logger.info("Operation cancelled by user.")
        print("\n⏹️  Session interrupted by user")
        locations = audit_logger.get_current_log_locations()
        print(f"📋 Logs preserved at: {locations['logs_base_dir']}")
        return 0
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        print(f"\n💥 Unexpected error: {e}")
        locations = audit_logger.get_current_log_locations()
        print(f"🚨 Error details in: {locations['error_logs_dir']}")
        import traceback
        logger.debug(f"Stack trace:\n{traceback.format_exc()}")
        return 1

if __name__ == "__main__":
    sys.exit(main())