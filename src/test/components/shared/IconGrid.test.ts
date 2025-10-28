/**
 * IconGrid Component Unit Tests (DRY Architecture)
 *
 * Type safety and interface compliance tests for the IconGrid component.
 * Tests focus on TypeScript type checking and composition architecture.
 *
 * ARCHITECTURE NOTES:
 * IconGrid now uses IconButton internally (composition pattern).
 * All interactivity logic is handled by IconButton, IconGrid only provides layout.
 * These tests verify that IconGrid's props and IconItem interface work correctly.
 *
 * Note: Full interactive testing requires @testing-library/svelte setup.
 * Complex interaction tests should be added to IconButton.test.ts.
 */

import { describe, it, expect } from "vitest";
import { Copy, Check, X } from "lucide-svelte";
import type { IconItem, IconGridProps } from "$types";

describe("IconGrid Type Safety", () => {
	describe("IconItem Interface", () => {
		it("should accept valid IconItem with all properties", () => {
			const validIcon: IconItem = {
				id: "test",
				icon: Copy,
				label: "Test Label",
				onClick: () => {},
				disabled: false,
				variant: "primary",
				state: "default",
				class: "custom-class",
				ariaLabel: "Custom ARIA Label"
			};

			expect(validIcon.id).toBe("test");
			expect(validIcon.label).toBe("Test Label");
			expect(validIcon.variant).toBe("primary");
		});

		it("should accept minimal IconItem", () => {
			const minimalIcon: IconItem = {
				id: "minimal",
				icon: Check,
				label: "Minimal"
			};

			expect(minimalIcon.id).toBe("minimal");
			expect(minimalIcon.label).toBe("Minimal");
		});

		it("should allow all variant values", () => {
			const variants: IconItem["variant"][] = ["default", "primary", "destructive", "ghost"];
			variants.forEach((variant) => {
				const icon: IconItem = { id: "test", icon: X, label: "Test", variant };
				expect(icon.variant).toBe(variant);
			});
		});

		it("should allow all state values", () => {
			const states: IconItem["state"][] = ["default", "active", "success", "error"];
			states.forEach((state) => {
				const icon: IconItem = { id: "test", icon: Copy, label: "Test", state };
				expect(icon.state).toBe(state);
			});
		});
	});

	describe("IconGridProps Interface", () => {
		it("should accept valid IconGridProps with all properties", () => {
			const mockIcons: IconItem[] = [
				{ id: "icon1", icon: Copy, label: "Icon 1" },
				{ id: "icon2", icon: Check, label: "Icon 2" }
			];

			const validProps: IconGridProps = {
				icons: mockIcons,
				positioning: "absolute",
				iconSize: "24px",
				gap: "0.5rem",
				columns: 3,
				alignment: "center",
				showTooltips: true,
				class: "custom-grid",
				position: { top: "1rem", right: "1rem" }
			};

			expect(validProps.positioning).toBe("absolute");
			expect(validProps.iconSize).toBe("24px");
			expect(validProps.columns).toBe(3);
		});

		it("should accept minimal IconGridProps", () => {
			const mockIcons: IconItem[] = [{ id: "icon1", icon: Copy, label: "Icon 1" }];
			const minimalProps: IconGridProps = { icons: mockIcons };

			expect(minimalProps.icons.length).toBe(1);
		});

		it("should allow positioning values", () => {
			const mockIcons: IconItem[] = [{ id: "icon1", icon: Copy, label: "Icon 1" }];
			const positions: IconGridProps["positioning"][] = ["absolute", "inline"];

			positions.forEach((positioning) => {
				const props: IconGridProps = { icons: mockIcons, positioning };
				expect(props.positioning).toBe(positioning);
			});
		});

		it("should allow alignment values", () => {
			const mockIcons: IconItem[] = [{ id: "icon1", icon: Copy, label: "Icon 1" }];
			const alignments: IconGridProps["alignment"][] = ["start", "center", "end", "stretch"];

			alignments.forEach((alignment) => {
				const props: IconGridProps = { icons: mockIcons, alignment };
				expect(props.alignment).toBe(alignment);
			});
		});

		it("should accept numeric iconSize", () => {
			const mockIcons: IconItem[] = [{ id: "icon1", icon: Copy, label: "Icon 1" }];
			const props: IconGridProps = { icons: mockIcons, iconSize: 32 };

			expect(props.iconSize).toBe(32);
		});

		it("should accept string iconSize", () => {
			const mockIcons: IconItem[] = [{ id: "icon1", icon: Copy, label: "Icon 1" }];
			const props: IconGridProps = { icons: mockIcons, iconSize: "1.5rem" };

			expect(props.iconSize).toBe("1.5rem");
		});

		it("should accept columns as number", () => {
			const mockIcons: IconItem[] = [{ id: "icon1", icon: Copy, label: "Icon 1" }];
			const props: IconGridProps = { icons: mockIcons, columns: 4 };

			expect(props.columns).toBe(4);
		});

		it("should accept columns as string", () => {
			const mockIcons: IconItem[] = [{ id: "icon1", icon: Copy, label: "Icon 1" }];
			const columnValues: IconGridProps["columns"][] = ["auto", "auto-fit"];

			columnValues.forEach((columns) => {
				const props: IconGridProps = { icons: mockIcons, columns };
				expect(props.columns).toBe(columns);
			});
		});

		it("should accept position coordinates", () => {
			const mockIcons: IconItem[] = [{ id: "icon1", icon: Copy, label: "Icon 1" }];
			const props: IconGridProps = {
				icons: mockIcons,
				positioning: "absolute",
				position: {
					top: "1rem",
					right: "2rem",
					bottom: "0",
					left: "0.5rem"
				}
			};

			expect(props.position?.top).toBe("1rem");
			expect(props.position?.right).toBe("2rem");
		});
	});

	describe("Component Integration", () => {
		it("should work with lucide-svelte icons", () => {
			const icons: IconItem[] = [
				{ id: "copy", icon: Copy, label: "Copy" },
				{ id: "check", icon: Check, label: "Check" },
				{ id: "close", icon: X, label: "Close" }
			];

			expect(icons.length).toBe(3);
			expect(icons[0].icon).toBe(Copy);
			expect(icons[1].icon).toBe(Check);
			expect(icons[2].icon).toBe(X);
		});

		it("should support async onClick handlers", async () => {
			let clicked = false;
			const asyncHandler = async () => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				clicked = true;
			};

			const icon: IconItem = {
				id: "async",
				icon: Copy,
				label: "Async Test",
				onClick: asyncHandler
			};

			await icon.onClick?.();
			expect(clicked).toBe(true);
		});

		it("should support undefined onClick handlers", () => {
			const icon: IconItem = {
				id: "no-click",
				icon: Copy,
				label: "No Click Handler"
			};

			expect(icon.onClick).toBeUndefined();
		});
	});
});
