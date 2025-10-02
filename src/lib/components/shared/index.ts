/**
 * Shared Wrapper Components
 *
 * This module exports wrapper components that demonstrate the wrapper pattern
 * for shadcn-svelte components. These wrappers add:
 * - Union type-first TypeScript patterns
 * - SETTINGS integration
 * - Theme-aware defaults
 * - Mobile-first responsive behavior
 *
 * Pattern Examples:
 * - Button: Basic wrapper with union types
 * - Dialog: Complex wrapper with SETTINGS and z-index hierarchy
 * - Progress: Configuration wrapper with theme integration
 *
 * Usage:
 * ```typescript
 * import { Button, Dialog, Progress } from "$lib/components/shared";
 * ```
 *
 * Related Documentation:
 * - docs/WRAPPER-PATTERN-GUIDE.md (comprehensive wrapper patterns)
 * - SVELTEKIT-GUIDE.md (architecture standards)
 */

export { default as Button } from "./Button.svelte";
export { default as Dialog } from "./Dialog.svelte";
export { default as Progress } from "./Progress.svelte";
