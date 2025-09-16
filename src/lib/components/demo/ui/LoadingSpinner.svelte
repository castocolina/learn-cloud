<script lang="ts">
	interface Props {
		/** Size of the spinner */
		size?: "sm" | "md" | "lg";
		/** Additional CSS classes */
		class?: string;
		/** Loading message */
		message?: string;
		/** Show centered layout */
		centered?: boolean;
	}

	let { size = "md", class: className = "", message, centered = false }: Props = $props();

	const sizeClasses = {
		sm: "demo-spinner--sm",
		md: "demo-spinner--md",
		lg: "demo-spinner--lg"
	};

	const containerClasses = [
		"demo-loading-container",
		centered ? "demo-loading-container--centered" : "",
		className
	]
		.filter(Boolean)
		.join(" ");

	const spinnerClasses = ["demo-loading-spinner", sizeClasses[size]].filter(Boolean).join(" ");
</script>

<div class={containerClasses}>
	<div class={spinnerClasses} aria-label="Loading..."></div>
	{#if message}
		<p class="demo-loading-message">{message}</p>
	{/if}
</div>

<style>
	.demo-loading-container {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.demo-loading-container--centered {
		flex-direction: column;
		justify-content: center;
		text-align: center;
		padding: 2rem;
		min-height: 8rem;
	}

	.demo-loading-spinner {
		border: 3px solid hsl(var(--border));
		border-top: 3px solid hsl(var(--primary));
		border-radius: 50%;
		animation: demo-spin 1s linear infinite;
		flex-shrink: 0;
	}

	.demo-loading-spinner--sm {
		width: 16px;
		height: 16px;
		border-width: 2px;
	}

	.demo-loading-spinner--md {
		width: 32px;
		height: 32px;
	}

	.demo-loading-spinner--lg {
		width: 48px;
		height: 48px;
		border-width: 4px;
	}

	.demo-loading-message {
		margin: 0;
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
	}

	.demo-loading-container--centered .demo-loading-message {
		margin-top: 0.5rem;
	}

	@keyframes demo-spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
