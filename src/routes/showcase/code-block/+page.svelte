<script lang="ts">
	/**
	 * CodeBlock Showcase (Task 8F)
	 *
	 * Comprehensive demonstration of CodeBlock component with:
	 * - 12 programming languages from SETTINGS.ui.codeBlock.syntax.enabledLanguages
	 * - Syntax highlighting validation for each language
	 * - Copy functionality demonstration
	 * - Dialog expansion demonstration
	 * - Edge cases (errors, empty code, invalid language)
	 * - Mobile responsiveness testing
	 */
	import CodeBlock from "$lib/components/shared/CodeBlock.svelte";
	import { SETTINGS } from "$config/settings";
	import { CODE_EXAMPLES, EDGE_CASES } from "$data/showcase/code-block-examples";

	let showEdgeCases = $state(false);
</script>

<svelte:head>
	<title>CodeBlock Showcase - Task 8F</title>
</svelte:head>

<div class="showcase-container">
	<header class="showcase-header">
		<h1>CodeBlock Component Showcase</h1>
		<p class="subtitle">Task 8F - Syntax Highlighting with Shiki Integration</p>

		<div class="info-box">
			<h3>Bundle Optimization</h3>
			<p>
				Loading <strong>{SETTINGS.ui.codeBlock.syntax.enabledLanguages.length} languages</strong>
				from SETTINGS configuration
			</p>
			<p class="text-muted">
				Bundle size: <strong>~2MB</strong> (vs 6.6MB for all 200+ languages)
			</p>
		</div>
	</header>

	<!-- Main Examples -->
	<section class="examples-section">
		<h2>Language Examples ({CODE_EXAMPLES.length} languages)</h2>

		{#each CODE_EXAMPLES as example, index (example.language + index)}
			<div class="example-card">
				<div class="example-header">
					<span class="example-number">#{index + 1}</span>
					<span class="language-badge">{example.language}</span>
				</div>

				<CodeBlock
					code={example.code}
					language={example.language}
					title={example.title}
					showCopyButton={true}
					showExpandButton={true}
					showLineNumbers={true}
					actionGridOrientation={index % 2 === 0 ? "vertical" : "horizontal"}
				/>
			</div>
		{/each}
	</section>

	<!-- Edge Cases Section -->
	<section class="edge-cases-section">
		<div class="section-header">
			<h2>Edge Cases & Error Handling</h2>
			<button class="toggle-button" onclick={() => (showEdgeCases = !showEdgeCases)}>
				{showEdgeCases ? "Hide" : "Show"} Edge Cases
			</button>
		</div>

		{#if showEdgeCases}
			{#each EDGE_CASES as edge, index (`edge-${index}`)}
				<div class="example-card edge-case">
					<div class="example-header">
						<span class="example-number">Edge #{index + 1}</span>
						<span class="language-badge error">{edge.language}</span>
					</div>

					<CodeBlock
						code={edge.code}
						language={edge.language}
						title={edge.title}
						showCopyButton={true}
						showExpandButton={false}
					/>
				</div>
			{/each}
		{/if}
	</section>

	<!-- Technical Details -->
	<section class="tech-details">
		<h2>Technical Details</h2>

		<div class="details-grid">
			<div class="detail-card">
				<h3>🎨 Themes</h3>
				<ul>
					<li>Light: {SETTINGS.ui.codeBlock.syntax.themes.light}</li>
					<li>Dark: {SETTINGS.ui.codeBlock.syntax.themes.dark}</li>
				</ul>
			</div>

			<div class="detail-card">
				<h3>⚙️ Features</h3>
				<ul>
					<li>✅ Syntax highlighting (Shiki)</li>
					<li>✅ Copy to clipboard (IconGrid)</li>
					<li>✅ Dialog expansion (full-screen)</li>
					<li>✅ Line numbers</li>
					<li>✅ Mobile responsive scroll</li>
				</ul>
			</div>

			<div class="detail-card">
				<h3>📦 Bundle</h3>
				<ul>
					<li>Languages: {SETTINGS.ui.codeBlock.syntax.enabledLanguages.length}</li>
					<li>Size: ~2MB (optimized)</li>
					<li>Reduction: 70% vs full bundle</li>
				</ul>
			</div>

			<div class="detail-card">
				<h3>🧪 Test Coverage</h3>
				<ul>
					<li>Unit tests: CodeBlock.test.ts</li>
					<li>E2E tests: code-block.spec.ts</li>
					<li>Screenshots: 3+ languages</li>
					<li>Mobile testing: ≤390px</li>
				</ul>
			</div>
		</div>
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
		max-width: 600px;
		margin: 0 auto;
	}

	.info-box h3 {
		margin: 0 0 0.75rem 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.info-box p {
		margin: 0.5rem 0;
		font-size: 0.875rem;
	}

	.text-muted {
		color: hsl(var(--muted-foreground));
	}

	.examples-section,
	.edge-cases-section,
	.tech-details {
		margin-bottom: 3rem;
	}

	.examples-section h2,
	.edge-cases-section h2,
	.tech-details h2 {
		font-size: 1.875rem;
		font-weight: 700;
		margin-bottom: 1.5rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.toggle-button {
		padding: 0.5rem 1rem;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border: none;
		border-radius: var(--radius);
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: background 0.2s;
	}

	.toggle-button:hover {
		background: hsl(var(--primary) / 0.9);
	}

	.example-card {
		margin-bottom: 2rem;
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		overflow: hidden;
	}

	.example-card.edge-case {
		border-color: hsl(var(--destructive) / 0.5);
	}

	.example-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: hsl(var(--muted));
		border-bottom: 1px solid hsl(var(--border));
	}

	.example-number {
		font-size: 0.875rem;
		font-weight: 600;
		color: hsl(var(--muted-foreground));
	}

	.language-badge {
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.25rem 0.75rem;
		background: hsl(var(--primary) / 0.1);
		color: hsl(var(--primary));
		border-radius: 9999px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.language-badge.error {
		background: hsl(var(--destructive) / 0.1);
		color: hsl(var(--destructive));
	}

	.details-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.detail-card {
		padding: 1.5rem;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
	}

	.detail-card h3 {
		margin: 0 0 1rem 0;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.detail-card ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.detail-card li {
		padding: 0.25rem 0;
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
	}

	/* Mobile optimization */
	@media (max-width: 640px) {
		.showcase-container {
			padding: 1rem;
		}

		.showcase-header h1 {
			font-size: 1.875rem;
		}

		.section-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.toggle-button {
			width: 100%;
		}

		.details-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
