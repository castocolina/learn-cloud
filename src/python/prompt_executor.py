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
import logging

def main():
    """Main entry point for the prompt executor."""
    # Setup logging and directories
    ensure_directories()
    logger = setup_logging(console_level=logging.WARNING)
    print(f"INFO: Detailed logs available at tmp/logs/prompt_executor.log")
    
    try:
        # Initialize components
        config_manager = ConfigManager()
        state_manager = StateManager()
        
        # Initialize and run enhanced TUI
        tui = EnhancedPromptExecutorTUI(
            config_manager=config_manager,
            state_manager=state_manager
        )
        
        return asyncio.run(tui.run())
        
    except KeyboardInterrupt:
        logger.info("Operation cancelled by user.")
        return 0
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())