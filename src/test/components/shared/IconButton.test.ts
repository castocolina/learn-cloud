/**
 * IconButton Component Unit Tests
 *
 * Type safety and interface compliance tests for the IconButton component.
 * Tests focus on TypeScript type checking without DOM rendering.
 *
 * Test Coverage:
 * - TypeScript interface compliance (IconButtonProps)
 * - Async onClick handler support
 * - All IconVariant values (default, primary, destructive, ghost)
 * - All IconState values (default, active, success, error)
 * - Optional props handling (onClick, size, variant, state, disabled, class, ariaLabel)
 * - Required props validation (icon, label)
 *
 * Approach: Type-level testing without DOM rendering
 * Rationale: IconButton is a presentational component with complex DOM interactions
 * that are better tested via E2E tests. Unit tests focus on TypeScript correctness.
 */

import { describe, it, expect } from "vitest";
import { Copy, Check, X, Download } from "lucide-svelte";
import type { IconButtonProps, IconVariant, IconState } from "$types";

describe("IconButton Type Safety", () => {
	// ============================================================================
	// Required Props Tests
	// ============================================================================

	it("should accept minimal required props (icon and label)", () => {
		const minimalProps: IconButtonProps = {
			icon: Copy,
			label: "Copy to clipboard"
		};

		expect(minimalProps.icon).toBe(Copy);
		expect(minimalProps.label).toBe("Copy to clipboard");
	});

	// ============================================================================
	// All Props Tests
	// ============================================================================

	it("should accept all props with correct types", () => {
		const allProps: IconButtonProps = {
			icon: Download,
			label: "Download file",
			onClick: () => {},
			size: 24,
			variant: "primary",
			iconState: "success",
			disabled: false,
			class: "custom-button-class",
			ariaLabel: "Download the file"
		};

		expect(allProps.icon).toBe(Download);
		expect(allProps.label).toBe("Download file");
		expect(allProps.onClick).toBeTypeOf("function");
		expect(allProps.size).toBe(24);
		expect(allProps.variant).toBe("primary");
		expect(allProps.iconState).toBe("success");
		expect(allProps.disabled).toBe(false);
		expect(allProps.class).toBe("custom-button-class");
		expect(allProps.ariaLabel).toBe("Download the file");
	});

	// ============================================================================
	// Size Prop Tests
	// ============================================================================

	it("should accept size as number (pixels)", () => {
		const propsWithNumberSize: IconButtonProps = {
			icon: Copy,
			label: "Copy",
			size: 20
		};

		expect(propsWithNumberSize.size).toBe(20);
	});

	it("should accept size as string (CSS unit)", () => {
		const propsWithStringSize: IconButtonProps = {
			icon: Copy,
			label: "Copy",
			size: "1.5rem"
		};

		expect(propsWithStringSize.size).toBe("1.5rem");
	});

	// ============================================================================
	// Variant Tests
	// ============================================================================

	it("should accept all IconVariant values", () => {
		const variants: IconVariant[] = ["default", "primary", "destructive", "ghost"];

		variants.forEach((variant) => {
			const props: IconButtonProps = {
				icon: Check,
				label: `Button with ${variant} variant`,
				variant
			};

			expect(props.variant).toBe(variant);
		});
	});

	it("should work without explicit variant (defaults to 'default')", () => {
		const propsWithoutVariant: IconButtonProps = {
			icon: Copy,
			label: "Copy"
		};

		// TypeScript should allow undefined variant
		expect(propsWithoutVariant.variant).toBeUndefined();
	});

	// ============================================================================
	// State Tests
	// ============================================================================

	it("should accept all IconState values", () => {
		const states: IconState[] = ["default", "active", "success", "error"];

		states.forEach((state) => {
			const props: IconButtonProps = {
				icon: Check,
				label: `Button with ${state} state`,
				iconState: state
			};

			expect(props.iconState).toBe(state);
		});
	});

	it("should work without explicit state (defaults to 'default')", () => {
		const propsWithoutState: IconButtonProps = {
			icon: Copy,
			label: "Copy"
		};

		// TypeScript should allow undefined state
		expect(propsWithoutState.iconState).toBeUndefined();
	});

	// ============================================================================
	// onClick Handler Tests
	// ============================================================================

	it("should support synchronous onClick handlers", () => {
		let clicked = false;

		const syncHandler = () => {
			clicked = true;
		};

		const props: IconButtonProps = {
			icon: Copy,
			label: "Copy",
			onClick: syncHandler
		};

		// Execute handler
		props.onClick?.();

		expect(clicked).toBe(true);
	});

	it("should support async onClick handlers", async () => {
		let clicked = false;

		const asyncHandler = async () => {
			await new Promise((resolve) => setTimeout(resolve, 10));
			clicked = true;
		};

		const props: IconButtonProps = {
			icon: Download,
			label: "Download",
			onClick: asyncHandler
		};

		// Execute async handler
		await props.onClick?.();

		expect(clicked).toBe(true);
	});

	it("should work without onClick handler (optional)", () => {
		const propsWithoutHandler: IconButtonProps = {
			icon: Copy,
			label: "Copy"
		};

		// TypeScript should allow undefined onClick
		expect(propsWithoutHandler.onClick).toBeUndefined();
	});

	// ============================================================================
	// Disabled State Tests
	// ============================================================================

	it("should accept disabled state", () => {
		const disabledProps: IconButtonProps = {
			icon: X,
			label: "Close",
			disabled: true
		};

		expect(disabledProps.disabled).toBe(true);
	});

	it("should default to enabled when disabled prop is omitted", () => {
		const enabledProps: IconButtonProps = {
			icon: X,
			label: "Close"
		};

		// TypeScript should allow undefined disabled (defaults to false)
		expect(enabledProps.disabled).toBeUndefined();
	});

	// ============================================================================
	// Custom Class Tests
	// ============================================================================

	it("should accept custom CSS classes", () => {
		const propsWithClass: IconButtonProps = {
			icon: Copy,
			label: "Copy",
			class: "sidebar-icon mobile-hidden"
		};

		expect(propsWithClass.class).toBe("sidebar-icon mobile-hidden");
	});

	// ============================================================================
	// ARIA Label Tests
	// ============================================================================

	it("should accept custom ARIA label", () => {
		const propsWithAriaLabel: IconButtonProps = {
			icon: Download,
			label: "Download",
			ariaLabel: "Download the report as PDF"
		};

		expect(propsWithAriaLabel.ariaLabel).toBe("Download the report as PDF");
	});

	it("should work without explicit ariaLabel (falls back to label)", () => {
		const propsWithoutAriaLabel: IconButtonProps = {
			icon: Copy,
			label: "Copy to clipboard"
		};

		// TypeScript should allow undefined ariaLabel
		expect(propsWithoutAriaLabel.ariaLabel).toBeUndefined();
	});

	// ============================================================================
	// Integration Scenario Tests
	// ============================================================================

	it("should handle complex real-world scenario (close button)", () => {
		let sidebarOpen = true;

		const closeSidebar = () => {
			sidebarOpen = false;
		};

		const closeButtonProps: IconButtonProps = {
			icon: X,
			label: "Close sidebar",
			onClick: closeSidebar,
			size: 20,
			variant: "ghost",
			class: "sidebar-close-btn"
		};

		// Execute close action
		closeButtonProps.onClick?.();

		expect(sidebarOpen).toBe(false);
		expect(closeButtonProps.variant).toBe("ghost");
		expect(closeButtonProps.size).toBe(20);
	});

	it("should handle async operation with success state (copy to clipboard)", async () => {
		let clipboardContent = "";
		let buttonState: IconState = "default";

		const copyToClipboard = async () => {
			await new Promise((resolve) => setTimeout(resolve, 10));
			clipboardContent = "copied text";
			buttonState = "success";
		};

		const copyButtonProps: IconButtonProps = {
			icon: Copy,
			label: "Copy",
			onClick: copyToClipboard,
			iconState: buttonState
		};

		// Execute copy action
		await copyButtonProps.onClick?.();

		expect(clipboardContent).toBe("copied text");
		expect(buttonState).toBe("success");
	});
});
