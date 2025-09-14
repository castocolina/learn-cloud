#!/usr/bin/env python3
"""
Content Menu Generator from CONTENT.md

This script parses CONTENT.md (Markdown format) and generates a structured content-menu.ts file
that serves as a single source of truth for the book's navigation structure.

BOOK STRUCTURE:
===============
# Libro: Mastering Cloud-Native Technologies
* **Unidad** (Unit): Major learning section
    * **Capítulo** (Chapter): Learning topic within unit  
        * **Lección** (Lesson): Main theoretical content
        * **Guía de estudio** (Study Guide): Key points and summaries
        * **Quiz** (Quiz): Self-assessment questions
    * **Examen** (Exam): Final unit evaluation
    * **Proyecto** (Project): Practical implementation

CONTENT TYPES & URL PATTERNS:
=============================
- lesson:      book/unitX/chapter_Y_Z_slug.html
- study_guide: book/unitX/study_guide_Y_Z.html  
- quiz:        book/unitX/quiz_Y_Z.html
- exam:        book/unitX/exam_Y_Z_slug.html
- project:     book/unitX/chapter_Y_Z_slug.html
- unit:        book/unitX/unit_slug.html

Where:
- X = unit number (1, 2, 3...)
- Y_Z = chapter number (1_1, 1_2, 2_3...)
- slug = URL-friendly title conversion

The generated objects includes:
- Units with titles, icons, and links
- Chapters with titles, icons, and links organized by type
- Hierarchical structure parsed from the Markdown outline
- Consistent URL patterns for all content types

Usage:
    python3 src/python/generate_content_menu.py
    make generate-content-md
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple
import logging
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

output_file_name = "content-menu.ts"

def log_exception_details(
    exc: Exception, 
    message: str = "An error occurred", 
    limit: int = 5
):
    """
    Logs a custom error message along with the last N lines 
    of an exception's stack trace.

    Args:
        exc (Exception): The exception object captured in an `except` block.
        message (str, optional): Custom message to prepend to the log. Defaults to "An error occurred".
        limit (int, optional): The number of stack trace lines to show. Defaults to 5.
    """
    # `traceback.format_exception` creates a list of formatted strings
    # from the exception object. The 'limit' parameter controls the depth.
    # This function is ideal because it operates directly on the exception object.
    stack_trace_list = traceback.format_exception(type(exc), exc, exc.__traceback__, limit=limit)
    
    # We join the list into a single string for a cleaner log.
    stack_trace_str = "".join(stack_trace_list)
    
    logger.error(f"{message}\n--- Stack Trace (last {limit} calls) ---\n{stack_trace_str}")

class MarkdownContentGenerator:
    """Generates content-menu.ts from CONTENT.md with comprehensive parsing and validation."""
    
    def __init__(self):
        self.project_root = Path(__file__).parent.parent.parent
        self.content_md_path = self.project_root / "CONTENT.md"
        self.output_path = self.project_root / "src" / "data" / output_file_name
        
        # Simplified icon mapping - using standard Lucide icons
        self.content_icons = {
            # Content types
            'lesson': 'BookOpen',
            'study_guide': 'BookOpen', 
            'quiz': 'HelpCircle',
            'exam': 'Target',
            'project': 'Rocket',
            'unit': 'BookOpen',
            
            # Special unit icons based on keywords
            'python': 'Box',        # Python units (was PythonIcon)
            'go': 'Cpu',           # Go units (was GoIcon)
            'devops': 'Settings',   # DevOps/Infrastructure
            'secrets': 'Lock',      # Security/Secrets
            'security': 'ShieldCheck',  # Security
            'automation': 'Bot',    # Automation
            'serverless': 'Zap',   # Serverless/AWS
            'integration': 'Shield', # Systems Integration
            'capstone': 'GraduationCap', # Capstone projects
            
            # Chapter-specific icons
            'environment': 'Settings',
            'tooling': 'Settings', 
            'overview': 'BookOpen',
            'foundational': 'BookOpen',
            'concepts': 'BookOpen',
            'quality': 'CheckCircle',
            'standards': 'CheckCircle',
            'testing': 'TestTube',
            'observability': 'BarChart3',
            'monitoring': 'BarChart3',
            'api': 'Globe',
            'restful': 'Globe',
            'concurrency': 'Zap',
            'caching': 'Zap',
            'database': 'Database',
            'backend': 'Database',
            'advanced': 'Target'
        }

        # Pattern for extracting icon metadata from markdown lines
        self.icon_pattern = re.compile(r'\[icon:\s*(\w+)\s*\]')

    def extract_metadata_from_markdown(self, content: str) -> Dict[str, str]:
        """Extract title and description from the markdown content."""
        lines = content.split('\n')
        
        # Default values
        title = "Mastering Cloud-Native Technologies"
        description = "Comprehensive guide to cloud-native development"
        
        # Look for the main title (first # heading)
        title_found = False
        description_lines = []
        
        for line in lines:
            line = line.strip()
            
            # Extract title from first # heading
            if line.startswith('# ') and not title_found:
                raw_title = line[2:].strip()
                if ':' in raw_title:
                    title = raw_title.split(':', 1)[1].strip()
                else:
                    title = raw_title
                title_found = True
                continue
            
            # Stop collecting description when we hit the first separator
            if line.startswith('---'):
                break
                
            # Collect description lines (after title, before separator)
            if title_found and line:
                description_lines.append(line)
        
        # Join description lines and clean up
        if description_lines:
            description = ' '.join(description_lines).strip()
        
        return {
            'title': title,
            'description': description
        }

    def read_content_md(self) -> str:
        """Read and validate the CONTENT.md file."""
        try:
            if not self.content_md_path.exists():
                raise FileNotFoundError(f"CONTENT.md not found at {self.content_md_path}")
            
            with open(self.content_md_path, 'r', encoding='utf-8') as file:
                content = file.read()
                
            if not content.strip():
                raise ValueError("CONTENT.md is empty")
                
            logger.info(f"Successfully read CONTENT.md ({len(content)} characters)")
            return content
            
        except Exception as e:
            logger.error(f"Error reading CONTENT.md: {e}")
            log_exception_details(e, "Failed to read CONTENT.md")
            raise

    def extract_icon_from_line(self, line: str) -> Tuple[str, str]:
        """Extract icon metadata from a markdown line and return cleaned line + icon name."""
        match = self.icon_pattern.search(line)
        if match:
            icon_name = match.group(1)
            # Remove the icon metadata from the line
            cleaned_line = self.icon_pattern.sub('', line).strip()
            return cleaned_line, icon_name

        return line, None

    def generate_content_paths(self, content_type: str, unit_num: str, number: str, title: str) -> Tuple[str, str]:
        """Generate consistent paths for content using unified template approach."""
        slug = self._generate_slug(title) if title else ""

        # Path configuration by content type
        path_config = {
            'unit': {
                'name_template': '0_unit_{slug}',
                'data_extension': '.ts'
            },
            'default': {
                'name_template': '{number}_{content_type}_{slug}' if slug else '{number}_{content_type}',
                'data_extension': '.ts'
            }
        }

        # Select configuration
        config = path_config.get(content_type, path_config['default'])

        # Generate file name
        if content_type == 'unit':
            file_name = config['name_template'].format(slug=slug)
        else:
            template = config['name_template']
            file_name = template.format(content_type=content_type, number=number, slug=slug)

        # Generate full paths
        html_path = f"book/unit/{unit_num}/{file_name}.html"
        data_path = f"book/unit{unit_num}/{file_name}{config['data_extension']}"

        return html_path, data_path

    def get_icon_for_content(self, content_type: str, title: str = "") -> str:
        """Get appropriate icon for content based on type and title keywords."""
        
        # Direct content type mapping
        if content_type in self.content_icons:
            return self.content_icons[content_type]
        
        # For units and chapters, check title keywords
        title_lower = title.lower()
        for keyword, icon in self.content_icons.items():
            if keyword in title_lower:
                return icon
        
        # Default fallbacks
        fallbacks = {
            'unit': 'BookOpen',
            'lesson': 'BookOpen', 
            'chapter': 'BookOpen',
            'study_guide': 'BookOpen',
            'quiz': 'HelpCircle',
            'exam': 'Target',
            'project': 'Rocket'
        }
        
        return fallbacks.get(content_type, 'BookOpen')

    def determine_content_type_and_data(self, line: str) -> Tuple[str, str, str, str, str]:
        """
        Determine content type and extract data from markdown line using unified pattern approach.

        Returns:
            Tuple of (content_type, chapter_num, unit_num, title, icon_name)
        """
        # Content type configuration with pattern and title generation logic
        content_patterns = [
            {
                'type': 'study_guide',
                'pattern': r'^-\s+\*\*(\d+\.\d+):\s*Study Guide\*\*(?:\s*\[icon:.*?\])?',
                'title_format': lambda match, _: f"{match.group(1)}: Study Guide"
            },
            {
                'type': 'quiz',
                'pattern': r'^-\s+\*\*(\d+\.\d+):\s*Quiz\*\*(?:\s*\[icon:.*?\])?',
                'title_format': lambda match, _: f"{match.group(1)}: Quiz"
            },
            {
                'type': 'exam',
                'pattern': r'^-\s+\*\*(\d+\.\d+):\s*Unit \d+ Final Exam\*\*(?:\s*\[icon:.*?\])?',
                'title_format': lambda match, _: f"{match.group(1)}: Unit {match.group(1).split('.')[0]} Final Exam"
            },
            {
                'type': 'project',
                'pattern': r'^-\s+\*\*(\d+\.\d+):\s*Project\s+(\d+):\s*(.+?)\*\*(?:\s*\[icon:.*?\])?$',
                'title_format': lambda match, _: f"{match.group(1)}: Project {match.group(2)} - {match.group(3).strip()}"
            },
            {
                'type': 'lesson',
                'pattern': r'^-\s+\*\*(\d+\.\d+):\s*(?!(?:Study Guide|Quiz|Unit \d+ Final Exam))(.+?)\*\*(?:\s*\[icon:.*?\])?$',
                'title_format': lambda match, cleaned_match: self._extract_lesson_title(match, cleaned_match)
            }
        ]

        # Extract icon if present
        cleaned_line, extracted_icon = self.extract_icon_from_line(line)

        # Try each pattern until we find a match
        for config in content_patterns:
            pattern = re.compile(config['pattern'])
            match = pattern.match(line)
            if match:
                chapter_num = match.group(1)
                unit_num = chapter_num.split('.')[0]

                # Handle lesson title extraction with cleaned line for icons
                if config['type'] == 'lesson' and extracted_icon:
                    cleaned_match = pattern.match(cleaned_line)
                    title = config['title_format'](match, cleaned_match)
                else:
                    title = config['title_format'](match, None)

                return config['type'], chapter_num, unit_num, title, extracted_icon

        return None, None, None, None, None

    def _extract_lesson_title(self, match, cleaned_match):
        """Helper method to extract lesson title with proper cleanup."""
        if cleaned_match:
            chapter_title = cleaned_match.group(2).strip()
        else:
            chapter_title = match.group(2).strip()

        chapter_title = chapter_title.rstrip('.')
        return f"{match.group(1)}: {chapter_title}"

    def create_chapter_object(self, content_type: str, chapter_num: str, unit_num: str, title: str, extracted_icon: str) -> Dict[str, Any]:
        """Create a chapter object with consistent structure and enum type reference."""
        chapter_id = chapter_num.replace('.', '_')

        # Extract title for slug generation based on content type
        slug_title = self._extract_title_for_slug(content_type, title, unit_num)

        # Generate paths
        chapter_link_path, chapter_data_path = self.generate_content_paths(content_type, unit_num, chapter_id, slug_title)

        # Determine icon
        chapter_icon = extracted_icon or self.get_icon_for_content(content_type, title)

        # Map content_type to ChapterType enum reference
        chapter_type_enum = self._chapter_type_enum(content_type)

        return {
            'title': title,
            'icon': chapter_icon,
            'type': chapter_type_enum,  # Directly set as enum reference string
            'chapter_link': chapter_link_path,
            'chapter_data': chapter_data_path
        }

    def _chapter_type_enum(self, content_type: str) -> str:
        """Map content_type string to ChapterType enum reference for TypeScript output."""
        # Map Python type to TS enum member
        mapping = {
            'lesson': 'LESSON',
            'study_guide': 'STUDY_GUIDE',
            'quiz': 'QUIZ',
            'exam': 'EXAM',
            'project': 'PROJECT',
            'unit': 'UNIT',
        }
        return f"ChapterType.{mapping.get(content_type, content_type.upper())}"

    def _extract_title_for_slug(self, content_type: str, title: str, unit_num: str) -> str:
        """Extract appropriate title for slug generation based on content type."""
        if content_type == 'project':
            return title.split(' - ', 1)[1] if ' - ' in title else title
        elif content_type == 'lesson':
            return title.split(': ', 1)[1] if ': ' in title else title
        elif content_type == 'exam':
            return f"unit_{unit_num}_final_exam"
        else:
            # study_guide, quiz - no slug needed
            return ""
    def parse_markdown_structure(self, content: str) -> List[Dict[str, Any]]:
        """
        Parse the Markdown content and extract the hierarchical structure.
        Simplified approach: determine content type first, then create objects consistently.
        """
        units = []
        lines = content.split('\n')
        current_unit = None
        
        # Unit pattern
        unit_pattern = re.compile(r'^## Unit (\d+):\s*(.+?)(?:\s*\[icon:.*?\])?$')
        
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            
            # Skip empty lines and non-relevant content
            if not line or (line.startswith('#') and not line.startswith('## Unit')):
                continue
            
            # Parse Unit headers
            unit_match = unit_pattern.match(line)
            if unit_match:
                # Save previous unit
                if current_unit:
                    units.append(current_unit)

                unit_num = unit_match.group(1)
                unit_title_raw = unit_match.group(2).strip()

                # Extract icon from unit line
                cleaned_line, extracted_icon = self.extract_icon_from_line(line)
                if extracted_icon:
                    cleaned_match = unit_pattern.match(cleaned_line)
                    unit_title = cleaned_match.group(2).strip() if cleaned_match else unit_title_raw
                else:
                    unit_title = unit_title_raw

                # Create unit object
                full_unit_title = f"Unit {unit_num}: {unit_title}"
                unit_icon = extracted_icon if extracted_icon else self.get_icon_for_content('unit', unit_title)
                unit_link_path, unit_data_path = self.generate_content_paths('unit', unit_num, unit_num, unit_title)

                current_unit = {
                    'title': full_unit_title,
                    'icon': unit_icon,
                    'unit_link': unit_link_path,
                    'unit_data': unit_data_path,
                    'chapters': []
                }
                logger.info(f"Parsed unit {unit_num}: {unit_title} with icon: {unit_icon}")
                continue
            
            # Parse chapter content using simplified approach
            if current_unit and line.startswith('-'):
                content_type, chapter_num, unit_num, title, extracted_icon = self.determine_content_type_and_data(line)
                
                if content_type:  # Valid content found
                    chapter_obj = self.create_chapter_object(content_type, chapter_num, unit_num, title, extracted_icon)
                    current_unit['chapters'].append(chapter_obj)
                    logger.debug(f"Added {content_type}: {title}")

        # Add the last unit
        if current_unit:
            units.append(current_unit)
        
        logger.info(f"Parsed {len(units)} units with {sum(len(u['chapters']) for u in units)} total chapters")
        return units



    def validate_parsed_structure(self, units: List[Dict[str, Any]]) -> bool:
        """Validate the parsed structure for completeness and consistency."""
        issues = []
        
        if not units:
            issues.append("No units found in parsed structure")
            return False
        
        for unit_idx, unit in enumerate(units):
            unit_title = unit.get('title', f'Unit {unit_idx + 1}')
            
            # Check required unit fields (updated for _link suffix)
            required_fields = ['title', 'icon', 'unit_link']
            for field in required_fields:
                if not unit.get(field):
                    issues.append(f"Unit '{unit_title}' missing {field}")
            
            # Check chapters
            chapters = unit.get('chapters', [])
            if not chapters:
                issues.append(f"Unit '{unit_title}' has no chapters")
                continue
            
            # Validate each chapter
            for chapter_idx, chapter in enumerate(chapters):
                chapter_title = chapter.get('title', f'Chapter {chapter_idx + 1}')
                
                # Check required chapter fields
                if not chapter.get('title'):
                    issues.append(f"Chapter {chapter_idx} in unit '{unit_title}' missing title")
                if not chapter.get('icon'):
                    issues.append(f"Chapter '{chapter_title}' missing icon")
                if not chapter.get('chapter_link'):
                    issues.append(f"Chapter '{chapter_title}' missing chapter_link file")
                if not chapter.get('type'):
                    issues.append(f"Chapter '{chapter_title}' missing type field")
        
        if issues:
            logger.warning(f"Validation issues: {'; '.join(issues[:3])}{'...' if len(issues) > 3 else ''}")
            return False
        
        total_chapters = sum(len(unit.get('chapters', [])) for unit in units)
        logger.info(f"Structure validation passed: {len(units)} units, {total_chapters} chapters")
        return True

    def _generate_slug(self, title: str) -> str:
        """Generate a URL-friendly slug from title by replacing non-alphanumeric characters with underscores."""
        # Convert to lowercase and replace all non-alphanumeric characters with underscores
        slug = re.sub(r'[^\w]+', '_', title.lower())
        # Remove leading/trailing underscores
        return slug.strip('_')

    def generate_typescript_module(self, units: List[Dict[str, Any]], metadata: Dict[str, str]) -> str:
        """Generate TypeScript module content from parsed units and metadata, with enum references."""
        content_structure = {
            'metadata': {
                'generated_by': 'generate_content_menu.py',
                'source': 'CONTENT.md',
                'version': '1.0.0',
                'title': metadata['title'],
                'description': metadata['description'],
                'total_units': len(units),
                'total_chapters': sum(len(unit['chapters']) for unit in units)
            },
            'units': units
        }

        # Dump JSON, then replace quoted enum references with raw enum (e.g., "ChapterType.LESSON" -> ChapterType.LESSON)
        json_content = json.dumps(content_structure, indent=2, ensure_ascii=False)
        import re as _re
        json_content = _re.sub(r'"(ChapterType\.[A-Z_]+)"', r'\1', json_content)

        # Create TypeScript module with proper import and export
        typescript_content = f"""import type {{ ContentMenu }} from './types.js';
import {{ ChapterType }} from './types.js';

export const contentMenu: ContentMenu = {json_content};
"""

        return typescript_content

    def ensure_output_directory(self):
        """Ensure the output directory exists."""
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        logger.info(f"Ensured output directory exists: {self.output_path.parent}")

    def write_typescript_file(self, typescript_content: str):
        """Write the TypeScript module content to the output file."""
        try:
            with open(self.output_path, 'w', encoding='utf-8') as file:
                file.write(typescript_content)
            
            file_size = os.path.getsize(self.output_path)
            logger.info(f"Successfully wrote {output_file_name} to {self.output_path}")
            logger.info(f"File size: {file_size} bytes")
            
        except Exception as e:
            log_exception_details(e, "Error writing TypeScript file")
            log_exception_details(e, "Failed to write content-menu.ts")
            raise

    def generate(self) -> bool:
        """Main generation process."""
        try:
            logger.info(f"Starting {output_file_name} generation from CONTENT.md")
            
            # Read and parse Markdown content
            markdown_content = self.read_content_md()
            
            # Extract metadata from markdown content
            metadata = self.extract_metadata_from_markdown(markdown_content)
            logger.info(f"Extracted metadata - Title: '{metadata['title']}'")
            
            # Parse structure from markdown
            units = self.parse_markdown_structure(markdown_content)
            
            # Validate parsed structure
            if not self.validate_parsed_structure(units):
                logger.error("Parsed structure validation failed")
                # Still proceed to generate TypeScript for inspection
                logger.info("Proceeding despite validation failure for debugging")
            
            # Generate TypeScript module with dynamic metadata
            typescript_content = self.generate_typescript_module(units, metadata)
            
            # Ensure output directory and write file
            self.ensure_output_directory()
            self.write_typescript_file(typescript_content)
            
            logger.info("Content-menu.ts generation completed successfully")
            
            # Summary
            total_chapters = sum(len(unit['chapters']) for unit in units)
            print(f"✅ Generated {output_file_name} from CONTENT.md successfully!")
            print(f"📊 Structure: {len(units)} units, {total_chapters} chapters")
            print(f"🔗 Generated consistent URL patterns and data paths")
            print(f"🎯 TypeScript module with type safety")
            
            return True
            
        except Exception as e:
            logger.error(f"Generation failed: {e}")
            log_exception_details(e, "Generation process encountered an error")
            return False

def main():
    """Main entry point."""
    generator = MarkdownContentGenerator()
    success = generator.generate()
    
    if success:
        print(f"📍 Output: {generator.output_path}")
    else:
        print(f"❌ Failed to generate {output_file_name} from CONTENT.md")
        sys.exit(1)

if __name__ == "__main__":
    main()