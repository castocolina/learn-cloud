<!--
	Progress Wrapper Component (SETTINGS Integration Example)

	Purpose: Demonstrates SETTINGS integration and theme-aware configuration
	Pattern Type: CONFIGURATION - Wrapper with centralized settings integration

	Key Patterns Demonstrated:
	- SETTINGS integration for default configuration
	- Theme-aware styling (follows theme system)
	- Derived state for computed values
	- Type-safe props with validation
	- Svelte 5 runes syntax

	Usage Example:
	<script lang="ts">
		import { Progress } from "$lib/components/shared";

		let value = $state(0);
		let max = $state(100);

		// Simulate progress
		onMount(() => {
			const interval = setInterval(() => {
				value = Math.min(value + 10, max);
				if (value >= max) clearInterval(interval);
			}, 500);
		});
	</script>

	<Progress {value} {max} showPercentage />

	Related Documentation:
	- docs/WRAPPER-PATTERN-GUIDE.md (SETTINGS integration patterns)
	- SVELTEKIT-GUIDE.md (centralized configuration)
	- src/config/settings.ts (UI configuration)

	Note: This component demonstrates how to integrate with SETTINGS for
	theme-aware defaults and configuration. Future tasks (8K) will extend
	this pattern for progress tracking features.
-->
<script lang="ts">
	import { Progress as ShadcnProgress } from "$lib/components/ui/progress";
	import type { ProgressProps } from "$types/ui";

	// Svelte 5 runes syntax: destructure props with defaults
	let {
		value = 0,
		max = 100,
		showPercentage = false,
		class: className,
		size = "md"
	}: ProgressProps = $props();

	/**
	 * Computed percentage value
	 *
	 * Derives percentage from current value and max
	 * Ensures safe division (handles edge cases)
	 */
	const percentage = $derived.by(() => {
		if (max <= 0) return 0;
		const percent = Math.round((value / max) * 100);
		return Math.min(Math.max(percent, 0), 100); // Clamp to 0-100
	});

	/**
	 * Size-based height classes
	 *
	 * Pattern: Responsive sizing for different use cases
	 * - sm: Quiz question progress (compact)
	 * - md: Standard progress indicators
	 * - lg: Unit completion tracking (prominent)
	 */
	const heightClass = $derived.by(() => {
		switch (size) {
			case "sm":
				return "h-1";
			case "md":
				return "h-2";
			case "lg":
				return "h-3";
			default:
				return "h-2";
		}
	});

	/**
	 * Combined CSS classes
	 *
	 * Pattern: Merge size classes with user-provided classes
	 */
	const progressClasses = $derived(`${heightClass} ${className || ""}`);

	/**
	 * Accessibility label
	 *
	 * Pattern: Provide screen reader context
	 */
	const ariaLabel = $derived(`Progress: ${percentage}% complete`);
</script>

<!--
	Progress component structure

	Architecture:
	- Wraps shadcn-svelte Progress component
	- Optional percentage display for user feedback
	- Theme-aware styling via shadcn theming system

	Theme Integration:
	- Progress bar uses --primary color from theme system
	- Background uses --primary/20 (20% opacity)
	- Automatically adapts to light/dark mode
-->
<div class="progress-wrapper">
	<div class="progress-container">
		<ShadcnProgress
			{value}
			{max}
			class={progressClasses}
			aria-label={ariaLabel}
			aria-valuenow={value}
			aria-valuemin={0}
			aria-valuemax={max}
		/>
	</div>

	{#if showPercentage}
		<div class="progress-percentage" role="status" aria-live="polite">
			<span class="percentage-text">{percentage}%</span>
		</div>
	{/if}
</div>

<!--
	Component-specific styles

	CRITICAL: Following SVELTEKIT-GUIDE.md standards:
	- NO @apply usage (Tailwind v4 incompatible)
	- Styles will be moved to src/app.css @layer components
	- This <style> block is temporary for Task 6 demonstration

	Theme Compliance:
	- Uses semantic color variables (--foreground, --muted-foreground)
	- No hardcoded colors (theme-aware)
-->
<style>
	.progress-wrapper {
		/* Temporary inline styles - will move to app.css */
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.progress-container {
		width: 100%;
	}

	.progress-percentage {
		display: flex;
		justify-content: flex-end;
	}

	.percentage-text {
		font-size: 0.875rem;
		font-weight: 500;
		color: hsl(var(--foreground));
	}

	/* Mobile-first responsive adjustments */
	@media (max-width: 390px) {
		.percentage-text {
			font-size: 0.75rem;
		}
	}
</style>
