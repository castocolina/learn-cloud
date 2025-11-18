/**
 * Application Configuration Settings - Main Orchestrator
 *
 * This file serves as the main entry point for all application configuration.
 * Settings have been refactored into domain-specific modules for better
 * maintainability and separation of concerns:
 *
 * - settings-ui.ts: UI configuration (theme, layout, components)
 * - settings-content.ts: Content display settings (quiz/exam, pagination)
 * - settings-scripts.ts: Build/generation configuration (validation, scaffolding)
 *
 * This file re-exports all settings with backward-compatible API.
 *
 * Type definitions are centralized in the unified type system
 * at src/lib/types/config.ts and imported via the $types alias.
 *
 * @module settings
 */

import type { AppSettings } from "$types";
import { UI_SETTINGS } from "./settings-ui.js";
import { CONTENT_SETTINGS } from "./settings-content.js";
import { SCRIPTS_SETTINGS } from "./settings-scripts.js";
import { AGENTS_SETTINGS } from "./settings-agents.js";
import { REQUIREMENTS_SETTINGS } from "./settings-requirements.js";
import { MCPS_SETTINGS } from "./settings-mcps.js";

/**
 * Named exports for modular imports
 *
 * These allow importing specific settings domains when needed:
 * import { UI_SETTINGS } from "$config/settings";
 * import { SCRIPTS_SETTINGS } from "$config/settings";
 * import { CONTENT_SETTINGS } from "$config/settings";
 * import { AGENTS_SETTINGS } from "$config/settings";
 * import { REQUIREMENTS_SETTINGS } from "$config/settings";
 * import { MCPS_SETTINGS } from "$config/settings";
 */
export {
	UI_SETTINGS,
	CONTENT_SETTINGS,
	SCRIPTS_SETTINGS,
	AGENTS_SETTINGS,
	REQUIREMENTS_SETTINGS,
	MCPS_SETTINGS
};

/**
 * Unified SETTINGS object - Backward Compatible API
 *
 * This maintains the existing API surface for all existing code.
 * All imports using `SETTINGS.ui.*`, `SETTINGS.scripts.*`, `SETTINGS.content.*`,
 * `SETTINGS.agents.*`, `SETTINGS.requirements.*`, or `SETTINGS.mcps.*`
 * continue to work without modification.
 *
 * Migration Path (Optional):
 * Gradually migrate to domain-specific imports for better tree-shaking:
 * - Old: import { SETTINGS } from "$config/settings"; → SETTINGS.ui.theme
 * - New: import { UI_SETTINGS } from "$config/settings"; → UI_SETTINGS.theme
 */
export const SETTINGS: AppSettings = {
	ui: UI_SETTINGS,
	content: CONTENT_SETTINGS,
	scripts: SCRIPTS_SETTINGS,
	agents: AGENTS_SETTINGS,
	requirements: REQUIREMENTS_SETTINGS,
	mcps: MCPS_SETTINGS
};

// Legacy structure removed - all configuration moved to domain-specific files
// See:
// - src/config/settings-ui.ts (~1100 lines - UI configuration)
// - src/config/settings-content.ts (~250 lines - Content display configuration)
// - src/config/settings-scripts.ts (~270 lines - Build/generation configuration)
// - src/config/settings-agents.ts (~90 lines - Agent behaviors configuration)
// - src/config/settings-requirements.ts (~70 lines - Requirements atomicity configuration)
// - src/config/settings-mcps.ts (~60 lines - MCP integration configuration)

// Note: AppSettings type is centralized in src/lib/types/config.ts
// and can be imported via: import type { AppSettings } from "$types";
