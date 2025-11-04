/**
 * IconButton Component Type Definitions
 *
 * TypeScript interfaces for the IconButton shared component.
 * IconButton is a reusable atomic component for rendering a single interactive icon.
 * It serves as the base component used internally by IconGrid for DRY architecture.
 *
 * Architecture:
 * - IconButton: Base atomic component (1 icon + interactivity logic)
 * - IconGrid: Composite component (grid layout + loop of IconButtons)
 *
 * This design follows the DRY principle - all interactivity logic lives in IconButton,
 * and IconGrid simply provides layout and iteration.
 */

import type { HTMLButtonAttributes } from "svelte/elements";
import type { IconVariant, IconState } from "./icon-grid.js";

/**
 * Icon component type for Lucide icons
 *
 * Using `any` type because lucide-svelte (v0.544) exports Svelte 4 class constructors
 * that don't match any available Svelte 5 type:
 *
 * - `Component<Props>`: Expects Svelte 5 function signature, but lucide exports Svelte 4 classes
 * - `typeof SvelteComponentTyped`: Deprecated in Svelte 5, causes warnings
 * - `typeof Copy` (extract from lucide): Still resolves to incompatible class constructor
 * - `typeof SvelteComponentTyped | Component<any>`: ESLint rejects `Component<any>`
 *
 * This is a temporary type adapter pattern (similar to Java/Python mappers) that bridges
 * the incompatibility between lucide-svelte's Svelte 4 implementation and our Svelte 5 types.
 *
 * Migration path: When lucide-svelte releases Svelte 5 compatible version, change to:
 * `icon: Component<{ size?: number | string; color?: string; strokeWidth?: number | string; }>`
 *
 * Lucide icons accept props: size, color, strokeWidth, absoluteStrokeWidth, iconNode
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IconComponent = any;

/**
 * Props for the IconButton component
 *
 * IconButton is the atomic unit for rendering a single interactive icon with
 * consistent styling, hover effects, focus states, and click handling.
 *
 * Extends HTMLButtonAttributes to allow data-* and other standard HTML attributes.
 */
export interface IconButtonProps extends Omit<HTMLButtonAttributes, "class"> {
	/**
	 * Lucide icon component to render
	 * Example: Copy, Download, X, ChevronUp, etc.
	 *
	 * Accepts both Svelte 4 and Svelte 5 component types via IconComponent union.
	 * Lucide icons accept props: size, color, strokeWidth, absoluteStrokeWidth, etc.
	 */
	icon: IconComponent;

	/**
	 * Accessible label for the icon button
	 * Used for ARIA attributes and tooltip (title attribute)
	 */
	label: string;

	/**
	 * Click handler (supports async operations and event parameter)
	 * Optional - can be omitted for purely decorative icons
	 * Can accept optional MouseEvent parameter and return any value
	 */
	onClick?: (event?: MouseEvent) => unknown;

	/**
	 * Icon size (pixels or CSS unit)
	 * @default SETTINGS.ui.iconGrid.defaultIconSize (20px)
	 */
	size?: string | number;

	/**
	 * Visual variant (color scheme)
	 * @default "default"
	 */
	variant?: IconVariant;

	/**
	 * State indicator (for feedback)
	 * @default "default"
	 */
	iconState?: IconState;

	/**
	 * Badge text to display on icon (Icon + Text Strategy)
	 * Text is automatically truncated to SETTINGS.ui.iconGrid.badge.maxChars (default: 4)
	 * and transformed to uppercase for maximum legibility at small sizes.
	 *
	 * Use Case: Download/Copy actions with format indicators
	 * @example badge="SVG" → displays "SVG" on icon
	 * @example badge="Download" → displays "DOWN" (truncated to 4 chars)
	 * @example badge="png" → displays "PNG" (uppercased)
	 *
	 * Typography: Uses Inter font (.badge-text class) optimized for 8-10px legibility
	 * Position: Configurable via badgeVerticalPosition/badgeHorizontalPosition or SETTINGS
	 * Opacity: Background has 90% opacity by default for transparency
	 *
	 * Related:
	 * - SETTINGS.ui.iconGrid.badge (configuration)
	 * - src/styles/components.css (.badge-text-xs, .badge-text-sm)
	 * - docs/PLAN-COMPOSE-ICONS.md (Strategy B: Icon + Text Badge)
	 *
	 * @default undefined (no badge displayed)
	 */
	badge?: string;

	/**
	 * Badge vertical position (overrides SETTINGS.ui.iconGrid.badge.verticalPosition)
	 * @default undefined (uses SETTINGS value: "bottom")
	 */
	badgeVerticalPosition?: "top" | "center" | "bottom";

	/**
	 * Badge horizontal position (overrides SETTINGS.ui.iconGrid.badge.horizontalPosition)
	 * @default undefined (uses SETTINGS value: "right")
	 */
	badgeHorizontalPosition?: "left" | "center" | "right";

	/**
	 * Badge background opacity (explicit control)
	 * Overrides both badgeOpaque and SETTINGS.ui.iconGrid.badge.backgroundOpacity
	 * @default undefined (uses badgeOpaque or SETTINGS value: 0.2)
	 * @example badgeBackgroundOpacity={0.0} // Fully transparent (no background)
	 * @example badgeBackgroundOpacity={0.5} // Semi-transparent
	 * @example badgeBackgroundOpacity={0.9} // Mostly opaque
	 */
	badgeBackgroundOpacity?: number;

	/**
	 * Badge background opaque/transparent toggle
	 * Simple boolean control for common cases
	 * @default undefined (uses SETTINGS value: 0.2 - transparent)
	 * @example badgeOpaque={true} // Opaque background (0.9)
	 * @example badgeOpaque={false} // Fully transparent (0.0)
	 * Note: badgeBackgroundOpacity prop takes precedence if both are provided
	 */
	badgeOpaque?: boolean;

	/**
	 * Badge layering strategy - controls z-index rendering order
	 *
	 * OVERLAY MODE (default):
	 * - Badge rendered ON TOP of icon (z-index: 1, icon: 0)
	 * - Current behavior, good with tooltips on desktop
	 *
	 * BEHIND MODE (mobile-optimized):
	 * - Badge rendered BEHIND icon (z-index: 0, icon: 1)
	 * - Icon fully visible, badge provides context without obstruction
	 * - Better for mobile devices without hover/tooltips
	 * - Automatically uses behindOpacity from SETTINGS (0.6) for visibility
	 *
	 * Use Cases:
	 * - Download/Copy buttons with format indicators (SVG, PNG, etc.)
	 * - Mobile-first interfaces where tooltips unavailable
	 * - High-contrast badge text on icon backgrounds
	 *
	 * @default undefined (uses SETTINGS.ui.iconGrid.badge.layer: "overlay")
	 * @example badgeLayer="behind" // Badge behind icon (20% overlap, better mobile UX)
	 * @example badgeLayer="overlay" // Badge on top of icon (current behavior)
	 */
	badgeLayer?: "overlay" | "behind";

	/**
	 * Badge offset from icon edge (controls overlap percentage)
	 *
	 * OVERLAP CALCULATION (icon 20px × 20px = 400px²):
	 * - offset="10px" → 20% overlap (~80px² = 9px × 9px intersection)
	 * - offset="14px" → 10% overlap (~40px² = 6px × 6px intersection)
	 * - offset="2px"  → 64% overlap (legacy, not recommended)
	 *
	 * Higher offset = less overlap = more icon visible
	 *
	 * @default undefined (uses SETTINGS.ui.iconGrid.badge.offset: "10px")
	 * @example badgeOffset="14px" // 10% overlap - minimal obstruction
	 * @example badgeOffset="10px" // 20% overlap - balanced (SETTINGS default)
	 */
	badgeOffset?: string;

	/**
	 * Disabled state (no interaction)
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Enable shadcn-svelte Tooltip component for enhanced discoverability
	 * When true, wraps button with Tooltip displaying label text
	 * @default false (from SETTINGS.ui.iconGrid.showTooltips via IconGrid)
	 */
	showTooltip?: boolean;

	/**
	 * Additional CSS classes
	 */
	class?: string;

	/**
	 * Custom ARIA label (overrides label prop)
	 * Use when label text differs from screen reader announcement
	 */
	ariaLabel?: string;
}
