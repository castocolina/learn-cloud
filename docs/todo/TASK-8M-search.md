# TASK 8M: Search Component Development

## Objective

Develop search component development following DOCS/SVELTE-INDEX.md patterns with mobile-first design (≤390px) and comprehensive testing.

## Dependencies

**Requires:**

- TASK 8A: Breadcrumb (completed)
- TASK 8C: Table of Contents (completed)
- TASK 8E: Dialog (completed)
- TASK 8L: Navigation coordinator (completed)

**Referenced by:**

- TASK-8M-tests.md (test development for this component)
- Subsequent tasks that build upon this component

## Deliverables

- [ ] src/lib/stores/dialog.ts
- [ ] src/lib/utils/navigation.ts
- [ ] src/lib/components/search/SearchBox.svelte
- [ ] src/lib/components/search/SearchResults.svelte
- [ ] src/lib/components/search/SearchBox.svelte
- [ ] Mobile-first validation (≤390px tested BEFORE desktop)
- [ ] TypeScript compliance (0 errors, 0 warnings)
- [ ] Component tests passing (see TASK-8M-tests.md)

---

## Implementation Details

### Agent Responsibility

You are responsible for developing comprehensive search functionality using the pre-built Lunr.js index from `src/data/generated/search-index.ts` with Dialog (8E) for results display, and **integration with multiple navigation components (Sidebar 8A, Breadcrumb 8C, Navigation 8L)** for coordinated updates, following DOCS/SVELTE-INDEX.md patterns.

You must think harder about the multi-component navigation integration to ensure that when a user clicks a search result, all relevant components update simultaneously and consistently. You must also ensure that the search experience is mobile-optimized (≤390px) with a focus on usability and accessibility (keyboard shortcuts, focus management). You must implement debounced search input to optimize performance and display results grouped by content type (lesson, quiz, study_guide, etc.). Integration with Dialog (8E) for displaying results is essential.

Before implement you must review the pre-built Lunr.js index structure to ensure it contains all necessary metadata for enriching search results (titles, descriptions, tags, URLs), checks the current src/data/book and ensure they match expected formats. You must also ensure that the search component integrates seamlessly with the unified navigation system (8L) to coordinate updates across Sidebar (8A), Breadcrumb (8C), and Progress (8K) when navigating to selected content.

### Technical Documents to Review

- `DOCS/SVELTE-INDEX.md` (Svelte 5 syntax and component standards)

- `src/data/generated/search-index.ts` (pre-built Lunr.js index with 5,579 lines, 129 searchable items)

- `src/lib/stores/dialog.ts` (from Task 8E - for results display)

- `PLAN-SEARCH-ARCHITECTURE.md` (search specifications and unified navigation)

- `src/lib/utils/navigation.ts` (unified navigation handler from 8L)

### Prerequisites

From `PLAN-TODO-FEATURES.md`:

- Task 8A: Sidebar Component completed

- Task 8C: Breadcrumb Component completed

- Task 8E: Dialog Component completed

- Task 8L: General Navigation Component completed

### Implementation Details

**Pre-built Search Index:**

The search index is already generated with complete metadata:

- 129 searchable items

- Pre-built Lunr.js index (lunrIndexData export)

- Complete metadata (searchIndexMetadata with titles, descriptions, tags, etc.)

**Component Structure:**

1. `SearchBox.svelte` - Input component with debounced search

2. `SearchResults.svelte` - Results component for Dialog display

3. Use Dialog from Task 8E (openDialog, closeDialog)

**Key Features:**

- Load pre-built Lunr index on mount: `lunr.Index.load(lunrIndexData)`

- Display results grouped by content type (lesson, quiz, study_guide, etc.)

- **Navigate using Navigation (8L)**: Use `navigateToContent()` to coordinate all component updates

- Keyboard shortcuts (Ctrl/Cmd+K to focus, Escape to close)

- Mobile-optimized results display (≤390px)

**Multi-Component Navigation Integration:**

When user clicks a search result, the navigation MUST update:

1. **Dialog (8E)**: Close search results modal

2. **Sidebar (8A)**: Highlight selected chapter, expand unit

3. **Breadcrumb (8C)**: Update trail to reflect new location

4. **Navigation (8L)**: Coordinate all updates via `navigateToContent()`

5. **Content Area**: Load selected content

6. **URL Hash**: Update to new location

7. **Progress (8K)**: Track visit (via Navigation 8L)

**Search Integration:**

```typescript
// Load pre-built index

import { searchIndexMetadata, lunrIndexData } from "$data/generated/search-index";

import { navigateToContent } from "$lib/utils/navigation";

import { closeDialog } from "$lib/stores/dialog";

import lunr from "lunr";

const searchIndex = lunr.Index.load(lunrIndexData);

const results = searchIndex.search(query);

// Enrich with metadata

const enrichedResults = results.map((result) => {
	const metadata = searchIndexMetadata.items.find((item) => item.id === result.ref);

	return { ...result, metadata };
});

// Display in Dialog

openDialog("Resultados de Búsqueda", SearchResults, {
	props: { query, results: enrichedResults },

	size: "lg"
});

// On result click: Coordinate navigation

function handleResultClick(item: SearchIndexItem) {
	navigateToContent({
		type: "navigate",

		target: item.chapterUrl,

		source: "search",

		data: { unitId: item.unitId, chapterId: item.id, searchQuery: query },

		timestamp: new Date()
	});

	closeDialog(); // Close search modal
}
```

### Subtask: Search Testing Suite

- **Test File**: `src/test/components/search/Search.test.ts`

- **Coverage**:
  - SearchBox rendering and interaction

  - Pre-built index loading

  - Search query execution and results

  - Dialog integration (openDialog called correctly)

  - **Navigation integration** (navigateToContent called, all components updated)

  - Keyboard shortcuts (Ctrl+K, Escape)

  - Mobile display (≤390px)

- **Refactor Protection**: Ensures search accuracy and multi-component navigation coordination

### Expected Output

- `src/lib/components/search/SearchBox.svelte`

- `src/lib/components/search/SearchResults.svelte`

- `src/test/components/search/Search.test.ts`

- Keyboard navigation support (Ctrl+K shortcut)

- Dialog integration for results display

- Navigation (8L) integration for coordinated updates

**Reference Component(s)**:

- **Location**: `src/lib/components/search/SearchBox.svelte`, `src/lib/components/search/SearchResults.svelte`, `src/lib/components/search/SearchModal.svelte`, `src/lib/components/search/SearchFilters.svelte`

- **Usage**: Study existing search implementation patterns, Lunr.js index integration, debounced input handling, result grouping by content type, Dialog modal integration, and keyboard shortcut handling

- **⚠️ CRITICAL**: These are EXISTING production components - DO NOT create new ones

- **⚠️ CRITICAL**: ENHANCE and extend these components for Dialog (8E) and Navigation (8L) integration

- **Implementation Strategy**: Review existing SearchBox/SearchResults implementation, add Dialog integration for results display, implement navigateToContent() for multi-component navigation coordination, enhance keyboard shortcuts (Ctrl/Cmd+K), optimize mobile experience

### Final Validations

- ✅ Pre-built Lunr.js index loads correctly from search-index.ts

- ✅ Results display in Dialog (8E)

- ✅ **Navigation integrates with unified system (8L)**: Sidebar, Breadcrumb, Content ALL update on result click

- ✅ Keyboard shortcuts functional (Ctrl+K, Escape)

- ✅ Mobile-first search experience (≤390px)

- ✅ Results grouped by content type

- ✅ All components update atomically (no partial states)

- ✅ Three-tier validation: `make check-wip` → `pnpm run test` → `pnpm run format/lint/check`

### Deferred Features (Post-MVP)

**SearchModal Functionality (Currently Placeholder)**

- **Current State**: Mobile search shows icon placeholder (disabled button) in StickyHeader

- **Planned**: Full-screen SearchModal for mobile viewports (≤768px)

- **Implementation**:
  - Modal opens on mobile search icon click

  - Full-screen overlay with SearchBox component

  - Proper z-index hierarchy (above header/sidebar)

  - Touch-optimized interaction patterns

- **Dependencies**: Dialog component (8E) pattern can be adapted

- **Priority**: Medium - enhances mobile search UX but not blocking

- **Status**: Deferred to post-initial implementation

- **File**: `src/lib/components/navigation/StickyHeader.svelte:134-142` (placeholder button)

---

---

## Validation Criteria

- [ ] Tier 1: `make check-wip` passes (5-15s) - modified files only
- [ ] Tier 2: Unit tests pass - `pnpm run test src/test/...` (see TASK-8M-tests.md)
- [ ] Tier 3: Full validation - `pnpm run format` && `pnpm run lint` && `pnpm run check`
- [ ] Mobile-first: Tested at ≤390px BEFORE desktop testing
- [ ] TypeScript: 0 errors, 0 warnings
- [ ] Accessibility: Focus management, keyboard navigation, ARIA attributes
- [ ] E2E tests pass: `pnpm run test:e2e src/test/e2e/search.spec.ts`

## References

- **Implementation Guide:** @docs/SVELTE-COMPONENTS.md
- **Development Patterns:** @docs/SVELTE-DEVELOPMENT.md
- **Testing Guide:** @docs/TESTING.md
- **Test Specifications:** TASK-8M-tests.md
- **Architecture:** @docs/SVELTE-ARCHITECTURE.md
- **Styling:** @docs/SVELTE-STYLING.md

---

**Last Updated:** 2025-01-08
**Status:** Ready for implementation
