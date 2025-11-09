# TASK 9: Content Migration to Clean Structure

## Objective

Develop content migration to clean structure following DOCS/SVELTE-INDEX.md patterns with mobile-first design (≤390px) and comprehensive testing.

## Dependencies

**Requires:**

- TASK 8X: Integration verification (completed)

**Referenced by:**

- TASK-9-tests.md (test development for this component)

## Deliverables

- [ ] Component implementation
- [ ] Type definitions
- [ ] Documentation
- [ ] Mobile-first validation (≤390px tested BEFORE desktop)
- [ ] TypeScript compliance (0 errors, 0 warnings)
- [ ] Component tests passing (see TASK-9-tests.md)

---

## Implementation Details

**Agent Responsibility:**

You are responsible for migrating content structure to `src/data/book/` with consistent naming conventions and type-safe content loading, eliminating fragmented content organization.

**Technical Documents to Review:**

- `src/scripts/content-menu-generator.ts` (menu generation)

- `src/scripts/content-scaffolding.ts` (structure creation)

- `src/lib/types/` (unified type definitions)

- Existing content in `src/book/` or `src/data/demo/`

**Prerequisites:**

- Task 8X: Component Integration & Scaffold Verification completed

**Implementation Details:**

1. Content Structure Design (clean folder structure)

2. Naming Convention Implementation (consistent file naming)

3. Content Type Migration (type-safe content conversion)

4. Validation System (automated content validation)

5. Menu generation and testing

**Expected Output:**

- `src/data/book/` structure complete

- Migrated content files

- Updated content menu

- Content validation reports (docs/)

**Final Validations:**

- ✅ File naming convention compliance

- ✅ TypeScript compilation without errors

- ✅ Content loading from SPA

- ✅ Generated menu structure

- ✅ Content validation passing

**Documentation to Update:**

- Content structure documentation

- Naming convention guidelines

- Migration process documentation

---

---

## Validation Criteria

- [ ] Tier 1: `make check-wip` passes (5-15s) - modified files only
- [ ] Tier 2: Unit tests pass - `pnpm run test src/test/...` (see TASK-9-tests.md)
- [ ] Tier 3: Full validation - `pnpm run format` && `pnpm run lint` && `pnpm run check`
- [ ] Mobile-first: Tested at ≤390px BEFORE desktop testing
- [ ] TypeScript: 0 errors, 0 warnings
- [ ] Accessibility: Focus management, keyboard navigation, ARIA attributes

## References

- **Implementation Guide:** @docs/SVELTE-COMPONENTS.md
- **Development Patterns:** @docs/SVELTE-DEVELOPMENT.md
- **Testing Guide:** @docs/TESTING.md

- **Architecture:** @docs/SVELTE-ARCHITECTURE.md
- **Styling:** @docs/SVELTE-STYLING.md

---

**Last Updated:** 2025-01-08
**Status:** Ready for implementation
