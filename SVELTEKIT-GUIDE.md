# SvelteKit Guide

**Common Theme Adjustments:**

- **Dark Mode Support**: Add CSS variables for dark theme variants
- **Custom Colors**: Extend theme with brand-specific color palette
- **Typography Scale**: Configure font sizes and line heights
- **Spacing System**: Customize spacing scale for component consistency

**Troubleshooting Theme Issues:**

```bash
# If build fails after theme changes
pnpm run check  # Check TypeScript errors
pnpm run build  # Verify production build
```

**Important Notes:**

- Never use `@apply` in Svelte component `<style>` blocks with Tailwind v4
- All custom styles must be in `src/app.css` using `@layer components`
- Theme variables must be defined in the `@theme` directive for Tailwind v4 compatibility

### Project Architecture

#### Core Technology Stack

**Framework**: SvelteKit with Svelte 5

- Component-based architecture with Svelte 5 runes for state management
- TypeScript support for type safety and developer experience
- Static site generation for GitHub Pages deployment

**Styling**: Tailwind CSS v4 with Centralized Architecture

- Single CSS import: `@import "tailwindcss";`
- CSS-based configuration using `@theme` directive
- Centralized component styles in `src/app.css`

**UI Components**: shadcn-svelte

- Copy-paste component system with full customization
- Built on Bits UI primitives for accessibility
- Tailwind CSS integration for theming

#### File Structure Deep Dive

```
src/
├── app.html                 # HTML template (root document)
├── app.css                  # Centralized CSS architecture
├── data/                    # Content data (TypeScript format)
│   ├── types.ts            # TypeScript interfaces with inheritance
│   └── content-menu.ts     # Generated navigation structure
├── lib/
│   └── components/
│       ├── content/        # Content renderer components
│       │   ├── LessonRenderer.svelte
│       │   ├── QuizRenderer.svelte
│       │   └── StudyGuideRenderer.svelte
│       ├── ui/             # shadcn-svelte UI components
│       │   ├── button/
│       │   ├── card/
│       │   ├── dialog/
│       │   └── sidebar/
│       └── shared/         # Shared utility components
├── routes/                 # SvelteKit routes (file-based routing)
│   ├── +page.svelte       # Homepage
│   ├── +layout.svelte     # Root layout
│   └── demo/              # Demo route (to be created)
└── bash/                  # Development scripts
    └── setup.sh           # Environment setup script
```

#### Key Files Explained

**`app.html`** - HTML Document Template

- Root HTML structure for the entire application
- Contains `%sveltekit.head%` and `%sveltekit.body%` placeholders
- Defines meta tags, favicons, and global HTML attributes

**`app.css`** - Centralized CSS Architecture

```css
@import "tailwindcss";

@layer components {
	.component-class {
		@apply flex items-center gap-2;
	}
}
```

- Single Tailwind CSS v4 import
- All component styles using `@layer components`
- Theme configuration via `@theme` directive

**`+page.svelte`** - Page Components

- Represents individual routes in file-based routing
- Contains page-specific logic and UI
- Can export `load` functions for data fetching

**`+layout.svelte`** - Layout Components

- Wraps pages with common UI elements
- Defines shared state and navigation
- Inherited by child routes

#### The `src/lib` Directory Strategy

The `lib` directory serves as the component library and utility hub:

**`src/lib/components/`** - Component Organization

- **`content/`**: Educational content renderers (LessonRenderer, QuizRenderer, StudyGuideRenderer)
- **`ui/`**: shadcn-svelte UI components (buttons, cards, modals, forms)
- **`shared/`**: Reusable utility components (icons, loading states, error boundaries)

**Best Practices for `src/lib`**:

- Use TypeScript interfaces for all component props
- Follow single responsibility principle
- Create composable, reusable components
- Maintain clear naming conventions (PascalCase for components)

### Component Development

#### TypeScript Interface Standards

**Svelte 5 Runes Syntax** (Critical):

```typescript
<!-- ✅ CORRECT Svelte 5 Runes -->
<script lang="ts">
  interface Props {
    title: string;
    items?: string[];
  }

  let count = $state(0);
  const doubled = $derived(count * 2);
  let { title, items = [] }: Props = $props();
</script>

<!-- ❌ DEPRECATED Svelte 4 Syntax -->
<script lang="ts">
  export let title: string;
  export let items: string[] = [];
  $: doubled = count * 2;
</script>
```

#### Enum-First TypeScript Patterns

**Critical Architecture Pattern**: Use TypeScript enums as the single source of truth for all string values. Never use hardcoded strings in components, types, or logic.

**Content Type System**:

```typescript
// src/data/types.ts - Core type system with enums

export enum ContentStatus {
	SCAFFOLD = "scaffold",
	DRAFT = "draft",
	FINAL = "final"
}

export enum ChapterType {
	LESSON = "lesson",
	STUDY_GUIDE = "study_guide",
	QUIZ = "quiz",
	EXAM = "exam",
	PROJECT = "project"
}

export enum ContentSection {
	INTRODUCTION = "introduction",
	THEORY = "theory",
	PRACTICE = "practice",
	ASSESSMENT = "assessment",
	SUMMARY = "summary"
}

export enum ProgressStatus {
	NOT_STARTED = "not_started",
	IN_PROGRESS = "in_progress",
	COMPLETED = "completed",
	REVIEW = "review"
}

// Base interfaces using enums
export interface ContentMetadata {
	id: string;
	title: string;
	status: ContentStatus;
	type: ChapterType;
	created: string;
	lastModified: string;
	author: string;
	tags: string[];
}

export interface Section {
	id: string;
	title: string;
	type: ContentSection;
	content: string;
	order: number;
}

export interface LessonContent {
	metadata: ContentMetadata;
	sections: Section[];
	prerequisites?: string[];
	learningObjectives: string[];
}

export interface QuizContent extends LessonContent {
	questions: Question[];
	timeLimit?: number;
	passingScore: number;
}

export interface ProgressTracking {
	contentId: string;
	status: ProgressStatus;
	completedSections: string[];
	score?: number;
	timeSpent: number;
	lastAccessed: string;
}
```

**Enum-Based Component Props**:

```typescript
// Component implementation using enum constraints
<script lang="ts">
  import { ContentStatus, ChapterType } from '$data/types.js';
  import type { LessonContent } from '$data/types.js';

  interface Props {
    content: LessonContent;
    onComplete?: (status: ContentStatus) => void;
    displayMode?: ChapterType;
  }

  let { content, onComplete, displayMode = ChapterType.LESSON }: Props = $props();

  // Type-safe status updates using enums
  function updateStatus(newStatus: ContentStatus) {
    onComplete?.(newStatus);
  }

  // Conditional rendering based on enum values
  let isQuizMode = $derived(displayMode === ChapterType.QUIZ);
  let isStudyMode = $derived(displayMode === ChapterType.STUDY_GUIDE);
</script>
```

**Enum-Based Routing and Navigation**:

```typescript
// src/lib/utils/routing.ts
export enum AppRoute {
  HOME = "/",
  UNITS = "/units",
  LESSONS = "/lessons",
  QUIZZES = "/quizzes",
  PROGRESS = "/progress",
  SETTINGS = "/settings"
}

export enum LessonRoute {
  OVERVIEW = "overview",
  CONTENT = "content",
  PRACTICE = "practice",
  ASSESSMENT = "assessment"
}

// Type-safe URL generation
export function generateLessonUrl(unitId: string, lessonId: string, section: LessonRoute): string {
  return `${AppRoute.LESSONS}/${unitId}/${lessonId}#${section}`;
}

// Component usage
<script lang="ts">
  import { AppRoute, LessonRoute } from '$lib/utils/routing.js';

  let currentRoute = $derived(AppRoute.LESSONS);
  let currentSection = $derived(LessonRoute.CONTENT);
</script>
```

**Benefits of Enum-First Approach**:

- **Type Safety**: Compile-time validation of all string values
- **Refactoring**: Easy to rename values across entire codebase
- **Autocomplete**: IDE suggestions for all valid options
- **Consistency**: Single source of truth prevents typos
- **Documentation**: Enums serve as living documentation
- **Validation**: Runtime validation using enum values

### **Svelte 5 Reactive Collections: SvelteMap and SvelteSet**

**Critical: Use Svelte's Reactive Collections for State Management**

When working with collections (Map, Set) inside Svelte 5 `$state`, use `SvelteMap` and `SvelteSet` instead of regular `Map` and `Set` to ensure proper reactivity.

**Problem with Regular Collections**:

```typescript
// ❌ INCORRECT: Regular Map in $state doesn't trigger reactivity on mutations
let state = $state({
	answers: new Map<string, unknown>()
});

function updateAnswer(id: string, value: unknown) {
	state.answers.set(id, value); // ❌ Doesn't trigger reactivity
}
```

**Solution with SvelteMap**:

```typescript
// ✅ CORRECT: SvelteMap triggers reactivity on mutations
import { SvelteMap } from "svelte/reactivity";

let state = $state({
	answers: new SvelteMap<string, unknown>()
});

function updateAnswer(id: string, value: unknown) {
	state.answers.set(id, value); // ✅ Triggers reactivity automatically
}
```

**Import Pattern**:

```typescript
import { SvelteMap, SvelteSet } from "svelte/reactivity";

// Use in component state
let quizState = $state({
	answers: new SvelteMap<string, unknown>(),
	selectedOptions: new SvelteSet<string>()
});
```

**Derived Reactivity with SvelteMap**:

```typescript
// Derived values automatically update when SvelteMap changes
let questionsAnswered = $derived(
	!quizState.isStarted ? 0 : quiz.questions.filter((q) => quizState.answers.has(q.id)).length
);

let progressPercentage = $derived(
	!quizState.isStarted ? 0 : (questionsAnswered / quiz.questions.length) * 100
);
```

**TypeScript Interface Support**:

```typescript
interface QuizState {
	currentQuestionIndex: number;
	answers: SvelteMap<string, unknown>; // ✅ Properly typed
	selectedOptions: SvelteSet<string>; // ✅ Properly typed
	isStarted: boolean;
}
```

**When to Use SvelteMap/SvelteSet**:

- ✅ When collections are part of component state (`$state`)
- ✅ When you need reactive updates on collection mutations
- ✅ When derived values depend on collection contents
- ✅ When collections are passed between components as props

**Benefits**:

- **Automatic Reactivity**: Mutations trigger component re-renders
- **Derived Value Updates**: `$derived` expressions update when collections change
- **Type Safety**: Full TypeScript support with proper generics
- **Performance**: Optimized for Svelte's reactive system

#### Component Architecture Patterns

**Single Responsibility Components**:

```svelte
<!-- Good: Focused component -->
<script lang="ts">
	interface Props {
		isOpen: boolean;
		onClose: () => void;
		title: string;
	}

	let { isOpen, onClose, title }: Props = $props();
</script>

<Dialog {isOpen} {onClose}>
	<DialogTitle>{title}</DialogTitle>
	{@render children()}
</Dialog>
```

**Event-Driven Communication**:

```typescript
// Parent component
let quizCompleted = $state(false);

function handleQuizComplete(score: number) {
	quizCompleted = true;
	console.log("Quiz completed with score:", score);
}

// Child component emits events
const dispatch = createEventDispatcher<{
	complete: { score: number };
}>();

function completeQuiz() {
	dispatch("complete", { score: 85 });
}
```

#### Custom vs Third-Party Components

**Decision Matrix**:

1. **Always Check shadcn-svelte First**:

   ```bash
   # Check available components
   pnpm dlx shadcn-svelte@latest add --help

   # Install specific component
   pnpm dlx shadcn-svelte@latest add button
   ```

2. **Build Custom When**:
   - Specific educational functionality (flashcards, progress tracking)
   - Complex content rendering (Mermaid diagrams, code blocks)
   - Unique interaction patterns not covered by UI libraries

3. **Integration Strategy**:

   ```svelte
   <!-- Extend shadcn components -->
   <script lang="ts">
   	import { Button } from "$lib/components/ui/button";

   	interface Props {
   		variant?: "primary" | "secondary" | "quiz";
   	}

   	let { variant = "primary" }: Props = $props();
   </script>

   <Button class={`quiz-button ${variant === "quiz" ? "quiz-specific-styles" : ""}`} {...restProps}>
   	{@render children()}
   </Button>
   ```

### Global Configuration Strategy

#### Centralized Settings Architecture

The project uses a centralized configuration pattern to manage global application parameters through `src/config/settings.ts`. This approach provides type-safe, organized settings that can be imported throughout the application.

**Configuration File Structure:**

```typescript
// src/config/settings.ts

// Defines the structure for the application settings for type safety.
interface AppSettings {
	mermaid: {
		debug: boolean;
		// Add more Mermaid-specific settings here as needed
	};
	// Future settings can be grouped here (e.g., api, ui, performance)
}

// Export a single, constant object with all settings.
export const SETTINGS: AppSettings = {
	mermaid: {
		debug: true // Enabled for development - provides detailed error logging
	}
};

// Export types for use in other parts of the application
export type { AppSettings };
```

**Usage in Components:**

```typescript
// In any Svelte component
import { SETTINGS } from "$config/settings";

// Access configuration values
const debugMode = SETTINGS.mermaid.debug;

// Use in reactive statements
let debugEnabled = $derived(
	debug || // Component prop
		$page.url.searchParams.has("debug") || // URL parameter
		SETTINGS.mermaid.debug // Global setting
);
```

**Benefits:**

- **Type Safety**: TypeScript interfaces ensure configuration integrity
- **Centralized Control**: Single source of truth for all settings
- **Developer Experience**: Auto-completion and error detection
- **Maintainability**: Easy to extend with new configuration groups
- **Import Consistency**: Standard `$config/settings` import path

**Configuration Groups:**

Organize settings by functional area:

- `mermaid`: Diagram rendering and debug settings
- `api`: API endpoints, timeouts, retry logic (future)
- `ui`: Theme preferences, animation settings (future)
- `performance`: Lazy loading, caching configuration (future)

### Theming & Styling

#### Tailwind CSS v4 Integration

**Critical Architecture Rule**: All component styles MUST be in `src/app.css` using `@layer components`. Never use `<style>` blocks with `@apply` in Svelte components.

**Centralized CSS Approach**:

```css
/* src/app.css */
@import "tailwindcss";

@theme {
	--color-primary: #0f172a;
	--color-secondary: #475569;
	--color-accent: #3b82f6;
}

@layer components {
	.lesson-container {
		@apply mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-sm;
	}

	.quiz-question {
		@apply mb-4 rounded-md border border-slate-200 p-4;
	}

	.flashcard-grid {
		@apply grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4;
	}

	.modal-overlay {
		@apply fixed inset-0 z-50 flex items-center justify-center bg-black/50;
	}
}
```

**Component Usage**:

```svelte
<!-- ✅ CORRECT: Use global classes -->
<div class="lesson-container">
	<h1 class="text-2xl font-bold text-slate-800">Lesson Title</h1>
</div>

<!-- ❌ CAUSES BUILD FAILURES -->
<style lang="postcss">
	.local-class {
		@apply flex; /* Incompatible with Tailwind v4 + Svelte */
	}
</style>
```

#### Theme Customization Strategy

**CSS-Based Theme Configuration**:

```css
@theme {
	/* Color palette */
	--color-primary-50: #f8fafc;
	--color-primary-500: #64748b;
	--color-primary-900: #0f172a;

	/* Typography */
	--font-family-sans: "Inter", system-ui, sans-serif;
	--font-size-xs: 0.75rem;
	--font-size-sm: 0.875rem;

	/* Spacing */
	--spacing-xs: 0.5rem;
	--spacing-sm: 0.75rem;

	/* Breakpoints */
	--breakpoint-sm: 390px;
	--breakpoint-md: 768px;
	--breakpoint-lg: 1024px;
}
```

**Mobile-First Responsive Design**:

```css
@layer components {
	.responsive-grid {
		@apply grid grid-cols-1 gap-3;
	}

	@media (min-width: theme(breakpoint.md)) {
		.responsive-grid {
			@apply grid-cols-2 gap-4;
		}
	}

	@media (min-width: theme(breakpoint.lg)) {
		.responsive-grid {
			@apply grid-cols-3 gap-6;
		}
	}
}
```

#### Ensuring Third-Party Component Theme Adoption

**shadcn-svelte Theme Integration**:

1. **Use CSS Variables**:

   ```css
   @theme {
   	--color-background: white;
   	--color-foreground: #0f172a;
   	--color-muted: #f1f5f9;
   	--color-border: #e2e8f0;
   }
   ```

2. **Override Component Styles**:

   ```css
   @layer components {
   	.shadcn-button {
   		@apply bg-primary-500 hover:bg-primary-600 text-white;
   	}

   	.shadcn-card {
   		@apply border-border bg-background;
   	}
   }
   ```

3. **Theme Consistency Pattern**:
   ```typescript
   // Create theme configuration object
   export const theme = {
   	colors: {
   		primary: "hsl(var(--color-primary))",
   		secondary: "hsl(var(--color-secondary))",
   		background: "hsl(var(--color-background))"
   	},
   	fonts: {
   		sans: "var(--font-family-sans)"
   	}
   };
   ```

---

## Demo Implementation Plan

### Demo Data Architecture

The demo implementation follows a **data-driven approach** where all content, navigation, and component configurations are stored in TypeScript files within `src/data/demo/`. This architecture ensures easy identification, modification, and future cleanup of demo assets.

#### Directory Structure

```
src/data/demo/
├── types.ts                    # Demo-specific TypeScript interfaces
├── navigation/
│   ├── sidebar-menu.ts         # Sidebar navigation structure
│   ├── breadcrumbs.ts         # Breadcrumb configuration
│   └── quick-nav.ts           # Quick navigation shortcuts
├── content/
│   ├── units/                 # Demo units (structured like lessons)
│   │   ├── unit-overview.ts   # Demo overview and introduction
│   │   ├── unit-layout.ts     # Layout components showcase
│   │   ├── unit-interactive.ts # Interactive elements showcase
│   │   ├── unit-content.ts    # Content display components
│   │   ├── unit-modals.ts     # Modal system showcase
│   │   ├── unit-educational.ts # Educational tools
│   │   └── unit-integration.ts # Final integration
│   └── components/
│       ├── code-examples.ts   # Code block examples
│       ├── diagram-examples.ts # Mermaid diagram definitions
│       ├── quiz-questions.ts  # Quiz content
│       └── flashcard-data.ts  # Study guide content
├── assets/
│   ├── icons.ts              # Icon mappings and configurations
│   ├── themes.ts             # Theme configuration data
│   └── progress.ts           # Progress tracking configuration
└── config/
    ├── routes.ts             # SPA route definitions
    ├── features.ts           # Feature flags for demo
    └── settings.ts           # Demo-specific settings
```

#### Core TypeScript Interfaces

**Demo Navigation Structure:**

```typescript
// src/data/demo/types.ts
export interface DemoUnit {
	id: string;
	title: string;
	description: string;
	icon: string;
	url: string; // SPA-friendly URL (no redirects)
	order: number;
	status: "draft" | "ready" | "complete";
	lessons: DemoLesson[];
}

export interface DemoLesson {
	id: string;
	title: string;
	description: string;
	icon: string;
	url: string; // SPA-friendly URL fragment
	order: number;
	duration?: string; // Estimated interaction time
	components: string[]; // List of components showcased
	content: DemoContent;
}

export interface DemoContent {
	type: "overview" | "showcase" | "interactive" | "tutorial";
	sections: DemoSection[];
	metadata: {
		created: string;
		lastModified: string;
		author: string;
		tags: string[];
	};
}

export interface DemoSection {
	id: string;
	title: string;
	type: "text" | "component" | "code" | "diagram" | "interactive";
	content: any; // Content varies by type
	order: number;
}
```

**Component Configuration:**

```typescript
// Component-specific interfaces for demo data
export interface ComponentDemo {
	name: string;
	category: "layout" | "interactive" | "content" | "educational";
	description: string;
	props?: Record<string, any>;
	examples: ComponentExample[];
	documentation: string;
}

export interface ComponentExample {
	title: string;
	description: string;
	code: string;
	preview?: boolean;
	interactive?: boolean;
}
```

#### Example Data Implementation

**Sidebar Navigation Data:**

```typescript
// src/data/demo/navigation/sidebar-menu.ts
import type { DemoUnit } from "../types.js";
import {
	Home,
	Layout,
	MousePointer,
	FileText,
	Square,
	GraduationCap,
	Puzzle,
	CheckCircle
} from "lucide-svelte";

export const demoUnits: DemoUnit[] = [
	{
		id: "demo-overview",
		title: "Demo Overview",
		description: "Introduction to the component showcase",
		icon: "Home",
		url: "/demo",
		order: 1,
		status: "ready",
		lessons: [
			{
				id: "introduction",
				title: "Platform Introduction",
				description: "Overview of SvelteKit architecture and demo purpose",
				icon: "Info",
				url: "/demo#introduction",
				order: 1,
				duration: "5 min",
				components: ["Header", "Breadcrumbs", "Navigation"],
				content: {
					/* content definition */
				}
			}
		]
	},
	{
		id: "layout-components",
		title: "Layout Components",
		description: "Headers, sidebars, and navigation patterns",
		icon: "Layout",
		url: "/demo/layout",
		order: 2,
		status: "ready",
		lessons: [
			{
				id: "sticky-header",
				title: "Sticky Header",
				description: "Responsive header with breadcrumbs",
				icon: "Navigation",
				url: "/demo/layout#sticky-header",
				order: 1,
				duration: "3 min",
				components: ["Header", "Breadcrumbs"],
				content: {
					/* content definition */
				}
			},
			{
				id: "collapsible-sidebar",
				title: "Collapsible Sidebar",
				description: "Mobile-responsive sidebar navigation",
				icon: "Sidebar",
				url: "/demo/layout#sidebar",
				order: 2,
				duration: "4 min",
				components: ["Sidebar", "Navigation"],
				content: {
					/* content definition */
				}
			}
		]
	}
	// ... additional units
];
```

**Component Examples Data:**

```typescript
// src/data/demo/content/components/code-examples.ts
export const codeExamples = [
	{
		id: "sveltekit-component",
		title: "SvelteKit Component with Runes",
		language: "typescript",
		category: "component",
		description: "Modern Svelte 5 component using runes syntax",
		code: `<script lang="ts">
  interface Props {
    title: string;
    items?: string[];
  }

  let count = $state(0);
  const doubled = $derived(count * 2);
  let { title, items = [] }: Props = $props();

  function handleClick() {
    count++;
  }
</script>

<div class="component-container">
  <h2>{title}</h2>
  <p>Count: {count}, Doubled: {doubled}</p>
  <button onclick={handleClick}>Increment</button>

  {#each items as item}
    <div class="item">{item}</div>
  {/each}
</div>`,
		tags: ["svelte", "typescript", "runes", "component"]
	}
	// ... additional examples
];
```

#### Asset Organization Strategy

**Modular Architecture for Easy Management:**

1. **Prefix-based Organization**: All demo files use `demo-` prefix for easy identification
2. **Isolated Dependencies**: Demo-specific types and utilities in separate namespace
3. **Clean Separation**: Demo assets don't interfere with main application logic
4. **Easy Cleanup**: All demo files can be identified and removed via glob patterns

**Cleanup Commands:**

```bash
# Remove all demo data (future cleanup)
find src/data -name "*demo*" -type f -delete
rm -rf src/data/demo/

# Remove demo routes
rm -rf src/routes/demo/

# Remove demo-specific CSS classes
grep -l "demo-" src/app.css | xargs sed -i '/\.demo-/d'
```

**Migration Strategy for Permanent Use:**

```typescript
// If demo components become permanent, rename and move:
// src/data/demo/components/ → src/data/components/
// Remove 'demo-' prefixes from class names and file names
// Update imports throughout the application
```

#### SPA Route Configuration

**Hash-based Navigation (No Page Redirects):**

```typescript
// src/data/demo/config/routes.ts
export const demoRoutes = {
	base: "/demo",
	sections: {
		overview: "#overview",
		layout: "#layout",
		interactive: "#interactive",
		content: "#content",
		modals: "#modals",
		educational: "#educational",
		integration: "#integration"
	},
	subsections: {
		"layout.header": "#layout-header",
		"layout.sidebar": "#layout-sidebar",
		"interactive.darkmode": "#interactive-darkmode",
		"interactive.search": "#interactive-search"
		// ... additional subsections
	}
};

// Navigation function for SPA behavior
export function navigateToSection(sectionId: string) {
	const element = document.getElementById(sectionId);
	if (element) {
		element.scrollIntoView({ behavior: "smooth" });
		history.replaceState(null, "", `${demoRoutes.base}#${sectionId}`);
	}
}
```

This data-driven architecture ensures that the demo remains organized, easily maintainable, and ready for future cleanup or integration into the main application.

## Global Navigation Architecture

### Overview

The Global Navigation System provides seamless lesson-to-lesson navigation across the entire learning platform. It acts as a centralized "GPS" that maintains state synchronization between URLs, sidebar navigation, progress tracking, and floating navigation controls.

### Architecture Components

#### Navigation Store (`src/lib/stores/navigation.ts`)

**Core Responsibility**: Central state management for lesson navigation

```typescript
export interface NavigationState {
	flattenedLessons: FlattenedLesson[]; // All lessons in sequential order
	currentLessonIndex: number | null; // Current position in sequence
	previousLessonUrl: string | null; // Previous lesson URL
	nextLessonUrl: string | null; // Next lesson URL
	currentLesson: FlattenedLesson | null; // Current lesson data
	totalLessons: number; // Total lesson count
	completionPercentage: number; // Overall progress percentage
}

export interface FlattenedLesson {
	id: string;
	title: string;
	description: string;
	url: string;
	contentType: string;
	duration: string;
	difficulty: string;
	icon: string;
	unitId: string;
	unitTitle: string;
	unitIcon: string;
	lessonIndex: number; // Index within unit
	globalIndex: number; // Index across all lessons
}
```

**Key Features**:

- **Reactive State**: Uses SvelteKit's derived store with `$page` integration
- **URL Parsing**: Handles both hash-based (`#/demo/unit/id/lesson/id`) and route-based (`/demo/mermaid`) navigation
- **Lesson Sequencing**: Creates flattened, ordered list from hierarchical sidebar menu
- **Progress Calculation**: Automatic completion percentage based on current position

#### FloatingNav Component (`src/lib/components/demo/FloatingNav.svelte`)

**Core Responsibility**: Persistent navigation UI at bottom of screen

**Features**:

- **Semi-transparent Design**: Backdrop blur with transparency for content visibility
- **Previous/Next Buttons**: Disabled states when at sequence boundaries
- **Progress Indicator**: Visual progress bar with "X of Y" display
- **Keyboard Navigation**: Ctrl+Arrow keys for power users
- **Mobile Optimization**: Responsive design with proper touch targets (44px+)
- **Accessibility**: ARIA labels, screen reader support, keyboard navigation

**Implementation Pattern**:

```svelte
<!-- Only show when on a lesson page -->
{#if $navigation.currentLesson}
	<nav class="floating-nav" role="navigation" aria-label="Lesson navigation">
		<div class="floating-nav-container">
			<Button disabled={!$navigation.previousLessonUrl} onclick={goToPrevious}>
				<ChevronLeft size={16} />
				<span class="floating-nav-text">Previous</span>
			</Button>

			<!-- Progress indicator -->
			<div class="floating-nav-progress">
				<span>{$navigation.currentLessonIndex + 1} of {$navigation.totalLessons}</span>
				<div class="floating-nav-progress-bar">
					<div style:width="{$navigation.completionPercentage}%"></div>
				</div>
			</div>

			<Button disabled={!$navigation.nextLessonUrl} onclick={goToNext}>
				<span class="floating-nav-text">Next</span>
				<ChevronRight size={16} />
			</Button>
		</div>
	</nav>
{/if}
```

#### Swipe Gesture Action (`src/lib/actions/swipe.ts`)

**Core Responsibility**: Mobile touch navigation for lesson traversal

**Configuration Parameters**:

- `threshold: 80px` - Minimum swipe distance
- `velocity: 0.2px/ms` - Minimum swipe speed
- `verticalTolerance: 120px` - Maximum vertical movement during horizontal swipe
- `debounceTime: 500ms` - Prevent rapid-fire navigation

**Touch Event Handling**:

```typescript
export function navigationSwipe(node: HTMLElement, options: Partial<SwipeOptions> = {}) {
	const swipeOptions: SwipeOptions = {
		threshold: 80,
		velocity: 0.2,
		verticalTolerance: 120,
		debounceTime: 500,
		onSwipeLeft: () => navigateToNext(), // Swipe left = next lesson
		onSwipeRight: () => navigateToPrevious(), // Swipe right = previous lesson
		...options
	};

	return swipe(node, swipeOptions);
}
```

### Integration Pattern

#### Layout Integration (`src/routes/demo/+layout.svelte`)

**Global Integration Strategy**:

```svelte
<script lang="ts">
	import { FloatingNav } from "$lib/components/demo";
	import { navigationSwipe } from "$lib/actions/swipe.js";
</script>

<!-- Apply swipe action to main content area -->
<main class="demo-layout-main demo-layout-main--with-floating-nav" use:navigationSwipe>
	{@render children()}
</main>

<!-- Floating navigation (globally available) -->
<FloatingNav />

<style>
	.demo-layout-main--with-floating-nav {
		/* Content-safe padding to prevent floating nav overlap */
		padding-bottom: 120px; /* Desktop */
	}

	@media (max-width: 480px) {
		.demo-layout-main--with-floating-nav {
			padding-bottom: 140px; /* Mobile - larger touch targets */
		}
	}
</style>
```

### Navigation Flow

#### URL-Based State Synchronization

1. **URL Change** → SvelteKit `$page` store updates
2. **Store Derivation** → Navigation store parses new URL
3. **State Update** → All components reactively update
4. **UI Synchronization** → Sidebar active state, progress bars, floating nav all update automatically

#### Lesson Transition Sequence

```typescript
// Example navigation flow
function navigateToNext() {
	const nav = $navigation;
	if (nav.nextLessonUrl) {
		if (nav.nextLessonUrl.startsWith("#")) {
			// Hash-based navigation (SPA behavior)
			window.location.hash = nav.nextLessonUrl.slice(1);
		} else {
			// Route-based navigation (SvelteKit routing)
			goto(nav.nextLessonUrl);
		}
	}
}
```

### State Management Philosophy

#### Reactive Architecture

- **Single Source of Truth**: Navigation store is the authoritative state
- **Derived State**: All UI components derive state from central store
- **Automatic Updates**: URL changes automatically propagate to all navigation elements
- **No Manual Synchronization**: Components don't need to manually update each other

#### URL as State Container

- **Bookmarkable**: Any lesson can be directly accessed via URL
- **Shareable**: URLs can be shared and maintain exact navigation state
- **History-Aware**: Browser back/forward buttons work correctly
- **Deep Linking**: Direct links to specific lessons work seamlessly

### Performance Considerations

#### Optimization Strategies

- **Lazy Loading**: Navigation functions loaded on-demand to avoid circular dependencies
- **Minimal Re-renders**: Derived stores only update when necessary
- **Touch Optimization**: Debounced touch handlers prevent rapid navigation
- **CSS Transitions**: Hardware-accelerated animations for smooth interactions

#### Memory Management

- **Store Cleanup**: Automatic subscription cleanup in component destroy
- **Event Listener Cleanup**: Touch event listeners properly removed
- **Minimal State**: Only essential navigation data stored in memory

### Accessibility Features

#### Keyboard Navigation

- **Ctrl + Left Arrow**: Navigate to previous lesson
- **Ctrl + Right Arrow**: Navigate to next lesson
- **Focus Management**: Proper focus handling during navigation
- **Screen Reader Support**: ARIA labels and live regions for progress updates

#### Mobile Accessibility

- **Touch Targets**: Minimum 44px touch targets (48px on mobile)
- **Gesture Tolerance**: Forgiving swipe detection with configurable thresholds
- **Visual Feedback**: Clear indication of navigation state and progress
- **Reduced Motion**: Respects user's motion preferences

### Testing Strategy

#### Component Testing

```typescript
// Example test for navigation store
import { navigationStore } from "$lib/stores/navigation.js";
import { page } from "$app/stores";

test("navigation store updates on URL change", async () => {
	// Simulate URL change
	page.set({ url: new URL("/demo/mermaid", "http://localhost") });

	// Verify navigation state
	const nav = get(navigationStore);
	expect(nav.currentLesson?.id).toBe("demo-lesson-showcase-1");
	expect(nav.currentLessonIndex).toBe(0);
	expect(nav.nextLessonUrl).toBe("/demo/code-examples");
});
```

#### Integration Testing

- **Cross-Component Sync**: Verify sidebar and floating nav stay synchronized
- **Mobile Gestures**: Test swipe functionality across different devices
- **URL Handling**: Test both hash-based and route-based navigation patterns
- **Edge Cases**: Test navigation at sequence boundaries (first/last lessons)

#### Headless Testing Configuration

**Browser for Testing**: Use Chromium for headless testing and screenshots

```bash
# Headless screenshot capture
chromium-browser --headless --disable-gpu \
  --screenshot="/tmp/screenshot/test_screenshot.png" \
  --window-size=1200,800 "http://localhost:5174/demo"

# Why Chromium over Firefox:
# - Better headless mode stability in containerized environments
# - More reliable screenshot generation
# - Fewer snap/permission issues in development containers
# - Consistent rendering across different environments
```

**Screenshot Naming Conventions**:

All screenshots must be saved using the standardized naming format to prevent read issues later:

```bash
# REQUIRED FORMAT: ./tmp/screenshot/$(date +%Y%m%d-%H%M%S)-reason.png
./tmp/screenshot/20250921-122828-navbar-before-fix.png
./tmp/screenshot/20250921-122843-navbar-after-fix.png
./tmp/screenshot/20250921-123015-mobile-responsive-test.png

# Generate screenshots with proper naming
DATE_TIME=$(date +%Y%m%d-%H%M%S)
chromium-browser --headless --disable-gpu \
  --screenshot="./tmp/screenshot/${DATE_TIME}-your-reason-here.png" \
  --window-size=1200,800 "http://localhost:5174/demo"
```

**Browser Compatibility Issues**:

**Firefox/Chromium Issues Encountered:**

- Firefox snap package has permission issues accessing `/tmp/` directory for screenshot generation
- Firefox headless mode occasionally fails to render certain CSS backdrop-filter effects properly
- Chromium provides more consistent headless screenshot generation across different environments
- Firefox requires additional configuration for proper font rendering in headless mode

**Recommended Browser Priority:**

1. **Chromium** (Primary): Most reliable for automated testing and screenshot generation
2. **Google Chrome** (Secondary): Good for manual testing and debugging
3. **Firefox** (Tertiary): Manual testing only, avoid for automated workflows due to snap issues

**Common Testing Commands**:

```bash
# Basic functionality test
curl -s "http://localhost:5174/demo" | head -20

# Check server status and logs
pnpm run dev  # Check for compilation errors

# Screenshot comparison testing with proper naming
DATE_TIME=$(date +%Y%m%d-%H%M%S)
chromium-browser --headless --disable-gpu \
  --screenshot="./tmp/screenshot/${DATE_TIME}-before-changes.png" \
  --window-size=1200,800 "http://localhost:5174/demo"

# Mobile screenshot testing
chromium-browser --headless --disable-gpu \
  --screenshot="./tmp/screenshot/${DATE_TIME}-mobile-view.png" \
  --window-size=390,844 "http://localhost:5174/demo"
```

### Future Extensions

#### Planned Enhancements

- **Progress Persistence**: Save navigation state to localStorage
- **Lesson Bookmarks**: Allow users to bookmark favorite lessons
- **Navigation History**: Track user's lesson completion path
- **Search Integration**: Navigate directly to lessons from search results
- **Lesson Notes**: Per-lesson note-taking with navigation integration

This architecture provides a robust, scalable foundation for lesson navigation that maintains state consistency across all components while providing an intuitive user experience on both desktop and mobile devices.

The demo route (`/demo`) will showcase all integrated components through a systematic, incremental build process. Each step adds specific functionality while maintaining the existing architecture.

#### Target Component Set

**Navigation & Layout**:

- Sticky header with breadcrumbs
- Collapsible sidebar (sidecard)
- Mobile-responsive navigation

**Interactive Elements**:

- Dark mode toggle with system preference detection
- Search box with live filtering
- Progress indicators and navigation buttons

**Content Display**:

- Mermaid diagrams with various chart types
- Syntax-highlighted code blocks
- Interactive flip cards for concepts
- Modal dialogs for detailed information

**Educational Components**:

- Quiz interface with timer and scoring
- Study guide flashcards
- Progress tracking visualizations
