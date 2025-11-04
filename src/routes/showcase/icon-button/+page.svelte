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
					orientation="vertical"
					gap="0.5rem"
					columns={1}
					data-testid="vertical-grid"
				/>
				<code class="mt-2 block text-xs text-muted-foreground"
					>orientation="vertical" columns=1</code
				>
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

	<!-- ============================================================================
		 Badge Examples (Icon + Text Strategy)
		 ============================================================================ -->

	<section class="mb-12">
		<h2 class="mb-4 text-2xl font-semibold">Icon + Text Badges</h2>
		<p class="mb-4 text-sm text-muted-foreground">
			Icon buttons with text badges for format/action indicators. Text is auto-truncated to 4
			characters and uppercased for maximum legibility at small sizes.
		</p>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
			<!-- Download Format Badges -->
			<div class="rounded-lg border p-6">
				<h3 class="mb-3 font-medium">Download Format Badges</h3>
				<p class="mb-4 text-sm text-muted-foreground">
					Download actions with format indicators (SVG, PNG, JPG, WEBP)
				</p>
				<div class="flex flex-wrap gap-4">
					<IconButton
						data-testid="badge-svg"
						icon={Download}
						label="Download SVG"
						badge="SVG"
						onClick={() => handleClick("download-svg")}
						variant="default"
					/>
					<IconButton
						data-testid="badge-png"
						icon={Download}
						label="Download PNG"
						badge="PNG"
						onClick={() => handleClick("download-png")}
						variant="default"
					/>
					<IconButton
						data-testid="badge-jpg"
						icon={Download}
						label="Download JPG"
						badge="JPG"
						onClick={() => handleClick("download-jpg")}
						variant="default"
					/>
					<IconButton
						data-testid="badge-webp"
						icon={ImageIcon}
						label="Download WEBP"
						badge="WEBP"
						onClick={() => handleClick("download-webp")}
						variant="default"
					/>
				</div>
				<code class="mt-4 block text-xs">badge="SVG|PNG|JPG|WEBP"</code>
			</div>

			<!-- Copy/Export Format Badges -->
			<div class="rounded-lg border p-6">
				<h3 class="mb-3 font-medium">Copy/Export Format Badges</h3>
				<p class="mb-4 text-sm text-muted-foreground">
					Copy actions with format indicators for clipboard operations
				</p>
				<div class="flex flex-wrap gap-4">
					<IconButton
						data-testid="badge-copy-svg"
						icon={Copy}
						label="Copy SVG"
						badge="SVG"
						onClick={() => handleClick("copy-svg")}
						variant="default"
					/>
					<IconButton
						data-testid="badge-copy-png"
						icon={Copy}
						label="Copy PNG"
						badge="PNG"
						onClick={() => handleClick("copy-png")}
						variant="primary"
					/>
					<IconButton
						data-testid="badge-code"
						icon={Code}
						label="Copy Code"
						badge="CODE"
						onClick={() => handleClick("copy-code")}
						variant="default"
					/>
					<IconButton
						data-testid="badge-text"
						icon={FileText}
						label="Copy Text"
						badge="TXT"
						onClick={() => handleClick("copy-text")}
						variant="default"
					/>
				</div>
				<code class="mt-4 block text-xs">badge="SVG|PNG|CODE|TXT"</code>
			</div>

			<!-- Truncation Demo -->
			<div class="rounded-lg border p-6">
				<h3 class="mb-3 font-medium">Text Truncation Demo</h3>
				<p class="mb-4 text-sm text-muted-foreground">
					Long text is auto-truncated to 4 characters and uppercased
				</p>
				<div class="flex flex-wrap gap-4">
					<IconButton
						data-testid="badge-truncate-download"
						icon={Download}
						label="Download File"
						badge="Download"
						onClick={() => handleClick("truncate-download")}
						variant="default"
					/>
					<IconButton
						data-testid="badge-truncate-export"
						icon={Share2}
						label="Export Data"
						badge="Export"
						onClick={() => handleClick("truncate-export")}
						variant="default"
					/>
					<IconButton
						data-testid="badge-truncate-image"
						icon={ImageIcon}
						label="Image Processing"
						badge="Image"
						onClick={() => handleClick("truncate-image")}
						variant="default"
					/>
					<IconButton
						data-testid="badge-truncate-document"
						icon={FileText}
						label="Document Format"
						badge="Document"
						onClick={() => handleClick("truncate-document")}
						variant="default"
					/>
				</div>
				<code class="mt-4 block text-xs">badge="Download" → "DOWN", badge="Export" → "EXPO"</code>
			</div>

			<!-- Badge with Variants -->
			<div class="rounded-lg border p-6">
				<h3 class="mb-3 font-medium">Badges with Variants</h3>
				<p class="mb-4 text-sm text-muted-foreground">
					Badge works with all variants (default, primary, destructive, ghost)
				</p>
				<div class="flex flex-wrap gap-4">
					<IconButton
						data-testid="badge-variant-default"
						icon={Download}
						label="Default Download"
						badge="SVG"
						onClick={() => handleClick("variant-default")}
						variant="default"
					/>
					<IconButton
						data-testid="badge-variant-primary"
						icon={Copy}
						label="Primary Copy"
						badge="PNG"
						onClick={() => handleClick("variant-primary")}
						variant="primary"
					/>
					<IconButton
						data-testid="badge-variant-destructive"
						icon={Trash}
						label="Destructive Delete"
						badge="DEL"
						onClick={() => handleClick("variant-destructive")}
						variant="destructive"
					/>
					<IconButton
						data-testid="badge-variant-ghost"
						icon={Share2}
						label="Ghost Share"
						badge="SHR"
						onClick={() => handleClick("variant-ghost")}
						variant="ghost"
					/>
				</div>
				<code class="mt-4 block text-xs">variant="default|primary|destructive|ghost"</code>
			</div>
		</div>

		<!-- Badge Grid Layout Demo -->
		<div class="mt-8 rounded-lg border p-6">
			<h3 class="mb-3 font-medium">Badge in IconGrid Layout</h3>
			<p class="mb-4 text-sm text-muted-foreground">
				Badges work seamlessly in IconGrid component for multiple action buttons
			</p>
			<div class="rounded-lg bg-muted p-4">
				<IconGrid
					icons={[
						{
							id: "grid-badge-svg",
							icon: Download,
							label: "Download SVG",
							badge: "SVG",
							onClick: () => handleClick("grid-badge-svg")
						},
						{
							id: "grid-badge-png",
							icon: Download,
							label: "Download PNG",
							badge: "PNG",
							onClick: () => handleClick("grid-badge-png")
						},
						{
							id: "grid-badge-jpg",
							icon: Download,
							label: "Download JPG",
							badge: "JPG",
							onClick: () => handleClick("grid-badge-jpg")
						},
						{
							id: "grid-badge-copy",
							icon: Copy,
							label: "Copy SVG",
							badge: "SVG",
							variant: "primary",
							onClick: () => handleClick("grid-badge-copy")
						}
					]}
					positioning="inline"
					gap="0.5rem"
					data-testid="badge-grid"
				/>
			</div>
			<code class="mt-4 block text-xs">IconGrid with badge prop on IconItems</code>
		</div>

		<!-- Badge Positioning Matrix Demo -->
		<div class="mt-8 rounded-lg border p-6">
			<h3 class="mb-3 font-medium">Badge Positioning Matrix (9 Positions)</h3>
			<p class="mb-4 text-sm text-muted-foreground">
				Badge supports 9 position combinations: 3 vertical (top/center/bottom) × 3 horizontal
				(left/center/right). Background has 90% opacity for transparency.
			</p>

			<div class="grid grid-cols-3 gap-8">
				<!-- Top-Left -->
				<div class="flex flex-col items-center gap-2 rounded-lg bg-muted p-4">
					<IconButton
						data-testid="badge-position-top-left"
						icon={Download}
						label="Top-Left Position"
						badge="TL"
						badgeVerticalPosition="top"
						badgeHorizontalPosition="left"
						onClick={() => handleClick("position-top-left")}
						variant="default"
					/>
					<code class="text-xs">top + left</code>
				</div>

				<!-- Top-Center -->
				<div class="flex flex-col items-center gap-2 rounded-lg bg-muted p-4">
					<IconButton
						data-testid="badge-position-top-center"
						icon={Download}
						label="Top-Center Position"
						badge="TC"
						badgeVerticalPosition="top"
						badgeHorizontalPosition="center"
						onClick={() => handleClick("position-top-center")}
						variant="default"
					/>
					<code class="text-xs">top + center</code>
				</div>

				<!-- Top-Right -->
				<div class="flex flex-col items-center gap-2 rounded-lg bg-muted p-4">
					<IconButton
						data-testid="badge-position-top-right"
						icon={Download}
						label="Top-Right Position"
						badge="TR"
						badgeVerticalPosition="top"
						badgeHorizontalPosition="right"
						onClick={() => handleClick("position-top-right")}
						variant="default"
					/>
					<code class="text-xs">top + right</code>
				</div>

				<!-- Center-Left -->
				<div class="flex flex-col items-center gap-2 rounded-lg bg-muted p-4">
					<IconButton
						data-testid="badge-position-center-left"
						icon={Download}
						label="Center-Left Position"
						badge="CL"
						badgeVerticalPosition="center"
						badgeHorizontalPosition="left"
						onClick={() => handleClick("position-center-left")}
						variant="default"
					/>
					<code class="text-xs">center + left</code>
				</div>

				<!-- Center-Center -->
				<div class="flex flex-col items-center gap-2 rounded-lg bg-muted p-4">
					<IconButton
						data-testid="badge-position-center-center"
						icon={Download}
						label="Center-Center Position"
						badge="CC"
						badgeVerticalPosition="center"
						badgeHorizontalPosition="center"
						onClick={() => handleClick("position-center-center")}
						variant="primary"
					/>
					<code class="text-xs">center + center</code>
				</div>

				<!-- Center-Right -->
				<div class="flex flex-col items-center gap-2 rounded-lg bg-muted p-4">
					<IconButton
						data-testid="badge-position-center-right"
						icon={Download}
						label="Center-Right Position"
						badge="CR"
						badgeVerticalPosition="center"
						badgeHorizontalPosition="right"
						onClick={() => handleClick("position-center-right")}
						variant="default"
					/>
					<code class="text-xs">center + right</code>
				</div>

				<!-- Bottom-Left -->
				<div class="flex flex-col items-center gap-2 rounded-lg bg-muted p-4">
					<IconButton
						data-testid="badge-position-bottom-left"
						icon={Download}
						label="Bottom-Left Position"
						badge="BL"
						badgeVerticalPosition="bottom"
						badgeHorizontalPosition="left"
						onClick={() => handleClick("position-bottom-left")}
						variant="default"
					/>
					<code class="text-xs">bottom + left</code>
				</div>

				<!-- Bottom-Center -->
				<div class="flex flex-col items-center gap-2 rounded-lg bg-muted p-4">
					<IconButton
						data-testid="badge-position-bottom-center"
						icon={Download}
						label="Bottom-Center Position"
						badge="BC"
						badgeVerticalPosition="bottom"
						badgeHorizontalPosition="center"
						onClick={() => handleClick("position-bottom-center")}
						variant="default"
					/>
					<code class="text-xs">bottom + center</code>
				</div>

				<!-- Bottom-Right (Default) -->
				<div class="flex flex-col items-center gap-2 rounded-lg bg-muted p-4">
					<IconButton
						data-testid="badge-position-bottom-right"
						icon={Download}
						label="Bottom-Right Position (Default)"
						badge="BR"
						badgeVerticalPosition="bottom"
						badgeHorizontalPosition="right"
						onClick={() => handleClick("position-bottom-right")}
						variant="default"
					/>
					<code class="text-xs">bottom + right (default)</code>
				</div>
			</div>

			<code class="mt-4 block text-xs"
				>badgeVerticalPosition="top|center|bottom" badgeHorizontalPosition="left|center|right"</code
			>
		</div>

		<!-- Badge Opacity Control Demo -->
		<div class="mt-8 rounded-lg border p-6">
			<h3 class="mb-3 font-medium">Badge Background Opacity Control</h3>
			<p class="mb-4 text-sm text-muted-foreground">
				Control badge transparency to see icon through text. Default is 0.2 (20% opaque, 80%
				transparent).
			</p>

			<div class="grid grid-cols-2 gap-8 md:grid-cols-4">
				<!-- Default Opacity (0.2) -->
				<div class="flex flex-col items-center gap-2 rounded-lg bg-card p-4">
					<IconButton
						data-testid="badge-opacity-default"
						icon={Download}
						label="Default Opacity (0.2)"
						badge="SVG"
						onClick={() => handleClick("opacity-default")}
						variant="default"
					/>
					<code class="text-xs">default (0.2)</code>
					<p class="text-center text-xs text-muted-foreground">Mostly transparent</p>
				</div>

				<!-- Fully Transparent (0.0) -->
				<div class="flex flex-col items-center gap-2 rounded-lg bg-card p-4">
					<IconButton
						data-testid="badge-opacity-zero"
						icon={Download}
						label="Fully Transparent (0.0)"
						badge="PNG"
						badgeBackgroundOpacity={0.0}
						onClick={() => handleClick("opacity-zero")}
						variant="default"
					/>
					<code class="text-xs">opacity={0.0}</code>
					<p class="text-center text-xs text-muted-foreground">No background</p>
				</div>

				<!-- Boolean Opaque -->
				<div class="flex flex-col items-center gap-2 rounded-lg bg-card p-4">
					<IconButton
						data-testid="badge-opaque-true"
						icon={Download}
						label="Opaque Badge"
						badge="JPG"
						badgeOpaque={true}
						onClick={() => handleClick("opaque-true")}
						variant="default"
					/>
					<code class="text-xs">opaque={true}</code>
					<p class="text-center text-xs text-muted-foreground">Solid background (0.9)</p>
				</div>

				<!-- Custom Opacity (0.5) -->
				<div class="flex flex-col items-center gap-2 rounded-lg bg-card p-4">
					<IconButton
						data-testid="badge-opacity-half"
						icon={Download}
						label="Semi-transparent (0.5)"
						badge="WEBP"
						badgeBackgroundOpacity={0.5}
						onClick={() => handleClick("opacity-half")}
						variant="default"
					/>
					<code class="text-xs">opacity={0.5}</code>
					<p class="text-center text-xs text-muted-foreground">Half transparent</p>
				</div>
			</div>

			<code class="mt-4 block text-xs"
				>badgeOpaque={"{true|false}"} or badgeBackgroundOpacity={"{0.0-1.0}"}</code
			>
		</div>

		<!-- Ghost Variant Contrast Test -->
		<div class="mt-8 rounded-lg border p-6">
			<h3 class="mb-3 font-medium">Ghost Variant Contrast Test</h3>
			<p class="mb-4 text-sm text-muted-foreground">
				Ghost variant buttons have transparent backgrounds, making contrast critical. Test the same
				button on different background colors.
			</p>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				<!-- White/Card Background (Best Contrast) -->
				<div>
					<h4 class="mb-2 text-sm font-medium">Card Background (Best)</h4>
					<div class="flex flex-wrap gap-4 rounded-lg bg-card p-4">
						<IconButton
							data-testid="ghost-contrast-card-1"
							icon={Download}
							label="Ghost on Card"
							badge="SVG"
							onClick={() => handleClick("ghost-card")}
							variant="ghost"
						/>
						<IconButton
							data-testid="ghost-contrast-card-2"
							icon={Copy}
							label="Ghost on Card"
							badge="PNG"
							onClick={() => handleClick("ghost-card-2")}
							variant="ghost"
						/>
					</div>
					<code class="mt-2 block text-xs">bg-card - High contrast</code>
				</div>

				<!-- Muted Background (Low Contrast) -->
				<div>
					<h4 class="mb-2 text-sm font-medium">Muted Background (Low)</h4>
					<div class="flex flex-wrap gap-4 rounded-lg bg-muted p-4">
						<IconButton
							data-testid="ghost-contrast-muted-1"
							icon={Download}
							label="Ghost on Muted"
							badge="SVG"
							onClick={() => handleClick("ghost-muted")}
							variant="ghost"
						/>
						<IconButton
							data-testid="ghost-contrast-muted-2"
							icon={Copy}
							label="Ghost on Muted"
							badge="PNG"
							onClick={() => handleClick("ghost-muted-2")}
							variant="ghost"
						/>
					</div>
					<code class="mt-2 block text-xs">bg-muted - Low contrast ⚠️</code>
				</div>

				<!-- Primary Tinted Background -->
				<div>
					<h4 class="mb-2 text-sm font-medium">Primary Tinted</h4>
					<div class="flex flex-wrap gap-4 rounded-lg bg-primary/10 p-4">
						<IconButton
							data-testid="ghost-contrast-primary-1"
							icon={Download}
							label="Ghost on Primary"
							badge="SVG"
							onClick={() => handleClick("ghost-primary")}
							variant="ghost"
						/>
						<IconButton
							data-testid="ghost-contrast-primary-2"
							icon={Copy}
							label="Ghost on Primary"
							badge="PNG"
							onClick={() => handleClick("ghost-primary-2")}
							variant="ghost"
						/>
					</div>
					<code class="mt-2 block text-xs">bg-primary/10 - Subtle color</code>
				</div>
			</div>

			<p class="mt-4 text-xs text-muted-foreground">
				💡 Tip: Ghost variant works best on card/white backgrounds. Consider using "default" or
				"subtle" variants on muted backgrounds for better visibility.
			</p>
		</div>
	</section>

	<!-- Badge Behind Icon (20% Overlap) - Mobile-Optimized UX -->
	<section class="mt-8 rounded-lg border bg-card p-6">
		<div>
			<div class="mb-4 flex items-center gap-2">
				<h2 class="text-2xl font-semibold">Badge Behind Icon (20% Overlap)</h2>
				<span
					class="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
					data-testid="badge-behind-mobile-badge">Mobile-Optimized</span
				>
			</div>

			<p class="text-sm text-muted-foreground">
				<strong>Problem:</strong> Mobile devices don't have hover/tooltips, making it hard to
				communicate icon actions.
				<br />
				<strong>Solution:</strong> Badge rendered
				<em>behind</em> icon (z-index inverted) with reduced overlap (20% vs 64%). Icon fully visible,
				badge provides context without obstruction.
			</p>

			<!-- Comparison: Overlay vs Behind -->
			<div class="mt-6">
				<h3 class="mb-3 text-lg font-medium">Comparison: Overlay vs Behind (Both 20% Overlap)</h3>
				<div class="grid gap-6 sm:grid-cols-2">
					<!-- Overlay Mode (Current/Default) -->
					<div class="rounded-lg border bg-card p-4">
						<h4 class="mb-2 text-sm font-medium text-muted-foreground">Overlay Mode (Default)</h4>
						<p class="mb-3 text-xs text-muted-foreground">
							Badge on top of icon, 20% overlap, opacity 0.2
						</p>
						<div class="flex gap-3">
							<IconButton
								data-testid="badge-overlay-svg"
								icon={Download}
								label="Download SVG (Overlay)"
								badge="SVG"
								badgeLayer="overlay"
								onClick={() => handleClick("overlay-svg")}
								size={24}
							/>
							<IconButton
								data-testid="badge-overlay-png"
								icon={Download}
								label="Download PNG (Overlay)"
								badge="PNG"
								badgeLayer="overlay"
								onClick={() => handleClick("overlay-png")}
								size={24}
							/>
							<IconButton
								data-testid="badge-overlay-jpg"
								icon={Copy}
								label="Copy JPEG (Overlay)"
								badge="JPG"
								badgeLayer="overlay"
								onClick={() => handleClick("overlay-jpg")}
								size={24}
							/>
						</div>
						<p class="mt-2 text-xs text-muted-foreground">
							✅ Good: Badge prominent
							<br />
							⚠️ Overlay: Badge blocks part of icon (low opacity helps)
						</p>
					</div>

					<!-- Behind Mode (Mobile-Optimized) -->
					<div class="rounded-lg border bg-primary/5 p-4">
						<h4 class="mb-2 text-sm font-medium text-primary">Behind Mode (Mobile-Optimized)</h4>
						<p class="mb-3 text-xs text-muted-foreground">
							Badge behind icon, 20% overlap, opacity 0.6
						</p>
						<div class="flex gap-3">
							<IconButton
								data-testid="badge-behind-svg"
								icon={Download}
								label="Download SVG (Behind)"
								badge="SVG"
								badgeLayer="behind"
								onClick={() => handleClick("behind-svg")}
								size={24}
							/>
							<IconButton
								data-testid="badge-behind-png"
								icon={Download}
								label="Download PNG (Behind)"
								badge="PNG"
								badgeLayer="behind"
								onClick={() => handleClick("behind-png")}
								size={24}
							/>
							<IconButton
								data-testid="badge-behind-jpg"
								icon={Copy}
								label="Copy JPEG (Behind)"
								badge="JPG"
								badgeLayer="behind"
								onClick={() => handleClick("behind-jpg")}
								size={24}
							/>
						</div>
						<p class="mt-2 text-xs text-primary">
							✅ Icon fully visible (80% unobstructed)
							<br />
							✅ Badge provides context without blocking icon
							<br />
							✅ Better mobile UX (no tooltips needed)
						</p>
					</div>
				</div>
			</div>

			<!-- Configurable Overlap (10% vs 20%) + Positions (Top vs Bottom) -->
			<div class="mt-6">
				<h3 class="mb-3 text-lg font-medium">Configurable Overlap & Position</h3>
				<p class="mb-4 text-sm text-muted-foreground">
					Control overlap percentage via <code class="rounded bg-muted px-1 py-0.5 text-xs"
						>badgeOffset</code
					>
					and position via
					<code class="rounded bg-muted px-1 py-0.5 text-xs">badgeVerticalPosition</code>.
				</p>

				<div class="grid gap-6 sm:grid-cols-2">
					<!-- 10% Overlap (Minimal) -->
					<div class="rounded-lg border p-4">
						<h4 class="mb-2 text-sm font-medium">10% Overlap (offset="14px")</h4>
						<p class="mb-3 text-xs text-muted-foreground">
							Minimal obstruction - maximum icon visibility
						</p>

						<div class="space-y-3">
							<!-- Top Position -->
							<div>
								<p class="mb-1 text-xs font-medium text-muted-foreground">Badge Top</p>
								<div class="flex gap-2">
									<IconButton
										data-testid="badge-10-top-svg"
										icon={Download}
										label="Download SVG (10% Top)"
										badge="SVG"
										badgeLayer="behind"
										badgeOffset="14px"
										badgeVerticalPosition="top"
										onClick={() => handleClick("10-top-svg")}
										size={24}
									/>
									<IconButton
										data-testid="badge-10-top-png"
										icon={Copy}
										label="Copy PNG (10% Top)"
										badge="PNG"
										badgeLayer="behind"
										badgeOffset="14px"
										badgeVerticalPosition="top"
										onClick={() => handleClick("10-top-png")}
										size={24}
									/>
								</div>
							</div>

							<!-- Bottom Position -->
							<div>
								<p class="mb-1 text-xs font-medium text-muted-foreground">Badge Bottom</p>
								<div class="flex gap-2">
									<IconButton
										data-testid="badge-10-bottom-svg"
										icon={Download}
										label="Download SVG (10% Bottom)"
										badge="SVG"
										badgeLayer="behind"
										badgeOffset="14px"
										badgeVerticalPosition="bottom"
										onClick={() => handleClick("10-bottom-svg")}
										size={24}
									/>
									<IconButton
										data-testid="badge-10-bottom-png"
										icon={Copy}
										label="Copy PNG (10% Bottom)"
										badge="PNG"
										badgeLayer="behind"
										badgeOffset="14px"
										badgeVerticalPosition="bottom"
										onClick={() => handleClick("10-bottom-png")}
										size={24}
									/>
								</div>
							</div>
						</div>
					</div>

					<!-- 20% Overlap (Default) -->
					<div class="rounded-lg border bg-primary/5 p-4">
						<h4 class="mb-2 text-sm font-medium text-primary">
							20% Overlap (offset="10px" - Default)
						</h4>
						<p class="mb-3 text-xs text-muted-foreground">Balanced visibility and context</p>

						<div class="space-y-3">
							<!-- Top Position -->
							<div>
								<p class="mb-1 text-xs font-medium text-muted-foreground">Badge Top</p>
								<div class="flex gap-2">
									<IconButton
										data-testid="badge-20-top-json"
										icon={Copy}
										label="Copy JSON (20% Top)"
										badge="JSON"
										badgeLayer="behind"
										badgeVerticalPosition="top"
										onClick={() => handleClick("20-top-json")}
										size={24}
									/>
									<IconButton
										data-testid="badge-20-top-yaml"
										icon={Copy}
										label="Copy YAML (20% Top)"
										badge="YAML"
										badgeLayer="behind"
										badgeVerticalPosition="top"
										onClick={() => handleClick("20-top-yaml")}
										size={24}
									/>
								</div>
							</div>

							<!-- Bottom Position -->
							<div>
								<p class="mb-1 text-xs font-medium text-muted-foreground">Badge Bottom</p>
								<div class="flex gap-2">
									<IconButton
										data-testid="badge-20-bottom-xml"
										icon={Copy}
										label="Copy XML (20% Bottom)"
										badge="XML"
										badgeLayer="behind"
										badgeVerticalPosition="bottom"
										onClick={() => handleClick("20-bottom-xml")}
										size={24}
									/>
									<IconButton
										data-testid="badge-20-bottom-csv"
										icon={Copy}
										label="Copy CSV (20% Bottom)"
										badge="CSV"
										badgeLayer="behind"
										badgeVerticalPosition="bottom"
										onClick={() => handleClick("20-bottom-csv")}
										size={24}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="mt-4 rounded-lg bg-muted/50 p-3">
					<p class="text-xs text-muted-foreground">
						<strong>💡 Recommendation:</strong> Use 10% overlap (14px offset) when icon clarity is critical
						(download buttons). Use 20% overlap (10px offset - default) for balanced visibility and context.
					</p>
				</div>
			</div>

			<!-- Use Cases for Behind Mode -->
			<div class="mt-6">
				<h3 class="mb-3 text-lg font-medium">Use Cases: When to Use Behind Mode</h3>
				<div class="grid gap-4 sm:grid-cols-2">
					<!-- Download Multiple Formats -->
					<div class="rounded-lg border p-4">
						<h4 class="mb-2 text-sm font-medium">Download Multiple Formats</h4>
						<p class="mb-3 text-xs text-muted-foreground">
							User needs to know format before tapping (mobile)
						</p>
						<div class="flex gap-2">
							<IconButton
								data-testid="download-svg-behind"
								icon={Download}
								label="Download SVG"
								badge="SVG"
								badgeLayer="behind"
								variant="primary"
								onClick={() => handleClick("dl-svg")}
							/>
							<IconButton
								data-testid="download-png-behind"
								icon={Download}
								label="Download PNG"
								badge="PNG"
								badgeLayer="behind"
								variant="primary"
								onClick={() => handleClick("dl-png")}
							/>
							<IconButton
								data-testid="download-jpg-behind"
								icon={Download}
								label="Download JPEG"
								badge="JPEG"
								badgeLayer="behind"
								variant="primary"
								onClick={() => handleClick("dl-jpg")}
							/>
						</div>
					</div>

					<!-- Copy Code Formats -->
					<div class="rounded-lg border p-4">
						<h4 class="mb-2 text-sm font-medium">Copy Code/Data Formats</h4>
						<p class="mb-3 text-xs text-muted-foreground">Indicate clipboard format clearly</p>
						<div class="flex gap-2">
							<IconButton
								data-testid="copy-json-behind"
								icon={Copy}
								label="Copy as JSON"
								badge="JSON"
								badgeLayer="behind"
								onClick={() => handleClick("copy-json")}
							/>
							<IconButton
								data-testid="copy-yaml-behind"
								icon={Copy}
								label="Copy as YAML"
								badge="YAML"
								badgeLayer="behind"
								onClick={() => handleClick("copy-yaml")}
							/>
							<IconButton
								data-testid="copy-xml-behind"
								icon={Copy}
								label="Copy as XML"
								badge="XML"
								badgeLayer="behind"
								onClick={() => handleClick("copy-xml")}
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Technical Details -->
			<div class="mt-6 rounded-lg bg-muted/50 p-4">
				<h3 class="mb-2 text-sm font-medium">Technical Implementation</h3>
				<ul class="space-y-1 text-xs text-muted-foreground">
					<li>
						<strong>Overlay Mode:</strong> Badge z-index: 1, Icon z-index: 0
					</li>
					<li>
						<strong>Behind Mode:</strong> Badge z-index: 0, Icon z-index: 1
					</li>
					<li>
						<strong>Opacity:</strong> Behind mode uses 0.6 (60%) vs Overlay 0.2 (20%) for better visibility
					</li>
					<li>
						<strong>Overlap Control:</strong> badgeOffset="10px" (20% default), "14px" (10% minimal),
						"2px" (64% legacy)
					</li>
					<li>
						<strong>Position Control:</strong> badgeVerticalPosition="top" | "bottom" (default), badgeHorizontalPosition="left"
						| "right" (default)
					</li>
					<li>
						<strong>Configuration:</strong> SETTINGS.ui.iconGrid.badge (layer, offset, opacity, position)
					</li>
					<li>
						<strong>Backward Compatible:</strong> All defaults preserve current behavior (zero breaking
						changes)
					</li>
				</ul>
			</div>

			<!-- UX Research -->
			<div class="mt-4 rounded-lg border-l-4 border-primary bg-primary/5 p-4">
				<p class="text-xs text-muted-foreground">
					<strong>📚 UX Research (Nielsen Norman Group):</strong> "Always use text labels with icons.
					Tooltips are NOT a substitute for visible labels on mobile devices without hover interactions."
					Behind mode provides visible context labels without requiring tooltips.
				</p>
			</div>
		</div>
	</section>
</div>
