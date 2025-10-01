/**
 * Hash Router Unit Tests
 *
 * Tests for hash-based routing utilities
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from "vitest";
import { parseHash, navigateToChapter, getCurrentHash, isValidHash } from "$lib/utils/hashRouter";

describe("hashRouter", () => {
	beforeEach(() => {
		// Reset hash before each test
		window.location.hash = "";
	});

	describe("parseHash", () => {
		it("should parse valid chapter URL from hash with #/ prefix", () => {
			const result = parseHash("#/01_01_lesson_development_environment_tooling.html");
			expect(result.isFound).toBe(true);
			// Content may not exist in test environment, but parsing should work
		});

		it("should parse valid chapter URL from hash without prefix", () => {
			const result = parseHash("01_01_lesson_development_environment_tooling.html");
			expect(result.isFound).toBe(true);
		});

		it("should handle empty hash", () => {
			const result = parseHash("");
			expect(result.isFound).toBe(false);
		});

		it("should handle hash with only #", () => {
			const result = parseHash("#");
			expect(result.isFound).toBe(false);
		});

		it("should handle hash with only #/", () => {
			const result = parseHash("#/");
			expect(result.isFound).toBe(false);
		});
	});

	describe("getCurrentHash", () => {
		it("should return empty string when hash is empty", () => {
			window.location.hash = "";
			const result = getCurrentHash();
			expect(result).toBe("");
		});

		it("should remove #/ prefix from hash", () => {
			window.location.hash = "#/01_01_lesson_dev.html";
			const result = getCurrentHash();
			expect(result).toBe("01_01_lesson_dev.html");
		});

		it("should handle hash without slash", () => {
			window.location.hash = "#test";
			const result = getCurrentHash();
			expect(result).toBe("test");
		});
	});

	describe("isValidHash", () => {
		it("should validate valid chapter URL format", () => {
			const result = isValidHash("#/01_01_lesson_development.html");
			expect(result).toBe(true);
		});

		it("should invalidate empty hash", () => {
			const result = isValidHash("");
			expect(result).toBe(false);
		});

		it("should invalidate malformed hash", () => {
			const result = isValidHash("#/invalid");
			expect(result).toBe(false);
		});
	});

	describe("navigateToChapter", () => {
		it("should update window.location.hash with / prefix", () => {
			navigateToChapter("01_01_lesson_dev.html");
			expect(window.location.hash).toBe("#/01_01_lesson_dev.html");
		});

		it("should handle chapter URL with full path", () => {
			navigateToChapter("01_02_quiz.html");
			expect(window.location.hash).toBe("#/01_02_quiz.html");
		});
	});
});
