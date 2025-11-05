import { writable, get } from "svelte/store";
import type { Component } from "svelte";
import type { DialogActionButtonsConfig } from "$types";

/**
 * Dialog Store - Global Dialog State Management
 *
 * Purpose: Provides global dialog functionality allowing any component to trigger
 * dialogs without prop drilling. Used by Search (8M), Flipcards (8H), Diagrams (8G),
 * and Code Blocks (8F).
 *
 * Architecture:
 * - Store-based: Uses Svelte writable store for reactive state
 * - Component Rendering: Supports dynamic Svelte component rendering
 * - Size Variants: sm, md, lg, xl, full
 * - Mobile-First: Full-screen on ≤390px, size variants on desktop
 *
 * Usage Example:
 * ```typescript
 * import { openDialog } from '$lib/stores/dialog';
 * import SearchResults from './SearchResults.svelte';
 *
 * openDialog({
 *   title: "Search Results",
 *   content: SearchResults,
 *   size: "lg",
 *   props: { query: "cloud-native" }
 * });
 * ```
 *
 * Related Components:
 * - src/lib/components/shared/Dialog.svelte (consumes this store)
 * - TASK 8E: Dialog Component Development
 */

/**
 * Dialog size variants
 *
 * Mobile (≤390px): All sizes render as full-screen
 * Desktop (≥1024px):
 * - sm: ~384px (compact dialogs)
 * - md: ~448px (standard dialogs)
 * - lg: ~512px (large content, search results)
 * - xl: ~576px (extra large forms)
 * - 2xl: ~672px (extra large content)
 * - 3xl: ~768px (full detailed views)
 * - full: 90-95% viewport (diagram viewer)
 */
export type DialogSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";

/**
 * Dialog configuration interface
 *
 * Used when opening a new dialog with openDialog()
 */
export interface DialogConfig {
	/** Dialog title displayed in header */
	title: string;

	/** Svelte component to render as dialog content */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	content: Component<any>;

	/** Props to pass to the rendered component */
	props?: Record<string, unknown>;

	/** Size variant (mobile: always full-screen, desktop: varies) */
	size?: DialogSize;

	/** Action buttons with intelligent positioning (legacy single-group mode) */
	actionButtons?: DialogActionButtonsConfig;

	/** Top action buttons group (NEW - dual-group mode, e.g., Download button) */
	topActionButtons?: DialogActionButtonsConfig;

	/** Bottom action buttons group (NEW - dual-group mode, e.g., 3×3 navigation grid) */
	bottomActionButtons?: DialogActionButtonsConfig;

	/** Optional callback when dialog closes */
	onClose?: () => void;
}

/**
 * Dialog state interface
 *
 * Internal state combining config + open status
 */
export interface DialogState extends DialogConfig {
	/** Whether dialog is currently open */
	isOpen: boolean;
}

/**
 * Initial dialog state
 *
 * Default closed state with empty configuration
 */
const initialState: DialogState = {
	isOpen: false,
	title: "",
	content: null as unknown as Component,
	props: {},
	size: "md",
	onClose: undefined
};

/**
 * Dialog store
 *
 * Reactive store for global dialog state
 * Consumed by Dialog component in src/lib/components/shared/Dialog.svelte
 */
export const dialogStore = writable<DialogState>(initialState);

/**
 * Open dialog with configuration
 *
 * @param config - Dialog configuration (title, content, size, etc.)
 *
 * @example
 * ```typescript
 * openDialog({
 *   title: "Confirm Action",
 *   content: ConfirmDialog,
 *   size: "sm",
 *   props: { message: "Are you sure?" },
 *   onClose: () => console.log("Dialog closed")
 * });
 * ```
 */
export function openDialog(config: DialogConfig): void {
	// Race condition protection: Close existing dialog first if already open
	// This prevents duplicate dialogs from rapid clicks
	const currentState = get(dialogStore);
	if (currentState.isOpen) {
		// Close current dialog first
		dialogStore.update((state) => ({
			...state,
			isOpen: false
		}));
		// Trigger onClose callback for the previous dialog
		currentState.onClose?.();
	}

	// Open new dialog
	dialogStore.set({
		...config,
		isOpen: true,
		size: config.size || "md" // Default to medium size
	});
}

/**
 * Close current dialog
 *
 * Triggers onClose callback if provided and resets state
 *
 * @example
 * ```typescript
 * import { closeDialog } from '$lib/stores/dialog';
 *
 * function handleCancel() {
 *   closeDialog();
 * }
 * ```
 */
export function closeDialog(): void {
	// Get current state before closing
	const currentState = get(dialogStore);

	// Update state to closed
	dialogStore.update((state) => ({
		...state,
		isOpen: false
	}));

	// Trigger onClose callback if provided
	currentState.onClose?.();
}

/**
 * Check if dialog is currently open
 *
 * Utility function for reactive checks
 *
 * @returns boolean indicating if dialog is open
 */
export function isDialogOpen(): boolean {
	return get(dialogStore).isOpen;
}
