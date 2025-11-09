/**
 * Test Utilities
 *
 * Shared utilities for test isolation and setup.
 * This module provides common functionality used across test suites
 * to ensure proper test isolation and prevent race conditions.
 *
 * Features:
 * - Unique configuration ID generation for parallel test execution
 * - Test isolation helpers
 */

import crypto from "crypto";

/**
 * Generate unique configuration ID for test isolation.
 *
 * This function creates unique identifiers to prevent race conditions
 * when tests run in parallel. Each test gets its own configuration
 * file and temporary directory.
 *
 * Only for test environments, we do not need this for real use cases,
 * only in test envs we have race conditions.
 *
 * @param prefix Prefix for the config ID (e.g., "test-search-idx")
 * @param testName Optional test name for uniqueness
 * @returns Unique configuration ID (e.g., "test-search-idx-a3f2b1c4")
 *
 * @example
 * ```typescript
 * const configId = generateConfigId("test-menu", "unit-test-1");
 * // Returns: "test-menu-a3f2b1c4"
 * ```
 */
export function generateConfigId(prefix: string, testName?: string): string {
	const timestamp = Date.now().toString();
	const pid = process.pid.toString();
	const hashInput = `${testName || "default"}-${timestamp}-${pid}`;
	const hash = crypto.createHash("md5").update(hashInput).digest("hex").substring(0, 8);
	return `${prefix}-${hash}`;
}
