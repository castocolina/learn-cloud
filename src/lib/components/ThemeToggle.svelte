<script lang="ts">
	/**
	 * ThemeToggle Component
	 *
	 * THEME SYSTEM ARCHITECTURE:
	 *
	 * 1. THEME MODES SUPPORTED:
	 *    - light: Light color scheme
	 *    - dark: Dark color scheme
	 *    - system: Follows OS preference
	 *
	 * 2. PERSISTENCE & DETECTION:
	 *    - Saves user preference to localStorage
	 *    - Automatically detects OS dark/light preference via prefers-color-scheme
	 *    - Applies theme by adding/removing 'light'/'dark' classes on <html> element
	 *    - Real-time theme updates using Svelte writable stores
	 *
	 * 3. COMPONENT INTEGRATION:
	 *    - Built with shadcn-svelte DropdownMenu and Button components
	 *    - Uses lucide-svelte icons (Sun, Moon, Monitor)
	 *    - Shows active theme with primary-colored indicator dot
	 *    - Proper ARIA labels and keyboard navigation
	 *
	 * 4. CSS VARIABLE INTEGRATION:
	 *    - Theme variables defined in src/app.css @theme directive
	 *    - Automatic CSS variable switching based on theme class
	 *    - Full shadcn-svelte design system compatibility
	 *
	 * KNOWN ISSUES & SOLUTIONS:
	 *
	 * Issue: Stacking Context Issues with Modal/Tooltip Components
	 * - Cause: Transform properties on active navigation items create new stacking contexts
	 * - Solution: Use margin instead of transform for visual positioning
	 * - Prevention: Avoid transform, opacity < 1, filter on navigation elements
	 * - Z-Index: Always use CSS custom properties (var(--z-*)) not hardcoded values
	 *
	 * Issue: Theme Switching Without FOUC (Flash of Unstyled Content)
	 * - Solution: Theme applied synchronously on HTML element before component render
	 * - localStorage persistence ensures theme restored on page load
	 * - System preference detection happens immediately on mount
	 */
	import { Sun, Moon, Monitor } from "lucide-svelte";
	import { Button } from "$lib/components/ui/button";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import { themeStore, setTheme, type Theme } from "$lib/stores/theme";

	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();

	function handleThemeChange(theme: Theme) {
		setTheme(theme);
	}

	// Get the appropriate icon for the current theme using auto-subscription
	const currentIcon = $derived(() => {
		switch ($themeStore) {
			case "light":
				return Sun;
			case "dark":
				return Moon;
			case "system":
				return Monitor;
			default:
				return Monitor;
		}
	});
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button variant="ghost" size="sm" class="h-8 w-8 px-0 {className}" aria-label="Toggle theme">
			{@const IconComponent = currentIcon()}
			<IconComponent class="h-4 w-4" />
			<span class="sr-only">Toggle theme</span>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="w-40">
		<DropdownMenu.Label class="text-xs font-medium text-muted-foreground">Theme</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Item class="cursor-pointer" onclick={() => handleThemeChange("light")}>
			<Sun class="mr-2 h-4 w-4" />
			<span class="flex-1">Light</span>
			{#if $themeStore === "light"}
				<div class="ml-2 h-2 w-2 rounded-full bg-primary"></div>
			{/if}
		</DropdownMenu.Item>
		<DropdownMenu.Item class="cursor-pointer" onclick={() => handleThemeChange("dark")}>
			<Moon class="mr-2 h-4 w-4" />
			<span class="flex-1">Dark</span>
			{#if $themeStore === "dark"}
				<div class="ml-2 h-2 w-2 rounded-full bg-primary"></div>
			{/if}
		</DropdownMenu.Item>
		<DropdownMenu.Item class="cursor-pointer" onclick={() => handleThemeChange("system")}>
			<Monitor class="mr-2 h-4 w-4" />
			<span class="flex-1">System</span>
			{#if $themeStore === "system"}
				<div class="ml-2 h-2 w-2 rounded-full bg-primary"></div>
			{/if}
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
