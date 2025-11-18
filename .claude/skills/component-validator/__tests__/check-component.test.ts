/**
 * Test Suite for Component Integration Guardian
 *
 * Tests 5 validation categories for Svelte components:
 * 1. Props interface completeness
 * 2. Theme compliance (CSS variables vs hardcoded colors)
 * 3. Mobile-first implementation (≤390px)
 * 4. Accessibility (WCAG 2.1 AA)
 * 5. Showcase vs production consistency
 *
 * Coverage target: ≥90%
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync } from "fs";
import { join } from "path";
import { ExtendedTestSetup } from "../../../../src/test/helpers/test-setup";
import { generateConfigId } from "../../../../src/test/helpers/test-utils";
import { validateComponent, type ComponentViolation } from "../scripts/check-component";

/**
 * Test setup for component validation
 */
class ComponentTestSetup extends ExtendedTestSetup {
	public configId: string;
	public componentPath: string;

	constructor(testSuiteId: string = "main") {
		super("scripts", `component-${testSuiteId}`);
		this.configId = generateConfigId("test-component", testSuiteId);
		this.componentPath = join(this.tempDir, "TestComponent.svelte");
	}

	/**
	 * Write Svelte component code to test file
	 */
	writeComponent(code: string): void {
		writeFileSync(this.componentPath, code, "utf-8");
	}
}

describe("Component Integration Guardian - Props Interface", () => {
	let testSetup: ComponentTestSetup;

	beforeEach(() => {
		testSetup = new ComponentTestSetup("props");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for component with proper props interface", () => {
			const component = `
<script lang="ts">
	interface ButtonProps {
		label: string;
		variant?: "primary" | "secondary";
	}

	const { label, variant = "primary" }: ButtonProps = $props();
</script>

<button class="btn btn-{variant}">{label}</button>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const propsViolations = result.violations.filter((v) => v.category === "Props Interface");
			expect(propsViolations).toHaveLength(0);
		});

		it("should pass for component without props", () => {
			const component = `
<script lang="ts">
	let count = $state(0);
</script>

<button onclick={() => count++}>Count: {count}</button>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const propsViolations = result.violations.filter((v) => v.category === "Props Interface");
			expect(propsViolations).toHaveLength(0);
		});

		it("should pass for inline type annotation", () => {
			const component = `
<script lang="ts">
	const { title, description }: { title: string; description?: string } = $props();
</script>

<div>{title}</div>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const propsViolations = result.violations.filter((v) => v.category === "Props Interface");
			expect(propsViolations).toHaveLength(0);
		});
	});

	describe("Negative Cases", () => {
		it("should detect props without TypeScript interface", () => {
			const component = `
<script lang="ts">
	const { label } = $props();
</script>

<button>{label}</button>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const propsViolations = result.violations.filter((v) => v.category === "Props Interface");
			expect(propsViolations.length).toBeGreaterThan(0);
			expect(propsViolations[0].severity).toBe("high");
		});

		it("should detect any type in props", () => {
			const component = `
<script lang="ts">
	interface ButtonProps {
		data: any;
	}

	const { data }: ButtonProps = $props();
</script>

<div>{data}</div>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const propsViolations = result.violations.filter((v) => v.category === "Props Interface");
			expect(propsViolations.length).toBeGreaterThan(0);
			expect(propsViolations.some((v) => v.found?.includes("any"))).toBe(true);
		});
	});
});

describe("Component Integration Guardian - Theme Compliance", () => {
	let testSetup: ComponentTestSetup;

	beforeEach(() => {
		testSetup = new ComponentTestSetup("theme");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for Tailwind classes", () => {
			const component = `
<script lang="ts">
	const { label }: { label: string } = $props();
</script>

<button class="bg-primary text-white hover:bg-primary-dark">{label}</button>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const themeViolations = result.violations.filter((v) => v.category === "Theme Compliance");
			expect(themeViolations).toHaveLength(0);
		});

		it("should pass for CSS variables", () => {
			const component = `
<script lang="ts">
	const { label }: { label: string } = $props();
</script>

<button style="background-color: var(--color-primary)">{label}</button>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const themeViolations = result.violations.filter((v) => v.category === "Theme Compliance");
			expect(themeViolations).toHaveLength(0);
		});

		it("should pass for hex colors in comments", () => {
			const component = `
<script lang="ts">
	// Color reference: #3b82f6 (primary blue)
	const { label }: { label: string } = $props();
</script>

<button class="bg-primary">{label}</button>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const themeViolations = result.violations.filter((v) => v.category === "Theme Compliance");
			expect(themeViolations).toHaveLength(0);
		});
	});

	describe("Negative Cases", () => {
		it("should detect hardcoded hex colors", () => {
			const component = `
<script lang="ts">
	const { label }: { label: string } = $props();
</script>

<button style="background-color: #3b82f6">{label}</button>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const themeViolations = result.violations.filter((v) => v.category === "Theme Compliance");
			expect(themeViolations.length).toBeGreaterThan(0);
			expect(themeViolations[0].severity).toBe("blocking");
			expect(themeViolations[0].found).toContain("#3b82f6");
		});

		it("should detect hardcoded RGB colors", () => {
			const component = `
<script lang="ts">
	const { label }: { label: string } = $props();
</script>

<button style="color: rgb(59, 130, 246)">{label}</button>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const themeViolations = result.violations.filter((v) => v.category === "Theme Compliance");
			expect(themeViolations.length).toBeGreaterThan(0);
			expect(themeViolations[0].severity).toBe("blocking");
		});

		it("should detect short hex colors", () => {
			const component = `
<button style="color: #fff">Click</button>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const themeViolations = result.violations.filter((v) => v.category === "Theme Compliance");
			expect(themeViolations.length).toBeGreaterThan(0);
		});
	});

	describe("Edge Cases", () => {
		it("should handle multiple hardcoded colors", () => {
			const component = `
<div style="background: #fff; color: #000; border-color: #ccc">
	Content
</div>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const themeViolations = result.violations.filter((v) => v.category === "Theme Compliance");
			// Should detect all 3 colors
			expect(themeViolations.length).toBeGreaterThanOrEqual(3);
		});
	});
});

describe("Component Integration Guardian - Mobile-First", () => {
	let testSetup: ComponentTestSetup;

	beforeEach(() => {
		testSetup = new ComponentTestSetup("mobile");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for mobile-first breakpoints", () => {
			const component = `
<button class="text-sm md:text-base lg:text-lg">Click me</button>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const mobileViolations = result.violations.filter((v) => v.category === "Mobile-First");
			expect(mobileViolations).toHaveLength(0);
		});

		it("should pass for buttons with adequate touch targets", () => {
			const component = `
<button class="py-3 px-4 bg-primary">Click</button>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const mobileViolations = result.violations.filter((v) => v.category === "Mobile-First");
			expect(mobileViolations).toHaveLength(0);
		});

		it("should pass for min-h on buttons", () => {
			const component = `
<button class="min-h-11 px-4">Click</button>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const mobileViolations = result.violations.filter((v) => v.category === "Mobile-First");
			expect(mobileViolations).toHaveLength(0);
		});
	});

	describe("Negative Cases", () => {
		it("should detect small touch targets", () => {
			const component = `
<button class="px-2">Click</button>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const mobileViolations = result.violations.filter((v) => v.category === "Mobile-First");
			expect(mobileViolations.length).toBeGreaterThan(0);
			expect(mobileViolations[0].found).toContain("Small touch targets");
		});
	});

	describe("Edge Cases", () => {
		it("should handle components without buttons", () => {
			const component = `
<div class="p-4">Just a div</div>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const mobileViolations = result.violations.filter((v) => v.category === "Mobile-First");
			// Should not trigger touch target check for non-button elements
			expect(mobileViolations).toHaveLength(0);
		});
	});
});

describe("Component Integration Guardian - Accessibility", () => {
	let testSetup: ComponentTestSetup;

	beforeEach(() => {
		testSetup = new ComponentTestSetup("a11y");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for button with focus styles", () => {
			const component = `
<button class="focus:ring-2 focus:ring-primary">Click</button>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const a11yViolations = result.violations.filter((v) => v.category === "Accessibility");
			expect(a11yViolations).toHaveLength(0);
		});

		it("should pass for image with alt text", () => {
			const component = `
<img src="/logo.png" alt="Company Logo" />
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const a11yViolations = result.violations.filter((v) => v.category === "Accessibility");
			expect(a11yViolations).toHaveLength(0);
		});

		it("should pass for decorative image with empty alt", () => {
			const component = `
<img src="/decoration.png" alt="" />
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const a11yViolations = result.violations.filter((v) => v.category === "Accessibility");
			expect(a11yViolations).toHaveLength(0);
		});
	});

	describe("Negative Cases", () => {
		it("should detect missing focus indicators", () => {
			const component = `
<button class="bg-primary">Click</button>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const a11yViolations = result.violations.filter((v) => v.category === "Accessibility");
			expect(a11yViolations.length).toBeGreaterThan(0);
			expect(a11yViolations[0].severity).toBe("blocking");
			expect(a11yViolations[0].found).toContain("Missing focus indicators");
		});

		it("should detect image without alt", () => {
			const component = `
<img src="/photo.jpg" />
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const a11yViolations = result.violations.filter((v) => v.category === "Accessibility");
			expect(a11yViolations.length).toBeGreaterThan(0);
			expect(a11yViolations[0].severity).toBe("blocking");
		});

		it("should detect clickable div instead of button", () => {
			const component = `
<div on:click={handleClick}>Click me</div>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const a11yViolations = result.violations.filter((v) => v.category === "Accessibility");
			expect(a11yViolations.length).toBeGreaterThan(0);
			expect(a11yViolations[0].severity).toBe("high");
			expect(a11yViolations[0].found).toContain("Clickable div");
		});
	});

	describe("Edge Cases", () => {
		it("should handle input with focus-visible", () => {
			const component = `
<input type="text" class="focus-visible:ring-2" />
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const a11yViolations = result.violations.filter((v) => v.category === "Accessibility");
			expect(a11yViolations).toHaveLength(0);
		});

		it("should handle button with focus-within", () => {
			const component = `
<button class="group focus-within:outline-2">
	<span>Click</span>
</button>
			`;
			testSetup.writeComponent(component);

			const result = validateComponent(testSetup.componentPath);
			const a11yViolations = result.violations.filter((v) => v.category === "Accessibility");
			expect(a11yViolations).toHaveLength(0);
		});
	});
});

describe("Component Integration Guardian - Integration Tests", () => {
	let testSetup: ComponentTestSetup;

	beforeEach(() => {
		testSetup = new ComponentTestSetup("integration");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	it("should validate entire component and aggregate violations", () => {
		const component = `
<script lang="ts">
	const { data } = $props(); // Missing interface
</script>

<button style="background: #fff">Click</button> <!-- Hardcoded color, missing focus -->
<img src="/test.jpg" /> <!-- Missing alt -->
		`;
		testSetup.writeComponent(component);

		const result = validateComponent(testSetup.componentPath);
		expect(result.file).toBe(testSetup.componentPath);
		expect(result.violations.length).toBeGreaterThan(0);

		// Should have violations from multiple categories
		const categories = new Set(result.violations.map((v) => v.category));
		expect(categories.size).toBeGreaterThan(1);
	});

	it("should pass for well-structured component", () => {
		const component = `
<script lang="ts">
	interface CardProps {
		title: string;
		description?: string;
	}

	const { title, description }: CardProps = $props();
</script>

<div class="p-4 bg-card text-card-foreground rounded-lg">
	<h2 class="text-lg font-semibold">{title}</h2>
	{#if description}
		<p class="text-sm text-muted-foreground">{description}</p>
	{/if}
</div>
		`;
		testSetup.writeComponent(component);

		const result = validateComponent(testSetup.componentPath);
		expect(result.violations).toHaveLength(0);
	});

	it("should detect blocking vs non-blocking violations", () => {
		const component = `
<script lang="ts">
	interface Props {
		data: any; // Medium severity
	}
	const { data }: Props = $props();
</script>

<button style="color: #000">Click</button> <!-- Blocking: hardcoded color, missing focus -->
		`;
		testSetup.writeComponent(component);

		const result = validateComponent(testSetup.componentPath);
		const blocking = result.violations.filter((v) => v.severity === "blocking");
		const nonBlocking = result.violations.filter((v) => v.severity !== "blocking");

		expect(blocking.length).toBeGreaterThan(0);
		expect(nonBlocking.length).toBeGreaterThan(0);
	});
});
