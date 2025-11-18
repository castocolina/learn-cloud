/**
 * MCP Settings - Model Context Protocol Configuration
 *
 * Configuration for external MCP servers providing enhanced agent capabilities:
 * - npm registry integration (package metadata, version info, maintenance status)
 * - GitHub integration (repository analysis, activity metrics, community health)
 *
 * @module settings-mcps
 */

import type { MCPsSettings } from "$types";

/**
 * MCP Configuration Settings
 *
 * Defines behavior and thresholds for Model Context Protocol integrations.
 * MCPs enhance agent decision-making with real-time external data.
 */
export const MCPS_SETTINGS: MCPsSettings = {
	npm: {
		/**
		 * Enable npm registry MCP integration
		 * Provides package metadata, version info, downloads, maintenance status
		 */
		enabled: true,

		/**
		 * Minimum weekly downloads threshold for package evaluation
		 * Packages below this threshold trigger investigation
		 * @default 10000
		 */
		minWeeklyDownloads: 10000,

		/**
		 * Maximum months since last publish for package evaluation
		 * Packages not published within this window are flagged as stale
		 * @default 6
		 */
		maxLastPublishMonths: 6
	},

	github: {
		/**
		 * Enable GitHub MCP integration
		 * Provides repository analysis, activity metrics, community health
		 */
		enabled: true,

		/**
		 * Require active repository for package evaluation
		 * When true, packages must have recent commits and issue activity
		 */
		requireActiveRepo: true
	}
};
