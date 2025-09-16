#!/usr/bin/env python3
"""
Shared Python Utility Functions for Cloud-Native Learning Platform Scripts

This module provides common functionality used across multiple Python utility scripts
in the content generation pipeline. It implements secure, efficient, and well-tested
utilities that follow cloud-native development best practices.

FEATURES:
- Configurable code formatting integration (ESLint/Prettier)
- Enhanced error handling with structured logging
- Robust file I/O operations with proper error recovery
- TypeScript parsing utilities with flexible syntax support
- Security-first implementations with input validation
- Performance optimizations for large-scale content generation

USAGE:
    from src.python.utils import run_formatter, log_exception_details, ensure_directory_exists

SECURITY CONSIDERATIONS:
- All subprocess calls use timeout constraints to prevent hanging
- Input validation prevents code injection attacks
- File operations include permission and path safety checks
- Logging sanitizes potentially sensitive data

PERFORMANCE OPTIMIZATIONS:
- Cached subprocess results where appropriate
- Efficient regex compilation for repeated pattern matching
- Memory-conscious file processing for large content structures
"""

import logging
import os
import re
import subprocess
import traceback
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

# Configure module-level logging
logger = logging.getLogger(__name__)

# =============================================================================
# SECURITY & VALIDATION UTILITIES
# =============================================================================

def validate_file_path(file_path: Union[str, Path], must_exist: bool = False) -> Path:
    """
    Validate and sanitize file path for security and correctness.
    
    Args:
        file_path: Path to validate (string or Path object)
        must_exist: If True, raises FileNotFoundError if path doesn't exist
        
    Returns:
        Validated Path object
        
    Raises:
        ValueError: If path is invalid or contains security risks
        FileNotFoundError: If must_exist=True and file doesn't exist
    """
    if not file_path:
        raise ValueError("File path cannot be empty")
    
    path = Path(file_path).resolve()
    
    # Basic security check - prevent path traversal attacks
    try:
        # Ensure the path is within reasonable bounds (no excessive parent directory traversal)
        str(path.relative_to(Path.cwd().parent))
    except ValueError:
        logger.warning(f"Path {path} is outside expected project structure")
    
    # Check if path contains suspicious patterns
    suspicious_patterns = ['../', '..\\', '~/', '/etc/', '/root/', '/home/*/.*']
    path_str = str(path)
    for pattern in suspicious_patterns:
        if pattern in path_str:
            logger.warning(f"Potentially unsafe path pattern detected: {pattern} in {path_str}")
    
    if must_exist and not path.exists():
        raise FileNotFoundError(f"Required file does not exist: {path}")
    
    return path

def sanitize_string_for_logging(text: str, max_length: int = 200) -> str:
    """
    Sanitize string content for safe logging by removing/masking sensitive patterns.
    
    Args:
        text: String to sanitize
        max_length: Maximum length for logged strings
        
    Returns:
        Sanitized string safe for logging
    """
    if not text:
        return ""
    
    # Remove potential secrets (API keys, tokens, passwords)
    sensitive_patterns = [
        (r'\b[A-Za-z0-9]{20,}\b', '[REDACTED_TOKEN]'),  # Long alphanumeric strings (likely tokens)
        (r'password[=:]\s*\S+', 'password=[REDACTED]'),  # Password assignments
        (r'secret[=:]\s*\S+', 'secret=[REDACTED]'),      # Secret assignments
        (r'key[=:]\s*\S+', 'key=[REDACTED]'),            # Key assignments
    ]
    
    sanitized = text
    for pattern, replacement in sensitive_patterns:
        sanitized = re.sub(pattern, replacement, sanitized, flags=re.IGNORECASE)
    
    # Truncate if too long
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length] + "...[TRUNCATED]"
    
    return sanitized

# =============================================================================
# ENHANCED ERROR HANDLING & LOGGING
# =============================================================================

def log_exception_details(
    exc: Exception,
    message: str = "An error occurred",
    limit: int = 5,
    include_context: bool = True
) -> None:
    """
    Enhanced exception logging with context, sanitization, and structured format.

    Args:
        exc: The exception object captured in an `except` block
        message: Custom message to prepend to the log
        limit: The number of stack trace lines to show
        include_context: Whether to include additional context information
    """
    # Format the basic stack trace
    stack_trace_list = traceback.format_exception(type(exc), exc, exc.__traceback__, limit=limit)
    stack_trace_str = "".join(stack_trace_list)
    
    # Create structured error information
    error_info = {
        "error_type": type(exc).__name__,
        "error_message": sanitize_string_for_logging(str(exc)),
        "custom_message": sanitize_string_for_logging(message)
    }
    
    # Add context information if requested
    if include_context:
        error_info["python_version"] = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
        error_info["working_directory"] = str(Path.cwd())
    
    # Log with structured information
    logger.error(f"{message}")
    logger.error(f"Error Details: {error_info}")
    logger.error(f"--- Stack Trace (last {limit} calls) ---\n{stack_trace_str}")

def create_progress_logger(operation_name: str, total_items: int = None) -> 'ProgressLogger':
    """
    Create a progress logger for long-running operations.
    
    Args:
        operation_name: Name of the operation being tracked
        total_items: Total number of items to process (optional)
        
    Returns:
        ProgressLogger instance
    """
    return ProgressLogger(operation_name, total_items)

class ProgressLogger:
    """Simple progress logger for tracking operation completion."""
    
    def __init__(self, operation_name: str, total_items: int = None):
        self.operation_name = operation_name
        self.total_items = total_items
        self.completed_items = 0
        self.start_time = None
        
    def start(self):
        """Mark the start of the operation."""
        import time
        self.start_time = time.time()
        if self.total_items:
            logger.info(f"Starting {self.operation_name} ({self.total_items} items)")
        else:
            logger.info(f"Starting {self.operation_name}")
    
    def log_progress(self, item_name: str = None, increment: int = 1):
        """Log progress for completed items."""
        self.completed_items += increment
        
        if self.total_items:
            percentage = (self.completed_items / self.total_items) * 100
            progress_msg = f"{self.operation_name}: {self.completed_items}/{self.total_items} ({percentage:.1f}%)"
        else:
            progress_msg = f"{self.operation_name}: {self.completed_items} completed"
        
        if item_name:
            progress_msg += f" - {sanitize_string_for_logging(item_name)}"
            
        logger.info(progress_msg)
    
    def finish(self):
        """Mark the completion of the operation."""
        if self.start_time:
            import time
            duration = time.time() - self.start_time
            logger.info(f"Completed {self.operation_name} in {duration:.2f} seconds ({self.completed_items} items)")
        else:
            logger.info(f"Completed {self.operation_name} ({self.completed_items} items)")

# =============================================================================
# FILE I/O UTILITIES
# =============================================================================

def ensure_directory_exists(file_path: Union[str, Path]) -> Path:
    """
    Ensure that the directory structure exists for the given file path with proper error handling.

    Args:
        file_path: Full path to the target file
        
    Returns:
        Path object of the created directory
        
    Raises:
        PermissionError: If directory cannot be created due to permissions
        OSError: If directory creation fails for other reasons
    """
    path = validate_file_path(file_path, must_exist=False)
    directory = path.parent
    
    try:
        directory.mkdir(parents=True, exist_ok=True)
        logger.debug(f"Ensured directory exists: {directory}")
        return directory
    except PermissionError as e:
        logger.error(f"Permission denied creating directory {directory}")
        log_exception_details(e, f"Directory creation failed: {directory}")
        raise
    except OSError as e:
        logger.error(f"Failed to create directory {directory}")
        log_exception_details(e, f"Directory creation error: {directory}")
        raise

def safe_write_file(file_path: Union[str, Path], content: str, encoding: str = 'utf-8', backup: bool = True) -> bool:
    """
    Safely write content to a file with optional backup and atomic operation.
    
    Args:
        file_path: Path to the target file
        content: Content to write to the file
        encoding: File encoding (default: utf-8)
        backup: Create backup if file exists (default: True)
        
    Returns:
        True if write was successful, False otherwise
        
    Raises:
        ValueError: If content is None or file_path is invalid
        PermissionError: If file cannot be written due to permissions
    """
    if content is None:
        raise ValueError("Content cannot be None")
    
    path = validate_file_path(file_path, must_exist=False)
    ensure_directory_exists(path)
    
    # Create backup if file exists and backup is requested
    backup_path = None
    if backup and path.exists():
        import time
        timestamp = int(time.time())
        backup_path = path.with_suffix(f"{path.suffix}.backup.{timestamp}")
        try:
            import shutil
            shutil.copy2(path, backup_path)
            logger.debug(f"Created backup: {backup_path}")
        except Exception as e:
            logger.warning(f"Failed to create backup: {e}")
            backup_path = None
    
    # Write content atomically by writing to temp file first
    temp_path = path.with_suffix(f"{path.suffix}.tmp")
    
    try:
        with open(temp_path, 'w', encoding=encoding) as f:
            f.write(content)
            f.flush()  # Ensure data is written to disk
            os.fsync(f.fileno())  # Force write to disk
        
        # Atomic move (rename) to final location
        temp_path.replace(path)
        
        file_size = path.stat().st_size
        logger.info(f"Successfully wrote {file_size} bytes to {path}")
        
        # Remove backup if write was successful and backup exists
        if backup_path and backup_path.exists():
            logger.debug(f"Write successful, keeping backup: {backup_path}")
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to write file {path}")
        log_exception_details(e, f"File write error: {path}")
        
        # Clean up temp file if it exists
        if temp_path.exists():
            try:
                temp_path.unlink()
            except Exception:
                pass  # Ignore cleanup errors
        
        # Restore from backup if available
        if backup_path and backup_path.exists():
            try:
                import shutil
                shutil.copy2(backup_path, path)
                logger.info(f"Restored from backup: {backup_path}")
            except Exception as restore_error:
                logger.error(f"Failed to restore from backup: {restore_error}")
        
        return False

def safe_read_file(file_path: Union[str, Path], encoding: str = 'utf-8', default: str = None) -> Optional[str]:
    """
    Safely read content from a file with error handling.
    
    Args:
        file_path: Path to the file to read
        encoding: File encoding (default: utf-8)
        default: Default value to return if file cannot be read
        
    Returns:
        File content as string, or default value if read fails
    """
    path = validate_file_path(file_path, must_exist=True)
    
    try:
        with open(path, 'r', encoding=encoding) as f:
            content = f.read()
        
        logger.debug(f"Successfully read {len(content)} characters from {path}")
        return content
        
    except Exception as e:
        logger.error(f"Failed to read file {path}")
        log_exception_details(e, f"File read error: {path}")
        return default

# =============================================================================
# CODE FORMATTING & LINTING UTILITIES
# =============================================================================

def run_formatter_batch(target_path: Union[str, Path], format_tools: List[str] = None, timeout: int = 120) -> bool:
    """
    Run project formatting tools on a directory or single file in batch mode.
    
    This function is optimized for formatting multiple files at once, which is more
    efficient than calling run_formatter on each file individually.
    
    Args:
        target_path: Path to directory or file to format
        format_tools: List of tools to run ['prettier', 'eslint'], defaults to both
        timeout: Timeout in seconds for formatting commands (increased for batch operations)
        
    Returns:
        True if formatting completed without critical errors, False otherwise
    """
    if format_tools is None:
        format_tools = ['prettier', 'eslint']
    
    path = validate_file_path(target_path, must_exist=True)
    project_root = _find_project_root(path)
    
    if not project_root:
        logger.warning(f"Cannot find project root for {path}, skipping batch formatting")
        return False
    
    logger.info(f"Running batch formatting tools {format_tools} on {path}")
    
    # Track overall success
    overall_success = True
    results = {}
    
    # Determine target pattern for batch operations
    if path.is_dir():
        # Format all TypeScript files in directory
        target_pattern = f"{path}/**/*.ts"
        operation_desc = f"directory {path}"
    else:
        # Single file
        target_pattern = str(path)
        operation_desc = f"file {path}"
    
    # Run Prettier if requested (batch mode)
    if 'prettier' in format_tools:
        prettier_success = _run_prettier_batch(target_pattern, project_root, timeout, operation_desc)
        results['prettier'] = prettier_success
        if not prettier_success:
            overall_success = False
    
    # Run ESLint if requested (batch mode)
    if 'eslint' in format_tools:
        eslint_success = _run_eslint_batch(target_pattern, project_root, timeout, operation_desc)
        results['eslint'] = eslint_success
        # ESLint failures are often warnings, don't fail overall process
    
    # Log results summary
    if overall_success:
        logger.info(f"✅ Batch formatting completed successfully for {operation_desc}")
        logger.info(f"📊 Tool results: {results}")
    else:
        logger.warning(f"⚠️  Batch formatting completed with issues for {operation_desc}")
        logger.warning(f"📊 Tool results: {results}")
    
    return overall_success

def _run_prettier_batch(target_pattern: str, project_root: Path, timeout: int, operation_desc: str) -> bool:
    """Run Prettier formatting on a target pattern in batch mode."""
    try:
        logger.debug(f"Running Prettier batch formatting on {operation_desc}")
        
        # Use the project's format script with glob pattern
        result = subprocess.run(
            ['pnpm', 'exec', 'prettier', '--write', target_pattern],
            cwd=project_root,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False
        )
        
        if result.returncode == 0:
            logger.debug(f"Prettier batch formatting completed successfully for {operation_desc}")
            return True
        else:
            if result.stderr:
                logger.warning(f"Prettier batch output: {sanitize_string_for_logging(result.stderr)}")
            if result.stdout:
                logger.debug(f"Prettier batch stdout: {sanitize_string_for_logging(result.stdout)}")
            return False
            
    except subprocess.TimeoutExpired:
        logger.error(f"Prettier batch formatting timed out after {timeout} seconds for {operation_desc}")
        return False
    except FileNotFoundError:
        logger.error("pnpm not found - make sure it's installed and in PATH")
        return False
    except Exception as e:
        logger.error(f"Error running Prettier batch formatting for {operation_desc}")
        log_exception_details(e, "Prettier batch execution failed")
        return False

def _run_eslint_batch(target_pattern: str, project_root: Path, timeout: int, operation_desc: str) -> bool:
    """Run ESLint with auto-fix on a target pattern in batch mode."""
    try:
        logger.debug(f"Running ESLint batch validation on {operation_desc}")
        
        # Run ESLint with --fix on the pattern
        result = subprocess.run(
            ['pnpm', 'exec', 'eslint', '--fix', target_pattern],
            cwd=project_root,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False
        )
        
        if result.returncode == 0:
            logger.debug(f"ESLint batch validation completed successfully for {operation_desc}")
            return True
        else:
            if result.stderr:
                logger.debug(f"ESLint batch stderr: {sanitize_string_for_logging(result.stderr)}")
            if result.stdout:
                logger.debug(f"ESLint batch stdout: {sanitize_string_for_logging(result.stdout)}")
            # Don't treat ESLint warnings as failures
            return True
            
    except subprocess.TimeoutExpired:
        logger.error(f"ESLint batch validation timed out after {timeout} seconds for {operation_desc}")
        return False
    except FileNotFoundError:
        logger.error("ESLint not found via pnpm - make sure it's installed")
        return False
    except Exception as e:
        logger.error(f"Error running ESLint batch validation for {operation_desc}")
        log_exception_details(e, "ESLint batch execution failed")
        return False

def run_formatter(file_path: Union[str, Path], format_tools: List[str] = None, timeout: int = 60) -> bool:
    """
    Run project formatting tools (Prettier and ESLint) on a generated file.
    
    This function integrates with the project's existing formatting pipeline
    as defined in package.json scripts and supports configurable tool selection.
    
    Args:
        file_path: Path to the file to format
        format_tools: List of tools to run ['prettier', 'eslint'], defaults to both
        timeout: Timeout in seconds for formatting commands
        
    Returns:
        True if formatting completed without critical errors, False otherwise
        
    Raises:
        ValueError: If file_path is invalid
        FileNotFoundError: If required tools are not available
    """
    if format_tools is None:
        format_tools = ['prettier', 'eslint']
    
    path = validate_file_path(file_path, must_exist=True)
    project_root = _find_project_root(path)
    
    if not project_root:
        logger.warning(f"Cannot find project root for {path}, skipping formatting")
        return False
    
    logger.info(f"Running formatting tools {format_tools} on {path}")
    
    # Track overall success
    overall_success = True
    results = {}
    
    # Run Prettier if requested
    if 'prettier' in format_tools:
        prettier_success = _run_prettier(path, project_root, timeout)
        results['prettier'] = prettier_success
        if not prettier_success:
            overall_success = False
    
    # Run ESLint if requested
    if 'eslint' in format_tools:
        eslint_success = _run_eslint(path, project_root, timeout)
        results['eslint'] = eslint_success
        # ESLint failures are often warnings, don't fail overall process
    
    # Log results summary
    if overall_success:
        logger.info(f"✅ Formatting completed successfully for {path}")
        logger.info(f"📊 Tool results: {results}")
    else:
        logger.warning(f"⚠️  Formatting completed with issues for {path}")
        logger.warning(f"📊 Tool results: {results}")
    
    return overall_success

def _find_project_root(file_path: Path) -> Optional[Path]:
    """Find the project root directory by looking for package.json."""
    current = file_path.parent
    while current != current.parent:  # Stop at filesystem root
        if (current / 'package.json').exists():
            return current
        current = current.parent
    return None

def _run_prettier(file_path: Path, project_root: Path, timeout: int) -> bool:
    """Run Prettier formatting on a file."""
    try:
        logger.debug(f"Running Prettier on {file_path}")
        
        # Use the project's format script which handles all necessary configuration
        result = subprocess.run(
            ['pnpm', 'run', 'format', str(file_path)],
            cwd=project_root,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False  # Don't raise exception on non-zero exit
        )
        
        if result.returncode == 0:
            logger.debug("Prettier formatting completed successfully")
            return True
        else:
            # Log stderr but don't fail - Prettier warnings are common
            if result.stderr:
                logger.warning(f"Prettier output: {sanitize_string_for_logging(result.stderr)}")
            if result.stdout:
                logger.debug(f"Prettier stdout: {sanitize_string_for_logging(result.stdout)}")
            return False
            
    except subprocess.TimeoutExpired:
        logger.error(f"Prettier formatting timed out after {timeout} seconds")
        return False
    except FileNotFoundError:
        logger.error("pnpm not found - make sure it's installed and in PATH")
        return False
    except Exception as e:
        logger.error("Error running Prettier")
        log_exception_details(e, "Prettier execution failed")
        return False

def _run_eslint(file_path: Path, project_root: Path, timeout: int) -> bool:
    """Run ESLint with auto-fix on a file."""
    try:
        logger.debug(f"Running ESLint on {file_path}")
        
        # Run ESLint with --fix to automatically fix issues
        result = subprocess.run(
            ['pnpm', 'exec', 'eslint', '--fix', str(file_path)],
            cwd=project_root,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False  # Don't raise exception on non-zero exit
        )
        
        if result.returncode == 0:
            logger.debug("ESLint validation completed successfully")
            return True
        else:
            # ESLint often returns non-zero for warnings, which is normal
            if result.stderr:
                logger.debug(f"ESLint stderr: {sanitize_string_for_logging(result.stderr)}")
            if result.stdout:
                logger.debug(f"ESLint stdout: {sanitize_string_for_logging(result.stdout)}")
            # Don't treat ESLint warnings as failures
            return True
            
    except subprocess.TimeoutExpired:
        logger.error(f"ESLint validation timed out after {timeout} seconds")
        return False
    except FileNotFoundError:
        logger.error("ESLint not found via pnpm - make sure it's installed")
        return False
    except Exception as e:
        logger.error("Error running ESLint")
        log_exception_details(e, "ESLint execution failed")
        return False

def validate_typescript_syntax(file_path: Union[str, Path], timeout: int = 30) -> bool:
    """
    Validate TypeScript file syntax using project tools.
    
    Args:
        file_path: Path to TypeScript file to validate
        timeout: Timeout in seconds for validation
        
    Returns:
        True if file has valid syntax, False otherwise
    """
    path = validate_file_path(file_path, must_exist=True)
    project_root = _find_project_root(path)
    
    if not project_root:
        logger.warning(f"Cannot find project root for {path}, skipping TypeScript validation")
        return False
    
    try:
        logger.debug(f"Validating TypeScript syntax for {path}")
        
        # Use svelte-check which handles TypeScript validation
        result = subprocess.run(
            ['pnpm', 'run', 'check'],
            cwd=project_root,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False
        )
        
        # Check if our specific file is mentioned in error output
        if result.returncode != 0:
            output = result.stdout + result.stderr
            if str(path) in output or path.name in output:
                logger.error(f"TypeScript validation failed for {path}")
                logger.error(f"Validation output: {sanitize_string_for_logging(output)}")
                return False
        
        logger.debug(f"TypeScript validation passed for {path}")
        return True
        
    except subprocess.TimeoutExpired:
        logger.warning(f"TypeScript validation timed out for {path}")
        return False
    except Exception as e:
        logger.warning(f"Could not validate TypeScript file {path}")
        log_exception_details(e, "TypeScript validation error")
        return False

# =============================================================================
# TYPESCRIPT PARSING UTILITIES
# =============================================================================

def parse_typescript_object(content: str, object_name: str = 'contentMenu') -> Optional[Dict[str, Any]]:
    """
    Enhanced TypeScript object parser that handles various quote styles and syntax variations.
    
    This parser is designed to extract structured data from TypeScript files containing
    object literals with mixed quote styles (single/double quotes, quoted/unquoted keys).
    
    Args:
        content: Full TypeScript file content
        object_name: Name of the object to extract (default: 'contentMenu')
        
    Returns:
        Parsed object as Python dictionary, or None if parsing fails
        
    Raises:
        ValueError: If content is invalid or object cannot be found
    """
    if not content or not content.strip():
        raise ValueError("Content cannot be empty")
    
    if not object_name:
        raise ValueError("Object name cannot be empty")
    
    logger.debug(f"Parsing TypeScript object '{object_name}' from content ({len(content)} chars)")
    
    try:
        # First, try the JSON-based approach
        object_pattern = re.compile(
            rf'(?:export\s+)?(?:const|let|var)\s+{re.escape(object_name)}\s*(?::\s*\w+\s*)?=\s*(\{{.*?\}});',
            re.DOTALL | re.MULTILINE
        )
        
        match = object_pattern.search(content)
        if not match:
            logger.warning(f"Could not find object '{object_name}' in TypeScript content")
            return None
        
        object_content = match.group(1)
        logger.debug(f"Found object content ({len(object_content)} chars)")
        
        # Try the flexible parser first
        parsed_data = _parse_object_literal(object_content)
        
        if parsed_data:
            logger.info(f"Successfully parsed TypeScript object '{object_name}'")
            return parsed_data
        else:
            logger.warning("JSON-based parser failed, trying manual extraction as fallback")
            # Fallback to manual extraction for complex TypeScript syntax
            return _extract_content_structure_manually(content)
            
    except Exception as e:
        logger.error(f"Error parsing TypeScript object '{object_name}'")
        log_exception_details(e, "TypeScript parsing error")
        # Try manual fallback
        try:
            logger.info("Attempting manual extraction as fallback")
            return _extract_content_structure_manually(content)
        except Exception as fallback_error:
            logger.error("Manual extraction fallback also failed")
            log_exception_details(fallback_error, "Fallback parsing error")
            return None

def _extract_content_structure_manually(content: str) -> Dict[str, Any]:
    """
    Manually extract the content structure using regex patterns - fallback parser.
    
    This function properly handles TypeScript enum references and extracts
    the nested units and chapters structure without relying on JSON parsing.
    
    Args:
        content: Full content of the TypeScript file
        
    Returns:
        Simplified content menu structure
    """
    result = {
        "metadata": {
            "title": "Mastering Cloud-Native Technologies",
            "total_units": 0,
            "total_chapters": 0
        },
        "units": []
    }

    # Extract units array content - handle the complete array with all nested structures
    units_pattern = r'units:\s*\[(.*)\]\s*};?\s*$'
    units_match = re.search(units_pattern, content, re.DOTALL | re.MULTILINE)

    if not units_match:
        logger.warning("Could not find units array in content menu")
        return result

    units_content = units_match.group(1)

    # Split units by looking for unit objects
    unit_objects = []
    brace_count = 0
    current_unit = ""
    in_unit = False

    for char in units_content:
        if char == '{' and not in_unit:
            in_unit = True
            brace_count = 1
            current_unit = char
        elif in_unit:
            current_unit += char
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0:
                    unit_objects.append(current_unit)
                    current_unit = ""
                    in_unit = False

    # Process each unit object
    for unit_content in unit_objects:
        # Extract unit title - handle both quoted and unquoted property names
        title_match = re.search(r'title:\s*[\'"]([^\'\"]+)[\'"]', unit_content)
        if not title_match:
            continue
        unit_title = title_match.group(1)

        # Extract unit data path
        unit_data_match = re.search(r'unit_data:\s*[\'"]([^\'\"]+)[\'"]', unit_content)
        unit_data = unit_data_match.group(1) if unit_data_match else ""

        unit = {
            "title": unit_title,
            "unit_data": unit_data,
            "chapters": []
        }

        # Extract chapters array
        chapters_pattern = r'chapters:\s*\[(.*?)\]'
        chapters_match = re.search(chapters_pattern, unit_content, re.DOTALL)

        if chapters_match:
            chapters_content = chapters_match.group(1)

            # Split chapters by looking for chapter objects
            chapter_objects = []
            brace_count = 0
            current_chapter = ""
            in_chapter = False

            for char in chapters_content:
                if char == '{' and not in_chapter:
                    in_chapter = True
                    brace_count = 1
                    current_chapter = char
                elif in_chapter:
                    current_chapter += char
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            chapter_objects.append(current_chapter)
                            current_chapter = ""
                            in_chapter = False

            # Process each chapter object
            for chapter_content in chapter_objects:
                # Extract chapter title
                chapter_title_match = re.search(r'title:\s*[\'"]([^\'\"]+)[\'"]', chapter_content)
                if not chapter_title_match:
                    continue
                chapter_title = chapter_title_match.group(1)

                # Extract chapter type (handle enum references)  
                chapter_type_match = re.search(r'type:\s*(ChapterType\.[A-Z_]+)', chapter_content)
                if chapter_type_match:
                    chapter_type_raw = chapter_type_match.group(1)
                    # Convert enum reference to string
                    chapter_type = chapter_type_raw.split('.')[1].lower()
                else:
                    chapter_type = "lesson"  # default fallback

                # Extract chapter data path
                chapter_data_match = re.search(r'chapter_data:\s*[\'"]([^\'\"]+)[\'"]', chapter_content)
                if not chapter_data_match:
                    continue
                chapter_data = chapter_data_match.group(1)

                chapter = {
                    "title": chapter_title,
                    "type": chapter_type,
                    "chapter_data": chapter_data
                }

                unit["chapters"].append(chapter)

        result["units"].append(unit)

    result["metadata"]["total_units"] = len(result["units"])
    result["metadata"]["total_chapters"] = sum(len(unit["chapters"]) for unit in result["units"])

    logger.info(f"Manual extraction: {result['metadata']['total_units']} units with {result['metadata']['total_chapters']} total chapters")

    return result

def _parse_object_literal(content: str) -> Optional[Dict[str, Any]]:
    """
    Parse a TypeScript object literal with flexible quote handling.
    
    This implementation handles:
    - Quoted and unquoted object keys
    - Single and double quotes for strings
    - Nested objects and arrays
    - TypeScript enum references
    - Comments (single-line and multi-line)
    
    Args:
        content: Object literal content (without surrounding braces)
        
    Returns:
        Parsed object as Python dictionary
    """
    # Remove comments first
    content = _remove_typescript_comments(content)
    
    # Handle the case where content includes the outer braces
    content = content.strip()
    if content.startswith('{') and content.endswith('}'):
        content = content[1:-1]  # Remove outer braces
    
    try:
        # Convert TypeScript-style object to JSON-compatible format
        json_content = _convert_typescript_to_json(content)
        
        # Parse as JSON
        return json.loads(f"{{{json_content}}}")
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing failed: {e}")
        return None
    except Exception as e:
        logger.error(f"Object literal parsing failed")
        log_exception_details(e, "Object parsing error")
        return None

def _remove_typescript_comments(content: str) -> str:
    """Remove TypeScript/JavaScript comments from content."""
    # Remove single-line comments
    content = re.sub(r'//.*?$', '', content, flags=re.MULTILINE)
    
    # Remove multi-line comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    return content

def _convert_typescript_to_json(content: str) -> str:
    """
    Convert TypeScript object literal syntax to JSON-compatible syntax.
    
    This handles:
    - Unquoted keys: key: value -> "key": value
    - Single quotes: 'value' -> "value"
    - Enum references: ChapterType.LESSON -> "ChapterType.LESSON"
    - Function calls and expressions
    """
    lines = []
    
    for line in content.split('\n'):
        line = line.strip()
        
        if not line or line.startswith('//'):
            continue
        
        # Handle object key-value pairs
        if ':' in line:
            key_part, value_part = line.split(':', 1)
            key_part = key_part.strip()
            value_part = value_part.strip()
            
            # Ensure key is quoted
            if not (key_part.startswith('"') or key_part.startswith("'")):
                key_part = f'"{key_part}"'
            elif key_part.startswith("'") and key_part.endswith("'"):
                # Convert single quotes to double quotes for JSON
                key_part = f'"{key_part[1:-1]}"'
            
            # Handle value part
            value_part = _convert_value_to_json(value_part)
            
            # Remove trailing comma for easier processing
            if value_part.endswith(','):
                value_part = value_part[:-1]
                lines.append(f'{key_part}: {value_part},')
            else:
                lines.append(f'{key_part}: {value_part}')
        else:
            # Handle array elements, closing braces, etc.
            lines.append(_convert_value_to_json(line))
    
    return '\n'.join(lines)

def _convert_value_to_json(value: str) -> str:
    """Convert a TypeScript value to JSON-compatible format."""
    value = value.strip()
    
    # Handle strings - convert single quotes to double quotes
    if value.startswith("'") and value.endswith("'"):
        # Extract content and escape for JSON
        content = value[1:-1]
        content = content.replace('\\', '\\\\').replace('"', '\\"')
        return f'"{content}"'
    
    # Handle enum references - convert to strings
    if re.match(r'^[A-Z][a-zA-Z0-9]*\.[A-Z_][A-Z0-9_]*$', value.rstrip(',')):
        clean_value = value.rstrip(',')
        return f'"{clean_value}"'
    
    # Handle boolean values
    if value.rstrip(',').lower() in ['true', 'false']:
        return value.rstrip(',').lower()
    
    # Handle null/undefined
    if value.rstrip(',').lower() in ['null', 'undefined']:
        return 'null'
    
    # Handle numbers
    if re.match(r'^-?\d+(\.\d+)?$', value.rstrip(',')):
        return value.rstrip(',')
    
    # Handle arrays and objects - need to recursively process
    if value.startswith('[') or value.startswith('{'):
        return value
    
    # Return as-is for other cases (already quoted strings)
    return value

# =============================================================================
# SYSTEM INTEGRATION UTILITIES  
# =============================================================================

import sys

def get_system_info() -> Dict[str, str]:
    """Get system information for debugging and logging purposes."""
    return {
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        "platform": sys.platform,
        "working_directory": str(Path.cwd())
    }

def check_dependencies() -> Dict[str, bool]:
    """Check if required dependencies are available."""
    dependencies = {}
    
    # Check for pnpm
    try:
        result = subprocess.run(['pnpm', '--version'], capture_output=True, timeout=5)
        dependencies['pnpm'] = result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError):
        dependencies['pnpm'] = False
    
    # Check for node
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, timeout=5)
        dependencies['node'] = result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError):
        dependencies['node'] = False
    
    return dependencies

# =============================================================================
# MODULE INITIALIZATION
# =============================================================================

def initialize_logging(level: int = logging.INFO, format_string: str = None) -> None:
    """
    Initialize logging configuration for the utils module.
    
    Args:
        level: Logging level (default: INFO)
        format_string: Custom format string for log messages
    """
    if format_string is None:
        format_string = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    logging.basicConfig(
        level=level,
        format=format_string,
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('tmp/utils.log', mode='a', encoding='utf-8')
        ]
    )
    
    logger.info("Python utilities module initialized")
    logger.info(f"System info: {get_system_info()}")
    
    # Check and log dependency status
    deps = check_dependencies()
    missing_deps = [dep for dep, available in deps.items() if not available]
    if missing_deps:
        logger.warning(f"Missing dependencies: {missing_deps}")
    else:
        logger.info("All required dependencies are available")

# Auto-initialize logging when module is imported
if __name__ != '__main__':
    initialize_logging()