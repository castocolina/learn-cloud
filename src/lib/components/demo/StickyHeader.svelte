<script lang="ts">
	import { browser } from "$app/environment";
	import { onMount } from "svelte";
	import {
		Home,
		Layers,
		BookOpen,
		FileText,
		Layout,
		Zap,
		Eye,
		Settings,
		Archive,
		Navigation,
		Monitor,
		Smartphone,
		ChevronRight
	} from "lucide-svelte";
	import {
		getBreadcrumbPath,
		scrollToSection,
		type BreadcrumbConfig,
		type BreadcrumbPath,
		type BreadcrumbIcon
	} from "../../../data/demo/navigation/breadcrumbs.js";

	// Props for the sticky header component
	interface Props {
		/** Current section identifier */
		currentSection?: string;
		/** Optional unit title for dynamic breadcrumbs */
		unitTitle?: string;
		/** Optional unit ID for dynamic breadcrumbs */
		unitId?: string;
		/** Optional lesson title for dynamic breadcrumbs */
		lessonTitle?: string;
		/** Optional lesson ID for dynamic breadcrumbs */
		lessonId?: string;
		/** Whether to show the header (default: true) */
		showHeader?: boolean;
		/** Custom CSS classes */
		class?: string;
		/** Snippet for header actions */
		actions?: import("svelte").Snippet;
	}

	let {
		currentSection = "default",
		unitTitle,
		unitId,
		lessonTitle,
		lessonId,
		showHeader = true,
		class: className = "",
		actions
	}: Props = $props();

	// Reactive state using Svelte 5 runes
	let isSticky = $state<boolean>(false);
	let headerElement = $state<HTMLElement | null>(null);
	let breadcrumbPath = $state<BreadcrumbPath | null>(null);

	// Map icon names to components
	const iconMap: Record<BreadcrumbIcon, typeof Home> = {
		Home,
		Layers,
		BookOpen,
		FileText,
		Layout,
		Zap,
		Eye,
		Settings,
		Archive,
		Navigation,
		Monitor,
		Smartphone
	};

	/**
	 * Get the appropriate icon component for a breadcrumb item
	 */
	function getIconComponent(iconName?: BreadcrumbIcon) {
		if (!iconName) return null;
		return iconMap[iconName] || Home;
	}

	/**
	 * Handle breadcrumb navigation click
	 */
	function handleBreadcrumbClick(breadcrumb: BreadcrumbConfig): void {
		if (!breadcrumb.isClickable || !browser) return;

		// Check if it's a hash-based navigation
		if (breadcrumb.url.includes("#")) {
			const hashPart = breadcrumb.url.split("#")[1];
			if (hashPart && !hashPart.startsWith("/")) {
				// Section scroll navigation
				scrollToSection(hashPart);
				return;
			}
		}

		// Regular navigation
		window.location.href = breadcrumb.url;
	}

	/**
	 * Handle scroll events for sticky header behavior
	 */
	function handleScroll(): void {
		if (!browser || !headerElement) return;

		const headerRect = headerElement.getBoundingClientRect();
		const shouldBeSticky = headerRect.top <= 0;

		if (shouldBeSticky !== isSticky) {
			isSticky = shouldBeSticky;
		}
	}

	/**
	 * Update breadcrumb path when props change
	 */
	function updateBreadcrumbPath(): void {
		breadcrumbPath = getBreadcrumbPath(currentSection, unitTitle, unitId, lessonTitle, lessonId);
	}

	// Update breadcrumb path when relevant props change
	$effect(() => {
		updateBreadcrumbPath();
	});

	// Lifecycle management
	onMount(() => {
		if (!browser) return;

		// Initial breadcrumb path setup
		updateBreadcrumbPath();

		// Set up scroll listener for sticky behavior
		const scrollHandler = () => handleScroll();
		window.addEventListener("scroll", scrollHandler, { passive: true });

		// Initial scroll check
		handleScroll();

		return () => {
			window.removeEventListener("scroll", scrollHandler);
		};
	});
</script>

/** * StickyHeader Component * * CRITICAL Z-INDEX HIERARCHY ISSUE PREVENTION: * * Issue: Z-Index
Hierarchy Violations * - Root Cause: Sticky headers using hardcoded z-index values * - Symptoms:
Modal dialogs appearing behind sticky headers * * PREVENTION RULES: * ✅ ALWAYS use CSS custom
properties: z-index: var(--z-header) * ❌ NEVER use hardcoded z-index values (z-index: 50) * *
GLOBAL Z-INDEX HIERARCHY: * base(1) → dropdown(10) → sticky(50) → sidebar(90) → header(100) → *
overlay(200) → modal(210) → popover(300) → toast(400) * * This component should use var(--z-header)
for proper layering. */
<svelte:head>
	{#if breadcrumbPath?.pageTitle}
		<title>{breadcrumbPath.pageTitle}</title>
	{/if}
	{#if breadcrumbPath?.description}
		<meta name="description" content={breadcrumbPath.description} />
	{/if}
</svelte:head>

{#if showHeader}
	<header
		bind:this={headerElement}
		class="demo-header-sticky {className}"
		class:demo-header-sticky--active={isSticky}
		aria-label="Demo platform navigation"
	>
		<div class="demo-header-container">
			<!-- Breadcrumb Navigation -->
			{#if breadcrumbPath}
				<nav class="demo-breadcrumb-nav" aria-label="Breadcrumb navigation">
					<ol class="demo-breadcrumb-list" role="list">
						{#each breadcrumbPath.items as breadcrumb, index (breadcrumb.id)}
							<li class="demo-breadcrumb-item" role="listitem">
								{#if breadcrumb.isClickable !== false}
									<button
										class="demo-breadcrumb-button"
										class:demo-breadcrumb-button--active={breadcrumb.isActive}
										onclick={() => handleBreadcrumbClick(breadcrumb)}
										aria-label={breadcrumb.ariaLabel || `Navigate to ${breadcrumb.label}`}
										type="button"
									>
										{#if breadcrumb.icon}
											{@const IconComponent = getIconComponent(breadcrumb.icon)}
											<span class="demo-breadcrumb-icon" aria-hidden="true">
												{#if IconComponent}
													<IconComponent size={16} />
												{/if}
											</span>
										{/if}
										<span class="demo-breadcrumb-label">{breadcrumb.label}</span>
									</button>
								{:else}
									<span
										class="demo-breadcrumb-text"
										class:demo-breadcrumb-text--active={breadcrumb.isActive}
										aria-current={breadcrumb.isActive ? "page" : undefined}
									>
										{#if breadcrumb.icon}
											{@const IconComponent = getIconComponent(breadcrumb.icon)}
											<span class="demo-breadcrumb-icon" aria-hidden="true">
												{#if IconComponent}
													<IconComponent size={16} />
												{/if}
											</span>
										{/if}
										<span class="demo-breadcrumb-label">{breadcrumb.label}</span>
									</span>
								{/if}

								{#if index < breadcrumbPath.items.length - 1}
									<span class="demo-breadcrumb-separator" aria-hidden="true">
										<ChevronRight size={14} />
									</span>
								{/if}
							</li>
						{/each}
					</ol>
				</nav>
			{/if}

			<!-- Optional Action Buttons Area -->
			{#if actions}
				<div class="demo-header-actions">
					{@render actions()}
				</div>
			{/if}
		</div>
	</header>
{/if}

<style>
	/* Demo sticky header with mobile-first responsive design */

	.demo-header-sticky {
		position: sticky;
		top: 0;
		left: 0;
		right: 0;
		z-index: var(--z-header);
		background: hsl(var(--background));
		border-bottom: 1px solid hsl(var(--border));
		transition: all 0.2s ease;
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.demo-header-sticky--active {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		background: hsl(var(--background) / 0.95);
	}

	.demo-header-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 1rem;
		max-width: 100%;
		min-height: 3rem;
	}

	/* Breadcrumb navigation */
	.demo-breadcrumb-nav {
		flex: 1;
		min-width: 0; /* Allow flexbox shrinking */
	}

	.demo-breadcrumb-list {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin: 0;
		padding: 0;
		list-style: none;
		flex-wrap: wrap;
	}

	.demo-breadcrumb-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		min-width: 0; /* Allow text truncation */
	}

	.demo-breadcrumb-button,
	.demo-breadcrumb-text {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.5rem;
		border-radius: calc(var(--radius) - 2px);
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1.4;
		text-decoration: none;
		transition: all 0.2s ease;
		min-width: 0; /* Allow text truncation */
		max-width: 200px; /* Prevent very long breadcrumbs */
	}

	.demo-breadcrumb-button {
		background: transparent;
		border: none;
		color: hsl(var(--muted-foreground));
		cursor: pointer;
	}

	.demo-breadcrumb-button:hover {
		background: hsl(var(--accent));
		color: hsl(var(--accent-foreground));
	}

	.demo-breadcrumb-button:focus-visible {
		outline: 2px solid hsl(var(--ring));
		outline-offset: 2px;
	}

	.demo-breadcrumb-button--active,
	.demo-breadcrumb-text--active {
		color: hsl(var(--foreground));
		font-weight: 600;
	}

	.demo-breadcrumb-text {
		color: hsl(var(--muted-foreground));
	}

	.demo-breadcrumb-icon {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.demo-breadcrumb-label {
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.demo-breadcrumb-separator {
		display: flex;
		align-items: center;
		color: hsl(var(--muted-foreground));
		flex-shrink: 0;
		margin: 0 0.125rem;
	}

	/* Header actions area */
	.demo-header-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	/* Mobile-specific optimizations */
	@media (max-width: 480px) {
		.demo-header-container {
			padding: 0.5rem 0.75rem;
			gap: 0.5rem;
		}

		.demo-breadcrumb-button,
		.demo-breadcrumb-text {
			padding: 0.25rem 0.375rem;
			font-size: 0.8rem;
			max-width: 120px; /* Shorter on mobile */
		}

		.demo-breadcrumb-icon {
			display: none; /* Hide icons on very small screens */
		}

		.demo-breadcrumb-list {
			gap: 0.125rem;
		}

		.demo-breadcrumb-separator {
			margin: 0 0.0625rem;
		}
	}

	/* Tablet and larger screens */
	@media (min-width: 768px) {
		.demo-header-container {
			padding: 1rem 1.5rem;
			max-width: 1200px;
			margin: 0 auto;
		}

		.demo-breadcrumb-button,
		.demo-breadcrumb-text {
			max-width: 250px; /* Allow longer breadcrumbs on larger screens */
		}
	}

	/* Large screens */
	@media (min-width: 1024px) {
		.demo-header-container {
			padding: 1rem 2rem;
		}

		.demo-breadcrumb-button,
		.demo-breadcrumb-text {
			max-width: 300px;
		}
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.demo-header-sticky {
			background: hsl(var(--background));
			border-bottom-color: hsl(var(--border));
		}

		.demo-header-sticky--active {
			background: hsl(var(--background) / 0.95);
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.demo-breadcrumb-button {
			border: 1px solid transparent;
		}

		.demo-breadcrumb-button:hover,
		.demo-breadcrumb-button:focus-visible {
			border-color: hsl(var(--ring));
		}

		.demo-breadcrumb-separator {
			opacity: 1;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.demo-header-sticky,
		.demo-breadcrumb-button,
		.demo-breadcrumb-text {
			transition: none;
		}
	}

	/* Print styles */
	@media print {
		.demo-header-sticky {
			position: static;
			box-shadow: none;
			border-bottom: 1px solid #000;
		}

		.demo-breadcrumb-button {
			color: #000 !important;
		}
	}
</style>
