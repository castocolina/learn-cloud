/**
 * Popover Wrapper Module (TASK 8J - Refactored 2025-11-17)
 *
 * This module provides a clean namespace export for Popover components,
 * following the exact pattern of shadcn-svelte Tooltip.
 *
 * Architecture:
 * - Re-exports Root, Trigger, Close from shadcn ui/popover (unchanged primitives)
 * - Exports custom Content wrapper (popover-content.svelte) with arrow rendering
 *
 * Pattern source: src/lib/components/ui/tooltip/index.ts
 *
 * Usage:
 * ```svelte
 * <script>
 *   import * as Popover from "$lib/components/shared/popover";
 * </script>
 *
 * <Popover.Root>
 *   <Popover.Trigger><Button>Open</Button></Popover.Trigger>
 *   <Popover.Content side="bottom" showArrow={true}>
 *     <p>Content with automatic arrow</p>
 *   </Popover.Content>
 * </Popover.Root>
 * ```
 *
 * Difference from ui/popover:
 * - ui/popover: shadcn base (NO arrow, NO SETTINGS)
 * - shared/popover: Extended wrapper (WITH arrow, WITH SETTINGS integration)
 */

// Import from shadcn ui/popover
import { Root, Trigger, Close } from "$lib/components/ui/popover";

// Import custom Content wrapper with arrow rendering
import Content from "./popover-content.svelte";

// Export all components
export { Root, Trigger, Close, Content };

// Export aliases for alternative import styles
export {
	Root as Popover,
	Content as PopoverContent,
	Trigger as PopoverTrigger,
	Close as PopoverClose
};
