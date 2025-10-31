<!--
IconButton & IconGrid Variants Test Page

Test page for E2E testing of IconButton and IconGrid variants and states.
Displays all combinations for visual verification and computed style assertions.

URL: /demo/test/icon-button-variants
-->

<script lang="ts">
	import IconButton from "$lib/components/shared/IconButton.svelte";
	import IconGrid from "$lib/components/shared/IconGrid.svelte";
	import {
		Copy,
		Check,
		X,
		Download,
		Trash,
		CircleAlert,
		Code,
		FileText,
		Share2,
		Play,
		Pause,
		Image as ImageIcon
	} from "lucide-svelte";
	import type { IconItem } from "$types";

	// State management for interactive tests
	let clickCount = $state(0);
	let lastClickedButton = $state("");
	let copiedStates = $state<Record<string, boolean>>({});

	function handleClick(buttonName: string) {
		clickCount++;
		lastClickedButton = buttonName;
	}

	function handleCopy(id: string) {
		copiedStates[id] = true;
		setTimeout(() => {
			copiedStates[id] = false;
		}, 2000);
	}

	// IconGrid configurations

	// Default variant grid (subtle)
	const defaultIcons: IconItem[] = [
		{
			id: "grid-copy",
			icon: Copy,
			label: "Copy",
			onClick: () => handleClick("grid-copy")
		},
		{
			id: "grid-download",
			icon: Download,
			label: "Download",
			onClick: () => handleClick("grid-download")
		},
		{
			id: "grid-share",
			icon: Share2,
			label: "Share",
			onClick: () => handleClick("grid-share")
		}
	];

	// Mixed variants grid
	const mixedVariants: IconItem[] = [
		{
			id: "grid-subtle",
			icon: Copy,
			label: "Subtle",
			variant: "subtle",
			onClick: () => handleClick("grid-subtle")
		},
		{
			id: "grid-primary",
			icon: Check,
			label: "Primary",
			variant: "primary",
			onClick: () => handleClick("grid-primary")
		},
		{
			id: "grid-destructive",
			icon: Trash,
			label: "Destructive",
			variant: "destructive",
			onClick: () => handleClick("grid-destructive")
		},
		{
			id: "grid-ghost",
			icon: X,
			label: "Ghost",
			variant: "ghost",
			onClick: () => handleClick("grid-ghost")
		}
	];

	// Disabled states grid
	const disabledIcons: IconItem[] = [
		{
			id: "grid-disabled-copy",
			icon: Copy,
			label: "Copy (Disabled)",
			disabled: true
		},
		{
			id: "grid-disabled-download",
			icon: Download,
			label: "Download (Disabled)",
			variant: "primary",
			disabled: true
		},
		{
			id: "grid-disabled-trash",
			icon: Trash,
			label: "Delete (Disabled)",
			variant: "destructive",
			disabled: true
		}
	];

	// Code block icons with copy feedback
	const codeBlockIcons: IconItem[] = [
		{
			id: "code-copy",
			icon: copiedStates["code-copy"] ? Check : Copy,
			label: copiedStates["code-copy"] ? "Copied!" : "Copy code",
			variant: copiedStates["code-copy"] ? "primary" : "default",
			state: copiedStates["code-copy"] ? "success" : "default",
			onClick: () => handleCopy("code-copy")
		},
		{
			id: "code-download",
			icon: Download,
			label: "Download",
			onClick: () => handleClick("code-download")
		},
		{
			id: "code-run",
			icon: Play,
			label: "Run",
			variant: "primary",
			onClick: () => handleClick("code-run")
		}
	];

	// Grid 2-column demo icons (unique IDs)
	const grid2ColIcons: IconItem[] = [
		{
			id: "g2c-copy-1",
			icon: Copy,
			label: "Copy",
			onClick: () => handleClick("g2c-copy-1")
		},
		{
			id: "g2c-download-1",
			icon: Download,
			label: "Download",
			onClick: () => handleClick("g2c-download-1")
		},
		{
			id: "g2c-share-1",
			icon: Share2,
			label: "Share",
			onClick: () => handleClick("g2c-share-1")
		},
		{
			id: "g2c-copy-2",
			icon: Copy,
			label: "Copy",
			onClick: () => handleClick("g2c-copy-2")
		},
		{
			id: "g2c-download-2",
			icon: Download,
			label: "Download",
			onClick: () => handleClick("g2c-download-2")
		},
		{
			id: "g2c-share-2",
			icon: Share2,
			label: "Share",
			onClick: () => handleClick("g2c-share-2")
		}
	];
</script>

<svelte:head>
	<title>IconButton Variants Test Page</title>
</svelte:head>

<div class="container mx-auto p-8">
	<h1 class="mb-8 text-3xl font-bold">IconButton Variants & States Test Page</h1>

	<div class="mb-4 rounded-lg bg-muted p-4">
		<p class="text-sm text-muted-foreground">
			Click Count: <span data-testid="click-count">{clickCount}</span>
		</p>
		<p class="text-sm text-muted-foreground">
			Last Clicked: <span data-testid="last-clicked">{lastClickedButton}</span>
		</p>
	</div>

	<!-- ============================================================================
		 Variants Section
		 ============================================================================ -->

	<section class="mb-12">
		<h2 class="mb-4 text-2xl font-semibold">Variants (Color Schemes)</h2>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
			<!-- Default Variant -->
			<div class="rounded-lg border p-6">
				<h3 class="mb-3 font-medium">Default Variant</h3>
				<p class="mb-4 text-sm text-muted-foreground">Neutral gray styling for general actions</p>
				<div class="flex flex-col gap-4">
					<IconButton
						data-testid="default-button"
						icon={Copy}
						label="Default Copy"
						onClick={() => handleClick("default")}
						variant="default"
					/>
					<code class="text-xs">variant="default"</code>
				</div>
			</div>

			<!-- Primary Variant -->
			<div class="rounded-lg border p-6">
				<h3 class="mb-3 font-medium">Primary Variant</h3>
				<p class="mb-4 text-sm text-muted-foreground">Brand color for primary actions</p>
				<div class="flex flex-col gap-4">
					<IconButton
						data-testid="primary-button"
						icon={Check}
						label="Primary Confirm"
						onClick={() => handleClick("primary")}
						variant="primary"
					/>
					<code class="text-xs">variant="primary"</code>
				</div>
			</div>

			<!-- Destructive Variant -->
			<div class="rounded-lg border p-6">
				<h3 class="mb-3 font-medium">Destructive Variant</h3>
				<p class="mb-4 text-sm text-muted-foreground">Red color for dangerous actions</p>
				<div class="flex flex-col gap-4">
					<IconButton
						data-testid="destructive-button"
						icon={Trash}
						label="Destructive Delete"
						onClick={() => handleClick("destructive")}
						variant="destructive"
					/>
					<code class="text-xs">variant="destructive"</code>
				</div>
			</div>

			<!-- Ghost Variant -->
			<div class="rounded-lg border p-6">
				<h3 class="mb-3 font-medium">Ghost Variant</h3>
				<p class="mb-4 text-sm text-muted-foreground">Transparent, minimal styling</p>
				<div class="flex flex-col gap-4">
					<IconButton
						data-testid="ghost-button"
						icon={X}
						label="Ghost Close"
						onClick={() => handleClick("ghost")}
						variant="ghost"
					/>
					<code class="text-xs">variant="ghost"</code>
				</div>
			</div>
		</div>
	</section>

	<!-- ============================================================================
		 States Section
		 ============================================================================ -->

	<section class="mb-12">
		<h2 class="mb-4 text-2xl font-semibold">States (Dynamic Feedback)</h2>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
			<!-- Default State -->
			<div class="rounded-lg border p-6">
				<h3 class="mb-3 font-medium">Default State</h3>
				<p class="mb-4 text-sm text-muted-foreground">Normal, no feedback</p>
				<div class="flex flex-col gap-4">
					<IconButton
						data-testid="state-default-button"
						icon={Copy}
						label="Default State"
						iconState="default"
					/>
					<code class="text-xs">iconState="default"</code>
				</div>
			</div>

			<!-- Active State -->
			<div class="rounded-lg border p-6">
				<h3 class="mb-3 font-medium">Active State</h3>
				<p class="mb-4 text-sm text-muted-foreground">Currently active/selected</p>
				<div class="flex flex-col gap-4">
					<IconButton
						data-testid="state-active-button"
						icon={Check}
						label="Active State"
						iconState="active"
					/>
					<code class="text-xs">iconState="active"</code>
				</div>
			</div>

			<!-- Success State -->
			<div class="rounded-lg border p-6">
				<h3 class="mb-3 font-medium">Success State</h3>
				<p class="mb-4 text-sm text-muted-foreground">Action completed successfully</p>
				<div class="flex flex-col gap-4">
					<IconButton
						data-testid="state-success-button"
						icon={Check}
						label="Success State"
						iconState="success"
					/>
					<code class="text-xs">iconState="success"</code>
				</div>
			</div>

			<!-- Error State -->
			<div class="rounded-lg border p-6">
				<h3 class="mb-3 font-medium">Error State</h3>
				<p class="mb-4 text-sm text-muted-foreground">Action failed</p>
				<div class="flex flex-col gap-4">
					<IconButton
						data-testid="state-error-button"
						icon={CircleAlert}
						label="Error State"
						iconState="error"
					/>
					<code class="text-xs">iconState="error"</code>
				</div>
			</div>
		</div>
	</section>

	<!-- ============================================================================
		 Combinations Section
		 ============================================================================ -->

	<section class="mb-12">
		<h2 class="mb-4 text-2xl font-semibold">Variant + State Combinations</h2>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			<!-- Primary + Success -->
			<div class="rounded-lg border p-6">
				<h3 class="mb-3 font-medium">Primary + Success</h3>
				<div class="flex flex-col gap-4">
					<IconButton
						data-testid="primary-success-button"
						icon={Check}
						label="Primary Success"
						variant="primary"
						iconState="success"
					/>
					<code class="text-xs">variant="primary"<br />iconState="success"</code>
				</div>
			</div>

			<!-- Destructive + Error -->
			<div class="rounded-lg border p-6">
				<h3 class="mb-3 font-medium">Destructive + Error</h3>
				<div class="flex flex-col gap-4">
					<IconButton
						data-testid="destructive-error-button"
						icon={CircleAlert}
						label="Destructive Error"
						variant="destructive"
						iconState="error"
					/>
					<code class="text-xs">variant="destructive"<br />iconState="error"</code>
				</div>
			</div>

			<!-- Ghost + Active -->
			<div class="rounded-lg border p-6">
				<h3 class="mb-3 font-medium">Ghost + Active</h3>
				<div class="flex flex-col gap-4">
					<IconButton
						data-testid="ghost-active-button"
						icon={Download}
						label="Ghost Active"
						variant="ghost"
						iconState="active"
					/>
					<code class="text-xs">variant="ghost"<br />iconState="active"</code>
				</div>
			</div>
		</div>
	</section>

	<!-- ============================================================================
		 Disabled States Section
		 ============================================================================ -->

	<section class="mb-12">
		<h2 class="mb-4 text-2xl font-semibold">Disabled State</h2>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
			<div class="rounded-lg border p-6">
				<h3 class="mb-3 font-medium">Disabled Default</h3>
				<div class="flex flex-col gap-4">
					<IconButton
						data-testid="disabled-default-button"
						icon={Copy}
						label="Disabled Default"
						disabled
					/>
					<code class="text-xs">disabled=true</code>
				</div>
			</div>

			<div class="rounded-lg border p-6">
				<h3 class="mb-3 font-medium">Disabled Primary</h3>
				<div class="flex flex-col gap-4">
					<IconButton
						data-testid="disabled-primary-button"
						icon={Check}
						label="Disabled Primary"
						variant="primary"
						disabled
					/>
					<code class="text-xs">variant="primary"<br />disabled=true</code>
				</div>
			</div>

			<div class="rounded-lg border p-6">
				<h3 class="mb-3 font-medium">Disabled Destructive</h3>
				<div class="flex flex-col gap-4">
					<IconButton
						data-testid="disabled-destructive-button"
						icon={Trash}
						label="Disabled Destructive"
						variant="destructive"
						disabled
					/>
					<code class="text-xs">variant="destructive"<br />disabled=true</code>
				</div>
			</div>

			<div class="rounded-lg border p-6">
				<h3 class="mb-3 font-medium">Disabled Ghost</h3>
				<div class="flex flex-col gap-4">
					<IconButton
						data-testid="disabled-ghost-button"
						icon={X}
						label="Disabled Ghost"
						variant="ghost"
						disabled
					/>
					<code class="text-xs">variant="ghost"<br />disabled=true</code>
				</div>
			</div>
		</div>
	</section>

	<!-- ============================================================================
		 ICONGRID COMPONENT DEMONSTRATIONS
		 ============================================================================ -->

	<hr class="my-12 border-t-2 border-primary/20" />

	<h1 class="mb-8 text-3xl font-bold">IconGrid Component Variants</h1>

	<!-- ============================================================================
		 Default Variant Grid
		 ============================================================================ -->

	<section class="mb-12">
		<h2 class="mb-4 text-2xl font-semibold">Default Variant Grid (Subtle)</h2>
		<p class="mb-4 text-sm text-muted-foreground">
			Multiple icons using default variant (resolves to "subtle" for better mobile visibility)
		</p>

		<div class="rounded-lg border bg-card p-6">
			<IconGrid icons={defaultIcons} positioning="inline" gap="0.5rem" data-testid="default-grid" />
		</div>
		<code class="mt-2 block text-xs">IconGrid with default variant icons</code>
	</section>

	<!-- ============================================================================
		 Mixed Variants Grid
		 ============================================================================ -->

	<section class="mb-12">
		<h2 class="mb-4 text-2xl font-semibold">Mixed Variants in Grid</h2>
		<p class="mb-4 text-sm text-muted-foreground">
			All variants side by side: subtle, primary, destructive, ghost
		</p>

		<div class="rounded-lg border bg-card p-6">
			<IconGrid icons={mixedVariants} positioning="inline" gap="0.5rem" data-testid="mixed-grid" />
		</div>
		<code class="mt-2 block text-xs">variant="subtle" | "primary" | "destructive" | "ghost"</code>
	</section>

	<!-- ============================================================================
		 Disabled States Grid
		 ============================================================================ -->

	<section class="mb-12">
		<h2 class="mb-4 text-2xl font-semibold">Disabled States in Grid</h2>
		<p class="mb-4 text-sm text-muted-foreground">
			IconGrid with disabled items across different variants - items cannot be clicked or hovered
		</p>

		<div class="rounded-lg border bg-card p-6">
			<IconGrid
				icons={disabledIcons}
				positioning="inline"
				gap="0.5rem"
				data-testid="disabled-grid"
			/>
		</div>
		<code class="mt-2 block text-xs">disabled=true with multiple variants</code>
	</section>

	<!-- ============================================================================
		 Code Block Use Case (Real World)
		 ============================================================================ -->

	<section class="mb-12">
		<h2 class="mb-4 text-2xl font-semibold">Code Block Actions (Real Use Case)</h2>
		<p class="mb-4 text-sm text-muted-foreground">
			Absolute positioning with copy feedback - click copy to see state transition
		</p>

		<div class="rounded-lg border bg-muted p-6">
			<div class="relative rounded bg-zinc-900 p-4">
				<IconGrid
					icons={codeBlockIcons}
					positioning="absolute"
					position={{ top: "0.5rem", right: "0.5rem" }}
					gap="0.25rem"
					data-testid="code-block-grid"
				/>
				<pre class="text-sm text-zinc-100"><code
						>function hello() {`{`}
  console.log("Hello World!");
}</code
					></pre>
			</div>
		</div>
		<code class="mt-2 block text-xs">positioning="absolute" with dynamic state changes</code>
	</section>

	<!-- ============================================================================
		 Mobile Responsiveness Test
		 ============================================================================ -->

	<section class="mb-12">
		<h2 class="mb-4 text-2xl font-semibold">Mobile Visibility Test</h2>
		<p class="mb-4 text-sm text-muted-foreground">
			Narrow container (390px) simulating mobile sidebar - subtle variant should be clearly visible,
			ghost should be minimal
		</p>

		<div class="mx-auto max-w-[390px] rounded-lg border bg-sidebar-accent p-4">
			<div class="mb-3 text-xs font-medium text-muted-foreground">
				Sidebar Header Simulation (390px width)
			</div>
			<IconGrid icons={mixedVariants} positioning="inline" gap="0.5rem" data-testid="mobile-grid" />
		</div>
		<code class="mt-2 block text-xs"
			>Background: sidebar-accent | Subtle should be visible, ghost minimal</code
		>
	</section>

	<!-- ============================================================================
		 Absolute Positioning - All Variants in One Container
		 ============================================================================ -->

	<section class="mb-12">
		<h2 class="mb-4 text-2xl font-semibold">All Positioning Variants (Single Container)</h2>
		<p class="mb-4 text-sm text-muted-foreground">
			Multiple IconGrids in different positions, orientations, and alignments - demonstrates all
			layout capabilities
		</p>

		<div class="relative h-96 rounded-lg border-2 border-dashed border-primary/30 bg-card p-6">
			<!-- Top-Right (Horizontal) - Most common pattern -->
			<IconGrid
				icons={[
					{
						id: "tr-copy",
						icon: Copy,
						label: "Copy",
						onClick: () => handleClick("tr-copy")
					},
					{
						id: "tr-download",
						icon: Download,
						label: "Download",
						onClick: () => handleClick("tr-download")
					},
					{
						id: "tr-share",
						icon: Share2,
						label: "Share",
						onClick: () => handleClick("tr-share")
					}
				]}
				positioning="absolute"
				position={{ top: "0.5rem", right: "0.5rem" }}
				gap="0.25rem"
				data-testid="top-right-grid"
			/>

			<!-- Top-Left (Primary/Destructive actions) -->
			<IconGrid
				icons={[
					{
						id: "tl-check",
						icon: Check,
						label: "Confirm",
						variant: "primary",
						onClick: () => handleClick("tl-check")
					},
					{
						id: "tl-close",
						icon: X,
						label: "Close",
						variant: "destructive",
						onClick: () => handleClick("tl-close")
					}
				]}
				positioning="absolute"
				position={{ top: "0.5rem", left: "0.5rem" }}
				gap="0.25rem"
				data-testid="top-left-grid"
			/>

			<!-- Bottom-Right (Vertical layout) -->
			<div
				class="absolute right-2 bottom-2 flex flex-col gap-2"
				data-testid="bottom-right-vertical"
			>
				<IconGrid
					icons={[
						{
							id: "br-play",
							icon: Play,
							label: "Play",
							variant: "primary",
							onClick: () => handleClick("br-play")
						},
						{
							id: "br-pause",
							icon: Pause,
							label: "Pause",
							onClick: () => handleClick("br-pause")
						},
						{
							id: "br-code",
							icon: Code,
							label: "Code",
							onClick: () => handleClick("br-code")
						}
					]}
					positioning="inline"
					gap="0.5rem"
					columns={1}
				/>
			</div>

			<!-- Bottom-Left (Horizontal with ghost variant) -->
			<IconGrid
				icons={[
					{
						id: "bl-file",
						icon: FileText,
						label: "File",
						variant: "ghost",
						onClick: () => handleClick("bl-file")
					},
					{
						id: "bl-image",
						icon: ImageIcon,
						label: "Image",
						variant: "ghost",
						onClick: () => handleClick("bl-image")
					}
				]}
				positioning="absolute"
				position={{ bottom: "0.5rem", left: "0.5rem" }}
				gap="0.25rem"
				data-testid="bottom-left-grid"
			/>

			<!-- Center (Inline grid with multiple rows) -->
			<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
				<div class="rounded-lg bg-muted p-4 text-center">
					<p class="mb-3 text-xs font-medium text-muted-foreground">Center Content Area</p>
					<IconGrid
						icons={[
							{
								id: "center-copy",
								icon: Copy,
								label: "Copy",
								variant: "subtle",
								onClick: () => handleClick("center-copy")
							},
							{
								id: "center-check",
								icon: Check,
								label: "Check",
								variant: "primary",
								onClick: () => handleClick("center-check")
							},
							{
								id: "center-trash",
								icon: Trash,
								label: "Delete",
								variant: "destructive",
								onClick: () => handleClick("center-trash")
							},
							{
								id: "center-download",
								icon: Download,
								label: "Download",
								onClick: () => handleClick("center-download")
							}
						]}
						positioning="inline"
						gap="0.5rem"
						columns={2}
						alignment="center"
						data-testid="center-grid"
					/>
				</div>
			</div>

			<!-- Position labels -->
			<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
				<div class="text-center">
					<p class="text-sm font-medium text-muted-foreground/50">IconGrid Positioning Showcase</p>
					<p class="text-xs text-muted-foreground/40">
						Top-Left • Top-Right • Bottom-Left • Bottom-Right (Vertical) • Center (2x2)
					</p>
				</div>
			</div>
		</div>

		<code class="mt-2 block text-xs"
			>All positioning variants: absolute (corners) + inline (center) + vertical/horizontal layouts</code
		>
	</section>

	<!-- ============================================================================
		 Layout Orientation Examples
		 ============================================================================ -->

	<section class="mb-12">
		<h2 class="mb-4 text-2xl font-semibold">Layout Orientations</h2>
		<p class="mb-4 text-sm text-muted-foreground">
			Horizontal, vertical, and grid layouts with different column configurations
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<!-- Horizontal (auto columns) -->
			<div class="rounded-lg border bg-card p-4">
				<h3 class="mb-3 text-sm font-medium">Horizontal (Auto)</h3>
				<IconGrid
					icons={defaultIcons}
					positioning="inline"
					gap="0.5rem"
					columns="auto"
					data-testid="horizontal-auto-grid"
				/>
				<code class="mt-2 block text-xs text-muted-foreground">columns="auto"</code>
			</div>

			<!-- Vertical (1 column) -->
			<div class="rounded-lg border bg-card p-4">
				<h3 class="mb-3 text-sm font-medium">Vertical (1 Column)</h3>
				<IconGrid
					icons={defaultIcons}
					positioning="inline"
					gap="0.5rem"
					columns={1}
					data-testid="vertical-grid"
				/>
				<code class="mt-2 block text-xs text-muted-foreground">columns=1</code>
			</div>

			<!-- Grid (2 columns) -->
			<div class="rounded-lg border bg-card p-4">
				<h3 class="mb-3 text-sm font-medium">Grid (2 Columns)</h3>
				<IconGrid
					icons={grid2ColIcons}
					positioning="inline"
					gap="0.5rem"
					columns={2}
					data-testid="grid-2col"
				/>
				<code class="mt-2 block text-xs text-muted-foreground">columns=2</code>
			</div>
		</div>
	</section>
</div>
