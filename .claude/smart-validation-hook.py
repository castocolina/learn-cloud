#!/usr/bin/env python3
"""
Claude Code Smart Hook: File-Specific Validation
Runs validation only on the specific file that was edited/written.
"""

import os
import sys
import json
import subprocess
from pathlib import Path

def should_validate_file(file_path):
    """Check if file should be validated"""
    return (
        file_path.endswith('.html') or 
        file_path.endswith('.css') or 
        file_path.endswith('.js') or
        file_path.endswith('.md')
    )

def run_validation(file_path, project_dir):
    """Run validation for specific file"""
    try:
        # Change to project directory
        os.chdir(project_dir)
        
        # Determine appropriate validation command
        if file_path.endswith('.html'):
            cmd = ['make', 'fix-html', file_path]
            action = "HTML formatting and validation"
        elif file_path.endswith('.css'):
            cmd = ['make', 'validate-css', file_path]
            action = "CSS validation"
        elif file_path.endswith('.js'):
            cmd = ['make', 'validate-js', file_path]
            action = "JavaScript validation"
        else:
            return True, f"No validation needed for {file_path}"
        
        # Run the validation
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30  # Shorter timeout for single files
        )
        
        if result.returncode == 0:
            return True, f"✅ {action} completed for {file_path}"
        else:
            # Non-zero return code, but don't block the operation
            return True, f"⚠️ {action} completed with warnings for {file_path}"
            
    except subprocess.TimeoutExpired:
        return True, f"⚠️ Validation timeout for {file_path} (non-blocking)"
    except Exception as e:
        return True, f"⚠️ Validation error for {file_path}: {e} (non-blocking)"

def main():
    try:
        # Read input from stdin (Claude Code hook input)
        input_data = sys.stdin.read().strip()
        
        if not input_data:
            sys.exit(0)
            
        # Parse the hook input
        hook_data = json.loads(input_data)
        
        # Get file path from the hook data
        tool_name = hook_data.get('tool_name', '')
        tool_input = hook_data.get('tool_input', {})
        
        # Check if this is a Write or Edit operation
        if tool_name not in ['Write', 'Edit']:
            sys.exit(0)
            
        file_path = tool_input.get('file_path', '')
        
        if not file_path or not should_validate_file(file_path):
            sys.exit(0)
        
        # Get project directory
        project_dir = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())
        
        # Convert to relative path if possible for cleaner output
        try:
            rel_path = Path(file_path).relative_to(Path(project_dir))
            display_path = str(rel_path)
        except ValueError:
            display_path = file_path
        
        # Run validation for specific file
        success, message = run_validation(file_path, project_dir)
        
        print(f"🔍 Smart validation: {message}")
        
        # Always exit successfully to not block operations
        sys.exit(0)
        
    except Exception as e:
        print(f"⚠️ Smart validation hook error: {e} (non-blocking)")
        sys.exit(0)  # Don't block the operation even on error

if __name__ == '__main__':
    main()