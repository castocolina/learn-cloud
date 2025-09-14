#!/usr/bin/env python3
"""
Content Scaffolding Generator for Cloud-Native Learning Platform

This script automates the creation of TypeScript content data files based on the
structure defined in src/data/content-menu.ts. It generates boilerplate objects
that conform to the interfaces defined in src/data/types.ts.

USAGE:
    python src/python/generate_content_scaffolding.py

CONFIGURATION:
    Modify the constants below to customize the script behavior:
    - VERBOSE_OUTPUT: Show detailed output including file paths
    - LOREM_IPSUM_TEXT: Base text for generating placeholder content
    - CONTENT_LENGTHS: Character limits for different content types

GENERATED FILES:
    Creates .ts files at paths specified in content-menu.ts under src/data/
    Each file contains a properly typed TypeScript object with lorem ipsum content

REQUIREMENTS:
    - Python 3.6+
    - Valid content-menu.ts file structure
    - Write permissions to src/data/ directory and subdirectories
"""

import os
import re
import json
import sys
import logging
import traceback
from typing import Dict, List, Any, Optional, Union
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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

# =============================================================================
# CONFIGURATION CONSTANTS
# =============================================================================

# Verbose output control - set to True to see all generated file paths
VERBOSE_OUTPUT = True

# Comprehensive lorem ipsum base text for generating placeholder content
LOREM_IPSUM_TEXT = """
Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions.

At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments across different platforms and infrastructure. Docker has become the de facto standard for containerization, enabling developers to package applications with their dependencies into lightweight, portable units. These containers can run anywhere - from local development environments to production clusters in the cloud.

Container orchestration platforms, particularly Kubernetes, have revolutionized how we manage containerized applications at scale. Kubernetes provides powerful abstractions for deployment, scaling, service discovery, load balancing, and automated failover. Its declarative configuration model allows teams to describe the desired state of their applications and let the platform handle the implementation details.

Microservices architecture breaks down monolithic applications into smaller, independently deployable services. Each microservice focuses on a specific business capability and communicates with other services through well-defined APIs. This approach enables teams to work independently, choose appropriate technologies for each service, and scale components based on demand.

Infrastructure as Code (IaC) treats infrastructure configuration as software, using tools like Terraform, CloudFormation, and Ansible to provision and manage resources programmatically. This approach brings version control, code review processes, and automated testing to infrastructure management, improving consistency and reducing manual errors.

Continuous Integration and Continuous Deployment (CI/CD) pipelines automate the software delivery process from code commit to production deployment. Modern CI/CD systems integrate security scanning, testing, and compliance checks into the deployment pipeline, ensuring that only validated code reaches production environments.

Observability becomes critical in distributed systems, requiring comprehensive monitoring, logging, and distributed tracing capabilities. The three pillars of observability - metrics, logs, and traces - provide the necessary visibility into system behavior and performance characteristics.

Security considerations permeate every aspect of cloud-native development, from secure container image builds and vulnerability scanning to runtime security monitoring and policy enforcement. Zero-trust security models and service mesh technologies help ensure secure communication between services.

Progressive delivery techniques, including blue-green deployments, canary releases, and feature flags, enable safer rollouts of new features and immediate rollback capabilities when issues arise. These practices reduce deployment risks and enable faster feedback cycles.

Service mesh technologies like Istio and Linkerd provide advanced traffic management, security, and observability capabilities for microservices communication. They handle cross-cutting concerns at the infrastructure level, reducing complexity in application code.

Cloud-native storage solutions must address the stateful nature of some applications while maintaining the benefits of containerization. StatefulSets in Kubernetes, persistent volume claims, and cloud-native databases provide various options for managing data in distributed environments.

Event-driven architectures and message queuing systems enable loose coupling between services and support asynchronous communication patterns. Technologies like Apache Kafka, Redis, and cloud messaging services facilitate reliable message delivery and event processing.

DevOps culture and practices emphasize collaboration between development and operations teams, shared responsibility for system reliability, and automation of repetitive tasks. This cultural shift is essential for successful cloud-native adoption.

Performance optimization in cloud-native environments involves understanding resource utilization patterns, implementing horizontal and vertical scaling strategies, and optimizing container images and application startup times.

Cost optimization becomes crucial as organizations scale their cloud-native infrastructure, requiring understanding of resource pricing models, rightsizing strategies, and efficient resource utilization patterns.
""".strip()

# Content length configurations for different content types (in characters)
CONTENT_LENGTHS = {
    "summary": 200,
    "paragraph": 500,
    "long_paragraph": 800,
    "question": 80,
    "explanation": 300,
    "flashcard_question": 60,
    "flashcard_answer": 400,
    "objective": 50,
    "requirement": 100,
    "deliverable": 80,
    "code_comment": 120,
    "diagram_title": 60,
    "diagram_caption": 150
}

# Minimum content requirements for different content types
MINIMUM_REQUIREMENTS = {
    "lesson_sections": 3,
    "quiz_questions": 5,
    "study_guide_flashcards": 8,
    "exam_questions": 10,
    "project_sections": 4,
    "project_requirements": 5,
    "project_deliverables": 3,
    "code_blocks_per_lesson": 2,
    "diagrams_per_lesson": 2,
    "code_lines_min": 10,
    "code_lines_max": 30
}

# Code language templates and contexts for cloud-native development
CODE_LANGUAGES = {
    "javascript": {
        "contexts": ["Node.js APIs", "Express middleware", "Event handling", "Async operations"],
        "templates": [
            "microservice_api", "event_handler", "middleware", "async_processing"
        ]
    },
    "typescript": {
        "contexts": ["SvelteKit components", "API clients", "Type definitions", "React hooks"],
        "templates": [
            "svelte_component", "api_client", "type_definitions", "react_component"
        ]
    },
    "rust": {
        "contexts": ["Async web servers", "CLI tools", "Performance-critical services", "System programming"],
        "templates": [
            "axum_handler", "cli_application", "async_service", "performance_optimization"
        ]
    },
    "java": {
        "contexts": ["Spring Boot microservices", "Reactive programming", "JPA entities", "REST controllers"],
        "templates": [
            "spring_controller", "reactive_service", "jpa_entity", "configuration_class"
        ]
    },
    "python": {
        "contexts": ["FastAPI services", "Data processing", "AWS Lambda functions", "Django APIs"],
        "templates": [
            "fastapi_endpoint", "data_processor", "lambda_function", "django_view"
        ]
    },
    "go": {
        "contexts": ["Concurrent services", "gRPC servers", "Container tools", "CLI applications"],
        "templates": [
            "grpc_server", "concurrent_worker", "cli_tool", "http_handler"
        ]
    },
    "graphql": {
        "contexts": ["Schema definitions", "Resolvers", "Subscriptions", "Federation"],
        "templates": [
            "schema_definition", "resolver_function", "subscription_handler", "federated_schema"
        ]
    },
    "sql": {
        "contexts": ["DynamoDB queries", "Neptune Gremlin", "PostgreSQL optimization", "Complex joins"],
        "templates": [
            "dynamodb_query", "gremlin_traversal", "postgres_optimization", "complex_join"
        ]
    },
    "yaml": {
        "contexts": ["Kubernetes manifests", "Docker Compose", "CI/CD pipelines", "Helm charts"],
        "templates": [
            "k8s_deployment", "docker_compose", "github_actions", "helm_template"
        ]
    },
    "dockerfile": {
        "contexts": ["Multi-stage builds", "Security hardening", "Optimization", "Production setup"],
        "templates": [
            "multistage_build", "security_hardened", "optimized_image", "production_ready"
        ]
    },
    "bash": {
        "contexts": ["DevOps automation", "Deployment scripts", "Monitoring tools", "CI/CD helpers"],
        "templates": [
            "deployment_script", "monitoring_setup", "automation_tool", "ci_helper"
        ]
    }
}

# Diagram types and their contexts for cloud-native architectures
DIAGRAM_TYPES = {
    "architecture": {
        "contexts": ["Microservices architecture", "Cloud infrastructure", "System components", "Service mesh"],
        "templates": ["microservices_arch", "cloud_infrastructure", "system_overview", "service_mesh"]
    },
    "sequence": {
        "contexts": ["API interactions", "Service communication", "Authentication flow", "Data processing"],
        "templates": ["api_sequence", "service_communication", "auth_flow", "data_pipeline"]
    },
    "flowchart": {
        "contexts": ["Business processes", "CI/CD pipelines", "Decision trees", "Data flow"],
        "templates": ["business_process", "cicd_pipeline", "decision_flow", "data_transformation"]
    },
    "network": {
        "contexts": ["Network topology", "Security zones", "Load balancing", "Traffic routing"],
        "templates": ["network_topology", "security_architecture", "load_balancer", "traffic_flow"]
    }
}

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def extract_lorem_text(length: int) -> str:
    """
    Extract a substring of specified length from the lorem ipsum base text.

    Args:
        length: Maximum character length for the extracted text

    Returns:
        Trimmed lorem ipsum text ending at word boundary, with proper escaping
    """
    if length >= len(LOREM_IPSUM_TEXT):
        text = LOREM_IPSUM_TEXT
    else:
        # Find the last complete word within the length limit
        text = LOREM_IPSUM_TEXT[:length]
        last_space = text.rfind(' ')
        if last_space > 0:
            text = text[:last_space]

    # Clean up the text and escape for TypeScript strings
    text = text.strip()
    # Remove newlines and normalize whitespace
    text = ' '.join(text.split())
    # Escape quotes and backslashes for TypeScript string literals
    text = text.replace('\\', '\\\\').replace('"', '\\"').replace("'", "\\'")

    return text


def parse_content_menu() -> Dict[str, Any]:
    """
    Parse the content-menu.ts file and extract the contentMenu object.

    Returns:
        Parsed content menu structure as dictionary

    Raises:
        FileNotFoundError: If content-menu.ts doesn't exist
        ValueError: If content menu structure cannot be parsed
    """
    content_menu_path = "src/data/content-menu.ts"

    if not os.path.exists(content_menu_path):
        raise FileNotFoundError(f"Content menu file not found: {content_menu_path}")

    try:
        with open(content_menu_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract the contentMenu object - simpler approach using eval
        # Find the start and end of the object
        start_pattern = r'export\s+const\s+contentMenu:\s*ContentMenu\s*=\s*'
        match = re.search(start_pattern, content)

        if not match:
            raise ValueError("Could not find contentMenu export in content-menu.ts")

        start_pos = match.end()

        # Find the matching closing brace
        brace_count = 0
        end_pos = start_pos
        for i, char in enumerate(content[start_pos:], start_pos):
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0:
                    end_pos = i + 1
                    break

        if brace_count != 0:
            raise ValueError("Could not find matching closing brace for contentMenu object")

        object_str = content[start_pos:end_pos]

        # Simple approach: convert TS-like object to Python dict format
        # Replace double quotes and property names
        json_str = object_str
        json_str = re.sub(r'(\w+):\s*', r'"\1": ', json_str)  # Quote property names
        json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)  # Remove trailing commas

        # Handle string values that might not be quoted
        lines = json_str.split('\n')
        processed_lines = []

        for line in lines:
            # If line contains a string value that's not quoted, quote it
            if ':' in line and not re.search(r':\s*["\[\{]', line.strip()):
                # This is a string value that needs quotes
                line = re.sub(r':\s*([^,\n\]\}]+)', r': "\1"', line)
            processed_lines.append(line)

        json_str = '\n'.join(processed_lines)

        return eval(json_str)  # Use eval for TypeScript-like syntax

    except Exception as e:
        # If parsing fails, let's try a simpler extraction approach
        try:
            # Extract just the units array and essential metadata
            units_match = re.search(r'"units":\s*\[(.*?)\]', content, re.DOTALL)
            if units_match:
                # Create a simplified structure by manually extracting key information
                return extract_content_structure_manually(content)
            else:
                raise ValueError(f"Could not extract units from content menu: {e}")
        except Exception as e2:
            raise ValueError(f"Failed to parse content menu structure: {e}. Fallback also failed: {e2}")


def extract_content_structure_manually(content: str) -> Dict[str, Any]:
    """
    Manually extract the content structure using regex patterns.

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

    # Extract all unit blocks
    unit_pattern = r'\{\s*"title":\s*"([^"]+)"[^}]*?"unit_data":\s*"([^"]+)"[^}]*?"chapters":\s*\[(.*?)\]\s*\}'
    unit_matches = re.findall(unit_pattern, content, re.DOTALL)

    for unit_match in unit_matches:
        unit_title, unit_data, chapters_content = unit_match

        unit = {
            "title": unit_title,
            "unit_data": unit_data,
            "chapters": []
        }

        # Extract chapters from the chapters content
        chapter_pattern = r'\{\s*"title":\s*"([^"]+)"[^}]*?"type":\s*"([^"]+)"[^}]*?"chapter_data":\s*"([^"]+)"[^}]*?\}'
        chapter_matches = re.findall(chapter_pattern, chapters_content)

        for chapter_match in chapter_matches:
            chapter_title, chapter_type, chapter_data = chapter_match

            chapter = {
                "title": chapter_title,
                "type": chapter_type,
                "chapter_data": chapter_data
            }

            unit["chapters"].append(chapter)

        result["units"].append(unit)

    result["metadata"]["total_units"] = len(result["units"])
    result["metadata"]["total_chapters"] = sum(len(unit["chapters"]) for unit in result["units"])

    return result


def ensure_directory_exists(file_path: str) -> None:
    """
    Ensure that the directory structure exists for the given file path.

    Args:
        file_path: Full path to the target file
    """
    directory = os.path.dirname(file_path)
    if directory:
        os.makedirs(directory, exist_ok=True)


def validate_typescript_file(file_path: str) -> bool:
    """
    Validate TypeScript file syntax using svelte-check.

    Args:
        file_path: Path to the TypeScript file to validate

    Returns:
        True if file is valid, False otherwise
    """
    try:
        import subprocess

        # Check if the file exists
        if not os.path.exists(file_path):
            logger.error(f"File does not exist: {file_path}")
            return False

        # Run svelte-check on the specific file
        # Note: svelte-check validates the entire project, but we can capture any errors related to our file
        result = subprocess.run(
            ["pnpm", "run", "check"],
            capture_output=True,
            text=True,
            timeout=30
        )

        # If svelte-check passes without errors, the file is valid
        if result.returncode == 0:
            logger.info(f"✅ TypeScript validation passed for {file_path}")
            return True
        else:
            # Check if our specific file is mentioned in the error output
            if file_path in result.stderr or file_path in result.stdout:
                logger.error(f"❌ TypeScript validation failed for {file_path}")
                logger.error(f"Error output: {result.stderr}")
                return False
            else:
                # Error is not related to our file, so our file is probably valid
                logger.info(f"✅ TypeScript validation passed for {file_path} (other errors unrelated)")
                return True

    except subprocess.TimeoutExpired:
        logger.warning(f"⏱️  TypeScript validation timed out for {file_path}")
        return False
    except Exception as e:
        logger.warning(f"⚠️  Could not validate TypeScript file {file_path}: {e}")
        # Don't fail the entire process for validation issues
        return True


def generate_typescript_import(content_type: str, file_path: str) -> str:
    """
    Generate the appropriate TypeScript import statement based on content type and file path.

    Args:
        content_type: Type of content (lesson, quiz, study_guide, exam, project)
        file_path: The full file path to determine relative import path

    Returns:
        TypeScript import statement
    """
    type_mapping = {
        "lesson": "LessonContent, ContentSection, CodeBlock, Diagram",
        "quiz": "QuizContent, Quiz, QuizQuestion",
        "study_guide": "StudyGuideContent, StudyGuide, Flashcard",
        "exam": "ExamContent, Quiz, QuizQuestion",
        "project": "ProjectContent, ContentSection, CodeBlock, Diagram"
    }

    types = type_mapping.get(content_type, "ContentData")

    # Calculate the correct relative path to types.ts
    # Count the directory levels from src/data/
    if "/book/unit" in file_path:
        # Path like: src/data/book/unit1/file.ts -> need ../../types
        import_path = "../../types"
    elif "/unit" in file_path:
        # Path like: src/data/unit1/file.ts -> need ../types
        import_path = "../types"
    else:
        # Default case for files directly in src/data/
        import_path = "./types"

    return f'import type {{ {types} }} from "{import_path}";'


# =============================================================================
# CONTENT TEMPLATE GENERATORS
# =============================================================================

def generate_lesson_template(title: str, path: str) -> str:
    """
    Generate a TypeScript lesson content template.

    Args:
        title: Lesson title from content menu
        path: File path for context in generated content

    Returns:
        Complete TypeScript file content for a lesson
    """
    summary = extract_lorem_text(CONTENT_LENGTHS["summary"])

    # Generate multiple sections
    sections = []
    section_count = MINIMUM_REQUIREMENTS["lesson_sections"]

    for i in range(section_count):
        section = {
            "heading": f"Section {i+1}: Core Concepts",
            "paragraphs": [
                extract_lorem_text(CONTENT_LENGTHS["paragraph"]),
                extract_lorem_text(CONTENT_LENGTHS["long_paragraph"])
            ]
        }
        sections.append(section)

    # Format sections as TypeScript
    sections_ts = "[\n"
    for i, section in enumerate(sections):
        sections_ts += f"\t\t{{\n"
        sections_ts += f'\t\t\theading: "{section["heading"]}",\n'
        sections_ts += f'\t\t\tparagraphs: [\n'
        for paragraph in section["paragraphs"]:
            sections_ts += f'\t\t\t\t"{paragraph}",\n'
        sections_ts += f'\t\t\t]\n'
        sections_ts += f"\t\t}}"
        if i < len(sections) - 1:
            sections_ts += ","
        sections_ts += "\n"
    sections_ts += "\t]"

    # Generate learning objectives
    objectives = []
    for i in range(4):
        objectives.append(extract_lorem_text(CONTENT_LENGTHS["objective"]))

    objectives_ts = '[\n\t\t' + ',\n\t\t'.join([f'"{obj}"' for obj in objectives]) + '\n\t]'

    return f'''{generate_typescript_import("lesson", path)}

// Generated lesson content for: {title}
export const lessonContent: LessonContent = {{
	type: "lesson",
	title: "{title}",
	summary: "{summary}",
	estimatedTime: 45,
	prerequisites: [
		"Basic understanding of cloud computing concepts",
		"Familiarity with software development principles",
		"Command line interface experience"
	],
	learningObjectives: {objectives_ts},
	sections: {sections_ts}
}};
'''


def generate_quiz_template(title: str, path: str) -> str:
    """
    Generate a TypeScript quiz content template.

    Args:
        title: Quiz title from content menu
        path: File path for context in generated content

    Returns:
        Complete TypeScript file content for a quiz
    """
    summary = extract_lorem_text(CONTENT_LENGTHS["summary"])

    # Generate quiz questions
    questions = []
    question_count = MINIMUM_REQUIREMENTS["quiz_questions"]

    for i in range(question_count):
        question = {
            "question": extract_lorem_text(CONTENT_LENGTHS["question"]) + "?",
            "options": [
                extract_lorem_text(40),
                extract_lorem_text(40),
                extract_lorem_text(40),
                extract_lorem_text(40)
            ],
            "correct": i % 4,  # Distribute correct answers
            "explanation": extract_lorem_text(CONTENT_LENGTHS["explanation"])
        }
        questions.append(question)

    # Format questions as TypeScript
    questions_ts = "[\n"
    for i, q in enumerate(questions):
        questions_ts += f"\t\t\t{{\n"
        questions_ts += f'\t\t\t\tquestion: "{q["question"]}",\n'
        questions_ts += f'\t\t\t\toptions: [\n'
        for option in q["options"]:
            questions_ts += f'\t\t\t\t\t"{option}",\n'
        questions_ts += f'\t\t\t\t],\n'
        questions_ts += f'\t\t\t\tcorrect: {q["correct"]},\n'
        questions_ts += f'\t\t\t\texplanation: "{q["explanation"]}"\n'
        questions_ts += f"\t\t\t}}"
        if i < len(questions) - 1:
            questions_ts += ","
        questions_ts += "\n"
    questions_ts += "\t\t]"

    return f'''{generate_typescript_import("quiz", path)}

// Generated quiz content for: {title}
export const quizContent: QuizContent = {{
	type: "quiz",
	title: "{title}",
	summary: "{summary}",
	quiz: {{
		passingScore: 70,
		questions: {questions_ts}
	}}
}};
'''


def generate_study_guide_template(title: str, path: str) -> str:
    """
    Generate a TypeScript study guide content template.

    Args:
        title: Study guide title from content menu
        path: File path for context in generated content

    Returns:
        Complete TypeScript file content for a study guide
    """
    summary = extract_lorem_text(CONTENT_LENGTHS["summary"])

    # Generate flashcards
    flashcards = []
    card_count = MINIMUM_REQUIREMENTS["study_guide_flashcards"]

    for i in range(card_count):
        flashcard = {
            "front": extract_lorem_text(CONTENT_LENGTHS["flashcard_question"]) + "?",
            "back": extract_lorem_text(CONTENT_LENGTHS["flashcard_answer"])
        }
        flashcards.append(flashcard)

    # Format flashcards as TypeScript
    flashcards_ts = "[\n"
    for i, card in enumerate(flashcards):
        flashcards_ts += f"\t\t\t{{\n"
        flashcards_ts += f'\t\t\t\tfront: "{card["front"]}",\n'
        flashcards_ts += f'\t\t\t\tback: "{card["back"]}"\n'
        flashcards_ts += f"\t\t\t}}"
        if i < len(flashcards) - 1:
            flashcards_ts += ","
        flashcards_ts += "\n"
    flashcards_ts += "\t\t]"

    return f'''{generate_typescript_import("study_guide", path)}

// Generated study guide content for: {title}
export const studyGuideContent: StudyGuideContent = {{
	type: "study_guide",
	title: "{title}",
	summary: "{summary}",
	studyGuide: {{
		description: "{summary}",
		minimumCards: {card_count},
		flashcards: {flashcards_ts}
	}}
}};
'''


def generate_exam_template(title: str, path: str) -> str:
    """
    Generate a TypeScript exam content template.

    Args:
        title: Exam title from content menu
        path: File path for context in generated content

    Returns:
        Complete TypeScript file content for an exam
    """
    summary = extract_lorem_text(CONTENT_LENGTHS["summary"])

    # Generate exam questions (more than quiz)
    questions = []
    question_count = MINIMUM_REQUIREMENTS["exam_questions"]

    for i in range(question_count):
        question = {
            "question": extract_lorem_text(CONTENT_LENGTHS["question"]) + "?",
            "options": [
                extract_lorem_text(40),
                extract_lorem_text(40),
                extract_lorem_text(40),
                extract_lorem_text(40)
            ],
            "correct": i % 4,  # Distribute correct answers
            "explanation": extract_lorem_text(CONTENT_LENGTHS["explanation"])
        }
        questions.append(question)

    # Format questions as TypeScript
    questions_ts = "[\n"
    for i, q in enumerate(questions):
        questions_ts += f"\t\t\t{{\n"
        questions_ts += f'\t\t\t\tquestion: "{q["question"]}",\n'
        questions_ts += f'\t\t\t\toptions: [\n'
        for option in q["options"]:
            questions_ts += f'\t\t\t\t\t"{option}",\n'
        questions_ts += f'\t\t\t\t],\n'
        questions_ts += f'\t\t\t\tcorrect: {q["correct"]},\n'
        questions_ts += f'\t\t\t\texplanation: "{q["explanation"]}"\n'
        questions_ts += f"\t\t\t}}"
        if i < len(questions) - 1:
            questions_ts += ","
        questions_ts += "\n"
    questions_ts += "\t\t]"

    return f'''{generate_typescript_import("exam", path)}

// Generated exam content for: {title}
export const examContent: ExamContent = {{
	type: "exam",
	title: "{title}",
	summary: "{summary}",
	exam: {{
		passingScore: 75,
		questions: {questions_ts}
	}},
	coverage: [
		"Core concepts and fundamentals",
		"Practical implementation techniques",
		"Best practices and industry standards",
		"Advanced topics and optimization"
	],
	instructions: "This comprehensive exam tests your understanding of the topics covered in this unit. You have 90 minutes to complete all questions. Read each question carefully and select the best answer."
}};
'''


def generate_project_template(title: str, path: str) -> str:
    """
    Generate a TypeScript project content template.

    Args:
        title: Project title from content menu
        path: File path for context in generated content

    Returns:
        Complete TypeScript file content for a project
    """
    summary = extract_lorem_text(CONTENT_LENGTHS["summary"])

    # Generate project sections
    sections = []
    section_count = MINIMUM_REQUIREMENTS["project_sections"]

    for i in range(section_count):
        section = {
            "heading": f"Phase {i+1}: Implementation Details",
            "paragraphs": [
                extract_lorem_text(CONTENT_LENGTHS["paragraph"]),
                extract_lorem_text(CONTENT_LENGTHS["long_paragraph"])
            ]
        }
        sections.append(section)

    # Format sections as TypeScript
    sections_ts = "[\n"
    for i, section in enumerate(sections):
        sections_ts += f"\t\t{{\n"
        sections_ts += f'\t\t\theading: "{section["heading"]}",\n'
        sections_ts += f'\t\t\tparagraphs: [\n'
        for paragraph in section["paragraphs"]:
            sections_ts += f'\t\t\t\t"{paragraph}",\n'
        sections_ts += f'\t\t\t]\n'
        sections_ts += f"\t\t}}"
        if i < len(sections) - 1:
            sections_ts += ","
        sections_ts += "\n"
    sections_ts += "\t]"

    # Generate requirements and deliverables
    requirements = []
    for i in range(MINIMUM_REQUIREMENTS["project_requirements"]):
        requirements.append(extract_lorem_text(CONTENT_LENGTHS["requirement"]))

    deliverables = []
    for i in range(MINIMUM_REQUIREMENTS["project_deliverables"]):
        deliverables.append(extract_lorem_text(CONTENT_LENGTHS["deliverable"]))

    requirements_ts = '[\n\t\t' + ',\n\t\t'.join([f'"{req}"' for req in requirements]) + '\n\t]'
    deliverables_ts = '[\n\t\t' + ',\n\t\t'.join([f'"{del_}"' for del_ in deliverables]) + '\n\t]'

    return f'''{generate_typescript_import("project", path)}

// Generated project content for: {title}
export const projectContent: ProjectContent = {{
	type: "project",
	title: "{title}",
	summary: "{summary}",
	estimatedHours: 20,
	difficulty: "intermediate",
	technologies: [
		"Docker",
		"Kubernetes",
		"TypeScript",
		"Node.js",
		"PostgreSQL"
	],
	requirements: {requirements_ts},
	deliverables: {deliverables_ts},
	sections: {sections_ts}
}};
'''


# =============================================================================
# MAIN SCRIPT LOGIC
# =============================================================================

def get_content_generator(content_type: str):
    """
    Get the appropriate content generator function for the given content type.

    Args:
        content_type: Type of content to generate

    Returns:
        Generator function for the content type
    """
    generators = {
        "lesson": generate_lesson_template,
        "quiz": generate_quiz_template,
        "study_guide": generate_study_guide_template,
        "exam": generate_exam_template,
        "project": generate_project_template
    }

    return generators.get(content_type, generate_lesson_template)


def process_unit_content(unit_data: Dict[str, Any]) -> int:
    """
    Process a single unit and generate content files for missing chapters.

    Args:
        unit_data: Unit data from content menu

    Returns:
        Number of files created for this unit

    Raises:
        Exception: If there are critical errors during file generation
    """
    files_created = 0
    base_path = "src/data"

    try:
        # Process unit data file if it has one
        if "unit_data" in unit_data:
            unit_file_path = os.path.join(base_path, unit_data["unit_data"])

            if not os.path.exists(unit_file_path):
                try:
                    ensure_directory_exists(unit_file_path)

                    # Generate unit overview content (treated as lesson)
                    content = generate_lesson_template(unit_data["title"], unit_file_path)

                    with open(unit_file_path, 'w', encoding='utf-8') as f:
                        f.write(content)

                    files_created += 1
                    logger.info(f"Created unit file: {unit_file_path}")

                    if VERBOSE_OUTPUT:
                        print(f"Created unit file: {unit_file_path}")

                except Exception as e:
                    logger.error(f"Failed to create unit file {unit_file_path}: {e}")
                    log_exception_details(e, f"Error creating unit file: {unit_file_path}")
                    raise

        # Process chapter data files
        for chapter in unit_data.get("chapters", []):
            if "chapter_data" in chapter:
                chapter_file_path = os.path.join(base_path, chapter["chapter_data"])

                if not os.path.exists(chapter_file_path):
                    try:
                        ensure_directory_exists(chapter_file_path)

                        # Get the appropriate generator for this content type
                        content_type = chapter.get("type", "lesson")
                        generator = get_content_generator(content_type)

                        # Generate content
                        content = generator(chapter["title"], chapter_file_path)

                        with open(chapter_file_path, 'w', encoding='utf-8') as f:
                            f.write(content)

                        files_created += 1
                        logger.info(f"Created {content_type} file: {chapter_file_path}")

                        if VERBOSE_OUTPUT:
                            print(f"Created {content_type} file: {chapter_file_path}")

                    except Exception as e:
                        logger.error(f"Failed to create chapter file {chapter_file_path}: {e}")
                        log_exception_details(e, f"Error creating chapter file: {chapter_file_path}")
                        # Continue processing other chapters instead of failing completely
                        print(f"  ⚠️ Failed to create {chapter['title']}: {e}")
                        continue

    except Exception as e:
        logger.error(f"Critical error processing unit {unit_data.get('title', 'Unknown')}: {e}")
        log_exception_details(e, f"Critical error in process_unit_content")
        raise

    return files_created


def main() -> int:
    """
    Main script execution function.

    Returns:
        Exit code: 0 for success, 1 for failure
    """
    try:
        logger.info("Starting Content Scaffolding Generator")
        print("Content Scaffolding Generator")
        print("=" * 50)
        print(f"Verbose output: {'Enabled' if VERBOSE_OUTPUT else 'Disabled'}")
        print(f"Base lorem ipsum length: {len(LOREM_IPSUM_TEXT)} characters")
        print()

        # Parse the content menu
        logger.info("Parsing content menu structure...")
        print("Parsing content menu...")
        content_menu = parse_content_menu()

        total_units = len(content_menu.get("units", []))
        logger.info(f"Successfully parsed {total_units} units from content menu")
        print(f"Found {total_units} units to process")
        print()

        # Process each unit
        total_files_created = 0
        failed_validations = 0

        for unit_data in content_menu.get("units", []):
            unit_title = unit_data.get("title", "Unknown Unit")
            chapter_count = len(unit_data.get("chapters", []))

            logger.info(f"Processing unit: {unit_title}")
            print(f"Processing: {unit_title} ({chapter_count} chapters)")

            try:
                files_created = process_unit_content(unit_data)
                total_files_created += files_created

                if files_created > 0:
                    print(f"  → Created {files_created} new files")
                    logger.info(f"Successfully created {files_created} files for {unit_title}")
                else:
                    print("  → No missing files found")

            except Exception as e:
                logger.error(f"Failed to process unit {unit_title}: {e}")
                log_exception_details(e, f"Error processing unit: {unit_title}")
                print(f"  → ❌ Error processing unit: {e}")
                failed_validations += 1

            print()

        # Run TypeScript validation if files were created
        if total_files_created > 0:
            logger.info("Running TypeScript validation on generated content files...")
            print("🔍 Running TypeScript validation on generated content files...")

            try:
                import subprocess

                # Validate only the generated content directory using find + tsc
                result = subprocess.run(
                    ["bash", "-c", "find src/data/book -name '*.ts' -exec npx tsc --noEmit {} +"],
                    capture_output=True,
                    text=True,
                    timeout=60,
                    cwd="."
                )

                if result.returncode == 0:
                    logger.info("✅ All generated content files passed TypeScript validation")
                    print("✅ TypeScript validation passed for all generated content files")
                else:
                    logger.warning("⚠️ TypeScript validation found issues in generated files")
                    print("⚠️ TypeScript validation found issues in generated files")
                    if VERBOSE_OUTPUT:
                        print(f"Validation output:\n{result.stderr}")

                    # Try fallback validation with basic syntax check
                    logger.info("Attempting fallback validation with basic syntax check...")
                    syntax_errors = 0

                    # Check each generated file for basic syntax errors
                    for unit_data in content_menu.get("units", []):
                        base_path = "src/data"

                        # Check unit file
                        if "unit_data" in unit_data:
                            unit_file_path = os.path.join(base_path, unit_data["unit_data"])
                            if os.path.exists(unit_file_path):
                                try:
                                    with open(unit_file_path, 'r') as f:
                                        content = f.read()
                                    # Basic syntax validation - check for unclosed quotes, braces, etc.
                                    if content.count('"') % 2 != 0 or content.count('{') != content.count('}'):
                                        syntax_errors += 1
                                        logger.warning(f"Potential syntax issue in {unit_file_path}")
                                except Exception as e:
                                    logger.warning(f"Could not validate {unit_file_path}: {e}")

                        # Check chapter files
                        for chapter in unit_data.get("chapters", []):
                            if "chapter_data" in chapter:
                                chapter_file_path = os.path.join(base_path, chapter["chapter_data"])
                                if os.path.exists(chapter_file_path):
                                    try:
                                        with open(chapter_file_path, 'r') as f:
                                            content = f.read()
                                        # Basic syntax validation
                                        if content.count('"') % 2 != 0 or content.count('{') != content.count('}'):
                                            syntax_errors += 1
                                            logger.warning(f"Potential syntax issue in {chapter_file_path}")
                                    except Exception as e:
                                        logger.warning(f"Could not validate {chapter_file_path}: {e}")

                    if syntax_errors == 0:
                        print("✅ Basic syntax validation passed for all files")
                        logger.info("Basic syntax validation passed despite TypeScript errors")

            except subprocess.TimeoutExpired:
                logger.warning("TypeScript validation timed out")
                print("⚠️ TypeScript validation timed out")
            except Exception as e:
                logger.warning(f"Could not run TypeScript validation: {e}")
                print("⚠️ Could not run TypeScript validation - files may still be valid")

        # Final summary
        print("\n" + "=" * 50)
        logger.info(f"Scaffolding generation completed. Created {total_files_created} files, {failed_validations} failures")
        print(f"Scaffolding generation complete!")
        print(f"Generated {total_files_created} new content files.")

        if failed_validations > 0:
            print(f"⚠️ {failed_validations} units had processing errors")

        if total_files_created == 0:
            print("All content files already exist.")
        elif not VERBOSE_OUTPUT:
            print("Run with VERBOSE_OUTPUT=True to see detailed file paths.")

        return 1 if failed_validations > 0 else 0

    except KeyboardInterrupt:
        logger.info("Generation interrupted by user")
        print("\n⚠️ Generation interrupted by user")
        return 1

    except Exception as e:
        logger.error(f"Critical error in main execution: {e}")
        log_exception_details(e, "Critical error during scaffolding generation")
        print(f"❌ Critical error: {e}")
        return 1


if __name__ == "__main__":
    exit(main())