# TASK 8J: Popover Component Development

## Objective

Develop popover component development following DOCS/SVELTE-INDEX.md patterns with mobile-first design (≤390px) and comprehensive testing.

## Dependencies

**Requires:**

- TASK 8E: Dialog component (completed - apply z-index lessons learned)

**Referenced by:**

- TASK-8J-tests.md (test development for this component)
- Subsequent tasks that build upon this component

## Deliverables

- [ ] src/lib/components/demo/StickyHeader.svelte
- [ ] Mobile-first validation (≤390px tested BEFORE desktop)
- [ ] TypeScript compliance (0 errors, 0 warnings)
- [ ] Component tests passing (see TASK-8J-tests.md)

---

## Implementation Details

### Agent Responsibility

You are responsible for developing popover components using shadcn-svelte Popover with proper positioning, z-index hierarchy (applying lessons from Dialog 8E), and integration with Progress reset button, following DOCS/SVELTE-INDEX.md standards.

As with Dialog (8E), you must think harder about the z-index hierarchy to prevent stacking context violations and background overlay issues. You must ensure proper positioning with collision detection and mobile-first design with touch-friendly interactions (≥44px touch targets). You must also integrate the popover for the reset confirmation button in the Progress component (8K).

### Technical Documents to Review

- `DOCS/SVELTE-INDEX.md` (Svelte 5 syntax, z-index hierarchy, popover specifications)

- `src/lib/components/ui/` (shadcn-svelte Popover components)

- Review Dialog (8E) implementation for z-index and background issue solutions

### Prerequisites

From `PLAN-TODO-FEATURES.md`:

- Task 8I: Quiz/Exam Navigation Component completed

### Implementation Details

- **Component**: Enhanced shadcn-svelte Popover integration

- **Z-Index Hierarchy**: Use `var(--z-popover)` from global hierarchy

- **Positioning**: Proper positioning with collision detection

- **Mobile-First**: Touch-friendly interactions

- **Dialog Lessons Applied**: Review and apply solutions from Dialog (8E) for background and stacking context issues

- **Progress Integration**: Popover for reset confirmation button in Progress component (8K)

**Critical: Apply Dialog Solutions:**

When developing Popover, review Dialog (8E) implementation for:

1. Z-index hierarchy (no hardcoded values)

2. Stacking context prevention (avoid transform, opacity < 1, filter)

3. Background overlay handling

4. Focus trap and accessibility

### Subtask: Popover Testing Suite

- **Test File**: `src/test/components/ui/Popover.test.ts`

- **Coverage**: Positioning, z-index hierarchy, collision detection, mobile interactions, accessibility

- **Refactor Protection**: Prevents z-index violations and positioning issues

### Expected Output

- Enhanced shadcn-svelte Popover usage

- `src/test/components/ui/Popover.test.ts`

- Z-index hierarchy compliance

- Progress reset button integration

**Reference Component(s)**:

- **Location**: `src/lib/components/demo/StickyHeader.svelte`

- **Usage**: Study positioning patterns, z-index management, and viewport-aware positioning logic

- **⚠️ CRITICAL**: DO NOT modify original reference files in `src/lib/components/demo/`

- **⚠️ CRITICAL**: DO NOT import reference components directly into production code

- **Implementation Strategy**: Copy positioning calculation logic, z-index CSS variable usage (var(--z-popover)), collision detection patterns; adapt for shadcn-svelte Popover API and Dialog (8E) stacking context lessons

### Final Validations

- ✅ DOCS/SVELTE-INDEX.md compliance verified

- ✅ Z-index hierarchy respected (lessons from Dialog applied)

- ✅ Positioning with collision detection working

- ✅ Mobile-first interactions functional

- ✅ No background/stacking context issues (Dialog solutions applied)

- ✅ Progress reset button integration working

- ✅ Three-tier validation: `make check-wip` → `pnpm run test` → `pnpm run format/lint/check`

---

---

## Validation Criteria

- [ ] Tier 1: `make check-wip` passes (5-15s) - modified files only
- [ ] Tier 2: Unit tests pass - `pnpm run test src/test/...` (see TASK-8J-tests.md)
- [ ] Tier 3: Full validation - `pnpm run format` && `pnpm run lint` && `pnpm run check`
- [ ] Mobile-first: Tested at ≤390px BEFORE desktop testing
- [ ] TypeScript: 0 errors, 0 warnings
- [ ] Accessibility: Focus management, keyboard navigation, ARIA attributes
- [ ] E2E tests pass: `pnpm run test:e2e src/test/e2e/popover.spec.ts`

## References

- **Implementation Guide:** @docs/SVELTE-COMPONENTS.md
- **Development Patterns:** @docs/SVELTE-DEVELOPMENT.md
- **Testing Guide:** @docs/TESTING.md
- **Test Specifications:** TASK-8J-tests.md
- **Architecture:** @docs/SVELTE-ARCHITECTURE.md
- **Styling:** @docs/SVELTE-STYLING.md

---

**Last Updated:** 2025-01-08
**Status:** Ready for implementation
