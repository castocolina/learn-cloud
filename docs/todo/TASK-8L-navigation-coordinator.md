# TASK 8L: General Navigation Component Development (Unified Navigation Coordinator)

## Objective

Develop general navigation component development (unified navigation coordinator) following DOCS/SVELTE-INDEX.md patterns with mobile-first design (≤390px) and comprehensive testing.

## Dependencies

**Requires:**

- TASK 8A: Breadcrumb (completed)
- TASK 8B: Pagination (completed)
- TASK 8C: Table of Contents (completed)
- TASK 8J: Popover (completed)

**Referenced by:**

- TASK-8L-tests.md (test development for this component)
- Subsequent tasks that build upon this component

## Deliverables

- [ ] src/lib/utils/navigation.ts
- [ ] src/lib/stores/navigation.ts
- [ ] src/lib/stores/breadcrumb.ts
- [ ] src/lib/components/demo/DemoSidebar.svelte
- [ ] src/lib/utils/spaNavigation.ts
- [ ] Mobile-first validation (≤390px tested BEFORE desktop)
- [ ] TypeScript compliance (0 errors, 0 warnings)
- [ ] Component tests passing (see TASK-8L-tests.md)

---

## Implementation Details

### Agent Responsibility

You are responsible for developing a **unified navigation system that coordinates and integrates** Sidebar (8A), Header (8B), Breadcrumb (8C), and Popover (8J) components with consistent routing, state management, and **orchestrating navigation events for all components including Progress (8K)**, following DOCS/SVELTE-INDEX.md patterns.

You must think harder about the unified navigation handler to ensure all components update simultaneously and consistently. You must also ensure that navigation events trigger appropriate progress tracking notifications (entry/exit) without direct control over navigation flow. Handling multiple navigation sources (sidebar clicks, search results, breadcrumb clicks, sequential navigation, direct URL access, browser back/forward) is critical for a seamless user experience.

You must provide both, visual buttons (previous/next) and keyboard shortcuts (ArrowLeft/ArrowRight) for sequential navigation. You must ensure deep linking and direct URL access work correctly with hash-based routing. You must also provide page swipe gestures for mobile devices (≤390px) to navigate between chapters. You must show a tooltip/popover on hover/focus for previous/next buttons with chapter titles or show current chapter title. You must ensure no partial navigation states occur (atomic updates) and that all components reflect the current state accurately.

### Technical Documents to Review

- `DOCS/SVELTE-INDEX.md` (Svelte 5 syntax and union-based routing)

- `PLAN-SEARCH-ARCHITECTURE.md` (Unified Navigation System Architecture section)

- Previous Tasks 8A, 8B, 8C, 8J (Sidebar, Header, Breadcrumb, Popover implementations)

- `src/lib/types/navigation.ts` (navigation and routing structure)

### Prerequisites

From `PLAN-TODO-FEATURES.md`:

- Task 8A: Sidebar Component completed

- Task 8B: Sticky Header Component completed

- Task 8C: Breadcrumb Component completed

- Task 8J: Popover Component completed

### Implementation Details

**Role: Unified Navigation Coordinator**

This component is the **central orchestrator** of all navigation in the application:

1. **Unified Handler**: Implements `navigateToContent()` as documented in PLAN-SEARCH-ARCHITECTURE.md

2. **Multi-Component Updates**: Updates ALL navigation components simultaneously:
   - Sidebar (8A) - highlight active chapter

   - Breadcrumb (8C) - update trail

   - Sequential nav - update previous/next links

   - Content area - load new content

   - URL hash - update browser location

   - Progress (8K) - track visit (passive notification)

**Critical: Content Entry/Exit Events**

When navigation occurs, this component MUST:

- Notify Progress (8K) when user enters content (`visitChapter()`)

- Notify Progress (8K) when user exits content (cleanup)

- Update all UI components atomically (no partial states)

**Navigation Sources to Handle:**

1. **Sidebar clicks** (8A)

2. **Search results** (8M)

3. **Breadcrumb clicks** (8C)

4. **Sequential navigation** (previous/next buttons)

5. **Direct URL access** (browser address bar, deep links)

6. **Browser back/forward** (history navigation)

**Implementation Pattern:**

```typescript
// src/lib/utils/navigation.ts

export function navigateToContent(event: NavigationEvent): void {
	const { target, source, data } = event;

	// 1. Update URL hash

	window.location.hash = targetUrl;

	// 2. Update navigation store (Sidebar, Breadcrumb listen)

	navigationStore.update((state) => ({
		...state,

		currentId: chapterId,

		currentPath: targetUrl,

		source
	}));

	// 3. Update breadcrumb trail

	breadcrumbStore.set(generateBreadcrumb(chapterId));

	// 4. Update sequential navigation (previous/next)

	updateSequentialNav(chapterId);

	// 5. Track visit in Progress (PASSIVE NOTIFICATION)

	if (data?.unitId && chapterId) {
		visitChapter(data.unitId, chapterId);
	}

	// 6. Load content (handled by route component)

	dispatchEvent(new CustomEvent("content-load", { detail: { chapterId, url: targetUrl } }));
}
```

### Subtask: Navigation Testing Suite

- **Test File**: `src/test/components/navigation/Navigation.test.ts`

- **Coverage**: Unified handler, multi-component updates, routing consistency, hash handling, progress notifications

- **Refactor Protection**: Ensures navigation consistency across all components during changes

### Expected Output

- `src/lib/utils/navigation.ts` (unified navigation handler)

- `src/lib/stores/navigation.ts` (navigation state store)

- `src/lib/stores/breadcrumb.ts` (breadcrumb state store)

- `src/test/components/navigation/Navigation.test.ts`

- Hash change listener in root layout

- Documentation of navigation event flow

**Reference Component(s)**:

- **Location**: `src/lib/components/demo/DemoSidebar.svelte`, `src/lib/components/demo/FloatingNav.svelte`, `src/lib/components/demo/StickyHeader.svelte`

- **Usage**: Study navigation coordination patterns, state synchronization logic, event handling for multiple sources, and sequential navigation (previous/next) implementations

- **⚠️ CRITICAL**: DO NOT modify original reference files in `src/lib/components/demo/`

- **⚠️ CRITICAL**: DO NOT import reference components directly into production code

- **Implementation Strategy**: Copy navigation event coordination, state store patterns, hash routing logic, and sequential navigation helpers; adapt for unified navigateToContent() handler with atomic multi-component updates

### Final Validations

- ✅ DOCS/SVELTE-INDEX.md compliance verified

- ✅ Unified handler updates ALL components simultaneously

- ✅ All navigation sources handled (sidebar, search, breadcrumb, sequential, direct, back/forward)

- ✅ Progress receives entry/exit notifications correctly

- ✅ Browser back/forward working correctly

- ✅ Deep linking and direct URL access working

- ✅ No partial navigation states (atomic updates)

- ✅ Hash-based routing consistent

- ✅ Three-tier validation: `make check-wip` → `pnpm run test` → `pnpm run format/lint/check`

### TASK 4 Integration Status (Completed by SPA Architecture Implementation)

**✅ IMPLEMENTATION COMPLETE - TASK 8L FOUNDATION READY**

TASK 4 has implemented the complete unified navigation system as documented in PLAN-SEARCH-ARCHITECTURE.md:

**Implemented Components:**

1. **`src/lib/utils/spaNavigation.ts`** - Unified navigation coordinator
   - `navigateToContent()` - Central handler for all navigation sources

   - `navigateToPrevious()` / `navigateToNext()` - Sequential navigation helpers

   - Atomic updates for all navigation components

   - Breadcrumb generation from content-menu

   - Ready for TASK 8K progress tracking integration (visitChapter commented with TODO)

2. **`src/lib/stores/spaNavigation.ts`** - Navigation state management
   - `navigationStore` - Current chapter, previous/next entries, source tracking

   - Derived stores: `currentId`, `hasPrevious`, `hasNext`, `isNavigating`, `navigationError`

3. **`src/lib/stores/breadcrumb.ts`** - Breadcrumb state
   - Automatically updated by `navigateToContent()`

4. **`src/lib/utils/hashRouter.ts`** - Hash-based routing utilities
   - `parseHash()` - Parse URLs to content lookup

   - `navigateToChapter()` - Update hash

   - `getCurrentHash()` / `isValidHash()` - Hash utilities

5. **`src/lib/components/ContentRouter.svelte`** - Content loading and rendering
   - Hash change listener for back/forward navigation

   - Type-based renderer selection

   - Integration with navigation stores

**TASK 8L Requirements Already Met:**

- ✅ Unified `navigateToContent()` handler implemented

- ✅ Multi-component atomic updates (sidebar, breadcrumb, sequential nav, URL hash)

- ✅ Navigation sources supported: direct, sidebar, breadcrumb, sequential, search

- ✅ Browser back/forward via hashchange listener

- ✅ Sequential navigation (previous/next) with helper functions

- ✅ Progress tracking hook ready (TODO comment for TASK 8K integration)

**Integration for TASK 8L Components:**

```typescript

// Sequential Navigation Buttons (Previous/Next)

import { navigationStore } from "$lib/stores/spaNavigation";

import { navigateToPrevious, navigateToNext } from "$lib/utils/spaNavigation";



const navState = $derived($navigationStore);



// Use derived stores for button state

const hasPrev = $derived(navState.previousEntry !== null);

const hasNext = $derived(navState.nextEntry !== null);



// Navigation handlers

<button onclick={navigateToPrevious} disabled={!hasPrev}>← Previous</button>

<button onclick={navigateToNext} disabled={!hasNext}>Next →</button>

```

---

---

## Validation Criteria

- [ ] Tier 1: `make check-wip` passes (5-15s) - modified files only
- [ ] Tier 2: Unit tests pass - `pnpm run test src/test/...` (see TASK-8L-tests.md)
- [ ] Tier 3: Full validation - `pnpm run format` && `pnpm run lint` && `pnpm run check`
- [ ] Mobile-first: Tested at ≤390px BEFORE desktop testing
- [ ] TypeScript: 0 errors, 0 warnings
- [ ] Accessibility: Focus management, keyboard navigation, ARIA attributes
- [ ] E2E tests pass: `pnpm run test:e2e src/test/e2e/navigation-coordinator.spec.ts`

## References

- **Implementation Guide:** @docs/SVELTE-COMPONENTS.md
- **Development Patterns:** @docs/SVELTE-DEVELOPMENT.md
- **Testing Guide:** @docs/TESTING.md
- **Test Specifications:** TASK-8L-tests.md
- **Architecture:** @docs/SVELTE-ARCHITECTURE.md
- **Styling:** @docs/SVELTE-STYLING.md

---

**Last Updated:** 2025-01-08
**Status:** Ready for implementation
