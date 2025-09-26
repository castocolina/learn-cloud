# SvelteKit Guide: Technical Architecture & Development Standards

This comprehensive guide covers the complete technical architecture, development standards, and user experience guidelines for the Cloud-Native Learning Platform.

> **📚 Related Documentation:**
>
> - [CLAUDE.md](CLAUDE.md) - Core project rules and agent implementation guidelines
> - [CONTENT-STANDARDS.md](CONTENT-STANDARDS.md) - Content creation workflows and quality assurance standards

---

## CRITICAL TESTING REQUIREMENT

**🚨 MANDATORY**: All agents modifying web assets (HTML, CSS, JS, Svelte components) **MUST**:

1. **Execute complete validation cycle** after any changes:

   ```bash
   pnpm run format   # Code formatting (mandatory first step)
   pnpm run check    # SvelteKit validation
   pnpm run lint     # Code quality
   pnpm run dev      # Development server test
   ```

2. **Continue testing until ZERO errors** are achieved
3. **Document any persistent issues** as inline comments in affected components
4. **Update this document** when discovering new architectural requirements

**Rationale**: Tailwind CSS v4 + Svelte 5 combination has specific compatibility requirements that cause runtime failures if not properly validated.

---

## TECHNICAL ARCHITECTURE

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

**Svelte 5 Critical Syntax** (Common Migration Errors):

```typescript
// ✅ CORRECT Svelte 5 Runes
let count = $state(0);
const doubled = $derived(count * 2);
let { title, items = [] }: Props = $props();

// ❌ DEPRECATED Svelte 4 Syntax
export let title;
$: doubled = count * 2;
```

**Code Quality Requirements**:

```typescript
// ✅ CORRECT: Clean imports, no unused variables
import { Button } from "$lib/components/ui/button";
import { ChevronRight } from "lucide-svelte";

// ❌ INCORRECT: Unused imports, deprecated components
import { Button } from "$lib/components/ui/button";
import { AlertTriangle } from "lucide-svelte"; // Deprecated! Use TriangleAlert
import { Card } from "$lib/components/ui/card"; // Unused import
```

**Styling**: Tailwind CSS v4 with **Modular Architecture**

- **CRITICAL**: Follow modular CSS architecture detailed in [CSS Architecture Standards](#css-architecture-standards)
- **NEVER**: Use `<style>` blocks with `@apply` in Svelte components
- **Reason**: [Official Tailwind recommendation](https://tailwindcss.com/docs/compatibility#vue-svelte-and-astro) to avoid performance issues
- Single CSS import: `@import "tailwindcss";`
- CSS-based configuration using `@theme` directive
- Centralized component styles in `src/app.css`

**UI Components**: `shadcn-svelte`

- **Installation**: `pnpm dlx shadcn-svelte@latest add [component-name]`
- **Priority**: Always check component library before building custom components
- **Mandatory Usage**: Progress bars and modal dialogs MUST use shadcn components
  - Progress: Use `shadcn-svelte` Progress component instead of custom progress bars
  - Modals: Use `shadcn-svelte` Dialog component instead of custom modal implementations
- Copy-paste component system with full customization
- Built on Bits UI primitives for accessibility
- Tailwind CSS integration for theming

**shadcn-svelte Component Handling Strategy**:

- **❌ Do NOT document**: shadcn-svelte components directly (they are third-party code)
- **❌ Do NOT format**: Components in `src/lib/components/ui/` are excluded from Prettier formatting
- **✅ Do validate**: TypeScript validation still applies to ensure code quality
- **✅ General documentation**: CSS patterns, z-index hierarchies, and architectural decisions belong in this guide
- **✅ Component-specific issues**: Document in custom wrapper components or this architecture guide
- **⚠️ Updates**: When updating shadcn-svelte components, any custom documentation would be lost

**Icons**: `lucide-svelte`

- **Usage**: Import specific icons as Svelte components
- **Note**: Some icons were renamed (e.g., `AlertTriangle` → `TriangleAlert`)

**Theme Management**: Robust dark mode system with localStorage persistence

- **Components**: `ThemeToggle.svelte` component using shadcn-svelte DropdownMenu and Button
- **Store**: `src/lib/stores/theme.ts` with Svelte writable stores for reactive theme state
- **Themes**: Support for 'light', 'dark', and 'system' preference modes
- **Persistence**: localStorage integration with automatic system preference detection
- **Integration**: Positioned in demo layout header to the right of breadcrumbs

#### Theme System Architecture

**Implementation Details:**

**Theme Store (`src/lib/stores/theme.ts`)**:

- **Type Definition**: `Theme = 'light' | 'dark' | 'system'`
- **Reactive State**: Uses Svelte `writable` stores for real-time theme updates
- **System Detection**: Automatically detects OS dark/light preference via `prefers-color-scheme`
- **DOM Integration**: Applies theme by adding/removing `light`/`dark` classes on `<html>` element
- **Persistence**: Saves user preference to localStorage and restores on page load

**ThemeToggle Component (`src/lib/components/ThemeToggle.svelte`)**:

- **UI Framework**: Built with shadcn-svelte DropdownMenu and Button components
- **Icons**: Uses lucide-svelte Sun, Moon, and Monitor icons
- **Visual Feedback**: Shows active theme with small primary-colored indicator dot
- **Accessibility**: Proper ARIA labels and keyboard navigation support

**CSS Variables Integration**:

- **Root Variables**: Comprehensive light/dark theme variables defined in `src/app.css`
- **Automatic Application**: Theme class on `<html>` element triggers CSS variable switching
- **shadcn-svelte Compatibility**: Full integration with shadcn design system colors

**Usage Pattern**:

```typescript
import { themeStore, setTheme, resolvedTheme } from "$lib/stores/theme";

// In Svelte components, use auto-subscription
$: currentTheme = $themeStore; // 'light' | 'dark' | 'system'

// Set theme using utility function
setTheme("dark");

// Get resolved theme (system resolves to actual preference)
$: actualTheme = $resolvedTheme; // 'light' | 'dark'
```

#### CSS Architecture Standards

**MANDATORY: Modular CSS Architecture for SvelteKit Components**

**Core Principle**: All custom component styles MUST be organized in modular CSS files and imported into `src/app.css`

**Required File Structure**:

```
src/styles/
├── components.css      # Custom Svelte component styles
├── utilities.css       # Custom utility classes
├── layout.css         # SvelteKit layout-specific styles
├── variables.css      # Custom CSS variables and theme tokens
└── overrides.css      # shadcn-svelte customizations (minimal use)
```

**CSS Import Order in `src/app.css`**:

```css
@import "tailwindcss";
@import "./styles/variables.css";    # Theme variables first
@import "./styles/components.css";   # Component styles
@import "./styles/utilities.css";    # Utility classes
@import "./styles/layout.css";      # Layout styles
@import "./styles/overrides.css";   # shadcn overrides (if needed)
/* shadcn-svelte theme variables follow */
```

**SvelteKit Component Integration Rules**:

- ✅ **ALWAYS** define custom styles in separate CSS files with `@layer components`
- ✅ **ALWAYS** use semantic class names with project prefixes (`app-`, `lesson-`, `quiz-`)
- ✅ **ALWAYS** import styles via `src/app.css` for global availability
- ✅ **ALWAYS** use CSS custom properties for theming consistency
- ❌ **NEVER** put custom component styles directly in `src/app.css`
- ❌ **NEVER** use `<style>` blocks in Svelte components with `@apply` (Tailwind v4 incompatible)
- ❌ **NEVER** use inline styles in Svelte component templates

**SvelteKit-Specific Benefits**:

- ✅ Single CSS bundle with optimal build performance
- ✅ Global class availability across all routes and components
- ✅ Eliminates Tailwind v4 + Svelte compatibility issues
- ✅ Better maintainability with modular organization
- ✅ Consistent theming across component library integrations

**Z-Index Hierarchy Standards (CRITICAL ISSUE PREVENTION)**:

**Global Z-Index Hierarchy**: All components MUST use CSS custom properties for z-index values to prevent stacking context violations.

```css
/* Define in src/app.css */
:root {
	--z-base: 1;
	--z-dropdown: 10;
	--z-sticky: 50;
	--z-sidebar: 90;
	--z-header: 100;
	--z-overlay: 200;
	--z-modal: 210;
	--z-popover: 300;
	--z-toast: 400;
}

/* ✅ CORRECT: Use CSS custom properties */
.demo-header-sticky {
	z-index: var(--z-header);
}

/* ❌ INCORRECT: Hardcoded z-index values */
.demo-header-sticky {
	z-index: 50;
}
```

**Stacking Context Issue Prevention**:

- **Root Cause**: Transform properties on navigation items create new stacking contexts
- **Symptoms**: Modals/dialogs appearing behind active sidebar navigation items
- **Prevention**: Use `margin` instead of `transform` for visual positioning
- **Solution**: Always use shadcn-svelte Dialog components with proper z-index hierarchy
- **Avoid**: `transform`, `opacity < 1`, `filter`, or `position: relative` with z-index on navigation items

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

#### Unified TypeScript Architecture (`src/lib/types/`)

**🎯 CRITICAL**: The `src/lib/types/` directory is the **architectural foundation** of the entire project. All types must be managed through this centralized system for refactoring safety and scalability.

**📁 Type System Structure**:

```
src/lib/types/
├── index.ts          # 🎯 Single entry point (ALWAYS import from here)
├── types.ts          # 🔧 Core union types (base system)
├── navigation.ts     # 🧭 Complete navigation architecture
├── content.ts        # 📚 Educational content definitions
├── search.ts         # 🔍 Advanced search system
├── interactive.ts    # 🎮 Interactive components
├── educational.ts    # 🎓 Educational resources
├── learning.ts       # 📊 Analytics & progress tracking
└── rich-text.ts      # ✨ Secure rich text system
```

**🛤️ SvelteKit Path Aliases** (configured in `svelte.config.js`):

```typescript
// ✅ PREFERRED: Use dedicated aliases for clean imports
import type { ContentType } from "$types"; // → src/lib/types
import { Button } from "$lib/components/ui"; // → src/lib/components/ui
import { SETTINGS } from "$config/settings.js"; // → src/config
import { demoData } from "$data"; // → src/data

// ✅ ALTERNATIVE: Standard SvelteKit aliases
import type { ContentType } from "$lib/types"; // → src/lib/types
import { utilities } from "$lib/utils"; // → src/lib/utils
```

**🚀 Critical Import Pattern**:

```typescript
// ✅ ALWAYS: Import from unified entry point using $types alias
import type { ContentType, NavigationItem, QuizContent, RichParagraph } from "$types";

// ✅ ALTERNATIVE: Using $lib/types (also valid)
import type { ContentType } from "$lib/types";

// ❌ NEVER: Direct file imports (breaks refactoring)
import type { ContentType } from "$lib/types/types.js";
import type { NavigationItem } from "$lib/types/navigation.js";
```

**🏗️ Union Type-First Architecture**:

```typescript
// Performance-optimized union types (zero runtime overhead)
export type ContentStatus = "scaffold" | "draft" | "final";
export type ChapterType = "lesson" | "study_guide" | "quiz";

// Constants for iteration (see CONTENT-STANDARDS.md for complete definitions)
export const CONTENT_STATUSES: ContentStatus[] = ["scaffold", "draft", "final"];
```

**🔗 Domain Integration**: See CONTENT-STANDARDS.md and PLAN-SEARCH-ARCHITECTURE.md for complete interfaces.

**🛠️ Refactoring Steps**:

1. Add union type in `types.ts`
2. Create interface in domain file
3. Export through `index.ts`
4. Import from `$lib/types`

**🔒 Type Safety**: Built-in type guards available for runtime validation.

**📋 REFACTORING BEST PRACTICES**:

- **Extend, Don't Modify**: Use `extends` for new features (maintains compatibility)
- **Domain Separation**: Group types by domain (navigation, content, search, interactive)
- **Union Types > Enums**: Zero runtime overhead for SvelteKit performance
- **Constant Arrays**: Use const arrays for iteration instead of `Object.values()`

**🚨 CRITICAL REFACTORING RULES**:

1. **Always Import from Index**: `import type {} from '$types'` or `'$lib/types'` only
2. **Extend, Don't Replace**: Use `extends` to maintain compatibility
3. **Union Types First**: Zero runtime overhead for SvelteKit performance
4. **Type Guards Required**: Runtime validation for complex interfaces

**🔧 REFACTORING WORKFLOW**:

**Before**: `pnpm run check && pnpm run lint && pnpm run format`
**During**: Update types.ts → domain files → index.ts → update imports to use `$types`
**After**: Validate with mandatory cycle above

**📄 Documentation Updates**: Update SVELTEKIT-GUIDE.md, PLAN-SEARCH-ARCHITECTURE.md, CONTENT-STANDARDS.md as needed.

**🎯 CRITICAL INTEGRATION NOTES**:

- **Search System**: All search interfaces must extend from `src/lib/types/search.ts` (see PLAN-SEARCH-ARCHITECTURE.md)
- **Navigation**: All navigation components use `src/lib/types/navigation.ts`
- **Content**: Educational content follows `src/lib/types/content.ts` patterns (see CONTENT-STANDARDS.md)
- **Interactive**: Quiz/interactive elements use `src/lib/types/interactive.ts` (see CONTENT-STANDARDS.md)

**Component Implementation Example**:

```typescript
// Minimal component example with $types alias
<script lang="ts">
  import type { NavigationItem, ComponentState } from '$types';

  interface Props {
    navItem: NavigationItem;
    onStateChange?: (state: ComponentState) => void;
  }

  let { navItem, onStateChange }: Props = $props();

  function updateState(newState: ComponentState) {
    onStateChange?.(newState);
  }
</script>
```

**Key Benefits of Unified Type Architecture**:

- **Zero Runtime Overhead**: Union types compile away completely in SvelteKit
- **Refactoring Safety**: Type-safe renames across entire codebase
- **Single Source of Truth**: Eliminates hardcoded strings and duplicated types
- **IDE Integration**: Full autocomplete and validation support
- **Performance**: Smaller bundle size than union-based approaches

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

The project uses a centralized configuration pattern to manage global application parameters through `src/config/settings.ts`. Configuration types are now centralized in the unified type system at `src/lib/types/config.ts` for consistency with the project's architectural standards.

**Configuration File Structure:**

```typescript
// src/config/settings.ts
import type { AppSettings } from "$types";

// Export a single, constant object with all settings.
export const SETTINGS: AppSettings = {
	mermaid: {
		debug: true, // Enabled for development - provides detailed error logging
		modalPagePercent: 90
	},
	flipCard: {
		modalPagePercent: 90
	},
	ui: {
		breadcrumb: {
			showIcon: true
		},
		sidebar: {
			collapsible: true,
			defaultCollapsed: false
		}
	}
	// ... additional configuration sections
};

// Note: AppSettings type is now centralized in src/lib/types/config.ts
// and can be imported via: import type { AppSettings } from "$types";
```

**Type Definitions:**

Configuration types are defined in `src/lib/types/config.ts` and exported through the unified type system:

```typescript
// Import configuration types
import type { AppSettings } from "$types";

// Type guards are also available
import { isAppSettings, isMermaidConfig } from "$types";
```

**Usage in Components:**

```typescript
// In any Svelte component
import { SETTINGS } from "$config/settings.js";

// Access configuration values
const debugMode = SETTINGS.mermaid.debug;
const modalPercent = SETTINGS.mermaid.modalPagePercent;

// Use in reactive statements
let debugEnabled = $derived(
	debug || // Component prop
		$page.url.searchParams.has("debug") || // URL parameter
		SETTINGS.mermaid.debug // Global setting
);

// Type-safe access to nested configuration
const sidebarConfig = SETTINGS.ui.sidebar;
const shouldCollapse = sidebarConfig.collapsible && sidebarConfig.defaultCollapsed;
```

**Benefits:**

- **Type Safety**: TypeScript interfaces ensure configuration integrity
- **Centralized Control**: Single source of truth for all settings
- **Developer Experience**: Auto-completion and error detection
- **Maintainability**: Easy to extend with new configuration groups
- **Import Consistency**: Standard `$config/settings.js` import path

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

**Data-Driven Approach**: All demo content stored in TypeScript files within `src/data/demo/` for easy identification and cleanup. Use `$data` alias for cleaner imports (`$data` → `src/data/`).

**Key Structure**:

- `$data/demo/types.ts` - TypeScript interfaces for demo components
- `$data/demo/navigation/` - Sidebar and breadcrumb configuration
- `$data/demo/content/` - Demo units and component examples
- `$data/demo/config/` - Route definitions and feature flags

**Import Examples:**

```typescript
// ✅ PREFERRED: Using $data alias
import { demoSidebarMenu } from "$data/demo/navigation/demo-sidebar-menu";
import { searchIndex } from "$data/demo/search/search-index";

// ✅ ALTERNATIVE: Direct path (less preferred)
import { demoSidebarMenu } from "src/data/demo/navigation/demo-sidebar-menu";
```

**Core Interfaces**: `DemoUnit`, `DemoLesson`, `ComponentDemo` with full TypeScript support.

**Organization Strategy**:

- Prefix-based naming (`demo-*`) for easy identification
- Isolated dependencies in separate namespace
- Hash-based SPA navigation without page redirects
- Cleanup commands available for future removal

## Global Navigation Architecture

### Overview

**Centralized Navigation System**: Seamless lesson-to-lesson navigation with URL synchronization, progress tracking, and mobile-optimized controls.

### Key Components

#### Navigation Store (`src/lib/stores/navigation.ts`)

- **State Management**: `NavigationState` and `FlattenedLesson` interfaces
- **Reactive Integration**: SvelteKit derived store with `$page` integration
- **Features**: URL parsing, lesson sequencing, automatic progress calculation

#### FloatingNav Component (`src/lib/components/demo/FloatingNav.svelte`)

- **Persistent UI**: Bottom-screen navigation with backdrop blur
- **Accessibility**: ARIA labels, keyboard navigation (Ctrl+Arrow keys)
- **Mobile Optimized**: Touch targets (44px+), responsive design

#### Swipe Gesture Action (`src/lib/actions/swipe.ts`)

- **Touch Navigation**: Mobile swipe gestures for lesson traversal
- **Configuration**: Threshold, velocity, and debounce parameters

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

### Testing & Future Extensions

**Testing Strategy**:

- Component testing with navigation store URL parsing
- Integration testing for cross-component synchronization
- Headless testing using Chromium for consistency
- Screenshot naming: `./tmp/screenshot/YYYYMMDD-HHMMSS-reason.png`

**Planned Enhancements**:

- Progress persistence and lesson bookmarking
- Navigation history and search integration
- Per-lesson note-taking capabilities

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

---

## USER EXPERIENCE STANDARDS

### Mobile-First Design

**Responsive Breakpoints**:

- **Mobile**: ≤390px (primary target)
- **Tablet**: ≤768px
- **Desktop**: ≥1024px

**Design Principles**:

- Touch targets minimum 44px
- Progressive enhancement
- Fast loading with optimized bundles

### Interactive Components

**Learning Flow**:

1. Unit Overview → Lesson Content → Study Guides → Quizzes
2. Progress tracking with visual indicators
3. Accessible navigation with keyboard support

**Modal System**:

- Fullscreen on mobile (100vh x 100vw)
- Large modals on desktop (90-95% viewport)
- Escape key support and focus management
- **MANDATORY**: Use `shadcn-svelte` Dialog component for all modal implementations

**Navigation Standards**:

- **Sidebar Accordion**: Only one unit can be open at a time (accordion behavior)
- **Breadcrumb Navigation**: Dynamic breadcrumbs based on current content state:
  - Home view: Site title only
  - Unit view: Unit name with home link
  - Chapter view: Unit name and chapter name
- **Cursor Indicators**: All interactive elements must have `cursor-pointer` styling

**Quiz System**:

- **Explanation Timing**: Explanations are withheld until quiz completion
- **Results Display**: Comprehensive review with all answers and explanations shown after completion
- **Progress Tracking**: Use standardized Progress component for quiz completion tracking

**Theming Standards**:

- **Color Palette**: Primary theme uses Tailwind CSS slate palette for consistency
- **Code Blocks**: Enhanced with visible container borders (`border-slate-300`) and theme-aligned backgrounds (`bg-slate-50`)
- **Icon Consistency**: All metadata icons (Prerequisites, Learning Objectives) use consistent `text-slate-500` coloring
- **Component Styling**: Standardized styling across all interactive components with consistent hover states and transitions

---

## DEVELOPMENT STANDARDS

### Component Development Rules

- **TypeScript Interfaces**: All component props must use TypeScript interfaces
- **shadcn-svelte Priority**: Check component library before building custom components
- **Mobile-First Development**: Always design and test mobile experience first
- **CSS Architecture**: Follow modular CSS patterns defined in this guide

### Code Quality Standards

- **Three-Tiered Validation Strategy**: Performance-optimized approach for efficient development workflow:
  - **Tier 1 (Local WIP - Fast ~5-15s):** `make check-wip` or `pnpm run check:wip` - validates only modified/untracked files with prettier and eslint
  - **Tier 2 (Code Quality - Moderate ~30-45s):** `pnpm run format` + `pnpm run lint` - complete project formatting and linting
  - **Tier 3 (Comprehensive - Slower ~1-3m):** `pnpm run test` + `pnpm run check` - unit tests and complete TypeScript/SvelteKit validation
- **Zero Tolerance Policy**:
  - **NO TypeScript errors** - All code must pass TypeScript validation
  - **NO TypeScript warnings** - Address all compiler warnings before completion
  - **NO unused variables** - Remove unused imports/variables unless explicitly requested by user or required by ShadCN components
  - **NO deprecated components** - Avoid deprecated Lucide icons and other library components
- **Error Handling**: Implement comprehensive error boundaries and fallbacks
- **Performance**: Optimize bundle size and runtime performance
- **Accessibility**: Ensure WCAG compliance and keyboard navigation

### Security Considerations

- **Secure by Default**: All code and architectural patterns designed with security first
- **No Exposed Secrets**: Never commit or log sensitive information
- **Production Ready**: All examples must be robust and production-ready

---

## COMMON TROUBLESHOOTING

### Tailwind CSS v4 Issues

**Problem**: Build failures with `Cannot apply unknown utility class`
**Solution**:

1. Move custom styles to modular CSS files in `src/styles/`
2. Use `@layer components` for custom classes
3. Never use `@apply` in Svelte component `<style>` blocks

### Svelte 5 Migration Issues

**Problem**: Deprecated syntax errors and code quality issues
**Solution**:

- Replace `export let` with `let { prop }: Props = $props()`
- Replace `$:` reactivity with `$derived()` or `$effect()`
- Use `$state()` for reactive variables
- Remove all unused variables and imports
- Update deprecated Lucide icons (e.g., `AlertTriangle` → `TriangleAlert`)
- Address all TypeScript warnings and errors before completion

### Performance Issues

**Common Problems**:

- Large bundle sizes from unused component imports
- Inefficient reactivity patterns
- Missing optimization for production builds

**Solutions**:

- Use selective imports from component libraries
- Implement proper error boundaries
- Optimize images and assets for web delivery

---

## MODERN DEVELOPMENT PATTERNS & STANDARDS

This section documents the established modern development patterns used throughout the project. These patterns ensure consistency, performance, and maintainability across all scripts and components.

### Prettier Integration Patterns

**Central Formatting Utility**: All file writing operations use the centralized `writeFormattedFile()` utility:

```typescript
// ✅ PREFERRED: Use writeFormattedFile utility
import { writeFormattedFile } from "$lib/utils/prettier-writer";

await writeFormattedFile(outputPath, JSON.stringify(contentObject), {
	compress: false // Use standard formatting for readability
});
```

**Configuration Resolution**: The utility automatically resolves `.prettierrc` configuration:

```typescript
// Automatic .prettierrc integration
const config = await prettier.resolveConfig(process.cwd());
const formatted = await prettier.format(content, {
	...config,
	filepath: filePath // Ensures correct parser selection
});
```

**Anti-Patterns to Avoid**:

```typescript
// ❌ DEPRECATED: Manual formatting with hardcoded indentation
writeFileSync(path, JSON.stringify(obj, null, 2));

// ❌ DEPRECATED: Custom formatting functions
const formatted = formatTypeScriptValue(content);
```

**Production vs Development Modes**:

```typescript
// Debug mode: compressed output for performance
await writeFormattedFile(path, content, { compress: true });

// Development mode: readable formatting (default)
await writeFormattedFile(path, content);
```

### Settings Configuration Patterns

**Modern Destructuring Pattern**: Extract specific settings sections for cleaner code:

```typescript
// ✅ PREFERRED: Settings destructuring for readability
const { validation: validationSettings } = SETTINGS.scripts;
const { mermaid: mermaidSettings } = validationSettings;

// Use specific settings
const maxFiles = mermaidSettings.maxParallelFiles;
```

**Performance Optimization in Tests**: Override global settings for test efficiency:

```typescript
// Global setting (src/config/settings.ts): enabled for manual execution
scripts: {
	validation: {
		generated: {
			runAfterGeneration: true; // Global default
		}
	}
}

// Test override: disabled for performance
const testSettings = {
	...SETTINGS,
	scripts: {
		...SETTINGS.scripts,
		validation: {
			...SETTINGS.scripts.validation,
			generated: {
				...SETTINGS.scripts.validation.generated,
				enabled: false // Test-specific override
			}
		}
	}
};
```

**Dynamic Settings for Test Isolation**:

```typescript
// Generate unique config IDs to prevent race conditions
const configId = generateConfigId(validationPrefix, testSuiteId);
const tempSettings = createTempValidationConfig(configId, testSettings);
```

### Test Isolation & TestSetup Patterns

**TestSetup Class Architecture**: Standardized test isolation pattern used across all test suites:

```typescript
class TestSetup {
	public tempDir: string;
	public configId: string;
	public readonly testSuiteId: string;

	constructor(testSuiteId: string = "main") {
		const timestamp = Date.now();
		const uniqueId = `${testSuiteId}-${timestamp}`;

		// Unique temporary directory
		this.tempDir = join(process.cwd(), "tmp", `test-${uniqueId}`);

		// Unique config ID for validation settings
		this.configId = generateConfigId("test-prefix", testSuiteId);

		this.testSuiteId = testSuiteId;
	}

	async setup(): Promise<void> {
		// Create isolated test environment
		await ensureDir(this.tempDir);
		await this.createTestFiles();
	}

	async cleanup(): Promise<void> {
		// Clean up temporary resources
		await remove(this.tempDir);
		await cleanupTempValidationConfig(this.configId);
	}
}
```

**Usage Pattern in Tests**:

```typescript
describe("Script Tests", () => {
	let testSetup: TestSetup;

	beforeEach(async () => {
		testSetup = new TestSetup("unique-suite-id");
		await testSetup.setup();
	});

	afterEach(async () => {
		await testSetup.cleanup();
	});

	it("should execute with isolation", async () => {
		// Test uses testSetup.tempDir and testSetup.configId
		// No interference with other parallel tests
	});
});
```

**Race Condition Prevention**: Unique identifiers prevent parallel test conflicts:

```typescript
// Each test gets unique resources
const timestamp = Date.now();
const randomId = Math.random().toString(36).substring(7);
const uniqueId = `${testSuiteId}-${timestamp}-${randomId}`;
```

### Type Safety & Import Patterns

**Centralized Type Imports**: Use `$types` alias for consistent type imports:

```typescript
// ✅ PREFERRED: Centralized type imports
import type { ContentType, LessonContent, QuizContent, NavigationItem } from "$types";

// ✅ ALTERNATIVE: Direct lib import (also valid)
import type { ContentType } from "$lib/types";

// ❌ DEPRECATED: Direct file imports
import type { ContentType } from "$lib/types/types.js";
```

**Content Data Imports**: Use `$data` alias for content structure:

```typescript
// ✅ PREFERRED: Content data imports
import { demoContent } from "$data/demo/content";
import { navigationMenu } from "$data/demo/navigation/demo-sidebar-menu";

// Path resolution in configuration
const dataPath = "$data/book"; // Resolves to src/data/book
```

**Union Type Consistency**: Maintain type safety across the application:

```typescript
// Consistent union types from centralized definitions
type ChapterType = "lesson" | "quiz" | "exam" | "project" | "study-guide";
type ContentStatus = "scaffold" | "draft" | "final";
```

### Service Layer Architecture Patterns

**Separation of Concerns**: Clear boundaries between CLI, services, and utilities:

```typescript
// CLI Layer: Orchestration only
class ContentCreatorCLI {
    constructor(
        private validationService: ValidationService,
        private repositoryService: RepositoryService
    ) {}

    async createContent(options: CreateOptions): Promise<void> {
        const content = await this.acquireContent(options);
        const validation = await this.validationService.validate(content);

        if (validation.success) {
            await this.repositoryService.writeFile(options.path, content);
        }
    }
}

// Service Layer: Business logic
class ValidationService {
    async validate(content: ContentObject): Promise<ValidationResult> {
        // 1. Zod schema validation
        // 2. Business rules validation
        // 3. Content-specific validation (Mermaid, etc.)
        return { success: boolean, errors: string[] };
    }
}

// Utility Layer: Pure functions
export function validateMermaidSyntax(definition: string): MermaidValidationResult {
    // Pure function with no side effects
    return { isValid: boolean, error?: string };
}
```

**Shared Service Integration**: Services used by both automation and manual flows:

```typescript
// Scaffold flow uses shared services
const scaffoldContent = generatePlaceholderContent();
const validation = await validationService.validate(scaffoldContent);
await repositoryService.writeFile(path, scaffoldContent);

// CRUD flow uses same services
const userContent = parseUserInput(input);
const validation = await validationService.validate(userContent);
await repositoryService.writeFile(path, userContent);
```

### Error Prevention & Path Resolution Patterns

**Path Duplication Prevention**: Always check for absolute paths before joining:

```typescript
// ✅ CORRECT: Prevent path duplication
constructor(inputFile?: string) {
    this.projectRoot = process.cwd();
    const inputPath = inputFile || defaultPath;

    // Critical: Check if path is already absolute
    this.inputPath = isAbsolute(inputPath)
        ? inputPath
        : join(this.projectRoot, inputPath);
}

// ❌ INCORRECT: Creates /home/user/.../home/user/... paths
this.inputPath = join(this.projectRoot, inputFile);
```

**Safe File Operations**: Comprehensive error handling with recovery:

```typescript
async function safeFileOperation(path: string, operation: () => Promise<void>): Promise<void> {
	try {
		await ensureDir(dirname(path));
		await operation();
	} catch (error) {
		console.error(`Failed to process ${path}:`, error.message);

		// Attempt recovery
		if (error.code === "ENOENT") {
			await ensureDir(dirname(path));
			await operation(); // Retry once
		} else {
			throw error; // Re-throw if not recoverable
		}
	}
}
```

**Validation Pipeline Patterns**: Structured error collection and reporting:

```typescript
interface ValidationResult {
	success: boolean;
	errors: string[];
	warnings?: string[];
}

async function validateContent(content: ContentObject): Promise<ValidationResult> {
	const errors: string[] = [];

	// Schema validation
	const schemaResult = validateSchema(content);
	if (!schemaResult.success) {
		errors.push(...schemaResult.errors);
	}

	// Content-specific validation
	if (content.diagrams) {
		for (const diagram of content.diagrams) {
			const mermaidResult = validateMermaidSyntax(diagram.definition);
			if (!mermaidResult.isValid) {
				errors.push(`Invalid Mermaid syntax: ${mermaidResult.error}`);
			}
		}
	}

	return { success: errors.length === 0, errors };
}
```

### Integration Guidelines

**Consistent Pattern Application**: All new scripts and components should follow these patterns:

1. **Use `writeFormattedFile()` for all output formatting**
2. **Implement TestSetup class for test isolation**
3. **Use settings destructuring for configuration access**
4. **Import types from `$types` alias for consistency**
5. **Implement proper error handling with path resolution checks**
6. **Follow service layer architecture for business logic separation**

**Migration from Legacy Patterns**: When updating existing code:

1. Replace manual `JSON.stringify()` with `writeFormattedFile()`
2. Extract hardcoded paths to settings configuration
3. Add TestSetup pattern to existing test suites
4. Update type imports to use centralized aliases
5. Implement proper error recovery patterns

These patterns ensure maintainability, testability, and consistency across the entire codebase while leveraging modern TypeScript and tooling capabilities.
