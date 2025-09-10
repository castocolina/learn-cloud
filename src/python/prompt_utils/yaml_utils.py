"""
Shared YAML Utilities

Common YAML reading and writing functionality with multiline support.
Shared between prompt_manager.py and prompt utilities.
"""

import yaml
from typing import Any, Dict, IO
import re
import textwrap

# Configuration constants
DEFAULT_LINE_WIDTH = 80  # Default maximum column width for YAML text formatting

class SharedMultilineDumper(yaml.SafeDumper):
    """Custom YAML dumper for multiline formatting shared across systems."""
    
    def represent_str(self, data: str) -> yaml.ScalarNode:
        """Custom string representation with user-friendly multiline formatting."""
        # Check if the string contains newlines or is very long
        has_newlines = '\n' in data
        is_long = len(data) > 60
        
        if has_newlines or is_long:
            # Use folded style (>) for text that can be reflowed
            if has_newlines and self._should_use_folded_style(data):
                return self.represent_scalar('tag:yaml.org,2002:str', data, style='>')
            # Use literal style (|) for code/structured text with newlines
            elif has_newlines:
                return self.represent_scalar('tag:yaml.org,2002:str', data, style='|')
            # Use folded style for long single-line text (no newlines)
            elif is_long:
                return self.represent_scalar('tag:yaml.org,2002:str', data, style='>')
        
        # Use default style for short strings
        return self.represent_scalar('tag:yaml.org,2002:str', data)
    
    def _should_use_folded_style(self, data: str) -> bool:
        """Determine if folded style (>) should be used instead of literal (|)."""
        lines = data.split('\n')
        
        # Use folded for paragraph-like text, literal for structured content
        
        # If there are many empty lines (paragraph breaks), consider using literal to preserve structure
        empty_line_count = sum(1 for line in lines if line.strip() == '')
        if empty_line_count > 2:
            return False  # Use literal style to preserve paragraph structure
            
        # If lines don't start with special characters, use folded
        special_chars = r'^[\s]*[-*+\d\.]'
        if not any(re.match(special_chars, line) for line in lines):
            return True
            
        # If it looks like code (indentation), use literal
        if any(line.startswith('    ') or line.startswith('\t') for line in lines):
            return False
            
        return True

# Register the custom representer
SharedMultilineDumper.add_representer(str, SharedMultilineDumper.represent_str)

def preprocess_text_for_yaml(text: str, max_line_width: int = DEFAULT_LINE_WIDTH) -> str:
    """
    Preprocess text before saving to YAML to ensure proper formatting.
    
    This function is critical for preventing unwanted blank lines in YAML folded style output.
    It converts text with embedded newlines and paragraph breaks into flowing text that
    YAML can format cleanly without creating visual blank lines.
    
    - Converts \\n indicators to actual line breaks
    - Joins paragraphs separated by double newlines into flowing text
    - Eliminates single newlines within paragraphs that would break YAML flow
    - Creates clean text optimized for YAML folded style (>) formatting
    
    Args:
        text: Input text that may contain \\n indicators and paragraph breaks
        max_line_width: Maximum width for line wrapping (passed to YAML, not used here)
        
    Returns:
        Cleaned and formatted text optimized for YAML folded style (>) without blank lines
    """
    if not isinstance(text, str):
        return text
    
    # Step 1: Convert literal \n to actual newlines
    text = text.replace('\\n', '\n')
    
    # Step 2: For YAML folded style optimization, join paragraphs into flowing text
    # This eliminates double newlines that cause issues in YAML folded style output
    sentences = []
    paragraphs = text.split('\n\n')
    
    for paragraph in paragraphs:
        if not paragraph.strip():
            continue
            
        # Clean and join lines within the paragraph
        lines = paragraph.split('\n')
        clean_lines = []
        
        for line in lines:
            line = line.strip()
            if line:
                clean_lines.append(line)
        
        if clean_lines:
            sentences.append(' '.join(clean_lines))
    
    # Join all sentences into a single flowing text
    # Let YAML handle the line wrapping based on the width parameter
    result = ' '.join(sentences)
    
    # Remove trailing whitespace
    result = result.rstrip()
    
    return result

def preprocess_data_for_yaml(data: Any, max_line_width: int = DEFAULT_LINE_WIDTH) -> Any:
    """
    Recursively preprocess data structure to clean text fields before YAML serialization.
    
    Args:
        data: Data structure (dict, list, or primitive)
        max_line_width: Maximum width for line wrapping (default: 120)
        
    Returns:
        Processed data structure with cleaned text fields
    """
    if isinstance(data, dict):
        return {key: preprocess_data_for_yaml(value, max_line_width) for key, value in data.items()}
    elif isinstance(data, list):
        return [preprocess_data_for_yaml(item, max_line_width) for item in data]
    elif isinstance(data, str):
        # Apply text preprocessing to string fields
        return preprocess_text_for_yaml(data, max_line_width)
    else:
        # Return other types (int, bool, etc.) unchanged
        return data

def load_yaml_safe(file_path: str) -> Dict[str, Any]:
    """
    Safely load YAML file with error handling.
    
    Args:
        file_path: Path to YAML file
        
    Returns:
        Loaded YAML data or empty dict if error
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return yaml.safe_load(file) or {}
    except (FileNotFoundError, yaml.YAMLError) as e:
        print(f"Warning: Could not load YAML file {file_path}: {e}")
        return {}

def save_yaml_multiline(data: Any, file_path: str = None, stream: IO = None, max_line_width: int = DEFAULT_LINE_WIDTH) -> str:
    """
    Save YAML data with user-friendly multiline formatting and text preprocessing.
    
    Args:
        data: Data to save as YAML
        file_path: Optional file path to save to
        stream: Optional stream to write to
        max_line_width: Maximum width for line wrapping (default: 120)
        
    Returns:
        YAML string if no file_path/stream provided
    """
    # Preprocess data to clean text fields (remove \n, wrap at max_line_width chars, limit blank lines)
    processed_data = preprocess_data_for_yaml(data, max_line_width)
    
    yaml_kwargs = {
        'Dumper': SharedMultilineDumper,
        'default_flow_style': False,
        'allow_unicode': True,
        'sort_keys': False,
        'width': max_line_width,
        'indent': 2
    }
    
    if file_path:
        with open(file_path, 'w', encoding='utf-8') as file:
            yaml.dump(processed_data, file, **yaml_kwargs)
        return None
    elif stream:
        yaml.dump(processed_data, stream, **yaml_kwargs)
        return None
    else:
        return yaml.dump(processed_data, **yaml_kwargs)

def format_yaml_content(yaml_string: str) -> str:
    """
    Reformat existing YAML string with better multiline formatting.
    
    Args:
        yaml_string: Input YAML string
        
    Returns:
        Reformatted YAML string
    """
    try:
        data = yaml.safe_load(yaml_string)
        return save_yaml_multiline(data)
    except yaml.YAMLError as e:
        raise ValueError(f"Invalid YAML content: {e}")

# Convenience functions for backward compatibility
def dump_yaml_multiline(data: Any, stream: IO = None) -> str:
    """Legacy function name for compatibility."""
    return save_yaml_multiline(data, stream=stream)