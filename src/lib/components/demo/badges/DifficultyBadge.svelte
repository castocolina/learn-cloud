<script lang="ts">
	import { DemoDifficulty } from "../../../../data/demo/navigation/demo-sidebar-menu.js";

	interface Props {
		/** Difficulty level to display */
		difficulty: DemoDifficulty;
		/** Additional CSS classes */
		class?: string;
		/** Size variant */
		size?: "sm" | "md";
	}

	let { difficulty, class: className = "", size = "sm" }: Props = $props();

	const baseClasses = "demo-difficulty-badge";
	const sizeClasses = size === "md" ? "demo-difficulty-badge--md" : "";
	const difficultyClasses = (() => {
		switch (difficulty) {
			case DemoDifficulty.BEGINNER:
				return "demo-difficulty-badge--beginner";
			case DemoDifficulty.INTERMEDIATE:
				return "demo-difficulty-badge--intermediate";
			case DemoDifficulty.ADVANCED:
				return "demo-difficulty-badge--advanced";
			default:
				return "";
		}
	})();

	const classes = [baseClasses, difficultyClasses, sizeClasses, className]
		.filter(Boolean)
		.join(" ");
</script>

<span class={classes}>
	{difficulty}
</span>

<style>
	.demo-difficulty-badge {
		display: inline-flex;
		align-items: center;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-size: 0.65rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.demo-difficulty-badge--md {
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
	}

	.demo-difficulty-badge--beginner {
		background: hsl(var(--chart-2) / 0.1);
		color: hsl(var(--chart-2));
	}

	.demo-difficulty-badge--intermediate {
		background: hsl(var(--chart-4) / 0.1);
		color: hsl(var(--chart-4));
	}

	.demo-difficulty-badge--advanced {
		background: hsl(var(--destructive) / 0.1);
		color: hsl(var(--destructive));
	}
</style>
