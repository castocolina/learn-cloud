/**
 * Test Suite for Test Quality Auditor
 *
 * Tests 7 test quality patterns:
 * 1. TestSetup pattern enforcement
 * 2. generateConfigId() usage
 * 3. cleanupIfPassed() timing
 * 4. NO waitForTimeout() in E2E
 * 5. Wait-utilities usage
 * 6. Coverage ≥90%
 * 7. Correct test environment
 *
 * Coverage target: ≥90%
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync } from "fs";
import { join } from "path";
import { ExtendedTestSetup } from "../../../../src/test/helpers/test-setup";
import { generateConfigId } from "../../../../src/test/helpers/test-utils";
import { validateTestFile, type PatternViolation } from "../scripts/check-patterns";

/**
 * Test setup for test quality validation
 */
class TestQualitySetup extends ExtendedTestSetup {
	public configId: string;
	public testFilePath: string;

	constructor(testSuiteId: string = "main") {
		super("scripts", `test-quality-${testSuiteId}`);
		this.configId = generateConfigId("test-quality", testSuiteId);
		this.testFilePath = join(this.getTempDir(), "sample.test.ts");
	}

	/**
	 * Get temp directory path (public accessor for protected tempDir)
	 */
	getTempDir(): string {
		return this.tempDir;
	}

	/**
	 * Write test code to file
	 */
	writeTestCode(code: string): void {
		writeFileSync(this.testFilePath, code, "utf-8");
	}
}

describe("Test Quality Auditor - TestSetup Pattern", () => {
	let testSetup: TestQualitySetup;

	beforeEach(() => {
		testSetup = new TestQualitySetup("testsetup");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for tests using TestSetup with file operations", () => {
			const code = `
import { describe, it, beforeEach, afterEach } from "vitest";
import { ExtendedTestSetup } from "../helpers/test-setup";
import { writeFileSync } from "fs";

describe("Test Suite", () => {
	let testSetup: ExtendedTestSetup;

	beforeEach(() => {
		testSetup = new ExtendedTestSetup("scripts", "test");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	it("should work", () => {
		writeFileSync(testSetup.getFilePath("test.txt"), "data", "utf-8");
	});
});
			`;
			testSetup.writeTestCode(code);

			const result = validateTestFile(testSetup.testFilePath);
			const setupViolations = result.violations.filter((v) => v.pattern.includes("TestSetup"));
			expect(setupViolations).toHaveLength(0);
		});

		it("should pass for tests without file operations", () => {
			const code = `
import { describe, it, expect } from "vitest";

describe("Simple Tests", () => {
	it("should calculate correctly", () => {
		expect(2 + 2).toBe(4);
	});
});
			`;
			testSetup.writeTestCode(code);

			const result = validateTestFile(testSetup.testFilePath);
			const setupViolations = result.violations.filter((v) => v.pattern.includes("TestSetup"));
			expect(setupViolations).toHaveLength(0);
		});
	});

	describe("Negative Cases", () => {
		it("should detect file operations without TestSetup", () => {
			const code = `
import { describe, it } from "vitest";
import { writeFileSync } from "fs";

describe("Test Suite", () => {
	it("should write file", () => {
		writeFileSync("./test.txt", "data", "utf-8");
	});
});
			`;
			testSetup.writeTestCode(code);

			const result = validateTestFile(testSetup.testFilePath);
			const setupViolations = result.violations.filter((v) => v.pattern.includes("TestSetup"));
			expect(setupViolations.length).toBeGreaterThan(0);
			expect(setupViolations[0].severity).toBe("blocking");
		});

		it("should detect missing beforeEach/afterEach hooks", () => {
			const code = `
import { describe, it } from "vitest";
import { writeFileSync } from "fs";

describe("Test Suite", () => {
	it("should write file", () => {
		writeFileSync("./tmp/test.txt", "data", "utf-8");
	});
});
			`;
			testSetup.writeTestCode(code);

			const result = validateTestFile(testSetup.testFilePath);
			const hooksViolation = result.violations.find((v) => v.pattern.includes("Hooks"));
			expect(hooksViolation).toBeDefined();
			expect(hooksViolation?.severity).toBe("blocking");
		});

		it("should detect hardcoded paths instead of testSetup.tempDir", () => {
			const code = `
import { describe, it, beforeEach, afterEach } from "vitest";
import { writeFileSync } from "fs";

describe("Test Suite", () => {
	beforeEach(() => {});
	afterEach(() => {});

	it("should write file", () => {
		writeFileSync("./data/test.txt", "data", "utf-8");
	});
});
			`;
			testSetup.writeTestCode(code);

			const result = validateTestFile(testSetup.testFilePath);
			const pathViolation = result.violations.find((v) => v.pattern.includes("Hardcoded"));
			expect(pathViolation).toBeDefined();
		});
	});

	describe("Edge Cases", () => {
		it("should allow ./tmp/ paths as temporary test paths", () => {
			const code = `
import { describe, it } from "vitest";
import { writeFileSync } from "fs";

describe("Test Suite", () => {
	it("should write to tmp", () => {
		writeFileSync("./tmp/test/file.txt", "data", "utf-8");
	});
});
			`;
			testSetup.writeTestCode(code);

			const result = validateTestFile(testSetup.testFilePath);
			const pathViolations = result.violations.filter((v) => v.pattern.includes("Hardcoded"));
			expect(pathViolations).toHaveLength(0);
		});
	});
});

describe("Test Quality Auditor - generateConfigId Usage", () => {
	let testSetup: TestQualitySetup;

	beforeEach(() => {
		testSetup = new TestQualitySetup("configid");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for tests using generateConfigId", () => {
			const code = `
import { generateConfigId } from "../helpers/test-utils";

const configId = generateConfigId("test-prefix", "suite-1");
			`;
			testSetup.writeTestCode(code);

			const result = validateTestFile(testSetup.testFilePath);
			const configIdViolations = result.violations.filter((v) =>
				v.pattern.includes("generateConfigId")
			);
			expect(configIdViolations).toHaveLength(0);
		});

		it("should pass for tests without configId", () => {
			const code = `
import { describe, it } from "vitest";

describe("Simple Tests", () => {
	it("works", () => {});
});
			`;
			testSetup.writeTestCode(code);

			const result = validateTestFile(testSetup.testFilePath);
			const configIdViolations = result.violations.filter((v) =>
				v.pattern.includes("generateConfigId")
			);
			expect(configIdViolations).toHaveLength(0);
		});
	});

	describe("Negative Cases", () => {
		it("should detect static configId without generateConfigId", () => {
			const code = `
const configId = "test-config-123";
const testSetup = new TestSetup("scripts", configId);
			`;
			testSetup.writeTestCode(code);

			const result = validateTestFile(testSetup.testFilePath);
			const configIdViolations = result.violations.filter((v) =>
				v.pattern.includes("generateConfigId")
			);
			expect(configIdViolations.length).toBeGreaterThan(0);
			expect(configIdViolations[0].severity).toBe("blocking");
		});
	});
});

describe("Test Quality Auditor - cleanupIfPassed Timing", () => {
	let testSetup: TestQualitySetup;

	beforeEach(() => {
		testSetup = new TestQualitySetup("cleanup");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for cleanupIfPassed in afterEach", () => {
			const code = `
import { describe, it, afterEach } from "vitest";

describe("Test Suite", () => {
	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});
});
			`;
			testSetup.writeTestCode(code);

			const result = validateTestFile(testSetup.testFilePath);
			const cleanupViolations = result.violations.filter((v) =>
				v.pattern.includes("cleanupIfPassed")
			);
			expect(cleanupViolations).toHaveLength(0);
		});
	});

	describe("Negative Cases", () => {
		it("should detect cleanupIfPassed in try-finally block", () => {
			const code = `
import { describe, it } from "vitest";

describe("Test Suite", () => {
	it("should test", () => {
		try {
			// test code
		} finally {
			testSetup.cleanupIfPassed(context);
		}
	});
});
			`;
			testSetup.writeTestCode(code);

			const result = validateTestFile(testSetup.testFilePath);
			const cleanupViolations = result.violations.filter((v) =>
				v.pattern.includes("cleanupIfPassed")
			);
			expect(cleanupViolations.length).toBeGreaterThan(0);
			expect(cleanupViolations[0].severity).toBe("blocking");
		});

		it("should detect cleanupIfPassed in test body instead of hook", () => {
			const code = `
import { describe, it } from "vitest";

describe("Test Suite", () => {
	it("should test", () => {
		// test code
		testSetup.cleanupIfPassed(context);
	});
});
			`;
			testSetup.writeTestCode(code);

			const result = validateTestFile(testSetup.testFilePath);
			const cleanupViolations = result.violations.filter((v) =>
				v.pattern.includes("cleanupIfPassed")
			);
			expect(cleanupViolations.length).toBeGreaterThan(0);
		});
	});
});

describe("Test Quality Auditor - E2E Wait Patterns", () => {
	let testSetup: TestQualitySetup;

	beforeEach(() => {
		testSetup = new TestQualitySetup("e2e-wait");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for E2E tests using wait-utilities", () => {
			const e2eCode = `
import { test, expect } from "@playwright/test";
import { waitForScrollPosition } from "./helpers/wait-utilities";

test("should scroll", async ({ page }) => {
	await page.goto("/");
	await page.click("#scroll-btn");
	await waitForScrollPosition(page, 500);
});
			`;
			testSetup.testFilePath = join(testSetup.getTempDir(), "sample.spec.ts");
			testSetup.writeTestCode(e2eCode);

			const result = validateTestFile(testSetup.testFilePath);
			expect(result.isE2E).toBe(true);
			const waitViolations = result.violations.filter((v) => v.pattern.includes("waitForTimeout"));
			expect(waitViolations).toHaveLength(0);
		});
	});

	describe("Negative Cases", () => {
		it("should detect waitForTimeout in E2E tests", () => {
			const e2eCode = `
import { test, expect } from "@playwright/test";

test("should wait", async ({ page }) => {
	await page.goto("/");
	await page.waitForTimeout(1000);
});
			`;
			testSetup.testFilePath = join(testSetup.getTempDir(), "sample.spec.ts");
			testSetup.writeTestCode(e2eCode);

			const result = validateTestFile(testSetup.testFilePath);
			expect(result.isE2E).toBe(true);
			const waitViolations = result.violations.filter((v) => v.pattern.includes("waitForTimeout"));
			expect(waitViolations.length).toBeGreaterThan(0);
			expect(waitViolations[0].severity).toBe("blocking");
		});

		it("should detect missing wait-utilities import for E2E tests with interactions", () => {
			const e2eCode = `
import { test, expect } from "@playwright/test";

test("should interact", async ({ page }) => {
	await page.goto("/");
	await page.click("#button");
	await page.locator("#result").scrollTo();
});
			`;
			testSetup.testFilePath = join(testSetup.getTempDir(), "sample.spec.ts");
			testSetup.writeTestCode(e2eCode);

			const result = validateTestFile(testSetup.testFilePath);
			const utilsViolation = result.violations.find((v) => v.pattern.includes("Wait-Utilities"));
			expect(utilsViolation).toBeDefined();
			expect(utilsViolation?.severity).toBe("high");
		});
	});

	describe("Edge Cases", () => {
		it("should not flag waitForTimeout in unit tests", () => {
			const unitCode = `
import { describe, it } from "vitest";

describe("Unit Tests", () => {
	it("should wait", async () => {
		// This is acceptable in unit tests (though discouraged)
		await new Promise(resolve => setTimeout(resolve, 100));
	});
});
			`;
			testSetup.writeTestCode(unitCode);

			const result = validateTestFile(testSetup.testFilePath);
			expect(result.isE2E).toBe(false);
			const waitViolations = result.violations.filter((v) => v.pattern.includes("waitForTimeout"));
			expect(waitViolations).toHaveLength(0);
		});
	});
});

describe("Test Quality Auditor - Test Environment", () => {
	let testSetup: TestQualitySetup;

	beforeEach(() => {
		testSetup = new TestQualitySetup("environment");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for DOM tests with jsdom environment", () => {
			const code = `
/** @vitest-environment jsdom */
import { describe, it } from "vitest";

describe("DOM Tests", () => {
	it("should access document", () => {
		const div = document.createElement("div");
	});
});
			`;
			testSetup.writeTestCode(code);

			const result = validateTestFile(testSetup.testFilePath);
			const envViolations = result.violations.filter((v) => v.pattern.includes("Environment"));
			expect(envViolations).toHaveLength(0);
		});

		it("should pass for backend tests without DOM", () => {
			const code = `
import { describe, it } from "vitest";
import { readFileSync } from "fs";

describe("Backend Tests", () => {
	it("should read file", () => {
		const content = readFileSync("./test.txt", "utf-8");
	});
});
			`;
			testSetup.writeTestCode(code);

			const result = validateTestFile(testSetup.testFilePath);
			const envViolations = result.violations.filter((v) => v.pattern.includes("jsdom"));
			expect(envViolations).toHaveLength(0);
		});
	});

	describe("Negative Cases", () => {
		it("should detect missing jsdom environment for DOM usage", () => {
			const code = `
import { describe, it } from "vitest";

describe("DOM Tests", () => {
	it("should access document", () => {
		const div = document.createElement("div");
	});
});
			`;
			testSetup.writeTestCode(code);

			const result = validateTestFile(testSetup.testFilePath);
			const envViolations = result.violations.filter((v) =>
				v.pattern.includes("Environment Declaration")
			);
			expect(envViolations.length).toBeGreaterThan(0);
			expect(envViolations[0].severity).toBe("blocking");
		});

		it("should detect unnecessary jsdom for backend tests", () => {
			const code = `
/** @vitest-environment jsdom */
import { describe, it } from "vitest";
import { readFileSync } from "fs";

describe("Backend Tests", () => {
	it("should read file", () => {
		const content = readFileSync("./test.txt", "utf-8");
	});
});
			`;
			testSetup.writeTestCode(code);

			const result = validateTestFile(testSetup.testFilePath);
			const envViolations = result.violations.filter((v) =>
				v.pattern.includes("Unnecessary jsdom")
			);
			expect(envViolations.length).toBeGreaterThan(0);
			expect(envViolations[0].severity).toBe("medium");
		});
	});

	describe("Edge Cases", () => {
		it("should handle window, navigator, and localStorage", () => {
			const code = `
import { describe, it } from "vitest";

describe("Browser Tests", () => {
	it("should access browser APIs", () => {
		window.location.href = "/test";
		navigator.userAgent;
		localStorage.setItem("key", "value");
	});
});
			`;
			testSetup.writeTestCode(code);

			const result = validateTestFile(testSetup.testFilePath);
			const envViolations = result.violations.filter((v) =>
				v.pattern.includes("Environment Declaration")
			);
			expect(envViolations.length).toBeGreaterThan(0);
		});
	});
});

describe("Test Quality Auditor - Integration Tests", () => {
	let testSetup: TestQualitySetup;

	beforeEach(() => {
		testSetup = new TestQualitySetup("integration");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	it("should validate entire test file and aggregate violations", () => {
		const code = `
import { describe, it } from "vitest";
import { writeFileSync } from "fs";

const configId = "static-id";

describe("Bad Test Suite", () => {
	it("should test", () => {
		writeFileSync("./data/test.txt", "data", "utf-8");
		document.createElement("div");

		try {
			// test
		} finally {
			testSetup.cleanupIfPassed(context);
		}
	});
});
		`;
		testSetup.writeTestCode(code);

		const result = validateTestFile(testSetup.testFilePath);
		expect(result.file).toBe(testSetup.testFilePath);
		expect(result.violations.length).toBeGreaterThan(0);

		// Should have multiple violation types
		const patterns = new Set(result.violations.map((v) => v.pattern));
		expect(patterns.size).toBeGreaterThan(1);
	});

	it("should pass for well-structured test file", () => {
		const code = `
import { describe, it, beforeEach, afterEach } from "vitest";
import { ExtendedTestSetup } from "../helpers/test-setup";
import { generateConfigId } from "../helpers/test-utils";

describe("Good Test Suite", () => {
	let testSetup: ExtendedTestSetup;

	beforeEach(() => {
		const configId = generateConfigId("test", "suite");
		testSetup = new ExtendedTestSetup("scripts", "test");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	it("should work correctly", () => {
		// test code
	});
});
		`;
		testSetup.writeTestCode(code);

		const result = validateTestFile(testSetup.testFilePath);
		expect(result.violations).toHaveLength(0);
	});
});
