#!/usr/bin/env python3
"""
Remove Duplicate Flashcard Modals Script

This script removes duplicate <dialog id="flashcard-modal"> elements from study aids files.
The centralized modal in index.html will handle all flashcard expansions.

Usage:
    python3 src/python/remove_duplicate_modals.py
"""

import os
import re
from pathlib import Path


def remove_modal_from_content(content):
    """Remove the entire flashcard modal section from content."""
    
    # Pattern to match the entire modal block including comments
    modal_pattern = r'<!-- Flashcard Modal -->.*?</dialog>'
    
    # Remove the modal block
    updated_content = re.sub(modal_pattern, '', content, flags=re.DOTALL)
    
    # Clean up any extra blank lines that might be left
    updated_content = re.sub(r'\n\s*\n\s*\n', '\n\n', updated_content)
    
    return updated_content


def process_study_aids_files():
    """Process all study aids files to remove duplicate modals."""
    
    # Find all study aids files
    study_aids_files = list(Path('src/book').glob('**/*_study_aids.html'))
    
    print(f"🔍 Found {len(study_aids_files)} study aids files")
    print("=" * 60)
    
    processed_files = 0
    changed_files = 0
    
    for file_path in sorted(study_aids_files):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                original_content = f.read()
            
            # Check if file contains a modal
            if '<dialog id="flashcard-modal"' not in original_content:
                print(f"⏭️  Skipping {file_path} (no modal found)")
                processed_files += 1
                continue
            
            updated_content = remove_modal_from_content(original_content)
            
            # Only write if content changed
            if updated_content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(updated_content)
                print(f"✅ Removed modal from: {file_path}")
                changed_files += 1
            else:
                print(f"✅ No changes needed: {file_path}")
            
            processed_files += 1
            
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
    
    print("=" * 60)
    print(f"📊 Processing Summary:")
    print(f"   • Files processed: {processed_files}")
    print(f"   • Modals removed: {changed_files}")
    print(f"   • Files unchanged: {processed_files - changed_files}")
    
    if changed_files > 0:
        print(f"\n✅ Successfully removed {changed_files} duplicate modal(s)")
        print("💡 All flashcard modals now use the centralized modal in index.html")
    else:
        print(f"\n✅ All files processed (no modals to remove)")


def main():
    print("🗑️  Removing duplicate flashcard modals from study aids files...")
    print("🎯 Target: All *_study_aids.html files with <dialog id=\"flashcard-modal\">")
    print()
    
    # Change to project root directory
    if not os.path.exists('src/book'):
        print("❌ Error: Must run from project root directory")
        print("💡 Expected structure: src/book/ directory should exist")
        return 1
    
    process_study_aids_files()
    return 0


if __name__ == "__main__":
    exit(main())