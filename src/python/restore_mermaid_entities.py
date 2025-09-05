#!/usr/bin/env python3
"""
Restore Mermaid HTML Entities Script

This script restores HTML entities in Mermaid diagrams within <script type="text/plain"> tags.
It handles both individual files and directories, following the principle that HTML entities
don't cause problems inside script tags and help maintain proper HTML structure.

Usage:
    python3 src/python/restore_mermaid_entities.py <file_or_directory>
    python3 src/python/restore_mermaid_entities.py src/book/unit9/
    python3 src/python/restore_mermaid_entities.py src/book/unit9/9-1_project_1.html
"""

import os
import sys
import re
import argparse
from pathlib import Path


def restore_mermaid_entities_in_content(content):
    """
    Decode HTML entities in Mermaid diagrams within script tags.
    This allows Mermaid to parse the diagrams correctly while maintaining valid HTML structure.
    """
    def replace_in_script(match):
        script_content = match.group(1)
        
        # Decode HTML entities to restore Mermaid syntax
        # Handle double-encoded entities first (&amp;quot; -> &quot; -> ")
        script_content = script_content.replace('&amp;quot;', '"')
        script_content = script_content.replace('&amp;gt;', '>')
        script_content = script_content.replace('&amp;lt;', '<')
        script_content = script_content.replace('&amp;#x27;', "'")
        script_content = script_content.replace('&amp;amp;', '&')
        
        # Then handle single-encoded entities (&quot; -> ")
        script_content = script_content.replace('&quot;', '"')
        script_content = script_content.replace('&gt;', '>')
        script_content = script_content.replace('&lt;', '<')
        script_content = script_content.replace('&#x27;', "'")
        script_content = script_content.replace('&amp;', '&')
        
        return f'<script type="text/plain">{script_content}</script>'
    
    # Pattern to match script tags within mermaid pre blocks
    pattern = r'<script type="text/plain">(.*?)</script>'
    
    return re.sub(pattern, replace_in_script, content, flags=re.DOTALL)


def process_file(file_path):
    """Process a single HTML file to restore Mermaid entities."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        # Check if file contains Mermaid diagrams
        if '<pre class="mermaid">' not in original_content:
            print(f"⏭️  Skipping {file_path} (no Mermaid diagrams found)")
            return False
        
        updated_content = restore_mermaid_entities_in_content(original_content)
        
        # Only write if content changed
        if updated_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            print(f"✅ Restored entities in: {file_path}")
            return True
        else:
            print(f"✅ No changes needed: {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False


def process_directory(directory_path):
    """Process all HTML files in a directory."""
    processed_files = 0
    changed_files = 0
    
    # Find all HTML files in directory
    html_files = list(Path(directory_path).glob('**/*.html'))
    
    if not html_files:
        print(f"⚠️  No HTML files found in: {directory_path}")
        return 0, 0
    
    print(f"🔍 Found {len(html_files)} HTML file(s) in {directory_path}")
    
    for html_file in sorted(html_files):
        processed_files += 1
        if process_file(html_file):
            changed_files += 1
    
    return processed_files, changed_files


def main():
    parser = argparse.ArgumentParser(
        description="Restore HTML entities in Mermaid diagrams within script tags",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 restore_mermaid_entities.py src/book/unit9/
  python3 restore_mermaid_entities.py src/book/unit9/9-1_project_1.html
  python3 restore_mermaid_entities.py --help
        """
    )
    
    parser.add_argument(
        'target',
        help='File or directory to process - decodes HTML entities in Mermaid diagrams'
    )
    
    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Enable verbose output'
    )
    
    args = parser.parse_args()
    
    target_path = Path(args.target)
    
    if not target_path.exists():
        print(f"❌ Target path does not exist: {args.target}")
        sys.exit(1)
    
    print(f"🔧 Restoring Mermaid HTML entities in: {args.target}")
    print("=" * 60)
    
    if target_path.is_file():
        if target_path.suffix.lower() == '.html':
            success = process_file(target_path)
            if success:
                print(f"\n✅ Successfully restored entities in 1 file")
            else:
                print(f"\n✅ File processed (no changes needed)")
        else:
            print(f"❌ File is not an HTML file: {args.target}")
            sys.exit(1)
    
    elif target_path.is_dir():
        processed, changed = process_directory(target_path)
        print("=" * 60)
        print(f"📊 Processing Summary:")
        print(f"   • Files processed: {processed}")
        print(f"   • Files changed: {changed}")
        print(f"   • Files unchanged: {processed - changed}")
        
        if changed > 0:
            print(f"\n✅ Successfully restored entities in {changed} file(s)")
        else:
            print(f"\n✅ All files processed (no changes needed)")
    
    else:
        print(f"❌ Target is neither a file nor directory: {args.target}")
        sys.exit(1)


if __name__ == "__main__":
    main()