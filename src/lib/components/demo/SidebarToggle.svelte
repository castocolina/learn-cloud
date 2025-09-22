<!--
  Sidebar Toggle Button Component

  Professional toggle button for collapsing/expanding the desktop sidebar.
  Uses shadcn-svelte Button component with smooth animations and accessibility features.
-->
<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { PanelLeftClose, PanelLeftOpen } from "lucide-svelte";
	import { useSidebar } from "$lib/stores/sidebar.js";

	// Sidebar state management
	const { isCollapsed, isAnimating, toggle } = useSidebar();

	// Component props
	interface Props {
		/**
		 * Additional CSS classes
		 */
		class?: string;
		/**
		 * Button size variant
		 */
		size?: "default" | "sm" | "lg" | "icon";
		/**
		 * Button style variant
		 */
		variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
		/**
		 * Custom click handler (optional)
		 */
		onclick?: () => void;
	}

	let { class: className = "", size = "icon", variant = "ghost", onclick }: Props = $props();

	/**
	 * Handle toggle button click
	 */
	function handleToggle() {
		// Call custom handler if provided
		if (onclick) {
			onclick();
		}

		// Toggle sidebar state
		toggle();
	}
</script>

<!-- Toggle Button -->
<Button
	{variant}
	{size}
	class="sidebar-toggle {className}"
	onclick={handleToggle}
	disabled={$isAnimating}
	aria-label={$isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
	aria-expanded={!$isCollapsed}
	title={$isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
>
	{#if $isCollapsed}
		<PanelLeftOpen size={18} />
	{:else}
		<PanelLeftClose size={18} />
	{/if}
</Button>

<style>
	:global(.sidebar-toggle) {
		/* Custom styling for the toggle button */
		transition: all 0.2s ease;
		position: relative;
		z-index: 10;

		/* Ensure proper spacing and alignment */
		min-width: 36px;
		min-height: 36px;

		/* Improved hover states */
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));

		/* IMPORTANT: Always show pointer cursor */
		cursor: pointer !important;
	}

	:global(.sidebar-toggle:hover) {
		background: hsl(var(--accent));
		border-color: hsl(var(--accent-foreground) / 0.2);
		transform: scale(1.05);
		box-shadow: 0 2px 8px hsl(var(--foreground) / 0.1);
		cursor: pointer !important;
	}

	:global(.sidebar-toggle:active) {
		transform: scale(0.98);
		cursor: pointer !important;
	}

	:global(.sidebar-toggle:disabled) {
		opacity: 0.6;
		cursor: not-allowed !important;
		transform: none;
	}

	/* Dark mode support */
	:global(.dark .sidebar-toggle) {
		background: hsl(var(--background));
		border-color: hsl(var(--border));
	}

	:global(.dark .sidebar-toggle:hover) {
		background: hsl(var(--accent));
		border-color: hsl(var(--accent-foreground) / 0.2);
	}

	/* Focus styles for accessibility */
	:global(.sidebar-toggle:focus-visible) {
		outline: 2px solid hsl(var(--primary));
		outline-offset: 2px;
		border-color: hsl(var(--primary));
	}
</style>
