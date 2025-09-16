<script lang="ts">
	interface Props {
		/** Progress value (0-100) */
		value: number;
		/** Maximum value (default: 100) */
		max?: number;
		/** Additional CSS classes */
		class?: string;
		/** Size variant */
		size?: "sm" | "md" | "lg";
		/** Color variant */
		variant?: "primary" | "secondary" | "success" | "warning" | "danger";
		/** Show text label */
		showLabel?: boolean;
		/** Custom label text */
		label?: string;
	}

	let {
		value,
		max = 100,
		class: className = "",
		size = "md",
		variant = "primary",
		showLabel = false,
		label
	}: Props = $props();

	// Clamp value between 0 and max
	const clampedValue = $derived(Math.min(max, Math.max(0, value)));
	const percentage = $derived((clampedValue / max) * 100);

	const sizeClasses = {
		sm: "demo-progress--sm",
		md: "demo-progress--md",
		lg: "demo-progress--lg"
	};

	const variantClasses = {
		primary: "demo-progress--primary",
		secondary: "demo-progress--secondary",
		success: "demo-progress--success",
		warning: "demo-progress--warning",
		danger: "demo-progress--danger"
	};

	const containerClasses = ["demo-progress-container", sizeClasses[size], className]
		.filter(Boolean)
		.join(" ");

	const fillClasses = ["demo-progress-fill", variantClasses[variant]].filter(Boolean).join(" ");

	const displayLabel = $derived(label || `${Math.round(percentage)}%`);
</script>

<div class={containerClasses} role="progressbar" aria-valuenow={clampedValue} aria-valuemax={max}>
	<div class="demo-progress-track">
		<div class={fillClasses} style="width: {percentage}%"></div>
	</div>
	{#if showLabel}
		<span class="demo-progress-label">{displayLabel}</span>
	{/if}
</div>

<style>
	.demo-progress-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
	}

	.demo-progress-track {
		flex: 1;
		background: hsl(var(--muted));
		border-radius: 2px;
		overflow: hidden;
	}

	.demo-progress-fill {
		height: 100%;
		transition: width 0.3s ease;
		border-radius: 2px;
	}

	.demo-progress-label {
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
		font-weight: 500;
		min-width: 2.5rem;
		text-align: right;
	}

	/* Sizes */
	.demo-progress--sm .demo-progress-track {
		height: 2px;
	}

	.demo-progress--sm .demo-progress-label {
		font-size: 0.65rem;
		min-width: 2rem;
	}

	.demo-progress--md .demo-progress-track {
		height: 4px;
	}

	.demo-progress--lg .demo-progress-track {
		height: 6px;
	}

	.demo-progress--lg .demo-progress-label {
		font-size: 0.875rem;
		min-width: 3rem;
	}

	/* Variants */
	.demo-progress--primary {
		background: hsl(var(--primary));
	}

	.demo-progress--secondary {
		background: hsl(var(--secondary));
	}

	.demo-progress--success {
		background: hsl(var(--chart-2));
	}

	.demo-progress--warning {
		background: hsl(var(--chart-4));
	}

	.demo-progress--danger {
		background: hsl(var(--destructive));
	}
</style>
