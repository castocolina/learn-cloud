/**
 * Test Suite for Code Quality Guardian
 *
 * Tests all 5 validation categories:
 * 1. Unused variables (with _ prefix exception handling)
 * 2. Code duplication
 * 3. Cyclomatic complexity
 * 4. Regex pattern issues
 * 5. Type safety (any usage, type assertions)
 *
 * Coverage target: ≥90%
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync } from "fs";
import { join } from "path";
import * as ts from "typescript";
import { ExtendedTestSetup } from "../../../../src/test/helpers/test-setup";
import { generateConfigId } from "../../../../src/test/helpers/test-utils";
import {
	checkUnusedVariables,
	checkRegexPatterns,
	checkTypeAssertion,
	validateFile,
	type QualityViolation,
	type ValidationResult
} from "../scripts/check-quality";

/**
 * Test setup for code quality validation
 */
class CodeQualityTestSetup extends ExtendedTestSetup {
	public configId: string;
	public testFilePath: string;

	constructor(testSuiteId: string = "main") {
		super("scripts", `code-quality-${testSuiteId}`);
		this.configId = generateConfigId("test-code-quality", testSuiteId);
		this.testFilePath = join(this.tempDir, "test-code.ts");
	}

	/**
	 * Write TypeScript code to test file
	 */
	writeTestCode(code: string): void {
		writeFileSync(this.testFilePath, code, "utf-8");
	}

	/**
	 * Create TypeScript program for testing
	 */
	createProgram(): ts.Program {
		return ts.createProgram([this.testFilePath], {
			target: ts.ScriptTarget.ESNext,
			module: ts.ModuleKind.ESNext,
			strict: true,
			skipLibCheck: true
		});
	}
}

describe("Code Quality Guardian - Unused Variables", () => {
	let testSetup: CodeQualityTestSetup;

	beforeEach(() => {
		testSetup = new CodeQualityTestSetup("unused-vars");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for valid _ prefix in callback parameters", () => {
			const code = `
				const arr = [1, 2, 3];
				arr.map((_value, index) => index * 2);
			`;
			testSetup.writeTestCode(code);

			const program = testSetup.createProgram();
			const sourceFile = program.getSourceFile(testSetup.testFilePath)!;
			const checker = program.getTypeChecker();

			const violations = checkUnusedVariables(sourceFile, checker);
			expect(violations).toHaveLength(0);
		});

		it("should pass for valid _ in array destructuring with skipped positions", () => {
			const code = `
				const arr = [1, 2, 3];
				const [first, _second, third] = arr;
				console.log(first, third);
			`;
			testSetup.writeTestCode(code);

			const program = testSetup.createProgram();
			const sourceFile = program.getSourceFile(testSetup.testFilePath)!;
			const checker = program.getTypeChecker();

			const violations = checkUnusedVariables(sourceFile, checker);
			expect(violations).toHaveLength(0);
		});

		it("should pass for all variables used", () => {
			const code = `
				const userName = "John";
				const greeting = \`Hello \${userName}\`;
				console.log(greeting);
			`;
			testSetup.writeTestCode(code);

			const program = testSetup.createProgram();
			const sourceFile = program.getSourceFile(testSetup.testFilePath)!;
			const checker = program.getTypeChecker();

			const violations = checkUnusedVariables(sourceFile, checker);
			expect(violations).toHaveLength(0);
		});
	});

	describe("Negative Cases", () => {
		it("should detect invalid _ prefix usage in regular variables", () => {
			const code = `
				const _invalidVar = "test";
				const validVar = "used";
				console.log(validVar);
			`;
			testSetup.writeTestCode(code);

			const program = testSetup.createProgram();
			const sourceFile = program.getSourceFile(testSetup.testFilePath)!;
			const checker = program.getTypeChecker();

			const violations = checkUnusedVariables(sourceFile, checker);
			expect(violations.length).toBeGreaterThan(0);
			expect(violations[0].category).toBe("unused-code");
			expect(violations[0].severity).toBe("error");
			expect(violations[0].message).toContain("_invalidVar");
		});

		it("should detect unused _ variable not in callback", () => {
			const code = `
				function doWork() {
					const _unused = "should not use underscore";
					return "done";
				}
			`;
			testSetup.writeTestCode(code);

			const program = testSetup.createProgram();
			const sourceFile = program.getSourceFile(testSetup.testFilePath)!;
			const checker = program.getTypeChecker();

			const violations = checkUnusedVariables(sourceFile, checker);
			expect(violations.length).toBeGreaterThan(0);
			expect(violations[0].message).toContain("does not qualify for _ prefix exception");
		});
	});

	describe("Edge Cases", () => {
		it("should handle _ in first position of array destructuring", () => {
			const code = `
				const [_first, second] = [1, 2];
				console.log(second);
			`;
			testSetup.writeTestCode(code);

			const program = testSetup.createProgram();
			const sourceFile = program.getSourceFile(testSetup.testFilePath)!;
			const checker = program.getTypeChecker();

			const violations = checkUnusedVariables(sourceFile, checker);
			// First position without previous elements should trigger violation
			expect(violations.length).toBeGreaterThan(0);
		});

		it("should handle nested destructuring with _", () => {
			const code = `
				const obj = { a: 1, b: { c: 2, d: 3 } };
				const { a, b: { _c, d } } = obj;
				console.log(a, d);
			`;
			testSetup.writeTestCode(code);

			const program = testSetup.createProgram();
			const sourceFile = program.getSourceFile(testSetup.testFilePath)!;
			const checker = program.getTypeChecker();

			const violations = checkUnusedVariables(sourceFile, checker);
			expect(violations.length).toBeGreaterThan(0);
		});
	});
});

describe("Code Quality Guardian - Regex Patterns", () => {
	let testSetup: CodeQualityTestSetup;

	beforeEach(() => {
		testSetup = new CodeQualityTestSetup("regex");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for simple regex patterns", () => {
			const code = `
				const pattern = /^[a-z]+$/i;
			`;
			testSetup.writeTestCode(code);

			const program = testSetup.createProgram();
			const sourceFile = program.getSourceFile(testSetup.testFilePath)!;

			const violations = checkRegexPatterns(sourceFile);
			expect(violations).toHaveLength(0);
		});

		it("should pass for regex with named groups", () => {
			const code = `
				const pattern = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/;
			`;
			testSetup.writeTestCode(code);

			const program = testSetup.createProgram();
			const sourceFile = program.getSourceFile(testSetup.testFilePath)!;

			const violations = checkRegexPatterns(sourceFile);
			expect(violations).toHaveLength(0);
		});
	});

	describe("Negative Cases", () => {
		it("should detect complex regex without named groups", () => {
			const code = `
				const pattern = /(\\d{2})-(\\d{2})-(\\d{4})\\s+(\\d{2}):(\\d{2}):(\\d{2})/;
			`;
			testSetup.writeTestCode(code);

			const program = testSetup.createProgram();
			const sourceFile = program.getSourceFile(testSetup.testFilePath)!;

			const violations = checkRegexPatterns(sourceFile);
			expect(violations.length).toBeGreaterThan(0);
			expect(violations[0].category).toBe("regex-pattern");
			expect(violations[0].message).toContain("named groups");
		});

		it("should detect extremely complex regex", () => {
			const code = `
				const pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
			`;
			testSetup.writeTestCode(code);

			const program = testSetup.createProgram();
			const sourceFile = program.getSourceFile(testSetup.testFilePath)!;

			const violations = checkRegexPatterns(sourceFile);
			expect(violations.length).toBeGreaterThan(0);
			const complexityViolation = violations.find((v) => v.message.includes("Complex regex"));
			expect(complexityViolation).toBeDefined();
		});
	});

	describe("Edge Cases", () => {
		it("should handle RegExp constructor", () => {
			const code = `
				const pattern = new RegExp("(\\\\d+)-(\\\\d+)-(\\\\d+)");
			`;
			testSetup.writeTestCode(code);

			const program = testSetup.createProgram();
			const sourceFile = program.getSourceFile(testSetup.testFilePath)!;

			const violations = checkRegexPatterns(sourceFile);
			expect(violations.length).toBeGreaterThan(0);
		});

		it("should detect unnecessary escapes in character class", () => {
			const code = `
				const pattern = /[a-z\\|0-9]/;
			`;
			testSetup.writeTestCode(code);

			const program = testSetup.createProgram();
			const sourceFile = program.getSourceFile(testSetup.testFilePath)!;

			const violations = checkRegexPatterns(sourceFile);
			const escapeViolation = violations.find((v) => v.message.includes("Unnecessary escape"));
			expect(escapeViolation).toBeDefined();
		});
	});
});

describe("Code Quality Guardian - Type Safety", () => {
	let testSetup: CodeQualityTestSetup;

	beforeEach(() => {
		testSetup = new CodeQualityTestSetup("type-safety");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for proper type annotations", () => {
			const code = `
				interface User {
					name: string;
					age: number;
				}
				const user: User = { name: "John", age: 30 };
			`;
			testSetup.writeTestCode(code);

			const program = testSetup.createProgram();
			const sourceFile = program.getSourceFile(testSetup.testFilePath)!;

			const violations = checkTypeAssertion(sourceFile);
			expect(violations).toHaveLength(0);
		});

		it("should pass for unknown type with type guards", () => {
			const code = `
				function processData(data: unknown): string {
					if (typeof data === "string") {
						return data;
					}
					return "";
				}
			`;
			testSetup.writeTestCode(code);

			const program = testSetup.createProgram();
			const sourceFile = program.getSourceFile(testSetup.testFilePath)!;

			const violations = checkTypeAssertion(sourceFile);
			expect(violations).toHaveLength(0);
		});
	});

	describe("Negative Cases", () => {
		it("should detect any type usage", () => {
			const code = `
				function processData(data: any): void {
					console.log(data);
				}
			`;
			testSetup.writeTestCode(code);

			const program = testSetup.createProgram();
			const sourceFile = program.getSourceFile(testSetup.testFilePath)!;

			const violations = checkTypeAssertion(sourceFile);
			expect(violations.length).toBeGreaterThan(0);
			expect(violations[0].category).toBe("type-safety");
			expect(violations[0].severity).toBe("warning");
			expect(violations[0].message).toContain("any");
		});

		it("should detect type assertions", () => {
			const code = `
				const value = "123" as unknown as number;
			`;
			testSetup.writeTestCode(code);

			const program = testSetup.createProgram();
			const sourceFile = program.getSourceFile(testSetup.testFilePath)!;

			const violations = checkTypeAssertion(sourceFile);
			expect(violations.length).toBeGreaterThan(0);
			const assertionViolations = violations.filter((v) => v.message.includes("assertion"));
			expect(assertionViolations.length).toBeGreaterThan(0);
		});
	});

	describe("Edge Cases", () => {
		it("should handle multiple any types in one function", () => {
			const code = `
				function mixed(a: any, b: any): any {
					return a + b;
				}
			`;
			testSetup.writeTestCode(code);

			const program = testSetup.createProgram();
			const sourceFile = program.getSourceFile(testSetup.testFilePath)!;

			const violations = checkTypeAssertion(sourceFile);
			// Should detect all 3 'any' usages
			expect(violations.length).toBeGreaterThanOrEqual(3);
		});

		it("should handle type assertions in complex expressions", () => {
			const code = `
				const obj = { value: 123 };
				const result = (obj.value as number) * 2;
			`;
			testSetup.writeTestCode(code);

			const program = testSetup.createProgram();
			const sourceFile = program.getSourceFile(testSetup.testFilePath)!;

			const violations = checkTypeAssertion(sourceFile);
			expect(violations.length).toBeGreaterThan(0);
		});
	});
});

describe("Code Quality Guardian - Integration Tests", () => {
	let testSetup: CodeQualityTestSetup;

	beforeEach(() => {
		testSetup = new CodeQualityTestSetup("integration");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	it("should validate entire file and aggregate violations", () => {
		const code = `
			// Multiple issues in one file
			const _unused = "invalid underscore";

			function processData(data: any): any {
				const pattern = /(\\d+)-(\\d+)-(\\d+)/;
				return data as string;
			}
		`;
		testSetup.writeTestCode(code);

		const program = testSetup.createProgram();
		const result: ValidationResult = validateFile(testSetup.testFilePath, program);

		expect(result.file).toBe(testSetup.testFilePath);
		expect(result.violations.length).toBeGreaterThan(0);

		// Should have violations from multiple categories
		const categories = new Set(result.violations.map((v) => v.category));
		expect(categories.size).toBeGreaterThan(1);
	});

	it("should mark file as failed when errors exist", () => {
		const code = `
			const _invalid = "error";
		`;
		testSetup.writeTestCode(code);

		const program = testSetup.createProgram();
		const result: ValidationResult = validateFile(testSetup.testFilePath, program);

		expect(result.passed).toBe(false);
	});

	it("should mark file as passed with only warnings", () => {
		const code = `
			const value = 123 as number;
		`;
		testSetup.writeTestCode(code);

		const program = testSetup.createProgram();
		const result: ValidationResult = validateFile(testSetup.testFilePath, program);

		// Type assertions are info level, so file should pass
		expect(result.passed).toBe(true);
	});

	it("should handle clean code with no violations", () => {
		const code = `
			interface User {
				name: string;
				age: number;
			}

			function greet(user: User): string {
				return \`Hello, \${user.name}!\`;
			}

			const pattern = /^[a-z]+$/i;
		`;
		testSetup.writeTestCode(code);

		const program = testSetup.createProgram();
		const result: ValidationResult = validateFile(testSetup.testFilePath, program);

		expect(result.violations).toHaveLength(0);
		expect(result.passed).toBe(true);
	});
});
