<script lang="ts">
	/**
	 * MermaidDiagram Showcase (Task 8G)
	 *
	 * Comprehensive demonstration of MermaidDiagram component with:
	 * - 8 diagram types (flowchart, sequence, class, state, ER, gitGraph, etc.)
	 * - GitHub-style zoom controls (50%-200% range)
	 * - Dialog expansion demonstration
	 * - IconGrid integration for action buttons
	 * - Mobile responsiveness testing
	 * - Validation integration demonstration
	 */
	import MermaidDiagram from "$lib/components/shared/MermaidDiagram.svelte";
	import { SETTINGS } from "$config/settings";
	import { IsMobile } from "$lib/hooks/is-mobile.svelte";
	import {
		DIAGRAM_EXAMPLES,
		getDiagramTypes,
		getDiagramsByType
	} from "$data/showcase/mermaid-diagram-examples";

	let showTechnicalDetails = $state(false);
	let selectedType = $state<string>("all");

	// Interactive button controls state
	const isMobile = new IsMobile(); // < 768px
	let useResponsiveDefaults = $state(true);

	// Manual override controls (only active when useResponsiveDefaults = false)
	let manualCopySvg = $state(true);
	let manualCopyPng = $state(true);
	let manualCopyCode = $state(true);
	let manualDownloadSvg = $state(true);
	let manualDownloadPng = $state(true);
	let manualDownloadJpg = $state(true);
	let manualExpand = $state(true);
	let manualZoomControls = $state(true);

	// Derived: final button visibility (SETTINGS defaults or manual overrides)
	const buttonDefaults = $derived(
		isMobile.current ? SETTINGS.ui.mermaid.buttons.mobile : SETTINGS.ui.mermaid.buttons.desktop
	);

	const finalShowCopySvg = $derived(
		useResponsiveDefaults ? buttonDefaults.showCopySvgButton : manualCopySvg
	);
	const finalShowCopyPng = $derived(
		useResponsiveDefaults ? buttonDefaults.showCopyPngButton : manualCopyPng
	);
	const finalShowCopyCode = $derived(
		useResponsiveDefaults ? buttonDefaults.showCopyCodeButton : manualCopyCode
	);
	const finalShowDownloadSvg = $derived(
		useResponsiveDefaults ? buttonDefaults.showDownloadButton : manualDownloadSvg
	);
	const finalShowDownloadPng = $derived(
		useResponsiveDefaults ? buttonDefaults.showDownloadPngButton : manualDownloadPng
	);
	const finalShowDownloadJpg = $derived(
		useResponsiveDefaults ? buttonDefaults.showDownloadJpgButton : manualDownloadJpg
	);
	const finalShowExpand = $derived(
		useResponsiveDefaults ? buttonDefaults.showExpandButton : manualExpand
	);
	const finalShowZoomControls = $derived(
		useResponsiveDefaults ? buttonDefaults.showZoomControls : manualZoomControls
	);

	// Derived: active buttons count
	const activeButtonsCount = $derived(
		[
			finalShowCopySvg,
			finalShowCopyPng,
			finalShowCopyCode,
			finalShowDownloadSvg,
			finalShowDownloadPng,
			finalShowDownloadJpg,
			finalShowExpand,
			finalShowZoomControls
		].filter(Boolean).length
	);

	const diagramTypes = getDiagramTypes();

	const filteredExamples = $derived(
		selectedType === "all" ? DIAGRAM_EXAMPLES : getDiagramsByType(selectedType)
	);
</script>

<svelte:head>
	<title>MermaidDiagram Showcase - Task 8G</title>
</svelte:head>

<div class="showcase-container">
	<header class="showcase-header">
		<h1>MermaidDiagram Component Showcase</h1>
		<p class="subtitle">Task 8G - GitHub-Style Zoom Controls & Dialog Integration</p>

		<div class="info-box">
			<h3>GitHub-Style Zoom Controls</h3>
			<p>
				<strong>Zoom Range:</strong>
				{SETTINGS.ui.mermaid.zoom.minLevel}% - {SETTINGS.ui.mermaid.zoom.maxLevel}% (step: {SETTINGS
					.ui.mermaid.zoom.step}%)
			</p>
			<p class="text-muted">
				<strong>Features:</strong> Zoom In/Out, Reset, Expand to Dialog, Download SVG
			</p>
		</div>
	</header>

	<!-- Filter by Type -->
	<section class="filter-section">
		<h2>Diagram Types ({diagramTypes.length} types)</h2>
		<div class="filter-buttons">
			<button
				class="filter-button"
				class:active={selectedType === "all"}
				onclick={() => (selectedType = "all")}
			>
				All ({DIAGRAM_EXAMPLES.length})
			</button>
			{#each diagramTypes as type (type)}
				<button
					class="filter-button"
					class:active={selectedType === type}
					onclick={() => (selectedType = type)}
				>
					{type} ({getDiagramsByType(type).length})
				</button>
			{/each}
		</div>
	</section>

	<!-- Interactive Button Controls -->
	<section class="controls-section">
		<div class="controls-header">
			<h2>Interactive Button Controls</h2>
			<div class="mode-badge" class:mobile={isMobile.current} class:desktop={!isMobile.current}>
				{isMobile.current ? "📱 Mobile Mode (< 768px)" : "🖥️ Desktop Mode (≥ 768px)"}
			</div>
		</div>

		<div class="controls-stats">
			<span class="stat-item">Active Buttons: <strong>{activeButtonsCount}/8</strong></span>
			<label class="toggle-defaults">
				<input type="checkbox" bind:checked={useResponsiveDefaults} />
				Use SETTINGS Defaults (Auto-Responsive)
			</label>
		</div>

		{#if !useResponsiveDefaults}
			<div class="controls-grid">
				<!-- Copy Actions Group -->
				<div class="control-group">
					<h3>📋 Copy Actions</h3>
					<label><input type="checkbox" bind:checked={manualCopySvg} /> Copy SVG</label>
					<label><input type="checkbox" bind:checked={manualCopyPng} /> Copy PNG</label>
					<label><input type="checkbox" bind:checked={manualCopyCode} /> Copy Code</label>
				</div>

				<!-- Download Actions Group -->
				<div class="control-group">
					<h3>⬇️ Download Actions</h3>
					<label><input type="checkbox" bind:checked={manualDownloadSvg} /> Download SVG</label>
					<label><input type="checkbox" bind:checked={manualDownloadPng} /> Download PNG</label>
					<label><input type="checkbox" bind:checked={manualDownloadJpg} /> Download JPG</label>
				</div>

				<!-- Navigation Group -->
				<div class="control-group">
					<h3>🧭 Navigation</h3>
					<label><input type="checkbox" bind:checked={manualExpand} /> Expand to Dialog</label>
					<label
						><input type="checkbox" bind:checked={manualZoomControls} /> Zoom/Pan Controls</label
					>
				</div>
			</div>
		{:else}
			<div class="settings-display">
				<p class="info-text">
					Using automatic responsive defaults from SETTINGS. Toggle off to customize manually.
				</p>
				<div class="defaults-preview">
					<div class="viewport-config">
						<strong>Mobile (&lt; 768px):</strong>
						<span class="active-list">Copy SVG, Copy PNG, Copy Code</span>
					</div>
					<div class="viewport-config">
						<strong>Desktop (≥ 768px):</strong>
						<span class="active-list">All buttons enabled</span>
					</div>
				</div>
			</div>
		{/if}
	</section>

	<!-- Main Examples -->
	<section class="examples-section">
		<h2>
			{#if selectedType === "all"}
				All Diagrams ({filteredExamples.length})
			{:else}
				{selectedType} Diagrams ({filteredExamples.length})
			{/if}
		</h2>

		{#each filteredExamples as example, index (example.id)}
			<div class="example-card">
				<div class="example-header">
					<span class="example-number">#{index + 1}</span>
					<span class="diagram-badge">{example.type}</span>
					<span class="diagram-title">{example.title}</span>
				</div>

				<p class="diagram-description">{example.description}</p>

				<MermaidDiagram
					diagram={example.diagram}
					title={example.title}
					showCopySvgButton={useResponsiveDefaults ? undefined : manualCopySvg}
					showCopyPngButton={useResponsiveDefaults ? undefined : manualCopyPng}
					showCopyCodeButton={useResponsiveDefaults ? undefined : manualCopyCode}
					showDownloadButton={useResponsiveDefaults ? undefined : manualDownloadSvg}
					showDownloadPngButton={useResponsiveDefaults ? undefined : manualDownloadPng}
					showDownloadJpgButton={useResponsiveDefaults ? undefined : manualDownloadJpg}
					showExpandButton={useResponsiveDefaults ? undefined : manualExpand}
					showZoomControls={useResponsiveDefaults ? undefined : manualZoomControls}
					actionGridOrientation="vertical"
				/>
			</div>
		{/each}
	</section>

	<!-- Technical Details -->
	<section class="tech-details">
		<div class="section-header">
			<h2>Technical Details</h2>
			<button class="toggle-button" onclick={() => (showTechnicalDetails = !showTechnicalDetails)}>
				{showTechnicalDetails ? "Hide" : "Show"} Details
			</button>
		</div>

		{#if showTechnicalDetails}
			<div class="details-grid">
				<div class="detail-card">
					<h3>🎯 Zoom Controls</h3>
					<ul>
						<li>
							Range: {SETTINGS.ui.mermaid.zoom.minLevel}% - {SETTINGS.ui.mermaid.zoom.maxLevel}%
						</li>
						<li>Step: {SETTINGS.ui.mermaid.zoom.step}%</li>
						<li>Default: {SETTINGS.ui.mermaid.zoom.defaultLevel}%</li>
						<li>Mouse Wheel: {SETTINGS.ui.mermaid.zoom.enableMouseWheel ? "✅" : "❌"}</li>
						<li>Pinch Gestures: {SETTINGS.ui.mermaid.zoom.enablePinchGestures ? "✅" : "❌"}</li>
					</ul>
				</div>

				<div class="detail-card">
					<h3>⚙️ Features</h3>
					<ul>
						<li>✅ Mermaid rendering (10+ diagram types)</li>
						<li>✅ GitHub-style zoom controls (IconGrid)</li>
						<li>✅ Dialog expansion (full-screen)</li>
						<li>✅ Download as SVG</li>
						<li>✅ Loading skeleton animation</li>
						<li>✅ Error handling with debug mode</li>
						<li>✅ Mobile responsive (touch targets ≥44px)</li>
					</ul>
				</div>

				<div class="detail-card">
					<h3>🎨 Action Buttons</h3>
					<ul>
						<li>Orientation: {SETTINGS.ui.mermaid.actionButtons.defaultOrientation}</li>
						<li>Gap: {SETTINGS.ui.mermaid.actionButtons.gap}</li>
						<li>Icon Size: {SETTINGS.ui.mermaid.actionButtons.iconSize}</li>
						<li>Dialog Alignment: {SETTINGS.ui.mermaid.actionButtons.dialog.alignment}</li>
					</ul>
				</div>

				<div class="detail-card">
					<h3>🧪 Integration</h3>
					<ul>
						<li>IconGrid (Task 8D)</li>
						<li>Dialog (Task 8E)</li>
						<li>SETTINGS configuration</li>
						<li>Type-safe props ($types)</li>
						<li>Modular CSS (components.css)</li>
						<li>Svelte 5 runes ($state, $derived)</li>
					</ul>
				</div>

				<div class="detail-card">
					<h3>📋 Diagram Types</h3>
					<ul>
						{#each diagramTypes as type (type)}
							<li>{type}: {getDiagramsByType(type).length} examples</li>
						{/each}
					</ul>
				</div>

				<div class="detail-card">
					<h3>🔍 Debug Mode</h3>
					<ul>
						<li>Global: {SETTINGS.ui.mermaid.debug ? "Enabled" : "Disabled"}</li>
						<li>Per-Component: debug prop override</li>
						<li>Shows diagram source on error</li>
						<li>Detailed console logging</li>
					</ul>
				</div>
			</div>
		{/if}
	</section>
</div>

<style>
	.showcase-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.showcase-header {
		margin-bottom: 3rem;
		text-align: center;
	}

	.showcase-header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
		color: hsl(var(--foreground));
	}

	.subtitle {
		font-size: 1.125rem;
		color: hsl(var(--muted-foreground));
		margin-bottom: 2rem;
	}

	.info-box {
		background: hsl(var(--muted) / 0.5);
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		padding: 1.5rem;
		margin: 2rem auto;
		max-width: 600px;
	}

	.info-box h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.125rem;
		color: hsl(var(--foreground));
	}

	.info-box p {
		margin: 0.5rem 0;
		color: hsl(var(--foreground));
	}

	.text-muted {
		color: hsl(var(--muted-foreground)) !important;
	}

	/* Filter Section */
	.filter-section {
		margin-bottom: 2rem;
	}

	.filter-section h2 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: hsl(var(--foreground));
	}

	.filter-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.filter-button {
		padding: 0.5rem 1rem;
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.875rem;
	}

	.filter-button:hover {
		background: hsl(var(--muted));
		border-color: hsl(var(--primary));
	}

	.filter-button.active {
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border-color: hsl(var(--primary));
		font-weight: 600;
	}

	/* Interactive Controls Section */
	.controls-section {
		background: hsl(var(--card));
		border: 2px solid hsl(var(--border));
		border-radius: var(--radius);
		padding: 1.5rem;
		margin-bottom: 3rem;
	}

	.controls-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.controls-header h2 {
		font-size: 1.5rem;
		margin: 0;
		color: hsl(var(--foreground));
	}

	.mode-badge {
		padding: 0.5rem 1rem;
		border-radius: var(--radius);
		font-size: 0.875rem;
		font-weight: 600;
	}

	.mode-badge.mobile {
		background: hsl(var(--primary) / 0.1);
		color: hsl(var(--primary));
		border: 1px solid hsl(var(--primary) / 0.3);
	}

	.mode-badge.desktop {
		background: hsl(var(--success) / 0.1);
		color: hsl(var(--success));
		border: 1px solid hsl(var(--success) / 0.3);
	}

	.controls-stats {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: hsl(var(--muted) / 0.5);
		border-radius: var(--radius);
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.stat-item {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
	}

	.stat-item strong {
		color: hsl(var(--foreground));
		font-size: 1rem;
	}

	.toggle-defaults {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: hsl(var(--foreground));
		cursor: pointer;
	}

	.toggle-defaults input[type="checkbox"] {
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
	}

	.controls-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.control-group {
		padding: 1rem;
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
	}

	.control-group h3 {
		font-size: 1rem;
		margin: 0 0 1rem 0;
		color: hsl(var(--foreground));
	}

	.control-group label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0;
		font-size: 0.875rem;
		color: hsl(var(--foreground));
		cursor: pointer;
	}

	.control-group input[type="checkbox"] {
		width: 1.125rem;
		height: 1.125rem;
		cursor: pointer;
	}

	.settings-display {
		padding: 1rem;
		background: hsl(var(--muted) / 0.3);
		border-radius: var(--radius);
	}

	.info-text {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
		margin: 0 0 1rem 0;
	}

	.defaults-preview {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.viewport-config {
		padding: 0.75rem;
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		font-size: 0.875rem;
	}

	.viewport-config strong {
		color: hsl(var(--foreground));
		margin-right: 0.5rem;
	}

	.active-list {
		color: hsl(var(--muted-foreground));
	}

	/* Examples Section */
	.examples-section {
		margin-bottom: 3rem;
	}

	.examples-section h2 {
		font-size: 1.75rem;
		margin-bottom: 1.5rem;
		color: hsl(var(--foreground));
	}

	.example-card {
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		padding: 1.5rem;
		margin-bottom: 2rem;
		box-shadow: 0 1px 3px 0 hsl(var(--foreground) / 0.1);
	}

	.example-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	.example-number {
		font-size: 0.875rem;
		font-weight: 600;
		color: hsl(var(--muted-foreground));
		background: hsl(var(--muted));
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius);
	}

	.diagram-badge {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		background: hsl(var(--primary) / 0.1);
		color: hsl(var(--primary));
		padding: 0.25rem 0.75rem;
		border-radius: var(--radius);
		border: 1px solid hsl(var(--primary) / 0.2);
	}

	.diagram-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: hsl(var(--foreground));
		flex: 1;
	}

	.diagram-description {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
		margin-bottom: 1rem;
		line-height: 1.5;
	}

	/* Technical Details */
	.tech-details {
		margin-top: 3rem;
		padding-top: 3rem;
		border-top: 2px solid hsl(var(--border));
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.section-header h2 {
		font-size: 1.75rem;
		color: hsl(var(--foreground));
		margin: 0;
	}

	.toggle-button {
		padding: 0.5rem 1rem;
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.toggle-button:hover {
		background: hsl(var(--muted));
		border-color: hsl(var(--primary));
	}

	.details-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.detail-card {
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		padding: 1.5rem;
	}

	.detail-card h3 {
		font-size: 1.125rem;
		margin: 0 0 1rem 0;
		color: hsl(var(--foreground));
	}

	.detail-card ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.detail-card li {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
		padding: 0.375rem 0;
		border-bottom: 1px solid hsl(var(--border) / 0.5);
	}

	.detail-card li:last-child {
		border-bottom: none;
	}

	/* Mobile optimization */
	@media (max-width: 640px) {
		.showcase-container {
			padding: 1rem;
		}

		.showcase-header h1 {
			font-size: 1.75rem;
		}

		.subtitle {
			font-size: 1rem;
		}

		.example-card {
			padding: 1rem;
		}

		.details-grid {
			grid-template-columns: 1fr;
		}

		.section-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}
	}
</style>
