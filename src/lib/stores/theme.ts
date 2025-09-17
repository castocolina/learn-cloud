import { browser } from "$app/environment";
import { writable, derived } from "svelte/store";

export type Theme = "light" | "dark" | "system";

// Get initial theme from localStorage or default to 'system'
function getInitialTheme(): Theme {
	if (!browser) return "system";

	const stored = localStorage.getItem("theme");
	if (stored && ["light", "dark", "system"].includes(stored)) {
		return stored as Theme;
	}
	return "system";
}

// Get the actual theme to apply (resolves 'system' to 'light' or 'dark')
function getResolvedTheme(theme: Theme): "light" | "dark" {
	if (theme === "system") {
		return browser && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	}
	return theme;
}

// Apply theme to the document
function applyTheme(theme: "light" | "dark") {
	if (!browser) return;

	const root = document.documentElement;
	root.classList.remove("light", "dark");
	root.classList.add(theme);
}

// Create the theme stores
const themeStore = writable<Theme>(getInitialTheme());
const resolvedThemeStore = writable<"light" | "dark">("light");

// Initialize theme system
function initializeTheme() {
	if (!browser) return;

	// Set initial resolved theme
	const currentTheme = getInitialTheme();
	const resolved = getResolvedTheme(currentTheme);
	resolvedThemeStore.set(resolved);
	applyTheme(resolved);

	// Listen for system theme changes
	const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
	const handleSystemThemeChange = () => {
		let currentTheme: Theme = "system";
		const unsubscribe = themeStore.subscribe((theme) => {
			currentTheme = theme;
		});
		unsubscribe();

		if (currentTheme === "system") {
			const newResolved = getResolvedTheme(currentTheme);
			resolvedThemeStore.set(newResolved);
			applyTheme(newResolved);
		}
	};

	mediaQuery.addEventListener("change", handleSystemThemeChange);

	// Subscribe to theme changes
	themeStore.subscribe((theme) => {
		const resolved = getResolvedTheme(theme);
		resolvedThemeStore.set(resolved);
		if (browser) {
			localStorage.setItem("theme", theme);
			applyTheme(resolved);
		}
	});
}

// Initialize when browser is available
if (browser) {
	initializeTheme();
}

// Export the stores and utility function
export { themeStore };
export const resolvedTheme = derived(resolvedThemeStore, ($resolved) => $resolved);

// Utility function to set theme
export function setTheme(newTheme: Theme) {
	themeStore.set(newTheme);
}
