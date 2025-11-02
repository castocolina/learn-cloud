<!--
	Dialog Component Showcase

	Isolated testing page for Dialog component using main application layout.
	This page verifies dialog behavior without interference from demo page styles.

	Test Coverage:
	- All size variants (sm, md, lg, xl, full)
	- Both modes: Local state (bind:open) and Global store (openDialog)
	- Close button customization
	- Height constraints (90vh max-height)
	- Mobile-first responsive behavior
	- IconButton subtle variant consistency

	Layout: Uses main application layout (Sidebar.Provider + MainSidebar + StickyHeader)
-->
<script lang="ts">
	import Dialog from "$lib/components/shared/Dialog.svelte";
	import { openDialog } from "$lib/stores/dialog";
	import IconButton from "$lib/components/shared/IconButton.svelte";
	import IconGrid from "$lib/components/shared/IconGrid.svelte";
	import Button from "$lib/components/shared/Button.svelte";
	import {
		Sparkles,
		Copy,
		Download,
		Share2,
		Info,
		Maximize2,
		Settings,
		CircleQuestionMark
	} from "lucide-svelte";

	// Local state for testing bind:open pattern
	let showSmallDialog = $state(false);
	let showMediumDialog = $state(false);
	let showLargeDialog = $state(false);
	let showExtraLargeDialog = $state(false);
	let showFullScreenDialog = $state(false);
	let showCustomCloseDialog = $state(false);
	let showOverflowDialog = $state(false);

	// Intelligent alignment system dialogs
	let showAlignmentContentAligned = $state(false);
	let showAlignmentCloseAdjacent = $state(false);

	// Vertical orientation examples
	let showAlignmentContentAlignedVertical = $state(false);
	let showAlignmentCloseAdjacentVertical = $state(false);

	// Special examples
	let showScrollExample = $state(false);
	let showScrollVerticalExample = $state(false);
	let showNoCloseButtonExample = $state(false);
	let showAutoVerticalExample = $state(false);

	// Real Svelte component for store mode testing
	import StoreDialogContent from "$lib/components/shared/StoreDialogContent.svelte";

	// Open dialog using global store
	function openStoreDialog(size: "sm" | "md" | "lg" | "xl" | "full" = "md") {
		openDialog({
			title: `Store Mode Dialog (${size.toUpperCase()})`,
			content: StoreDialogContent,
			size,
			props: { size }, // Pass size as prop to component
			onClose: () => {
				console.log("Dialog closed via store");
			}
		});
	}
</script>

<div class="container mx-auto max-w-6xl px-4 py-8">
	<!-- Page Header -->
	<div class="mb-8">
		<h1 class="mb-2 text-3xl font-bold">Dialog Component Showcase</h1>
		<p class="text-muted-foreground">
			Isolated testing environment for Dialog component behavior and styling.
		</p>
	</div>

	<!-- Test Sections -->
	<div class="space-y-12">
		<!-- Size Variants Section -->
		<section>
			<h2 class="mb-4 text-2xl font-semibold">Size Variants (Local State Mode)</h2>
			<p class="mb-6 text-muted-foreground">
				Testing all dialog sizes with bind:open pattern. All sizes have 90vh max-height constraint.
			</p>

			<div class="flex flex-wrap gap-4">
				<Button variant="default" onclick={() => (showSmallDialog = true)}>Open Small (sm)</Button>
				<Button variant="default" onclick={() => (showMediumDialog = true)}>
					Open Medium (md)
				</Button>
				<Button
					variant="default"
					data-testid="open-dialog"
					onclick={() => (showLargeDialog = true)}
				>
					Open Large (lg)
				</Button>
				<Button variant="default" onclick={() => (showExtraLargeDialog = true)}>
					Open Extra Large (xl)
				</Button>
				<Button variant="default" onclick={() => (showFullScreenDialog = true)}>
					Open Full Screen (90%)
				</Button>
			</div>
		</section>

		<!-- Store Mode Section -->
		<section>
			<h2 class="mb-4 text-2xl font-semibold">Global Store Mode</h2>
			<p class="mb-6 text-muted-foreground">
				Testing imperative dialog API using global store. Call openDialog() from anywhere.
			</p>

			<div class="flex flex-wrap gap-4">
				<Button variant="secondary" onclick={() => openStoreDialog("sm")}>Store: Small</Button>
				<Button variant="secondary" onclick={() => openStoreDialog("md")}>Store: Medium</Button>
				<Button variant="secondary" onclick={() => openStoreDialog("lg")}>Store: Large</Button>
				<Button variant="secondary" onclick={() => openStoreDialog("xl")}>
					Store: Extra Large
				</Button>
				<Button variant="secondary" onclick={() => openStoreDialog("full")}>
					Store: Full Screen
				</Button>
			</div>
		</section>

		<!-- Custom Close Button Section -->
		<section>
			<h2 class="mb-4 text-2xl font-semibold">Custom Close Button</h2>
			<p class="mb-6 text-muted-foreground">
				Testing closeButton snippet prop with custom IconButton variant.
			</p>

			<Button variant="outline" onclick={() => (showCustomCloseDialog = true)}>
				Open with Custom Close Button
			</Button>
		</section>

		<!-- Intelligent Alignment System Section (NEW) -->
		<section>
			<h2 class="mb-4 text-2xl font-semibold">🆕 Intelligent Alignment System (Action Buttons)</h2>
			<p class="mb-6 text-muted-foreground">
				New intelligent positioning system that automatically avoids collision with the close
				button. Use <code class="rounded bg-muted px-1 py-0.5 text-sm">alignment</code> prop instead
				of
				<code class="rounded bg-muted px-1 py-0.5 text-sm">location</code> for smart positioning.
			</p>

			<div class="space-y-6">
				<!-- Horizontal Orientation Examples -->
				<div>
					<h3 class="mb-3 text-lg font-semibold">Horizontal Orientation (Default)</h3>
					<p class="mb-3 text-sm text-muted-foreground">
						Buttons flow horizontally from right to left. System automatically positions to avoid
						close button collision.
					</p>
					<div class="flex flex-wrap gap-3">
						<Button variant="default" onclick={() => (showAlignmentContentAligned = true)}>
							Content-Aligned
						</Button>
						<Button variant="default" onclick={() => (showAlignmentCloseAdjacent = true)}>
							Close-Adjacent
						</Button>
					</div>
				</div>

				<!-- Vertical Orientation Examples -->
				<div>
					<h3 class="mb-3 text-lg font-semibold">Vertical Orientation</h3>
					<p class="mb-3 text-sm text-muted-foreground">
						Buttons stack vertically from top to bottom. System automatically positions to avoid
						close button collision.
					</p>
					<div class="flex flex-wrap gap-3">
						<Button
							variant="secondary"
							onclick={() => (showAlignmentContentAlignedVertical = true)}
						>
							Content-Aligned (Vertical)
						</Button>
						<Button variant="secondary" onclick={() => (showAlignmentCloseAdjacentVertical = true)}>
							Close-Adjacent (Vertical)
						</Button>
					</div>
				</div>

				<!-- Special Examples -->
				<div>
					<h3 class="mb-3 text-lg font-semibold">🆕 Special Cases</h3>
					<p class="mb-3 text-sm text-muted-foreground">
						Advanced scenarios: sticky positioning with scroll, auto-vertical switching, and no
						close button.
					</p>
					<div class="flex flex-wrap gap-3">
						<Button variant="outline" onclick={() => (showScrollExample = true)}>
							📜 Long Scroll (Horizontal)
						</Button>
						<Button variant="outline" onclick={() => (showScrollVerticalExample = true)}>
							📜 Long Scroll (Vertical)
						</Button>
						<Button variant="outline" onclick={() => (showAutoVerticalExample = true)}>
							🔄 Auto-Vertical (6 Buttons)
						</Button>
						<Button variant="outline" onclick={() => (showNoCloseButtonExample = true)}>
							❌ No Close Button
						</Button>
					</div>
				</div>

				<!-- Debug Mode Info -->
				<div class="rounded-lg bg-blue-50 p-4 text-sm dark:bg-blue-950">
					<p class="font-semibold text-blue-900 dark:text-blue-100">💡 Debug Mode</p>
					<p class="mt-1 text-blue-800 dark:text-blue-200">
						Add <code class="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-900">?debug=true</code> to
						the URL to visualize bounding boxes and safe zones.
					</p>
				</div>
			</div>
		</section>

		<!-- Height Constraint Section -->
		<section>
			<h2 class="mb-4 text-2xl font-semibold">Height Constraints</h2>
			<p class="mb-6 text-muted-foreground">
				Testing 90vh max-height with overflow content. Dialog should be scrollable.
			</p>

			<Button variant="destructive" onclick={() => (showOverflowDialog = true)}>
				Open Dialog with Long Content
			</Button>
		</section>

		<!-- Technical Details Section -->
		<section class="rounded-lg bg-muted/50 p-6">
			<h2 class="mb-4 text-2xl font-semibold">Technical Details</h2>
			<div class="space-y-4 text-sm">
				<div>
					<h3 class="mb-2 font-semibold">Close Button:</h3>
					<p>Uses IconButton component with variant="subtle" for consistency across the app.</p>
				</div>
				<div>
					<h3 class="mb-2 font-semibold">Height Constraints:</h3>
					<p>
						All size variants have lg:!max-h-[90vh] to prevent content overflow. Full-size uses
						SETTINGS.ui.mermaid.modalPagePercent.
					</p>
				</div>
				<div>
					<h3 class="mb-2 font-semibold">Mobile-First:</h3>
					<p>
						All dialogs are full-screen on mobile (≤390px), size variants apply on desktop
						(≥1024px).
					</p>
				</div>
				<div>
					<h3 class="mb-2 font-semibold">Z-Index Hierarchy:</h3>
					<p>Header (100) &lt; Overlay (200) &lt; Dialog Content (210)</p>
				</div>
			</div>
		</section>
	</div>
</div>

<!-- Dialog Instances - Local State Mode -->
<Dialog bind:open={showSmallDialog} size="sm" title="Small Dialog (sm)">
	<p class="mb-4">This is a small dialog (~384px width on desktop).</p>
	<p>Perfect for simple confirmations or brief messages.</p>
</Dialog>

<Dialog bind:open={showMediumDialog} size="md" title="Medium Dialog (md)">
	<p class="mb-4">This is a medium dialog (~448px width on desktop).</p>
	<p class="mb-4">The default size for most dialog use cases.</p>

	<!-- Internal close button for testing dialog close from content -->
	<div class="mt-4 flex justify-end">
		<Button variant="outline" onclick={() => (showMediumDialog = false)}>Close</Button>
	</div>
</Dialog>

<Dialog bind:open={showLargeDialog} size="lg" title="Large Dialog (lg)">
	<!-- IconGrid positioned absolutely in top-right corner -->
	<div class="icon-grid absolute top-4 right-4">
		<IconGrid
			icons={[
				{
					id: "copy",
					icon: Copy,
					label: "Copy content",
					onClick: () => console.log("Copy clicked"),
					variant: "subtle"
				},
				{
					id: "download",
					icon: Download,
					label: "Download",
					onClick: () => console.log("Download clicked"),
					variant: "subtle"
				},
				{
					id: "share",
					icon: Share2,
					label: "Share",
					onClick: () => console.log("Share clicked"),
					variant: "subtle"
				},
				{
					id: "info",
					icon: Info,
					label: "More info",
					onClick: () => console.log("Info clicked"),
					variant: "subtle"
				}
			]}
		/>
	</div>

	<p class="mb-4">This is a large dialog (~512px width on desktop).</p>
	<p class="mb-4">Ideal for search results, longer content, or forms.</p>
	<p class="mb-4 text-sm text-muted-foreground">
		Notice the IconGrid in the top-right corner - this demonstrates IconGrid integration within
		Dialog components.
	</p>
	<div class="rounded-md border border-accent/50 bg-accent/20 p-4">
		<p class="font-semibold">Example Use Cases:</p>
		<ul class="mt-2 list-inside list-disc space-y-1">
			<li>Search results display</li>
			<li>Multi-step forms</li>
			<li>Detailed content preview</li>
			<li>Actions toolbar (IconGrid integration)</li>
		</ul>
	</div>
</Dialog>

<Dialog bind:open={showExtraLargeDialog} size="xl" title="Extra Large Dialog (xl)">
	<p class="mb-4">This is an extra large dialog (~576px width on desktop).</p>
	<p class="mb-4">Best for complex forms or detailed content requiring more space.</p>
	<div class="mt-4 grid grid-cols-2 gap-4">
		<div class="rounded-md bg-primary/10 p-4">
			<h3 class="mb-2 font-semibold">Feature A</h3>
			<p class="text-sm">Extra width allows for multi-column layouts.</p>
		</div>
		<div class="rounded-md bg-primary/10 p-4">
			<h3 class="mb-2 font-semibold">Feature B</h3>
			<p class="text-sm">More horizontal space for content organization.</p>
		</div>
	</div>
</Dialog>

<Dialog bind:open={showFullScreenDialog} size="full" title="Full Screen Dialog (90%)">
	<p class="mb-4">
		This dialog uses SETTINGS.ui.mermaid.modalPagePercent (default: 90%) for both width and height.
	</p>
	<p class="mb-4">Perfect for immersive experiences like diagrams, videos, or large datasets.</p>
	<div class="flex min-h-[300px] items-center justify-center rounded-lg bg-muted p-6">
		<div class="text-center">
			<h3 class="mb-2 text-xl font-semibold">Content Area</h3>
			<p class="text-muted-foreground">
				This space would contain your diagram, chart, or other full-screen content.
			</p>
		</div>
	</div>
</Dialog>

<Dialog bind:open={showCustomCloseDialog} size="md" title="Custom Close Button">
	{#snippet closeButton()}
		<IconButton
			icon={Sparkles}
			label="Close with sparkles!"
			variant="primary"
			onClick={() => (showCustomCloseDialog = false)}
		/>
	{/snippet}

	<p class="mb-4">This dialog uses a custom close button via the closeButton snippet prop.</p>
	<p class="mb-4">
		Notice the close button uses the primary variant with a sparkles icon instead of the default X
		icon with subtle variant.
	</p>
	<div class="rounded-md border border-accent/50 bg-accent/20 p-4">
		<p class="mb-2 font-semibold">Custom Close Button API:</p>
		<pre class="overflow-x-auto rounded bg-background p-2 text-xs">{`{#snippet closeButton()}
  <IconButton
    icon={Sparkles}
    label="Close"
    variant="primary"
    onClick={() => (open = false)}
  />
{/snippet}`}</pre>
	</div>
</Dialog>

<Dialog bind:open={showOverflowDialog} size="lg" title="Height Constraint Test">
	<div class="max-h-[70vh] overflow-auto">
		<p class="mb-4">
			This dialog has extensive content to test the 90vh max-height constraint and scrolling
			behavior.
		</p>

		{#each Array(20) as _, i (i)}
			<div class="mb-4 rounded-md bg-muted p-4">
				<h3 class="mb-2 font-semibold">Content Block {i + 1}</h3>
				<p class="text-sm">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
					ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
					ullamco laboris nisi ut aliquip ex ea commodo consequat.
				</p>
			</div>
		{/each}

		<div class="bg-success/20 border-success/50 mt-4 rounded-md border p-4">
			<p class="font-semibold">✅ If you can see this, scrolling works correctly!</p>
			<p class="mt-2 text-sm">
				The dialog should have scrolled to show this content without exceeding 90vh height.
			</p>
		</div>
	</div>
</Dialog>

<!-- Intelligent Alignment System Dialogs (NEW) -->
<Dialog
	bind:open={showAlignmentContentAligned}
	size="lg"
	title="🆕 Content-Aligned (Default)"
	actionButtons={{
		icons: [
			{
				id: "copy",
				icon: Copy,
				label: "Copy",
				onClick: () => console.log("Copy clicked"),
				variant: "subtle"
			},
			{
				id: "download",
				icon: Download,
				label: "Download",
				onClick: () => console.log("Download clicked"),
				variant: "subtle"
			},
			{
				id: "share",
				icon: Share2,
				label: "Share",
				onClick: () => console.log("Share clicked"),
				variant: "subtle"
			}
		],
		alignment: "content-aligned" // NEW: Intelligent positioning system
	}}
>
	<div class="space-y-4">
		<p class="text-muted-foreground">
			Action buttons float OVER the content area (not in header). Positioned below the header,
			aligned with content padding (20px from right edge).
		</p>

		<div class="rounded-md bg-muted p-4">
			<p class="mb-2 font-semibold">Configuration:</p>
			<code class="rounded bg-background px-2 py-1 text-sm">alignment: "content-aligned"</code>
		</div>

		<div class="rounded-md border border-blue-500/30 bg-blue-50 p-4 dark:bg-blue-950/30">
			<p class="mb-2 font-semibold text-blue-900 dark:text-blue-100">✨ Key Characteristics:</p>
			<ul class="ml-4 list-disc space-y-1 text-sm text-blue-800 dark:text-blue-200">
				<li>Float over content area (absolute positioning)</li>
				<li>Positioned AFTER header (76px from top)</li>
				<li>Aligned with content padding (20px from right)</li>
				<li>Works seamlessly with scrollable content</li>
			</ul>
		</div>

		<div class="rounded-md bg-yellow-50 p-4 dark:bg-yellow-950/30">
			<p class="mb-2 font-semibold text-yellow-900 dark:text-yellow-100">💡 Try Debug Mode:</p>
			<p class="text-sm text-yellow-800 dark:text-yellow-200">
				Add <code class="rounded bg-yellow-100 px-1 py-0.5 dark:bg-yellow-900">?debug=true</code> to
				the URL to see bounding boxes, safe zones, and positioning details.
			</p>
		</div>
	</div>
</Dialog>

<Dialog
	bind:open={showAlignmentCloseAdjacent}
	size="lg"
	title="🆕 Close-Adjacent Alignment"
	actionButtons={{
		icons: [
			{
				id: "copy",
				icon: Copy,
				label: "Copy",
				onClick: () => console.log("Copy clicked"),
				variant: "subtle"
			},
			{
				id: "download",
				icon: Download,
				label: "Download",
				onClick: () => console.log("Download clicked"),
				variant: "subtle"
			},
			{
				id: "share",
				icon: Share2,
				label: "Share",
				onClick: () => console.log("Share clicked"),
				variant: "subtle"
			}
		],
		alignment: "close-adjacent" // NEW: Position adjacent to close button
	}}
>
	<div class="space-y-4">
		<p class="text-muted-foreground">
			Action buttons positioned adjacent to the close button. Horizontal orientation: to the LEFT
			with safe spacing (76px from right). Ideal for compact layouts.
		</p>

		<div class="rounded-md bg-muted p-4">
			<p class="mb-2 font-semibold">Configuration:</p>
			<code class="rounded bg-background px-2 py-1 text-sm">alignment: "close-adjacent"</code>
		</div>

		<div class="rounded-md border border-blue-500/30 bg-blue-50 p-4 dark:bg-blue-950/30">
			<p class="mb-2 font-semibold text-blue-900 dark:text-blue-100">✨ Safe Zone Calculation:</p>
			<ul class="ml-4 list-disc space-y-1 text-sm text-blue-800 dark:text-blue-200">
				<li>Close button: 44px (WCAG minimum touch target)</li>
				<li>Close button offset: 20px (1.25rem from right edge)</li>
				<li>Safe gap: 12px (minimum spacing between elements)</li>
				<li><strong>Horizontal: 76px from right (to the LEFT of close button)</strong></li>
			</ul>
		</div>

		<div class="rounded-md bg-green-50 p-4 dark:bg-green-950/30">
			<p class="mb-2 font-semibold text-green-900 dark:text-green-100">
				✅ Automatic Collision Avoidance:
			</p>
			<p class="text-sm text-green-800 dark:text-green-200">
				Buttons positioned to the LEFT of close button with safe spacing, ensuring no overlap.
			</p>
		</div>
	</div>
</Dialog>

<!-- Vertical Orientation Examples -->
<Dialog
	bind:open={showAlignmentContentAlignedVertical}
	size="lg"
	title="🆕 Content-Aligned (Vertical)"
	actionButtons={{
		icons: [
			{
				id: "copy",
				icon: Copy,
				label: "Copy",
				onClick: () => console.log("Copy clicked"),
				variant: "subtle"
			},
			{
				id: "download",
				icon: Download,
				label: "Download",
				onClick: () => console.log("Download clicked"),
				variant: "subtle"
			},
			{
				id: "share",
				icon: Share2,
				label: "Share",
				onClick: () => console.log("Share clicked"),
				variant: "subtle"
			}
		],
		alignment: "content-aligned",
		orientation: "vertical" // VERTICAL orientation
	}}
>
	<div class="space-y-4">
		<p class="text-muted-foreground">
			Action buttons float OVER content area in vertical stack. Positioned below header, aligned
			with content padding (20px from right).
		</p>

		<div class="rounded-md bg-muted p-4">
			<p class="mb-2 font-semibold">Configuration:</p>
			<pre class="overflow-x-auto rounded bg-background p-2 text-xs">{`alignment: "content-aligned"
orientation: "vertical"`}</pre>
		</div>

		<div class="rounded-md border border-purple-500/30 bg-purple-50 p-4 dark:bg-purple-950/30">
			<p class="mb-2 font-semibold text-purple-900 dark:text-purple-100">
				🎯 Vertical Stack Positioning:
			</p>
			<ul class="ml-4 list-disc space-y-1 text-sm text-purple-800 dark:text-purple-200">
				<li>Stack vertically OVER content area (not in header)</li>
				<li>Start position: 76px from top (below header)</li>
				<li>Horizontally: 20px from right (aligned with content padding)</li>
				<li>Floats over scrollable content</li>
			</ul>
		</div>
	</div>
</Dialog>

<Dialog
	bind:open={showAlignmentCloseAdjacentVertical}
	size="lg"
	title="🆕 Close-Adjacent (Vertical)"
	actionButtons={{
		icons: [
			{
				id: "copy",
				icon: Copy,
				label: "Copy",
				onClick: () => console.log("Copy clicked"),
				variant: "subtle"
			},
			{
				id: "download",
				icon: Download,
				label: "Download",
				onClick: () => console.log("Download clicked"),
				variant: "subtle"
			},
			{
				id: "share",
				icon: Share2,
				label: "Share",
				onClick: () => console.log("Share clicked"),
				variant: "subtle"
			}
		],
		alignment: "close-adjacent",
		orientation: "vertical" // VERTICAL orientation
	}}
>
	<div class="space-y-4">
		<p class="text-muted-foreground">
			Action buttons stack vertically BELOW the close button. SAME horizontal position as close
			button (20px from right).
		</p>

		<div class="rounded-md bg-muted p-4">
			<p class="mb-2 font-semibold">Configuration:</p>
			<pre class="overflow-x-auto rounded bg-background p-2 text-xs">{`alignment: "close-adjacent"
orientation: "vertical"`}</pre>
		</div>

		<div class="rounded-md border border-green-500/30 bg-green-50 p-4 dark:bg-green-950/30">
			<p class="mb-2 font-semibold text-green-900 dark:text-green-100">📐 Vertical Alignment:</p>
			<ul class="ml-4 list-disc space-y-1 text-sm text-green-800 dark:text-green-200">
				<li>Stack directly BELOW close button (76px from top)</li>
				<li>SAME horizontal position as close button (20px from right)</li>
				<li>Forms vertical column aligned with close button</li>
				<li>Ideal for compact vertical toolbar next to close button</li>
			</ul>
		</div>
	</div>
</Dialog>

<!-- ============================================================================
     SPECIAL EXAMPLES
     ============================================================================ -->

<!-- Scroll Example: Long content with sticky action buttons -->
<Dialog
	bind:open={showScrollExample}
	size="lg"
	title="📜 Scroll Example - Sticky Action Buttons"
	actionButtons={{
		icons: [
			{
				id: "copy",
				icon: Copy,
				label: "Copy",
				onClick: () => console.log("Copy clicked"),
				variant: "subtle"
			},
			{
				id: "download",
				icon: Download,
				label: "Download",
				onClick: () => console.log("Download clicked"),
				variant: "subtle"
			},
			{
				id: "share",
				icon: Share2,
				label: "Share",
				onClick: () => console.log("Share clicked"),
				variant: "subtle"
			}
		],
		alignment: "content-aligned", // Sticky positioning
		orientation: "horizontal"
	}}
>
	<div class="space-y-4">
		<div class="rounded-md border border-blue-500/30 bg-blue-50 p-4 dark:bg-blue-950/30">
			<p class="mb-2 font-semibold text-blue-900 dark:text-blue-100">🎯 Sticky Demo:</p>
			<p class="text-sm text-blue-800 dark:text-blue-200">
				Scroll down to see the action buttons remain visible at the top. They use <code
					class="rounded bg-blue-100 px-1 dark:bg-blue-900">position: fixed</code
				>
				with <code class="rounded bg-blue-100 px-1 dark:bg-blue-900">z-[205]</code>.
			</p>
		</div>

		{#each Array(30) as _, i (i)}
			<p class="text-muted-foreground">
				<strong>Paragraph {i + 1}:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
				nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
				dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
				sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
			</p>
		{/each}

		<div class="rounded-md border border-green-500/30 bg-green-50 p-4 dark:bg-green-950/30">
			<p class="font-semibold text-green-900 dark:text-green-100">
				✅ End of content - scroll back up to verify sticky positioning!
			</p>
		</div>
	</div>
</Dialog>

<!-- Scroll Example (Vertical): Long content with vertical action buttons -->
<Dialog
	bind:open={showScrollVerticalExample}
	size="lg"
	title="📜 Scroll Example - Sticky Vertical Buttons"
	actionButtons={{
		icons: [
			{
				id: "copy",
				icon: Copy,
				label: "Copy",
				onClick: () => console.log("Copy clicked"),
				variant: "subtle"
			},
			{
				id: "download",
				icon: Download,
				label: "Download",
				onClick: () => console.log("Download clicked"),
				variant: "subtle"
			},
			{
				id: "share",
				icon: Share2,
				label: "Share",
				onClick: () => console.log("Share clicked"),
				variant: "subtle"
			}
		],
		alignment: "content-aligned", // Sticky positioning
		orientation: "vertical" // VERTICAL orientation
	}}
>
	<div class="space-y-4">
		<div class="rounded-md border border-purple-500/30 bg-purple-50 p-4 dark:bg-purple-950/30">
			<p class="mb-2 font-semibold text-purple-900 dark:text-purple-100">
				🎯 Vertical Sticky Demo:
			</p>
			<p class="text-sm text-purple-800 dark:text-purple-200">
				Scroll down to see the action buttons remain visible at the top in VERTICAL orientation.
				They use <code class="rounded bg-purple-100 px-1 dark:bg-purple-900">position: fixed</code>
				with
				<code class="rounded bg-purple-100 px-1 dark:bg-purple-900">orientation: "vertical"</code>.
			</p>
		</div>

		{#each Array(30) as _, i (i)}
			<p class="text-muted-foreground">
				<strong>Paragraph {i + 1}:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
				nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
				dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
				sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
			</p>
		{/each}

		<div class="rounded-md border border-green-500/30 bg-green-50 p-4 dark:bg-green-950/30">
			<p class="font-semibold text-green-900 dark:text-green-100">
				✅ End of content - scroll back up to verify vertical sticky positioning!
			</p>
		</div>
	</div>
</Dialog>

<!-- Auto-Vertical Example: 6 buttons trigger auto-switch -->
<Dialog
	bind:open={showAutoVerticalExample}
	size="md"
	title="🔄 Auto-Vertical - 6 Buttons"
	actionButtons={{
		icons: [
			{
				id: "copy",
				icon: Copy,
				label: "Copy",
				onClick: () => console.log("Copy clicked"),
				variant: "subtle"
			},
			{
				id: "download",
				icon: Download,
				label: "Download",
				onClick: () => console.log("Download clicked"),
				variant: "subtle"
			},
			{
				id: "share",
				icon: Share2,
				label: "Share",
				onClick: () => console.log("Share clicked"),
				variant: "subtle"
			},
			{
				id: "maximize",
				icon: Maximize2,
				label: "Maximize",
				onClick: () => console.log("Maximize clicked"),
				variant: "subtle"
			},
			{
				id: "settings",
				icon: Settings,
				label: "Settings",
				onClick: () => console.log("Settings clicked"),
				variant: "subtle"
			},
			{
				id: "help",
				icon: CircleQuestionMark,
				label: "Help",
				onClick: () => console.log("Help clicked"),
				variant: "subtle"
			}
		],
		alignment: "close-adjacent",
		orientation: "horizontal" // Will auto-switch to vertical (6 buttons)
	}}
>
	<div class="space-y-4">
		<div class="rounded-md border border-purple-500/30 bg-purple-50 p-4 dark:bg-purple-950/30">
			<p class="mb-2 font-semibold text-purple-900 dark:text-purple-100">🔄 Auto-Switch Logic:</p>
			<ul class="ml-4 list-disc space-y-1 text-sm text-purple-800 dark:text-purple-200">
				<li>
					Requested: <code class="rounded bg-purple-100 px-1 dark:bg-purple-900">horizontal</code>
				</li>
				<li>Button count: <strong>6 buttons</strong></li>
				<li>
					Threshold: <code class="rounded bg-purple-100 px-1 dark:bg-purple-900"
						>&gt;= 4 buttons</code
					>
				</li>
				<li>
					Result: <strong>Automatically switched to vertical</strong> to prevent overflow
				</li>
			</ul>
		</div>

		<div class="rounded-md bg-muted p-4">
			<p class="mb-2 font-semibold">Console Warning:</p>
			<pre
				class="overflow-x-auto rounded bg-background p-2 text-xs">{`[Dialog] Auto-switched to vertical orientation (6 buttons).
Horizontal supports 1-3 buttons for optimal UX.`}</pre>
		</div>

		<p class="text-muted-foreground">
			Open the browser console to see the automatic orientation switch warning. This prevents
			horizontal overflow and ensures optimal UX.
		</p>
	</div>
</Dialog>

<!-- No Close Button Example -->
<Dialog
	bind:open={showNoCloseButtonExample}
	size="md"
	title="❌ No Close Button - Action Buttons Only"
	showCloseButton={false}
	actionButtons={{
		icons: [
			{
				id: "copy",
				icon: Copy,
				label: "Copy",
				onClick: () => console.log("Copy clicked"),
				variant: "subtle"
			},
			{
				id: "download",
				icon: Download,
				label: "Download",
				onClick: () => console.log("Download clicked"),
				variant: "subtle"
			},
			{
				id: "share",
				icon: Share2,
				label: "Share",
				onClick: () => console.log("Share clicked"),
				variant: "subtle"
			}
		],
		alignment: "content-aligned",
		orientation: "horizontal"
	}}
>
	<div class="space-y-4">
		<div class="rounded-md border border-orange-500/30 bg-orange-50 p-4 dark:bg-orange-950/30">
			<p class="mb-2 font-semibold text-orange-900 dark:text-orange-100">🚫 No Close Button:</p>
			<ul class="ml-4 list-disc space-y-1 text-sm text-orange-800 dark:text-orange-200">
				<li>
					<code class="rounded bg-orange-100 px-1 dark:bg-orange-900">showCloseButton: false</code>
				</li>
				<li>Only action buttons visible</li>
				<li>User can close via ESC key or clicking outside</li>
				<li>Useful for non-modal workflows or custom close logic</li>
			</ul>
		</div>

		<p class="text-muted-foreground">This dialog has no close button. Try closing it by:</p>

		<ul class="ml-6 list-disc space-y-2 text-muted-foreground">
			<li>Pressing the <kbd class="rounded border px-2 py-1 text-xs">ESC</kbd> key</li>
			<li>Clicking outside the dialog (on the overlay)</li>
		</ul>
	</div>
</Dialog>

<!-- Store Mode Dialog - NO open prop, listens to global dialog store -->
<Dialog />
