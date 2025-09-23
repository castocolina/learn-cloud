# Content Standards: SvelteKit Learning Platform

## Diagramming Standards

All diagrams in this project must use Mermaid.js for consistency, clarity, and maintainability. For comprehensive rules, embedding practices, and validation workflows, refer to the authoritative [Mermaid Diagram Standards](MERMAID-STANDARDS.md) document.

Mermaid diagrams must follow the syntax, accessibility, and validation requirements defined in that file. Only a brief summary is maintained here; all details and updates are managed in `MERMAID-STANDARDS.md`.

> **🛠️ Technical Implementers**: For syntax rules, component requirements, debug standards, and validation scripts, see [MERMAID-STANDARDS.md](MERMAID-STANDARDS.md).

This document contains the content creation workflows and quality assurance standards for the Cloud-Native Learning Platform.

> **📚 Related Documentation:**
>
> - [CLAUDE.md](CLAUDE.md) - Core project rules and agent implementation guidelines
> - [SVELTEKIT-GUIDE.md](SVELTEKIT-GUIDE.md) - Technical architecture and user experience standards

---

## CONTENT ARCHITECTURE

### SvelteKit Component Architecture

The platform uses a modern component-based architecture with TypeScript interface inheritance for type safety and code reusability.

#### TypeScript Interface Hierarchy (Unified Architecture)

> **🎯 CRITICAL**: All content types use the unified TypeScript architecture from `src/lib/types/`. Import all content interfaces from the centralized system:

```typescript
// ✅ ALWAYS: Import from unified entry point using $types alias
import type {
	ContentStatus,
	ChapterType,
	BaseContent,
	LessonContent,
	QuizContent,
	StudyGuideContent,
	ContentSection,
	ContentBlock
} from "$types";

// ✅ ALTERNATIVE: Using $lib/types (also valid)
import type { ContentStatus } from "$lib/types";
```

**Content Type System** (from `src/lib/types/types.ts`):

```typescript
// Union types for zero runtime overhead (SvelteKit performance optimization)
export type ContentStatus = "scaffold" | "draft" | "final";
export type ChapterType = "lesson" | "study_guide" | "quiz" | "exam" | "project";

// Constants for iteration (replaces Object.values() for union types)
export const CONTENT_STATUSES: ContentStatus[] = ["scaffold", "draft", "final"];
export const CHAPTER_TYPES: ChapterType[] = ["lesson", "study_guide", "quiz", "exam", "project"];
```

**Content Interface Structure** (from `src/lib/types/content.ts`):

```typescript
// Base interface with unified types
export interface BaseContent {
	title: string;
	summary: string;
	status?: ContentStatus; // Union type for lifecycle tracking
	id?: string;
	unitId?: string;
	chapterNumber?: string;
	metadata?: ContentMetadata; // Rich metadata system
}

// Educational content types with rich text integration
export interface LessonContent extends BaseContent {
	type: "lesson";
	sections: ContentSection[]; // Rich content system
	prerequisites?: string[];
	learningObjectives?: string[];
	assessment?: QuizContent; // Optional integrated assessment
}

export interface QuizContent extends BaseContent {
	type: "quiz";
	quiz: Quiz; // Comprehensive quiz system
	configuration?: QuizConfiguration; // Interactive quiz settings
}

export interface StudyGuideContent extends BaseContent {
	type: "study_guide";
	studyGuide: StudyGuide; // Flashcard and review system
	interactiveElements?: FlipCard[]; // Interactive study components
}
```

**🔗 Integration with Rich Text System**:

Content blocks support secure rich text rendering through the unified system (see `src/lib/types/rich-text.ts`).

#### Component Structure

Content renderer components are organized in `src/lib/components/content/`:

```
src/lib/components/content/
├── shared/
│   ├── CodeBlock.svelte        # Shiki syntax highlighting
│   ├── Mermaid.svelte          # Diagram rendering with modal
│   └── ContentSection.svelte   # Reusable section component
├── LessonRenderer.svelte       # Main lesson content
├── QuizRenderer.svelte         # Interactive quizzes with timer
└── StudyGuideRenderer.svelte   # Flashcard system
```

#### Modern Technology Stack

- **Frontend Framework:** SvelteKit with TypeScript
- **Syntax Highlighting:** Shiki (server-side rendering compatible)
- **Diagrams:** Mermaid.js with client-side progressive enhancement
- **Styling:** Tailwind CSS with component isolation
- **State Management:** Svelte's built-in reactivity system
- **Type Safety:** Full TypeScript coverage with interface inheritance
- **Code Generation:** ts-morph for TypeScript AST manipulation (see [Code Block Escaping Strategy](SVELTEKIT-GUIDE.md#code-block-escaping-strategy-for-data-generation))

### Data Structure in src/data/

Content data is stored as TypeScript files exporting properly typed objects, enabling type checking and better developer experience:

```
src/data/
├── unit1/
│   ├── overview_python_for_cloud_native_backend_development.json
│   ├── chapter_1_1_development_environment_tooling.json
│   ├── study_guide_1_1.json
│   ├── quiz_1_1.json
│   ├── exam_python_for_cloud_native_backend_development.json
│   └── ...
├── unit2/
├── content-menu.ts (navigation structure - source of truth)
└── ...
```

### Content Types and Formats

#### 1. Lessons - Flexible Content Block System

**Format**: TypeScript objects implementing `LessonContent` interface with flexible section composition

The new lesson format supports **narrative-driven content composition** where text, code, diagrams, and callouts can be interleaved freely within sections for natural storytelling flow.

```typescript
export const lessonExample: LessonContent = {
	type: "lesson",
	title: "Development Environment & Tooling",
	summary: "Brief description of the lesson content",
	status: "draft", // Content lifecycle tracking: scaffold | draft | final
	estimatedTime: 45,
	prerequisites: ["Docker basics", "Command line familiarity"],
	learningObjectives: [
		"Set up development environment",
		"Understand container orchestration",
		"Deploy first application"
	],
	sections: [
		{
			title: "Getting Started with Cloud-Native Development",
			content: [
				{
					type: "paragraph",
					content:
						"Cloud-native development requires a comprehensive understanding of containerization and orchestration. Let's start with the fundamentals."
				},
				{
					type: "code",
					language: "typescript",
					code: 'const config = {\n  environment: "development",\n  containerRuntime: "docker"\n};',
					title: "Basic Configuration",
					filename: "config.ts"
				},
				{
					type: "paragraph",
					content:
						"The configuration above demonstrates how to set up basic environment parameters. Notice how we define the container runtime explicitly."
				},
				{
					type: "callout",
					calloutType: "info",
					title: "Pro Tip",
					content:
						"Always validate your configuration in development before deploying to production environments."
				},
				{
					type: "diagram",
					diagramType: "mermaid",
					definition:
						"graph TD\n    A[Developer] --> B[Docker]\n    B --> C[Container]\n    C --> D[Kubernetes]",
					title: "Development Workflow",
					caption: "From code to orchestrated deployment"
				},
				{
					type: "paragraph",
					content:
						"This workflow diagram shows the progression from development through containerization to orchestration. Each step builds upon the previous one."
				}
			]
		}
	]
};
```

**Key Benefits of the Flexible System:**

- **🔄 Narrative Flow**: Content blocks can be arranged in any logical order
- **📚 Natural Storytelling**: Introduce concepts, show code, explain, then visualize
- **🎯 Contextual Learning**: Code examples followed immediately by explanations
- **⚡ Dynamic Composition**: Same block types reused in different arrangements
- **🔧 Content Lifecycle**: Status tracking from scaffold through final publication

### Content Status Management System

All content items now include a `status` field to track their maturity and quality level throughout the development lifecycle:

```typescript
export type ContentStatus = "scaffold" | "draft" | "final";
```

#### Status Lifecycle

1. **📝 Scaffold** (`scaffold`)
   - **Purpose**: Auto-generated placeholder content from tooling
   - **Quality**: Basic structure with lorem ipsum or template content
   - **Usage**: Starting point for content development
   - **Validation**: Minimal - ensures proper TypeScript interface compliance

2. **✏️ Draft** (`draft`)
   - **Purpose**: Content under active development with real educational material
   - **Quality**: Educational value present but may need refinement
   - **Usage**: Content being written, reviewed, or tested
   - **Validation**: Moderate - checks for educational completeness

3. **✅ Final** (`final`)
   - **Purpose**: Production-ready content approved for learners
   - **Quality**: High educational value, thoroughly reviewed and tested
   - **Usage**: Published content ready for student consumption
   - **Validation**: Comprehensive - full quality assurance passed

#### Status Transition Guidelines

- **Scaffold → Draft**: Replace template content with real educational material
- **Draft → Final**: Complete editorial review, technical accuracy check, and user testing
- **Quality Gates**: Each transition should meet specific quality criteria
- **Rollback**: Content can be moved back to previous status if issues are discovered

### Union Type Integration

> **📋 Complete Union Type Documentation**: See the TypeScript Interface Hierarchy section above and [SVELTEKIT-GUIDE.md](SVELTEKIT-GUIDE.md) for comprehensive union type patterns, performance optimizations, and refactoring workflows.

**Key Union Types for Content**:

- `ContentStatus`: "scaffold" | "draft" | "final"
- `ChapterType`: "lesson" | "study_guide" | "quiz" | "exam" | "project"
- `ContentDifficulty`: "beginner" | "intermediate" | "advanced" | "expert"

All types use zero runtime overhead and include constant arrays for iteration.

#### Implementation Example

```typescript
export const exampleLesson: LessonContent = {
	type: "lesson",
	title: "Container Orchestration Fundamentals",
	summary: "Learn the core concepts of container orchestration with Kubernetes",
	status: "draft" // Clearly indicates development stage
	// ... rest of lesson content
};
```

#### 2. Study Guides

**Format**: TypeScript objects implementing `StudyGuideContent` interface

```typescript
export const studyGuideExample: StudyGuideContent = {
	type: "study_guide",
	title: "Study Guide: Development Environment & Tooling",
	summary: "Interactive flashcards to reinforce key concepts",
	studyGuide: {
		description: "Review these flashcards to solidify your understanding",
		flashcards: [
			{
				front: "What is container orchestration?",
				back: "Container orchestration automates deployment, management, scaling, and networking of containers",
				tags: ["containers", "orchestration", "kubernetes"]
			}
		]
	}
};
```

**Features**:

- Interactive flip animations with click/touch support
- Shuffle and reset functionality
- Fullscreen modal for better viewing
- Progress tracking and keyboard navigation
- Tag system for categorization

### Interactive Components Specifications

#### Mermaid Diagrams

For comprehensive Mermaid implementation details, syntax rules, and technical requirements, see [MERMAID-STANDARDS.md](MERMAID-STANDARDS.md).

**Content Creation Guidelines**:

- **Educational Context**: Include clear title and caption explaining the diagram's purpose
- **Learning Integration**: Ensure diagrams support lesson objectives and flow naturally with content
- **Accessibility**: Provide alternative text descriptions for complex diagrams
- **Validation**: All diagrams must pass syntax validation before content publication

**Technical Implementation**:

- Expandable diagrams with modal functionality
- Mobile-responsive design with touch optimization
- Debug capabilities for troubleshooting

> **📋 Technical Details**: For syntax rules, direction preferences, component requirements, and validation standards, refer to [MERMAID-STANDARDS.md](MERMAID-STANDARDS.md).

#### Code Highlighting

- **Library**: Shiki for server-side syntax highlighting
- **Language Support**: 200+ programming languages including Dockerfile, YAML, HCL, Rust, etc.
- **Theme**: GitHub Light theme with dark mode support
- **SSR Compatible**: Works with SvelteKit server-side rendering
- **Features**: Copy-to-clipboard, optional titles/filenames, mobile-responsive horizontal scroll
- **Integration**: Automatic highlighting via CodeBlock.svelte component

#### Flashcard System

- **Standard View**: Card flip animation on click/touch
- **Expandable Modal**: Fullscreen view for lengthy definitions
  - **Mobile**: Full viewport usage (100vh x 100vw)
  - **Desktop**: Large modal covering most of the screen
  - **Content Scrolling**: Vertical scroll for long content within modal
- **Navigation**: Previous/Next within flashcard set
- **Progress Tracking**: Current card indicator (e.g., "Card 3 of 6")

#### Quiz/Exam Navigation

- **Single Question Display**: Show one question at a time
- **Dedicated Controls**: Separate Previous/Next buttons from page navigation
- **Progress Indicator**: "Question X of Y" display
- **Final Results**:
  - Score percentage calculation
  - Pass/Fail status (80% threshold)
  - Action buttons: Restart (go to question 1) or Continue (next topic)

#### 3. Quizzes

**Format**: TypeScript objects implementing `QuizContent` interface

```typescript
export const quizExample: QuizContent = {
	type: "quiz",
	title: "Quiz: Development Environment & Tooling",
	summary: "Test your knowledge of development environment concepts",
	quiz: {
		passingScore: 70,
		questions: [
			{
				question: "What is the primary purpose of container orchestration?",
				options: [
					"To create container images",
					"To automate deployment, scaling, and management of containers",
					"To replace Docker",
					"To monitor container performance only"
				],
				correct: 1, // Single choice (number)
				explanation: "Container orchestration automates complex deployment tasks..."
			},
			{
				question: "Which are core Kubernetes components? (Select all that apply)",
				options: ["Control Plane", "Worker Nodes", "Docker Engine", "etcd"],
				correct: [0, 1, 3], // Multiple choice (array)
				explanation: "Control Plane, Worker Nodes, and etcd are core components..."
			}
		]
	}
};
```

##### Code Completion Question Standards

For **Code Completion** questions (`QuestionType.CODE_COMPLETION`), strict underscore patterns must be followed:

**Mandatory Standard:**

- **Blank Pattern**: Use exactly **5 underscores** (`_____`) for ALL code completion blanks
- **Regex Compatibility**: The pattern `/(_{3,})/g` matches 3 or more underscores, ensuring forward compatibility
- **Consistency**: ALL code completion questions must use the same underscore count to avoid parsing ambiguity

**Example Implementation:**

```typescript
export const codeCompletionExample: CodeCompletionQuestion = {
	id: "kb-003",
	type: QuestionType.CODE_COMPLETION,
	question: "Complete the Kubernetes YAML configuration:",
	points: 10,
	codeSnippet: `apiVersion: apps/v1
kind: _____
metadata:
  name: web-app
spec:
  replicas: _____
  selector:
    matchLabels:
      app: _____`,
	blanks: [
		{
			id: "deployment-kind",
			options: ["Deployment", "Service", "Pod", "ConfigMap"]
		},
		{
			id: "replica-count",
			options: ["1", "3", "5", "10"]
		},
		{
			id: "app-label",
			options: ["web-app", "frontend", "backend", "database"]
		}
	],
	correctAnswers: {
		"deployment-kind": "Deployment",
		"replica-count": "3",
		"app-label": "web-app"
	},
	explanation: "Kubernetes Deployment with 3 replicas and proper label matching"
};
```

**Validation Requirements:**

- ✅ **MUST use**: Exactly 5 underscores (`_____`) per blank
- ✅ **MUST match**: Number of blanks equals number of `_____` patterns in code snippet
- ✅ **MUST provide**: Same number of option arrays as blank patterns
- ❌ **NEVER use**: Inconsistent underscore counts (e.g., `___`, `____`, `______`)
- ❌ **NEVER mix**: Different underscore patterns within the same question

**Features**:

- Single question display with smooth transitions
- Timer functionality with elapsed time tracking
- Support for single-choice and multiple-choice questions
- Progress indicator and navigation controls
- Automatic scoring with detailed results
- Pass/fail determination with restart functionality

#### 4. Exams

**Format**: `exam_[unit_name].json`

```json
{
	"title": "Unit 1 Final Exam: Python for Cloud-Native Backend Development",
	"questions": [
		{
			"question": "Comprehensive question text",
			"options": ["Option A", "Option B", "Option C", "Option D"],
			"correct": 0,
			"explanation": "Detailed explanation",
			"difficulty": "medium",
			"topic": "Development Environment"
		}
	]
}
```

**Configuration**:

- **Display Mode**: Show only one question at a time
- **Navigation**: Dedicated Previous/Next buttons (separate from page navigation)
- **Question Pool**: Display 20 questions, store minimum 30 (1.5x ratio)
- **Progress Display**: "Question X of Y" indicator
- **Scoring**: 80% threshold for Pass/Fail determination
- **Results**: Score percentage, Pass/Fail status, Restart/Continue options

#### 5. Unit Overviews

**Format**: `overview_[unit_name].json`

```json
{
	"title": "Python for Cloud-Native Backend Development",
	"description": "Comprehensive unit description",
	"learning_objectives": ["Objective 1", "Objective 2"],
	"prerequisites": ["Prerequisite 1", "Prerequisite 2"],
	"estimated_hours": 40
}
```

### Content Quality Standards

#### Content Guidelines

- **Consistency**: All titles must match exactly with `content-menu.ts`
- **Clarity**: Use clear, concise language appropriate for experienced programmers new to cloud-native
- **Structure**: Follow hierarchical information architecture
- **Interactivity**: Include practical examples and hands-on exercises

#### Technical Writing Standards

- **Code Examples**: Use production-ready, secure-by-default code
- **Documentation**: Reference official documentation and authoritative sources
- **Updates**: Use recent but stable versions of all technologies
- **Security**: Emphasize security considerations throughout

### Content Navigation Structure

The `src/data/content-menu.ts` file serves as the single source of truth for:

- Unit organization and metadata
- Chapter sequencing and types
- Navigation links (both legacy HTML and new JSON data links)
- Icons and descriptions

**Structure**:

```json
{
	"metadata": {
		"title": "Mastering Cloud-Native Technologies",
		"total_units": 9,
		"total_chapters": 119
	},
	"units": [
		{
			"title": "Unit Title",
			"icon": "IconName",
			"description": "Unit description",
			"overview_data_link": "data/unit1/overview_*.json",
			"exam_data_link": "data/unit1/exam_*.json",
			"chapters": [
				{
					"title": "Chapter Title",
					"icon": "IconName",
					"type": "lesson|study_guide|quiz|exam|project",
					"chapter_data_link": "data/unit1/chapter_*.json"
				}
			]
		}
	]
}
```

### Development Workflow

#### Modern Content Creation Process

1. **Plan**: Use `CONTENT.md` as authoritative outline
2. **Define Types**: Create TypeScript interfaces extending BaseContent
3. **Create Content**: Export typed objects from TypeScript files in `src/data/`
4. **Implement Renderers**: Use appropriate content renderer components
5. **Validate**: Run TypeScript checks and SvelteKit validation
6. **Test**: Verify content displays correctly across all device sizes

#### Component Integration Workflow

```typescript
// 1. Import content and renderer
import { demoLesson } from '$data/demo';
import LessonRenderer from '$lib/components/content/LessonRenderer.svelte';

// 2. Use in SvelteKit route
<LessonRenderer content={demoLesson} />
```

#### TypeScript Development Benefits

- **Compile-time Validation**: Catch errors before deployment
- **IntelliSense Support**: Auto-completion and type hints in development
- **Refactoring Safety**: Confident code changes with type checking
- **Interface Evolution**: Easy extension of content types
- **Component Props**: Type-safe component property validation

#### Content Validation

- **JSON Syntax**: All files must be valid JSON
- **Required Fields**: All mandatory fields must be present
- **Link Integrity**: All referenced links must be functional
- **Content Quality**: Follow technical writing standards

#### Mermaid Content Validation Workflow

**🚧 PLACEHOLDER: Automated Mermaid Validation for Lesson Content**

When creating lesson content that includes Mermaid diagram blocks, the following validation workflow should be implemented:

```typescript
// TODO: Implement automated validation function
// validateLessonMermaidContent(lessonContent: LessonContent): ValidationResult

// Validation Steps:
// 1. Scan lesson content sections for diagram blocks (type: "diagram", diagramType: "mermaid")
// 2. Extract diagram definition strings from each mermaid block
// 3. Validate each diagram using Mermaid parser (see MERMAID-STANDARDS.md validation section)
// 4. Report validation results with specific error locations within lesson structure
// 5. Generate validation report with file path, section index, diagram title, and error details
```

**Integration Points**:

- **Content Creation**: Run validation after lesson content is created/modified
- **Build Process**: Include in `make content-validate` command
- **Pre-commit**: Validate all modified lesson files before commit
- **CI/CD**: Automated validation in deployment pipeline

**Validation Output Example**:

```
❌ src/data/unit1/lesson_1_2.json - Section 3, Diagram "System Architecture"
   Error: Parse error on line 2: Missing double quotes around node text

✅ src/data/unit1/lesson_1_3.json - Section 1, Diagram "User Flow"
   Valid diagram parsed successfully
```

> **📋 Implementation Details**: For validation script requirements and technical implementation, see [MERMAID-STANDARDS.md - Validating Diagrams in TypeScript](MERMAID-STANDARDS.md#validating-diagrams-in-typescript).

#### Question Pool Management

- **Diversity**: Create varied question types and difficulty levels
- **Randomization**: Ensure sufficient questions for effective randomization
- **Quality**: Questions should test understanding, not memorization
- **Updates**: Regularly review and update question pools

### Legacy Content Migration

#### Current State

- **Legacy Directory**: `src/book/` contains 183+ HTML files
- **Status**: Marked for future removal, available for content reference
- **Migration Strategy**: Extract content to JSON format progressively

#### Migration Guidelines

- **Content Preservation**: Maintain educational value during conversion
- **Format Modernization**: Convert to structured JSON format
- **Enhancement**: Improve interactivity and user experience
- **Validation**: Ensure no content loss during migration

### Technical Implementation

#### Content Loading

- Dynamic imports for JSON content files
- Type-safe interfaces for all content types
- Error handling for missing or malformed content
- Caching strategies for performance

#### Component Integration

- Reusable components for each content type
- Consistent styling using Tailwind CSS
- Responsive design for all screen sizes
- Accessibility compliance

### Quality Assurance

#### Validation Checklist

- [ ] JSON syntax validation
- [ ] Required fields present
- [ ] Content matches `content-menu.ts` structure
- [ ] Minimum question/flashcard requirements met
- [ ] Links and references functional
- [ ] Content follows technical writing standards
- [ ] Mobile responsiveness verified
- [ ] Accessibility guidelines followed

#### Testing Requirements

- Unit tests for content loading functions
- Integration tests for content display components
- End-to-end tests for user workflows
- Performance tests for content loading
- Accessibility testing with screen readers

### Interactive Quiz & Assessment System

**Interactive Assessment Requirements:**

Both quizzes and exams must provide an individual question display with navigation controls, automatic scoring, and restart functionality.

#### Quiz Structure (5 questions, 80% pass threshold)

```html
<div class="quiz-content">
	<header class="quiz-header">
		<h2>Quiz: [Topic Name]</h2>
		<p class="quiz-intro">[Descriptive introduction explaining what will be tested]</p>
	</header>
	<div class="quiz-container">
		<div class="quiz-card active-card" data-question="1">
			<div class="question">
				<p>1. [Question text]</p>
				<ul class="options">
					<li>
						<label><input type="radio" name="q1" value="a" /> a) Option A</label>
					</li>
					<li>
						<label><input type="radio" name="q1" value="b" /> b) Option B</label>
					</li>
					<li>
						<label><input type="radio" name="q1" value="c" /> c) Option C</label>
					</li>
					<li>
						<label><input type="radio" name="q1" value="d" /> d) Option D</label>
					</li>
				</ul>
				<div class="answer" data-correct="a"></div>
			</div>
		</div>
		<!-- Repeat for 5 questions total -->

		<div class="quiz-navigation">
			<button class="btn btn-outline-secondary" id="prev-question">Previous</button>
			<div class="quiz-progress">Question 1 of 5</div>
			<button class="btn btn-outline-primary" id="next-question">Next</button>
			<button class="btn btn-success" id="submit-quiz" style="display: none;">
				Submit Answers
			</button>
		</div>
		<div class="quiz-results-container"></div>
	</div>
</div>
```

#### Unit Final Exam Structure (10-20 questions, 70% pass threshold)

```html
<div class="exam-content">
	<header class="exam-header">
		<h1>Unit [X] Final Exam: [Unit Title]</h1>
		<p class="exam-intro">[Comprehensive description of exam coverage]</p>
		<div class="exam-instructions">
			<p>
				<strong>Instructions:</strong> Answer all questions to the best of your ability. You need
				70% or higher to pass.
			</p>
		</div>
	</header>
	<div class="quiz-container">
		<!-- Same structure as quiz but with 10-20 questions -->
		<div class="quiz-card active-card" data-question="1">
			<div class="question">
				<p>1. [Question text]</p>
				<ul class="options">
					<li>
						<label><input type="radio" name="q1" value="a" /> A) Option A</label>
					</li>
					<li>
						<label><input type="radio" name="q1" value="b" /> B) Option B</label>
					</li>
					<li>
						<label><input type="checkbox" name="q1" value="c" /> C) Multiple choice option</label>
					</li>
					<li>
						<label><input type="checkbox" name="q1" value="d" /> D) Multiple choice option</label>
					</li>
				</ul>
				<div class="answer" data-correct="b"></div>
				<!-- Single: "b", Multiple: "c,d" -->
			</div>
		</div>

		<div class="quiz-navigation">
			<button class="btn btn-outline-secondary" id="prev-question">Previous</button>
			<div class="quiz-progress">Question 1 of 20</div>
			<button class="btn btn-outline-primary" id="next-question">Next</button>
			<button class="btn btn-success" id="submit-quiz" style="display: none;">
				Submit Answers
			</button>
		</div>
		<div class="quiz-results-container"></div>
	</div>
</div>
```

**Assessment Standards:**

- **Quizzes:** 5 questions, 80% required to pass
- **Unit Final Exams:** 10-20 questions (varies by unit), 70% required to pass
- **Question Types:** Single-choice (radio) or multiple-choice (checkbox)
- **Multiple-choice answers:** Use comma-separated values in data-correct (e.g., "a,c,d")
- **Navigation:** Individual question display with Previous/Next buttons
- **Results:** Automatic scoring with pass/fail feedback and "Try Again" functionality
- **Visual Feedback:** Selected options highlighted, progress indicator, animated transitions
- **Navigation Priority:** Quiz navigation uses `z-index: var(--z-modals)` with `position: sticky` and `bottom: var(--space-lg)` for optimal visibility above floating navigation
- **JavaScript Integration:** The quiz system is automatically initialized via `initializeQuizzes()` in `initializeContentFeatures()`. No additional JavaScript is needed in individual quiz files.

**Interactive Features:**

- **Single Question Display:** Only one question visible at a time with smooth transitions
- **Navigation Controls:** Previous/Next buttons with smart visibility (Previous hidden on Q1, Submit shown on last question)
- **Progress Tracking:** Real-time progress indicator showing current question number
- **Visual Selection:** Selected options highlighted with border and background changes
- **Results System:** Comprehensive scoring with percentage, pass/fail status, and detailed feedback
- **Try Again:** Full restart functionality that clears all answers and returns to question 1

### Unit Overview Page Requirements

**Interactive Navigation:**

- **Clickable Topic Cards:** Entire topic cards must be clickable to navigate to main content
- **Topic Type Badges:** Make `topic-type` elements clickable to navigate to content
- **Component Navigation:** Individual components (📖 Main Content, 🎯 Study Aids, ❓ Quiz) must be clickable
- **Visual Feedback:** Proper hover states and cursor pointers for all interactive elements

**Content Accuracy:**

- **Title Consistency:** Topic titles in overviews must match actual file names and content
- **Index Alignment:** Ensure topic indices match hierarchical navigation system
- **Component Mapping:** Verify components map to correct files (study aids, quiz, etc.)

**CSS Requirements for Interactive Elements:**

```css
.topic-type {
	cursor: pointer;
	transition: all 0.2s ease;
}
.topic-type:hover {
	transform: scale(1.05);
	box-shadow: var(--shadow-sm);
}
.component {
	cursor: pointer;
	transition: all 0.2s ease;
}
.component:hover {
	background-color: var(--gray-200);
	color: var(--gray-700);
	transform: scale(1.02);
}
```

---

## QUALITY ASSURANCE & VALIDATION

### SvelteKit Component Quality Standards

- **TypeScript First:** All components must use TypeScript with proper interfaces
- **Semantic Structure:** Use appropriate HTML5 semantic elements within Svelte components
- **Tailwind CSS:** Use Tailwind utility classes for styling, avoid custom CSS when possible
- **Touch Targets:** Ensure all interactive elements meet accessibility guidelines (44px minimum)
- **Component Structure:** Proper Svelte component organization with `<script>`, `<template>`, and `<style>` sections
- **Props Validation:** Define clear TypeScript interfaces for all component props
- **Accessibility:** Include proper ARIA labels and semantic markup for screen readers

### Automated Validation Standards

- **TypeScript Validation:** All code automatically validated by SvelteKit's TypeScript integration
- **ESLint Integration:** Code quality and consistency enforced automatically
- **Prettier Formatting:** Automatic code formatting with consistent style
- **Component Validation:** SvelteKit validates component structure and syntax
- **Build-Time Checks:** Type errors prevent successful builds, ensuring code quality

### SvelteKit Validation Tools & Commands

This project uses modern development tools integrated with SvelteKit for automated validation and formatting.

**🔍 SvelteKit Commands:**

- `pnpm run check` - TypeScript and component validation
- `pnpm run check:watch` - Continuous validation during development
- `pnpm run lint` - ESLint code quality checks
- `pnpm run format` - Prettier automatic formatting
- `pnpm run build` - Full build validation (includes all checks)

**📝 Project-Specific Validation:**

- `make content-validate` - Validate JSON content structure
- `make validate-bash` - Validate bash scripts with shellcheck
- `make validate-python` - Validate Python scripts compilation
- `make validate` - Run all project-specific validations

**💡 Key Benefits:**

- **TypeScript Integration:** Compile-time error detection and prevention
- **Component Validation:** SvelteKit validates component structure automatically
- **ESLint Integration:** Real-time code quality feedback in development
- **Prettier Integration:** Automatic formatting on save (when configured in IDE)
- **Build Validation:** Failed builds prevent deployment of invalid code

### Quality Assurance Workflow

1. **Development:** Write SvelteKit components following TypeScript standards with mobile-first approach
2. **Mobile Testing:** Test all features on mobile devices (≤390px) before desktop
3. **SvelteKit Validation:** Run `pnpm run check` for TypeScript and component validation
4. **Code Quality:** Run `pnpm run lint` for ESLint checks and `pnpm run format` for Prettier formatting
5. **Edge Testing:** Verify text visibility at screen edges, especially progress bars
6. **Pre-commit:** Automated validation fixes and checks via Prettier/ESLint
7. **CI/CD:** Automated SvelteKit build validation in deployment pipeline

### Testing Standards & Framework

**Testing Directory Structure:**
All test files must be organized in `src/test/` with the following structure:

```
src/test/
├── unit/                    # Unit tests for individual components
├── integration/             # Integration tests for component interactions
├── e2e/                     # End-to-end tests for complete user flows
├── accessibility/           # Accessibility compliance tests
├── performance/             # Performance and load testing
└── fixtures/                # Test data and mock content
```

**Testing Requirements:**

- **Framework Standards:** Use modern testing frameworks (Jest, Playwright, Cypress) for comprehensive coverage
- **Test Categories:**
  - **Navigation Tests:** Verify hierarchical navigation, progress tracking, and menu functionality
  - **Interactive Component Tests:** Validate quiz systems, flashcards, search functionality, and modal behaviors
  - **Responsive Design Tests:** Ensure proper functionality across mobile (≤390px), tablet (768px), and desktop (1024px+) breakpoints
  - **Content Validation Tests:** Verify Mermaid diagram rendering, code highlighting, and dynamic content loading
  - **Accessibility Tests:** Validate ARIA labels, keyboard navigation, screen reader compatibility, and touch target sizes
  - **Performance Tests:** Measure loading times, search response times, and overall application performance

**Testing Naming Conventions:**

- **Unit Tests:** `[component].test.js` (e.g., `navigation.test.js`, `search.test.js`)
- **Integration Tests:** `[feature].integration.test.js` (e.g., `quiz-navigation.integration.test.js`)
- **E2E Tests:** `[user-flow].e2e.test.js` (e.g., `complete-unit.e2e.test.js`)
- **Test Files:** Use descriptive names that clearly indicate what functionality is being tested

**Automated Testing Pipeline:**

- **Pre-commit:** Run unit tests and basic integration tests before commits
- **CI/CD Integration:** Execute full test suite including E2E tests in deployment pipeline
- **Mobile Testing:** Automated testing on various device sizes and orientations
- **Cross-browser Testing:** Validate functionality across major browsers (Chrome, Firefox, Safari, Edge)

**Test Coverage Requirements:**

- **Minimum Coverage:** 80% code coverage for JavaScript modules
- **Critical Path Coverage:** 100% coverage for navigation, quiz systems, and search functionality
- **Error Handling:** Comprehensive testing of error states and edge cases
- **User Experience:** Validate smooth transitions, loading states, and interactive feedback

### Standard Tools Configuration

**Prettier Configuration (`.prettierrc`):**

```json
{
	"tabWidth": 2,
	"useTabs": false,
	"printWidth": 120,
	"htmlWhitespaceSensitivity": "css",
	"endOfLine": "lf",
	"singleAttributePerLine": false
}
```

**Common Validation Examples:**

```bash
# Validate specific files by type
make validate-html src/book/unit1/1-1.html
make validate-css src/book/style.css
make validate-mermaid src/book/unit1/1-1.html

# Fix and restore operations
make fix-html src/book/unit1/1-1.html
make restore-mermaid-entities src/book/unit1/

# Utility commands
make clean-tmp                # Clean temporary files and backups
make help                     # Show all available commands
```

### Mobile-First Testing Standards

**Device Testing Requirements:**

- **Primary Testing:** Always test on mobile devices (≤390px) BEFORE desktop
- **Progress Elements:** Verify progress bar text visibility at all screen edges
- **Typography:** Ensure `clamp()` scaling works properly across breakpoints
- **Touch Targets:** Validate 44px minimum touch target size for all interactive elements
- **Navigation:** Test hamburger menu functionality and sidebar behavior
- **Floating Elements:** Check z-index hierarchy and text visibility in overlays

**File-Type Specific Validation:**

**HTML Files (.html):**

- Use `make validate-html [path]` for structure validation with html-validate
- Use `make fix-html [path]` for combined formatting and validation
- Automatically validates semantic structure, void elements, and ARIA labels
- Validates Mermaid diagrams embedded in HTML if present

**Mermaid Diagrams:**

- Use `make validate-mermaid [path]` for diagram syntax validation
- Use `make restore-mermaid-entities [path]` when HTML entities break validation
- **Critical:** HTML entities (`&quot;`, `&gt;`, etc.) in script tags are valid HTML but break Mermaid parsing

**CSS Files (.css):**

- Use `make validate-css [path]` for style validation with stylelint
- Focus on mobile-first responsive design patterns
- Validate CSS Grid implementations and media queries

**JavaScript Files (.js):**

- Use `make validate-js [path]` for code validation with eslint
- Validates ES6+ module architecture and class-based patterns

### Content Header Standards

All topic content pages must follow a standardized header structure for consistency and optimal user experience:

**Mandatory HTML Structure:**

```html
<div class="topic-content">
	<header class="topic-header" aria-label="Header">
		<h1 class="topic-title">Unit X.Y: Topic Title</h1>
		<p class="topic-intro">
			Comprehensive introduction explaining the topic scope and learning objectives.
		</p>
	</header>
	<section class="content-section">
		<!-- Topic content here -->
	</section>
</div>
```

**Critical Layout Requirements:**

- **Flexbox Column Layout:** The `.topic-header` element MUST use `display: flex` with `flex-direction: column` to ensure proper vertical stacking
- **Required Elements:** Every topic page MUST include both `h1.topic-title` and `p.topic-intro` elements within the header
- **Proper Order:** The introduction paragraph must always be positioned directly below the title (never side-by-side)
- **CSS Structure:** Use `order: 1` for title and `order: 2` for intro to guarantee proper positioning
- **Mobile Responsiveness:** Headers must scale properly on mobile devices with appropriate touch targets

**Sticky Mini Header Functionality:**

- The application automatically creates a persistent mini header when users scroll past the main topic header
- This provides continuous context by showing only the topic title in a compact, sticky format
- The mini header uses `z-index: var(--z-page-navigation)` to appear above other content while scrolling
- Responsive design ensures proper positioning on both desktop and mobile devices

**CSS Requirements:**

- Use `.topic-title` for main page titles with responsive font sizing using `clamp()`
- Use `.topic-intro` (not `.lead`) for introductory paragraphs below the title
- Ensure flexbox column layout so introduction always appears directly below the title
- Apply proper semantic heading hierarchy (`h1`, `h2`, `h3`) throughout content
- Main sections should use `h2` headings, subsections use `h3`, and so on

### Mandatory Quality Checks

Before considering any implementation complete, verify:

1. **Mobile Functionality:** All features work properly on mobile devices (≤390px)
2. **Navigation Flow:** Sequential navigation respects hierarchical structure
3. **Progress Accuracy:** Progress bars reflect actual completion state
4. **Search Integration:** Search works across all content types
5. **Performance:** Fast loading and smooth interactions
6. **TypeScript Validation:** All code passes `pnpm run check` without errors
7. **Component Quality:** Proper SvelteKit component structure and TypeScript interfaces
8. **Build Success:** `pnpm run build` completes without errors or warnings
