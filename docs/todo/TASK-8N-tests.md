# TASK 8N: Theme Switcher - Test Development

## Objective

Comprehensive unit and E2E testing for theme switcher component to ensure quality, reliability, and regression protection.

## Dependencies

**Requires:**

- TASK-8N-theme-switcher.md (implementation must be complete)
- @docs/TESTING.md (testing guide and patterns)

## Test Deliverables

- [ ] Unit tests: `src/test/components/**/*.test.ts` or `src/test/stores/**/*.test.ts`
- [ ] E2E tests: `src/test/e2e/theme-switcher.spec.ts`
- [ ] Playwright snapshots (if visual component) - committed to git
- [ ] Test coverage report (≥90% for component logic)
- [ ] All tests passing with 99%+ success rate (no flaky tests)

---

## Test Requirements

### Testing Requirements

**Unit Tests (Vitest)**:

- ✅ Component rendering with theme options (light, dark, system)

- ✅ State management and reactivity (Svelte 5 runes: $state, $derived, $props)

- ✅ Theme store integration (theme state updates, store subscription)

- ✅ System preference detection (prefers-color-scheme media query, auto-detection)

- ✅ localStorage persistence (save theme choice, load on mount, handle quota errors)

- ✅ Event handlers and callbacks (theme selection, toggle switch, dropdown selection)

- ✅ Edge cases and error conditions (invalid theme value, localStorage unavailable, SSR compatibility)

- ✅ TypeScript interface compliance (ThemeOption interface validation)

- ✅ Accessibility attributes (ARIA labels, button role, keyboard navigation)

- ✅ CSS transition handling (smooth theme switch, FOUC prevention)

- ✅ Test coverage ≥90% for theme logic

- ✅ Test file: `src/test/components/ui/ThemeSwitcher.test.ts`

**End-to-End Tests (Playwright)**:

- ✅ User interaction flows (toggle theme, select from dropdown, persist across page reload)

- ✅ Mobile viewport testing (≤390px) - touch-friendly toggle ≥44px, dropdown interaction

- ✅ Desktop viewport testing (≥1024px) - hover states, keyboard shortcuts

- ✅ Keyboard navigation (Tab to switcher, Enter/Space to toggle, Arrow keys for dropdown)

- ✅ Focus management and tab order (focus on theme button, dropdown keyboard navigation)

- ✅ System preference detection (mock prefers-color-scheme, verify auto theme selection)

- ✅ Visual regression checks (theme transitions, color scheme consistency, icon states)

- ✅ Performance benchmarks (theme switch latency < 100ms, CSS transition duration 200ms)

- ✅ Test file: `src/test/e2e/theme-switcher.spec.ts`

---

## Testing Patterns Reference

**From @docs/TESTING.md:**

### Race Condition Prevention

- Use `generateConfigId()` for unique test identifiers
- Use `TestSetup` pattern for file isolation
- Never rely on files in `tmp/` persisting across runs

### E2E Flakiness Prevention

- NO hard-coded `page.waitForTimeout()` - use state-based waits
- Use `expect.poll()` for custom conditions
- Use `expect.toPass()` for retry logic
- Use helper functions from `src/test/e2e/helpers/wait-utilities.ts`:
  - `waitForScrollPosition()` - scroll with tolerance
  - `waitForStyleChange()` - CSS property changes
  - `waitForTransform()` - CSS transform values
  - `waitForAnimationComplete()` - transition completion
  - `retryClipboardOperation()` - clipboard with exponential backoff
  - `waitForElementActionable()` - visible + enabled + stable
  - `waitForFocusWithin()` - focus management

### Test Execution Strategy

- Test individually FIRST: `pnpm run test <file>` (2-5s)
- Then run full suite: `pnpm run test` (30-90s)
- E2E: `pnpm run test:e2e <file>` → `pnpm run test:e2e`

---

## Validation Criteria

- [ ] All unit tests pass: `pnpm run test src/test/...`
- [ ] All E2E tests pass: `pnpm run test:e2e src/test/e2e/theme-switcher.spec.ts`
- [ ] Test coverage ≥90% for component logic
- [ ] No flaky tests (99%+ pass rate across 10 runs)
- [ ] Snapshots committed to git (if applicable): `src/test/e2e/*.spec.ts-snapshots/`
- [ ] Mobile testing (≤390px) included in E2E tests
- [ ] Accessibility testing (keyboard nav, ARIA) included

## References

- **Testing Guide:** @docs/TESTING.md
- **Implementation:** TASK-8N-theme-switcher.md
- **E2E Patterns:** @docs/TESTING.md#e2e-testing
- **Flakiness Prevention:** @docs/TESTING.md#e2e-flakiness-prevention
- **Unit Test Patterns:** @docs/TESTING.md#unit-testing

---

**Last Updated:** 2025-01-08
**Status:** Ready for test development (requires implementation completion)
