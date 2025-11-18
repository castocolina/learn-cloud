---
description: Validate Svelte component consistency and quality ensuring showcase vs production parity, props interface completeness, theme compliance (CSS variables, no hardcoded colors), mobile-first implementation (≤390px), and accessibility (WCAG 2.1 Level AA)
allowed-tools: [Read, Grep, Bash]
triggers:
  - "component integration"
  - "validate component"
  - "component consistency"
  - "svelte component"
  - "component quality"
---

# Component Integration Guardian Skill

Validates Svelte component consistency and quality ensuring showcase vs production parity, props interface completeness, theme compliance, mobile-first implementation, and accessibility standards.

## Capabilities

### 1. Showcase vs Production Consistency

**Validates**: Component implementation matches showcase patterns.

**Checks**:

- ✅ Same component used in showcase and production
- ✅ Props match between showcase and production
- ✅ Styling consistent across contexts
- ✅ Behavior identical in both environments
- ❌ No showcase-only hacks

**Anti-patterns detected**:

```svelte
<!-- ❌ Different implementation in showcase -->
{#if isShowcase}
	<div class="special-showcase-only">...</div>
{/if}

<!-- ✅ Same component everywhere -->
<Button variant="primary" size="md">Click</Button>
```

### 2. Props Interface Completeness

**Validates**: TypeScript interfaces for component props.

**Checks**:

- ✅ All props have TypeScript types
- ✅ Required vs optional props defined
- ✅ Default values for optional props
- ✅ Props documented with JSDoc
- ❌ No `any` types

**Example validation**:

```typescript
// ❌ Missing types
let { variant, size } = $props();

// ✅ Complete interface
interface ButtonProps {
	/** Button style variant */
	variant: "primary" | "secondary" | "outline";
	/** Button size */
	size?: "sm" | "md" | "lg";
	/** Disabled state */
	disabled?: boolean;
}

let { variant, size = "md", disabled = false }: ButtonProps = $props();
```

### 3. Theme Compliance

**Validates**: Uses theme CSS variables, no hardcoded colors.

**Checks**:

- ✅ Uses CSS variables from theme
- ✅ No hardcoded hex colors (#ff0000)
- ✅ No hardcoded RGB colors (rgb(255,0,0))
- ✅ Tailwind utility classes for theming
- ❌ No inline styles with colors

**Anti-patterns detected**:

```svelte
<!-- ❌ Hardcoded colors -->
<div style="background-color: #3b82f6;">...</div>
<div class="bg-[#3b82f6]">...</div>

<!-- ✅ Theme variables -->
<div class="bg-primary">...</div>
<div style="background-color: var(--color-primary);">...</div>
```

**CSS Variables enforced**:

- `--color-primary`
- `--color-secondary`
- `--color-accent`
- `--color-background`
- `--color-surface`
- `--color-text`
- `--color-border`

### 4. Mobile-First Implementation

**Validates**: Responsive design for ≤390px viewport.

**Checks**:

- ✅ Mobile styles defined first
- ✅ Desktop styles in media queries
- ✅ Touch-friendly hit targets (≥44px)
- ✅ Readable text sizes (≥16px base)
- ✅ No horizontal scroll at 390px
- ❌ No desktop-only layouts

**Responsive patterns**:

```svelte
<!-- ✅ Mobile-first -->
<button
	class="
  /* Mobile: 390px */ /* Tablet: 768px
  */ /* Desktop: 1024px */ px-4
  py-3 text-base md:px-3 md:py-2 lg:px-2 lg:py-1.5
"
>
	Click
</button>

<!-- ❌ Desktop-first -->
<button class="px-2 py-1.5 md:px-4 md:py-3">Click</button>
```

### 5. Accessibility (WCAG 2.1 Level AA)

**Validates**: WCAG 2.1 Level AA compliance.

**Checks**:

- ✅ Semantic HTML elements
- ✅ ARIA labels for interactive elements
- ✅ Keyboard navigation support
- ✅ Focus indicators visible
- ✅ Color contrast ≥4.5:1 (text)
- ✅ Color contrast ≥3:1 (UI components)
- ❌ No missing alt text on images
- ❌ No keyboard traps

**Accessibility patterns**:

```svelte
<!-- ✅ Accessible button -->
<button
	aria-label="Close dialog"
	aria-pressed={isPressed}
	tabindex="0"
	class="focus:ring-2 focus:ring-primary"
>
	<Icon name="close" aria-hidden="true" />
</button>

<!-- ❌ Inaccessible div -->
<div onclick={handleClick}>
	<img src="close.svg" />
</div>
```

## Auto-Trigger Conditions

This skill activates when:

- Creating/modifying Svelte components (\*.svelte files)
- After component implementation
- Before component integration into showcase
- Manual invocation: `/validate-component [component-path]`

**Blocking Authority**: MUST pass all checks before component integration completion.

## Validation Report Format

When issues found, provides actionable fixes:

```markdown
## Component Integration Report

### File: src/lib/components/ui/Button.svelte

#### Showcase Consistency (BLOCKING)

- Props mismatch with showcase
  Showcase: variant, size, disabled
  Production: variant, size (missing: disabled)
  Fix: Add disabled prop to match showcase implementation

#### Props Interface (HIGH)

- Missing TypeScript interface
  Found: let { variant, size } = $props()
  Fix: Define ButtonProps interface with types

#### Theme Compliance (BLOCKING)

- Hardcoded color detected
  Line 23: style="background: #3b82f6"
  Fix: Use bg-primary or var(--color-primary)

#### Mobile-First (HIGH)

- Desktop-first media query
  Found: class="py-1 md:py-3"
  Fix: Mobile styles first, then md:, lg: breakpoints

#### Accessibility (BLOCKING)

- Missing ARIA label
  Line 15: <button> without aria-label
  Fix: Add aria-label="Descriptive text"

- Missing focus indicator
  Found: No focus styles
  Fix: Add focus:ring-2 focus:ring-primary

### Summary

- ❌ 1 Showcase consistency violation (BLOCKING)
- ⚠️ 1 Props interface issue (HIGH)
- ❌ 1 Theme compliance violation (BLOCKING)
- ⚠️ 1 Mobile-first issue (HIGH)
- ❌ 2 Accessibility violations (BLOCKING)
- Status: BLOCKED until violations fixed
```

## Integration

Works with:

- **validation-enforcer** - Component validation in tier 2/3
- **test-architect** - E2E tests for component behavior
- **mermaid-validator** - Validates component architecture diagrams

## Success Criteria

1. ✅ Showcase and production use same component
2. ✅ All props have TypeScript interfaces
3. ✅ Uses theme CSS variables (no hardcoded colors)
4. ✅ Mobile-first responsive design (≤390px)
5. ✅ Touch targets ≥44px
6. ✅ Text sizes ≥16px base
7. ✅ ARIA labels on interactive elements
8. ✅ Keyboard navigation works
9. ✅ Focus indicators visible
10. ✅ Color contrast meets WCAG 2.1 AA

## References

- [SVELTE-COMPONENTS.md](../../../docs/guides/SVELTE-COMPONENTS.md) - Component development patterns
- [SVELTE-STYLING.md](../../../docs/guides/SVELTE-STYLING.md) - CSS architecture and theming
- [SVELTE-TROUBLESHOOTING-UX.md](../../../docs/guides/SVELTE-TROUBLESHOOTING-UX.md) - UX troubleshooting guide
