# Development Standards

**Code quality requirements, component development rules, security considerations, and validation strategies for the Cloud-Native Learning Platform.**

> **📚 Part of [Development Guide](./README.md)**

---

## Component Development Rules

- **TypeScript Interfaces**: All component props must use TypeScript interfaces
- **shadcn-svelte Priority**: Check component library before building custom components
- **Mobile-First Development**: Always design and test mobile experience first
- **CSS Architecture**: Follow modular CSS patterns defined in [SVELTE-STYLING.md](../SVELTE-STYLING.md)
- **Theme System Compliance**: When creating new components, ensure compliance with theme architecture:
  - ✅ Use CSS custom properties from `src/app.css` (semantic variables like `--primary`, `--background`)
  - ✅ Use z-index hierarchy via CSS variables (`var(--z-modal)`, `var(--z-dropdown)`, etc.)
  - ❌ NEVER use hardcoded z-index values
  - ❌ NEVER use `@apply` in component `<style>` blocks (Tailwind v4 incompatible)
  - ⚠️ Avoid properties that create stacking contexts on navigation elements (`transform`, `opacity`, `filter`)
  - 🔍 Run `make validate-theme` or `make validate-quality` to verify compliance

---

## Code Quality Standards

### Three-Tiered Validation Strategy

Performance-optimized approach for efficient development workflow:

- **Tier 1 (Fast WIP Check ~5-15s):** `make check-wip` or `pnpm run check:wip` - validates only modified/untracked files with prettier and eslint
- **Tier 2 (Quality Checks ~30-90s):** `make validate-quality` - theme architecture validation + unit tests (validates theme system compliance, z-index hierarchy, stacking contexts, and CSS architecture)
- **Tier 3 (Comprehensive ~1-3m):** `pnpm run format` + `pnpm run lint` + `pnpm run check` - complete project formatting, linting, and TypeScript/SvelteKit validation

**See**: [Testing Guide - Validation Strategy](../testing/validation-strategy.md) for detailed validation workflows

### Zero Tolerance Policy

- **NO TypeScript errors** - All code must pass TypeScript validation
- **NO TypeScript warnings** - Address all compiler warnings before completion
- **NO unused variables** - Remove unused imports/variables unless explicitly requested by user or required by ShadCN components
- **NO deprecated components** - Avoid deprecated Lucide icons and other library components

### Quality Requirements

- **Error Handling**: Implement comprehensive error boundaries and fallbacks
- **Performance**: Optimize bundle size and runtime performance
- **Accessibility**: Ensure WCAG compliance and keyboard navigation

---

## Security Considerations

- **Secure by Default**: All code and architectural patterns designed with security first
- **No Exposed Secrets**: Never commit or log sensitive information
- **Production Ready**: All examples must be robust and production-ready

---

## Quick Reference

### Validation Commands

```bash
# Tier 1: Fast WIP check (5-15s)
make check-wip

# Tier 2: Quality checks (30-90s)
make validate-quality

# Tier 3: Comprehensive (1-3m)
pnpm run format && pnpm run lint && pnpm run check
```

### Theme Validation

```bash
# Validate theme compliance
make validate-theme

# Check z-index hierarchy and stacking contexts
make validate-quality
```

### Component Checklist

- [ ] TypeScript interfaces defined for props
- [ ] Checked shadcn-svelte library first
- [ ] Mobile-first design implemented
- [ ] Theme system compliance verified
- [ ] No hardcoded z-index values
- [ ] No `@apply` in component styles
- [ ] Theme validation passed
- [ ] Zero TypeScript errors/warnings
- [ ] Accessibility verified

---

## Related Documentation

- **[Testing Guide](../testing/README.md)** - Comprehensive testing strategies and patterns
- **[Configuration](./configuration.md)** - Settings management and CRITICAL no-hardcoding rule
- **[Patterns](./patterns.md)** - Type safety, service architecture, error prevention
- **[SVELTE-COMPONENTS.md](../SVELTE-COMPONENTS.md)** - Component development patterns
- **[SVELTE-STYLING.md](../SVELTE-STYLING.md)** - CSS architecture and theme system

---

**Last Updated**: 2025-01-17
