<script lang="ts">
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
