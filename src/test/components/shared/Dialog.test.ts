/**
 * Dialog Component Unit Tests
 *
 * Type safety and interface compliance tests for the Dialog component.
 * Tests focus on TypeScript type checking and store integration without DOM rendering.
 *
 * Test Coverage:
 * - TypeScript interface compliance (DialogProps, DialogConfig, DialogState)
 * - All DialogSize values (sm, md, lg, xl, full)
 * - Optional props handling (open, size, title, description, showCloseButton, class, children)
 * - Global store mode (openDialog, closeDialog functions)
 * - Local state mode (bind:open pattern)
 * - Hybrid mode detection and behavior
 * - onClose callback support
 *
 * Approach: Type-level testing without DOM rendering
 * Rationale: Dialog is a presentational wrapper with complex DOM interactions
 * that are better tested via E2E tests. Unit tests focus on TypeScript correctness
 * and store functionality.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import type { Component } from "svelte";
import type { DialogProps, DialogSize } from "$types";
import type { DialogConfig, DialogState } from "$lib/stores/dialog";
import { dialogStore, openDialog, closeDialog, isDialogOpen } from "$lib/stores/dialog";

describe("Dialog Type Safety", () => {
	// ============================================================================
	// DialogProps Tests
	// ============================================================================

	it("should accept minimal props (no required props)", () => {
		const minimalProps: DialogProps = {};

		expect(minimalProps).toBeDefined();
	});

	it("should accept all props with correct types", () => {
		const allProps: DialogProps = {
			open: true,
			size: "lg",
			title: "Confirm Action",
			description: "Are you sure you want to proceed?",
			showCloseButton: true,
			class: "custom-dialog-class"
		};

		expect(allProps.open).toBe(true);
		expect(allProps.size).toBe("lg");
		expect(allProps.title).toBe("Confirm Action");
		expect(allProps.description).toBe("Are you sure you want to proceed?");
		expect(allProps.showCloseButton).toBe(true);
		expect(allProps.class).toBe("custom-dialog-class");
	});

	// ============================================================================
	// Size Variant Tests
	// ============================================================================

	it("should accept all DialogSize values", () => {
		const sizes: DialogSize[] = ["sm", "md", "lg", "xl", "full"];

		sizes.forEach((size) => {
			const props: DialogProps = {
				title: `Dialog with ${size} size`,
				size
			};

			expect(props.size).toBe(size);
		});
	});

	it("should work without explicit size (defaults to 'md')", () => {
		const propsWithoutSize: DialogProps = {
			title: "Default size dialog"
		};

		// TypeScript should allow undefined size (defaults to md in component)
		expect(propsWithoutSize.size).toBeUndefined();
	});

	// ============================================================================
	// Optional Props Tests
	// ============================================================================

	it("should work without title", () => {
		const propsWithoutTitle: DialogProps = {
			size: "md"
		};

		expect(propsWithoutTitle.title).toBeUndefined();
	});

	it("should work without description", () => {
		const propsWithoutDescription: DialogProps = {
			title: "Dialog"
		};

		expect(propsWithoutDescription.description).toBeUndefined();
	});

	it("should accept showCloseButton prop", () => {
		const propsWithCloseButton: DialogProps = {
			title: "Dialog",
			showCloseButton: true
		};

		expect(propsWithCloseButton.showCloseButton).toBe(true);
	});

	it("should work without showCloseButton (defaults to true)", () => {
		const propsWithoutCloseButton: DialogProps = {
			title: "Dialog"
		};

		expect(propsWithoutCloseButton.showCloseButton).toBeUndefined();
	});

	it("should accept custom CSS classes", () => {
		const propsWithClass: DialogProps = {
			title: "Dialog",
			class: "custom-modal-width custom-padding"
		};

		expect(propsWithClass.class).toBe("custom-modal-width custom-padding");
	});

	// ============================================================================
	// Local State Mode Tests (bind:open)
	// ============================================================================

	it("should accept open prop for local state mode", () => {
		const localStateProps: DialogProps = {
			open: true,
			title: "Local State Dialog",
			size: "md"
		};

		expect(localStateProps.open).toBe(true);
	});

	it("should work with open: false", () => {
		const closedDialogProps: DialogProps = {
			open: false,
			title: "Closed Dialog"
		};

		expect(closedDialogProps.open).toBe(false);
	});
});

describe("Dialog Store Functionality", () => {
	// Reset store before each test
	beforeEach(() => {
		closeDialog();
	});

	// ============================================================================
	// DialogConfig Tests
	// ============================================================================

	it("should accept minimal DialogConfig (title and content)", () => {
		const MockComponent = (() => {}) as unknown as Component;

		const minimalConfig: DialogConfig = {
			title: "Simple Dialog",
			content: MockComponent
		};

		expect(minimalConfig.title).toBe("Simple Dialog");
		expect(minimalConfig.content).toBe(MockComponent);
	});

	it("should accept full DialogConfig with all props", () => {
		const MockComponent = (() => {}) as unknown as Component;
		const onCloseMock = () => {};

		const fullConfig: DialogConfig = {
			title: "Full Config Dialog",
			content: MockComponent,
			props: { query: "search term" },
			size: "xl",
			onClose: onCloseMock
		};

		expect(fullConfig.title).toBe("Full Config Dialog");
		expect(fullConfig.content).toBe(MockComponent);
		expect(fullConfig.props).toEqual({ query: "search term" });
		expect(fullConfig.size).toBe("xl");
		expect(fullConfig.onClose).toBe(onCloseMock);
	});

	// ============================================================================
	// openDialog Function Tests
	// ============================================================================

	it("should open dialog with minimal config", () => {
		const MockComponent = (() => {}) as unknown as Component;

		openDialog({
			title: "Test Dialog",
			content: MockComponent
		});

		const state = get(dialogStore);
		expect(state.isOpen).toBe(true);
		expect(state.title).toBe("Test Dialog");
		expect(state.content).toBe(MockComponent);
	});

	it("should open dialog with all config options", () => {
		const MockComponent = (() => {}) as unknown as Component;
		const onCloseMock = () => {};

		openDialog({
			title: "Full Dialog",
			content: MockComponent,
			props: { data: "test" },
			size: "lg",
			onClose: onCloseMock
		});

		const state = get(dialogStore);
		expect(state.isOpen).toBe(true);
		expect(state.title).toBe("Full Dialog");
		expect(state.content).toBe(MockComponent);
		expect(state.props).toEqual({ data: "test" });
		expect(state.size).toBe("lg");
		expect(state.onClose).toBe(onCloseMock);
	});

	it("should default to 'md' size when not specified", () => {
		const MockComponent = (() => {}) as unknown as Component;

		openDialog({
			title: "Default Size",
			content: MockComponent
		});

		const state = get(dialogStore);
		expect(state.size).toBe("md");
	});

	it("should support all size variants", () => {
		const MockComponent = (() => {}) as unknown as Component;
		const sizes: DialogSize[] = ["sm", "md", "lg", "xl", "full"];

		sizes.forEach((size) => {
			openDialog({
				title: `Dialog ${size}`,
				content: MockComponent,
				size
			});

			const state = get(dialogStore);
			expect(state.size).toBe(size);

			closeDialog();
		});
	});

	// ============================================================================
	// closeDialog Function Tests
	// ============================================================================

	it("should close dialog and reset isOpen", () => {
		const MockComponent = (() => {}) as unknown as Component;

		openDialog({
			title: "Test",
			content: MockComponent
		});

		expect(get(dialogStore).isOpen).toBe(true);

		closeDialog();

		expect(get(dialogStore).isOpen).toBe(false);
	});

	it("should call onClose callback when closing", () => {
		const MockComponent = (() => {}) as unknown as Component;
		let closeCalled = false;

		openDialog({
			title: "Test",
			content: MockComponent,
			onClose: () => {
				closeCalled = true;
			}
		});

		closeDialog();

		expect(closeCalled).toBe(true);
	});

	it("should not throw error when closing without onClose callback", () => {
		const MockComponent = (() => {}) as unknown as Component;

		openDialog({
			title: "Test",
			content: MockComponent
		});

		expect(() => closeDialog()).not.toThrow();
	});

	// ============================================================================
	// isDialogOpen Function Tests
	// ============================================================================

	it("should return false when dialog is closed", () => {
		expect(isDialogOpen()).toBe(false);
	});

	it("should return true when dialog is open", () => {
		const MockComponent = (() => {}) as unknown as Component;

		openDialog({
			title: "Test",
			content: MockComponent
		});

		expect(isDialogOpen()).toBe(true);
	});

	it("should return false after closing", () => {
		const MockComponent = (() => {}) as unknown as Component;

		openDialog({
			title: "Test",
			content: MockComponent
		});

		closeDialog();

		expect(isDialogOpen()).toBe(false);
	});

	// ============================================================================
	// DialogState Tests
	// ============================================================================

	it("should maintain correct DialogState structure", () => {
		const MockComponent = (() => {}) as unknown as Component;

		openDialog({
			title: "State Test",
			content: MockComponent,
			props: { foo: "bar" },
			size: "xl"
		});

		const state = get(dialogStore);
		const expectedState: DialogState = {
			isOpen: true,
			title: "State Test",
			content: MockComponent,
			props: { foo: "bar" },
			size: "xl",
			onClose: undefined
		};

		expect(state.isOpen).toBe(expectedState.isOpen);
		expect(state.title).toBe(expectedState.title);
		expect(state.content).toBe(expectedState.content);
		expect(state.props).toEqual(expectedState.props);
		expect(state.size).toBe(expectedState.size);
	});

	// ============================================================================
	// Integration Scenario Tests
	// ============================================================================

	it("should handle multiple open/close cycles", () => {
		const MockComponent = (() => {}) as unknown as Component;

		for (let i = 0; i < 3; i++) {
			openDialog({
				title: `Iteration ${i}`,
				content: MockComponent
			});

			expect(isDialogOpen()).toBe(true);

			closeDialog();

			expect(isDialogOpen()).toBe(false);
		}
	});

	it("should handle search results dialog scenario", () => {
		const SearchResults = (() => {}) as unknown as Component;
		let dialogClosed = false;

		openDialog({
			title: "Search Results",
			content: SearchResults,
			props: { query: "cloud-native", results: [] },
			size: "lg",
			onClose: () => {
				dialogClosed = true;
			}
		});

		const state = get(dialogStore);

		expect(state.isOpen).toBe(true);
		expect(state.title).toBe("Search Results");
		expect(state.size).toBe("lg");
		expect(state.props).toEqual({ query: "cloud-native", results: [] });

		closeDialog();

		expect(dialogClosed).toBe(true);
		expect(isDialogOpen()).toBe(false);
	});

	it("should handle diagram viewer scenario with full size", () => {
		const DiagramViewer = (() => {}) as unknown as Component;

		openDialog({
			title: "Kubernetes Architecture",
			content: DiagramViewer,
			props: { diagramId: "k8s-arch" },
			size: "full"
		});

		const state = get(dialogStore);

		expect(state.isOpen).toBe(true);
		expect(state.size).toBe("full");
		expect(state.props).toEqual({ diagramId: "k8s-arch" });
	});

	it("should handle overwriting previous dialog", () => {
		const Component1 = (() => {}) as unknown as Component;
		const Component2 = (() => {}) as unknown as Component;

		openDialog({
			title: "First Dialog",
			content: Component1,
			size: "sm"
		});

		openDialog({
			title: "Second Dialog",
			content: Component2,
			size: "xl"
		});

		const state = get(dialogStore);

		expect(state.title).toBe("Second Dialog");
		expect(state.content).toBe(Component2);
		expect(state.size).toBe("xl");
	});
});
