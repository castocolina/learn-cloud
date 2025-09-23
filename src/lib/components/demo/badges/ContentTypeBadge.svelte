<script lang="ts">
	import { DemoContentType } from "$data/demo/navigation/demo-sidebar-menu.js";

	interface Props {
		/** Content type to display */
		contentType: DemoContentType;
		/** Additional CSS classes */
		class?: string;
		/** Size variant */
		size?: "sm" | "md";
	}

	let { contentType, class: className = "", size = "sm" }: Props = $props();

	const baseClasses = "demo-content-badge";
	const sizeClasses = size === "md" ? "demo-content-badge--md" : "";
	const typeClasses = (() => {
		switch (contentType) {
			case DemoContentType.CODE:
				return "demo-content-badge--code";
			case DemoContentType.INTERACTIVE:
				return "demo-content-badge--interactive";
			case DemoContentType.DIAGRAM:
				return "demo-content-badge--diagram";
			case DemoContentType.TEXT:
				return "demo-content-badge--text";
			case DemoContentType.MIXED:
				return "demo-content-badge--mixed";
			default:
				return "";
		}
	})();

	const classes = [baseClasses, typeClasses, sizeClasses, className].filter(Boolean).join(" ");
</script>

<span class={classes}>
	{contentType}
</span>

<style>
	.demo-content-badge {
		display: inline-flex;
		align-items: center;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-size: 0.65rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.demo-content-badge--md {
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
	}

	.demo-content-badge--code {
		background: hsl(var(--chart-1) / 0.1);
		color: hsl(var(--chart-1));
	}

	.demo-content-badge--interactive {
		background: hsl(var(--chart-2) / 0.1);
		color: hsl(var(--chart-2));
	}

	.demo-content-badge--diagram {
		background: hsl(var(--chart-4) / 0.1);
		color: hsl(var(--chart-4));
	}

	.demo-content-badge--text {
		background: hsl(var(--muted));
		color: hsl(var(--muted-foreground));
	}

	.demo-content-badge--mixed {
		background: hsl(var(--accent));
		color: hsl(var(--accent-foreground));
	}
</style>
