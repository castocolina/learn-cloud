<script lang="ts">
	import { AlertTriangle, RefreshCw } from "lucide-svelte";

	interface Props {
		/** Error title */
		title: string;
		/** Error message/details */
		message?: string;
		/** Additional CSS classes */
		class?: string;
		/** Retry function */
		onRetry?: () => void;
		/** Retry button text */
		retryText?: string;
		/** Show centered layout */
		centered?: boolean;
		/** Error variant */
		variant?: "error" | "warning" | "info";
	}

	let {
		title,
		message,
		class: className = "",
		onRetry,
		retryText = "Retry",
		centered = false,
		variant = "error"
	}: Props = $props();

	const variantClasses = {
		error: "demo-error-state--error",
		warning: "demo-error-state--warning",
		info: "demo-error-state--info"
	};

	const containerClasses = [
		"demo-error-state",
		variantClasses[variant],
		centered ? "demo-error-state--centered" : "",
		className
	]
		.filter(Boolean)
		.join(" ");
</script>

<div class={containerClasses}>
	<div class="demo-error-icon">
		<AlertTriangle size={24} />
	</div>
	<div class="demo-error-content">
		<h3 class="demo-error-title">{title}</h3>
		{#if message}
			<p class="demo-error-message">{message}</p>
		{/if}
		{#if onRetry}
			<button class="demo-error-retry" onclick={onRetry} type="button">
				<RefreshCw size={16} />
				{retryText}
			</button>
		{/if}
	</div>
</div>

<style>
	.demo-error-state {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid;
	}

	.demo-error-state--centered {
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 2rem;
	}

	.demo-error-state--error {
		background: hsl(var(--destructive) / 0.1);
		border-color: hsl(var(--destructive) / 0.2);
		color: hsl(var(--destructive));
	}

	.demo-error-state--warning {
		background: hsl(var(--chart-4) / 0.1);
		border-color: hsl(var(--chart-4) / 0.2);
		color: hsl(var(--chart-4));
	}

	.demo-error-state--info {
		background: hsl(var(--chart-3) / 0.1);
		border-color: hsl(var(--chart-3) / 0.2);
		color: hsl(var(--chart-3));
	}

	.demo-error-icon {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.demo-error-content {
		flex: 1;
		min-width: 0;
	}

	.demo-error-title {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
		font-weight: 600;
		color: inherit;
	}

	.demo-error-message {
		margin: 0 0 1rem 0;
		font-size: 0.875rem;
		color: hsl(var(--foreground));
		opacity: 0.8;
		line-height: 1.5;
	}

	.demo-error-retry {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.demo-error-retry:hover {
		background: hsl(var(--primary) / 0.9);
		transform: translateY(-1px);
	}

	.demo-error-retry:active {
		transform: translateY(0);
	}

	.demo-error-state--centered .demo-error-content {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.demo-error-state--centered .demo-error-icon {
		margin-bottom: 0.5rem;
	}
</style>
