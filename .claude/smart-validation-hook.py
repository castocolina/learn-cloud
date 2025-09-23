#!/usr/bin/env python3
"""
Claude Code Smart Hook: SvelteKit Project Validation
Runs validation for SvelteKit project files including TypeScript, Svelte, and JSON content.
"""

import os
import sys
import json
import subprocess
from pathlib import Path

def should_validate_file(file_path):
    """Check if file should be validated based on SvelteKit project structure"""
    return (
        file_path.endswith('.svelte') or 
        file_path.endswith('.ts') or 
        file_path.endswith('.js') or
        file_path.endswith('.json') or
        file_path.endswith('.md') or
        file_path.endswith('.sh') or
        file_path.endswith('.py')
    )

def run_validation(file_path, project_dir):
    """Run validation for specific file based on SvelteKit architecture"""
    try:
        # Change to project directory
        os.chdir(project_dir)
        
        # Determine appropriate validation command
        if file_path.endswith(('.svelte', '.ts', '.js')):
            cmd = ['make', 'check']  # SvelteKit check for TypeScript and Svelte files
            action = "SvelteKit TypeScript/Svelte validation"
        elif file_path.endswith('.json'):
            cmd = ['make', 'validate-content']  # JSON content validation
            action = "JSON content validation"
        elif file_path.endswith('.sh'):
            cmd = ['make', 'validate-bash']  # Bash script validation
            action = "Bash script validation"
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
        
        print(f"🔍 SvelteKit smart validation: {message}")
        
        # Always exit successfully to not block operations
        sys.exit(0)
        
    except Exception as e:
        print(f"⚠️ SvelteKit smart validation hook error: {e} (non-blocking)")
        sys.exit(0)  # Don't block the operation even on error

if __name__ == '__main__':
    main()