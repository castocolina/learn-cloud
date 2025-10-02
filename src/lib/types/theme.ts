/**
 * Theme System Type Definitions
 *
 * Type definitions for the application's theme system including
 * theme modes, color palettes, and configuration interfaces.
 *
 * Following the unified type architecture pattern, these types are
 * re-exported through the main types index for consistent imports.
 */

/**
 * Theme Mode
 *
 * - "light": Light color scheme
 * - "dark": Dark color scheme
 * - "system": Follows OS preference (auto-detects)
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * Color Palette Options
 *
 * Supported color palettes for shadcn-svelte components.
 * These palettes provide different neutral/base color tones:
 *
 * - "slate": Blue-gray tones (default) - professional, technical feel
 * - "gray": Pure gray tones - neutral, balanced
 * - "zinc": Cool gray tones - modern, clean
 * - "neutral": Warm gray tones - softer, warmer
 * - "stone": Warm brown-gray tones - organic, earthy
 *
 * Each palette provides the same semantic variables (:root and .dark)
 * but with different HSL values to achieve the desired tone.
 *
 * Reference: https://ui.shadcn.com/themes
 */
export type ColorPalette = "slate" | "gray" | "zinc" | "neutral" | "stone";

/**
 * Path-based severity rule for downgrading errors in legacy/demo code
 */
export interface PathSeverityRule {
	/** Path pattern to match (supports wildcards via String.includes) */
	pattern: string;
	/** Target severity for matches */
	severity: "info" | "warning";
	/** Human-readable description of the rule */
	description: string;
}

/**
 * Theme Validation Configuration
 *
 * Settings for theme system validation and quality checks.
 */
export interface ThemeValidationConfig {
	/** Enable theme validation during build/development */
	enabled: boolean;
	/** Strict mode: Prevent hardcoded z-index, @apply in components */
	strictMode: boolean;
	/** Check WCAG color contrast compliance (AA level) */
	checkColorContrast: boolean;
	/** Verify stacking context violations (transform/opacity on navigation) */
	checkStackingContext: boolean;
	/** Check for inline styles (style="...") in component templates - HIGH SEVERITY */
	checkInlineStyles: boolean;
	/** Check for <style> blocks in components (modular CSS architecture) - WARNING */
	checkComponentStyleBlocks: boolean;
	/**
	 * Path-based severity rules for downgrading errors in legacy/demo code
	 * to informational level while maintaining strict validation for production.
	 */
	severityRules: PathSeverityRule[];
	/**
	 * Optional: Paths to completely ignore during validation
	 * (Use for third-party code or deprecated files)
	 * Note: Built-in severity classification handles demo/legacy code automatically
	 */
	ignorePaths?: string[];
}

/**
 * Theme Configuration Interface
 *
 * Complete configuration for the application's theme system.
 * Used in centralized settings (src/config/settings.ts).
 */
export interface ThemeConfig {
	/** Default theme mode on first load (before user selection) */
	defaultMode: ThemeMode;
	/** localStorage key for persisting user's theme preference */
	storageKey: string;
	/** Selected color palette for the application */
	colorPalette: ColorPalette;
	/** Border radius in rem units (e.g., 0.625 = 10px) */
	radius: number;
	/** Theme validation configuration */
	validation: ThemeValidationConfig;
}

/**
 * Theme Store State
 *
 * Runtime state for the theme store (src/lib/stores/theme.ts).
 * Extends ThemeConfig with reactive state properties.
 */
export interface ThemeState {
	/** Current theme mode (user selection) */
	mode: ThemeMode;
	/** Resolved theme (system resolves to actual light/dark) */
	resolved: "light" | "dark";
	/** Whether theme is initializing (prevents FOUC) */
	isInitializing: boolean;
}

/**
 * Type Guards
 */

/**
 * Validates if a string is a valid ThemeMode
 * @param value - Value to validate
 * @returns True if value is valid ThemeMode
 */
export function isThemeMode(value: unknown): value is ThemeMode {
	return typeof value === "string" && ["light", "dark", "system"].includes(value);
}

/**
 * Validates if a string is a valid ColorPalette
 * @param value - Value to validate
 * @returns True if value is valid ColorPalette
 */
export function isColorPalette(value: unknown): value is ColorPalette {
	return typeof value === "string" && ["slate", "gray", "zinc", "neutral", "stone"].includes(value);
}

/**
 * Validates if an object conforms to ThemeConfig interface
 * @param obj - Object to validate
 * @returns True if object is valid ThemeConfig
 */
export function isThemeConfig(obj: unknown): obj is ThemeConfig {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"defaultMode" in obj &&
		"storageKey" in obj &&
		"colorPalette" in obj &&
		"radius" in obj &&
		"validation" in obj &&
		isThemeMode((obj as ThemeConfig).defaultMode) &&
		typeof (obj as ThemeConfig).storageKey === "string" &&
		isColorPalette((obj as ThemeConfig).colorPalette) &&
		typeof (obj as ThemeConfig).radius === "number" &&
		typeof (obj as ThemeConfig).validation === "object"
	);
}
