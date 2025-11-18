## Component Integration Guardian - Reference Documentation

### Standards and Guidelines

- **[SVELTE-COMPONENTS.md](../../../docs/guides/SVELTE-COMPONENTS.md)** - Component development patterns
- **[SVELTE-STYLING.md](../../../docs/guides/SVELTE-STYLING.md)** - CSS architecture and theming
- **[SVELTE-TROUBLESHOOTING-UX.md](../../../docs/guides/SVELTE-TROUBLESHOOTING-UX.md)** - UX troubleshooting guide

### 5 Quality Checks

#### 1. Showcase vs Production Consistency

Same component in both contexts, no showcase-only hacks.

#### 2. Props Interface Completeness

```typescript
interface ButtonProps {
	variant: "primary" | "secondary";
	size?: "sm" | "md" | "lg";
	disabled?: boolean;
}

let { variant, size = "md", disabled = false }: ButtonProps = $props();
```

#### 3. Theme Compliance

```svelte
<!-- ❌ Hardcoded -->
<div style="background: #3b82f6;">...</div>

<!-- ✅ Theme variable -->
<div class="bg-primary">...</div>
<div style="background: var(--color-primary);">...</div>
```

**CSS Variables**:

- `--color-primary`, `--color-secondary`, `--color-accent`
- `--color-background`, `--color-surface`
- `--color-text`, `--color-border`

#### 4. Mobile-First Implementation

```svelte
<!-- ✅ Mobile-first -->
<button class="py-3 md:py-2 lg:py-1.5">Click</button>

<!-- ❌ Desktop-first -->
<button class="py-1.5 md:py-3">Click</button>
```

**Requirements**:

- Touch targets ≥44px
- Text sizes ≥16px base
- No horizontal scroll at 390px

#### 5. Accessibility (WCAG 2.1 AA)

```svelte
<!-- ✅ Accessible -->
<button aria-label="Close dialog" tabindex="0" class="focus:ring-2 focus:ring-primary">
	<Icon name="close" aria-hidden="true" />
</button>
```

**Requirements**:

- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation
- Focus indicators
- Color contrast ≥4.5:1 (text), ≥3:1 (UI)

### Validation Script

#### check-component.ts

Main validation script for all component checks.

**Usage**:

```bash
# Single component
node scripts/check-component.ts src/lib/components/ui/Button.svelte

# Directory
node scripts/check-component.ts src/lib/components/
```

**Exit codes**:

- 0: All checks passed
- 1: Blocking issues found

### Integration

Works with:

- **validation-enforcer** - Component validation in tier 2/3
- **test-architect** - E2E tests for component behavior
- **mermaid-validator** - Component architecture diagrams

### Success Criteria

- ✅ Showcase and production use same component
- ✅ All props have TypeScript interfaces
- ✅ Uses theme CSS variables
- ✅ Mobile-first responsive design
- ✅ Touch targets ≥44px
- ✅ ARIA labels present
- ✅ Keyboard navigation works
- ✅ Focus indicators visible
- ✅ Color contrast meets WCAG 2.1 AA
