#!/usr/bin/env python3
"""
Content JSON Generator from CONTENT.md

This script parses CONTENT.md (Markdown format) and generates a structured content.json file
that serves as a single source of truth for the book's navigation structure.

The generated JSON includes:
- Units with titles, icons, descriptions, and exam links
- Chapters with titles, icons, and links to lessons, quizzes, and study guides
- Hierarchical structure parsed from the Markdown outline

Usage:
    python3 src/python/generate_content_from_md.py
    make generate-content-md
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MarkdownContentGenerator:
    """Generates content.json from CONTENT.md with comprehensive parsing and validation."""
    
    def __init__(self):
        self.project_root = Path(__file__).parent.parent.parent
        self.content_md_path = self.project_root / "CONTENT.md"
        self.output_path = self.project_root / "src" / "data" / "content-menu.json"
        
        # Icon mapping for Lucide Svelte components - used as fallbacks
        self.unit_icons = {
            'python': 'PythonIcon',
            'go': 'GoIcon',
            'devops': 'Settings',
            'secrets': 'Lock',
            'devsecops': 'ShieldCheck',
            'automation': 'Bot',
            'serverless': 'Zap',
            'integration': 'Shield',
            'capstone': 'GraduationCap'
        }

        # Default Lucide Svelte icons for different content types
        self.default_icons = {
            'unit': 'BookOpen',
            'chapter': 'FileText',
            'study': 'BookOpen',
            'quiz': 'HelpCircle',
            'exam': 'Target',
            'project': 'Rocket'
        }

        # Pattern for extracting icon metadata from markdown lines
        self.icon_pattern = re.compile(r'\[icon:\s*(\w+)\s*\]')

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

    def format_web_path(self, src_path: str) -> str:
        """Convert src/ paths to web-root-relative paths (book/...)."""
        if src_path.startswith('src/'):
            return src_path[4:]  # Remove 'src/' prefix
        return src_path

    def get_fallback_icon(self, content_type: str, title: str) -> str:
        """Get fallback icon based on content type and title analysis."""
        title_lower = title.lower()

        if content_type == 'unit':
            if 'python' in title_lower:
                return self.unit_icons['python']
            elif 'go' in title_lower:
                return self.unit_icons['go']
            elif 'devops' in title_lower or 'ci/cd' in title_lower:
                return self.unit_icons['devops']
            elif 'secret' in title_lower or 'configuration' in title_lower:
                return self.unit_icons['secrets']
            elif 'devsecops' in title_lower or 'security' in title_lower:
                return self.unit_icons['devsecops']
            elif 'automation' in title_lower:
                return self.unit_icons['automation']
            elif 'serverless' in title_lower or 'aws' in title_lower:
                return self.unit_icons['serverless']
            elif 'integration' in title_lower or 'systems' in title_lower:
                return self.unit_icons['integration']
            elif 'capstone' in title_lower or 'project' in title_lower:
                return self.unit_icons['capstone']
            else:
                return self.default_icons['unit']

        elif content_type == 'chapter':
            if 'project' in title_lower:
                return self.default_icons['project']
            elif 'environment' in title_lower or 'setup' in title_lower or 'tooling' in title_lower:
                return 'Settings'
            elif 'overview' in title_lower or 'foundational' in title_lower or 'concepts' in title_lower:
                return 'BookOpen'
            elif 'quality' in title_lower or 'standards' in title_lower:
                return 'CheckCircle'
            elif 'testing' in title_lower:
                return 'TestTube'
            elif 'observability' in title_lower or 'monitoring' in title_lower:
                return 'BarChart3'
            elif 'api' in title_lower or 'restful' in title_lower:
                return 'Globe'
            elif 'concurrency' in title_lower or 'caching' in title_lower:
                return 'Zap'
            elif 'database' in title_lower or 'backend' in title_lower:
                return 'Database'
            elif 'advanced' in title_lower:
                return 'Target'
            else:
                return self.default_icons['chapter']

        elif content_type == 'study':
            return self.default_icons['study']
        elif content_type == 'quiz':
            return self.default_icons['quiz']
        elif content_type == 'exam':
            return self.default_icons['exam']
        else:
            return 'ChevronRight'

    def parse_markdown_structure(self, content: str) -> List[Dict[str, Any]]:
        """Parse the Markdown content and extract the hierarchical structure."""
        units = []
        lines = content.split('\n')
        current_unit = None
        current_chapter_base = None
        
        # Patterns for different content types - updated to handle icon placeholders
        unit_pattern = re.compile(r'^## Unit (\d+):\s*(.+?)(?:\s*\[icon:.*?\])?$')

        # Study guide and quiz patterns - more specific, checked first
        study_guide_pattern = re.compile(r'^\*\s+\*\*(\d+\.\d+):\s*Study Guide\*\*(?:\s*\[icon:.*?\])?')
        quiz_pattern = re.compile(r'^\*\s+\*\*(\d+\.\d+):\s*Quiz\*\*(?:\s*\[icon:.*?\])?')
        exam_pattern = re.compile(r'^\*\s+\*\*(\d+\.\d+):\s*Unit \d+ Final Exam\*\*(?:\s*\[icon:.*?\])?')
        project_pattern = re.compile(r'^\*\s+\*\*(\d+\.\d+):\s*Project\s+\d+:.*$')

        # Chapter pattern - excludes Study Guide, Quiz, and Exam entries
        chapter_pattern = re.compile(r'^\*\s+\*\*(\d+\.\d+):\s*(?!(?:Study Guide|Quiz|Unit \d+ Final Exam))(.+?)\*\*(?:\s*\[icon:.*?\])?$')

        # Exclude patterns for non-chapter entries - updated to handle icon placeholders
        exclude_patterns = [
            re.compile(r'^\*\s+\*\*\d+\.\d+:\s*Study Guide\*\*(?:\s*\[icon:.*?\])?'),
            re.compile(r'^\*\s+\*\*\d+\.\d+:\s*Quiz\*\*(?:\s*\[icon:.*?\])?'),
            re.compile(r'^\*\s+\*\*\d+\.\d+:\s*Unit \d+ Final Exam\*\*(?:\s*\[icon:.*?\])?'),
        ]
        
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            
            # Skip empty lines and non-relevant content
            if not line or (line.startswith('#') and not line.startswith('## Unit')):
                continue
            
            # Parse Unit headers
            unit_match = unit_pattern.match(line)
            if unit_match:
                # Clear any pending chapter reference when switching units
                current_chapter_base = None

                if current_unit:
                    units.append(current_unit)

                unit_num = unit_match.group(1)
                unit_title_raw = unit_match.group(2).strip()

                # Extract icon from the unit title line
                cleaned_line, extracted_icon = self.extract_icon_from_line(line)

                # Re-extract the title from cleaned line if icon was found
                if extracted_icon:
                    cleaned_match = unit_pattern.match(cleaned_line)
                    if cleaned_match:
                        unit_title = cleaned_match.group(2).strip()
                    else:
                        unit_title = unit_title_raw
                else:
                    unit_title = unit_title_raw

                # Include unit number in the title for user navigation
                full_unit_title = f"Unit {unit_num}: {unit_title}"

                # Generate URL-friendly slug for unit title
                unit_slug = self._generate_slug(unit_title)

                # Determine icon - use extracted icon or fallback
                if extracted_icon:
                    unit_icon = extracted_icon
                else:
                    unit_icon = self.get_fallback_icon('unit', unit_title)

                # Create paths and convert to web-root-relative with _link suffix
                overview_path = f"src/book/unit{unit_num}/overview_{unit_slug}.html"
                overview_data_path = f"src/data/unit{unit_num}/overview_{unit_slug}.json"
                exam_path = f"src/book/unit{unit_num}/exam_{unit_slug}.html"
                exam_data_path = f"src/data/unit{unit_num}/exam_{unit_slug}.json"

                current_unit = {
                    'title': full_unit_title,
                    'icon': unit_icon,
                    'description': self._generate_unit_description(unit_title),
                    'overview_link': self.format_web_path(overview_path),
                    'overview_data_link': self.format_web_path(overview_data_path),
                    'exam_link': self.format_web_path(exam_path),
                    'exam_data_link': self.format_web_path(exam_data_path),
                    'chapters': []
                }
                logger.info(f"Parsed unit {unit_num}: {unit_title} with icon: {unit_icon}")
                continue
            
            # Parse chapter content
            if current_unit:
                # Parse study guide first (most specific)
                study_match = study_guide_pattern.match(line)
                if study_match:
                    # Extract icon from study guide line
                    cleaned_line, extracted_icon = self.extract_icon_from_line(line)

                    study_chapter_num = study_match.group(1)
                    unit_num = study_chapter_num.split('.')[0]
                    study_slug = self._generate_slug(f"study_guide_{study_chapter_num}")
                    chapter_id = study_chapter_num.replace('.', '_')

                    study_guide_path = f"src/book/unit{unit_num}/study_guide_{chapter_id}.html"
                    study_guide_data_path = f"src/data/unit{unit_num}/study_guide_{chapter_id}.json"

                    study_guide_icon = extracted_icon if extracted_icon else self.get_fallback_icon('study', 'Study Guide')

                    study_guide_chapter = {
                        'title': f"{study_chapter_num}: Study Guide",
                        'icon': study_guide_icon,
                        'type': 'study_guide',
                        'chapter_link': self.format_web_path(study_guide_path),
                        'chapter_data_link': self.format_web_path(study_guide_data_path)
                    }

                    current_unit['chapters'].append(study_guide_chapter)
                    logger.debug(f"Added study guide chapter for {study_chapter_num}")
                    continue

                # Parse quiz
                quiz_match = quiz_pattern.match(line)
                if quiz_match:
                    # Extract icon from quiz line
                    cleaned_line, extracted_icon = self.extract_icon_from_line(line)

                    quiz_chapter_num = quiz_match.group(1)
                    unit_num = quiz_chapter_num.split('.')[0]
                    quiz_slug = self._generate_slug(f"quiz_{quiz_chapter_num}")
                    chapter_id = quiz_chapter_num.replace('.', '_')

                    quiz_path = f"src/book/unit{unit_num}/quiz_{chapter_id}.html"
                    quiz_data_path = f"src/data/unit{unit_num}/quiz_{chapter_id}.json"

                    quiz_icon = extracted_icon if extracted_icon else self.get_fallback_icon('quiz', 'Quiz')

                    quiz_chapter = {
                        'title': f"{quiz_chapter_num}: Quiz",
                        'icon': quiz_icon,
                        'type': 'quiz',
                        'chapter_link': self.format_web_path(quiz_path),
                        'chapter_data_link': self.format_web_path(quiz_data_path)
                    }

                    current_unit['chapters'].append(quiz_chapter)
                    logger.debug(f"Added quiz chapter for {quiz_chapter_num}")
                    continue

                # Parse final exam entries
                exam_match = exam_pattern.match(line)
                if exam_match:
                    # Extract icon from exam line
                    cleaned_line, extracted_icon = self.extract_icon_from_line(line)

                    exam_chapter_num = exam_match.group(1)
                    unit_num = exam_chapter_num.split('.')[0]

                    # Generate paths for exam
                    exam_slug = f"unit_{unit_num}_final_exam"
                    exam_id = exam_chapter_num.replace('.', '_')

                    exam_path = f"src/book/unit{unit_num}/exam_{exam_slug}.html"
                    exam_data_path = f"src/data/unit{unit_num}/exam_{exam_slug}.json"

                    exam_icon = extracted_icon if extracted_icon else self.get_fallback_icon('exam', 'Final Exam')

                    exam_chapter = {
                        'title': f"{exam_chapter_num}: Unit {unit_num} Final Exam",
                        'icon': exam_icon,
                        'type': 'exam',
                        'chapter_link': self.format_web_path(exam_path),
                        'chapter_data_link': self.format_web_path(exam_data_path)
                    }

                    current_unit['chapters'].append(exam_chapter)
                    logger.debug(f"Added exam chapter: {exam_chapter_num}")
                    continue

                # Check for projects (they also match chapter_pattern but need special handling)
                project_match = project_pattern.match(line)
                if project_match:
                        # Extract icon from project line
                        cleaned_line, extracted_icon = self.extract_icon_from_line(line)

                        chapter_num = project_match.group(1)

                        # Re-extract project title from cleaned line
                        if extracted_icon:
                            cleaned_match = project_pattern.match(cleaned_line)
                            if cleaned_match:
                                project_title = cleaned_line.split(':', 1)[1].strip().lstrip('*').strip().rstrip('*').strip()
                            else:
                                project_title = line.split(':', 1)[1].strip().lstrip('*').strip().rstrip('*').strip()
                        else:
                            project_title = line.split(':', 1)[1].strip().lstrip('*').strip().rstrip('*').strip()

                        # Include chapter number in project title for user navigation
                        full_project_title = f"{chapter_num}: {project_title}"

                        unit_num = chapter_num.split('.')[0]
                        project_slug = self._generate_slug(project_title)
                        chapter_id = chapter_num.replace('.', '_')

                        # Determine icon - use extracted icon or fallback
                        if extracted_icon:
                            project_icon = extracted_icon
                        else:
                            project_icon = self.get_fallback_icon('project', project_title)

                        # Create paths and convert to web-root-relative with _link suffix
                        chapter_path = f"src/book/unit{unit_num}/chapter_{chapter_id}_{project_slug}.html"
                        chapter_data_path = f"src/data/unit{unit_num}/chapter_{chapter_id}_{project_slug}.json"

                        project_chapter = {
                            'title': full_project_title,
                            'icon': project_icon,
                            'type': 'project',
                            'chapter_link': self.format_web_path(chapter_path),
                            'chapter_data_link': self.format_web_path(chapter_data_path)
                        }
                        current_unit['chapters'].append(project_chapter)
                        logger.debug(f"Added project: {project_title} with icon: {project_icon}")
                        continue
                    
                # Regular chapter parsing (only for lessons, not study guides/quizzes)
                chapter_match = chapter_pattern.match(line)
                if chapter_match:
                    # Extract icon from chapter line
                    cleaned_line, extracted_icon = self.extract_icon_from_line(line)

                    chapter_num = chapter_match.group(1)

                    # Re-extract chapter title from cleaned line
                    if extracted_icon:
                        cleaned_match = chapter_pattern.match(cleaned_line)
                        if cleaned_match:
                            chapter_title = cleaned_match.group(2).strip()
                        else:
                            chapter_title = chapter_match.group(2).strip()
                    else:
                        chapter_title = chapter_match.group(2).strip()

                    # Remove trailing periods and clean up
                    chapter_title = chapter_title.rstrip('.')

                    # Include chapter number in the title for user navigation
                    full_title = f"{chapter_num}: {chapter_title}"

                    # Generate file paths
                    unit_num = chapter_num.split('.')[0]
                    chapter_slug = self._generate_slug(chapter_title)
                    chapter_id = chapter_num.replace('.', '_')

                    # Determine icon - use extracted icon or fallback
                    if extracted_icon:
                        chapter_icon = extracted_icon
                    else:
                        chapter_icon = self.get_fallback_icon('chapter', chapter_title)

                    # Create paths and convert to web-root-relative with _link suffix
                    chapter_path = f"src/book/unit{unit_num}/chapter_{chapter_id}_{chapter_slug}.html"
                    chapter_data_path = f"src/data/unit{unit_num}/chapter_{chapter_id}_{chapter_slug}.json"

                    # Create the lesson chapter and add it immediately
                    lesson_chapter = {
                        'title': full_title,
                        'icon': chapter_icon,
                        'type': 'lesson',
                        'chapter_link': self.format_web_path(chapter_path),
                        'chapter_data_link': self.format_web_path(chapter_data_path)
                    }
                    current_unit['chapters'].append(lesson_chapter)
                    logger.debug(f"Added lesson chapter {chapter_num}: {chapter_title} with icon: {chapter_icon}")
                    continue
                

                # No need for chapter cleanup since all chapters are added immediately

        # Add the last unit
        if current_unit:
            units.append(current_unit)
        
        logger.info(f"Parsed {len(units)} units with {sum(len(u['chapters']) for u in units)} total chapters")
        return units


    def _generate_unit_description(self, title: str) -> str:
        """Generate appropriate description for unit based on title."""
        title_lower = title.lower()
        
        if 'python' in title_lower:
            return "Master Python for cloud-native backend development with modern frameworks and best practices."
        elif 'go' in title_lower:
            return "Build high-performance cloud-native applications with Go's powerful concurrency and simplicity."
        elif 'devops' in title_lower:
            return "Implement infrastructure as code, CI/CD pipelines, and container orchestration strategies."
        elif 'secret' in title_lower:
            return "Secure configuration and secrets management using HashiCorp Vault and Consul."
        elif 'devsecops' in title_lower:
            return "Integrate security practices into development workflows and CI/CD pipelines."
        elif 'automation' in title_lower:
            return "Automate dependency management and development workflows for enhanced productivity."
        elif 'serverless' in title_lower:
            return "Explore serverless computing patterns and AWS Lambda deployment strategies."
        elif 'integration' in title_lower:
            return "Secure service integration patterns and credential management in distributed systems."
        elif 'capstone' in title_lower:
            return "Apply learned concepts in comprehensive real-world project implementations."
        else:
            return "Essential concepts and practical implementations for cloud-native development."

    def validate_parsed_structure(self, units: List[Dict[str, Any]]) -> bool:
        """Validate the parsed structure for completeness and consistency."""
        issues = []
        
        if not units:
            issues.append("No units found in parsed structure")
            return False
        
        for unit_idx, unit in enumerate(units):
            unit_title = unit.get('title', f'Unit {unit_idx + 1}')
            
            # Check required unit fields (updated for _link suffix)
            required_fields = ['title', 'icon', 'description', 'exam_link']
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
        """Generate a URL-friendly slug from title."""
        # Remove special characters and convert to lowercase
        slug = re.sub(r'[^\w\s-]', '', title.lower())
        # Replace spaces and multiple hyphens with single hyphen
        slug = re.sub(r'[-\s]+', '_', slug)
        # Remove leading/trailing hyphens
        return slug.strip('_')

    def generate_json(self, units: List[Dict[str, Any]]) -> str:
        """Generate formatted JSON string from parsed units."""
        content_structure = {
            'metadata': {
                'generated_by': 'generate_content_from_md.py',
                'source': 'CONTENT.md',
                'version': '1.0.0',
                'title': 'Mastering Cloud-Native Technologies',
                'description': 'Comprehensive guide to cloud-native development with Python, Go, and DevOps practices',
                'total_units': len(units),
                'total_chapters': sum(len(unit['chapters']) for unit in units)
            },
            'units': units
        }
        
        return json.dumps(content_structure, indent=2, ensure_ascii=False)

    def ensure_output_directory(self):
        """Ensure the output directory exists."""
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        logger.info(f"Ensured output directory exists: {self.output_path.parent}")

    def write_json_file(self, json_content: str):
        """Write the JSON content to the output file."""
        try:
            with open(self.output_path, 'w', encoding='utf-8') as file:
                file.write(json_content)
            
            file_size = os.path.getsize(self.output_path)
            logger.info(f"Successfully wrote content.json to {self.output_path}")
            logger.info(f"File size: {file_size} bytes")
            
        except Exception as e:
            logger.error(f"Error writing JSON file: {e}")
            raise

    def generate(self) -> bool:
        """Main generation process."""
        try:
            logger.info("Starting content.json generation from CONTENT.md")
            
            # Read and parse Markdown content
            markdown_content = self.read_content_md()
            
            # Parse structure from markdown
            units = self.parse_markdown_structure(markdown_content)
            
            # Validate parsed structure
            if not self.validate_parsed_structure(units):
                logger.error("Parsed structure validation failed")
                # Still proceed to generate JSON for inspection
                logger.info("Proceeding despite validation failure for debugging")
            
            # Generate JSON
            json_content = self.generate_json(units)
            
            # Ensure output directory and write file
            self.ensure_output_directory()
            self.write_json_file(json_content)
            
            logger.info("Content.json generation completed successfully")
            
            # Summary
            total_chapters = sum(len(unit['chapters']) for unit in units)
            print(f"✅ Generated content.json from CONTENT.md successfully!")
            print(f"📊 Structure: {len(units)} units, {total_chapters} chapters")
            print(f"🔗 Generated consistent URL patterns and data paths")
            
            return True
            
        except Exception as e:
            logger.error(f"Generation failed: {e}")
            return False

def main():
    """Main entry point."""
    generator = MarkdownContentGenerator()
    success = generator.generate()
    
    if success:
        print(f"📍 Output: {generator.output_path}")
    else:
        print("❌ Failed to generate content.json from CONTENT.md")
        sys.exit(1)

if __name__ == "__main__":
    main()