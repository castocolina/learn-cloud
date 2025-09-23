/**
 * Centralized Union Types for the Cloud-Native Learning Platform
 *
 * This file consolidates all union types used throughout the application to ensure
 * type safety, eliminate hardcoded strings, and provide a single source of truth
 * for typed values across the entire codebase.
 *
 * Following SvelteKit 2024 performance conventions with union types for zero runtime overhead.
 */

/**
 * Content lifecycle status tracking for content maturity management
 */
export type ContentStatus = "scaffold" | "draft" | "final";

/**
 * Content difficulty levels for educational content classification
 */
export type ContentDifficulty = "beginner" | "intermediate" | "advanced" | "expert";

/**
 * Chapter types for content categorization and renderer selection
 * Extended to include overview pages for unit introductions
 */
export type ChapterType = "overview" | "lesson" | "study_guide" | "quiz" | "exam" | "project";

/**
 * Content types for search and display classification
 * Extends existing search type system with additional content types
 */
export type ContentType =
	| "component"
	| "lesson"
	| "code"
	| "diagram"
	| "interactive"
	| "text"
	| "mixed";

/**
 * Navigation sections for menu organization and routing
 */
export type NavigationSection = "content" | "tools" | "resources" | "assessment";

/**
 * Component states for UI interaction and display
 */
export type ComponentState = "active" | "inactive" | "loading" | "error" | "completed";

/**
 * Progress status for completion tracking
 */
export type ProgressStatus = "not_started" | "in_progress" | "completed" | "locked";

/**
 * Mermaid diagram direction options for visual flow representation
 */
export type MermaidDirection = "TB" | "LR" | "BT" | "RL";

/**
 * Question types for interactive assessments
 */
export type QuestionType =
	| "single_choice"
	| "multiple_choice"
	| "code_completion"
	| "true_false"
	| "short_answer"
	| "drag_and_drop";

/**
 * Technology units for content organization and styling
 */
export type TechnologyUnit =
	| "python"
	| "go"
	| "rust"
	| "cloud_databases"
	| "graphql"
	| "kubernetes"
	| "docker"
	| "microservices"
	| "monitoring";

/**
 * Theme modes for application theming
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * Programming languages and technologies supported in educational content
 * Comprehensive list covering modern cloud-native development stack
 */
export type ProgrammingLanguage =
	| "typescript"
	| "svelte"
	| "javascript"
	| "python"
	| "go"
	| "java"
	| "rust"
	| "php"
	| "csharp"
	| "cpp"
	| "c"
	| "ruby"
	| "kotlin"
	| "swift"
	| "dart"
	| "hcl"
	| "yaml"
	| "dockerfile"
	| "bash"
	| "powershell"
	| "sql"
	| "graphql"
	| "cypher"
	| "json"
	| "xml"
	| "proto"
	| "toml"
	| "ini"
	| "markdown"
	| "latex"
	| "mermaid"
	| "plantuml"
	| "dynamodb"
	| "mongodb"
	| "redis"
	| "elasticsearch";

/**
 * Content categories for educational organization
 * Hierarchical categorization supporting curriculum design
 */
export type EducationalCategory =
	| "concept"
	| "tutorial"
	| "example"
	| "exercise"
	| "reference"
	| "assessment"
	| "project"
	| "case-study"
	| "best-practice"
	| "troubleshooting"
	| "architecture"
	| "comparison"
	| "migration"
	| "security"
	| "performance"
	| "testing"
	| "deployment"
	| "monitoring";

/**
 * Diagram types supported by Mermaid rendering engine
 * Complete list of educational diagram types for visual learning
 */
export type MermaidDiagramType =
	| "flowchart"
	| "sequence"
	| "class"
	| "state"
	| "er"
	| "user-journey"
	| "gantt"
	| "pie"
	| "gitgraph"
	| "c4"
	| "mindmap"
	| "timeline"
	| "requirement"
	| "architecture"
	| "network"
	| "deployment"
	| "service-map";

/**
 * Educational resource types for additional learning materials
 * Comprehensive classification of learning resources supporting multimodal education
 */
export type EducationalResourceType =
	| "documentation"
	| "tutorial"
	| "video"
	| "article"
	| "book"
	| "course"
	| "workshop"
	| "webinar"
	| "podcast"
	| "blog-post"
	| "whitepaper"
	| "case-study"
	| "tool"
	| "playground"
	| "simulator"
	| "sandbox"
	| "repository"
	| "demo"
	| "template"
	| "checklist";

/**
 * Additional common union types for UI components
 */
export type BreadcrumbType = "root" | "unit" | "chapter" | "current" | "section";
export type FontSize = "small" | "medium" | "large";
export type AspectRatio = "square" | "card" | "wide";
export type Layout = "vertical" | "horizontal" | "grid";
export type CardStyle = "modern" | "classic" | "minimal";

/**
 * Constant arrays for union types (needed for Object.values() replacement)
 */
export const CONTENT_DIFFICULTIES: ContentDifficulty[] = [
	"beginner",
	"intermediate",
	"advanced",
	"expert"
];
export const CHAPTER_TYPES: ChapterType[] = [
	"overview",
	"lesson",
	"study_guide",
	"quiz",
	"exam",
	"project"
];
export const QUESTION_TYPES: QuestionType[] = [
	"single_choice",
	"multiple_choice",
	"code_completion",
	"true_false",
	"short_answer",
	"drag_and_drop"
];
export const CONTENT_TYPES: ContentType[] = [
	"component",
	"lesson",
	"code",
	"diagram",
	"interactive",
	"text",
	"mixed"
];
