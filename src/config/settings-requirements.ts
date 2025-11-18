/**
 * Requirements Settings - Task Atomicity & Subdivision
 *
 * Configuration for requirement atomicity thresholds and subdivision strategies.
 * Ensures tasks remain manageable and focused by enforcing size limits and
 * complexity constraints.
 *
 * @module settings-requirements
 */

import type { RequirementsSettings } from "$types";

/**
 * Requirements Configuration Settings
 *
 * Defines atomicity thresholds for requirements and tasks to ensure maintainability
 * and focused implementation. Based on industry best practices and cognitive load research.
 */
export const REQUIREMENTS_SETTINGS: RequirementsSettings = {
	atomicityThreshold: {
		/**
		 * Maximum lines of code for a single requirement implementation
		 * Based on research showing optimal PR size: 200-400 lines
		 * @default 500
		 */
		maxLines: 500,

		/**
		 * Maximum files affected by a single requirement
		 * Limits scope to maintain focus and reduce merge conflicts
		 * @default 3
		 */
		maxFiles: 3,

		/**
		 * Maximum cyclomatic complexity per requirement
		 * Scale: 1-5 (1=trivial, 5=complex)
		 * Ensures requirements remain cognitively manageable
		 * @default 5
		 */
		maxComplexity: 5,

		/**
		 * Maximum estimated effort in hours
		 * Based on Pomodoro technique and focused work sessions
		 * @default 4
		 */
		maxEffortHours: 4,

		/**
		 * Maximum dependencies on other requirements
		 * Limits coupling and promotes independence
		 * @default 2
		 */
		maxDependencies: 2
	},

	/**
	 * Subdivision strategy when atomicity thresholds are exceeded
	 *
	 * Strategies:
	 * - "consolidate-if-under-500-lines": Keep as single task if total lines < 500
	 * - "always-subdivide": Always split into atomic tasks
	 * - "complexity-based": Subdivide based on complexity score
	 *
	 * @default "consolidate-if-under-500-lines"
	 */
	subdivisionStrategy: "consolidate-if-under-500-lines"
};
