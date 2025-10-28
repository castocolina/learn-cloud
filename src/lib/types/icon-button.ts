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

import type { ComponentType, SvelteComponent } from "svelte";
import type { HTMLButtonAttributes } from "svelte/elements";
import type { IconVariant, IconState } from "./icon-grid.js";

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
	 */
	icon: ComponentType<SvelteComponent>;

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
	 * Disabled state (no interaction)
	 * @default false
	 */
	disabled?: boolean;

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
