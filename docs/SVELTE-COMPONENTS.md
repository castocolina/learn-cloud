# SvelteKit Components & Types Guide

**Component development patterns, TypeScript architecture, configuration, and navigation for the Cloud-Native Learning Platform.**

> **📚 Navigation:**
>
> - [← Back to Index](./SVELTEKIT-INDEX.md)
> - [← Previous: Styling](./SVELTE-STYLING.md) | [Next: Development →](./SVELTE-DEVELOPMENT.md)

---

## COMPONENT DEVELOPMENT

### TypeScript Interface Standards

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

### Unified TypeScript Architecture (`src/lib/types/`)

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
├── rich-text.ts      # ✨ Secure rich text system
└── config.ts         # ⚙️ Configuration types
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
4. Import from `$lib/types` or `$types`

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

**📄 Documentation Updates**: Update SVELTEKIT-INDEX.md, PLAN-SEARCH-ARCHITECTURE.md, CONTENT-STANDARDS.md as needed.

**🎯 CRITICAL INTEGRATION NOTES**:

- **Search System**: All search interfaces must extend from `src/lib/types/search.ts` (see PLAN-SEARCH-ARCHITECTURE.md)
- **Navigation**: All navigation components use `src/lib/types/navigation.ts`
- **Content**: Educational content follows `src/lib/types/content.ts` patterns (see CONTENT-STANDARDS.md)
- **Interactive**: Quiz/interactive elements use `src/lib/types/interactive.ts` (see CONTENT-STANDARDS.md)
- **Configuration**: Settings types in `src/lib/types/config.ts`

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
- **Performance**: Smaller bundle size than enum-based approaches

### Svelte 5 Reactive Collections: SvelteMap and SvelteSet

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

### Component Architecture Patterns

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

### Custom vs Third-Party Components

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

---

## GLOBAL CONFIGURATION STRATEGY

### Centralized Settings Architecture

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
- `ui`: UI component configurations (sidebar, breadcrumb, modals)
- `scripts`: Script and tooling configurations
- `api`: API endpoints, timeouts, retry logic (future)
- `performance`: Lazy loading, caching configuration (future)

---

## GLOBAL NAVIGATION ARCHITECTURE

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

---

## Related Guides

- **Previous**: [SVELTE-STYLING.md](./SVELTE-STYLING.md) - CSS architecture and layout patterns
- **Next**: [SVELTE-DEVELOPMENT.md](./SVELTE-DEVELOPMENT.md) - Development patterns and testing
- **Also See**: [CONTENT-STANDARDS.md](../CONTENT-STANDARDS.md) - Content type definitions

---

**[← Back to Index](./SVELTEKIT-INDEX.md)**
