<script lang="ts">
	import { DemoDifficulty } from "$data/demo/navigation/demo-sidebar-menu.js";

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
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		border: 1px solid transparent;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
		transition: all 0.2s ease;
	}

	.demo-difficulty-badge--md {
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
	}

	.demo-difficulty-badge--beginner {
		background: hsl(142 76% 36% / 0.15);
		color: hsl(142 76% 36%);
		border: 1px solid hsl(142 76% 36% / 0.3);
	}

	.demo-difficulty-badge--intermediate {
		background: hsl(38 92% 50% / 0.15);
		color: hsl(38 92% 50%);
		border: 1px solid hsl(38 92% 50% / 0.3);
	}

	.demo-difficulty-badge--advanced {
		background: hsl(0 84% 60% / 0.15);
		color: hsl(0 84% 60%);
		border: 1px solid hsl(0 84% 60% / 0.3);
	}

	/* Dark mode adjustments */
	:global(.dark) .demo-difficulty-badge--beginner {
		background: hsl(142 76% 36% / 0.2);
		color: hsl(142 85% 50%);
	}

	:global(.dark) .demo-difficulty-badge--intermediate {
		background: hsl(38 92% 50% / 0.2);
		color: hsl(38 100% 65%);
	}

	:global(.dark) .demo-difficulty-badge--advanced {
		background: hsl(0 84% 60% / 0.2);
		color: hsl(0 84% 70%);
	}
</style>
