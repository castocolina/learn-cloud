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

### Incremental Build Strategy

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
