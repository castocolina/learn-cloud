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
	import { Sparkles, Copy, Download, Share2, Info } from "lucide-svelte";

	// Local state for testing bind:open pattern
	let showSmallDialog = $state(false);
	let showMediumDialog = $state(false);
	let showLargeDialog = $state(false);
	let showExtraLargeDialog = $state(false);
	let showFullScreenDialog = $state(false);
	let showCustomCloseDialog = $state(false);
	let showOverflowDialog = $state(false);

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
	<p class="mb-4">
		This dialog has extensive content to test the 90vh max-height constraint and scrolling behavior.
	</p>

	{#each Array(20) as _, i (i)}
		<div class="mb-4 rounded-md bg-muted p-4">
			<h3 class="mb-2 font-semibold">Content Block {i + 1}</h3>
			<p class="text-sm">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
		</div>
	{/each}

	<div class="bg-success/20 border-success/50 mt-4 rounded-md border p-4">
		<p class="font-semibold">✅ If you can see this, scrolling works correctly!</p>
		<p class="mt-2 text-sm">
			The dialog should have scrolled to show this content without exceeding 90vh height.
		</p>
	</div>
</Dialog>

<!-- Store Mode Dialog - NO open prop, listens to global dialog store -->
<Dialog />
