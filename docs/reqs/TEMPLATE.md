# [TASK TITLE]

**[One-line description of what this task delivers]**

> **📝 Consolidation Note**: This task combines implementation (~XXX lines) + testing (~XXX lines) = XXX total lines
>
> For tasks >500 lines total, split implementation and testing into separate files.

---

## 1. Objective

**Single, clear goal:** [State what needs to be accomplished in one sentence]

**Example**: "Implement Dialog component with open/close functionality and TypeScript props interface"

---

## 2. Context & Background

### Why This Matters

[Explain the business/technical value of this task]

**Example**:

- Dialogs are used throughout the platform for confirmations, forms, and information display
- This component establishes the pattern that other modal-like components will follow
- Required before implementing Form Dialog, Alert Dialog, etc.

### User Stories / Use Cases

[Describe how this feature will be used]

**Example**:

- As a user, I can click a button to open a dialog
- As a user, I can close the dialog by clicking the close button or pressing Escape
- As a developer, I can pass content via children prop
- As a developer, I can provide custom callbacks for open/close events

---

## 3. Dependencies

### Requires (Must Complete First)

- [Other task or prerequisite]
  - Example: "TASK 8A: Breadcrumb component completed"
  - Example: "Tailwind CSS v4 configured"

### Blocks (Other Tasks Wait For This)

- [Tasks that depend on this one]
  - Example: "TASK 8M: Search component (uses Dialog for results modal)"

### Related Tasks (No Dependency)

- [Similar or complementary tasks]
  - Example: "TASK 8N: Theme Switcher (uses same Dialog pattern)"

---

## 4. Deliverables

Create or modify these files:

- [ ] `src/lib/components/Dialog.svelte` - Component implementation
- [ ] `src/lib/types/index.ts` - Add DialogProps type export (if consolidated)
- [ ] `src/test/unit/Dialog.test.ts` - Unit tests (if consolidated ≤500 lines)
- [ ] `src/test/e2e/dialog-interactions.spec.ts` - E2E tests (if consolidated)
- [ ] Mobile-first validation (≤390px tested BEFORE desktop)
- [ ] TypeScript compliance (0 errors, 0 warnings)
- [ ] All tests passing

**Consolidation Status**:

- Implementation: ~250 lines
- Testing: ~150 lines
- **Total: ~400 lines → CONSOLIDATE ✅** (under 500 lines)

---

## 5. Scope

### In Scope (What This Task Includes)

- ✅ Dialog component with open/close state
- ✅ Props interface (title, content, buttons, callbacks)
- ✅ Basic styling with Tailwind
- ✅ Keyboard support (Escape to close)
- ✅ Unit + E2E tests
- ✅ TypeScript compliance
- ✅ Mobile-first responsive design (≤390px)

### Out of Scope (Future Tasks)

- ❌ Alert Dialog variant (separate task)
- ❌ Confirmation Dialog (separate task)
- ❌ Advanced animations (animation task)
- ❌ Shadow DOM encapsulation (future exploration)
- ❌ Accessibility audit (covered in Integration Guardian)

---

## 6. Implementation Details

### Agent Responsibility

[Describe what the agent building this should understand and accomplish]

**Example**: You are responsible for creating a Dialog component that serves as the foundational modal pattern for the platform. Study the reference components in `src/lib/components/demo/` to understand the component coordination patterns and state management approach. Your implementation should follow Svelte 5 runes syntax and integrate with the existing navigation system.

### Technical Documents to Review

- [SVELTE-COMPONENTS.md](../SVELTE-COMPONENTS.md) - Component development patterns
- [SVELTE-STYLING.md](../SVELTE-STYLING.md) - CSS architecture and Tailwind
- [SVELTE-DEVELOPMENT.md](../SVELTE-DEVELOPMENT.md) - Development patterns
- [TESTING.md](../TESTING.md) - Testing strategy
- [Type System](../SVELTE-COMPONENTS.md#unified-typescript-architecture) - Type management

### Prerequisites / Reference Code

- **Study**: `src/lib/components/demo/DemoDialog.svelte`
- **Study**: `src/lib/components/demo/DemoPopover.svelte`
- **Reference**: TASK 8J (Popover implementation - similar pattern)
- **⚠️ CRITICAL**: DO NOT modify reference files in `src/lib/components/demo/`

### Implementation Strategy

[Break down implementation into clear sections]

#### Phase 1: Create Component Structure

```svelte
<!-- src/lib/components/Dialog.svelte -->
<script lang="ts">
	interface Props {
		open?: boolean;
		title: string;
		onClose?: () => void;
	}

	let { open = false, title, onClose }: Props = $props();

	function handleEscape(event: KeyboardEvent) {
		if (event.key === "Escape") {
			onClose?.();
		}
	}
</script>

<div role="dialog" aria-modal="true" aria-label={title}>
	<!-- Content here -->
</div>

<style>
	/* Styling here */
</style>
```

#### Phase 2: Add TypeScript Props Interface

```typescript
// src/lib/types/index.ts - Add to exports
export interface DialogProps {
	/** Whether dialog is open */
	open?: boolean;

	/** Dialog title (required, used as aria-label) */
	title: string;

	/** Callback when dialog closes */
	onClose?: () => void;

	/** Content to display in dialog (use children slot) */
	children?: ComponentChildren;
}
```

#### Phase 3: Implement Unit Tests

```typescript
// src/test/unit/Dialog.test.ts
describe("Dialog", () => {
	it("should open and close", () => {
		// Test implementation
	});

	it("should handle Escape key", () => {
		// Test implementation
	});
});
```

#### Phase 4: Implement E2E Tests

```typescript
// src/test/e2e/dialog-interactions.spec.ts
test("should display dialog on button click", async ({ page }) => {
	// Test implementation
});
```

### Key Implementation Patterns

1. **Use Svelte 5 Runes**: `$state`, `$derived`, `$props`
2. **Props Interface**: TypeScript interface for type safety
3. **CSS Variables**: Use theme colors, not hardcoded values
4. **Keyboard Support**: Escape key to close
5. **ARIA Attributes**: Proper roles for accessibility
6. **Mobile-First**: Test at 390px BEFORE 1920px

### Common Pitfalls to Avoid

- ❌ Using Svelte 4 syntax (`export let`)
- ❌ Hardcoded colors instead of CSS variables
- ❌ No keyboard support
- ❌ Missing TypeScript types
- ❌ Testing desktop first, then mobile (WRONG ORDER!)
- ❌ Inline styles instead of Tailwind/CSS variables

---

## 7. Acceptance Criteria

Use **Given/When/Then** format (BDD style):

### Criterion 1: Component Renders with Props

- **Given** a Dialog component with title "Test Dialog" and open=true
- **When** the component mounts
- **Then** it displays with the correct title and is visible

### Criterion 2: Closes on Escape Key

- **Given** an open Dialog component
- **When** the user presses Escape key
- **Then** the onClose callback is called and dialog closes

### Criterion 3: Props Interface Complete

- **Given** the Dialog component implementation
- **When** importing DialogProps
- **Then** all required and optional props are documented with JSDoc

### Criterion 4: TypeScript Compliance

- **Given** the component and type definitions
- **When** running `pnpm run check`
- **Then** 0 errors and 0 warnings

### Criterion 5: Mobile-First Design

- **Given** the Dialog component
- **When** viewing at 390px viewport (mobile)
- **Then** layout doesn't overflow, text is readable, buttons are ≥44px
- **And When** viewing at 1920px viewport
- **Then** layout is correct and accessible

### Criterion 6: Theme Compliance

- **Given** the Dialog component styles
- **When** inspecting CSS
- **Then** NO hardcoded colors (use CSS variables), NO inline styles

### Criterion 7: Accessibility

- **Given** the Dialog component
- **When** navigating with keyboard (Tab, Escape)
- **Then** all interactive elements are accessible, focus is visible

---

## 8. Testing Requirements

### Consolidation Strategy

This task consolidates implementation (250 lines) + testing (150 lines) = 400 lines total (≤500).

### Unit Tests (Vitest)

**Location**: `src/test/unit/Dialog.test.ts`

**Test Suite**:

```typescript
describe("Dialog Component", () => {
	describe("rendering", () => {
		test("should render with title prop", () => {
			/* ... */
		});
		test("should render children content", () => {
			/* ... */
		});
		test("should be hidden when open=false", () => {
			/* ... */
		});
	});

	describe("interactions", () => {
		test("should call onClose when close button clicked", () => {
			/* ... */
		});
		test("should call onClose when Escape key pressed", () => {
			/* ... */
		});
	});

	describe("props validation", () => {
		test("should accept all DialogProps", () => {
			/* ... */
		});
	});
});
```

**Coverage Goal**: 90%+ of component logic

### E2E Tests (Playwright)

**Location**: `src/test/e2e/dialog-interactions.spec.ts`

**Test Scenarios**:

1. Dialog displays on button click (desktop)
2. Dialog closes on close button click
3. Dialog closes on Escape key press
4. Dialog responsive at mobile (390px)
5. Dialog keyboard navigation (Tab, Enter)
6. Visual regression snapshots (mobile + desktop)

**Best Practices**:

- Use `data-testid` for element selection
- NO hardcoded timeouts (use `waitForSelector`)
- Test mobile (390px) FIRST, then desktop
- Use snapshots for visual regression

---

## 9. Estimation

### Size

- **XS** (1 hour) - Tiny, trivial task
- **S** (2-3 hours) - Small, straightforward
- **M** (4-6 hours) - Medium, some complexity ← THIS TASK
- **L** (8-12 hours) - Large, significant work
- **XL** (>12 hours) - Very large, break down further

### Effort

- **Estimated Hours**: 4-6 hours
  - Implementation: 2-3 hours
  - Testing: 1-2 hours
  - Validation & refinement: 1 hour

### Complexity

- **Scale**: 1-10 (1=trivial, 10=extremely complex)
- **Rating**: 4/10
  - Basic component pattern
  - Straightforward state management
  - Standard styling approach
  - Moderate testing scope

---

## 10. Technical Notes

### Important Considerations

1. **Mobile-First Mandate**: Test at ≤390px FIRST, not last
   - Mobile: 390px viewport
   - Tablet: 768px viewport
   - Desktop: 1920px viewport

2. **CSS Variables Pattern**: Use theme system
   - Colors: `var(--color-surface)`, `var(--color-border)`
   - Spacing: Tailwind scale (px-2, px-4, etc.)
   - NOT: `#ffffff`, `#333333`, hardcoded values

3. **TypeScript Strict Mode**: Required
   - All variables typed
   - No `any` types
   - Props interface complete

4. **Component Isolation**:
   - Component doesn't modify globals
   - No side effects in render
   - Clean event handling

5. **Accessibility Checklist**:
   - ✅ Keyboard navigation (Tab, Enter, Escape)
   - ✅ ARIA attributes (role="dialog", aria-modal="true", aria-label)
   - ✅ Focus management
   - ✅ Screen reader support

### Implementation Hints

1. **For State Management**: Use Svelte 5 `$state` rune, not stores
2. **For Styling**: Use Tailwind classes + CSS variables, not inline styles
3. **For Type Safety**: Extract props to interface, import from `$types`
4. **For Testing**: Use TestSetup pattern for isolation

### Known Pitfalls

- ❌ Forgetting Escape key handler (accessibility issue)
- ❌ Using hardcoded colors (theme consistency issue)
- ❌ Testing desktop first (wrong order per CLAUDE.md)
- ❌ No focus management in dialog
- ❌ Props not in TypeScript interface (refactoring risk)

---

## 11. Validation Criteria

### Tier 1: Quick Validation (5-15 seconds)

```bash
make check-wip
```

- ✅ ESLint on modified files only
- ✅ TypeScript errors in changed code
- ✅ Prettier formatting

### Tier 2: Unit Testing (30-90 seconds)

```bash
pnpm run test
```

- ✅ All unit tests pass
- ✅ Code coverage ≥90% for component
- ✅ Test isolation (no order dependencies)

### Tier 3: Full Validation (1-3 minutes)

```bash
pnpm run format && pnpm run lint && pnpm run check
```

- ✅ All code formatted correctly
- ✅ All linting rules pass (0 warnings)
- ✅ TypeScript strict mode (0 errors, 0 warnings)
- ✅ SvelteKit validation
- ✅ No unused variables

### E2E Validation (2-5 minutes)

```bash
pnpm run test:e2e src/test/e2e/dialog-interactions.spec.ts
```

- ✅ All Playwright tests pass
- ✅ Visual snapshots match (mobile + desktop)
- ✅ Mobile-first (≤390px) verified
- ✅ Accessibility checks pass

---

## 12. References

### Documentation

- [Component Development Guide](../SVELTE-COMPONENTS.md) - Component patterns and architecture
- [Styling Guide](../SVELTE-STYLING.md) - Tailwind and CSS variable usage
- [Development Standards](../SVELTE-DEVELOPMENT.md) - Code organization and patterns
- [Testing Guide](../TESTING.md) - Unit and E2E testing strategies

### Examples

- **TASK 8J**: Popover component (similar dialog-like pattern)
- **Demo Component**: `src/lib/components/demo/DemoDialog.svelte` (reference)
- **Type Examples**: `src/lib/types/index.ts` (existing interfaces)

### Related Tasks

- TASK 8A: Breadcrumb (uses similar navigation pattern)
- TASK 8J: Popover (similar overlay pattern)
- TASK 8K: Progress Tracking (will integrate with Dialog)

---

## Timeline & Status

| Phase                | Status      | Notes                            |
| -------------------- | ----------- | -------------------------------- |
| Design & Planning    | Not Started | Ready for assignment             |
| Implementation       | Not Started | Estimated 2-3 hours              |
| Unit Testing         | Not Started | Consolidated with implementation |
| E2E Testing          | Not Started | Consolidated with implementation |
| Validation & Review  | Not Started | Tier 1/2/3 gates                 |
| Documentation Update | Not Started | After completion                 |

---

## Success Checklist

Before marking complete:

- [ ] Component implements all props from DialogProps interface
- [ ] Mobile-first tested (390px works perfectly)
- [ ] Desktop tested (1920px works perfectly)
- [ ] Keyboard support (Escape, Tab, Enter)
- [ ] ARIA attributes present and correct
- [ ] CSS uses variables (no hardcoded colors)
- [ ] TypeScript: 0 errors, 0 warnings
- [ ] Unit tests: 90%+ coverage, all pass
- [ ] E2E tests: all scenarios pass
- [ ] Tier 1: `make check-wip` passes
- [ ] Tier 2: `pnpm run test` passes
- [ ] Tier 3: `pnpm run format && lint && check` passes
- [ ] Visual snapshots captured (mobile + desktop)
- [ ] All acceptance criteria met
- [ ] Documentation updated with example usage

---

**Last Updated:** 2025-01-17
