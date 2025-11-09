# TASK 8N: Theme Switcher Component Development

## Objective

Develop theme switcher component development following DOCS/SVELTE-INDEX.md patterns with mobile-first design (≤390px) and comprehensive testing.

## Dependencies

**Requires:**

- TASK 8M: Search component (completed)

**Referenced by:**

- TASK-8N-tests.md (test development for this component)
- Subsequent tasks that build upon this component

## Deliverables

- [ ] src/lib/stores/theme.ts
- [ ] src/lib/components/ui/ThemeSwitcher.svelte
- [ ] src/lib/components/ui/ThemeSwitcher.svelte
- [ ] src/lib/stores/theme.ts
- [ ] Mobile-first validation (≤390px tested BEFORE desktop)
- [ ] TypeScript compliance (0 errors, 0 warnings)
- [ ] Component tests passing (see TASK-8N-tests.md)

---

## Implementation Details

### Agent Responsibility

You are responsible for developing a theme switcher component with light/dark mode toggle, system preference detection, and persistent storage following DOCS/SVELTE-INDEX.md patterns.

You must think harder about the theme switching mechanism to ensure smooth transitions and accessibility compliance. You must also implement automatic detection of system theme preferences and save user preferences in localStorage for persistence across sessions. The component should be mobile-optimized (≤390px) with touch-friendly interactions (≥44px touch targets). Present options for dropdown or toggle switch UI (Possible IconGrid integration). Integration with the global theme store is essential for consistent theming across the application.

### Technical Documents to Review

- `DOCS/SVELTE-INDEX.md` (Svelte 5 syntax and state management)

- `src/lib/stores/theme.ts` (theme store integration)

- `DOCS/SVELTE-INDEX.md` (theme system specifications)

### Prerequisites

From `PLAN-TODO-FEATURES.md`:

- Task 8M: Search Component completed

### Implementation Details

- **Component**: `src/lib/components/ui/ThemeSwitcher.svelte`

- **Theme Detection**: Automatic system preference detection

- **Persistent Storage**: Save theme preference in localStorage

- **Smooth Transitions**: Theme switching with CSS transitions

- **Accessibility**: Proper ARIA labels and keyboard support

### Subtask: Theme Switcher Testing Suite

- **Test File**: `src/test/components/ui/ThemeSwitcher.test.ts`

- **Coverage**: Theme switching, system detection, localStorage persistence, accessibility

- **Refactor Protection**: Ensures theme consistency during component changes

### Expected Output

- `src/lib/components/ui/ThemeSwitcher.svelte`

- `src/test/components/ui/ThemeSwitcher.test.ts`

- Theme store integration

- localStorage persistence logic

**Reference Component(s)**:

- **Location**: None (implement from scratch)

- **Usage**: N/A - No demo components available

- **Implementation Strategy**: Build using shadcn-svelte Dropdown or Toggle components, integrate with theme store from `src/lib/stores/theme.ts`, implement localStorage persistence, add system preference detection using `window.matchMedia('(prefers-color-scheme: dark)')`, ensure smooth CSS transitions

### Final Validations

- ✅ DOCS/SVELTE-INDEX.md compliance verified

- ✅ System preference detection working

- ✅ Theme persistence functional

- ✅ Smooth transitions on theme change

- ✅ Test suite covers all theme scenarios

- ✅ Accessibility standards met

- ✅ Three-tier validation: `make check-wip` → `pnpm run test` → `pnpm run format/lint/check`

### Known Issues & Future Improvements

**Issue: Scroll Hidden While Dropdown Active**

- **Description**: When ThemeToggle dropdown is open, page scroll is hidden/disabled

- **Impact**: Minor UX inconvenience - users cannot scroll background content while dropdown is active

- **Priority**: Low - cosmetic issue, does not affect functionality

- **Status**: Deferred to future enhancement

- **Technical Notes**: This is standard dropdown Portal behavior (Radix UI overlay), but may need custom scroll handling for better UX

- **Related**: DropdownMenu Portal rendering, body scroll-lock behavior

---

---

## Validation Criteria

- [ ] Tier 1: `make check-wip` passes (5-15s) - modified files only
- [ ] Tier 2: Unit tests pass - `pnpm run test src/test/...` (see TASK-8N-tests.md)
- [ ] Tier 3: Full validation - `pnpm run format` && `pnpm run lint` && `pnpm run check`
- [ ] Mobile-first: Tested at ≤390px BEFORE desktop testing
- [ ] TypeScript: 0 errors, 0 warnings
- [ ] Accessibility: Focus management, keyboard navigation, ARIA attributes
- [ ] E2E tests pass: `pnpm run test:e2e src/test/e2e/theme-switcher.spec.ts`

## References

- **Implementation Guide:** @docs/SVELTE-COMPONENTS.md
- **Development Patterns:** @docs/SVELTE-DEVELOPMENT.md
- **Testing Guide:** @docs/TESTING.md
- **Test Specifications:** TASK-8N-tests.md
- **Architecture:** @docs/SVELTE-ARCHITECTURE.md
- **Styling:** @docs/SVELTE-STYLING.md

---

**Last Updated:** 2025-01-08
**Status:** Ready for implementation
