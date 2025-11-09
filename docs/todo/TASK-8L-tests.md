# TASK 8L: Navigation Coordinator - Test Development

## Objective

Comprehensive unit and E2E testing for navigation coordinator component to ensure quality, reliability, and regression protection.

## Dependencies

**Requires:**

- TASK-8L-navigation-coordinator.md (implementation must be complete)
- @docs/TESTING.md (testing guide and patterns)

## Test Deliverables

- [ ] Unit tests: `src/test/components/**/*.test.ts` or `src/test/stores/**/*.test.ts`
- [ ] E2E tests: `src/test/e2e/navigation-coordinator.spec.ts`
- [ ] Playwright snapshots (if visual component) - committed to git
- [ ] Test coverage report (≥90% for component logic)
- [ ] All tests passing with 99%+ success rate (no flaky tests)

---

## Test Requirements

### Testing Requirements

**Unit Tests (Vitest)**:

- ✅ navigateToContent() function (atomic state updates, all components notified)

- ✅ Navigation store state management (currentId, source tracking, previous/next entries)

- ✅ Breadcrumb store generation (trail calculation from content-menu structure)

- ✅ Sequential navigation helpers (navigateToPrevious, navigateToNext, boundary conditions)

- ✅ Hash routing utilities (parseHash, navigateToChapter, isValidHash)

- ✅ Event handlers and callbacks (content-load events, progress notifications)

- ✅ Edge cases and error conditions (invalid IDs, circular navigation, missing content)

- ✅ TypeScript interface compliance (NavigationEvent, NavigationState interface validation)

- ✅ Multi-source coordination (sidebar, search, breadcrumb, sequential, direct, back/forward)

- ✅ Test coverage ≥90% for navigation logic

- ✅ Test file: `src/test/components/navigation/Navigation.test.ts`

**End-to-End Tests (Playwright)**:

- ✅ User interaction flows (sidebar navigation, previous/next buttons, breadcrumb clicks, search navigation)

- ✅ Mobile viewport testing (≤390px) - swipe gestures, touch navigation buttons ≥44px

- ✅ Desktop viewport testing (≥1024px) - keyboard shortcuts (ArrowLeft/Right), hover states

- ✅ Keyboard navigation (Arrow keys for sequential navigation, Tab through controls)

- ✅ Focus management and tab order (focus retention on navigation)

- ✅ Integration across all components (atomic updates: sidebar highlight + breadcrumb update + content load + URL hash + progress tracking)

- ✅ Browser back/forward navigation (hash change listener, state restoration)

- ✅ Deep linking and direct URL access (hash parsing, content loading from URL)

- ✅ Visual regression checks (no partial states, smooth transitions, component synchronization)

- ✅ Performance benchmarks (navigation latency < 100ms, multi-component update < 50ms)

- ✅ Test file: `src/test/e2e/unified-navigation.spec.ts`

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
- [ ] All E2E tests pass: `pnpm run test:e2e src/test/e2e/navigation-coordinator.spec.ts`
- [ ] Test coverage ≥90% for component logic
- [ ] No flaky tests (99%+ pass rate across 10 runs)
- [ ] Snapshots committed to git (if applicable): `src/test/e2e/*.spec.ts-snapshots/`
- [ ] Mobile testing (≤390px) included in E2E tests
- [ ] Accessibility testing (keyboard nav, ARIA) included

## References

- **Testing Guide:** @docs/TESTING.md
- **Implementation:** TASK-8L-navigation-coordinator.md
- **E2E Patterns:** @docs/TESTING.md#e2e-testing
- **Flakiness Prevention:** @docs/TESTING.md#e2e-flakiness-prevention
- **Unit Test Patterns:** @docs/TESTING.md#unit-testing

---

**Last Updated:** 2025-01-08
**Status:** Ready for test development (requires implementation completion)
