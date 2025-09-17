<script lang="ts">
	import { Sun, Moon, Monitor } from "lucide-svelte";
	import { Switch } from "$lib/components/ui/switch";
	import { themeStore, setTheme, type Theme } from "$lib/stores/theme";

	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();

	// Cycle through themes: light -> dark -> system -> light
	function cycleTheme() {
		const currentTheme = $themeStore;
		switch (currentTheme) {
			case "light":
				setTheme("dark");
				break;
			case "dark":
				setTheme("system");
				break;
			case "system":
				setTheme("light");
				break;
			default:
				setTheme("light");
		}
	}

	// Get theme label for accessibility
	const themeLabel = $derived(() => {
		switch ($themeStore) {
			case "light":
				return "Light theme";
			case "dark":
				return "Dark theme";
			case "system":
				return "System theme";
			default:
				return "System theme";
		}
	});

	// Determine switch state (checked for dark mode, unchecked for light/system)
	const isChecked = $derived($themeStore === "dark");
</script>

<!-- Ultra-compact elevated theme toggle -->
<button
	type="button"
	onclick={cycleTheme}
	aria-label="Toggle theme: {themeLabel}"
	class="inline-flex cursor-pointer items-center gap-1 rounded-full border
		   border-gray-200/60 bg-white/80
		   px-2 py-1.5 shadow-sm
		   shadow-gray-900/5 backdrop-blur-sm transition-all
		   duration-300
		   ease-out hover:scale-105 hover:border-gray-300/80
		   hover:bg-white hover:shadow-md
		   hover:shadow-gray-900/10 dark:border-gray-600/40
		   dark:bg-gray-800/80 dark:shadow-black/20 dark:hover:border-gray-500/60
		   dark:hover:bg-gray-700
		   dark:hover:shadow-black/30 {className}"
>
	<!-- Compact theme icon -->
	{#if $themeStore === "light"}
		<Sun class="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
	{:else if $themeStore === "dark"}
		<Moon class="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
	{:else}
		<Monitor class="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
	{/if}

	<!-- Mini switch indicator -->
	<div
		class="relative h-2.5 w-5 rounded-full bg-gray-200 transition-colors duration-200 dark:bg-gray-600"
	>
		<div
			class="absolute top-0.5 h-1.5 w-1.5 rounded-full bg-primary transition-transform duration-200
					{isChecked ? 'translate-x-3' : 'translate-x-0.5'}"
		></div>
	</div>

	<!-- Theme label - visible on medium+ screens -->
	<span
		class="hidden text-xs font-medium text-gray-700 capitalize md:inline-block dark:text-gray-200"
	>
		{$themeStore}
	</span>
</button>
