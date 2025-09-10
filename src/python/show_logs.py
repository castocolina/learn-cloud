#!/usr/bin/env python3
"""
Show Current Log Locations Utility
==================================

Simple utility to display current log file locations for the AI Prompt system.
Can be used independently to check where logs are being stored.
"""

import sys
from pathlib import Path

# Add src/python to path for local imports
sys.path.insert(0, str(Path(__file__).parent))

from prompt_utils.audit_logger import AuditLogger


def main():
    """Display current log locations."""
    print("🔍 AI Prompt System - Current Log Locations")
    print("=" * 50)
    
    try:
        # Initialize audit logger (this will create directories if needed)
        audit_logger = AuditLogger()
        
        # Display all log locations
        audit_logger.display_log_locations()
        
        print("\n💡 Usage Tips:")
        print("   📋 Execution logs contain detailed per-prompt execution data")
        print("   🚨 Error logs contain failed executions with debugging info")
        print("   🔍 Audit logs contain session-level tracking and summaries")
        print("   📁 All logs are organized by date and session for easy browsing")
        
        # Check if there are any existing logs
        locations = audit_logger.get_current_log_locations()
        execution_logs_dir = Path(locations['execution_logs_dir'])
        error_logs_dir = Path(locations['error_logs_dir'])
        
        if execution_logs_dir.exists():
            execution_logs = list(execution_logs_dir.glob('*.json'))
            print(f"\n📈 Current session has {len(execution_logs)} execution log(s)")
        
        if error_logs_dir.exists():
            error_logs = list(error_logs_dir.glob('ERROR_*.json'))
            if error_logs:
                print(f"🚨 Found {len(error_logs)} error log(s) - check for issues")
        
        print("\n✅ Log location display complete")
        
    except Exception as e:
        print(f"❌ Error displaying log locations: {e}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())