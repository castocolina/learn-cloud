/**
 * IconGrid Component Type Definitions
 *
 * Type-safe interfaces and union types for the IconGrid shared component.
 * This component provides standardized icon presentation with consistent styling
 * (hover effects, borders, cursor, focus states) used across Dialog, CodeBlock,
 * Diagram, and other components.
 *
 * Architecture:
 * - Flexible positioning: absolute (floating) or inline (flexbox) modes
 * - Full customization: icon size, gap, columns, alignment via props
 * - Tooltip integration: shadcn-svelte Tooltip component for accessibility
 * - Complete interaction feedback: hover, scale, active state, focus ring
 * - Mobile-first: ≥44px touch targets, responsive grid layout
 */

import type { ComponentType, SvelteComponent } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

/**
 * Icon positioning strategy within parent component
 *
 * - "absolute": Floats in fixed position within parent (e.g., top-right corner)
 *               Best for action buttons on cards/diagrams
 * - "inline": Flows naturally within component structure via flexbox
 *             Best for toolbar-style controls
 */
export type IconGridPositioning = "absolute" | "inline";

/**
 * Icon grid alignment options
 *
 * Controls how icons are aligned within the grid container.
 */
export type IconGridAlignment = "start" | "center" | "end" | "stretch";

/**
 * Visual variant for icon styling
 *
 * Provides different color schemes for icons based on their purpose.
 * - "default": Alias for "subtle" (default choice - configurable in components)
 * - "subtle": Visible but discrete styling (more contrast than ghost)
 * - "primary": Primary brand color
 * - "destructive": Red/warning color for dangerous actions
 * - "ghost": Transparent background, minimal styling
 */
export type IconVariant = "default" | "subtle" | "primary" | "destructive" | "ghost";

/**
 * Icon state for visual feedback
 *
 * Provides visual indication of icon's current state.
 * - "default": Normal state
 * - "active": Currently active/selected
 * - "success": Action completed successfully (e.g., "Copied!")
 * - "error": Action failed
 */
export type IconState = "default" | "active" | "success" | "error";

/**
 * Individual icon configuration
 *
 * Defines all properties for a single icon within the grid.
 */
export interface IconItem {
	/**
	 * Unique identifier for the icon
	 * Used for state tracking and React keys
	 */
	id: string;

	/**
	 * Lucide icon component to render
	 * Import from "lucide-svelte" (e.g., Copy, Check, X)
	 */
	icon: ComponentType<SvelteComponent>;

	/**
	 * Accessible label for tooltip and screen readers
	 * Displayed in tooltip on hover and read by screen readers
	 */
	label: string;

	/**
	 * Click event handler
	 * Can be async for API calls or state updates
	 * @example onClick: async () => { await copyToClipboard(text); }
	 */
	onClick?: (event?: MouseEvent) => unknown;

	/**
	 * Disabled state (prevents interaction)
	 * When true, icon is grayed out and non-clickable
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Visual variant
	 * Changes color scheme based on icon's purpose
	 * @default "default"
	 */
	variant?: IconVariant;

	/**
	 * Current state (for visual feedback)
	 * Provides dynamic visual indication (e.g., success after copy)
	 * @default "default"
	 */
	state?: IconState;

	/**
	 * Custom CSS classes
	 * Additional Tailwind classes or custom styles
	 */
	class?: string;

	/**
	 * ARIA label override
	 * If different from tooltip label, use this for screen readers
	 */
	ariaLabel?: string;
}

/**
 * Position coordinates for absolute positioning mode
 *
 * Defines where the icon grid should be positioned within parent.
 * All values are CSS position values (e.g., "1rem", "10px", "0").
 */
export interface IconGridPosition {
	/**
	 * Distance from top edge
	 * @example "0.5rem" | "10px" | "0"
	 */
	top?: string;

	/**
	 * Distance from right edge
	 * @example "0.5rem" | "10px" | "0"
	 */
	right?: string;

	/**
	 * Distance from bottom edge
	 * @example "0.5rem" | "10px" | "0"
	 */
	bottom?: string;

	/**
	 * Distance from left edge
	 * @example "0.5rem" | "10px" | "0"
	 */
	left?: string;
}

/**
 * IconGrid component props
 *
 * Complete configuration interface for the IconGrid component.
 * Extends HTMLAttributes to allow data-testid and other HTML attributes.
 */
export interface IconGridProps extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
	/**
	 * Array of icon configurations
	 * Each icon is rendered in the grid according to its properties
	 */
	icons: IconItem[];

	/**
	 * Positioning strategy: 'absolute' (top-right) or 'inline' (flexbox)
	 * @default "inline"
	 */
	positioning?: IconGridPositioning;

	/**
	 * Icon size in pixels or CSS unit
	 * @default "20px" (from settings.ts)
	 * @example "24px" | "1.5rem" | 20
	 */
	iconSize?: string | number;

	/**
	 * Gap between icons (CSS gap property)
	 * @default "0.5rem" (from settings.ts)
	 * @example "0.25rem" | "8px"
	 */
	gap?: string;

	/**
	 * Number of columns (for inline mode)
	 * @default "auto" - icons flow naturally
	 * @example 3 - exactly 3 columns | "auto-fit" - responsive columns
	 */
	columns?: number | "auto" | "auto-fit";

	/**
	 * Grid alignment
	 * @default "center"
	 */
	alignment?: IconGridAlignment;

	/**
	 * Enable tooltip functionality
	 * When true, uses shadcn-svelte Tooltip component
	 * When false, uses native title attribute
	 * @default true (from settings.ts)
	 */
	showTooltips?: boolean;

	/**
	 * Custom CSS classes for grid container
	 * Additional Tailwind classes or custom styles
	 */
	class?: string;

	/**
	 * Absolute positioning coordinates (for absolute mode)
	 * Defines where grid is positioned within parent
	 * @default { top: "0.5rem", right: "0.5rem" }
	 * @example { top: "1rem", right: "1rem" } - top-right with padding
	 * @example { bottom: "0", right: "0" } - bottom-right flush
	 */
	position?: IconGridPosition;
}
