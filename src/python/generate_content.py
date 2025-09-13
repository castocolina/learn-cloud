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
        
        # Unit icons mapping based on content themes
        self.unit_icons = {
            'python': '🐍',
            'go': '🔷', 
            'devops': '⚙️',
            'secrets': '🔐',
            'devsecops': '🛡️',
            'automation': '🤖',
            'serverless': '⚡',
            'integration': '🔗',
            'capstone': '🎓'
        }
        
        # Default icons for different content types
        self.default_icons = {
            'unit': '📚',
            'chapter': '📄',
            'study': '📋',
            'quiz': '❓',
            'exam': '🎯',
            'project': '🚀'
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
            raise

    def parse_markdown_structure(self, content: str) -> List[Dict[str, Any]]:
        """Parse the Markdown content and extract the hierarchical structure."""
        units = []
        lines = content.split('\n')
        current_unit = None
        current_chapter_base = None
        
        # Patterns for different content types
        unit_pattern = re.compile(r'^## Unit (\d+):\s*(.+)$')
        chapter_pattern = re.compile(r'^\*\s+\*\*(\d+\.\d+):\s*([^*]+)\*\*$')
        study_guide_pattern = re.compile(r'^\*\s+\*\*(\d+\.\d+):\s*Study Guide\*\*$')
        quiz_pattern = re.compile(r'^\*\s+\*\*(\d+\.\d+):\s*Quiz\*\*$')
        exam_pattern = re.compile(r'^\*\s+\*\*(\d+\.\d+):\s*Unit \d+ Final Exam\*\*$')
        project_pattern = re.compile(r'^\*\s+\*\*(\d+\.\d+):\s*Project\s+\d+:.*$')
        
        # Exclude patterns for non-chapter entries
        exclude_patterns = [
            re.compile(r'^\*\s+\*\*\d+\.\d+:\s*Study Guide\*\*$'),
            re.compile(r'^\*\s+\*\*\d+\.\d+:\s*Quiz\*\*$'),
            re.compile(r'^\*\s+\*\*\d+\.\d+:\s*Unit \d+ Final Exam\*\*$'),
        ]
        
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            
            # Skip empty lines and non-relevant content
            if not line or (line.startswith('#') and not line.startswith('## Unit')):
                continue
            
            # Parse Unit headers
            unit_match = unit_pattern.match(line)
            if unit_match:
                if current_unit:
                    units.append(current_unit)
                
                unit_num = unit_match.group(1)
                unit_title = unit_match.group(2).strip()
                
                # Include unit number in the title for user navigation
                full_unit_title = f"Unit {unit_num}: {unit_title}"
                
                # Generate URL-friendly slug for unit title
                unit_slug = self._generate_slug(unit_title)
                
                # Determine icon based on unit content
                unit_icon = self._get_unit_icon(unit_title)
                
                current_unit = {
                    'title': full_unit_title,
                    'icon': unit_icon,
                    'description': self._generate_unit_description(unit_title),
                    'overview': f"src/book/unit{unit_num}/overview_{unit_slug}.html",
                    'overview_data': f"src/data/unit{unit_num}/overview_{unit_slug}.json",
                    'exam': f"src/book/unit{unit_num}/exam_{unit_slug}.html",
                    'exam_data': f"src/data/unit{unit_num}/exam_{unit_slug}.json",
                    'chapters': []
                }
                logger.info(f"Parsed unit {unit_num}: {unit_title}")
                continue
            
            # Parse chapter content
            if current_unit:
                # Check if this line should be excluded from chapter parsing
                is_excluded = any(pattern.match(line) for pattern in exclude_patterns)
                
                if not is_excluded:
                    # Check for projects first (they also match chapter_pattern but need special handling)
                    project_match = project_pattern.match(line)
                    if project_match:
                        chapter_num = project_match.group(1)
                        project_title = line.split(':', 1)[1].strip().lstrip('*').strip().rstrip('*').strip()
                        
                        # Include chapter number in project title for user navigation
                        full_project_title = f"{chapter_num}: {project_title}"
                        
                        unit_num = chapter_num.split('.')[0]
                        project_slug = self._generate_slug(project_title)
                        chapter_id = chapter_num.replace('.', '_')
                        
                        project_chapter = {
                            'title': full_project_title,
                            'icon': '🚀',
                            'lesson': f"src/book/unit{unit_num}/chapter_{chapter_id}_{project_slug}.html",
                            'lesson_data': f"src/data/unit{unit_num}/chapter_{chapter_id}_{project_slug}.json",
                            'quiz': None,
                            'quiz_data': None,
                            'study_guide': None,
                            'study_guide_data': None
                        }
                        current_unit['chapters'].append(project_chapter)
                        logger.debug(f"Added project: {project_title}")
                        continue
                    
                    chapter_match = chapter_pattern.match(line)
                    if chapter_match:
                        chapter_num = chapter_match.group(1)
                        chapter_title = chapter_match.group(2).strip()
                        
                        # Remove trailing periods and clean up
                        chapter_title = chapter_title.rstrip('.')
                        
                        # Include chapter number in the title for user navigation
                        full_title = f"{chapter_num}: {chapter_title}"
                        
                        # Generate file paths
                        unit_num = chapter_num.split('.')[0]
                        chapter_slug = self._generate_slug(chapter_title)
                        chapter_id = chapter_num.replace('.', '_')
                        
                        # Initialize chapter with lesson path
                        current_chapter_base = {
                            'title': full_title,
                            'icon': self._get_chapter_icon(chapter_title),
                            'lesson': f"src/book/unit{unit_num}/chapter_{chapter_id}_{chapter_slug}.html",
                            'lesson_data': f"src/data/unit{unit_num}/chapter_{chapter_id}_{chapter_slug}.json",
                            'quiz': None,
                            'quiz_data': None,
                            'study_guide': None,
                            'study_guide_data': None,
                            'chapter_num': chapter_num,
                            'unit_num': unit_num,
                            'chapter_id': chapter_id,
                            'chapter_slug': chapter_slug
                        }
                        logger.debug(f"Found chapter {chapter_num}: {chapter_title}")
                        continue
                
                # Parse study guide
                study_match = study_guide_pattern.match(line)
                if study_match and current_chapter_base:
                    study_chapter_num = study_match.group(1)
                    if study_chapter_num == current_chapter_base['chapter_num']:
                        current_chapter_base['study_guide'] = f"src/book/unit{current_chapter_base['unit_num']}/study_guide_{current_chapter_base['chapter_id']}_{current_chapter_base['chapter_slug']}.html"
                        current_chapter_base['study_guide_data'] = f"src/data/unit{current_chapter_base['unit_num']}/study_guide_{current_chapter_base['chapter_id']}_{current_chapter_base['chapter_slug']}.json"
                        logger.debug(f"Added study guide for {study_chapter_num}")
                    continue
                
                # Parse quiz
                quiz_match = quiz_pattern.match(line)
                if quiz_match and current_chapter_base:
                    quiz_chapter_num = quiz_match.group(1)
                    if quiz_chapter_num == current_chapter_base['chapter_num']:
                        current_chapter_base['quiz'] = f"src/book/unit{current_chapter_base['unit_num']}/quiz_{current_chapter_base['chapter_id']}_{current_chapter_base['chapter_slug']}.html"
                        current_chapter_base['quiz_data'] = f"src/data/unit{current_chapter_base['unit_num']}/quiz_{current_chapter_base['chapter_id']}_{current_chapter_base['chapter_slug']}.json"
                        
                        # Clean up temporary fields and add to unit
                        chapter_to_add = {k: v for k, v in current_chapter_base.items() 
                                        if k not in ['chapter_num', 'unit_num', 'chapter_id', 'chapter_slug']}
                        current_unit['chapters'].append(chapter_to_add)
                        logger.debug(f"Completed chapter {quiz_chapter_num}: {current_chapter_base['title']}")
                        current_chapter_base = None
                    continue
                
                # Parse final exam entries
                exam_match = exam_pattern.match(line)
                if exam_match:
                    # These are handled at unit level, just skip
                    continue
                
                
                # Handle chapters that don't have study aids or quizzes (like standalone projects)
                # If we parsed a chapter but never completed it due to missing study/quiz, add it anyway
                if current_chapter_base:
                    # Check if this might be the start of a new chapter or end of unit
                    next_chapter_match = chapter_pattern.match(line)
                    is_excluded_next = any(pattern.match(line) for pattern in exclude_patterns)
                    
                    if (next_chapter_match and not is_excluded_next) or line.startswith('## Unit'):
                        # This looks like we're moving to the next chapter/unit, so finalize the current one
                        chapter_to_add = {k: v for k, v in current_chapter_base.items() 
                                        if k not in ['chapter_num', 'unit_num', 'chapter_id', 'chapter_slug']}
                        current_unit['chapters'].append(chapter_to_add)
                        logger.debug(f"Finalized chapter without full structure: {current_chapter_base['title']}")
                        current_chapter_base = None
        
        # Handle any remaining incomplete chapter
        if current_chapter_base:
            chapter_to_add = {k: v for k, v in current_chapter_base.items() 
                            if k not in ['chapter_num', 'unit_num', 'chapter_id', 'chapter_slug']}
            current_unit['chapters'].append(chapter_to_add)
            logger.debug(f"Finalized final chapter: {current_chapter_base['title']}")
        
        # Add the last unit
        if current_unit:
            units.append(current_unit)
        
        logger.info(f"Parsed {len(units)} units with {sum(len(u['chapters']) for u in units)} total chapters")
        return units

    def _get_unit_icon(self, title: str) -> str:
        """Determine appropriate icon for unit based on title content."""
        title_lower = title.lower()
        
        if 'python' in title_lower:
            return self.unit_icons['python']
        elif 'go' in title_lower:
            return self.unit_icons['go']
        elif 'devops' in title_lower or 'ci/cd' in title_lower or 'iac' in title_lower:
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

    def _get_chapter_icon(self, title: str) -> str:
        """Determine appropriate icon for chapter based on title content."""
        title_lower = title.lower()
        
        if 'project' in title_lower:
            return '🚀'
        elif 'environment' in title_lower or 'setup' in title_lower or 'tooling' in title_lower:
            return '🛠️'
        elif 'overview' in title_lower or 'foundational' in title_lower or 'concepts' in title_lower:
            return '📖'
        elif 'quality' in title_lower or 'standards' in title_lower:
            return '✅'
        elif 'testing' in title_lower:
            return '🧪'
        elif 'observability' in title_lower or 'monitoring' in title_lower:
            return '📊'
        elif 'api' in title_lower or 'restful' in title_lower:
            return '🌐'
        elif 'concurrency' in title_lower or 'caching' in title_lower:
            return '⚡'
        elif 'database' in title_lower or 'backend' in title_lower:
            return '🗃️'
        elif 'advanced' in title_lower:
            return '🎯'
        else:
            return self.default_icons['chapter']

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
            
            # Check required unit fields
            required_fields = ['title', 'icon', 'description', 'exam']
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
                if not chapter.get('lesson'):
                    issues.append(f"Chapter '{chapter_title}' missing lesson file")
        
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
                return False
            
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